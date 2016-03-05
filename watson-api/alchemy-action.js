var AlchemyAPI = require('./alchemyapi');

var alchemyapi = new AlchemyAPI();


module.exports.entities = function(url, callback) {
	alchemyapi.entities('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.keywords = function(url, callback) {
	alchemyapi.keywords('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.concepts = function(url, callback) {
	alchemyapi.concepts('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.sentiment = function(url, callback) {
	alchemyapi.sentiment('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.text = function(url, callback) {
	alchemyapi.text('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.author = function(url, callback) {
	alchemyapi.author('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.language = function(url, callback) {
	alchemyapi.language('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.title = function(url, callback) {
	alchemyapi.title('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.relations = function(url, callback) {
	alchemyapi.relations('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.category = function(url, callback) {
	alchemyapi.category('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.feeds = function(url, callback) {
	alchemyapi.feeds('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.microformats = function(url, callback) {
	alchemyapi.microformats('url', url, {}, function(response) {
		callback(response);
	});
}


module.exports.taxonomy = function(url, callback) {
	alchemyapi.taxonomy('url', url, {}, function(response) {
		callback(response);
	});
}

module.exports.combined = function(url, callback) {
	alchemyapi.combined('url', url, {}, function(response) {
		callback(response);
	});
}

module.exports.image = function(url, callback) {
	alchemyapi.image('url', url, {}, function(response) {
		callback(response);
	});
}

module.exports.image_keywords = function(url, callback) {
	alchemyapi.image_keywords('url', url, {}, function(response) {
		callback(response);
	});
}