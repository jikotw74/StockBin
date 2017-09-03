var PythonShell = require('python-shell');
var options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './ptt-web-crawler-master/PttWebCrawler',
    args: ['-b', 'Stock', '-a', 'M.1504245740.A.E1E']
};

var test = new PythonShell('crawler.py', options);
test.on('message',function (message, results) {
    console.log(message);
    console.log('results: %j', results);
});