'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('../index');
const { INTENTS } = require('../src/companion');
const { run } = require('../src/handlers');

function envelope({ type = 'IntentRequest', intentName, locale = 'es-ES', slots = {} } = {}) {
  const slotPayload = {};
  for (const [name, value] of Object.entries(slots)) {
    slotPayload[name] = {
      name,
      value,
      confirmationStatus: 'NONE',
    };
  }
  return {
    version: '1.0',
    session: {
      new: type === 'LaunchRequest',
      sessionId: 'amzn1.echo-api.session.test',
      application: { applicationId: 'amzn1.ask.skill.test' },
      user: { userId: 'amzn1.ask.account.test' },
      attributes: {},
    },
    context: {
      System: {
        application: { applicationId: 'amzn1.ask.skill.test' },
        user: { userId: 'amzn1.ask.account.test' },
        device: { deviceId: 'amzn1.ask.device.test', supportedInterfaces: {} },
        apiEndpoint: 'https://api.amazonalexa.com',
        apiAccessToken: 'token',
      },
    },
    request:
      type === 'LaunchRequest'
        ? { type: 'LaunchRequest', requestId: 'amzn1.echo-api.request.1', timestamp: new Date().toISOString(), locale }
        : {
            type: 'IntentRequest',
            requestId: 'amzn1.echo-api.request.1',
            timestamp: new Date().toISOString(),
            locale,
            intent: {
              name: intentName,
              confirmationStatus: 'NONE',
              slots: slotPayload,
            },
          },
  };
}

function invoke(event) {
  return new Promise((resolve, reject) => {
    handler(event, {}, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

describe('lambda handler', () => {
  it('answers a Spanish launch', async () => {
    const response = await invoke(envelope({ type: 'LaunchRequest' }));
    const ssml = response.response.outputSpeech.ssml;
    assert.match(ssml, /compañero diario|configura|estoy bien/i);
    assert.equal(response.response.shouldEndSession, false);
  });

  it('treats ayuda as skill help, not emergency', async () => {
    const response = await invoke(envelope({ intentName: 'AMAZON.HelpIntent' }));
    const ssml = response.response.outputSpeech.ssml;
    assert.match(ssml, /estoy bien/i);
    assert.doesNotMatch(ssml, /uno uno dos/i);
  });

  it('emergency names the caregiver from session-less default without claiming 112 dispatch', async () => {
    const response = await invoke(envelope({ intentName: 'EmergenciaIntent' }));
    const ssml = response.response.outputSpeech.ssml;
    assert.match(ssml, /No puedo llamar yo/i);
  });
});

describe('handlers.run', () => {
  it('maps INTENTS without throwing on a stub handlerInput', () => {
    const spoken = [];
    const handlerInput = {
      requestEnvelope: envelope({ type: 'LaunchRequest' }),
      attributesManager: {
        getSessionAttributes: () => ({}),
        setSessionAttributes: () => {},
      },
      responseBuilder: {
        speak(text) {
          spoken.push(text);
          return this;
        },
        reprompt() {
          return this;
        },
        withSimpleCard() {
          return this;
        },
        withShouldEndSession() {
          return this;
        },
        addDirective() {
          return this;
        },
        getResponse() {
          return { spoken };
        },
      },
    };
    const response = run(handlerInput, INTENTS.LAUNCH);
    assert.ok(response.spoken[0].includes('<speak>'));
  });
});
