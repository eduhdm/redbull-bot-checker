const http = require('http');
const fetch = require('node-fetch');
const redis = require('redis');
const moment = require('moment');

const client = redis.createClient();

const hostname = '127.0.0.1';
const port = 3001;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

client.on('connect', function() {
  console.log('Redis client connected');
});

client.on('error', function (err) {
  console.log('Something went wrong ' + err);
});

server.listen(port, hostname, async () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  client.keys('*', (err, keys) => {
    if (err) return console.log(err);

    for(var i = 0, len = keys.length; i < len; i++) {
      console.log(keys[i]);
    }
  });
});