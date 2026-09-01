# build-budget-app

Monorepo: Next.js (apps/web) + Nest.js (apps/api), PostgreSQL + Redis w Dockerze.

## Pierwsze uruchomienie

```bash
# 1. Skopiuj zmienne środowiskowe
cp .env.example .env

# 2. Uruchom bazę i Redis
npm run docker:up

# 3. Zainstaluj zależności (root + oba workspace'y)
npm install

# 4. Wygeneruj klienta Prisma i zastosuj schemat
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# 5. Uruchom backend i frontend (dwa terminale)
npm run dev:api
npm run dev:web
```

Frontend: http://localhost:3000
API health-check: http://localhost:4000/health

## Struktura

```
apps/
  web/    -> Next.js (App Router, TS, Tailwind, React Query, Recharts)
  api/    -> Nest.js (Prisma, PostgreSQL, Redis/BullMQ, JWT auth)
docker-compose.yml -> Postgres + Redis do developmentu
```

## Dalsze kroki (patrz: dokument architektury)

1. AuthModule (JWT + refresh tokens)
2. ProjectsModule, StagesModule, ExpensesModule (CRUD + Prisma)
3. DocumentsModule (upload do S3 przez presigned URL)
4. ReportsModule (generowanie PDF w kolejce BullMQ)
5. BillingModule (Stripe Checkout + webhooks)
6. WebSocket Gateway (współdzielenie projektu w czasie rzeczywistym)
