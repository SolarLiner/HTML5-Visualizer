// ======== SoundCloud stuff ========
var author,
    title,
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
	  });
  } else { // If other (direct?) link
	  streamURL = link;
    showUser = false;
	  loadURL(streamURL, function(tags) {
      var colThief = new colorThief();
      
      author = tags.artist;
  	  title = tags.title;
      colors = tags.artwork;
  	  console.log("Got URL: '"+streamURL+"'");
      console.log("Got    : "+author+" - "+title+" ["+user+"]");
  	  Listen();
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
  
  DOMauthor.text(author);
  if(showUser) DOMtitle.html(title+' <small> by '+user+'</small>');
  else DOMtitle.html(title.replace(/\(\[/gi, "<small>").replace(/\)\]/gi, "</small>"));
  
      
  var colThief = new ColorThief();
  var colors = colThief.getPalette(img[0], 3);
  
  $('body').css("background-color", String.format('rgb({0}, {1}, {2})', colors[0]));
  DOMauthor.css("color", String.format('rgb({0}, {1}, {2})', colors[1]));
  DOMtitle.css("color", String.format('rgb({0}, {1}, {2})', colors[1]));
  p.css('background-color', String.format('rgba({0}, {1}, {2}, 0.3)', colors[2]));
  
  changeColor(String.format('rgb({0}, {1}, {2})', colors[1]));
  
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
function get(url, callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() { 
    if (request.readyState === 4 && request.status === 200) {
      callback(request.responseText);
    }
  }

  request.open("GET", url, true);            
  request.send(null);
}


// ========
getTrack('https://soundcloud.com/ima-music/mark-tyner-pale-blue-dot');