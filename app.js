var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

var user_sockets = new Object();
var chans = new Object();
user_sockets['#test'] = new Object();
user_sockets['#azer'] = new Object();
chans['#test'] = new Array();
chans['#azer'] = new Array();

function object_to_array(object, str)
{
	if (typeof string == 'undefined')
		str = '';
	array = new Array();
	for (property in object){
		if (property.search(str) > -1)
			array.push(property);
	}
	return array;
}

io.on('connection', function(socket){
	var user = new Object();
	user.color = '#000';
	socket.on('join', function(infos){
//		console.log('<' + typeof infos + '>' + infos);
		if (typeof infos == 'undefined')
			return socket.emit('nope', 'both', 'Don\'t edit the code, noob! Reload the page, now.');
		if (typeof infos.chan == 'undefined' || infos.chan == '')
			return socket.emit('nope', 'chan-noob', 'Don\'t edit the code, noob! Reload the page, now.');
		if (typeof infos.name == 'undefined' || infos.name == '')
			return socket.emit('nope', 'name-noob', 'Don\'t edit the code, noob! Reload the page, now.');
		if (typeof chans[infos.chan] != 'undefined'){
			if (chans[infos.chan].indexOf(infos.name) == -1){
				user.name = infos.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				user.chan = infos.chan.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				socket.join(user.chan);
				chans[user.chan].push(user.name);
				user_sockets[user.chan][user.name] = socket;
				io.to(user.chan).emit('log', 'joined the channel', user.name)
				return socket.emit('ok', user);
			} else
				return socket.emit('nope', 'name', 'This name is already registered in this channel');
		} else
			return socket.emit('nope', 'chan', 'This channel does not exist');
	});
	socket.on('message', function(msg){
		if (/^\/nick .+/.test(msg)){
			var new_name = msg.match(/^\/nick (.+)/)[1].replace(/</g, '&lt;').replace(/>/g, '&gt;');
			if (chans[user.chan].indexOf(new_name) == -1){
				var old_name = user.name;
				user.name = new_name;
				chans[user.chan][chans[user.chan].indexOf(old_name)] = user.name
				user_sockets[user.chan][user.name] = user_sockets[user.chan][old_name];
				delete user_sockets[user.chan][old_name];
				return io.to(user.chan).emit('system', old_name + '</strong> is now known as <strong>' + user.name);
			} else
				return socket.emit('system', 'A user called <strong>' + new_name + '</strong> is already connected in this channel', 'system-red');
		} else if (/^\/list( (.+))?/.test(msg)){
			if (/^\/list$/.test(msg))
				return socket.emit('channels', object_to_array(chans));
			else if (/^\/list (.+)/.test(msg))
				return socket.emit('channels', object_to_array(chans, msg.match(/^\/list (.+)/)[1]));
		} else if (/^\/join .+/.test(msg)){
			var new_chan = msg.match(/^\/join (.+)/)[1].replace(/</g, '&lt;').replace(/>/g, '&gt;');
			var	name = user.name;
			if (/^\/join .+ .+/.test(msg))
				name = msg.match(/^\/join (.+)( (.+))/)[3].replace(/</g, '&lt;').replace(/>/g, '&gt;');
			if (chans[new_chan] != 'undefined'){
				if (chans[new_chan].indexOf(name) == -1){
					var old_chan = user.chan;
					var old_name = user.name;
					user.chan = new_chan;
					user.name = name;
					socket.leave(old_chan);
					chans[old_chan].splice(chans[old_chan].indexOf(old_name), 1);
					delete user_sockets[old_chan][old_name];
					io.to(old_chan).emit('chan', old_name, 'left');
					socket.join(user.chan);
					chans[user.chan].push(user.name);
					user_sockets[user.chan][user.name] = socket;
					io.to(user.chan).emit('chan', user.name, 'joined');
					return socket.emit('relog', user);
				} else
					return socket.emit('system', 'A user called <strong>' + name + '</strong> is already connected in the channel "' + new_chan + '"', 'system-red');
			} else
				return socket.emit('system', 'Channel "' + new_chan + '" does not exist', 'system-red');
		} else if (/^\/part/.test(msg)){
			name = user.name;
			socket.leave(user.chan);
			chans[user.chan].splice(chans[user.chan].indexOf(name), 1);
			delete user_sockets[user.chan][user.name];
			io.to(user.chan).emit('chan', name, 'left');
			user.name = '';
			user.chan = '';
			return socket.emit('logout');
		} else if (/^\/users/.test(msg)){
			return socket.emit('users', chans[user.chan]);
		} else if (/^\/msg (.+) (.+)/.test(msg)){
			var to = msg.match(/^\/msg (.+) (.+)/)[1].replace(/</g, '&lt;').replace(/>/g, '&gt;');
			if (chans[user.chan].indexOf(to) > -1){
				var msg = msg.match(/^\/msg (.+) (.+)/)[2].replace(/</g, '&lt;').replace(/>/g, '&gt;');
				user_sockets[user.chan][to].emit('r-pm', user.name, msg);
				return socket.emit('s-pm', to, msg);
			}
			return socket.emit('system', 'User <strong>' + to + '</strong> is unknown on this channel', 'system-red');
		} else if (/^\/color \#[a-f0-9]{3}$/i.test(msg)){
			user.color = msg.match(/^\/color (\#[a-f0-9]{3})/i)[1];
			return socket.emit('system', 'Your color has been changed to "<span style="color: ' + user.color + ';">' + user.color + '</span>"');
		} else if (/^\/help/.test(msg)) {
			if (/^\/help$/.test(msg))
				return socket.emit('help', commands)
			else if (/^\/help .+/.test(msg)){
				if (typeof command = commands[msg.match(/^\/help (.+)/)] != 'undefined')
					return socket.emit('help', commands[command]);
			}
			return ;
		} else
			return io.to(user.chan).emit('message', user.name, user.color, msg.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
	})
	socket.on('disconnect', function(){
//		console.log(user + ' has disconnected');
		if (typeof user.chan != 'undefined' && user.chan != '' && typeof user.name != 'undefined' && user.name != '' && chan[user.chan].indexOf(user.name) > -1){
			chans[user.chan].splice(chans[user.chan].indexOf(user.name), 1);
			io.to(user.chan).emit('log', 'disconnected', user.name);
		}
	})
})

http.listen(1337, function(){
	console.log('listening on *:1337');
});