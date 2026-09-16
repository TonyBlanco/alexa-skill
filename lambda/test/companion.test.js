'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { clock, dayPart } = require('../src/time');
const { defaultProfile, withNames } = require('../src/profile');
const { handleTurn, INTENTS, nextFocus, permissionResult } = require('../src/companion');

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
  it('asks the caregiver to configure on first launch', () => {
    const turn = handleTurn({ intent: INTENTS.LAUNCH, now: morning() });
    assert.match(turn.card, /configura/i);
    assert.equal(turn.endSession, false);
  });

  it('asks how the person is in the morning after setup', () => {
    const profile = withNames(defaultProfile(), { personName: 'Ana', caregiverName: 'Luis' });
    const turn = handleTurn({ intent: INTENTS.LAUNCH, profile, now: morning() });
    assert.match(turn.card, /Ana/);
    assert.match(turn.card, /estoy bien/i);
    assert.equal(turn.pending, 'checkin');
  });

  it('records a well check-in and does not end the session', () => {
    const profile = withNames(defaultProfile(), { personName: 'Ana' });
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
    const profile = withNames(defaultProfile(), { personName: 'Ana' });
    const turn = handleTurn({
      intent: INTENTS.YES,
      profile,
      pending: 'checkin',
      now: morning(),
    });
    assert.equal(turn.profile.days['2026-09-16'].checkIns.morning, 'well');
  });

  it('does not mark pills as taken when the person is unsure', () => {
    const profile = withNames(defaultProfile(), { personName: 'Ana' });
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
    const profile = withNames(defaultProfile(), { personName: 'Ana', caregiverName: 'Luis' });
    const turn = handleTurn({ intent: INTENTS.EMERGENCY, profile, now: afternoon() });
    assert.match(turn.card, /Luis/);
    assert.match(turn.card, /uno uno dos|112/i);
    assert.match(turn.card, /No puedo llamar yo/i);
    assert.match(turn.card, /Alexa, llama/i);
  });

  it('help lists the four phrases and is not the emergency script', () => {
    const turn = handleTurn({ intent: INTENTS.HELP, now: afternoon() });
    assert.match(turn.card, /estoy bien/i);
    assert.doesNotMatch(turn.card, /uno uno dos/i);
  });

  it('company copy is original and short', () => {
    const profile = withNames(defaultProfile(), { personName: 'Ana' });
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

  it('after a morning check-in, afternoon launch does not interrogate again', () => {
    let profile = withNames(defaultProfile(), { personName: 'Ana' });
    const checked = handleTurn({
      intent: INTENTS.CHECKIN_WELL,
      profile,
      now: morning(),
    });
    profile = checked.profile;
    const launch = handleTurn({ intent: INTENTS.LAUNCH, profile, now: afternoon() });
    assert.match(launch.card, /ya me dijiste que estás bien/i);
  });

  it('evening focuses on remaining pills', () => {
    const profile = withNames(defaultProfile(), { personName: 'Ana' });
    const snapshot = nextFocus(profile, evening());
    assert.equal(snapshot.medsId, 'noche');
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
});
