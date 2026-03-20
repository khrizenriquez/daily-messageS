const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'daily-message.log');

function appendLog(from, to, message, result = {}) {
  const timestamp = new Date().toISOString();
  const id = result.id || 'desconocido';
  const status = result.status || 'desconocido';
  const confirmedAt = result.timestamp || timestamp;

  const line = `[${timestamp}] DE: ${from} | PARA: ${to} | ESTADO: ${status} | ID: ${id} | CONFIRMADO: ${confirmedAt} | MENSAJE: "${message}"\n`;

  fs.appendFileSync(LOG_FILE, line, 'utf8');

  const preview = message.length > 60 ? message.substring(0, 60) + '...' : message;
  console.log(`[${timestamp}] DE: ${from} | PARA: ${to} | ESTADO: ${status} | ID: ${id} | MENSAJE: "${preview}"`);
}

module.exports = { appendLog };
