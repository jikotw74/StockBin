var PythonShell = require('python-shell');
var options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './ptt-web-crawler-master/PttWebCrawler',
    args: ['-b', 'Stock', '-a', 'M.1504677731.A.86F']
};

// server.js
// const jsonServer = require('json-server');
// const server = jsonServer.create();
// const router = jsonServer.router('./public/db.json');
// const middlewares = jsonServer.defaults();
// server.use(middlewares);
// server.use(router);
// server.listen(8082, () => {
// 	 console.log('JSON Server is running')
// })

var fetch = function(){
	var crawler = new PythonShell('crawler.py', options);
	crawler.on('message', function (message) {
		var now = new Date();
		console.log('now: ' + now.toLocaleTimeString());
	    console.log(message);
	});
}
setInterval(fetch, 90000);