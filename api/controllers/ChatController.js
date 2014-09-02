module.exports = {

	// Send a private message from one user to another
	private: function(req, res) {
		if(req.user.id == req.param('from'))
			User.message(req.param('to'), {from: req.user, to:req.param('to'), msg: req.param('msg')});


	},

	// Post a message in a public chat room
	public: function(req, res) {
		Room.message(req.param('room'), {room:{id:req.param('room')}, from: req.user, msg: req.param('msg')}, req.socket);

	}

};