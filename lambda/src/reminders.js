'use strict';

const { clock } = require('./time');

const REMINDER_SCOPE = 'alexa::alerts:reminders:skill:readwrite';

function askForRemindersDirective() {
  return {
    type: 'Connections.SendRequest',
    name: 'AskFor',
    payload: {
      '@type': 'AskForPermissionsConsentRequest',
      '@version': '2',
      permissionScopes: [
        {
          permissionScope: REMINDER_SCOPE,
          consentLevel: 'ACCOUNT',
        },
      ],
    },
    token: 'companero-reminders',
  };
}

function reminderBody({ scheduledTime, timeZoneId, text, locale }) {
  return {
    requestTime: new Date().toISOString(),
    trigger: {
      type: 'SCHEDULED_ABSOLUTE',
      scheduledTime,
      timeZoneId,
      recurrence: { freq: 'DAILY' },
    },
    alertInfo: {
      spokenInfo: {
        content: [{ locale, text }],
      },
    },
    pushNotification: { status: 'ENABLED' },
  };
}

function addCalendarDays(isoDay, days) {
  const [year, month, day] = isoDay.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

function scheduledTimeForHour(hour, now = new Date(), timeZone = 'Europe/Madrid') {
  const { isoDay, hour: currentHour } = clock(now, timeZone);
  const day = currentHour >= hour ? addCalendarDays(isoDay, 1) : isoDay;
  return `${day}T${String(hour).padStart(2, '0')}:00:00`;
}

/**
 * Native Alexa reminders that still speak if the skill session dies.
 * They name the real task (meal, pills, walk), not only "open the skill".
 */
function dailyReminderSpecs({ locale = 'es-ES', personName = 'Luis' } = {}) {
  const name = personName || 'Luis';
  const english = locale && locale.toLowerCase().startsWith('en');
  if (english) {
    return [
      { hour: 8, text: `${name}, time for breakfast.` },
      { hour: 9, text: `${name}, time for the morning pills.` },
      { hour: 11, text: `${name}, time to move a little. A gentle walk.` },
      { hour: 14, text: `${name}, time for lunch.` },
      { hour: 21, text: `${name}, time for the evening pills.` },
    ];
  }
  return [
    { hour: 8, text: `${name}, hora del desayuno.` },
    { hour: 9, text: `${name}, hora de las pastillas de la mañana.` },
    { hour: 11, text: `${name}, hora de moverte un poco. Un paseo suave.` },
    { hour: 14, text: `${name}, hora de la comida.` },
    { hour: 21, text: `${name}, hora de las pastillas de la noche.` },
  ];
}

async function createDailyReminders(
  handlerInput,
  { timeZone = 'Europe/Madrid', locale = 'es-ES', personName = 'Luis' } = {},
) {
  const factory = handlerInput.serviceClientFactory;
  if (!factory || typeof factory.getReminderManagementServiceClient !== 'function') {
    return { ok: false, reason: 'no-client' };
  }

  const client = factory.getReminderManagementServiceClient();
  const specs = dailyReminderSpecs({ locale, personName });
  const payloads = specs.map((spec) =>
    reminderBody({
      scheduledTime: scheduledTimeForHour(spec.hour, new Date(), timeZone),
      timeZoneId: timeZone,
      text: spec.text,
      locale,
    }),
  );

  try {
    for (const body of payloads) {
      // eslint-disable-next-line no-await-in-loop
      await client.createReminder(body);
    }
    return { ok: true, count: payloads.length };
  } catch (error) {
    console.error('createDailyReminders failed', error);
    return { ok: false, reason: error.message };
  }
}

function remindersPermissionStatus(request) {
  const payload = request.payload || {};
  return payload.status || payload.code || 'NOT_ANSWERED';
}

module.exports = {
  REMINDER_SCOPE,
  askForRemindersDirective,
  createDailyReminders,
  dailyReminderSpecs,
  remindersPermissionStatus,
  reminderBody,
  scheduledTimeForHour,
};
