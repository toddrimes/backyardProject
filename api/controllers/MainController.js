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
	'about': function(req, res, next) {
		res.view('about.jade');
	},
	'chat': function(req, res, next) {
		res.view('chat.jade');
	},
	'test': function(req, res, next) {
		res.view('test.jade');
	}
};

