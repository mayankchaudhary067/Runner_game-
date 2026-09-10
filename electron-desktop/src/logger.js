const fs = require('fs');
const path = require('path');

function createLogger(logDir) {
  const logPath = path.join(logDir, 'app.log');

  return {
    log(message) {
      const line = `${new Date().toISOString()} - ${message}\n`;
      fs.appendFileSync(logPath, line, { flag: 'a' });
    },
    error(message) {
      this.log(`ERROR: ${message}`);
    },
  };
}

module.exports = { createLogger };
