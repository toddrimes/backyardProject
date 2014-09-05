/**
 * AdminController
 *
 * @description :: Server-side logic for managing Admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	'render': function(req, res, next) {
		var url=req.originalUrl;
		res.view(url.split('/')[1]+'.jade');
	}
};

