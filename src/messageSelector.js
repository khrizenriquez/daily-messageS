const fs = require('fs');
const path = require('path');

const MESSAGES_FILE = path.join(__dirname, '..', 'messages.json');
const LOG_FILE = path.join(__dirname, '..', 'sent-log.json');

function loadMessages() {
  return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
}

function loadSentLog() {
  if (!fs.existsSync(LOG_FILE)) {
    return { buenos_dias: [], buenas_tardes: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  } catch {
    return { buenos_dias: [], buenas_tardes: [] };
  }
}

function saveSentLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
}

function getRandomMessage(timeOfDay) {
  const messages = loadMessages();
  const log = loadSentLog();

  const category = timeOfDay === 'morning' ? 'buenos_dias' : 'buenas_tardes';
  const pool = messages[category];
  const sent = log[category] || [];

  let available = pool.map((_, i) => i).filter(i => !sent.includes(i));

  if (available.length === 0) {
    console.log(`Pool de "${category}" agotado. Reiniciando el ciclo.`);
    log[category] = [];
    saveSentLog(log);
    available = pool.map((_, i) => i);
  }

  const randomIndex = available[Math.floor(Math.random() * available.length)];
  const message = pool[randomIndex];

  log[category] = [...(log[category] || []), randomIndex];
  saveSentLog(log);

  return message;
}

module.exports = { getRandomMessage };
