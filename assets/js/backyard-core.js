/*
- Start update list clients. Visible at the test page if connected
*/
io.socket.on('connect', function () {
    io.socket.on('usersAuthList', function(usersConnected) {
      io.socket.get('/user', function(users){
        showUsersWithConnexionState(usersConnected, users);
      });
    });
    
});

function showUsersWithConnexionState(userConnected, users){
    $('#usersListConnected').html('');
    users.forEach(function(user) {
        if(user != null){
          var isConnected = _.find(userConnected, function(userC){ 
              if(userC == null) return false;
              return userC.id==user.id; 
          });
          showUser(user, isConnected);
        }
    });
}
function showUser(user, isConnected){
    $('#usersListConnected').append($('<p class="alert '+(isConnected?'alert-info':'alert-warning')+'">'+user.username+(isConnected?' <b>(en ligne)</b>':' <b>(hor ligne)</b>')+'</p>'))
}
/*
- END update list clients.
*/