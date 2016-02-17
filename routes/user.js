var quotes = require('../model/quotes');
var auth = require('../lib/auth');

module.exports = function(app, passport) {

	app.get('/login', function(req, res) {
		if (req.user) {
			res.redirect('/dashboard');
		}
		res.render('login');
	});

	app.get('/auth/google', passport.authenticate('google', {
		scope: ['profile','email']
	}));

	app.get('/auth/google/callback', passport.authenticate('google', {
		failureRedirect: '/'
	}), function(req, res) {console.log(req.user.token);
		res.cookie('corateToken', req.user.token, {maxAge: 60*60*24*7, httpOnly: true});
		res.redirect('/dashboard');
	});

	app.get('/dashboard', auth.isLoggedIn, function(req, res) {
		quotes.findAllByUser(req.user.id).then(function(result){
			res.render('dashboard', {
				list: result,
				user: req.user
			});
		});
	});

	app.get('/logout', function(req, res) {
		res.clearCookie('corateToken');
		req.logout();
		res.redirect('/');
	});

	app.post('/api/oauth', function(req, res){
		// websites are allowed to connect
		res.setHeader('Access-Control-Allow-Origin', '*');
		// Request methods are allowed
		res.setHeader('Access-Control-Allow-Methods', 'POST');
		// Request headers are allowed
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

		if(req.user) {
			var result = req.user;
			result.authenticated = 1;
			res.json(result);
		} else {
			res.json({authenticated: 0});
		}
	});
}