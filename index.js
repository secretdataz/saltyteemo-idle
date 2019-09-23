const tmi = require('tmi.js');
const fs = require('fs').promises;
require('dotenv').config();

const opts = {
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_PASSWORD 
  },
  channels: [
    process.env.TWITCH_CHANNEL
  ]
};
const LAST_TIMESTAMP_PATH = '.lastFarmTimestamp.json';
const MAX_DELAY = 2 * 60 * 60 * 1000; // 2 hours
// const MAX_DELAY = 10000; // 10 sec for testing

const client = new tmi.client(opts);

client.on('connected', connectedHandler);
client.on('disconnected', disconnectedHandler);

init();

function connectedHandler(addr, port) {
  console.log(`* Connected to Twitch chat on ${addr}:${port}.`);
  farm();
}

function disconnectedHandler(reason) {
  console.log(`* Disconnected from Twitch chat due to ${reason}`);
  clearTimeout(farmTimeout);
}

var farmTimeout = undefined; //1568445756913

async function init() {
  client.connect().then(() => {
    console.log(`* Connection success.`);
  }).catch(() => {
    console.log(`* Connection failed.`);
  });
}

async function farm() {
  let lastFarmCall = await loadTimestamp();

  // Initialize a timeout for !farm calling
  let delay = MAX_DELAY;
  const timeSinceLastCall = +new Date() - lastFarmCall;
  if (timeSinceLastCall > MAX_DELAY) {
    delay = 0;
  } else { // Initial call
    delay = MAX_DELAY - timeSinceLastCall;
    console.log(`* Will call !farm in ${delay / 1000} seconds.`);
  }
  
  timeout = setTimeout(() => {
    const ts = +new Date();
    try {
      client.say(process.env.TWITCH_CHANNEL, '!farm');
    } catch(e) {
      
    }
    
    lastFarmCall = ts;
    saveTimestamp(ts);

    timeout = setTimeout(farm, MAX_DELAY);
  }, delay);
}

async function loadTimestamp() {
  try {
    const lastFarmTimestampFile = await fs.readFile(LAST_TIMESTAMP_PATH, 'utf8');
    const lastFarmTimestamp = JSON.parse(lastFarmTimestampFile);
    console.log(`* Loaded saved !farm timestamp (${lastFarmTimestamp.timestamp}).`);
    return lastFarmTimestamp.timestamp;
  } catch {
    console.log(`* No saved !farm timestamp found. Using current timestamp.`);
    const ts = 0;
    await saveTimestamp(ts);
    return ts;
  }
}

async function saveTimestamp(timestamp) {
  try {
    await fs.writeFile(LAST_TIMESTAMP_PATH, JSON.stringify({ timestamp }), 'utf8');
    console.log(`* Saved !farm timestamp (${timestamp}).`);
  } catch(e) {
    console.error(e);
  }
}
