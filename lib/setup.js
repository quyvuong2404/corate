var r = require('rethinkdb');
var config = require('../config/database');
var tables = config.tables;
var cf = config.config;

module.exports.setupdb = function() {
	r.connect({host: cf.host, port: cf.port}, function(err, connection){
		r.dbCreate(cf.db).run(connection, function(err, result){
			if (err) {
				console.log(err.msg);
			}
			for (var tbl in tables ) {
				r.db(cf.db).tableCreate(tables[tbl]).run(connection, function(err, result){
					if (err) {
						console.log(err.msg);
					}
				});
			}
		});
	});
}