# 🐾 Dame una Pata Web

Portal web y dashboard admin para [Dame una Pata Paraguay](https://www.instagram.com/dameunapatapy/) — ONG de rescate de perros y gatos en Paraguay.

## Descripción

Plataforma web que permite gestionar solicitudes de adopción, hogares temporales, donaciones y voluntariado. El bot de WhatsApp envía links a formularios online en lugar de documentos que se pierden en el chat.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Prisma
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod

## Primeros Pasos

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar DATABASE_URL en .env con tu connection string de PostgreSQL

# Aplicar migraciones
npx prisma migrate dev

# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Variables de Entorno

```env
DATABASE_URL=postgresql://user:***@host:5432/dameunapatadb
NEXTAUTH_SECRET=replace-with-a-long-random-string
NEXTAUTH_URL=http://localhost:3000
DEBUG_API_TOKEN=replace-with-debug-token
NEXT_PUBLIC_WHATSAPP_NUMBER=595991234567
```

## Estructura

```
src/
├── app/
│   ├── api/forms/        # API routes para formularios
│   ├── admin/            # Dashboard admin
│   ├── adoptar/         # Formulario de adopción
│   ├── dar-adopcion/     # Formulario para dar en adopción
│   └── gracias/          # Página post-submit
└── components/
    └── forms/            # Componentes de formularios
```

## Formularios

- [x] Adopción
- [x] Dar en adopción
- [ ] Hogar temporal (en desarrollo)
- [ ] Voluntariado (en desarrollo)

## Dashboard Admin

Implementado con NextAuth credentials:

- `/admin/login` — inicio de sesión.
- `/admin/dashboard` — listado y filtros de solicitudes.
- `/admin/solicitud/[id]` — detalle, aprobación y rechazo.

Para un entorno nuevo todavía es necesario crear el primer usuario admin en la base de datos con password bcrypt.

## License

ISC
