var auth = {};

auth.isLoggedIn = function(req, res, next) {
	// if user is authenticated
	if (req.isAuthenticated()) {
		return next();
	}

	// if not
	res.redirect('/');
}


module.exports = auth;