// Register individual tasks before composing tasks that depend on them.
const fs = require('fs');
const path = require('path');
const tasksDirectory = path.join(__dirname, 'gulp/tasks');
const composedTasks = ['compile.js', 'default.js', 'serve.js'];

fs.readdirSync(tasksDirectory)
  .filter(function (file) {
    return path.extname(file) === '.js' && composedTasks.indexOf(file) === -1;
  })
  .sort()
  .forEach(function (file) {
    require(path.join(tasksDirectory, file));
  });

composedTasks.forEach(function (file) {
  require(path.join(tasksDirectory, file));
});
