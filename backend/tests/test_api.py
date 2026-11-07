import sqlite3

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def api(tmp_path):
    database = tmp_path / 'test.sqlite3'
    with TestClient(create_app(database)) as client:
        yield client, database


def auth(client, email='one@example.com'):
    data = dict(email=email, password='password123', confirmpassword='password123')
    assert client.post('/api/Account/Register', json=data).status_code == 201
    response = client.post('/Token', data=dict(username=email, password=data['password'], grant_type='password'))
    assert response.status_code == 200
    return {'Authorization': 'Bearer ' + response.json()['access_token']}


def test_crud_and_user_isolation(api):
    client, database = api
    first = auth(client)
    second = auth(client, 'two@example.com')
    assert client.get('/api/ToDoLists').status_code == 401
    response = client.post('/api/ToDoLists', data=dict(title='Prueba', description='Detalle', due='2026-11-10', done='false'), headers=first)
    assert response.status_code == 201
    task = response.json()
    assert task['done'] is False
    route = '/api/ToDoLists/' + str(task['Id'])
    assert client.get('/api/ToDoLists', headers=first).json() == [task]
    assert client.get(route, headers=first).json() == task
    assert client.get('/api/ToDoLists', headers=second).json() == []
    for method in ('get', 'put', 'delete'):
        kwargs = {'data': {'title': 'Intruso'}} if method == 'put' else {}
        assert getattr(client, method)(route, headers=second, **kwargs).status_code == 404
    response = client.put(route, data=dict(title='Editada', done='true'), headers=first)
    assert response.status_code == 200
    assert response.json()['done'] is True
    assert client.delete(route, headers=first).status_code == 204
    assert client.get(route, headers=first).status_code == 404


def test_auth_and_validation(api):
    client, database = api
    headers = auth(client)
    data = dict(email='one@example.com', password='password123', confirmpassword='password123')
    assert client.post('/api/Account/Register', json=data).status_code == 409
    data['confirmpassword'] = 'different'
    assert client.post('/api/Account/Register', json=data).status_code == 422
    assert client.post('/Token', data=dict(username=data['email'], password='wrong')).status_code == 401
    assert client.post('/api/ToDoLists', data={'title': ''}, headers=headers).status_code == 422
    assert client.get('/api/ToDoLists', headers={'Authorization': 'Bearer invalid'}).status_code == 401
    with sqlite3.connect(database) as db:
        db.execute('UPDATE tokens SET expires_at=0')
    assert client.get('/api/ToDoLists', headers=headers).status_code == 401


def test_persistence_and_cors(api):
    client, database = api
    headers = auth(client)
    client.post('/api/ToDoLists', data={'title': 'Persistente'}, headers=headers)
    with TestClient(create_app(database)) as restarted:
        assert restarted.get('/api/ToDoLists', headers=headers).json()[0]['title'] == 'Persistente'
    response = client.options('/api/ToDoLists', headers={
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
    })
    assert response.status_code == 200
    assert response.headers['access-control-allow-origin'] == 'http://localhost:3000'

