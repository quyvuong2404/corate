var r = require('rethinkdb');
var quotes = require('../model/quotes');
var users = require('../model/users');
var userQuote = require('../model/user_quote');
var auth = require('../lib/auth');

module.exports = function(app, passport) {

	app.post('/api/create', function(req, res) {
		// Website are allowed to connect
	    res.setHeader('Access-Control-Allow-Origin', '*');

	    // Request methods are allowed
	    res.setHeader('Access-Control-Allow-Methods', 'POST');

	    // Request headers are allowed
	    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

		var id = req.body.id;

		users.getUserByField('id', id).then(function(_users){
			if (_users.length > 0) {
				var u = _users[0];
				var data = {
					text: req.body.text,
					webtitle: req.body.title,
					weburl: req.body.url,
					created_at: r.now()
				};
				quotes.create(data).then(function(result){
					if (result.inserted == 1) {
						var data = {
							idU: u.id,
							idQ: result.generated_keys[0]
						};
						userQuote.insert(data).then(function(result){
							if (result.inserted == 1) {
								console.log('insert success');
								res.json({error: 0, id: data.idQ});
							}
						});
					}
				});
			} else {
				res.json({error: 1});
			}
		});
	});

	app.post('/api/on', function(req, res){
		// Website are allowed to connect
	    res.setHeader('Access-Control-Allow-Origin', '*');

	    // Request methods are allowed
	    res.setHeader('Access-Control-Allow-Methods', 'POST');

	    // Request headers are allowed
	    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	    var idU = req.user.id;
	    var url = req.body.url;

	    quotes.getQuotesByUrl(url, idU).then(function(_quotes){
	    	var response;
	    	if (_quotes.length > 0) {
	    		var quoteText = [];
	    		for (var i = 0; i < _quotes.length; i++) {
	    			quoteText.push({'id': _quotes[i].id, 'text': _quotes[i].text});
	    		}
	    		response = {
	    			'found': 1,
	    			'text': quoteText
	    		};
	    	} else {
	    		response = {
	    			'found': 0
	    		};
	    	}
	    	res.json(response);
	    });
	});

	app.post('/api/delete', function(req, res){
		// Websites are allowed to connect
		res.setHeader('Access-Control-Allow-Origin', '*');
		// Request methods are allowed
		res.setHeader('Access-Control-Allow-Methods', 'POST');
		// Request headers are allowed
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

		var idQ = req.body.idQ;
		quotes.delete(idQ).then(function(result){
			res.json({'deleted': result.deleted});
		});
	});
	
}