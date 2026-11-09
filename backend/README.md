# API de tareas — FastAPI (Python)

Requiere Python 3.11 o posterior; se recomienda Python 3.13 estable.
Desde la raíz del repositorio:

```sh
./backend/start.sh
```

El script crea `.venv` si hace falta, instala las dependencias al primer inicio
o cuando cambia `requirements.txt` y levanta el servidor con recarga automática.
También funciona desde `backend` con `./start.sh`. Puedes cambiar la dirección
y el puerto con `HOST=0.0.0.0 PORT=8000 ./backend/start.sh`, y pasar opciones
adicionales de Uvicorn como argumentos.

Para realizar los pasos manualmente:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 1337
```

Documentación interactiva: http://localhost:1337/docs
Esquema OpenAPI: http://localhost:1337/openapi.json

SQLite se crea automáticamente en `backend/data/app.sqlite3`. Usuarios,
contraseñas derivadas con PBKDF2 y sal aleatoria, tokens y tareas persisten entre
reinicios. Los tokens Bearer son opacos, caducan en 24 horas y se almacenan
únicamente como hashes. Cada usuario solo tiene acceso a sus propias tareas.
No se crean usuarios ni contraseñas predeterminados.

## Contrato compatible con Angular

| Método | Ruta | Entrada |
|---|---|---|
| POST | /api/Account/Register | JSON: email, password, confirmpassword |
| POST | /Token | Formulario: username (correo), password, grant_type=password |
| GET | /api/ToDoLists | Lista del usuario autenticado |
| GET | /api/ToDoLists/{id} | Tarea individual |
| POST | /api/ToDoLists | Formulario: title, description, due, done |
| PUT | /api/ToDoLists/{id} | Formulario: title, description, due, done |
| DELETE | /api/ToDoLists/{id} | Sin cuerpo; devuelve 204 |

Las cinco rutas de tareas requieren `Authorization: Bearer <access_token>`.
Las respuestas de tareas conservan `id`, `title`, `description`, `due` y `done`.
`due` se conserva como texto por compatibilidad con el formulario existente.
PUT reemplaza los campos editables; los campos opcionales omitidos toman su
valor predeterminado. El listado devuelve un arreglo directo.
Registro devuelve 201; correo duplicado, 409; validación, 422; credenciales o
token inválido, 401; tarea inexistente o ajena, 404.

## Configuración

Variables de entorno opcionales:

- `DATABASE_PATH`: ruta del archivo SQLite. Por defecto, `backend/data/app.sqlite3`.
- `CORS_ORIGINS`: orígenes permitidos separados por comas. Por defecto,
  `http://localhost:3000,http://127.0.0.1:3000`.

El frontend obtiene las direcciones de `configFile.json`: `env.api` define
la base de tareas y registro, y `env.tokenUrl` define la URL completa de login.
La configuración local apunta a este backend en el puerto 1337.
`/Token` está fuera del prefijo `/api`. Reiniciar la compilación y recargar
el navegador después de modificar la configuración; `npm start` también observa
los cambios en este archivo.

## Pruebas

```sh
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

`requirements.lock.txt` registra las versiones exactas usadas en la verificación
(incluye herramientas de pruebas); se puede instalar con
`python -m pip install -r requirements.lock.txt`.

Las pruebas usan una base temporal y comprueban autenticación, CRUD, aislamiento
entre usuarios, validación, caducidad, persistencia y CORS.

Para un despliegue público, configurar HTTPS en el alojamiento y limitación de
intentos de inicio de sesión en el proxy o aplicación. `--reload` es para desarrollo.
