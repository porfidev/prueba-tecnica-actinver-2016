// Register individual tasks before composing tasks that depend on them.
var fs = require('fs');
var path = require('path');
var tasksDirectory = path.join(__dirname, 'gulp/tasks');
var composedTasks = ['compile.js', 'default.js', 'serve.js'];

fs.readdirSync(tasksDirectory).filter(function (file) {
    return path.extname(file) === '.js' && composedTasks.indexOf(file) === -1;
}).sort().forEach(function (file) {
    require(path.join(tasksDirectory, file));
});

composedTasks.forEach(function (file) {
    require(path.join(tasksDirectory, file));
});
