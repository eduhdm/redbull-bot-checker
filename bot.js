const http = require('http');
const fetch = require('node-fetch');
const redis = require('redis');
const moment = require('moment');

const client = redis.createClient();

const hostname = '127.0.0.1';
const port = 3000;

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

  const password = ''; // INSERT PASSWORD HERE;
  const email = ''; // INSERT EMAIL HERE;
  await fetch(
    "https://uim.redbull.com/uim/api/token",
    {
      "credentials":"include",
      "headers":{
        "accept":"application/vnd.rb.uim-v15+json",
        "application-id":"5b2ce30bd9a0bf285ac70c10",
        "authorization":"Basic NWIyY2UzMGJkOWEwYmYyODVhYzcwYzEwOm5vc2VjcmV0YXZhaWxhYmxl",
        "content-type":"application/x-www-form-urlencoded",
        "sec-fetch-mode":"cors",
        "uim-country":"BR",
        "uim-fallback-language":"en",
        "uim-i18n-fallback-namespace":"main",
        "uim-i18n-namespace":"main",
        "uim-language":"pt",
        "x-uim-correlationid":"2e35d86c-f026-4ee8-a7b2-b3c5c4d1f671"
      },
      "referrer":"https://www.redbull.com/br-pt/projects/red-bull-basement-university/project/1481",
      "referrerPolicy":"no-referrer-when-downgrade",
      "body": `&grant_type=password&scope=openid%20profile&username=${encodeURI(email)}&password=${encodeURI(password)}&nonce=e320ed570e2a70dd38e64451052342e3c46c4805c0c850555d8a1b073a59e246&source=c6suwzfxr`,
      "method":"POST",
      "mode":"cors"
    }
  );


  const url = 'https://addons-redbullbasementuniversity2019.redbull.com//public-api/submissions/?finalists=0&country=br';
  setInterval(() => {
    fetch(url, {"credentials":"omit","headers":{"sec-fetch-mode":"cors"},"referrer":"https://www.redbull.com/br-pt/projects/red-bull-basement-university/projects","referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"})
      .then(async (response) =>  {
        const data = await response.json();

        const processedData = data.submissions
          .map(u => ({ title: u.title, vote_count: u.vote_count }))
          .sort((a,b) => a.vote_count - b.vote_count );

        console.log('Storing votes at: ', moment().toISOString());
        client.set(moment().toISOString(), JSON.stringify(processedData.reverse()), redis.print);
      });
  }, 5 * 60 * 1000);
});