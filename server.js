
// Mazin Abubeker
var http = require("http");
var querystring = require('querystring');
var request = require('request');
var REDIRECT_URL = "https://syncerapp.herokuapp.com/";
// var REDIRECT_URL = "http://localhost:3000/";

var express = require('express');
// var soccc = require('socket.io');
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


var c_id = '505f8d8f1a8d4bcaacdcbb0db5da54ca'; // Your client id
var c_secret = 'cc2dc6c51ead4946bb9e4c73b9d635af'; // Your secret


// Authorize Login
app.get('/authorize_login', function(req, res) {
  var scopes = 'streaming user-library-read user-modify-playback-state user-top-read user-modify-playback-state user-read-playback-state user-read-private user-read-email';
  res.end('https://accounts.spotify.com/authorize' +
  '?response_type=code' +
  '&client_id=' + c_id +
  (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
  '&redirect_uri=' + encodeURIComponent(REDIRECT_URL));
});

// Retrieve Token
let token = '';
app.post('/retrieve_token', function(req, res) {
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(c_id + ':' + c_secret).toString('base64'))
    },
    form: {
      grant_type: "authorization_code",
      code: req.body.code,
      redirect_uri: REDIRECT_URL
    },
    json: true
  };


  request.post(authOptions, function(error, response, body){
    if (!error && response.statusCode === 200) {
      token = body.access_token;
    }
  });
  res.end();
});

// API Request
app.post('/ask', function(req, res) {
    var options = {
    url: 'https://api.spotify.com/v1/search?q=' + req.body.user_req.toString() + '&type=track&limit=50',
    // url: "https://api.spotify.com/v1/me/tracks",
    headers: {
      'Authorization': 'Bearer ' + token
    },
    // body: {
    //   uris: ['spotify:track:1G5ho820Xi2Qu3HsBZ26ft'] 
    // },
    json: true
  };
  request.get(options, function(error, response, body) {
    console.log("Status: " + response.statusCode + " " + response.statusMessage);
    if(!error){
      var results = {songs: []};
      for(var i = 0; i < body.tracks.items.length; i++){
        results.songs.push({title: body.tracks.items[i].name, 
                            artist: body.tracks.items[i].artists[0].name, 
                            uri: body.tracks.items[i].uri,
                          img: body.tracks.items[i].album.images[0].url,
                        id: body.tracks.items[i].id});
      }
      res.send(results);
      res.end();
    }
  });
  
});

app.post('/library', function(req, res) {
  var options = {
  // url: 'https://api.spotify.com/v1/search?q=' + req.body.user_req.toString() + '&type=track&limit=50',
  url: "https://api.spotify.com/v1/me/tracks?limit=50",
  headers: {
    'Authorization': 'Bearer ' + token
  },
  // body: {
  //   uris: ['spotify:track:1G5ho820Xi2Qu3HsBZ26ft'] 
  // },
  json: true
};
request.get(options, function(error, response, body) {
  console.log("Status: " + response.statusCode + " " + response.statusMessage);
  if(!error){
    var results = {songs: []};
    for(var i = 0; i < body.items.length; i++){
      let track = body.items[i].track;
      results.songs.push({title: track.name, 
                          artist: track.artists[0].name, 
                          uri: track.uri,
                        img: track.album.images[0].url,
                      id: track.id});
    }
    res.send(results);
    res.end();
  }
});

});

app.post('/play', function(req, res) {
  var options = {
    url: 'https://api.spotify.com/v1/me/player/play',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: {
      uris: [req.body.id] 
    },
    json: true
  };
  request.put(options, function(error, response, body) {
    console.log("Status: " + response.statusCode + " " + response.statusMessage);
    if(!error){
      res.end();
    }
  });
});

app.post('/info', function(req, res) {
  var options = {
    url: 'https://api.spotify.com/v1/me/tracks',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };
  request.get(options, function(error, response, body) {
    console.log("Status: " + response.statusCode + " " + response.statusMessage);
    if(!error){
      res.end();
    }
  });
});

// function thingy(){
//   var options = {
//     url: 'https://api.spotify.com/v1/me/player/devices',
//     headers: {
//       'Authorization': 'Bearer ' + token
//     },
//     json: true
//   };
//   request.get(options, function(error, response, body) {
//     console.log("Status: " + response.statusCode + " " + response.statusMessage);
//     console.log(body);
//     if(!error){
//       var options = {
//         url: 'https://api.spotify.com/v1/me/player',
//         headers: {
//           'Authorization': 'Bearer ' + token
//         },
//         body: {
//           device_ids: [body.devices[0].id]
//         },
//         json: true
//       };
//       request.put(options, function(error, response, body) {
//         console.log("Status: " + response.statusCode + " " + response.statusMessage);
//         if(!error){
//           res.end();
//         }
//       });
//     }
//   });
// }


// app.post('/switch', function(req, res){
//   console.log('ok');
//   thingy();
// });
