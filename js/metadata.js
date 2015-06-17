function loadURL(url, callback) {
	ID3.loadTags(url, function() {
		var tags = ID3.getAllTags(url);
		
		if(callback) callback(tags);
	},
	{tags: ["artist", "title", "picture"]});
}

