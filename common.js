const fs = require("fs");
const ENV_FILE = './.env';


function updateEnv(var_name, new_value) {
  let envVars = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');

  envVars = envVars.map(line => {
    if (line.startsWith(var_name)) return `${var_name}=${new_value}`;
    return line;
  });

  fs.writeFileSync(ENV_FILE, envVars.join('\n'));
  log(`server.js: Updated .env ${var_name} to ${new_value}.`);
}

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync("log.txt", `[${timestamp}] ${message}\n`);
  console.log(message)
}

module.exports = {
  log,
  updateEnv
};