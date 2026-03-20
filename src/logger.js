const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'daily-message.log');

function appendLog(from, to, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] DE: ${from} | PARA: ${to} | MENSAJE: "${message}"\n`;

  fs.appendFileSync(LOG_FILE, line, 'utf8');
  console.log(`[${timestamp}] DE: ${from} | PARA: ${to} | MENSAJE: "${message.length > 60 ? message.substring(0, 60) + '...' : message}"`);
}

module.exports = { appendLog };
