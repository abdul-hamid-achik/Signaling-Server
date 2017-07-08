require("neon");
var uuidV4 = require('uuid/v4');

Class('Kafka')({
	connections: [],
	bootstrap: function bootstrap(io) {
		this.io = io;
		this.io.on('connection', function(socket) {
		    socket.emit('open', {
		      id: socket.id
		    });

		    socket.on('ready', this.ready.bind(this, socket))

		    socket.on('disconnect', this.disconnect.bind(this, socket));

		    socket.on('send', function(message) {
		        socket.broadcast.to(message.room).emit('message', {
		            message: message.data.message,
		            author: message.data.author
		        });
		    });

		    socket.on('callOffer', this.callOffer.bind(this, socket));
		    socket.on('signal', this.signal.bind(this, socket));

		    socket.on('chat message', function(msg){
		      this.io.emit('chat message', msg);
		    }.bind(this));

		}.bind(this));
	},

	ready: function ready(socket, message) {
        socket.join("notifications");
        socket.broadcast.to("notifications").emit('announce', {
            message: 'New client in the ' + message.user.nickname + ' room.',
            type: "user:connected",
            user: message.user
        });
    },

	disconnect: function disconnect (socket, message) {
    	socket.broadcast.to("notifications").emit('announce', {
    		type: 'user:disconnected',
    		user: message.user || { peer_id: message.peer_id }
    	});
	}, 

	callOffer: function callOffer (socket, message) {
    	this.io.to(message.peer_id).emit('announce', {
    		type: "user:calling",
    		user: message.user,
    		peer_id: message.peer_id,
    		message: message.message,
    		room: message.room
    	})


    	this.io.to(message.peer_id).emit('signaling_message', {
            type: message.type,
            message: message
	    });
		    
	},

	signal: function signal(socket, message) {
		console.log("ROOM SHOULD BE HERE")
    	if (message.response) {
    		var room = message.data.user.peer_id;
	    	// socket.join(room);
	        this.io.to(room).emit('signaling_message', {
	            type: "user_here",
	            message: message.data.message,
	            user: message.data.message.user,
	            peer_id: message.data.peer_id
	        });
	        console.log(message.data.message)
    	} else {			    	
    		// socket.join(message.room);
	        //Note the use of req here for broadcasting so only the sender doesn't receive their own messages
	        this.io.to(message.room).emit('signaling_message', {
	            type: message.type,
	            message: message.message,
	            user: message.user
	        });
	        console.log(message.message)
    	}
	}
});

module.exports = Kafka;