/* global ColorThief */
/* global loadURL */
// ======== SoundCloud stuff ========
var author,
    UserURL,
    title,
    TrackURL,
    user,
	  showUser = true,
    client_data = "client_id=be22d6150f0765b2209862b250934b72",
    image,
    streamURL;

function getTrack(link) {
  console.log('GetTrack("'+link+'")')
 
  var r = /[a-z]+\:\/\/(.*)soundcloud\.com\/(.*)/;
  
  if(r.test(link)) { // If SoundCloud link
	  get("http://api.soundcloud.com/resolve.json?url=" +  link + "&" + client_data, function(re) {
	    var trackInfo = JSON.parse(re);
	    console.log(trackInfo);
      UserURL = trackInfo.user.permalink_url;
      TrackURL  = trackInfo.permalink_url;
	    
	    var sTitle = trackInfo.title.split("-");
	    if(sTitle.length==1){
	      author = trackInfo.user.username;
	      title = trackInfo.title;
		  showUser = false;
	    } else {
	      author = sTitle[0].trim();
	      sTitle.splice(0,1);
	      title = sTitle.join("-").trim();
		  showUser = !(author==user)
	    }
	    image = trackInfo.artwork_url;
      user = trackInfo.user.username;
	    streamURL = trackInfo.stream_url + "?" + client_data;
		
		console.log("Got: "+author+" - "+title+" at '"+streamURL+"'");
		
		Listen();
    var f = filled? "":"&stroked";
    var o = oscilloscope? "&osc":"";
    window.history.pushState('webaudio viz', title.substr(title.search("<small>")), "index.html?s="+link+f+o);
	  });
  } else { // If other (direct?) link
    streamURL = link;
    showUser = false;
	  loadURL(streamURL, function(tags) {
      if(link.substr(7) == "file://") // Crossorigin fix for local streams
        $('#player').removeAttr('crossorigin');
      else $('#player').attr('crossorigin', "anonymous");
      
      author = tags.artist;
  	  title = tags.title;
      if(tags.picture != undefined) {
        image = "data:"+tags.picture.format;
        var b64 = "";
        
        tags.picture.data.forEach(function(data) {
          b64 += String.fromCharCode(data);
        }, this);
        image += ";base64,"+window.btoa(b64);
    } else {
      image = undefined;
    }
      
  	  console.log("Got URL: '"+streamURL+"'");
      console.log("Got    : "+author+" - "+title+" ["+user+"]");
  	  Listen();
      var f = filled? "":"&stroked";
      var o = oscilloscope? "&osc":"";
      window.history.pushState('webaudio viz', title.substr(title.search("<small>")), "index.html?s="+streamURL+f+o);
    });
  }
}

function Listen() {
  var DOMauthor	= $("#author"),
  	  DOMtitle	= $("#title"),
      p = $('#player'),
      img = $('#artwork');
      
  img.attr('src', image);
	
  p[0].pause();
  p.attr('src', streamURL);
  p[0].play();
  
  console.log("playing: "+author+" - "+title+" ["+user+"]");
  
  if(showUser){
      if(TrackURL === undefined || UserURL === undefined){
        DOMtitle.html(String.format('{0} <small>by {1}</a>', [title, user]));
        DOMauthor.text(author);
      }
      else {
        DOMtitle.html(String.format('{0} <small>by <a href="{2}">{1}</a></small>', [title, user, UserURL]));
        DOMauthor.html(String.format('<a href="{1}">{0}</a>',[author, UserURL]));
      }
    }
  else {
    var newtitle = title.replace(/(\(|\[)/ig, "<small>").replace(/(\)|\])/ig, "</small>").replace("</small> <small>", " ");
    if(TrackURL === undefined || UserURL === undefined){
      DOMtitle.html(newtitle);
      DOMauthor.text(author);
    } else {
      DOMtitle.html(String.format('<a href="{1}">{0}</a>', [newtitle, TrackURL]));
      DOMauthor.html(String.format('<a href="{1}">{0}</a>', [author, UserURL]));
    }
    
    
  }
  
  img.on('load', function(){
    var colThief = new ColorThief();
    var colors = colThief.getPalette(img[0], 3);
    
    $('body').css("background-color", String.format('rgb({0}, {1}, {2})', colors[0]));
    DOMauthor.css("color", String.format('rgb({0}, {1}, {2})', colors[1]));
    DOMtitle.css("color", String.format('rgb({0}, {1}, {2})', colors[1]));
    //p.css('background-color', String.format('rgba({0}, {1}, {2}, 0.3)', colors[2]));
    
    changeColor(String.format('rgb({0}, {1}, {2})', colors[1]));
  });
  $('title')[0].innerText = author+" - "+title+ " | WebAudio Visualization";
}

function Fetch() {
	getTrack($('#URL').val());
}

// Misc
String.format = function(text, args) {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = text;
    // start with the second argument (i = 1)
    for (var i = 0; i < args.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + i + "\\}", "gm");
        theString = theString.replace(regEx, args[i]);
    }
    
    return theString;
}
// MISC
/*function get(url, callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() { 
    if (request.readyState === 4 && request.status === 200) {
      callback(request.responseText);
    }
  }

  request.open("GET", url, true);            
  request.send(null);
}*/

function $_GET(val, decode, isflag) {
    var result = undefined,
        tmp = [];
    location.search
    //.replace ( "?", "" ) 
    // this is better, there might be a question mark inside
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === val) result = isflag? true : (decode? decodeURIComponent(tmp[1]) : tmp[1]);
    });
    return result;
}


// ========
var song = $_GET('s', false, false);
osc = $_GET('osc', false, true);
oscilloscope = osc==undefined? false:osc;

stroke = $_GET('stroked', false, true);
filled = stroke==undefined? true:!stroke;

if(song == undefined) getTrack('https://soundcloud.com/refractordj/spaceflight-ep');
else {
  $('#URL').val(song);
  getTrack(song);
}