var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
const cors = require('cors');

var api = require('./routes/api');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));
// for cors
app.use(cors());

app.use('/', api);

// Send all other requests to the Angular app
app.get('*', (req, res) => {
    res.send("Hello");
});

//Set Port
const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`Running on localhost:${port}`));
