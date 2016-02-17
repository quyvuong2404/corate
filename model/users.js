var r = require('rethinkdb');
var config = require('../config/database');
var connect = config.connect;
var table = 'users';

var connection = connect.then(function(connection){

	module.exports.addUser = function(user) {
		return r.table(table).insert(user).run(connection);
	}

	module.exports.updateUser = function(id, data) {
		return r.table(table).get(id).update(data).run(connection).then(function(result){
			return result;
		});
	}

	module.exports.getUserById = function(id) {
		return r.table(table).get(id).run(connection);
	}

	module.exports.getUserByField = function(field, value) {
		return r.table(table).filter(function(user){
			return user(field).eq(value);
		}).run(connection).then(function(cursor){
			return cursor.toArray();
		});
	}

});