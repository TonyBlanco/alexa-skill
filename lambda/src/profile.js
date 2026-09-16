'use strict';

const { DEFAULT_TIMEZONE } = require('./time');

const PROFILE_VERSION = 1;
const MAX_DAYS = 7;
const DEFAULT_PERSON_NAME = 'Luis';

function defaultMeds() {
  return [
    { id: 'manana', labelKey: 'medsMorning', hour: 9 },
    { id: 'noche', labelKey: 'medsEvening', hour: 21 },
  ];
}

function emptyDay() {
  return {
    checkIns: { morning: null, evening: null },
    meds: { manana: null, noche: null },
    meals: { desayuno: null, comida: null, cena: null },
    walk: null,
  };
}

function defaultProfile() {
  return {
    version: PROFILE_VERSION,
    personName: DEFAULT_PERSON_NAME,
    caregiverName: null,
    timeZone: DEFAULT_TIMEZONE,
    setupComplete: true,
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
  const personName = stored.personName === undefined ? base.personName : stored.personName;
  return {
    ...base,
    ...stored,
    personName: personName || DEFAULT_PERSON_NAME,
    setupComplete: stored.setupComplete === false ? Boolean(personName) : true,
    meds: Array.isArray(stored.meds) && stored.meds.length ? stored.meds : base.meds,
    contacts: Array.isArray(stored.contacts) ? stored.contacts : [],
    vitals: stored.vitals && typeof stored.vitals === 'object' ? stored.vitals : null,
    days: stored.days && typeof stored.days === 'object' ? stored.days : {},
  };
}

function dayState(profile, isoDay) {
  const existing = profile.days[isoDay];
  if (!existing) {
    return emptyDay();
  }
  const blank = emptyDay();
  return {
    ...blank,
    ...existing,
    checkIns: { ...blank.checkIns, ...(existing.checkIns || {}) },
    meds: { ...blank.meds, ...(existing.meds || {}) },
    meals: { ...blank.meals, ...(existing.meals || {}) },
    walk: existing.walk == null ? null : existing.walk,
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
  DEFAULT_PERSON_NAME,
  defaultProfile,
  defaultMeds,
  emptyDay,
  mergeProfile,
  dayState,
  writeDay,
  withNames,
};
