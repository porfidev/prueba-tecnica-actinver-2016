const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadServices(env) {
    const services = {};
    const module = {
        service(name, definition) {
            services[name] = definition;
            return this;
        }
    };
    const context = vm.createContext({ angular: { module: () => module }, console });
    for (const file of [
        'tasks/task.service.js',
        'auth/signin/signin.service.js',
        'auth/signup/signup.service.js',
        'core/token.interceptor.js'
    ]) {
        vm.runInContext(fs.readFileSync('app/' + file, 'utf8'), context);
    }
    const calls = [];
    const http = {};
    for (const method of ['get', 'post', 'put', 'delete']) {
        http[method] = (...args) => {
            calls.push({ method, args });
            return {
                then() {
                    return { catch() {} };
                }
            };
        };
    }
    const deps = {
        env,
        $http: http,
        $window: { localStorage: { access_token: 'test-token' } },
        toFormService: { convertJsonToFrom: (data) => data },
        postSignIntFix: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        $httpParamSerializerJQLike: (data) => new URLSearchParams(data).toString()
    };
    function get(name) {
        const definition = services[name];
        const constructor = Array.isArray(definition)
            ? definition[definition.length - 1]
            : definition;
        const names = Array.isArray(definition) ? definition.slice(0, -1) : constructor.$inject;
        return Reflect.construct(
            constructor,
            names.map((name) => deps[name])
        );
    }
    return { get, calls };
}

for (const api of ['http://localhost:1337/api', 'https://example.com/custom/api/']) {
    test('All seven requests use configuration: ' + api, () => {
        const tokenUrl = 'https://login.example.com/Token';
        const { get, calls } = loadServices({ api, tokenUrl });
        const tasks = get('TaskService');
        tasks.getTasks();
        tasks.getTask(42);
        tasks.createTask({ title: 'Test' });
        tasks.updateTask({ title: 'Updated' }, 42);
        tasks.deleteTask({ id: 42 });
        get('SignUpService').signUp({ email: 'test@example.com' });
        get('SignInService').signIn({ username: 'test@example.com' });
        const base = api.replace(/\/+$/, '');
        assert.deepEqual(
            calls.map((call) => call.args[0]),
            [
                base + '/ToDoLists',
                base + '/ToDoLists/42',
                base + '/ToDoLists',
                base + '/ToDoLists/42',
                base + '/ToDoLists/42',
                base + '/Account/Register',
                tokenUrl
            ]
        );
        assert.equal(calls[4].args[1].headers['Content-Type'], 'application/x-www-form-urlencoded');
    });
}

test('Token is attached only to protected API requests', () => {
    const api = 'http://localhost:1337/api';
    const { get } = loadServices({ api, tokenUrl: 'http://localhost:1337/Token' });
    const interceptor = get('tokenInterceptor');
    for (const url of [
        api + '/Account/Register',
        'http://localhost:1337/Token',
        'views/tasks/task-form.html',
        'https://other.example/api',
        api + '-other/tasks'
    ]) {
        assert.equal(interceptor.request({ url, headers: {} }).headers.Authorization, undefined);
    }
    assert.equal(
        interceptor.request({ url: api + '/ToDoLists', headers: {} }).headers.Authorization,
        'Bearer test-token'
    );
});
