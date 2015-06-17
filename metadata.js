var fs = require('fs');
var mm = require('musicmetadata');

var src = $('#player').get(0).attr("src");

var parser = mm(fs.createReadStream(src), function(err, metadata) {
	if(err) {
		$("#author").text("N/A");
		$("#title").text("Undefined");
	} else {
		$('#author').text(metadata.artist);
		
		// Title formatting
		var re = /^(.*) [\(\[](.*)[\)\]]$/;
		var m = re.match(metadata.title);
		
		if(m.length == 3) {
			$("#title").html(m[1] + ' <small>'+m[2]+'</small>');
		}else {
			$("#title").html(metadata.title);
		}
	}
});