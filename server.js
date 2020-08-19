
var express = require('express');
var soccc = require('socket.io');
var app = express();
var server = app.listen(process.env.PORT || 3000);
app.use(express.static('public'));
app.use(express.json());
// app.post('/query_post', (req, res) => {
//   res.send(req.body);
//   res.end();
// });
// app.get('/query_get', (req, res) => {
//   res.send(nextFlashTime.toString());
//   res.end();
// });

var io = soccc(server);
io.sockets.on('connection', newConnection)

function newConnection(socket){
  console.log("Connected: " + socket.id);
}
