const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function component(signUp) {
  let definition;
  vm.runInNewContext(fs.readFileSync('app/auth/signup/signup-form.component.js', 'utf8'), {
    angular: {
      module: () => ({
        component: (name, value) => {
          definition = value;
        }
      })
    }
  });
  const Controller = definition.controller[definition.controller.length - 1];
  const controller = new Controller({ signUp });
  controller.user = {
    email: 'test@example.com',
    password: 'password123',
    confirmpassword: 'password123'
  };
  controller.signupForm = { $valid: true };
  controller.onSuccess = () => {};
  return controller;
}

test('Invalid, pending and mismatched forms do not call the API', () => {
  let requests = 0;
  const controller = component(() => {
    requests++;
  });
  controller.signupForm = undefined;
  controller.signUp();
  controller.signupForm = {};
  controller.signUp();
  controller.signupForm = { $valid: false, $invalid: true };
  controller.signUp();
  controller.signupForm = { $valid: true, $pending: { email: true } };
  controller.signUp();
  controller.signupForm = { $valid: true };
  controller.user.confirmpassword = 'different';
  controller.signUp();
  assert.equal(requests, 0);
  assert.equal(controller.sending, false);
});

test('A pending request prevents duplicates and notifies success only after completion', async () => {
  let finish;
  let requests = 0;
  let successes = 0;
  const controller = component(() => {
    requests++;
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  controller.onSuccess = () => {
    successes++;
  };
  const request = controller.signUp();
  controller.signUp();
  assert.equal(requests, 1);
  assert.equal(controller.sending, true);
  assert.equal(successes, 0);
  finish({ status: 201 });
  await request;
  assert.equal(successes, 1);
  assert.equal(controller.sending, false);
});

for (const [status, message] of [
  [409, 'Ese correo ya está registrado.'],
  [422, 'Revisa los datos del formulario.'],
  [-1, 'No se pudo completar el registro. Intenta nuevamente.']
]) {
  test('API error ' + status + ' shows a message and allows retry', async () => {
    let successes = 0;
    let requests = 0;
    const controller = component(() => {
      requests++;
      return requests === 1 ? Promise.reject({ status }) : Promise.resolve({ status: 201 });
    });
    controller.onSuccess = () => {
      successes++;
    };
    await controller.signUp();
    assert.equal(controller.error, message);
    assert.equal(controller.sending, false);
    assert.equal(successes, 0);
    await controller.signUp();
    assert.equal(controller.error, '');
    assert.equal(successes, 1);
  });
}

test('Registration service propagates HTTP errors to the component', async () => {
  let Service;
  vm.runInNewContext(fs.readFileSync('app/auth/signup/signup.service.js', 'utf8'), {
    angular: {
      module: () => ({
        service: (name, value) => {
          Service = value;
        }
      })
    }
  });
  const failure = { status: 409 };
  const service = new Service(
    { post: () => Promise.reject(failure) },
    { api: 'http://localhost:1337/api' }
  );
  await assert.rejects(service.signUp({}), (error) => error === failure);
});

test('Registration sends only user fields, without form metadata or extra properties', async () => {
  let Service;
  vm.runInNewContext(fs.readFileSync('app/auth/signup/signup.service.js', 'utf8'), {
    angular: {
      module: () => ({
        service: (name, value) => {
          Service = value;
        }
      })
    }
  });
  let payload;
  const service = new Service(
    {
      post: (url, data) => {
        payload = data;
        return Promise.resolve({ status: 201 });
      }
    },
    { api: 'http://localhost:1337/api' }
  );
  const controller = component((user) => service.signUp(user));
  controller.user.extra = 'must not be sent';
  controller.user.$valid = true;
  controller.signupForm.secret = 'form metadata';
  await controller.signUp();
  assert.deepEqual(JSON.parse(JSON.stringify(payload)), {
    email: 'test@example.com',
    password: 'password123',
    confirmpassword: 'password123'
  });
});
