'use strict';

const Alexa = require('ask-sdk-core');
const {
  requestHandlers,
  ErrorHandler,
  LoadPersistentInterceptor,
  SavePersistentInterceptor,
} = require('./src/handlers');

function persistenceAdapter() {
  if (process.env.S3_PERSISTENCE_BUCKET) {
    try {
      // Alexa-hosted provides this bucket at no extra cost. Do not use API Gateway.
      // eslint-disable-next-line global-require
      const { S3PersistenceAdapter } = require('ask-sdk-s3-persistence-adapter');
      return new S3PersistenceAdapter({ bucketName: process.env.S3_PERSISTENCE_BUCKET });
    } catch (error) {
      console.warn('S3 persistence adapter not installed; session only.', error.message);
    }
  }
  return null;
}

function buildSkill() {
  const builder = Alexa.SkillBuilders.custom()
    .addRequestHandlers(...requestHandlers)
    .addRequestInterceptors(LoadPersistentInterceptor)
    .addResponseInterceptors(SavePersistentInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .withCustomUserAgent('companero-diario/0.2');

  const adapter = persistenceAdapter();
  if (adapter) {
    builder.withPersistenceAdapter(adapter);
  }

  return builder;
}

const skillBuilder = buildSkill();

exports.buildSkill = buildSkill;
exports.handler = skillBuilder.lambda();
