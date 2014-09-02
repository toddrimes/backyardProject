/**
 * MainController
 *
 * @description :: Server-side logic for managing Mains
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	'index': function(req, res, next) {
		res.view('homepage.jade');
	},
	'renderIfAuth': function(req, res, next) {
		var url=req.originalUrl;
		res.view(url.split('/')[1]+'.jade');
	},
	'render': function(req, res, next) {
		var url=req.originalUrl;
		res.view(url.split('/')[1]+'.jade');
	}
};

