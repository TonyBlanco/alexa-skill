'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { clock, dayPart, speakClock } = require('../src/time');
const { defaultProfile, withNames } = require('../src/profile');
const { handleTurn, INTENTS, nextFocus, permissionResult } = require('../src/companion');
const { scheduledTimeForHour, dailyReminderSpecs } = require('../src/reminders');

function earlyMorning() {
  return new Date('2026-09-16T06:45:00+02:00');
}

function morning() {
  return new Date('2026-09-16T08:30:00+02:00');
}

function midMorningMeds() {
  return new Date('2026-09-16T09:15:00+02:00');
}

function afternoon() {
  return new Date('2026-09-16T15:00:00+02:00');
}

function evening() {
  return new Date('2026-09-16T21:10:00+02:00');
}

describe('clock', () => {
  it('uses Europe/Madrid calendar day', () => {
    const parts = clock(new Date('2026-09-16T00:30:00+02:00'), 'Europe/Madrid');
    assert.equal(parts.isoDay, '2026-09-16');
    assert.equal(parts.hour, 0);
  });

  it('maps hours to day parts', () => {
    assert.equal(dayPart(8), 'morning');
    assert.equal(dayPart(15), 'afternoon');
    assert.equal(dayPart(19), 'evening');
    assert.equal(dayPart(23), 'night');
  });
});

describe('handleTurn', () => {
  it('greets Luis on first launch without a caregiver setup', () => {
    const turn = handleTurn({ intent: INTENTS.LAUNCH, now: earlyMorning() });
    assert.match(turn.card, /Luis/);
    assert.equal(turn.profile.personName, 'Luis');
    assert.equal(turn.endSession, false);
  });

  it('asks about breakfast in the morning meal window', () => {
    const turn = handleTurn({ intent: INTENTS.LAUNCH, now: morning() });
    assert.match(turn.card, /Luis/);
    assert.match(turn.card, /desayuno|comí/i);
    assert.equal(turn.pending, 'meal');
  });

  it('asks how Luis is before breakfast time', () => {
    const turn = handleTurn({ intent: INTENTS.LAUNCH, now: earlyMorning() });
    assert.match(turn.card, /estoy bien/i);
    assert.equal(turn.pending, 'checkin');
  });

  it('records a well check-in and does not end the session', () => {
    const profile = withNames(defaultProfile(), { personName: 'Luis' });
    const turn = handleTurn({
      intent: INTENTS.CHECKIN_WELL,
      profile,
      pending: 'checkin',
      now: morning(),
    });
    assert.equal(turn.profile.days['2026-09-16'].checkIns.morning, 'well');
    assert.match(turn.card, /háblame|pastillas/i);
  });

  it('maps yes to a well check-in when that question is pending', () => {
    const profile = withNames(defaultProfile(), { personName: 'Luis' });
    const turn = handleTurn({
      intent: INTENTS.YES,
      profile,
      pending: 'checkin',
      now: morning(),
    });
    assert.equal(turn.profile.days['2026-09-16'].checkIns.morning, 'well');
  });

  it('does not mark pills as taken when the person is unsure', () => {
    const profile = withNames(defaultProfile(), { personName: 'Luis' });
    const turn = handleTurn({
      intent: INTENTS.MEDS_UNSURE,
      profile,
      pending: 'meds',
      now: midMorningMeds(),
    });
    assert.equal(turn.profile.days['2026-09-16'].meds.manana, 'unsure');
    assert.match(turn.card, /pastillero/i);
    assert.doesNotMatch(turn.card, /tómatelas|take them now/i);
  });

  it('never claims to call emergency services', () => {
    const profile = withNames(defaultProfile(), { personName: 'Luis', caregiverName: 'Miguel' });
    const turn = handleTurn({ intent: INTENTS.EMERGENCY, profile, now: afternoon() });
    assert.match(turn.card, /Miguel/);
    assert.match(turn.card, /uno uno dos|112/i);
    assert.match(turn.card, /No puedo llamar yo/i);
    assert.match(turn.card, /Alexa, llama/i);
  });

  it('help lists comida, pastillas, caminar and the time, and is not the emergency script', () => {
    const turn = handleTurn({ intent: INTENTS.HELP, now: afternoon() });
    assert.match(turn.card, /comida/i);
    assert.match(turn.card, /pastillas/i);
    assert.match(turn.card, /caminar/i);
    assert.match(turn.card, /hora/i);
    assert.doesNotMatch(turn.card, /uno uno dos/i);
  });

  it('company copy is original and short', () => {
    const profile = withNames(defaultProfile(), { personName: 'Luis' });
    const turn = handleTurn({ intent: INTENTS.COMPANY, profile, now: afternoon() });
    assert.ok(turn.card.length < 400);
    assert.match(turn.card, /háblame/i);
  });

  it('configure stores names from slots', () => {
    const turn = handleTurn({
      intent: INTENTS.CONFIGURE,
      slots: { personName: 'Ana', caregiverName: 'Luis' },
      now: afternoon(),
    });
    assert.equal(turn.profile.personName, 'Ana');
    assert.equal(turn.profile.caregiverName, 'Luis');
    assert.equal(turn.profile.setupComplete, true);
  });

  it('repeats the last speech', () => {
    const turn = handleTurn({
      intent: INTENTS.REPEAT,
      lastSpeech: 'Di: estoy bien.',
      now: morning(),
    });
    assert.equal(turn.card, 'Di: estoy bien.');
  });

  it('after meals, pills and a walk, late afternoon does not interrogate again', () => {
    let profile = withNames(defaultProfile(), { personName: 'Luis' });
    profile = handleTurn({
      intent: INTENTS.CHECKIN_WELL,
      profile,
      now: earlyMorning(),
    }).profile;
    profile = handleTurn({
      intent: INTENTS.MEAL_DONE,
      profile,
      now: morning(),
    }).profile;
    profile = handleTurn({
      intent: INTENTS.MEDS_TAKEN,
      profile,
      now: midMorningMeds(),
    }).profile;
    profile = handleTurn({
      intent: INTENTS.WALK_DONE,
      profile,
      now: midMorningMeds(),
    }).profile;
    profile = handleTurn({
      intent: INTENTS.MEAL_DONE,
      profile,
      now: afternoon(),
    }).profile;
    const launch = handleTurn({
      intent: INTENTS.LAUNCH,
      profile,
      now: new Date('2026-09-16T16:45:00+02:00'),
    });
    assert.match(launch.card, /ya me dijiste que estás bien|háblame/i);
    assert.equal(launch.pending, null);
  });

  it('does not mark pills taken if the person says yes after a check-in', () => {
    const profile = withNames(defaultProfile(), { personName: 'Luis' });
    const checked = handleTurn({
      intent: INTENTS.CHECKIN_WELL,
      profile,
      now: midMorningMeds(),
    });
    assert.equal(checked.pending, null);
    const yes = handleTurn({
      intent: INTENTS.YES,
      profile: checked.profile,
      pending: checked.pending,
      now: midMorningMeds(),
    });
    assert.notEqual(yes.profile.days['2026-09-16']?.meds?.manana, 'taken');
  });

  it('keeps yo me llamo as caregiver during setup', () => {
    let profile = defaultProfile();
    const asked = handleTurn({ intent: INTENTS.CONFIGURE, profile, now: afternoon() });
    profile = handleTurn({
      intent: INTENTS.NAME,
      profile: asked.profile,
      pending: asked.pending,
      slots: { personName: 'Ana' },
      now: afternoon(),
    }).profile;
    const done = handleTurn({
      intent: INTENTS.CONFIGURE,
      profile,
      pending: 'setup-caregiver',
      slots: { caregiverName: 'Luis' },
      now: afternoon(),
    });
    assert.equal(done.profile.personName, 'Ana');
    assert.equal(done.profile.caregiverName, 'Luis');
  });

  it('evening focuses on dinner before night pills', () => {
    const profile = withNames(defaultProfile(), { personName: 'Luis' });
    const snapshot = nextFocus(profile, evening());
    assert.equal(snapshot.mealId, 'cena');
    assert.equal(snapshot.focus, 'meal');
    const turn = handleTurn({ intent: INTENTS.LAUNCH, profile, now: evening() });
    assert.match(turn.card, /cena|comí/i);
    assert.equal(turn.pending, 'meal');
  });

  it('after dinner, evening launch asks about night pills', () => {
    let profile = withNames(defaultProfile(), { personName: 'Luis' });
    profile = handleTurn({
      intent: INTENTS.MEAL_DONE,
      profile,
      now: evening(),
    }).profile;
    const turn = handleTurn({ intent: INTENTS.LAUNCH, profile, now: evening() });
    assert.match(turn.card, /noche/i);
    assert.equal(turn.pending, 'meds');
  });

  it('accepted reminder permission asks to create reminders', () => {
    const result = permissionResult('ACCEPTED');
    assert.equal(result.createReminders, true);
    assert.equal(result.remindersGranted, true);
  });

  it('wraps speech in slow SSML', () => {
    const turn = handleTurn({ intent: INTENTS.HELP, now: morning() });
    assert.match(turn.speak, /^<speak><prosody rate="92%">/);
    assert.match(turn.speak, /<\/prosody><\/speak>$/);
  });

  it('schedules reminder times in the future', () => {
    const stamp = scheduledTimeForHour(9, new Date('2026-09-16T10:00:00+02:00'), 'Europe/Madrid');
    assert.equal(stamp, '2026-09-17T09:00:00');
    const sameMorning = scheduledTimeForHour(9, new Date('2026-09-16T08:00:00+02:00'), 'Europe/Madrid');
    assert.equal(sameMorning, '2026-09-16T09:00:00');
  });

  it('records a meal when Luis says ya comí', () => {
    const turn = handleTurn({ intent: INTENTS.MEAL_DONE, now: morning() });
    assert.equal(turn.profile.days['2026-09-16'].meals.desayuno, 'done');
    assert.match(turn.card, /desayuno/i);
  });

  it('records a gentle walk without rushing him', () => {
    const turn = handleTurn({ intent: INTENTS.WALK_DONE, now: midMorningMeds() });
    assert.equal(turn.profile.days['2026-09-16'].walk, 'done');
    assert.match(turn.card, /movimiento|paseo|háblame/i);
    assert.doesNotMatch(turn.card, /corre|running/i);
  });

  it('tells the time in Spanish', () => {
    assert.equal(speakClock(9, 0, 'es-ES'), 'Son las nueve en punto de la mañana');
    const turn = handleTurn({ intent: INTENTS.CLOCK, now: morning() });
    assert.match(turn.card, /ocho/i);
    assert.match(turn.card, /desayuno|comida|pastillas|paseo|háblame/i);
  });

  it('native reminders name meals, pills and walk, not only reopen the skill', () => {
    const specs = dailyReminderSpecs({ locale: 'es-ES', personName: 'Luis' });
    const joined = specs.map((item) => item.text).join(' ');
    assert.match(joined, /desayuno/i);
    assert.match(joined, /pastillas/i);
    assert.match(joined, /paseo|moverte/i);
    assert.match(joined, /comida/i);
    assert.doesNotMatch(joined, /abre compañero diario/i);
  });
});
