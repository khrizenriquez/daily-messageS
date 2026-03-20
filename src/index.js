const config = require('./config');
config.validate();

const cron = require('node-cron');
const { createClient, sendMessage } = require('./whatsappClient');
const { getRandomMessage } = require('./messageSelector');
const { appendLog } = require('./logger');

const { TARGET_PHONE, FROM_PHONE, MORNING_HOUR, MORNING_MINUTE, EVENING_HOUR, EVENING_MINUTE, MAX_DELAY_MINUTES, TIMEZONE } = config;

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
  appendLog(FROM_PHONE, TARGET_PHONE, message);
}

console.log('Iniciando daily-message...');
console.log(`Numero origen:  ${FROM_PHONE}`);
console.log(`Numero destino: ${TARGET_PHONE}`);
console.log(`Horario manana: ${MORNING_HOUR}:${String(MORNING_MINUTE).padStart(2, '0')}`);
console.log(`Horario tarde:  ${EVENING_HOUR}:${String(EVENING_MINUTE).padStart(2, '0')}`);
console.log(`Zona horaria:   ${TIMEZONE}`);

createClient();

cron.schedule(`${MORNING_MINUTE} ${MORNING_HOUR} * * *`, async () => {
  try {
    await sendScheduledMessage('morning');
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error en mensaje de manana:`, err.message);
  }
}, { timezone: TIMEZONE });

cron.schedule(`${EVENING_MINUTE} ${EVENING_HOUR} * * *`, async () => {
  try {
    await sendScheduledMessage('evening');
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error en mensaje de tarde:`, err.message);
  }
}, { timezone: TIMEZONE });

console.log('Cron activo. Esperando horarios programados...');
