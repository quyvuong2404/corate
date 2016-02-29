var r = require('rethinkdb');
var config = require('../config/database');
var connect = config.connect;
var table = 'article';

var connection = connect.then(function(connection){

	module.exports.addArticle = function(article) {
		return r.table(table).insert(article).run(connection);
	}

	module.exports.updateArticle = function(id, data) {
		return r.table(table).get(id).update(data).run(connection).then(function(result){
			return result;
		});
	}

	module.exports.getArticleById = function(id) {
		return r.table(table).get(id).run(connection);
	}

	module.exports.getArticleByField = function(field, value) {
		return r.table(table).filter(function(article){
			return article(field).eq(value);
		}).run(connection).then(function(cursor){
			return cursor.toArray();
		});
	}

});