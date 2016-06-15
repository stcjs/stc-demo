var stc = require('stc');
var babel = require('stc-babel');
var ts = require('stc-typescript');
var uglify = require('stc-uglify');

stc.config({
  workers: 4,
  cluster: true,
  cache: false,
  include: ['template/', 'resource/'],
  tpl: {
    engine: 'smarty',
    extname: 'tpl',
    ld: '{%',
    rd: '%}'
  }
});

stc.transpile({
  babel: {plugin: babel, include: /src\/.*?\.js$/},
  ts: {plugin: ts, include: /src\/.*?\.ts/}
})

stc.workflow({
  JSCompress: {plugin: uglify, include: /\.js$/}
});

stc.start();