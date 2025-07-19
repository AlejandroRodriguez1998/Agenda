# 📘 Agenda Escolar

Aplicación web moderna para gestionar tu vida académica: horarios, tareas, exámenes y notas.  
Construida con **Next.js**, desplegada en **Vercel**, y con **Supabase** como backend.

---

## 🚀 Tecnologías utilizadas

- [Next.js](https://nextjs.org/) — Framework de React
- [Supabase](https://supabase.com/) — Backend as a Service (Auth, DB)
- [Vercel](https://vercel.com/) — Deploy hosting
- [Bootstrap 5](https://getbootstrap.com/) — Estilos
- [FullCalendar](https://fullcalendar.io/) — Calendario interactivo

---

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
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyXXXX...
```

> Puedes obtener estos valores desde tu proyecto en [Supabase](https://supabase.com/project/).

---

## 🧪 Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Despliegue en Vercel

### 1. Crear cuenta en [Vercel](https://vercel.com/)
### 2. Importar este repositorio
### 3. En "Environment Variables", añade:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Hacer deploy

¡Listo! Tu aplicación estará disponible en una URL del tipo:

```
https://agenda-topaz-two.vercel.app/
```

---

## 🗃️ Configuración de Supabase

Asegúrate de tener las siguientes tablas en Supabase:

### 🔐 Autenticación
- Activa el sistema de autenticación por email + contraseña.

### 📋 Tablas necesarias

#### `asignaturas`
| Campo        | Tipo    |
|--------------|---------|
| id           | UUID (PK) |
| nombre       | text    |
| color        | text    |
| user_id      | UUID (FK a auth.users) |

#### `notas`
| Campo        | Tipo    |
|--------------|---------|
| id           | UUID (PK) |
| tipo         | text    |
| nota         | numeric |
| peso         | numeric |
| asignatura_id| UUID (FK) |
| created_at   | timestamptz |

#### `eventos`
| Campo    | Tipo    |
|----------|---------|
| id       | UUID (PK) |
| user_id  | UUID (FK a auth.users) |
| titulo   | text    |
| empiece  | date    |
| color    | text    |
| created_at | timestamptz |

---

## 🧠 Funcionalidades

- ✅ Registro e inicio de sesión
- ✅ Gestión de asignaturas y colores
- ✅ Registro de notas con cálculo automático de medias
- ✅ Calendario interactivo de eventos
- ✅ Modal para añadir, editar y eliminar eventos
- ✅ Estilo adaptado a escritorio y móvil
- ✅ Soporte para multicuenta (usuarios aislados por Supabase)

---

## 📬 Contacto

Creado por **Alejandro Paniagua Rodriguez**  
📫 Puedes contactarme en [alexcr31@gmail.com](mailto:alexcr31@gmail.com)

---

> ¡Gracias por usar Agenda Escolar! 🎓
