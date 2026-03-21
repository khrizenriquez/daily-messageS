require('dotenv').config();

const DEFAULT_COUNTRY_CODE = '502';

function normalizePhone(raw, countryCode) {
  if (!raw) return null;

  let phone = String(raw).trim().replace(/[\s\-\+\(\)]/g, '');

  if (!phone.startsWith(countryCode)) {
    phone = countryCode + phone;
  }

  return phone;
}

const COUNTRY_CODE = (process.env.COUNTRY_CODE || DEFAULT_COUNTRY_CODE).replace(/\D/g, '');

const FROM_PHONE = normalizePhone(process.env.FROM_PHONE, COUNTRY_CODE);
const TARGET_PHONE = normalizePhone(process.env.TARGET_PHONE, COUNTRY_CODE);

const MORNING_HOUR   = parseInt(process.env.MORNING_HOUR   || '8',  10);
const MORNING_MINUTE = parseInt(process.env.MORNING_MINUTE || '0',  10);
const EVENING_HOUR   = parseInt(process.env.EVENING_HOUR   || '18', 10);
const EVENING_MINUTE = parseInt(process.env.EVENING_MINUTE || '0',  10);
const MAX_DELAY_MINUTES = parseInt(process.env.MAX_DELAY_MINUTES || '5', 10);
const TIMEZONE = process.env.TIMEZONE || 'America/Guatemala';

function validate({ from = FROM_PHONE, target = TARGET_PHONE } = {}) {
  const errors = [];

  if (!from) {
    errors.push('FROM_PHONE no esta configurado en .env');
  }

  if (!target) {
    errors.push('TARGET_PHONE no esta configurado en .env');
  }

  if (isNaN(MORNING_HOUR) || MORNING_HOUR < 0 || MORNING_HOUR > 23) {
    errors.push('MORNING_HOUR debe ser un numero entre 0 y 23');
  }

  if (isNaN(MORNING_MINUTE) || MORNING_MINUTE < 0 || MORNING_MINUTE > 59) {
    errors.push('MORNING_MINUTE debe ser un numero entre 0 y 59');
  }

  if (isNaN(EVENING_HOUR) || EVENING_HOUR < 0 || EVENING_HOUR > 23) {
    errors.push('EVENING_HOUR debe ser un numero entre 0 y 23');
  }

  if (isNaN(EVENING_MINUTE) || EVENING_MINUTE < 0 || EVENING_MINUTE > 59) {
    errors.push('EVENING_MINUTE debe ser un numero entre 0 y 59');
  }

  if (errors.length > 0) {
    errors.forEach(e => console.error('Error de configuracion:', e));
    process.exit(1);
  }
}

module.exports = {
  normalizePhone,
  COUNTRY_CODE,
  FROM_PHONE,
  TARGET_PHONE,
  MORNING_HOUR,
  MORNING_MINUTE,
  EVENING_HOUR,
  EVENING_MINUTE,
  MAX_DELAY_MINUTES,
  TIMEZONE,
  validate,
};
