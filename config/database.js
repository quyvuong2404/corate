var r = require('rethinkdb');

config = {
    host: process.env.RDB_HOST || 'localhost',
    port: parseInt(process.env.RDB_PORT) || 28015,
    db: process.env.RDB_DB || 'corate'
};
tables = ['quote','users','user_quote','article'];

module.exports.connect = r.connect(config);
module.exports.config = config;
module.exports.tables = tables;