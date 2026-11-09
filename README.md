# Actinver ToDo List

Frontend AngularJS 1.8 con Bootstrap 3.4.1 y backend FastAPI en `backend/`.

## Desarrollo

```sh
npm install
npm start
```

El frontend se sirve en http://localhost:3000. Las direcciones de la API se
configuran en `configFile.json` (`env.api` y `env.tokenUrl`). Las instrucciones
del servidor están en [backend/README.md](backend/README.md).

## Organización del frontend

La estructura agrupa archivos por funcionalidad, siguiendo el criterio de
[carpetas por funcionalidad de John Papa para AngularJS](https://github.com/johnpapa/angular-styleguide/blob/main/a1/README.md#application-structure).

```text
app/
  app.module.js       Declaración del módulo AngularJS principal
  app.config.js       Configuración general
  app.routes.js       Estados y rutas de UI Router
  auth/
    signin/           Pantalla, componente, plantilla y servicio de acceso
    signup/           Pantalla, componente, plantilla y servicio de registro
  core/               Constantes HTTP e interceptor de autenticación
  home/               Pantalla de inicio
  layout/             Layout compartido de autenticación
  shared/             Directivas y utilidades compartidas
  tasks/              Pantallas, formulario y servicio de tareas
  assets/sass/        Estilos propios
```

Se conserva el módulo único `actinver_todolist`. Las carpetas organizan el código;
no crean módulos AngularJS por sí mismas.

## Compilación y plantillas

```sh
npm run build        # .tmp/: configuración local
npm run build:dist   # dist/: configuración production y archivos minificados
npm test            # Pruebas, compilación y navegación con AngularJS
npm run format:check
npm run format
```

Gulp limpia el directorio de salida antes de compilar, copia todos los JavaScript
de `app/` a `js/` y todos los HTML a `views/`, conservando sus subcarpetas.
Por ejemplo:

```text
app/auth/signup/signup-form.html
→ .tmp/views/auth/signup/signup-form.html
→ templateUrl: 'views/auth/signup/signup-form.html'
```

El HTML generado carga primero Angular y las librerías, después `app.module.js`,
la configuración generada, las declaraciones `*.module.js` y el resto del código.
Los nuevos archivos se incluyen automáticamente. `npm start` observa altas,
cambios y bajas de archivos y vuelve a generar el índice.

Los archivos generados en `.tmp/` y `dist/` no se editan ni se versionan.

## Orden de las declaraciones AngularJS

En controladores y servicios, mantener este orden:

1. Registro en el módulo y anotación explícita de dependencias.
2. Referencia a la instancia (`vm`) y variables internas necesarias.
3. Propiedades de estado, ordenadas alfabéticamente.
4. Métodos públicos, ordenados alfabéticamente y asignados a funciones nombradas.
5. Hooks de ciclo de vida, como `$onInit`.
6. Inicialización existente, cuando corresponda, y funciones de implementación.

En componentes, declarar `bindings`, `templateUrl` y `controller`; ordenar los
bindings alfabéticamente. Conservar el orden de las dependencias en las anotaciones
para que coincida con los parámetros de la función.
