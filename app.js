var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

var chans = new Array();
var users = new Object();
chans.push('test');
users['test'] = 'test';

io.on('connection', function(socket){
	var user = new Object();
	socket.on('join', function(infos){
//		console.log('<' + typeof infos + '>' + infos);
		if (chans.indexOf(infos.chan) > -1){
			if (typeof users[infos.name] == 'undefined' || users[infos.name] != infos.chan){
				user.name = infos.name;
				user.chan = infos.chan;
				socket.join(infos.chan);
				socket.emit('ok', user);
			} else
				socket.emit('nope', 'name', 'This name is already registered in this channel');
		} else
			socket.emit('nope', 'chan', 'This channel does not exist');
	});
	socket.on('message', function(msg){
//		console.log('message: ' + msg);
		io.to(user.chan).emit('message', msg);
	})
	socket.on('disconnect', function(user){
//		console.log(user + ' has disconnected');
		io.to(user.chan).emit('disconnected', user);
	})
})

http.listen(1337, function(){
	console.log('listening on *:1337');
})