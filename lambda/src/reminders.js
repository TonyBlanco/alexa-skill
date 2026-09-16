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
 * Recurring daily reminders that tell the elder to reopen the skill.
 * scheduledTime date is a placeholder; Alexa uses the time + DAILY recurrence.
 */
async function createDailyReminders(handlerInput, { timeZone = 'Europe/Madrid', locale = 'es-ES' } = {}) {
  const factory = handlerInput.serviceClientFactory;
  if (!factory || typeof factory.getReminderManagementServiceClient !== 'function') {
    return { ok: false, reason: 'no-client' };
  }

  const client = factory.getReminderManagementServiceClient();
  const open =
    locale && locale.toLowerCase().startsWith('en')
      ? 'Time for your companion. Say: Alexa, open daily companion.'
      : 'Hora de tu compañero. Di: Alexa, abre compañero diario.';

  const payloads = [
    reminderBody({
      scheduledTime: scheduledTimeForHour(9, new Date(), timeZone),
      timeZoneId: timeZone,
      text: open,
      locale,
    }),
    reminderBody({
      scheduledTime: scheduledTimeForHour(21, new Date(), timeZone),
      timeZoneId: timeZone,
      text: open,
      locale,
    }),
  ];

  try {
    for (const body of payloads) {
      // eslint-disable-next-line no-await-in-loop
      await client.createReminder(body);
    }
    return { ok: true };
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
  remindersPermissionStatus,
  reminderBody,
  scheduledTimeForHour,
};
