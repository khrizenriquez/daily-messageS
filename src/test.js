const config = require('./config');
config.validate();

const { createClient, sendMessage } = require('./whatsappClient');
const { getRandomMessage } = require('./messageSelector');
const { appendLog } = require('./logger');

const { FROM_PHONE, TARGET_PHONE } = config;

console.log('Iniciando prueba de envio...');
console.log(`Numero origen:  ${FROM_PHONE}`);
console.log(`Numero destino: ${TARGET_PHONE}`);

const client = createClient();

client.on('ready', async () => {
  try {
    const message = getRandomMessage('morning');
    console.log(`Mensaje seleccionado: "${message}"`);

    await sendMessage(TARGET_PHONE, message);
    appendLog(FROM_PHONE, TARGET_PHONE, message);
    console.log('Prueba exitosa. Cerrando cliente...');

    await client.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Error en la prueba:', err.message);
    await client.destroy();
    process.exit(1);
  }
});
