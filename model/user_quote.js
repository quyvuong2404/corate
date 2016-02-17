var r = require('rethinkdb');
var config = require('../config/database');
var connect = config.connect;
var table = 'user_quote';

var connection = connect.then(function(connection){

	module.exports.insert = function(data) {
		return r.table(table).insert(data).run(connection);
	}

	module.exports.getUserByQuote = function(idQ) {
		return r.table(table).filter(function(user_quote){
			return user_quote('idQ').eq(idQ);
		})('idU').limit(1).run(connection);
	}

	module.exports.getQuotesByUser = function(idU) {
		return r.table(table).filter(function(user_quote){
			return user_quote('idU').eq(idU);
		})('idQ').coerceTo('array').run(connection);
	}

	module.exports.delete = function(idQ) {
		return r.table(table).filter(function(uq){
			return uq('idQ').eq(idQ);
		}).delete().run(connection);
	}
});