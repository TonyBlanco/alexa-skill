'use strict';

const {
  clock,
  dayPart,
  isBreakfastWindow,
  isLunchWindow,
  isDinnerWindow,
  isWalkWindow,
  isMorningMedsWindow,
  isEveningMedsWindow,
  speakClock,
} = require('./time');
const { dayState, writeDay, withNames, mergeProfile } = require('./profile');
const { localeBundle, wrapSpeak, medsLabel, mealLabel, companyLine, vitalsParts } = require('./speech');
const { addContact, findContact } = require('./contacts');
const { recordVitals, vitalsAgeHours, unusualHeartRate } = require('./vitals');

const INTENTS = {
  LAUNCH: 'Launch',
  CHECKIN_WELL: 'CheckInWell',
  CHECKIN_UNWELL: 'CheckInUnwell',
  MEDS_ASK: 'MedsAsk',
  MEDS_TAKEN: 'MedsTaken',
  MEDS_NOT_TAKEN: 'MedsNotTaken',
  MEDS_UNSURE: 'MedsUnsure',
  MEAL_ASK: 'MealAsk',
  MEAL_DONE: 'MealDone',
  MEAL_NOT: 'MealNot',
  WALK_ASK: 'WalkAsk',
  WALK_DONE: 'WalkDone',
  WALK_NOT: 'WalkNot',
  CLOCK: 'Clock',
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
  CALL: 'Call',
  ADD_CONTACT: 'AddContact',
  VITALS: 'Vitals',
  RECORD_VITALS: 'RecordVitals',
};

function stillOpen(status) {
  return status !== 'taken' && status !== 'unsure' && status !== 'done' && status !== 'skipped';
}

function dueMedsId(profile, isoDay, hour) {
  const state = dayState(profile, isoDay);
  if (isMorningMedsWindow(hour) && stillOpen(state.meds.manana)) return 'manana';
  if (isEveningMedsWindow(hour) && stillOpen(state.meds.noche)) return 'noche';
  return null;
}

function dueMealId(profile, isoDay, hour) {
  const meals = dayState(profile, isoDay).meals;
  if (isBreakfastWindow(hour) && stillOpen(meals.desayuno)) return 'desayuno';
  if (isLunchWindow(hour) && stillOpen(meals.comida)) return 'comida';
  if (isDinnerWindow(hour) && stillOpen(meals.cena)) return 'cena';
  return null;
}

function nearestMealId(hour) {
  if (hour < 12) return 'desayuno';
  if (hour < 18) return 'comida';
  return 'cena';
}

function walkDue(profile, isoDay, hour) {
  if (!isWalkWindow(hour)) return false;
  return stillOpen(dayState(profile, isoDay).walk);
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
  const mealId = dueMealId(profile, isoDay, hour);
  const medsId = dueMedsId(profile, isoDay, hour);
  const walk = walkDue(profile, isoDay, hour);
  const checkIn = neededCheckIn(isoDay, hour, profile);
  let focus = 'rest';
  if (mealId) {
    focus = 'meal';
  } else if (medsId) {
    focus = 'meds';
  } else if (walk) {
    focus = 'walk';
  } else if (checkIn) {
    focus = 'checkin';
  }
  return {
    isoDay,
    hour,
    timeZone,
    mealId,
    medsId,
    walkDue: walk,
    checkIn,
    focus,
    part: dayPart(hour),
  };
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
  if (snapshot.focus === 'meal') {
    return {
      text: copy.launchNeedMeal(name, mealLabel(copy, snapshot.mealId)),
      pending: 'meal',
    };
  }
  if (snapshot.focus === 'meds') {
    return {
      text: copy.launchNeedMeds(name, medsLabel(copy, snapshot.medsId)),
      pending: 'meds',
    };
  }
  if (snapshot.focus === 'walk') {
    return { text: copy.launchNeedWalk(name), pending: 'walk' };
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

function recordMeal(profile, isoDay, mealId, status) {
  const state = { ...dayState(profile, isoDay) };
  state.meals = { ...state.meals, [mealId]: status };
  return writeDay(profile, isoDay, state);
}

function recordWalk(profile, isoDay, status) {
  const state = { ...dayState(profile, isoDay) };
  state.walk = status;
  return writeDay(profile, isoDay, state);
}

function handleYesNo(intent, pending) {
  if (pending === 'checkin') {
    return intent === INTENTS.YES ? INTENTS.CHECKIN_WELL : INTENTS.CHECKIN_UNWELL;
  }
  if (pending === 'meds') {
    return intent === INTENTS.YES ? INTENTS.MEDS_TAKEN : INTENTS.MEDS_NOT_TAKEN;
  }
  if (pending === 'meal') {
    return intent === INTENTS.YES ? INTENTS.MEAL_DONE : INTENTS.MEAL_NOT;
  }
  if (pending === 'walk') {
    return intent === INTENTS.YES ? INTENTS.WALK_DONE : INTENTS.WALK_NOT;
  }
  if (pending === 'emergency') {
    return intent === INTENTS.YES ? INTENTS.EMERGENCY : INTENTS.STOP;
  }
  return intent;
}

function fallbackForPending(copy, pending, snapshot) {
  if (pending === 'meds') return copy.medsAsk(medsLabel(copy, snapshot.medsId || 'manana'));
  if (pending === 'meal') return copy.mealAsk(mealLabel(copy, snapshot.mealId || nearestMealId(snapshot.hour)));
  if (pending === 'walk') return copy.walkAsk;
  return copy.fallback;
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
    const text = fallbackForPending(copy, pending, snapshot);
    return { profile, lastSpeech: text, ...say(copy, text, pending) };
  }

  if (resolved === INTENTS.CONFIGURE) {
    const personSlot = slots.personName;
    const caregiverSlot = slots.caregiverName;
    if (pending === 'setup-caregiver') {
      const name = caregiverSlot || personSlot;
      if (!name) {
        return { profile, lastSpeech: copy.setupNeedName, ...say(copy, copy.setupNeedName, 'setup-caregiver') };
      }
      profile = withNames(profile, { caregiverName: name });
      const text = copy.setupDone(profile.personName, profile.caregiverName);
      return { profile, lastSpeech: text, ...say(copy, text, null) };
    }
    if (pending === 'setup-person') {
      const name = personSlot || caregiverSlot;
      if (!name) {
        return { profile, lastSpeech: copy.setupNeedName, ...say(copy, copy.setupNeedName, 'setup-person') };
      }
      profile = withNames(profile, { personName: name });
      const text = copy.setupAskCaregiver(profile.personName);
      return { profile, lastSpeech: text, ...say(copy, text, 'setup-caregiver') };
    }
    if (personSlot && caregiverSlot) {
      profile = withNames(profile, slots);
      const text = copy.setupDone(profile.personName, profile.caregiverName);
      return { profile, lastSpeech: text, ...say(copy, text, null) };
    }
    if (caregiverSlot && profile.personName) {
      profile = withNames(profile, { caregiverName: caregiverSlot });
      const text = copy.setupDone(profile.personName, profile.caregiverName);
      return { profile, lastSpeech: text, ...say(copy, text, null) };
    }
    if (personSlot) {
      profile = withNames(profile, { personName: personSlot });
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
    if (pending === 'add-contact') {
      profile = addContact(profile, name);
      const text = copy.contactAdded(name);
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

  if (resolved === INTENTS.CLOCK) {
    const spoken = speakClock(snapshot.hour, clock(now, snapshot.timeZone).minute, locale);
    const hint =
      snapshot.focus === 'meal'
        ? copy.clockHintMeal(mealLabel(copy, snapshot.mealId))
        : snapshot.focus === 'meds'
          ? copy.clockHintMeds(medsLabel(copy, snapshot.medsId))
          : snapshot.focus === 'walk'
            ? copy.clockHintWalk
            : copy.clockHintRest;
    const text = copy.clockNow(spoken, hint);
    const nextPending = snapshot.focus === 'rest' || snapshot.focus === 'checkin' ? snapshot.focus === 'checkin' ? 'checkin' : null : snapshot.focus;
    return { profile, lastSpeech: text, ...say(copy, text, nextPending) };
  }

  if (resolved === INTENTS.CHECKIN_WELL || resolved === INTENTS.CHECKIN_UNWELL) {
    const which = snapshot.checkIn || (snapshot.part === 'evening' || snapshot.part === 'night' ? 'evening' : 'morning');
    const status = resolved === INTENTS.CHECKIN_WELL ? 'well' : 'unwell';
    profile = recordCheckIn(profile, snapshot.isoDay, which, status);
    const text = status === 'well' ? copy.checkInWell(profile.personName) : copy.checkInUnwell;
    return { profile, lastSpeech: text, ...say(copy, text, null) };
  }

  if (
    resolved === INTENTS.MEAL_ASK ||
    resolved === INTENTS.MEAL_DONE ||
    resolved === INTENTS.MEAL_NOT
  ) {
    const mealId = snapshot.mealId || nearestMealId(snapshot.hour);
    const label = mealLabel(copy, mealId);
    if (resolved === INTENTS.MEAL_ASK) {
      const text = copy.mealAsk(label);
      return { profile, lastSpeech: text, ...say(copy, text, 'meal') };
    }
    const status = resolved === INTENTS.MEAL_DONE ? 'done' : 'skipped';
    profile = recordMeal(profile, snapshot.isoDay, mealId, status);
    const text = status === 'done' ? copy.mealDone(label) : copy.mealNot(label);
    return { profile, lastSpeech: text, ...say(copy, text, null) };
  }

  if (resolved === INTENTS.WALK_ASK || resolved === INTENTS.WALK_DONE || resolved === INTENTS.WALK_NOT) {
    if (resolved === INTENTS.WALK_ASK) {
      return { profile, lastSpeech: copy.walkAsk, ...say(copy, copy.walkAsk, 'walk') };
    }
    const status = resolved === INTENTS.WALK_DONE ? 'done' : 'skipped';
    profile = recordWalk(profile, snapshot.isoDay, status);
    const text = status === 'done' ? copy.walkDone : copy.walkNot;
    return { profile, lastSpeech: text, ...say(copy, text, null) };
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
    const nextPending = dueMealId(profile, snapshot.isoDay, snapshot.hour)
      ? 'meal'
      : dueMedsId(profile, snapshot.isoDay, snapshot.hour)
        ? 'meds'
        : null;
    return { profile, lastSpeech: text, ...say(copy, text, nextPending) };
  }

  if (resolved === INTENTS.WHATS_NEXT) {
    if (snapshot.focus === 'meal') {
      const text = copy.whatsNextMeal(mealLabel(copy, snapshot.mealId));
      return { profile, lastSpeech: text, ...say(copy, text, 'meal') };
    }
    if (snapshot.focus === 'meds') {
      const text = copy.whatsNextMeds(medsLabel(copy, snapshot.medsId));
      return { profile, lastSpeech: text, ...say(copy, text, 'meds') };
    }
    if (snapshot.focus === 'walk') {
      return { profile, lastSpeech: copy.whatsNextWalk, ...say(copy, copy.whatsNextWalk, 'walk') };
    }
    if (snapshot.focus === 'checkin') {
      return { profile, lastSpeech: copy.whatsNextCheckin, ...say(copy, copy.whatsNextCheckin, 'checkin') };
    }
    return { profile, lastSpeech: copy.whatsNextRest, ...say(copy, copy.whatsNextRest, null) };
  }

  if (resolved === INTENTS.ADD_CONTACT) {
    const name = slots.contactName || slots.personName || slots.name;
    if (!name) {
      return { profile, lastSpeech: copy.contactNeedName, ...say(copy, copy.contactNeedName, 'add-contact') };
    }
    profile = addContact(profile, name, slots.relation || 'familia');
    const text = copy.contactAdded(name);
    return { profile, lastSpeech: text, ...say(copy, text, null) };
  }

  if (resolved === INTENTS.CALL) {
    const spoken = slots.contactName || slots.personName || slots.name;
    const contact = findContact(profile, spoken);
    if (!contact) {
      const text = copy.callUnknown(spoken);
      return { profile, lastSpeech: text, ...say(copy, text, null) };
    }
    const text = copy.callKnown(contact.name);
    return { profile, lastSpeech: text, ...say(copy, text, null) };
  }

  if (resolved === INTENTS.RECORD_VITALS) {
    const heartRate = slots.heartRate;
    if (heartRate == null || heartRate === '') {
      return { profile, lastSpeech: copy.vitalsNeedNumber, ...say(copy, copy.vitalsNeedNumber, null) };
    }
    profile = recordVitals(
      profile,
      { heartRate, spo2: slots.spo2, systolic: slots.systolic, diastolic: slots.diastolic, source: 'voice' },
      now,
    );
    let text = copy.vitalsRecorded(vitalsParts(profile.vitals, locale));
    if (unusualHeartRate(profile.vitals.heartRate)) {
      text += copy.vitalsUnusual;
    }
    return { profile, lastSpeech: text, ...say(copy, text, null) };
  }

  if (resolved === INTENTS.VITALS) {
    if (!profile.vitals || !vitalsParts(profile.vitals, locale)) {
      return { profile, lastSpeech: copy.vitalsNone, ...say(copy, copy.vitalsNone, null) };
    }
    const age = vitalsAgeHours(profile.vitals, now);
    const stale = age != null && age > 12;
    const text = copy.vitalsRead(vitalsParts(profile.vitals, locale), stale);
    return { profile, lastSpeech: text, ...say(copy, text, null) };
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
  dueMealId,
  walkDue,
  neededCheckIn,
  nextFocus,
  handleTurn,
  permissionResult,
  recordCheckIn,
  recordMeds,
  recordMeal,
  recordWalk,
};
