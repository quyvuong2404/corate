var r = require('rethinkdb');
var quotes = require('../model/quotes');
var user = require('../model/users');
var auth = require('../lib/auth');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		if (req.user) {
			res.redirect('/dashboard');
		} else {
			/*var token = req.cookies.corateToken;
			if (token === undefined) {
				res.render('index');
			} else {
				user.getUserByField('token', token).then(function(_users){
					if (_users.length > 0) {
						var u = _users[0];
						req.session.user = u;
						res.redirect('/dashboard');
					} else {
						res.render('index');
					}
				});
			}*/
			res.render('index');
		}
	});

}