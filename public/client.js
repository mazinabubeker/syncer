var auth_code = '';
var auth_token = '';

$(document).ready(function(){
    if(window.location.href.includes('code')){
        document.getElementById('btn-login').remove();
        const urlParams = new URLSearchParams(window.location.search);
        auth_code = urlParams.get('code');
        // let auth_btn = `<div id='btn-authorize' class='btn' onclick='retrieve_token()'>AUTHORIZE</div>`;
        // document.body.insertAdjacentHTML('beforeend', auth_btn);
        retrieve_token();
      }
});

function authorize_login(){
    fetch('/authorize_login')
    .then(resp => resp.text())
    .then(data=>{
        window.location.href = data;
    });
}


function retrieve_token(){
  // document.getElementById('btn-authorize').remove();
  fetch('/retrieve_token', {method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({code: auth_code})
                  })
  .then(resp => resp.text())
  .then(data=>{


    // fetch('/switch', {method: 'POST',
    //                         headers: {
    //                             'Content-Type': 'application/json'
    //                         },
    //                         body: JSON.stringify({id: 0})
    //                     })
    //     .then(resp => resp.text())
    //     .then(data=>{

    //     });


    document.body.style.justifyContent = 'start';
    let search_btn = ``;
    // search_btn += `<div id='btn-woop' class='btn' onclick='library()'>LIKES</div>`; 
    search_btn += `<input placeholder='Search...' type='text' id='search-input' style='width: 200px;'></div>`;
    search_btn += `<img id='load-gif' style='visibility: hidden' src='assets/load.gif'/>`;
    search_btn += `<div id='results'></div>`;
    document.body.insertAdjacentHTML('beforeend', search_btn);
    document.getElementById('search-input').addEventListener('keyup', e=>{
      if(e.keyCode == 13){
        request();
      }
    });
  });
}

function library(){
  let result_box = document.getElementById('results');
  document.getElementById('load-gif').style.visibility = 'visible';
  // result_box.style.filter = "blur(2px)";
  fetch('/library', {method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({id: 0})
                    })
    .then(resp => resp.text())
    .then(data=>{
      // result_box.style.filter = '';
      document.getElementById('load-gif').style.visibility = 'hidden';
      result_box.innerHTML = '';
      data = JSON.parse(data);
      for(var i = 0; i < data.songs.length; i++){
        let new_song = document.createElement('div');
        new_song.classList.add('song-item')
        let a = data.songs[i].uri
        let b = data.songs[i].img;
        let c = data.songs[i].id;
        
        
        let img_div = document.createElement('img');
        let magic_div = document.createElement('div');
        magic_div.classList.add('magic');
        let text_div = document.createElement('p');
        text_div.innerHTML = data.songs[i].title + `<br><span class='artist-text'>` + data.songs[i].artist + `</span>`;
        img_div.classList.add('img-item');
        img_div.src = b;
        new_song.insertAdjacentElement('beforeend', img_div);
        magic_div.insertAdjacentElement('beforeend', text_div);
        new_song.insertAdjacentElement('beforeend', magic_div);

        new_song.addEventListener('click', ()=>{
          playSong(a);
        });

        result_box.insertAdjacentElement('beforeend', new_song);
        // result_box.insertAdjacentHTML('beforeend', `<div class='song-item' style='border-bottom: 2px solid black;' onclick='playSong()'>` +  + `</div>`)
      }
    });
}

function request(){
  let result_box = document.getElementById('results');
  if(document.getElementById('search-input').value  == ''){
    return;
  }
  document.getElementById('load-gif').style.visibility = 'visible';
  // result_box.style.filter = "blur(2px)";
  fetch('/ask', {method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({user_req: document.getElementById('search-input').value})
                    })
    .then(resp => resp.text())
    .then(data=>{
      // result_box.style.filter = '';
      document.getElementById('load-gif').style.visibility = 'hidden';
      result_box.innerHTML = '';
      data = JSON.parse(data);
     
      var coo = document.getElementById("myCanvas");
      var ctx = coo.getContext("2d");;
      for(var i = 0; i < data.songs.length; i++){
        document.body.style.filter = "blur(0px)";
        let new_song = document.createElement('div');
        new_song.classList.add('song-item')
        let a = data.songs[i].uri
        let b = data.songs[i].img;
        let c = data.songs[i].id;
        new_song.addEventListener('click', ()=>{
          playSong(a);

        });

        
        
        let img_div = document.createElement('img');
        let magic_div = document.createElement('div');
        magic_div.classList.add('magic');
        let text_div = document.createElement('p');
        text_div.innerHTML = data.songs[i].title + `<br><span class='artist-text'>` + data.songs[i].artist + `</span>`;
        img_div.classList.add('img-item');
        img_div.src = b;
        img_div.crossOrigin = "Anonymous";
        new_song.insertAdjacentElement('beforeend', img_div);
        magic_div.insertAdjacentElement('beforeend', text_div);
        new_song.insertAdjacentElement('beforeend', magic_div);

        var new_r = 0;
        var new_g = 0;
        var new_b = 0;

        new_song.onmouseenter = function(){
          ctx.drawImage(img_div, 0, 0, 100, 100);
          const imageData = ctx.getImageData(0,0,100, 100);
          var r_total = 0;
          var g_total = 0;
          var b_total = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            r_total += imageData.data[i + 0];
            g_total += imageData.data[i + 1];
            b_total += imageData.data[i + 2];
          }

          // r_total = Math.floor(r_total / imageData.data.length / 4 );
          // g_total = Math.floor(g_total / imageData.data.length / 4 );
          // b_total = Math.floor(b_total / imageData.data.length / 4 );

          r_total /= imageData.data.length / 4;
          g_total /= imageData.data.length / 4;
          b_total /= imageData.data.length / 4;

          new_r = Math.floor(r_total);
          new_g = Math.floor(g_total);
          new_b = Math.floor(b_total);

          new_song.style.backgroundColor = 'rgba(' + new_r + ', ' + new_g + ', ' + new_b + ', .4)';
        };

        

        result_box.insertAdjacentElement('beforeend', new_song);
        // result_box.insertAdjacentHTML('beforeend', `<div class='song-item' style='border-bottom: 2px solid black;' onclick='playSong()'>` +  + `</div>`)
      }
    });
}

function playSong(uri){
  fetch('/play', {method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({id: uri})
                    })
    .then(resp => resp.text())
    .then(data=>{

    });
}