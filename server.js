const http = require('http');
const ws = require('ws'); // wss

const host = '127.0.0.1';
const port = 8085;

const wss = new ws.Server({noServer: true});

function accept(req, res) {

    if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
        res.end();
        return;
    }

    if (!req.headers.connection.match(/\bupgrade\b/i)) {
        res.end();
        return;
    }

    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}

function onConnect(ws) {
    ws.on('message', function (message) {

        let data = JSON.parse(message);
        console.log('SERVER:');
        console.log(data);
        saveToFile(message);

        ws.send(JSON.stringify(data));
        //setTimeout(() => ws.close(1000, "Bye!"), 5000);
    });
}

function saveToFile(data) {
    const fs = require('fs')

    let postfix = new Date().getTime();
    let filename = 'json_data/data_' + postfix + '.json';

    fs.writeFile(filename, data, (err) => {
        if (err) throw err;
    })
}

if (!module.parent) {
    console.log(`Server running on http://${host}:${port}`);
    http.createServer(accept).listen(port);
} else {
    exports.accept = accept;
}