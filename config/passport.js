var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./auth');
var user = require('../model/users');

module.exports = function(passport) {

	// ==================================================
	// passport session setup ===========================
	// ==================================================
	// required for persistent login sessions
	// passport needs anility to serialize and unseriazlie users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done){
		user.getUserById(id).then(function(user){
			done(null, user);
		});
	});


	// =======================================================
	// GOOLGE LOGIN ==========================================
	// =======================================================
	passport.use(new GoogleStrategy({
		clientID: configAuth.googleAuth.clientID,
		clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL
	},
	function(token, refreshToken, profile, done){
		process.nextTick(function(){
			user.getUserByField('email', profile.emails[0].value).then(function(_users){
				if (_users.length > 0) {
					var u = _users[0];
					
					u.avatar = profile.photos[0].value;
					u.token = token;
					u.name = profile.displayName;
					user.updateUser(u.id, u);
					return done(null, u);
				}
				var newUser = {
					type: 'google',
					name: profile.displayName || null,
					avatar: profile.photos[0].value || null,
					token: token,
					email: profile.emails[0].value
				}
				return user.addUser(newUser).then(function(response){
					return user.getUserById(response.generated_keys[0]);
				}).then(function(newuser){
					done(null, newuser);
				});
			});
		});
	}));

	// =======================================================
	// GOOLGE LOGIN ==========================================
	// =======================================================
	// passport.use('local-token');
}