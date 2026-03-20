require('dotenv').config();

const cron = require('node-cron');
const { createClient, sendMessage } = require('./whatsappClient');
const { getRandomMessage } = require('./messageSelector');

const TARGET_PHONE = process.env.TARGET_PHONE;
const MORNING_HOUR = process.env.MORNING_HOUR || '8';
const MORNING_MINUTE = process.env.MORNING_MINUTE || '0';
const EVENING_HOUR = process.env.EVENING_HOUR || '18';
const EVENING_MINUTE = process.env.EVENING_MINUTE || '0';
const MAX_DELAY_MINUTES = parseInt(process.env.MAX_DELAY_MINUTES || '5', 10);

if (!TARGET_PHONE) {
  console.error('Error: TARGET_PHONE no esta configurado en .env');
  process.exit(1);
}

function randomDelayMs() {
  return Math.floor(Math.random() * MAX_DELAY_MINUTES * 60 * 1000);
}

async function sendScheduledMessage(timeOfDay) {
  const delayMs = randomDelayMs();
  const delayMin = Math.floor(delayMs / 60000);
  const delaySec = Math.floor((delayMs % 60000) / 1000);

  console.log(`[${new Date().toISOString()}] Mensaje de ${timeOfDay} programado. Delay: ${delayMin}m ${delaySec}s`);

  await new Promise(resolve => setTimeout(resolve, delayMs));

  const message = getRandomMessage(timeOfDay);
  await sendMessage(TARGET_PHONE, message);

  console.log(`[${new Date().toISOString()}] Mensaje de ${timeOfDay} enviado correctamente.`);
}

console.log('Iniciando daily-message...');
console.log(`Numero destino: ${TARGET_PHONE}`);
console.log(`Horario manana: ${MORNING_HOUR}:${String(MORNING_MINUTE).padStart(2, '0')}`);
console.log(`Horario tarde:  ${EVENING_HOUR}:${String(EVENING_MINUTE).padStart(2, '0')}`);

createClient();

cron.schedule(`${MORNING_MINUTE} ${MORNING_HOUR} * * *`, async () => {
  try {
    await sendScheduledMessage('morning');
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error en mensaje de manana:`, err.message);
  }
}, { timezone: 'America/Guatemala' });

cron.schedule(`${EVENING_MINUTE} ${EVENING_HOUR} * * *`, async () => {
  try {
    await sendScheduledMessage('evening');
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error en mensaje de tarde:`, err.message);
  }
}, { timezone: 'America/Guatemala' });

console.log('Cron activo. Esperando horarios programados...');
