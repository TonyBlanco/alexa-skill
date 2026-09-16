'use strict';

const DEFAULT_TIMEZONE = 'Europe/Madrid';

const HOUR_WORDS = ['doce', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once'];

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

function isBreakfastWindow(hour) {
  return hour >= 7 && hour < 11;
}

function isLunchWindow(hour) {
  return hour >= 13 && hour < 16;
}

function isDinnerWindow(hour) {
  return hour >= 19 && hour < 22;
}

function isWalkWindow(hour) {
  return hour >= 10 && hour < 18;
}

function isMorningMedsWindow(hour) {
  return hour >= 8 && hour < 16;
}

function isEveningMedsWindow(hour) {
  return hour >= 20 || hour < 6;
}

function hourWord(hour) {
  return HOUR_WORDS[((hour % 24) + 24) % 12];
}

function periodLabel(hour, locale = 'es-ES') {
  const es = !(locale && locale.toLowerCase().startsWith('en'));
  if (hour >= 6 && hour < 12) return es ? 'de la mañana' : 'in the morning';
  if (hour >= 12 && hour < 21) return es ? 'de la tarde' : 'in the afternoon';
  return es ? 'de la noche' : 'at night';
}

/**
 * Spoken clock for Luis, who loses track of meal times.
 * @returns {string}
 */
function speakClock(hour, minute, locale = 'es-ES') {
  const es = !(locale && locale.toLowerCase().startsWith('en'));
  if (!es) {
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    return `It is ${hh}:${mm} ${periodLabel(hour, locale)}`.replace(/  /g, ' ').trim();
  }

  const nextHour = (hour + 1) % 24;
  const verb = (hour % 12 === 1) ? 'Es la' : 'Son las';
  const nextVerb = (nextHour % 12 === 1) ? 'Es la' : 'Son las';
  const name = hourWord(hour);
  const period = periodLabel(hour, locale);

  if (minute === 0) return `${verb} ${name} en punto ${period}`;
  if (minute === 15) return `${verb} ${name} y cuarto ${period}`;
  if (minute === 30) return `${verb} ${name} y media ${period}`;
  if (minute === 45) {
    return `${nextVerb} ${hourWord(nextHour)} menos cuarto ${periodLabel(nextHour, locale)}`;
  }
  return `${verb} ${name} y ${minute} ${period}`;
}

module.exports = {
  DEFAULT_TIMEZONE,
  clock,
  dayPart,
  isBreakfastWindow,
  isLunchWindow,
  isDinnerWindow,
  isWalkWindow,
  isMorningMedsWindow,
  isEveningMedsWindow,
  speakClock,
};
