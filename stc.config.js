var stc = require('stc');

stc.config({
  template: {
    include: ['./template']
  },
  static: {
    include: ['static/'],
    exclude: []
  }
});

stc.workflow();

stc.start();