const serverless = require('serverless-http');
const app = require('../../server'); // make sure this points to your main Express file (server.js)

module.exports.handler = serverless(app);
