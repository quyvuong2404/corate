var r = require('rethinkdb');
var config = require('../config/database');
var connect = config.connect;
var table = 'article';

var connection = connect.then(function(connection){

	module.exports.insert = function(data) {
		return r.table(table).insert(data).run(connection);
	}

	module.exports.getArticleByUrl = function(url) {
		return r.table(table).filter(function(article){
			return article('url').eq(url);
		}).run(connection).then(function(cursor){
			return cursor.toArray();
		});
	}

	module.exports.update = function(id, data) {
		return r.table(table).get(id).update(data).run(connection);
	}
});