var r = require('rethinkdb');
var Promise=require('promise');

var quotes = require('../model/quotes');
var users = require('../model/users');
var userQuote = require('../model/user_quote');
var articles=require('../model/articles');

var auth = require('../lib/auth');

var AlchemyAPI=require('../lib/alchemyapi');
var alchemyapi=new AlchemyAPI();

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
	    		articles.getArticleByField('url',req.body.url).then(
	    			(result)=>{
	    				var quote={
	    					text:req.body.text,
	    					path:req.body.nodePath,
	    					url:req.body.url,
	    					created_at:r.now()
	    				};
	    				var dup=result.length;
	    				quotes.create(quote).then(
	    					(result)=>{
	    						res.json({error:0});
	    						var idQuote=result.generated_keys[0];
	    						if (dup===0){
	    							var output = {};

			    					keywords(req,res,output);

			    					function keywords(req, res, output) {
										alchemyapi.keywords('url', req.body.url, {}, function(response) {
											output['keywords'] = { text:req.body.url, response:JSON.stringify(response,null,4), results:response['keywords'] };
											concepts(req, res, output);
										});
									}


									function concepts(req, res, output) {
										alchemyapi.concepts('url', req.body.url, {}, function(response) {
											output['concepts'] = { text:req.body.url, response:JSON.stringify(response,null,4), results:response['concepts'] };
											author(req, res, output);
										});
									}

									function author(req, res, output) {
										alchemyapi.author('url', req.body.url, {}, function(response) {
											output['author'] = { url:req.body.url, response:JSON.stringify(response,null,4), results:response['author'] };
											taxonomy(req, res, output);
										});
									}

									function taxonomy(req, res, output) {
										alchemyapi.taxonomy('url', req.body.url, {}, function(response) {
											output['taxonomy'] = { url:req.body.url, response:JSON.stringify(response,null,4), results:response['taxonomy'] };
											var article={
												title:req.body.title,
												url:req.body.url,
												keywords:output['keywords'].results,
												taxonomy:output['taxonomy'].results.filter((taxonomy)=>taxonomy.score>0.5),
												concepts:output['concepts'].results,
												author:output['author'].results,
												created_at:r.now()
											};
											articles.addArticle(article).then(
												(result)=>{
													quotes.update(idQuote,{idArticle:result.generated_keys[0]}).then(
														(result)=>{
															userQuote.insert({idUser:u.id,idQuote:idQuote}).then(
																(result)=>console.log('Insert successfully'),
																(error)=>res.json({error:1}));
														},
														(error)=>res.json({error:1}));
												},
												(error)=>res.json({error:1}));
										});
									}
	    						}
	    					},
	    					(error)=>res.json({error:1}));
	    			},
	    			(error)=>res.json({error:1})
	    		);
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

	    var idUser = req.user.id;
	    var url = req.body.url;

	    quotes.getQuotesByUrl(url, idUser).then(function(_quotes){
	    	var response;
	    	if (_quotes.length > 0) {
	    		var quoteText = [];
	    		for (var i = 0; i < _quotes.length; i++) {
	    			quoteText.push({'id': _quotes[i].id, 'text': _quotes[i].text, 'path': _quotes[i].path});
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

		var idQuote = req.body.idQuote;
		quotes.delete(idQuote).then(function(result){
			res.json({'deleted': result.deleted});
		});
	});

}