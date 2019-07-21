// index.js
var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res) {
	var page = url.parse(req.url).pathname;
	console.log(page);
	res.writeHead(200, {"Content-Type": "text/plain"});
	
	if (page == '/') {
			res.write('Welcome BLUE!');
	}
	else {
		res.write('Welcome BLUE!');
	}
	res.end();
});

server.listen(8080);
