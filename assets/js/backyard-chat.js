/***************Chat ::: in progress**********************/




// Attach a listener which fires when a connection is established:
io.socket.on('connect', function socketConnected() {

    // Show the main UI
    $('#disconnect').hide();
    $('#main').show();

    // Once we have a connected socket, start listening for other events.

    // Listen for the "hello" event from the server, which will provide us
    // with information about our user (data.me). Open the /config/sockets.js
    // file to see where the "hello" event is emitted.
    io.socket.on('hello', function(data) {
      window.me = data;
      updateMyName(data);
    });

    // Listen for the "room" event, which will be broadcast when something
    // happens to a room we're subscribed to.  See the "autosubscribe" attribute
    // of the Room model to see which messages will be broadcast by default
    // to subscribed sockets.
    io.socket.on('room', function messageReceived(message) {

      switch (message.verb) {

        // Handle room creation
        case 'created':
          addRoom(message.data);
          break;

        // Handle a user joining a room
        case 'addedTo':
          // Post a message in the room
          postStatusMessage('room-messages-'+message.id, $('#user-'+message.addedId).text()+' has joined');
          // Update the room user count
          increaseRoomCount(message.id);
          break;

        // Handle a user leaving a room
        case 'removedFrom':
          // Post a message in the room
          postStatusMessage('room-messages-'+message.id, $('#user-'+message.removedId).text()+' has left');
          // Update the room user count
          decreaseRoomCount(message.id);
          break;

        // Handle a room being destroyed
        case 'destroyed':
          removeRoom(message.id);
          break;

        // Handle a public message in a room.  Only sockets subscribed to the "message" context of a
        // Room instance will get this message--see the "join" and "leave" methods of RoomController.js
        // to see where a socket gets subscribed to a Room instance's "message" context.
        case 'messaged':
          receiveRoomMessage(message.data);

        default:
          break;

      }

    });

    // Listen for the "user" event, which will be broadcast when something
    // happens to a user we're subscribed to.  See the "autosubscribe" attribute
    // of the User model to see which messages will be broadcast by default
    // to subscribed sockets.
    io.socket.on('user', function messageReceived(message) {

      switch (message.verb) {

        // Handle user creation
        case 'created':
          addUser(message.data);
          break;

        // Handle a user changing their name
        case 'updated':

          // Get the user's old name by finding the <option> in the list with their ID
          // and getting its text.
          var oldName = $('#user-'+message.id).text();

          // Update the name in the user select list
          $('#user-'+message.id).text(message.data.name);

          // If we have a private convo with them, update the name there and post a status message in the chat.
          if ($('#private-username-'+message.id).length) {
            $('#private-username-'+message.id).html(message.data.name);
            postStatusMessage('private-messages-'+message.id,oldName+' has changed their name to '+message.data.name);
          }

          break;

        // Handle user destruction
        case 'destroyed':
          removeUser(message.id);
          break;

        // Handle private messages.  Only sockets subscribed to the "message" context of a
        // User instance will get this message--see the onConnect logic in config/sockets.js
        // to see where a new user gets subscribed to their own "message" context
        case 'messaged':
          receivePrivateMessage(message.data);
          break;

        default:
          break;
      }

    });

    // Get the current list of users online.  This will also subscribe us to
    // update and destroy events for the individual users.
    io.socket.get('/user', updateUserList);

    // Get the current list of chat rooms. This will also subscribe us to
    // update and destroy events for the individual rooms.
    io.socket.get('/room', updateRoomList);

    // Add a click handler for the "Update name" button, allowing the user to update their name.
    // updateName() is defined in user.js.
    $('#update-name').click(updateName);

    // Add a click handler for the "Send private message" button
    // startPrivateConversation() is defined in private_message.js.
    $('#private-msg-button').click(startPrivateConversation);

    // Add a click handler for the "Join room" button
    // joinRoom() is defined in public_message.js.
    $('#join-room').click(joinRoom);

    // Add a click handler for the "New room" button
    // newRoom() is defined in room.js.
    $('#new-room').click(newRoom);

    console.log('Socket is now connected!');

    // When the socket disconnects, hide the UI until we reconnect.
    io.socket.on('disconnect', function() {
      // Hide the main UI
      $('#main').hide();
      $('#disconnect').show();
    });

});



/*Room.js*/
// Add a new room to the list
function newRoom() {

  // Prompt the user for the name of the new room
  var roomName = prompt('Please enter a name for the new room');

  // As long as a name is entered, create the new room.
  if (roomName) {
    io.socket.post('/room', {name: roomName}, function(data) {

      // Add the new room to the rooms list
      addRoom(data);

      // Select it in the list
      $('#rooms-list').val(data.id);

      // Create the room HTML
      createPublicRoom({id:data.id, name:data.name});

      // Join the room
      io.socket.post('/room/'+data.id+'/users', {id: window.me.id});

      // Set the room user count to 1
      increaseRoomCount(data.id);

    });
  }

}

// Add a room to the list of available rooms to join--this can happen
// via newRoom (if the user created the room themself) or after a notification
// from the server that another user added a room.
function addRoom(room) {

  // Get a handle to the room list <select> element
  var select = $('#rooms-list');

  // Create a new <option> for the <select> with the new room's information
  var users = room.users || [];
  var numUsers = users.length;
  var option = $('<option id="'+"room-"+room.id+'" data-name="'+room.name+'" data-users="'+numUsers+'" value="'+room.id+'">'+room.name+' ('+numUsers+')</option>');

  // Add the new <option> element
  select.append(option);
}

function increaseRoomCount(roomId) {
  var room = $('#room-'+roomId);
  var numUsers = parseInt(room.attr('data-users'), 10);
  numUsers++;
  room.attr('data-users', numUsers);
  room.html(room.attr('data-name')+' ('+numUsers+')');
}

function decreaseRoomCount(roomId) {
  var room = $('#room-'+roomId);
  var numUsers = parseInt(room.attr('data-users'), 10);
  numUsers--;
  room.attr('data-users', numUsers);
  room.html(room.attr('data-name')+' ('+numUsers+')');
}

// Remove a user from the list of available rooms to join, by sending
// either a room object or a room ID.
function removeRoom(room) {

  // Get the room's ID
  var id = room.id || room;
  $('#room-'+id).remove();
}

// Add multiple rooms to the rooms list.
function updateRoomList(rooms) {
  rooms.forEach(function(room) {
    addRoom(room);
  });
}

/*User.js*/
// Update the value in the user name input.
function updateMyName(me) {
  $('#my-name').val(me.username == 'unknown' ? 'User #' + window.me.id : window.me.username);
}

// Update the current user's username
function updateName() {
  // Use the Sails blueprint action to update the user
  io.socket.put('/user/'+window.me.id, {username: $('#my-name').val()});
}

// Add a user to the list of available users to chat with
function addUser(user) {

  // Get a handle to the user list <select> element
  var select = $('#users-list');

  // Create a new <option> for the <select> with the new user's information
  var option = $('<option id="'+"user-"+user.id+'" value="'+user.id+'">'+(user.username == "unknown" ? "User #" + user.id : user.username)+'</option>');

  // Add the new <option> element
  select.append(option);
}

// Remove a user from the list of available users to chat with, by sending
// either a user object or a user ID.
function removeUser(user) {

  // Get the user's ID.
  var id = user.id || user;

  var userName = $('#user-'+id).text();

  // Remove the corresponding element from the users list
  var userEl = $('#user-'+id).remove();

  // Re-append it to the body as a hidden element, so we can still
  // get the user's name if we need it for other messages.
  // A silly hack for a silly app.
  userEl.css('display', 'none');
  $('body').append(userEl);

  // Post a user status message if we're in a private convo
  if ($('#private-room-'+id).length) {
    postStatusMessage('private-messages-'+id, userName + ' has disconnected.');
    $('#private-message-'+id).remove();
    $('#private-button-'+id).remove();
  }

}

// Add multiple users to the users list.
function updateUserList(users) {
  users.forEach(function(user) {
    if (user.id == window.me.id) {return;}
    addUser(user);
  });
}

/*Utils.js*/
// Post status message to a public or private room
function postStatusMessage(roomName, message) {

  var div = $('<div style="text-align: center">----- '+message+' -----</div>');
  $('#'+roomName).append(div);

}


/*PrivateMessage.js*/

// Start a private conversation with another user
function startPrivateConversation() {

  // Get the user list
  var select = $('#users-list');

  // Make sure a user is selected in the list
  if (select.val() === null) {
    return alert('Please select a user to send a private message to.');
  }

  // Get the recipient's name from the text of the option in the <select>
  var recipientName = $('option:selected', select).text();
  var recipientId = select.val();

  // Prompt for a message to send
  var message = prompt("Enter a message to send to "+recipientName);

  // Create the UI for the room if it doesn't exist
  createPrivateConversationRoom({name:recipientName, id:recipientId});

  // Add the message to the room
  addMessageToConversation(window.me.id, recipientId, message);

  // Send the private message
  io.socket.post('/chat/private', {to:recipientId, msg: message});

}

// Create the HTML to hold a private conversation between two users
function createPrivateConversationRoom(penPal) {

  // Get the ID of the HTML element for this private convo, if there is one
  var roomName = 'private-room-'+penPal.id;

  // If HTML for the room already exists, return.
  if ($('#'+roomName).length) {
    return;
  }

  var penPalName = penPal.username == "unknown" ? ("User #"+penPal.id) : penPal.username;

  // Create a new div to contain the room
  var roomDiv = $('<div id="'+roomName+'"></div>');

  // Create the HTML for the room
  var roomHTML = '<h2>Private conversation with <span id="private-username-'+penPal.id+'">'+penPalName+'</span></h2>\n' +
                 '<div id="private-messages-'+penPal.id+'" style="width: 50%; height: 150px; overflow: auto; border: solid 1px #666; padding: 5px; margin: 5px"></div>'+
                 '<input id="private-message-'+penPal.id+'"/> <button id="private-button-'+penPal.id+'">Send message</button">';

  roomDiv.html(roomHTML);

  // Add the room to the private conversation area
  $('#convos').append(roomDiv);

  // Hook up the "send message" button
  $('#private-button-'+penPal.id).click(onClickSendPrivateMessage);

}

// Callback for when the user clicks the "Send message" button in a private conversation
function onClickSendPrivateMessage(e) {

  // Get the button that was pressed
  var button = e.currentTarget;

  // Get the ID of the user we want to send to
  var recipientId = button.id.split('-')[2];

  // Get the message to send
  var message = $('#private-message-'+recipientId).val();
  $('#private-message-'+recipientId).val("");

  // Add this message to the room
  addMessageToConversation(window.me.id, recipientId, message);

  // Send the message
  io.socket.post('/chat/private', {to: recipientId, msg: message});

}

// Add HTML for a new message in a private conversation
function addMessageToConversation(senderId, recipientId, message) {

  var fromMe = senderId == window.me.id;
  var roomName = 'private-messages-' + (senderId);
  var senderName = $('#private-username-'+senderId).html();
  var justify = 'left';

  var div = $('<div style="text-align:'+justify+'"></div>');
  div.html('<strong>'+senderName+'</strong>: '+message);
  $('#'+roomName).append(div);

}

// Handle an incoming private message from the server.
function receivePrivateMessage(data) {

  var sender = data.from;

  // Create a room for this message if one doesn't exist
  createPrivateConversationRoom(sender);

  // Add a message to the room
  addMessageToConversation(sender.id, window.me.id, data.msg);

}

/*PublicMessage.js*/

// Create the HTML to hold a public, multi-user chat room
function createPublicRoom(room) {

  // Get the ID of the HTML element for this public room, if there is one
  var roomName = 'public-room-'+room.id;

  // If HTML for the room already exists, return.
  if ($('#'+roomName).length) {
    return;
  }

  // Create a new div to contain the room
  var roomDiv = $('<div id="'+roomName+'"></div>');

  // Create the HTML for the room
  var roomHTML = '<h2>Chat room &ldquo;'+room.name+'&rdquo; <button id="leave-room-button-'+room.id+'">Leave Room</button></h2>\n' +
                 '<div id="room-messages-'+room.id+'" style="width: 50%; height: 150px; overflow: auto; border: solid 1px #666; padding: 5px; margin: 5px"></div>'+
                 '<input id="room-message-'+room.id+'"/> <button id="room-button-'+room.id+'">Send message</button">';

  roomDiv.html(roomHTML);

  // Add the room to the private conversation area
  $('#rooms').append(roomDiv);

  // Hook up the "send message" button
  $('#room-button-'+room.id).click(onClickSendPublicMessage);

  // Hook up the "leave room" button
  $('#leave-room-button-'+room.id).click(onClickLeaveRoom);

}

// Callback for when the user clicks the "Send message" button in a public room
function onClickSendPublicMessage(e) {

  // Get the button that was pressed
  var button = e.currentTarget;

  // Get the ID of the user we want to send to
  var roomId = button.id.split('-')[2];

  // Get the message to send
  var message = $('#room-message-'+roomId).val();
  $('#room-message-'+roomId).val("");

  // Add this message to the room
  addMessageToChatRoom(window.me.id, roomId, message);

  // Send the message
  io.socket.post('/chat/public', {room: roomId, msg: message});

}

// Add HTML for a new message in a public room
function addMessageToChatRoom(senderId, roomId, message) {

  var roomName = 'room-messages-' + roomId;

  if (senderId === 0) {
    return postStatusMessage(roomName, message);
  }

  var fromMe = senderId == window.me.id;
  var senderName = $('#user-'+senderId).text();
  var justify = 'left';

  var div = $('<div style="text-align:'+justify+'"></div>');
  div.html('<strong>'+senderName+'</strong>: '+message);
  $('#'+roomName).append(div);

}

// Handle an incoming public message from the server.
function receiveRoomMessage(data) {

  var sender = data.from;
  var room = data.room;

  // Create a room for this message if one doesn't exist
  createPublicRoom(room);

  // Add a message to the room
  addMessageToChatRoom(sender.id, room.id, data.msg);

}

// Join the room currently selected in the list
function joinRoom() {

  // Get the room list
  var select = $('#rooms-list');

  // Make sure a room is selected in the list
  if (select.val() === null) {
    return alert('Please select a room to join.');
  }

  // Get the room's name from the text of the option in the <select>
  var roomName = $('option:selected', select).attr('data-name');
  var roomId = select.val();

  // Create the room HTML
  createPublicRoom({id:roomId, name:roomName});

  // Join the room
  io.socket.post('/room/'+roomId+'/users', {id: window.me.id});

  // Update the room user count
  increaseRoomCount(roomId);

}

// Handle the user clicking the "Leave Room" button for a public room
function onClickLeaveRoom(e) {

  // Get the button that was pressed
  var button = e.currentTarget;

  // Get the ID of the user we want to send to
  var roomId = button.id.split('-')[3];

  // Remove the room from the page
  $('#public-room-'+roomId).remove();

  // Call the server to leave the room
  io.socket.delete('/room/'+roomId+'/users', {id: window.me.id});

  // Update the room user count
  decreaseRoomCount(roomId);

}