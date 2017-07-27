module.exports = function (db) {
	return {
		requireAuthentication: function (req, res, next) {
			var token = req.get('Auth');
			db.user.findByToken(token).then(function (user) {
				req.user = user;
				next();
			}, function () {
				res.status(401).send();
			});
		},
		loggin: function(req, res, next){
			console.log("Request: " + new Date().toString() + " "+ req.method + " " + req.originalUrl);
			next();
		}
	};

};