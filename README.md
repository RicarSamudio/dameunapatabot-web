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
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-long-temporary-password
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

## Idempotencia de formularios

Los endpoints `POST /api/forms/*` aceptan opcionalmente:

```http
Idempotency-Key: <identificador estable de 16 a 128 caracteres>
```

Repetir la misma key y payload devuelve la solicitud original. Reutilizarla con otro payload devuelve `409 IDEMPOTENCY_CONFLICT`. El índice único persistente evita duplicados tras reinicios, réplicas o respuestas de red perdidas.

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

Para un entorno nuevo podés crear o actualizar el primer admin con:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='una-password-larga' npm run db:seed
```

## Base de datos y deploy

Scripts útiles:

```bash
npm run db:migrate # ejecuta prisma migrate deploy
npm run db:seed    # crea/actualiza el admin si ADMIN_EMAIL y ADMIN_PASSWORD están definidos
```

El contenedor Docker ejecuta `prisma migrate deploy` antes de `npm start` mediante `scripts/start-production.sh`.

Checklist mínimo de producción:

1. Configurar `DATABASE_URL`, `NEXTAUTH_SECRET` y `NEXTAUTH_URL` en el entorno runtime.
2. Ejecutar migraciones con `npm run db:migrate` o dejar que el contenedor las ejecute al iniciar.
3. Crear el usuario admin inicial con `npm run db:seed` y luego rotar/eliminar `ADMIN_PASSWORD` del entorno si no se necesita.
4. Verificar que `public/uploads` sea persistente o migrar uploads a storage externo antes de abrir el sitio al público.

## License

ISC
