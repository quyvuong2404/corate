var r = require('rethinkdb');
var quotes = require('../model/quotes');
var users = require('../model/users');
var userQuote = require('../model/user_quote');
var article = require('../model/articles');
var auth = require('../lib/auth');
var alchemyActions = require('../watson-api/alchemy-action');
var auth = require('../lib/auth');

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
						var data = {
							idU: u.id,
							idQ: idQuote
						};
						userQuote.insert(data).then(function(result){
							if (result.inserted == 1) {
								console.log('insert into user_quote successfully');
							}
						});

						article.getArticleByUrl(url).then(function(_articles){
							if (_articles.length === 0) {
								var articleData = {
									url: url
								}
								article.insert(articleData).then(function(result){
									if (result.inserted == 1) {
										console.log('insert into article successfully');
										var idArticle = result.generated_keys[0];
										quotes.update(idQuote, {'idArticle': idArticle}).then(function(result){
											console.log('quote update', result);
										});
										
										alchemyActions.keywords(url, function(result){
											var keywords = result.keywords;
											var keywordsData = keywords.map(function(keyword){
												return {
													'relevance': keyword.relevance, 
													'text': keyword.text
												};
											});
											article.update(idArticle, {'keywords': keywordsData}).then(function(result){
												console.log('keywords update');
											});
										});
										
										alchemyActions.taxonomy(url, function(result){
											var taxonomy = result.taxonomy;
											var taxonomyData = taxonomy.filter(function(taxonomy){
												return (taxonomy.score > 0.5);
											}).map(function(taxonomy){
												return {
													'score': taxonomy.score, 
													'label': taxonomy.label
												};
											});
											article.update(idArticle, {'taxonomy': taxonomyData}).then(function(result){
												console.log('taxonomy update');
											});
										});
										
										alchemyActions.concepts(url, function(result){
											var concepts = result.concepts;
											var conceptsData = concepts.map(function(concept){
												return {
													'relevance': concept.relevance, 
													'text': concept.text
												};
											});
											article.update(idArticle, {'concepts': conceptsData}).then(function(result){
												console.log('concepts update');
											});
										});
					
										alchemyActions.author(url, function(result){
											article.update(idArticle, {'author': result.author}).then(function(result){
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
					} else {
						res.json({error: 1, message: 'can not insert'});
					}
				});
			} else {
				res.json({error: 1, message: 'user not exist'});
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

