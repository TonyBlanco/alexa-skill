'use strict';

const DEFAULT_TIMEZONE = 'Europe/Madrid';

/**
 * @param {Date} [now]
 * @param {string} [timeZone]
 * @returns {{ isoDay: string, hour: number, minute: number, timeZone: string }}
 */
function clock(now = new Date(), timeZone = DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const pick = (type) => parts.find((part) => part.type === type)?.value;
  return {
    isoDay: `${pick('year')}-${pick('month')}-${pick('day')}`,
    hour: Number(pick('hour')),
    minute: Number(pick('minute')),
    timeZone,
  };
}

/**
 * @param {number} hour
 * @returns {'morning' | 'afternoon' | 'evening' | 'night'}
 */
function dayPart(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function isMorningMedsWindow(hour) {
  return hour >= 8 && hour < 16;
}

function isEveningMedsWindow(hour) {
  return hour >= 20 || hour < 6;
}

module.exports = {
  DEFAULT_TIMEZONE,
  clock,
  dayPart,
  isMorningMedsWindow,
  isEveningMedsWindow,
};
