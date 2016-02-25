var quotes = require('../model/quotes');
var user = require('../model/users');
var auth = require('../lib/auth');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		if (req.user) {
			res.redirect('/dashboard');
		} else {
			res.render('index');
		}
	});

}