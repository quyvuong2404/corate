var quotes = require('../model/quotes');
var auth = require('../lib/auth');

module.exports = function(app, passport) {

	app.get('/auth/google', passport.authenticate('google', {
		scope: ['profile','email']
	}));

	app.get('/auth/google/callback', passport.authenticate('google', {
		failureRedirect: '/'
	}), function(req, res) {
		// res.cookie('corateToken', req.user.token, {maxAge: 60*60*24*7, httpOnly: true});
		res.redirect('/dashboard');
	});

	app.get('/dashboard', auth.isLoggedIn, function(req, res) {
		quotes.findAllByUser(req.user.id).then(function(result){console.log(result);
			var list = result.map(function(r){
				var now = Date.now();
				var range = (now - r.created_at)/1000;
				var timeShow;
				if (range < 60) {
					timeShow = range + 's';
				} else {
					if (range/86400 < 1) {
						if (range/3600 < 1) {
							if (range/60 < 2) {
								timeShow = Math.floor(range/60) + ' min';
							} else {
								timeShow = Math.floor(range/60) + ' mins';
							}
						} else {
							if (range/3600 < 2) {
								timeShow = Math.floor(range/3600) + ' hour';
							} else {
								timeShow = Math.floor(range/3600) + ' hours';
							}
						}
					} else {
						if (range/86400 < 2) {
								timeShow = Math.floor(range/86400) + ' day';
							} else {
								timeShow = Math.floor(range/86400) + ' days';
							}
					}
				}
				r.created_at = timeShow;
				return r;
			});
			res.render('dashboard', {
				list: list,
				user: req.user
			});
		});
	});

	app.get('/logout', function(req, res) {
		res.clearCookie('corateToken');
		req.logout();
		res.redirect('/');
	});

	app.get('/api/oauth', function(req, res){
		// websites are allowed to connect
		res.setHeader('Access-Control-Allow-Origin', '*');
		// Request methods are allowed
		res.setHeader('Access-Control-Allow-Methods', 'GET');
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