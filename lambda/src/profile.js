'use strict';

const { DEFAULT_TIMEZONE } = require('./time');

const PROFILE_VERSION = 1;
const MAX_DAYS = 7;

function defaultMeds() {
  return [
    { id: 'manana', labelKey: 'medsMorning', hour: 9 },
    { id: 'noche', labelKey: 'medsEvening', hour: 21 },
  ];
}

function defaultProfile() {
  return {
    version: PROFILE_VERSION,
    personName: null,
    caregiverName: null,
    timeZone: DEFAULT_TIMEZONE,
    setupComplete: false,
    remindersGranted: false,
    meds: defaultMeds(),
    contacts: [],
    vitals: null,
    days: {},
  };
}

function mergeProfile(stored) {
  const base = defaultProfile();
  if (!stored || typeof stored !== 'object') {
    return base;
  }
  return {
    ...base,
    ...stored,
    meds: Array.isArray(stored.meds) && stored.meds.length ? stored.meds : base.meds,
    contacts: Array.isArray(stored.contacts) ? stored.contacts : [],
    vitals: stored.vitals && typeof stored.vitals === 'object' ? stored.vitals : null,
    days: stored.days && typeof stored.days === 'object' ? stored.days : {},
  };
}

function dayState(profile, isoDay) {
  const existing = profile.days[isoDay];
  if (existing) {
    return existing;
  }
  return {
    checkIns: { morning: null, evening: null },
    meds: { manana: null, noche: null },
  };
}

function writeDay(profile, isoDay, state) {
  const days = { ...profile.days, [isoDay]: state };
  const keys = Object.keys(days).sort();
  while (keys.length > MAX_DAYS) {
    delete days[keys.shift()];
  }
  return { ...profile, days };
}

function withNames(profile, { personName, caregiverName }) {
  const next = { ...profile };
  if (personName) next.personName = personName;
  if (caregiverName) next.caregiverName = caregiverName;
  next.setupComplete = Boolean(next.personName);
  return next;
}

module.exports = {
  PROFILE_VERSION,
  defaultProfile,
  defaultMeds,
  mergeProfile,
  dayState,
  writeDay,
  withNames,
};
