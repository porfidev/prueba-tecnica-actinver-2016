"""API compatible con el cliente Angular existente."""
import hashlib
import hmac
import os
import secrets
import sqlite3
import time
from contextlib import asynccontextmanager, contextmanager
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field, model_validator


class Registration(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirmpassword: str

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.confirmpassword:
            raise ValueError('Las contraseñas no coinciden')
        return self


class TaskInput(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default='', max_length=10000)
    due: str = Field(default='', max_length=100)
    done: bool = False


class Task(TaskInput):
    id: int


class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    expires_in: int


def password_hash(password, salt):
    return hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 600000).hex()


def create_app(database_path=None):
    database = Path(database_path or os.getenv('DATABASE_PATH', Path(__file__).resolve().parents[1] / 'data/app.sqlite3'))

    @contextmanager
    def connect():
        conn = sqlite3.connect(database)
        conn.row_factory = sqlite3.Row
        conn.execute('PRAGMA foreign_keys = ON')
        try:
            with conn:
                yield conn
        finally:
            conn.close()

    @asynccontextmanager
    async def lifespan(app):
        database.parent.mkdir(parents=True, exist_ok=True)
        with connect() as db:
            db.executescript('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL,
                    salt TEXT NOT NULL, password_hash TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS tokens (
                    digest TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
                    expires_at INTEGER NOT NULL);
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
                    title TEXT NOT NULL, description TEXT NOT NULL,
                    due TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0);
            ''')
        yield

    app = FastAPI(title='Actinver Todo API', version='1.0.0', lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(','),
        allow_methods=['GET', 'POST', 'PUT', 'DELETE'],
        allow_headers=['Authorization', 'Content-Type'],
    )
    bearer = OAuth2PasswordBearer(tokenUrl='/Token')

    def current_user(token: Annotated[str, Depends(bearer)]):
        digest = hashlib.sha256(token.encode()).hexdigest()
        with connect() as db:
            row = db.execute('SELECT user_id FROM tokens WHERE digest=? AND expires_at>?', (digest, int(time.time()))).fetchone()
        if row is None:
            raise HTTPException(401, 'Token inválido o expirado', headers={'WWW-Authenticate': 'Bearer'})
        return row['user_id']

    User = Annotated[int, Depends(current_user)]

    @app.post('/api/Account/Register', status_code=201)
    def register(user: Registration):
        salt = secrets.token_hex(16)
        hashed = password_hash(user.password, salt)
        try:
            with connect() as db:
                db.execute('INSERT INTO users (email,salt,password_hash) VALUES (?,?,?)', (str(user.email).lower(), salt, hashed))
        except sqlite3.IntegrityError:
            raise HTTPException(409, 'El correo ya está registrado')
        return {'message': 'Usuario registrado'}

    @app.post('/Token', response_model=Token)
    def login(username: Annotated[str, Form()], password: Annotated[str, Form(max_length=128)], grant_type: Annotated[str, Form()] = 'password'):
        if grant_type != 'password':
            raise HTTPException(400, 'grant_type no soportado')
        with connect() as db:
            user = db.execute('SELECT * FROM users WHERE email=?', (username.lower(),)).fetchone()
            # Also hash unknown users to avoid an immediate timing difference.
            hashed = password_hash(password, user['salt'] if user else '00' * 16)
            if user is None or not hmac.compare_digest(hashed, user['password_hash']):
                raise HTTPException(401, 'Credenciales incorrectas', headers={'WWW-Authenticate': 'Bearer'})
            token = secrets.token_urlsafe(32)
            ttl = 86400
            db.execute('DELETE FROM tokens WHERE expires_at<=?', (int(time.time()),))
            db.execute('INSERT INTO tokens VALUES (?,?,?)', (hashlib.sha256(token.encode()).hexdigest(), user['id'], int(time.time()) + ttl))
        return Token(access_token=token, expires_in=ttl)

    def task_row(db, task_id, user_id):
        row = db.execute('SELECT id,title,description,due,done FROM tasks WHERE id=? AND user_id=?', (task_id, user_id)).fetchone()
        if row is None:
            raise HTTPException(404, 'Tarea no encontrada')
        return dict(row)

    @app.get('/api/ToDoLists', response_model=list[Task])
    def list_tasks(user: User):
        with connect() as db:
            return [dict(row) for row in db.execute('SELECT id,title,description,due,done FROM tasks WHERE user_id=? ORDER BY id', (user,))]

    @app.get('/api/ToDoLists/{task_id}', response_model=Task)
    def get_task(task_id: int, user: User):
        with connect() as db:
            return task_row(db, task_id, user)

    @app.post('/api/ToDoLists', response_model=Task, status_code=201)
    def create_task(data: Annotated[TaskInput, Form()], user: User):
        with connect() as db:
            cursor = db.execute('INSERT INTO tasks (user_id,title,description,due,done) VALUES (?,?,?,?,?)', (user, data.title, data.description, data.due, data.done))
            return task_row(db, cursor.lastrowid, user)

    @app.put('/api/ToDoLists/{task_id}', response_model=Task)
    def update_task(task_id: int, data: Annotated[TaskInput, Form()], user: User):
        with connect() as db:
            task_row(db, task_id, user)
            db.execute('UPDATE tasks SET title=?,description=?,due=?,done=? WHERE id=? AND user_id=?', (data.title, data.description, data.due, data.done, task_id, user))
            return task_row(db, task_id, user)

    @app.delete('/api/ToDoLists/{task_id}', status_code=204)
    def delete_task(task_id: int, user: User):
        with connect() as db:
            task_row(db, task_id, user)
            db.execute('DELETE FROM tasks WHERE id=? AND user_id=?', (task_id, user))
        return Response(status_code=204)

    return app


app = create_app()
