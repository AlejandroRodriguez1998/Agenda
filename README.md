# 📘 Agenda Escolar

Aplicación web moderna para gestionar tu vida académica: horarios, tareas, exámenes y notas.  
Construida con **Next.js**, desplegada en **Vercel**, y con **Firebase** como backend.

## 🚀 Tecnologías utilizadas

- [Next.js](https://nextjs.org/) — Framework de React
- [Firebase](https://firebase.google.com/) — Backend as a Service (Auth, DB)
- [Vercel](https://vercel.com/) — Deploy hosting

## 📦 Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/AlejandroRodriguez1998/Agenda
cd Agenda
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto y añade:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
```

> Puedes obtener estos valores desde tu proyecto en [Firebase Console](https://console.firebase.google.com/).

## 🧪 Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en: [http://localhost:3000](http://localhost:3000)

## ☁️ Despliegue en Vercel

### 1. Crear cuenta en [Vercel](https://vercel.com/)
### 2. Importar este repositorio
### 3. En "Environment Variables", añade:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 4. Hacer deploy

¡Listo! Tu aplicación estará disponible en una URL del tipo:

```
https://agenda-topaz-two.vercel.app/
```

## 🗃 Configuración de Firebase

### 👤 Autenticación
- Activa el sistema de autenticación por email + contraseña.

### 🔒 Reglas de seguridad (Firestore)

Las reglas están versionadas en [`firestore.rules`](firestore.rules): cada usuario solo puede leer y
escribir sus propios documentos (`user_id`), no puede cambiar el dueño de un documento y los campos
se validan (tipos, longitudes, rangos de notas, fechas `YYYY-MM-DD`...). Para publicarlas:

```bash
npm i -g firebase-tools
firebase login
firebase use <tu-project-id>
firebase deploy --only firestore:rules
```

> Las consultas solo filtran por `user_id` y se ordenan en el cliente, así que **no hace falta ningún
> índice compuesto**.

### 📋 Colecciones (Firestore)

#### `asignaturas`
- `nombre` (string)
- `color` (string, hex)
- `curso` (number)
- `user_id` (string)
- `created_at` (timestamp)

#### `tareas`
- `titulo` (string)
- `fecha_entrega` (string, YYYY-MM-DD o null)
- `asignatura_id` (string)
- `completada` (boolean)
- `user_id` (string)
- `created_at` (timestamp)

#### `horario`
- `asignatura_id` (string)
- `tipo` (string: `teórica` | `laboratorio`)
- `hora` (string, HH:mm)
- `dias` (array de string: `lunes`…`domingo`)
- `user_id` (string)

#### `notas_academicas`
- `tipo` (string)
- `nota` (number, 0–10)
- `peso` (number, 1–100)
- `asignatura_id` (string)
- `user_id` (string)
- `created_at` (timestamp)

#### `eventos`
- `user_id` (string)
- `title` (string)
- `start` (string, YYYY-MM-DD)
- `color` (string, hex)

## 📱 PWA

- Service worker propio en [`public/sw.js`](public/sw.js) (sin `next-pwa`, que no es compatible con
  Turbopack). Cachea los estáticos de Next y la última versión de cada página para abrir sin conexión.
  Sube la constante `VERSION` si necesitas forzar la limpieza de cachés.
- Firestore usa caché persistente (IndexedDB): los datos se ven al instante y los cambios hechos sin
  conexión se sincronizan al volver.
- Solo se registra en producción (`npm run build && npm start` para probarlo en local).

## 🧱 Estructura

```
lib/          auth (sesión), data (datos en tiempo real), theme, tipos y utilidades
components/   AppShell (navegación), Dashboard, Modal (bottom sheet) y formularios
pages/        una página por sección; las rutas privadas se protegen en _app.tsx
```

## 🧠 Funcionalidades

- ✅ Registro e inicio de sesión
- ✅ Gestión de asignaturas y colores
- ✅ Registro de notas con cálculo automático de medias
- ✅ Calendario interactivo de eventos
- ✅ Modal para añadir, editar y eliminar eventos
- ✅ Diseño mobile-first con navegación inferior y formularios tipo *bottom sheet*
- ✅ Tema claro / oscuro
- ✅ Datos en tiempo real y funcionamiento sin conexión
- ✅ Soporte para multicuenta (usuarios aislados por Firebase)


## 📬 Contacto

Creado por **Alejandro Paniagua Rodriguez**  
📫 Puedes contactarme en [alexcr31@gmail.com](mailto:alexcr31@gmail.com)

> ¡Gracias por usar Agenda Escolar! 🎓
