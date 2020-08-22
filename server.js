
// Mazin Abubeker
var socket = require('socket.io');
var http = require("http");
var querystring = require('querystring');
var request = require('request');
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000);
app.use(express.static('public'))
app.use(express.json());
app.set('views', 'views')
.set('view engine', 'ejs')
.get('/', (req, res) => res.render('index'))
.get('/app', (req, res) => res.render('app'))

var io = socket(server);
io.sockets.on('connection', newConnection);

var REDIRECT_URL = "https://syncerapp.herokuapp.com/";
// var REDIRECT_URL = "http://localhost:3000/";
var c_id = '505f8d8f1a8d4bcaacdcbb0db5da54ca'; // Your client id
var c_secret = 'cc2dc6c51ead4946bb9e4c73b9d635af'; // Your secret
let token = '';
var idMap = new Map();

function newConnection(socket){
  socket.on('request-id', ()=>{
    console.log("New client: " + socket.id);
    socket.emit('id-response', socket.id);
  });

  socket.on('login', ()=>{
    var scopes = 'streaming user-library-read user-modify-playback-state user-top-read user-modify-playback-state user-read-playback-state user-read-private user-read-email';
    let resp = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + c_id +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + encodeURIComponent(REDIRECT_URL);
    socket.emit('login-response', resp);
  });

  socket.on('token', res=>{
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(c_id + ':' + c_secret).toString('base64'))
      },
      form: {
        grant_type: "authorization_code",
        code: res.auth_code,
        redirect_uri: REDIRECT_URL
      },
      json: true
    };
    request.post(authOptions, function(error, response, body){
      if (response.statusCode === 200) {
        idMap.set(res.uid, body.access_token);
        socket.emit('token-response');
      }
    });
  });

  socket.on('ask', res=>{
    var options = {
      url: 'https://api.spotify.com/v1/search?q=' + res.user_req.toString() + '&type=track&limit=30',
      headers: {
        'Authorization': 'Bearer ' + idMap.get(res.uid)
      },
      json: true
    };
    request.get(options, function(error, response, body) {
      if(response.statusCode == 200){
        console.log("OK - Search");
        var results = {songs: []};
        for(var i = 0; i < body.tracks.items.length; i++){
          results.songs.push({title: body.tracks.items[i].name, 
                              artist: body.tracks.items[i].artists[0].name, 
                              uri: body.tracks.items[i].uri,
                            img: body.tracks.items[i].album.images[0].url,
                          id: body.tracks.items[i].id});
        }
        socket.emit('ask-response', results);
      }
    });
  });

  socket.on('play', res=>{
    var options = {
      headers: {
        'Authorization': 'Bearer ' + idMap.get(res.uid)
      },
      json: true,
      url: 'https://api.spotify.com/v1/me/player/play',
      body: {
        uris: [res.uri] 
      }
    };
    request.put(options, function(error, response, body) {
      if(response.statusCode == 204){
        console.log("OK - Play");
      }
    });
  })
}