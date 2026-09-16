'use strict';

const Alexa = require('ask-sdk-core');
const {
  requestHandlers,
  ErrorHandler,
  LoadPersistentInterceptor,
  SavePersistentInterceptor,
} = require('./src/handlers');

function buildSkill() {
  const builder = Alexa.SkillBuilders.custom()
    .addRequestHandlers(...requestHandlers)
    .addRequestInterceptors(LoadPersistentInterceptor)
    .addResponseInterceptors(SavePersistentInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .withCustomUserAgent('companero-diario/0.1');

  if (process.env.COMPANERO_TABLE) {
    try {
      // eslint-disable-next-line global-require
      const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
      builder.withPersistenceAdapter(
        new DynamoDbPersistenceAdapter({
          tableName: process.env.COMPANERO_TABLE,
          createTable: true,
        }),
      );
    } catch (error) {
      console.warn('DynamoDB persistence adapter not installed; session only.', error.message);
    }
  }

  return builder;
}

const skillBuilder = buildSkill();

exports.buildSkill = buildSkill;
exports.handler = skillBuilder.lambda();
