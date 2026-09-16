'use strict';

function asNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function recordVitals(profile, raw = {}, now = new Date()) {
  const prev = profile.vitals && typeof profile.vitals === 'object' ? profile.vitals : {};
  const heartRate = asNumber(raw.heartRate);
  const spo2 = asNumber(raw.spo2);
  const systolic = asNumber(raw.systolic);
  const diastolic = asNumber(raw.diastolic);
  const next = { ...prev };
  if (heartRate != null) next.heartRate = Math.round(heartRate);
  if (spo2 != null) next.spo2 = Math.round(spo2);
  if (systolic != null) next.systolic = Math.round(systolic);
  if (diastolic != null) next.diastolic = Math.round(diastolic);
  next.at = raw.at || now.toISOString();
  next.source = raw.source || 'voice';
  return { ...profile, vitals: next };
}

function ingestWatchPayload(profile, body, now = new Date()) {
  return recordVitals(
    profile,
    {
      heartRate: body?.heartRate ?? body?.hr ?? body?.pulse,
      spo2: body?.spo2 ?? body?.oxygen,
      systolic: body?.systolic ?? body?.bpSys,
      diastolic: body?.diastolic ?? body?.bpDia,
      source: 'watch',
    },
    now,
  );
}

function vitalsAgeHours(vitals, now = new Date()) {
  if (!vitals || !vitals.at) return null;
  const then = Date.parse(vitals.at);
  if (Number.isNaN(then)) return null;
  return (now.getTime() - then) / 36e5;
}

function unusualHeartRate(heartRate) {
  return heartRate != null && (heartRate < 45 || heartRate > 120);
}

module.exports = {
  asNumber,
  recordVitals,
  ingestWatchPayload,
  vitalsAgeHours,
  unusualHeartRate,
};
