var stc = require('stc');
var babel = require('stc-babel');
var ts = require('stc-typescript');

stc.config({
  template: {
    include: ['./template']
  },
  static: {
    include: ['static/'],
    exclude: []
  }
});

stc.transpile({
  babel: {plugin: babel, include: /src\/.*?\.js$/},
  ts: {plugin: ts, include: /src\/.*?\.ts/}
})

stc.workflow();

stc.start();