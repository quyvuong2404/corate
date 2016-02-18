var r = require('rethinkdb');
var config = require('../config/database');
var connect = config.connect;
var handleError = require('../routes/error');
var table = 'quote';
var userQuote = require('./user_quote');

var connection = connect.then(function(connection){

	module.exports.findAllByUser = function(idU){
		return userQuote.getQuotesByUser(idU).then(function(idQs){
			if (idQs.length > 0) {
				return r.table(table).getAll(r.args(idQs)).orderBy(r.desc('created_at')).run(connection).then(function(result){
					return result.toArray();
				});
			} else {
				return [];
			}
		});
	}

	module.exports.create = function(data){
		return r.table(table).insert(data).run(connection).then(function(result){
			return result;
		});
	}

	module.exports.update = function(data) {
		return r.table(table).update(data).run(connection);
	}

	module.exports.delete = function(id) {
		return userQuote.delete(id).then(function(result){
			return r.table(table).get(id).delete().run(connection);
		});
	}

	module.exports.getQuotesByUrl = function(url, idU) {
		return userQuote.getQuotesByUser(idU).then(function(_idQs){
			if (_idQs.length > 0) {
				return r.table(table).getAll(r.args(_idQs)).filter(function(quote){
					return quote('weburl').match(url);
				}).run(connection).then(function(cursor){
					return cursor.toArray();
				});
			} else {
				return [];
			}
		});
	}

	module.exports.filterQuotes = function(data) {
		return r.table(table).filter(data).run(connection);
	}
});