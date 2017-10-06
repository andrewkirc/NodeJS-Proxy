//Node Modules
const https = require('https');
const http = require('http');
const fs = require('fs');

//Other Modules
const querystring = require('querystring');
const httpProxy = require('http-proxy');
const config = require('./config.json');
const proxy = httpProxy.createProxyServer({secure: false});
const apiKey = new Buffer(config.apiKey).toString('base64'); //Convert apiKey to Base64.

//Is secureProxy enabled? If not, don't use API ID/Key.
if (config.secureProxy) {
    proxy.on('proxyReq', function (proxyReq, req, res, options) {
        proxyReq.setHeader('Authorization', `Basic ${apiKey}`);
    });
}

//Is HTTPS enabled? If not, use HTTP.
let server;
if (config.https) {
    const options = {
        key: fs.readFileSync('./certs/privatekey.pem'),
        cert: fs.readFileSync('./certs/cert.pem')
    };
    server = https.createServer(options, serverCallback);
} else {
    server = http.createServer(serverCallback);
}


function serverCallback(req, res) {
    let qs = querystring.parse(req.url);

    if ((config.secureProxy === true) && (qs.proxyKey !== config.proxyKey)) {
        console.log(`Proxy Key is Incorrect!`);
        res.writeHeader(401);
        res.write(`Error: You are not authorized!`);
        res.end();
    } else {
        console.log(`${config.proxyTarget}${req.url}`);
        proxy.web(req, res, {
            target: config.proxyTarget
        });
    }
}

console.log(`Listening on port ${config.listenPort}...`);
server.listen(config.listenPort);