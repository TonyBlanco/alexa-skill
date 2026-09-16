'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { defaultProfile, withNames } = require('../src/profile');
const { handleTurn, INTENTS } = require('../src/companion');
const { ingestWatchPayload, unusualHeartRate } = require('../src/vitals');
const { findContact } = require('../src/contacts');

const now = new Date('2026-09-16T15:00:00+02:00');

describe('contacts and calling', () => {
  it('coaches native Alexa calling for Miguel without claiming the skill places the call', () => {
    let profile = withNames(defaultProfile(), { personName: 'Luis', caregiverName: 'Miguel' });
    profile = handleTurn({
      intent: INTENTS.ADD_CONTACT,
      profile,
      slots: { contactName: 'Miguel' },
      now,
    }).profile;
    const turn = handleTurn({
      intent: INTENTS.CALL,
      profile,
      slots: { contactName: 'Miguel' },
      now,
    });
    assert.match(turn.card, /Alexa, llama a Miguel/i);
    assert.match(turn.card, /no yo|contactos de Alexa/i);
    assert.doesNotMatch(turn.card, /estoy llamando|I am calling/i);
  });

  it('falls back to the caregiver if no name is given', () => {
    const profile = withNames(defaultProfile(), { personName: 'Luis', caregiverName: 'Miguel' });
    const turn = handleTurn({ intent: INTENTS.CALL, profile, slots: {}, now });
    assert.match(turn.card, /Miguel/);
  });

  it('matches names without accents', () => {
    const profile = handleTurn({
      intent: INTENTS.ADD_CONTACT,
      profile: defaultProfile(),
      slots: { contactName: 'José' },
      now,
    }).profile;
    assert.equal(findContact(profile, 'jose').name, 'José');
  });
});

describe('vitals', () => {
  it('reads watch ingest and refuses to diagnose', () => {
    const profile = ingestWatchPayload(defaultProfile(), { heartRate: 72, spo2: 96 }, now);
    const turn = handleTurn({ intent: INTENTS.VITALS, profile, now });
    assert.match(turn.card, /pulso 72/i);
    assert.match(turn.card, /No es un diagnóstico/i);
  });

  it('records a spoken pulse for the caregiver stopgap', () => {
    const turn = handleTurn({
      intent: INTENTS.RECORD_VITALS,
      profile: defaultProfile(),
      slots: { heartRate: '68' },
      now,
    });
    assert.equal(turn.profile.vitals.heartRate, 68);
    assert.equal(turn.profile.vitals.source, 'voice');
  });

  it('flags an unusual pulse without telling them to take medicine', () => {
    assert.equal(unusualHeartRate(140), true);
    const turn = handleTurn({
      intent: INTENTS.RECORD_VITALS,
      profile: defaultProfile(),
      slots: { heartRate: '140' },
      now,
    });
    assert.match(turn.card, /fuera de lo habitual/i);
    assert.doesNotMatch(turn.card, /tómate|diagnóstico de/i);
  });

  it('says there is no reading yet', () => {
    const turn = handleTurn({ intent: INTENTS.VITALS, profile: defaultProfile(), now });
    assert.match(turn.card, /Todavía no tengo constantes/i);
  });
});
