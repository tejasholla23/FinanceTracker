const NodeCache = require("node-cache");

// Set TTL to 10 minutes (600 seconds)
// stdTTL is the default time to live, checkperiod is the interval to check for expired keys
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

module.exports = cache;
