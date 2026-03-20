const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client = null;
let isReady = false;

function createClient() {
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: '.wwebjs_auth'
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log('Escanea el codigo QR con tu WhatsApp (Configuracion -> Dispositivos vinculados):');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    console.log('Cliente WhatsApp listo.');
  });

  client.on('authenticated', () => {
    console.log('Autenticacion exitosa.');
  });

  client.on('auth_failure', (msg) => {
    isReady = false;
    console.error('Error de autenticacion:', msg);
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    console.log('Cliente desconectado:', reason);
  });

  client.initialize();

  return client;
}

function isClientReady() {
  return isReady;
}

async function sendMessage(phoneNumber, message) {
  if (!isReady) {
    throw new Error('El cliente WhatsApp no esta listo. Espera a que se conecte.');
  }

  const chatId = `${phoneNumber}@c.us`;
  const result = await client.sendMessage(chatId, message);

  return {
    id: result.id?.id || result.id?._serialized || 'desconocido',
    timestamp: result.timestamp ? new Date(result.timestamp * 1000).toISOString() : new Date().toISOString(),
    status: result.id ? 'enviado' : 'sin-confirmacion',
  };
}

module.exports = { createClient, isClientReady, sendMessage };
