var r = require('rethinkdb');
var config = require('../config/database');
var connect = config.connect;
var table = 'user_quote';

var connection = connect.then(function(connection){

	module.exports.insert = function(data) {
		return r.table(table).insert(data).run(connection);
	}

	module.exports.getUserByQuote = function(idQuote) {
		return r.table(table).filter(function(user_quote){
			return user_quote('idQuote').eq(idQuote);
		})('idUser').limit(1).run(connection);
	}

	module.exports.getQuotesByUser = function(idUser) {
		return r.table(table).filter(function(user_quote){
			return user_quote('idUser').eq(idUser);
		})('idQuote').coerceTo('array').run(connection);
	}

	module.exports.delete = function(idQuote) {
		return r.table(table).filter(function(uq){
			return uq('idQuote').eq(idQuote);
		}).delete().run(connection);
	}
});