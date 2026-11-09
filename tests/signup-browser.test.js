const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { JSDOM } = require('jsdom');

// Exercise the generated files that the browser receives, not mocked controllers.
test('Compiled AngularJS form blocks invalid submissions and sends only user fields', () => {
  const root = path.resolve(__dirname, '..');
  fs.mkdirSync(path.join(root, '.tmp/js'), { recursive: true });
  fs.writeFileSync(path.join(root, '.tmp/js/obsolete.controller.js'), '// stale output');
  execFileSync(process.execPath, ['node_modules/gulp/bin/gulp.js', 'build'], {
    cwd: root,
    stdio: 'pipe'
  });
  assert(!fs.existsSync(path.join(root, '.tmp/js/obsolete.controller.js')));
  function read(file) {
    return fs.readFileSync(path.join(root, file), 'utf8');
  }
  for (const file of ['signup-form.component.js', 'signup.service.js']) {
    assert.equal(
      read('.tmp/js/auth/signup/' + file),
      read('app/auth/signup/' + file),
      'Build must finish writing the current component and service'
    );
  }
  assert.equal(read('.tmp/js/app.routes.js'), read('app/app.routes.js'));

  const dom = new JSDOM(
    '<!doctype html><html><body><signup-form user="user" on-success="registered = true"></signup-form></body></html>',
    { runScripts: 'outside-only', url: 'http://localhost:3000/' }
  );
  try {
    const window = dom.window;
    window.eval(read('.tmp/libs/angular.js'));
    const angular = window.angular;
    const requests = [];
    angular
      .module('actinver_todolist', [])
      .constant('env', { api: 'http://localhost:1337/api' })
      .config([
        '$provide',
        function ($provide) {
          $provide.decorator('$http', [
            '$delegate',
            '$q',
            function ($http, $q) {
              $http.post = function (url, data) {
                requests.push({ url, data });
                return $q.resolve({ status: 201 });
              };
              return $http;
            }
          ]);
        }
      ])
      .run([
        '$templateCache',
        '$rootScope',
        function ($templateCache, scope) {
          $templateCache.put(
            'views/auth/signup/signup-form.html',
            read('.tmp/views/auth/signup/signup-form.html')
          );
          scope.user = {};
        }
      ]);
    window.eval(read('.tmp/js/auth/signup/signup.service.js'));
    window.eval(read('.tmp/js/shared/form-validation.directive.js'));
    window.eval(read('.tmp/js/auth/signup/signup-form.component.js'));
    const injector = angular.bootstrap(window.document.body, ['actinver_todolist']);
    const scope = injector.get('$rootScope');
    const form = window.document.querySelector('form');
    function submit() {
      form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      scope.$digest();
    }
    function fill(name, value) {
      const input = form.querySelector('[name="' + name + '"]');
      input.value = value;
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
      input.dispatchEvent(new window.Event('blur'));
      scope.$digest();
    }
    submit();
    assert.equal(requests.length, 0, 'Empty form must not POST');
    assert(form.textContent.includes('El correo es obligatorio.'));
    assert.equal(window.document.activeElement, form.querySelector('.ng-invalid'));
    fill('email', 'invalid');
    fill('password', 'short');
    fill('confirmpassword', 'short');
    submit();
    assert.equal(requests.length, 0, 'Invalid email and short passwords must not POST');
    fill('email', 'test@example.com');
    fill('password', 'password123');
    fill('confirmpassword', 'different');
    submit();
    assert.equal(requests.length, 0, 'Mismatched passwords must not POST');
    fill('confirmpassword', 'password123');
    scope.user.extra = 'must not be sent';
    submit();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'http://localhost:1337/api/Account/Register');
    assert.deepEqual(JSON.parse(JSON.stringify(requests[0].data)), {
      email: 'test@example.com',
      password: 'password123',
      confirmpassword: 'password123'
    });
    assert.equal(scope.registered, true);
  } finally {
    dom.window.close();
  }
});

test('Compiled sign-in form blocks empty input, handles errors and sends only credentials', () => {
  const root = path.resolve(__dirname, '..');
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  for (const file of ['signin-form.component.js', 'signin.service.js']) {
    assert.equal(read('.tmp/js/auth/signin/' + file), read('app/auth/signin/' + file));
  }
  const dom = new JSDOM(
    '<!doctype html><html><body><signin-form user="user" on-success="successes = successes + 1"></signin-form></body></html>',
    { runScripts: 'outside-only', url: 'http://localhost:3000/' }
  );
  try {
    const window = dom.window;
    window.eval(read('.tmp/libs/angular.js'));
    const angular = window.angular;
    const requests = [];
    let pending;
    angular
      .module('actinver_todolist', [])
      .constant('env', { tokenUrl: 'http://localhost:1337/Token' })
      .constant('postSignIntFix', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .config([
        '$provide',
        function ($provide) {
          $provide.decorator('$http', [
            '$delegate',
            '$q',
            function ($http, $q) {
              $http.post = (url, data, options) => {
                requests.push({ url, data, options });
                pending = $q.defer();
                return pending.promise;
              };
              return $http;
            }
          ]);
        }
      ])
      .run([
        '$templateCache',
        '$rootScope',
        function (cache, scope) {
          cache.put(
            'views/auth/signin/signin-form.html',
            read('.tmp/views/auth/signin/signin-form.html')
          );
          scope.user = {};
          scope.successes = 0;
        }
      ]);
    window.eval(read('.tmp/js/auth/signin/signin.service.js'));
    window.eval(read('.tmp/js/shared/form-validation.directive.js'));
    window.eval(read('.tmp/js/auth/signin/signin-form.component.js'));
    const injector = angular.bootstrap(window.document.body, ['actinver_todolist']);
    const scope = injector.get('$rootScope');
    const form = window.document.querySelector('form');
    const controller = angular
      .element(window.document.querySelector('signin-form'))
      .controller('signinForm');
    const button = form.querySelector('button');
    function submit() {
      form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      scope.$digest();
    }
    function fill(name, value) {
      const input = form.querySelector('[name="' + name + '"]');
      input.value = value;
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
      input.dispatchEvent(new window.Event('blur'));
      scope.$digest();
    }
    submit();
    assert.equal(requests.length, 0);
    assert(form.textContent.includes('El correo es obligatorio.'));
    fill('username', 'invalid');
    fill('password', 'password123');
    submit();
    assert.equal(requests.length, 0);
    fill('username', 'test@example.com');
    fill('password', 'x'.repeat(129));
    submit();
    assert.equal(requests.length, 0);
    fill('password', ' pass word123 ');
    scope.user.extra = 'must not be sent';
    submit();
    assert.equal(requests.length, 1);
    assert.equal(button.disabled, true);
    submit();
    assert.equal(requests.length, 1, 'Duplicate submissions are blocked');
    assert.equal(requests[0].url, 'http://localhost:1337/Token');
    assert.deepEqual(Object.fromEntries(new URLSearchParams(requests[0].data)), {
      username: 'test@example.com',
      password: ' pass word123 ',
      grant_type: 'password'
    });
    assert.equal(requests[0].options.headers['Content-Type'], 'application/x-www-form-urlencoded');
    window.localStorage.access_token = 'old-token';
    window.localStorage.user = '{}';
    pending.reject({ status: 401 });
    scope.$digest();
    assert.equal(scope.successes, 0);
    assert.equal(controller.error, 'Correo o contraseña incorrectos.');
    assert.equal(button.disabled, false);
    assert.equal(window.localStorage.getItem('access_token'), null);
    assert.equal(window.localStorage.getItem('user'), null);
    for (const [status, message] of [
      [422, 'Revisa los datos del formulario.'],
      [-1, 'No se pudo iniciar sesión. Intenta nuevamente.']
    ]) {
      submit();
      pending.reject({ status });
      scope.$digest();
      assert.equal(controller.error, message);
      assert.equal(scope.successes, 0);
      assert.equal(button.disabled, false);
    }
    submit();
    pending.resolve({ data: { access_token: 'new-token', token_type: 'bearer' } });
    scope.$digest();
    assert.equal(scope.successes, 1);
    assert.equal(controller.error, '');
    assert.equal(window.localStorage.access_token, 'new-token');
    assert.equal(controller.sending, false);
  } finally {
    dom.window.close();
  }
});

test('Successful sign-in from the compiled home view navigates to tasks', () => {
  const root = path.resolve(__dirname, '..');
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(read('.tmp/js/home/home.controller.js'), read('app/home/home.controller.js'));
  assert.equal(read('.tmp/views/home/home.view.html'), read('app/home/home.view.html'));
  const dom = new JSDOM(
    '<!doctype html><html><body><div ng-controller="HomeController as HomeCtrl">' +
      read('.tmp/views/home/home.view.html') +
      '</div></body></html>',
    { runScripts: 'outside-only', url: 'http://localhost:3000/' }
  );
  try {
    const window = dom.window;
    window.eval(read('.tmp/libs/angular.js'));
    const angular = window.angular;
    const transitions = [];
    let pending;
    angular
      .module('actinver_todolist', [])
      .value('$state', { go: (name) => transitions.push(name) })
      .factory('SignInService', [
        '$q',
        function ($q) {
          return {
            signIn: () => {
              pending = $q.defer();
              return pending.promise;
            }
          };
        }
      ])
      .run([
        '$templateCache',
        function (cache) {
          cache.put(
            'views/auth/signin/signin-form.html',
            read('.tmp/views/auth/signin/signin-form.html')
          );
        }
      ]);
    window.eval(read('.tmp/js/home/home.controller.js'));
    window.eval(read('.tmp/js/shared/form-validation.directive.js'));
    window.eval(read('.tmp/js/auth/signin/signin-form.component.js'));
    const injector = angular.bootstrap(window.document.body, ['actinver_todolist']);
    const scope = injector.get('$rootScope');
    const form = window.document.querySelector('form');
    for (const [name, value] of [
      ['username', 'test@example.com'],
      ['password', 'password123']
    ]) {
      const input = form.querySelector('[name="' + name + '"]');
      input.value = value;
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    }
    function submit() {
      form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      scope.$digest();
    }
    submit();
    pending.reject({ status: 401 });
    scope.$digest();
    assert.deepEqual(transitions, []);
    submit();
    assert.deepEqual(transitions, []);
    pending.resolve({ data: { access_token: 'token' } });
    scope.$digest();
    assert.deepEqual(transitions, ['listTasks']);
  } finally {
    dom.window.close();
  }
});

test('Full compiled app loads scripts and templates for every route', async () => {
  const root = path.resolve(__dirname, '..');
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  execFileSync(process.execPath, ['node_modules/gulp/bin/gulp.js', 'build:dist'], {
    cwd: root,
    stdio: 'pipe'
  });
  for (const folder of ['.tmp', 'dist']) {
    const fontsDirectory = path.join(root, 'node_modules/bootstrap/dist/fonts');
    for (const font of fs.readdirSync(fontsDirectory)) {
      assert.deepEqual(
        fs.readFileSync(path.join(root, folder, 'fonts', font)),
        fs.readFileSync(path.join(fontsDirectory, font)),
        'Font must be copied without binary corruption: ' + folder + '/' + font
      );
    }
    const bootstrapCss = read(folder + '/libs/bootstrap.css');
    const fontUrls = Array.from(
      bootstrapCss.matchAll(/url\(["']?([^)'" ]*glyphicons[^)'" ]*)["']?\)/g)
    );
    assert(fontUrls.length > 0);
    for (const match of fontUrls) {
      const fontPath = match[1].split(/[?#]/)[0];
      assert(
        fs.existsSync(path.resolve(root, folder, 'libs', fontPath)),
        'Bootstrap font URL must resolve: ' + match[1]
      );
    }
    const html = read(folder + '/index.html').replace('ng-app="actinver_todolist"', '');
    const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://localhost:3000/' });
    try {
      const window = dom.window;
      for (const script of window.document.querySelectorAll('script[src]')) {
        const src = script.getAttribute('src');
        assert(!src.startsWith('.tmp/'), 'Script URLs must be relative to the served root');
        window.eval(read(folder + '/' + src));
      }
      const angular = window.angular;
      angular
        .module('actinver_todolist')
        .config([
          '$provide',
          function ($provide) {
            $provide.decorator('$http', [
              '$delegate',
              '$q',
              function ($http, $q) {
                const get = $http.get;
                $http.get = function (url, options) {
                  if (url.includes('/api/ToDoLists')) {
                    return $q.resolve({
                      data: url.endsWith('/ToDoLists') ? [] : { id: 1, title: 'Test' }
                    });
                  }
                  return get(url, options);
                };
                return $http;
              }
            ]);
          }
        ])
        .run([
          '$templateCache',
          function (cache) {
            for (const file of fs.readdirSync(path.join(root, folder, 'views'), {
              recursive: true
            })) {
              if (file.endsWith('.html'))
                cache.put('views/' + file, read(folder + '/views/' + file));
            }
          }
        ]);
      const injector = angular.bootstrap(window.document, ['actinver_todolist']);
      const state = injector.get('$state');
      const scope = injector.get('$rootScope');
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      for (const [name, params] of [
        ['home', {}],
        ['signup', {}],
        ['signin', {}],
        ['listTasks', {}],
        ['detail', { taskid: 1 }]
      ]) {
        await state.go(name, params);
        scope.$digest();
        assert.equal(state.current.name, name);
        assert(window.document.querySelector('ui-view').textContent.trim().length > 0);
      }
      for (const link of window.document.querySelectorAll('link[rel="stylesheet"]')) {
        assert(fs.existsSync(path.join(root, folder, link.getAttribute('href'))));
      }
    } finally {
      dom.window.close();
    }
  }
});

test('Compiled task form validates create and edit, handles failures and blocks duplicate saves', () => {
  const root = path.resolve(__dirname, '..');
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(
    read('.tmp/js/tasks/task-form.component.js'),
    read('app/tasks/task-form.component.js')
  );
  assert.equal(read('.tmp/js/tasks/task.service.js'), read('app/tasks/task.service.js'));
  const dom = new JSDOM(
    '<!doctype html><html><body><task-form task="task" editing="editing" on-success="created = created + 1" on-update="updated = updated + 1"></task-form></body></html>',
    { runScripts: 'outside-only', url: 'http://localhost:3000/' }
  );
  try {
    const window = dom.window;
    window.eval(read('.tmp/libs/angular.js'));
    const angular = window.angular;
    const requests = [];
    let pending;
    angular
      .module('actinver_todolist', [])
      .constant('env', { api: 'http://localhost:1337/api' })
      .constant('toFormService', {})
      .constant('postSignIntFix', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .config([
        '$provide',
        function ($provide) {
          $provide.decorator('$http', [
            '$delegate',
            '$q',
            function ($http, $q) {
              for (const method of ['post', 'put']) {
                $http[method] = (url, data) => {
                  requests.push({ method, url, data });
                  pending = $q.defer();
                  return pending.promise;
                };
              }
              return $http;
            }
          ]);
        }
      ])
      .run([
        '$templateCache',
        '$rootScope',
        function (cache, scope) {
          cache.put('views/tasks/task-form.html', read('.tmp/views/tasks/task-form.html'));
          scope.task = {};
          scope.created = 0;
          scope.updated = 0;
        }
      ]);
    window.eval(read('.tmp/js/tasks/task.service.js'));
    window.eval(read('.tmp/js/shared/form-validation.directive.js'));
    window.eval(read('.tmp/js/tasks/task-form.component.js'));
    const injector = angular.bootstrap(window.document.body, ['actinver_todolist']);
    const scope = injector.get('$rootScope');
    const form = window.document.querySelector('form');
    const controller = angular
      .element(window.document.querySelector('task-form'))
      .controller('taskForm');
    function submit() {
      form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      scope.$digest();
    }
    function fill(name, value) {
      const input = form.querySelector('[name="' + name + '"]');
      input.value = value;
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
      scope.$digest();
    }
    submit();
    assert.equal(requests.length, 0);
    assert(form.textContent.includes('El título es obligatorio.'));
    fill('title', 'x'.repeat(201));
    submit();
    assert.equal(requests.length, 0);
    fill('title', 'Nueva tarea');
    fill('description', 'x'.repeat(10001));
    submit();
    assert.equal(requests.length, 0);
    fill('description', 'Detalle');
    fill('due', 'x'.repeat(101));
    submit();
    assert.equal(requests.length, 0);
    fill('due', '2026-11-15');
    scope.task.extra = 'must not be sent';
    submit();
    submit();
    assert.equal(requests.length, 1);
    assert.equal(form.querySelector('button').disabled, true);
    assert.deepEqual(Object.fromEntries(new URLSearchParams(requests[0].data)), {
      title: 'Nueva tarea',
      description: 'Detalle',
      due: '2026-11-15',
      done: 'false'
    });
    pending.reject({ status: 422 });
    scope.$digest();
    assert.equal(controller.error, 'Revisa los datos del formulario.');
    assert.equal(scope.created, 0);
    assert.equal(controller.sending, false);
    submit();
    pending.resolve({ data: { id: 1 } });
    scope.$digest();
    assert.equal(scope.created, 1);
    scope.editing = true;
    scope.task = {
      id: 42,
      title: 'Existente',
      description: 'Anterior',
      due: '2026-11-20',
      done: true
    };
    scope.$digest();
    assert.equal(form.querySelector('[name="due"]').value, '2026-11-20');
    assert(form.querySelector('button').textContent.includes('Guardar cambios'));
    submit();
    assert.equal(requests.at(-1).method, 'put');
    assert.equal(requests.at(-1).url, 'http://localhost:1337/api/ToDoLists/42');
    pending.resolve({ data: scope.task });
    scope.$digest();
    assert.equal(scope.updated, 1);
    assert.equal(scope.created, 1);
  } finally {
    dom.window.close();
  }
});

test('Task checkboxes persist completion in both directions and roll back failures', () => {
  const root = path.resolve(__dirname, '..');
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  const dom = new JSDOM(
    '<html><body><div ng-controller="TaskListController as taskListCtrl">' +
      read('.tmp/views/tasks/task-list.view.html') +
      '</div></body></html>',
    { runScripts: 'outside-only', url: 'http://localhost:3000/' }
  );
  try {
    const window = dom.window;
    window.eval(read('.tmp/libs/angular.js'));
    const angular = window.angular;
    const requests = [];
    const pending = [];
    const deletions = [];
    angular
      .module('actinver_todolist', [])
      .constant('$state', {})
      .constant('env', { api: 'http://localhost:1337/api' })
      .constant('toFormService', {})
      .constant('postSignIntFix', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .config([
        '$provide',
        function (provide) {
          provide.decorator('$http', [
            '$delegate',
            '$q',
            function (http, q) {
              http.get = () =>
                q.resolve({
                  status: 200,
                  data: [
                    {
                      id: 1,
                      title: 'Pendiente',
                      description: 'Detalle',
                      due: '2026-11-20',
                      done: false
                    },
                    { id: 2, title: 'Terminada', done: true }
                  ]
                });
              http.put = (url, data) => {
                requests.push({ url, data });
                const deferred = q.defer();
                pending.push(deferred);
                return deferred.promise;
              };
              http.delete = (url) => {
                deletions.push(url);
                return q.resolve({ status: 204 });
              };
              return http;
            }
          ]);
        }
      ]);
    window.eval(read('.tmp/js/tasks/task.service.js'));
    window.eval(read('.tmp/js/tasks/task-list.controller.js'));
    const injector = angular.bootstrap(window.document.body, ['actinver_todolist']);
    const scope = injector.get('$rootScope');
    const checkboxes = window.document.querySelectorAll('.list-group input[type="checkbox"]');
    assert.equal(checkboxes.length, 2);
    assert.equal(checkboxes[0].checked, false);
    assert.equal(checkboxes[1].checked, true);
    checkboxes[0].click();
    scope.$digest();
    assert.equal(checkboxes[0].disabled, true);
    checkboxes[0].click();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'http://localhost:1337/api/ToDoLists/1');
    assert.deepEqual(Object.fromEntries(new URLSearchParams(requests[0].data)), {
      title: 'Pendiente',
      description: 'Detalle',
      due: '2026-11-20',
      done: 'true'
    });
    pending[0].resolve({ data: { done: true } });
    scope.$digest();
    assert.equal(checkboxes[0].checked, true);
    assert.equal(checkboxes[0].disabled, false);
    checkboxes[1].click();
    scope.$digest();
    assert.equal(new URLSearchParams(requests[1].data).get('done'), 'false');
    pending[1].resolve({ data: { done: false } });
    scope.$digest();
    assert.equal(checkboxes[1].checked, false);
    checkboxes[0].click();
    scope.$digest();
    pending[2].reject({ status: 500 });
    scope.$digest();
    assert.equal(checkboxes[0].checked, true);
    assert.equal(checkboxes[0].disabled, false);
    assert(
      window.document.querySelector('[role="alert"]').textContent.includes('No se pudo actualizar')
    );
    checkboxes[0].click();
    scope.$digest();
    pending[3].resolve({ data: { done: false } });
    scope.$digest();
    assert.equal(checkboxes[0].checked, false);
    assert.equal(window.document.querySelector('[role="alert"]'), null);
    const deleteButton = window.document.querySelector('.list-group .btn-danger');
    window.confirm = () => false;
    deleteButton.click();
    scope.$digest();
    assert.equal(deletions.length, 0);
    window.confirm = () => true;
    deleteButton.click();
    scope.$digest();
    assert.deepEqual(deletions, ['http://localhost:1337/api/ToDoLists/1']);
  } finally {
    dom.window.close();
  }
});

test('Create and edit modals save, cancel copies, handle failures and refresh the list', () => {
  const root = path.resolve(__dirname, '..');
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  const dom = new JSDOM(
    '<html><body><div ng-controller="TaskController as tasksCtrl"><button id="add" ng-click="tasksCtrl.showAddTask()">Agregar</button><div ng-controller="TaskListController as taskListCtrl">' +
      read('.tmp/views/tasks/task-list.view.html') +
      '</div></div></body></html>',
    { runScripts: 'outside-only', url: 'http://localhost:3000/' }
  );
  try {
    const window = dom.window;
    window.eval(read('.tmp/libs/angular.js'));
    const angular = window.angular;
    const tasks = [];
    let reads = 0;
    let pendingCreate;
    let pendingUpdate;
    let updates = 0;
    angular
      .module('actinver_todolist', [])
      .constant('$state', {})
      .factory('TaskService', [
        '$q',
        function (q) {
          return {
            getTasks: () => {
              reads++;
              return q.resolve({ data: tasks.slice() });
            },
            updateTask: (task, id) => {
              assert.equal(id, 1);
              updates++;
              pendingUpdate = q.defer();
              return pendingUpdate.promise.then((response) => {
                tasks[0] = { ...task };
                return response;
              });
            },
            createTask: (task) => {
              pendingCreate = q.defer();
              return pendingCreate.promise.then(() => {
                const created = { ...task, id: tasks.length + 1 };
                tasks.push(created);
                return { status: 201, data: created };
              });
            }
          };
        }
      ])
      .run([
        '$templateCache',
        function (cache) {
          cache.put('views/tasks/task-form.html', read('.tmp/views/tasks/task-form.html'));
        }
      ]);
    for (const file of [
      'tasks.controller.js',
      'task-list.controller.js',
      'task-form.component.js'
    ]) {
      window.eval(read('.tmp/js/tasks/' + file));
    }
    window.eval(read('.tmp/js/shared/form-validation.directive.js'));
    window.eval(read('.tmp/js/shared/modal-dialog-focus.directive.js'));
    const injector = angular.bootstrap(window.document.body, ['actinver_todolist']);
    const scope = injector.get('$rootScope');
    assert.equal(reads, 1);
    window.document.querySelector('#add').click();
    scope.$digest();
    const form = window.document.querySelector('form');
    assert(form);
    const title = form.querySelector('[name="title"]');
    title.value = 'Tarea recién creada';
    title.dispatchEvent(new window.Event('input', { bubbles: true }));
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    scope.$digest();
    assert.equal(form.querySelector('[type="submit"]').disabled, true);
    pendingCreate.resolve();
    scope.$digest();
    assert.equal(reads, 2, 'Success must reload the task list');
    assert.equal(window.document.querySelector('form'), null, 'Parent closes the form');
    assert(
      window.document.querySelector('.list-group').textContent.includes('Tarea recién creada')
    );
    window.document.querySelector('#add').click();
    scope.$digest();
    assert.equal(
      window.document.querySelector('[name="title"]').value,
      '',
      'Next form starts empty'
    );
    assert(window.document.querySelector('#task-form-modal'));
    assert.equal(window.document.querySelector('#task-form-modal [type="submit"]').disabled, false);
    assert(window.document.body.classList.contains('modal-open'));
    window.document.querySelector('#task-form-modal .modal-footer button').click();
    scope.$digest();
    assert.equal(window.document.querySelector('#task-form-modal'), null);
    assert(!window.document.body.classList.contains('modal-open'));

    function openEdit() {
      window.document.querySelector('.list-group .btn-default').click();
      scope.$digest();
      assert(
        window.document.querySelector('#task-form-modal-title').textContent.includes('Editar tarea')
      );
    }
    function changeTitle(value) {
      const field = window.document.querySelector('#task-form-modal [name="title"]');
      field.value = value;
      field.dispatchEvent(new window.Event('input', { bubbles: true }));
      scope.$digest();
    }
    function submitTask() {
      window.document
        .querySelector('#task-form-modal form')
        .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      scope.$digest();
    }
    openEdit();
    assert.equal(window.document.querySelector('[name="title"]').value, 'Tarea recién creada');
    changeTitle('Cambios descartados');
    assert.equal(tasks[0].title, 'Tarea recién creada');
    const modal = window.document.querySelector('#task-form-modal');
    const close = modal.querySelector('.close');
    close.focus();
    close.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      })
    );
    assert.equal(window.document.activeElement, modal.querySelector('.modal-footer button'));
    modal.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    scope.$digest();
    assert.equal(window.document.querySelector('#task-form-modal'), null);
    assert.equal(updates, 0);
    openEdit();
    assert.equal(window.document.querySelector('[name="title"]').value, 'Tarea recién creada');
    changeTitle('Tarea editada');
    submitTask();
    assert.equal(window.document.querySelector('#task-form-modal .close').disabled, true);
    submitTask();
    assert.equal(updates, 1);
    pendingUpdate.reject({ status: 422 });
    scope.$digest();
    assert(
      window.document
        .querySelector('#task-form-modal [role="alert"]')
        .textContent.includes('Revisa los datos')
    );
    assert.equal(window.document.querySelector('[name="title"]').value, 'Tarea editada');
    assert.equal(tasks[0].title, 'Tarea recién creada');
    submitTask();
    pendingUpdate.resolve({ data: { id: 1 } });
    scope.$digest();
    assert.equal(updates, 2);
    assert.equal(window.document.querySelector('#task-form-modal'), null);
    assert.equal(reads, 3);
    assert(window.document.querySelector('.list-group').textContent.includes('Tarea editada'));

    window.document.querySelector('#add').click();
    scope.$digest();
    changeTitle('Segunda tarea');
    submitTask();
    pendingCreate.resolve();
    scope.$digest();
    assert.equal(window.document.querySelector('#task-form-modal'), null);
    assert.deepEqual(
      tasks.map((task) => task.title),
      ['Tarea editada', 'Segunda tarea']
    );
  } finally {
    dom.window.close();
  }
});
