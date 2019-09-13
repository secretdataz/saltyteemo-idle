const tmi = require('tmi.js');
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

const client = new tmi.client(opts);

client.on('connected', connectedHandler);
client.on('disconnected', disconnectedHandler);

client.connect().then(() => {
  console.log(`* Connection success.`);
}).catch(() => {
  console.log(`* Connection failed.`);
});

function connectedHandler(addr, port) {
  console.log(`* Connected to Twitch chat on ${addr}:${port}.`);
}

function disconnectedHandler(reason) {
  console.log(`* Disconnected from Twitch chat due to ${reason}`);
}
