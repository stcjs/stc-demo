var fs = require('fs');
var chokidar = require('chokidar');
var path = require('path');
var babel = require('babel-core')
var think = require('thinkit');
think = think.default || think;

var list = [
    'flkit',
    'stc',
    'stc-babel',
    'stc-cache',
    'stc-cluster',
    'stc-css-combine',
    'stc-dep-parser',
    'stc-file',
    'stc-helper',
    'stc-plugin',
    'stc-typescript',
    'stc-plugin-invoke',
    'stc-uglify',
    'stc-eslint',
    'stc-log'
];

list.forEach(function(dir) {
  dir = '../' + dir;
  dir = path.join(process.cwd(), dir);
  var sourcePath = path.join(dir, 'src');
  if(!think.isDir(sourcePath)) return;
  var targetPath = path.join(dir, 'lib');
  think.mkdir(targetPath);
  chokidar.watch(sourcePath, {
    persistent: true,
  }).on('all', function(event, changedPath) {
    if(!think.isFile(changedPath)) return;
    compileFile(sourcePath, targetPath, changedPath);
  });
});

function compileFile(sourcePath, targetPath, changedPath) {
  console.log('compile file ', changedPath);
  var content = fs.readFileSync(changedPath, 'utf8');
  try{
    var data = babel.transform(content, {
      filename: changedPath,
      presets: ['es2015-loose', 'stage-1'],
      plugins: ['transform-runtime'],
      sourceMaps: false,
      sourceFileName: changedPath
    });
    var file = changedPath.substr(sourcePath.length + 1);
    var saveFile = path.join(targetPath, file);
    think.mkdir(path.dirname(saveFile));
    fs.writeFileSync(saveFile, data.code);
  }catch(e){
    console.error(e.stack); 
  }
}