'use strict';

const { clock, dayPart, isMorningMedsWindow, isEveningMedsWindow } = require('./time');
const { dayState, writeDay, withNames, mergeProfile } = require('./profile');
const { localeBundle, wrapSpeak, medsLabel, companyLine } = require('./speech');

const INTENTS = {
  LAUNCH: 'Launch',
  CHECKIN_WELL: 'CheckInWell',
  CHECKIN_UNWELL: 'CheckInUnwell',
  MEDS_ASK: 'MedsAsk',
  MEDS_TAKEN: 'MedsTaken',
  MEDS_NOT_TAKEN: 'MedsNotTaken',
  MEDS_UNSURE: 'MedsUnsure',
  COMPANY: 'Company',
  EMERGENCY: 'Emergency',
  MORNING: 'Morning',
  NIGHT: 'Night',
  WHATS_NEXT: 'WhatsNext',
  CONFIGURE: 'Configure',
  NAME: 'Name',
  REMINDERS: 'Reminders',
  HELP: 'Help',
  STOP: 'Stop',
  REPEAT: 'Repeat',
  YES: 'Yes',
  NO: 'No',
  FALLBACK: 'Fallback',
};

function dueMedsId(profile, isoDay, hour) {
  const state = dayState(profile, isoDay);
  const morningDone = Boolean(state.meds.manana);
  const eveningDone = Boolean(state.meds.noche);
  if (isMorningMedsWindow(hour) && !morningDone) return 'manana';
  if (isEveningMedsWindow(hour) && !eveningDone) return 'noche';
  return null;
}

function neededCheckIn(isoDay, hour, profile) {
  const part = dayPart(hour);
  const state = dayState(profile, isoDay);
  if ((part === 'morning' || part === 'afternoon') && !state.checkIns.morning) {
    return 'morning';
  }
  if ((part === 'evening' || part === 'night') && !state.checkIns.evening) {
    return 'evening';
  }
  return null;
}

function nextFocus(profile, now = new Date()) {
  const { isoDay, hour, timeZone } = clock(now, profile.timeZone);
  const medsId = dueMedsId(profile, isoDay, hour);
  const checkIn = neededCheckIn(isoDay, hour, profile);
  let focus = 'rest';
  if (checkIn && (hour < 12 || hour >= 18)) focus = 'checkin';
  else if (medsId) focus = 'meds';
  else if (checkIn) focus = 'checkin';
  return { isoDay, hour, timeZone, medsId, checkIn, focus, part: dayPart(hour) };
}

function say(copy, text, pending, extra = {}) {
  return {
    speak: wrapSpeak(text),
    reprompt: wrapSpeak(copy.helpShort),
    card: text,
    pending,
    endSession: false,
    ...extra,
  };
}

function end(copy, text, extra = {}) {
  return {
    speak: wrapSpeak(text),
    reprompt: null,
    card: text,
    pending: null,
    endSession: true,
    ...extra,
  };
}

function launchSpeech(copy, profile, snapshot) {
  const name = profile.personName;
  if (!profile.setupComplete && !profile.personName) {
    return { text: copy.launchNew, pending: null };
  }
  if (snapshot.focus === 'meds') {
    return {
      text: copy.launchNeedMeds(name, medsLabel(copy, snapshot.medsId)),
      pending: 'meds',
    };
  }
  if (snapshot.focus === 'checkin' && snapshot.checkIn === 'morning') {
    return { text: copy.launchMorning(name), pending: 'checkin' };
  }
  if (snapshot.focus === 'checkin') {
    return { text: copy.launchEvening(name), pending: 'checkin' };
  }
  if (snapshot.part === 'night') {
    return { text: copy.launchNight(name), pending: null };
  }
  return { text: copy.launchAfternoonOk(name), pending: null };
}

function recordCheckIn(profile, isoDay, which, status) {
  const state = { ...dayState(profile, isoDay) };
  state.checkIns = { ...state.checkIns, [which]: status };
  return writeDay(profile, isoDay, state);
}

function recordMeds(profile, isoDay, medsId, status) {
  const state = { ...dayState(profile, isoDay) };
  state.meds = { ...state.meds, [medsId]: status };
  return writeDay(profile, isoDay, state);
}

function handleYesNo(intent, pending) {
  if (pending === 'checkin') {
    return intent === INTENTS.YES ? INTENTS.CHECKIN_WELL : INTENTS.CHECKIN_UNWELL;
  }
  if (pending === 'meds') {
    return intent === INTENTS.YES ? INTENTS.MEDS_TAKEN : INTENTS.MEDS_NOT_TAKEN;
  }
  if (pending === 'emergency') {
    return intent === INTENTS.YES ? INTENTS.EMERGENCY : INTENTS.STOP;
  }
  return intent;
}

/**
 * Pure turn handler: no Alexa SDK.
 * @returns {{ profile: object, pending: string|null, speak: string, reprompt: string|null, card: string, endSession: boolean, askReminders?: boolean, createReminders?: boolean }}
 */
function handleTurn({
  intent,
  profile: rawProfile,
  pending = null,
  lastSpeech = null,
  slots = {},
  now = new Date(),
  locale = 'es-ES',
}) {
  const copy = localeBundle(locale);
  let profile = mergeProfile(rawProfile);
  const snapshot = nextFocus(profile, now);
  let resolved = intent;

  if (intent === INTENTS.YES || intent === INTENTS.NO) {
    resolved = handleYesNo(intent, pending);
    if (resolved === intent) {
      const text = intent === INTENTS.YES ? copy.yesUnclear : copy.noUnclear;
      return { profile, lastSpeech: text, ...say(copy, text, pending) };
    }
  }

  if (resolved === INTENTS.REPEAT) {
    const text = lastSpeech || copy.helpShort;
    return { profile, lastSpeech: text, ...say(copy, text, pending) };
  }

  if (resolved === INTENTS.STOP) {
    return { profile, lastSpeech: copy.goodbye, ...end(copy, copy.stop) };
  }

  if (resolved === INTENTS.HELP) {
    return { profile, lastSpeech: copy.help, ...say(copy, copy.help, pending) };
  }

  if (resolved === INTENTS.FALLBACK) {
    const text = pending === 'meds' ? copy.medsAsk(medsLabel(copy, snapshot.medsId || 'manana')) : copy.fallback;
    return { profile, lastSpeech: text, ...say(copy, text, pending) };
  }

  if (resolved === INTENTS.CONFIGURE) {
    if (slots.personName && slots.caregiverName) {
      profile = withNames(profile, slots);
      const text = copy.setupDone(profile.personName, profile.caregiverName);
      return { profile, lastSpeech: text, ...say(copy, text, null) };
    }
    if (slots.personName) {
      profile = withNames(profile, { personName: slots.personName });
      const text = copy.setupAskCaregiver(profile.personName);
      return { profile, lastSpeech: text, ...say(copy, text, 'setup-caregiver') };
    }
    const text = copy.setupAskPerson;
    return { profile, lastSpeech: text, ...say(copy, text, 'setup-person') };
  }

  if (resolved === INTENTS.NAME) {
    const name = slots.personName || slots.caregiverName || slots.name;
    if (!name) {
      return { profile, lastSpeech: copy.setupNeedName, ...say(copy, copy.setupNeedName, pending || 'setup-person') };
    }
    if (pending === 'setup-caregiver') {
      profile = withNames(profile, { caregiverName: name });
      const text = copy.setupDone(profile.personName, profile.caregiverName);
      return { profile, lastSpeech: text, ...say(copy, text, null) };
    }
    profile = withNames(profile, { personName: name });
    const text = copy.setupAskCaregiver(profile.personName);
    return { profile, lastSpeech: text, ...say(copy, text, 'setup-caregiver') };
  }

  if (resolved === INTENTS.REMINDERS) {
    return {
      profile,
      lastSpeech: copy.remindersAsk,
      ...say(copy, copy.remindersAsk, 'reminders'),
      askReminders: true,
    };
  }

  if (resolved === INTENTS.EMERGENCY) {
    const text = pending === 'emergency' ? copy.emergencyRepeat(profile.caregiverName) : copy.emergency(profile.caregiverName);
    return { profile, lastSpeech: text, ...say(copy, text, 'emergency') };
  }

  if (resolved === INTENTS.COMPANY) {
    const text = `${companyLine(copy, snapshot.isoDay, snapshot.hour)} ${copy.companyFollowup}`;
    return { profile, lastSpeech: text, ...say(copy, text, null) };
  }

  if (resolved === INTENTS.CHECKIN_WELL || resolved === INTENTS.CHECKIN_UNWELL) {
    const which = snapshot.checkIn || (snapshot.part === 'evening' || snapshot.part === 'night' ? 'evening' : 'morning');
    const status = resolved === INTENTS.CHECKIN_WELL ? 'well' : 'unwell';
    profile = recordCheckIn(profile, snapshot.isoDay, which, status);
    const text = status === 'well' ? copy.checkInWell(profile.personName) : copy.checkInUnwell;
    const nextPending = dueMedsId(profile, snapshot.isoDay, snapshot.hour) ? 'meds' : null;
    return { profile, lastSpeech: text, ...say(copy, text, nextPending) };
  }

  if (
    resolved === INTENTS.MEDS_ASK ||
    resolved === INTENTS.MEDS_TAKEN ||
    resolved === INTENTS.MEDS_NOT_TAKEN ||
    resolved === INTENTS.MEDS_UNSURE
  ) {
    const medsId = snapshot.medsId || (isEveningMedsWindow(snapshot.hour) ? 'noche' : 'manana');
    const label = medsLabel(copy, medsId);
    if (resolved === INTENTS.MEDS_ASK) {
      const text = copy.medsAsk(label);
      return { profile, lastSpeech: text, ...say(copy, text, 'meds') };
    }
    const status =
      resolved === INTENTS.MEDS_TAKEN ? 'taken' : resolved === INTENTS.MEDS_UNSURE ? 'unsure' : 'skipped';
    profile = recordMeds(profile, snapshot.isoDay, medsId, status);
    const text =
      status === 'taken' ? copy.medsTaken(label) : status === 'unsure' ? copy.medsUnsure(label) : copy.medsNotTaken(label);
    return { profile, lastSpeech: text, ...say(copy, text, null) };
  }

  if (resolved === INTENTS.MORNING) {
    const text = copy.morning(profile.personName);
    return { profile, lastSpeech: text, ...say(copy, text, 'checkin') };
  }

  if (resolved === INTENTS.NIGHT) {
    const text = copy.night(profile.personName);
    const nextPending = dueMedsId(profile, snapshot.isoDay, snapshot.hour) ? 'meds' : null;
    return { profile, lastSpeech: text, ...say(copy, text, nextPending) };
  }

  if (resolved === INTENTS.WHATS_NEXT) {
    if (snapshot.focus === 'checkin') {
      return { profile, lastSpeech: copy.whatsNextCheckin, ...say(copy, copy.whatsNextCheckin, 'checkin') };
    }
    if (snapshot.focus === 'meds') {
      const text = copy.whatsNextMeds(medsLabel(copy, snapshot.medsId));
      return { profile, lastSpeech: text, ...say(copy, text, 'meds') };
    }
    return { profile, lastSpeech: copy.whatsNextRest, ...say(copy, copy.whatsNextRest, null) };
  }

  if (resolved === INTENTS.LAUNCH) {
    const launched = launchSpeech(copy, profile, snapshot);
    return { profile, lastSpeech: launched.text, ...say(copy, launched.text, launched.pending) };
  }

  return { profile, lastSpeech: copy.fallback, ...say(copy, copy.fallback, pending) };
}

function permissionResult(status, locale = 'es-ES') {
  const copy = localeBundle(locale);
  if (status === 'ACCEPTED') {
    return {
      speak: wrapSpeak(copy.remindersOk),
      card: copy.remindersOk,
      createReminders: true,
      remindersGranted: true,
    };
  }
  return {
    speak: wrapSpeak(copy.remindersDenied),
    card: copy.remindersDenied,
    createReminders: false,
    remindersGranted: false,
  };
}

module.exports = {
  INTENTS,
  dueMedsId,
  neededCheckIn,
  nextFocus,
  handleTurn,
  permissionResult,
  recordCheckIn,
  recordMeds,
};
