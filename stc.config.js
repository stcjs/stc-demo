var stc = require('stc');
var babel = require('stc-babel');

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
  babel: {plugin: babel, include: /src\/.*?\.js$/}
})

stc.workflow();

stc.start();