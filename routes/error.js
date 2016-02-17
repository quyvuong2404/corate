module.exports.handleError = function(res, error) {
	res.send(500, {error: error.message});
}