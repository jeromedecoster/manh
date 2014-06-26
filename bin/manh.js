#!/usr/bin/env node

// DESCRIPTION
// ===========
// convert a man page to a pretty html page

// DEPENDENCIES
// ============
// man2html - is installed with the man2html homebrew formula

var balanced = require('balanced-match');
var exec = require('child_process').exec;
var fmt = require('util').format;
var fs = require('fs');

var command = process.argv[2];
var cache = '../.cache';
var assets = '../assets';
var file = fmt('%s/%s.html', cache, command);



process.chdir(__dirname);

check(function(exists) {
  exists ? open() : create();
});



function abort(msg, prefix) {
  prefix = prefix || 'manh';
  console.error(prefix + ':', msg);
  process.exit(1);
}

function check(cb) {
  // a command must be defined
  if (!command) abort('manh command', 'usage');
  // the command must exists
  exists(command, ['command not found', command], function() {
    // man2html must be installed
    exists('man2html', 'man2html must be installed', function() {
      // the cache does not exists
      if (!fs.existsSync(cache)) {
        copy(function() {
          cb(false);
        });
      } else {
        cb(fs.existsSync(file));
      }
    })
  })
}

function copy(cb) {
  var cmd = fmt('cp -r %s %s', assets, cache);
  exec(cmd, function (err) {
    if (err) abort('cache creation has failed');
    cb();
  });
}

function create() {
  var cmd = fmt('man %s | man2html -bare -nodepage > %s', command, file);
  exec(cmd, function (err) {
    if (err) abort('man2html export has failed');
    var str = read(file);
    str = parse(str);
    write(file, str);
    open();
  });
}

function exists(cmd, msg, cb) {
  exec('type -P ' + cmd, function (err, stdout) {
    if (err) {
      if (!Array.isArray(msg)) msg = [msg];
      abort.apply(null, msg);
    }
    cb();
  });
}

function open() {
  exec('open '+ file);
  // exec('which browse', function (err) {
  //   var cmd = fmt('%s %s', err ? 'open' : 'browse', file);
  //   exec(cmd);
  // });
}

function parse(str) {
  var ret = '<H1>' + balanced('<B>', '</B>', str).body + '</H1>\n';
  ret += str.substr(str.indexOf('<H2>'));

  var tpl = balanced('{{', '}}', read('../assets/template.mustache'));
  return tpl.pre + ret + tpl.post;
}

function read(file) {
  return fs.readFileSync(file).toString();
}

function write(file, str) {
  return fs.writeFileSync(file, new Buffer(str));
}
