var r = require('rethinkdb');

var quotes = require('../model/quotes');
var users = require('../model/users');
var userQuote = require('../model/user_quote');
var article = require('../model/articles');

var auth = require('../lib/auth');
var alchemyActions = require('../watson-api/alchemy-action');

module.exports = function(app, passport) {

	app.post('/api/create', auth.isLoggedIn, function(req, res) {
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
				var url = req.body.url;
				var data = {
					text: req.body.text,
					webtitle: req.body.title,
					weburl: url,
					path: req.body.nodePath,
					htmltext: req.body.htmltext,
					created_at: r.now()
				};
				quotes.create(data).then(function(result){
					if (result.inserted == 1) {
						console.log('insert into quotes successfully');
						var idQuote = result.generated_keys[0];
						res.json({error: 0, id: idQuote});
						userQuote.insert({idU:u.id,idQ:idQuote}).then(function(result){
							if (result.inserted == 1) {
								console.log('insert into user_quote successfully');
							}
						});

						article.getArticleByUrl(url).then(function(_articles){
							if (_articles.length === 0) {
								article.insert({url:url}).then(function(result){
									if (result.inserted == 1) {
										console.log('insert into article successfully');
										var idArticle = result.generated_keys[0];
										quotes.update(idQuote, {'idArticle': idArticle}).then(function(result){
											console.log('quote update', result);
										});
										
										alchemyActions.keywords(url, function(result){
											article.update(idArticle, {'keywords': result.keywords})
												.then(function(result){
													console.log('keywords update');
												});
										});
										
										alchemyActions.taxonomy(url, function(result){
											article.update(idArticle, {'taxonomy': result.taxonomy.filter((taxonomy)=>taxonomy.score>0.5)})
												.then(function(result){
													console.log('taxonomy update');
												});
										});
										
										alchemyActions.concepts(url, function(result){
											article.update(idArticle, {'concepts': result.concepts})
												.then(function(result){
													console.log('concepts update');
												});
										});
					
										alchemyActions.author(url, function(result){
											article.update(idArticle, {'author': result.author})
												.then(function(result){
													console.log('author update');
												});
										});
									}
								});
							} else {
								quotes.update(idQuote, {'idArticle': _articles[0].id}).then(function(result){
									console.log('quote update', result);
								});
							}
						});
					}
				});
			} else {
				res.json({error: 1});
			}
		});
	});

	app.post('/api/on', auth.isLoggedIn, function(req, res){
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
	    		var quoteText = _quotes.map((_quote) => ({
	    			'id': _quote.id, 
	    			'text': _quote.htmltext, 
	    			'path': _quote.path
	    		}));
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

	app.post('/api/delete', auth.isLoggedIn, function(req, res){
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
