require('dotenv').config();

const { createClient, sendMessage } = require('./whatsappClient');
const { getRandomMessage } = require('./messageSelector');

const TARGET_PHONE = process.env.TARGET_PHONE;

if (!TARGET_PHONE) {
  console.error('Error: TARGET_PHONE no esta configurado en .env');
  process.exit(1);
}

console.log('Iniciando prueba de envio...');
console.log(`Numero destino: ${TARGET_PHONE}`);

const client = createClient();

client.on('ready', async () => {
  try {
    const message = getRandomMessage('morning');
    console.log(`Mensaje seleccionado: "${message}"`);

    await sendMessage(TARGET_PHONE, message);
    console.log('Prueba exitosa. Cerrando cliente...');

    await client.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Error en la prueba:', err.message);
    await client.destroy();
    process.exit(1);
  }
});
