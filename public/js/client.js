var socket = io();
var user;

function adjust_scroll(){
  $('#messages-list').scrollTop($('.message').length * $('.message').outerHeight(true));
}

$('#join-form').submit(function(){
  $('#alert-error').css('display', 'none');
  $('#chan-group').removeClass('has-error');
  $('#name-group').removeClass('has-error');
  socket.emit('join', {
    name: $('#name').val(),
    chan: $('#chan').val()
  });
  return false;
});
$('#message-form').submit(function(){
  if ($('#msg').length > 0 && $('#msg').val() != '') {
    socket.emit('message', $('#msg').val());
    $('#msg').val('');
    return false;
  }
});
socket.on('ok', function(infos){
  $('#join').fadeOut();
  $('#messages').fadeIn();
  $('#chan_name').text(infos.chan);
  $('#messages-list').append($('<li class="message system">').text('Welcome on the channel "' + infos.chan + '", <strong>' + infos.name + '</strong>. Be polite and enjoy your stay. :)'));
  adjust_scroll();
  user = infos;
});
socket.on('relog', function(infos){
  $('#chan_name').text(infos.chan);
  $('#messages-list').empty();
  $('#messages-list').append($('<li class="message system">').text('Welcome on the channel "' + infos.chan + '", <strong>' + infos.name + '</strong>. Be polite and enjoy your stay. :)'));
  adjust_scroll();
  user = infos;
});
socket.on('logout', function(infos){
  $('#join').fadeIn();
  $('#messages').fadeOut();
  $('#chan_name').text('');
})
socket.on('nope', function(input, text){
  if (['chan-noob', 'name-noob', 'both'].indexOf(input) > -1)
    $('#alert-error').fadeIn().text(text)
  if (input == 'chan' || input == 'both')
    $('#chan-group').addClass('has-error');
  else if (input == 'name' || input == 'both')
    $('#name-group').addClass('has-error');
  $('#alert-error').fadeIn().text(text);
});
socket.on('message', function(usr, color, msg){
  $('#messages-list').append(($('<li class="message">').text(': ' + msg)).prepend($('<strong class="usr" style="color: ' + color + '">').text(usr)));
  adjust_scroll();
});
socket.on('r-pm', function(from, msg){
  $('#messages-list').append($('<li class="message system-blue">').text('You have received a private message from <strong>' + from.name + '</strong>:'));
  $('#messages-list').append($('<li class="message">').text(msg));
  $('#messages-list').append($('<li class="message system-blue">').text('------------------------------------------'));
  adjust_scroll();
});
socket.on('s-pm', function(to, msg){
  $('#messages-list').append($('<li class="message system-blue">').text('To <strong>' + to + '</strong>:'));
  $('#messages-list').append($('<li class="message">').text(msg));
  $('#messages-list').append($('<li class="message system-blue">').text('------------------------------------------'));
  adjust_scroll();
});
socket.on('log', function(log, usr){
  $('#messages-list').append(($('<li class="message system">').text(' has ' + log)).prepend($('<strong>').text(usr)));
  adjust_scroll();
});
socket.on('system', function(msg, status){
  if (typeof status == 'undefined')
    status = 'system';
  $('#messages-list').append($('<li class="' + status + '">').text(msg));
  adjust_scroll();
});
socket.on('chan', function(usr, chan){
  $('#messages-list').append(($('<li class="message system">').text(' has ' + chan + ' the channel')).prepend($('<strong>').text(usr)));
  adjust_scroll();
});
socket.on('users', function(users){
  $('#messages-list').append($('<li class="message system-green">').text('------------------------------------------'));
  $('#messages-list').append($('<li class="message system-green">').text('There\'re ' + users.length + ' users on this channel:'));
  for (user in users){
    $('#messages-list').append($('<li class="message system-green"><strong>').text(users[user]));
  }
  $('#messages-list').append($('<li class="message system-green">').text('------------------------------------------'));
  adjust_scroll();
});
socket.on('channels', function(channels){
  $('#messages-list').append($('<li class="message system-green">').text('------------------------------------------'));
  $('#messages-list').append($('<li class="message system-green">').text('There\'re ' + channels.length + ' channels on this server:'));
  for (channel in channels){
    $('#messages-list').append($('<li class="message system-green"><strong>').text(channels[channel]));
  }
  $('#messages-list').append($('<li class="message system-green">').text('------------------------------------------'));
  adjust_scroll();
});
socket.on('helps', function(commands){
  $('#messages-list').append($('<li class="message system-green">').text('------------------------------------------'));
  $('#messages-list').append($('<li class="message system-green">').text('These are the commands available on this server:'));
  for (command in commands){
    $('#messages-list').append($('<li class="message system-green"><strong>').text('<strong>' + command + '</strong>: ' + commands[command]));
  }
  $('#messages-list').append($('<li class="message system-green">').text('------------------------------------------'));
  adjust_scroll();
});
socket.on('help', function(command){
  $('#messages-list').append($('<li class="message system-green">').text('------------------------------------------'));
  $('#messages-list').append($('<li class="message system-green">').text(command));
  $('#messages-list').append($('<li class="message system-green">').text('------------------------------------------'));
  adjust_scroll();
});