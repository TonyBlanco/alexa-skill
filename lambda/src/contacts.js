'use strict';

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]/g, '')
    .trim();
}

function listContacts(profile) {
  const stored = Array.isArray(profile.contacts) ? profile.contacts.filter((c) => c && c.name) : [];
  const names = new Set(stored.map((c) => normalizeName(c.name)));
  if (profile.caregiverName && !names.has(normalizeName(profile.caregiverName))) {
    return [{ name: profile.caregiverName, relation: 'cuidador' }, ...stored];
  }
  return stored;
}

function findContact(profile, spoken) {
  const needle = normalizeName(spoken);
  if (!needle) {
    return listContacts(profile)[0] || null;
  }
  const contacts = listContacts(profile);
  return (
    contacts.find((c) => normalizeName(c.name) === needle) ||
    contacts.find((c) => normalizeName(c.name).startsWith(needle)) ||
    contacts.find((c) => needle.startsWith(normalizeName(c.name))) ||
    null
  );
}

function addContact(profile, name, relation = 'familia') {
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    return profile;
  }
  const contacts = Array.isArray(profile.contacts) ? [...profile.contacts] : [];
  const existing = contacts.findIndex((c) => normalizeName(c.name) === normalizeName(trimmed));
  const entry = { name: trimmed, relation };
  if (existing >= 0) {
    contacts[existing] = { ...contacts[existing], ...entry };
  } else {
    contacts.push(entry);
  }
  return { ...profile, contacts };
}

module.exports = {
  normalizeName,
  listContacts,
  findContact,
  addContact,
};
