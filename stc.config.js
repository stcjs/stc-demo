var stc = require('stc');
var babel = require('stc-babel');
var ts = require('stc-typescript');
var uglify = require('stc-uglify');
var eslint = require('stc-eslint');
var cssCombine = require('stc-css-combine');

stc.config({
  workers: 4,
  cluster: false,
  cache: false,
  include: ['template/', 'static/'],
  tpl: {
    engine: 'smarty',
    extname: 'nunjs',
    ld: '{%',
    rd: '%}'
  }
});

/*
stc.lint({
  eslint: {plugin: eslint, include: 'static/js/a.js'}
});

stc.transpile({
  babel: {plugin: babel, include: /src\/.*?\.js$/},
  ts: {plugin: ts, include: /src\/.*?\.ts/}
})
*/

stc.workflow({
  // JSCompress: {plugin: uglify, include: /\.js$/},
  CSSCombine: {plugin: cssCombine, include: /\.css$/},
});

stc.start();