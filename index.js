var express = require('express')
var cors = require('cors')
var fs = require('fs');
var app = express()
const http = require('http').Server(app);

var whitelist = ['https://learnmyskills.com', 'https://www.learnmyskills.com','http://www.learnmyskills.com','http://learnmyskills.com']
const io = require('socket.io')(http,{
  cors: {
    origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
    methods: ["GET", "POST"]
  }
});
var clients = {};
var loopLimit = 0;
const port = process.env.PORT || 3000;

app.use(cors())
app.get('/', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

// Chatroom

var numUsers = 0;


io.on('connection', (socket) => {
 
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
      clients.push(username);
    ++numUsers;
     // echo globally (all clients) that a person has connected
    io.emit('user joined', {
      userList: clients,
      numUsers: numUsers
    });
  });

  // when the client emits '  leave user', this listens and executes
  socket.on('leave user', function (username) {
    --numUsers;
    removeItemFromArray(clients,username);
    io.emit('user left', {
      userList: clients,
      numUsers: numUsers
    });
  });


  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
    removeItemFromArray(clients,username);
      // echo globally that this client has left
     io.emit('user left', {
        userList: clients,
        numUsers: numUsers
      });
    }
  });

function removeItemFromArray(array, n) {
    const index = array.indexOf(n);

    // if the element is in the array, remove it
    if(index > -1) {

        // remove item
        array.splice(index, 1);
    }
    return array;
}
});
