const config = require('./config');
config.validate();

const { createClient, sendMessage } = require('./whatsappClient');
const { getMessageFromCategory } = require('./messageSelector');
const { appendLog } = require('./logger');

const { FROM_PHONE, TARGET_PHONE } = config;

console.log('Iniciando prueba de envio...');
console.log(`Numero origen:  ${FROM_PHONE}`);
console.log(`Numero destino: ${TARGET_PHONE}`);

const client = createClient();

client.on('ready', async () => {
  try {
    const info = client.info;
    console.log(`Cuenta autenticada: +${info.wid.user} (${info.pushname})`);
    console.log(`Enviando a chatId:  ${TARGET_PHONE}@c.us`);

    const isRegistered = await client.isRegisteredUser(`${TARGET_PHONE}@c.us`);
    if (!isRegistered) {
      console.error(`El numero ${TARGET_PHONE} no tiene WhatsApp activo o no existe.`);
      await client.destroy();
      process.exit(1);
    }
    console.log(`Numero destino verificado: tiene WhatsApp activo.`);

    const message = getMessageFromCategory('chistes');
    console.log(`Mensaje seleccionado: "${message}"`);

    const result = await sendMessage(TARGET_PHONE, message);

    // Espera hasta 10 segundos para confirmar entrega al dispositivo
    const ACK_LABELS = { 0: 'pendiente', 1: 'enviado (1 palomita)', 2: 'entregado (2 palomitas)', 3: 'leido (2 palomitas azules)' };
    const deliveryConfirmed = await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 10000);
      client.on('message_ack', (msg, ack) => {
        if (msg.id.id === result.id) {
          clearTimeout(timeout);
          resolve(ack);
        }
      });
    });

    const ackLabel = deliveryConfirmed !== null ? (ACK_LABELS[deliveryConfirmed] || `ack=${deliveryConfirmed}`) : 'sin respuesta en 10s (puede estar offline)';
    console.log(`Confirmacion de entrega: ${ackLabel}`);

    appendLog(FROM_PHONE, TARGET_PHONE, message, { ...result, ackLabel });
    console.log('Prueba exitosa. Cerrando cliente...');

    await client.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Error en la prueba:', err.message);
    await client.destroy();
    process.exit(1);
  }
});
