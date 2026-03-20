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

const MORNING_HOUR   = process.env.MORNING_HOUR   || '8';
const MORNING_MINUTE = process.env.MORNING_MINUTE || '0';
const EVENING_HOUR   = process.env.EVENING_HOUR   || '18';
const EVENING_MINUTE = process.env.EVENING_MINUTE || '0';
const MAX_DELAY_MINUTES = parseInt(process.env.MAX_DELAY_MINUTES || '5', 10);
const TIMEZONE = process.env.TIMEZONE || 'America/Guatemala';

function validate() {
  const errors = [];

  if (!TARGET_PHONE) {
    errors.push('TARGET_PHONE no esta configurado en .env');
  }

  if (!FROM_PHONE) {
    errors.push('FROM_PHONE no esta configurado en .env');
  }

  if (errors.length > 0) {
    errors.forEach(e => console.error('Error de configuracion:', e));
    process.exit(1);
  }
}

module.exports = {
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
