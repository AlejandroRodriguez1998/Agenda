# 📘 Agenda Escolar

Aplicación web moderna para gestionar tu vida académica: horarios, tareas, exámenes y notas.  
Construida con **Next.js**, desplegada en **Vercel**, y con **Firebase** como backend.

## 🚀 Tecnologías utilizadas

- [Next.js](https://nextjs.org/) — Framework de React
- [Firebase](https://firebase.google.com/) — Backend as a Service (Auth, DB)
- [Vercel](https://vercel.com/) — Deploy hosting
- [Bootstrap 5](https://getbootstrap.com/) — Estilos
- [FullCalendar](https://fullcalendar.io/) — Calendario interactivo

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

Asegúrate de tener el proyecto creado y habilitar:

### 👤 Autenticación
- Activa el sistema de autenticación por email + contraseña.

### 📋 Colecciones necesarias (Firestore)

#### `asignaturas`
- `nombre` (string)
- `color` (string)
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
- `tipo` (string)
- `hora` (string, HH:mm)
- `dias` (array de string)
- `user_id` (string)

#### `notas_academicas`
- `tipo` (string)
- `nota` (number)
- `peso` (number)
- `asignatura_id` (string)
- `user_id` (string)
- `created_at` (timestamp)

#### `eventos`
- `user_id` (string)
- `title` (string)
- `start` (string, YYYY-MM-DD)
- `color` (string)

## 🧠 Funcionalidades

- ✅ Registro e inicio de sesión
- ✅ Gestión de asignaturas y colores
- ✅ Registro de notas con cálculo automático de medias
- ✅ Calendario interactivo de eventos
- ✅ Modal para añadir, editar y eliminar eventos
- ✅ Estilo adaptado a escritorio y móvil
- ✅ Soporte para multicuenta (usuarios aislados por Firebase)


## 📬 Contacto

Creado por **Alejandro Paniagua Rodriguez**  
📫 Puedes contactarme en [alexcr31@gmail.com](mailto:alexcr31@gmail.com)

> ¡Gracias por usar Agenda Escolar! 🎓
