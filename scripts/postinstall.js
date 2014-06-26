var add = require('shell-source').add;
var exec = require('child_process').exec;
var warn = require('chalk').white.bgRed;

exec('which man2html', function (err) {
  if (err) {
    console.error(warn('warning'), 'man2html must be installed');
  }
});

add(__dirname + '/source.sh');
