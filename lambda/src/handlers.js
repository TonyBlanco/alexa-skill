'use strict';

const Alexa = require('ask-sdk-core');
const { handleTurn, INTENTS, permissionResult } = require('./companion');
const { mergeProfile } = require('./profile');
const { localeBundle, wrapSpeak } = require('./speech');
const { askForRemindersDirective, createDailyReminders, remindersPermissionStatus } = require('./reminders');

function localeOf(handlerInput) {
  return Alexa.getLocale(handlerInput.requestEnvelope) || 'es-ES';
}

function slotValue(handlerInput, name) {
  try {
    return Alexa.getSlotValue(handlerInput.requestEnvelope, name) || null;
  } catch {
    return null;
  }
}

function sessionBag(handlerInput) {
  const attributes = handlerInput.attributesManager.getSessionAttributes() || {};
  return {
    profile: mergeProfile(attributes.profile),
    pending: attributes.pending || null,
    lastSpeech: attributes.lastSpeech || null,
  };
}

function persistTurn(handlerInput, turn) {
  handlerInput.attributesManager.setSessionAttributes({
    profile: turn.profile,
    pending: turn.pending,
    lastSpeech: turn.lastSpeech,
  });
  if (typeof handlerInput.attributesManager.setPersistentAttributes === 'function' && process.env.COMPANERO_TABLE) {
    handlerInput.attributesManager.setPersistentAttributes(turn.profile);
  }
}

function respond(handlerInput, turn) {
  persistTurn(handlerInput, turn);
  const builder = handlerInput.responseBuilder.speak(turn.speak);
  if (turn.card) {
    builder.withSimpleCard('Compañero diario', turn.card);
  }
  if (turn.endSession) {
    builder.withShouldEndSession(true);
  } else if (turn.reprompt) {
    builder.reprompt(turn.reprompt);
  }
  if (turn.askReminders) {
    builder.addDirective(askForRemindersDirective());
  }
  return builder.getResponse();
}

function run(handlerInput, intent, slots = {}) {
  const { profile, pending, lastSpeech } = sessionBag(handlerInput);
  const turn = handleTurn({
    intent,
    profile,
    pending,
    lastSpeech,
    slots,
    locale: localeOf(handlerInput),
    now: new Date(),
  });
  return respond(handlerInput, turn);
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.LAUNCH);
  },
};

const CheckInWellIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckInWellIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.CHECKIN_WELL);
  },
};

const CheckInUnwellIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckInUnwellIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.CHECKIN_UNWELL);
  },
};

const MedicacionIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'MedicacionIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.MEDS_ASK);
  },
};

const MedicacionTomadaIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'MedicacionTomadaIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.MEDS_TAKEN);
  },
};

const MedicacionPendienteIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'MedicacionPendienteIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.MEDS_NOT_TAKEN);
  },
};

const MedicacionInseguraIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'MedicacionInseguraIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.MEDS_UNSURE);
  },
};

const CompaniaIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'CompaniaIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.COMPANY);
  },
};

const EmergenciaIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'EmergenciaIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.EMERGENCY);
  },
};

const BuenosDiasIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'BuenosDiasIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.MORNING);
  },
};

const BuenasNochesIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'BuenasNochesIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.NIGHT);
  },
};

const QueTocaIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'QueTocaIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.WHATS_NEXT);
  },
};

const ConfigurarIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConfigurarIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.CONFIGURE, {
      personName: slotValue(handlerInput, 'personName'),
      caregiverName: slotValue(handlerInput, 'caregiverName'),
    });
  },
};

const NombreIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'NombreIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.NAME, {
      personName: slotValue(handlerInput, 'personName'),
      name: slotValue(handlerInput, 'personName'),
    });
  },
};

const RecordatoriosIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'RecordatoriosIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.REMINDERS);
  },
};

const LlamaContactoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'LlamaContactoIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.CALL, {
      contactName: slotValue(handlerInput, 'contactName'),
    });
  },
};

const AnadirContactoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnadirContactoIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.ADD_CONTACT, {
      contactName: slotValue(handlerInput, 'contactName'),
    });
  },
};

const ConstantesIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConstantesIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.VITALS);
  },
};

const RegistrarPulsoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegistrarPulsoIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.RECORD_VITALS, {
      heartRate: slotValue(handlerInput, 'heartRate'),
      spo2: slotValue(handlerInput, 'spo2'),
    });
  },
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.YES);
  },
};

const NoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.NO);
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.HELP);
  },
};

const RepeatIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.REPEAT);
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.STOP);
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
    );
  },
  handle(handlerInput) {
    return run(handlerInput, INTENTS.FALLBACK);
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ConnectionsResponseHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'Connections.Response' && request.name === 'AskFor';
  },
  async handle(handlerInput) {
    const locale = localeOf(handlerInput);
    const copy = localeBundle(locale);
    const status = remindersPermissionStatus(handlerInput.requestEnvelope.request);
    const result = permissionResult(status, locale);
    const { profile, pending, lastSpeech } = sessionBag(handlerInput);
    profile.remindersGranted = result.remindersGranted;

    if (result.createReminders) {
      const created = await createDailyReminders(handlerInput, {
        timeZone: profile.timeZone,
        locale,
      });
      const text = created.ok ? copy.remindersCreated : copy.remindersFailed;
      const turn = {
        profile,
        pending: null,
        lastSpeech: text,
        speak: wrapSpeak(text),
        reprompt: wrapSpeak(copy.helpShort),
        card: text,
        endSession: false,
      };
      return respond(handlerInput, turn);
    }

    const turn = {
      profile,
      pending,
      lastSpeech: result.card,
      speak: result.speak,
      reprompt: wrapSpeak(copy.helpShort),
      card: result.card,
      endSession: false,
    };
    return respond(handlerInput, turn);
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error: ${error.message}`, error);
    const copy = localeBundle(localeOf(handlerInput));
    const speech = wrapSpeak(copy.error);
    return handlerInput.responseBuilder.speak(speech).reprompt(speech).getResponse();
  },
};

const LoadPersistentInterceptor = {
  async process(handlerInput) {
    if (!process.env.COMPANERO_TABLE) {
      return;
    }
    try {
      const persistent = await handlerInput.attributesManager.getPersistentAttributes();
      const session = handlerInput.attributesManager.getSessionAttributes() || {};
      if (!session.profile && persistent && Object.keys(persistent).length) {
        session.profile = mergeProfile(persistent);
        handlerInput.attributesManager.setSessionAttributes(session);
      }
    } catch (error) {
      console.warn('No persistent attributes', error.message);
    }
  },
};

const SavePersistentInterceptor = {
  async process(handlerInput) {
    if (!process.env.COMPANERO_TABLE) {
      return;
    }
    try {
      await handlerInput.attributesManager.savePersistentAttributes();
    } catch (error) {
      console.warn('Could not save persistent attributes', error.message);
    }
  },
};

const requestHandlers = [
  LaunchRequestHandler,
  CheckInWellIntentHandler,
  CheckInUnwellIntentHandler,
  MedicacionIntentHandler,
  MedicacionTomadaIntentHandler,
  MedicacionPendienteIntentHandler,
  MedicacionInseguraIntentHandler,
  CompaniaIntentHandler,
  EmergenciaIntentHandler,
  BuenosDiasIntentHandler,
  BuenasNochesIntentHandler,
  QueTocaIntentHandler,
  ConfigurarIntentHandler,
  NombreIntentHandler,
  RecordatoriosIntentHandler,
  LlamaContactoIntentHandler,
  AnadirContactoIntentHandler,
  ConstantesIntentHandler,
  RegistrarPulsoIntentHandler,
  YesIntentHandler,
  NoIntentHandler,
  HelpIntentHandler,
  RepeatIntentHandler,
  CancelAndStopIntentHandler,
  FallbackIntentHandler,
  ConnectionsResponseHandler,
  SessionEndedRequestHandler,
];

module.exports = {
  requestHandlers,
  ErrorHandler,
  LoadPersistentInterceptor,
  SavePersistentInterceptor,
  run,
};
