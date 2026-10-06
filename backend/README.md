# Backend (NestJS)

Interview / product base API. **No domain features in the template** — only wiring. Add features using the structure below.

## Stack

| Piece | Location |
|-------|----------|
| NestJS bootstrap | `src/main.ts` |
| Env loading | `src/load-env.ts` + `backend/.env` |
| Postgres + ORM | `sequelize` + `sequelize-typescript` |
| Migrations | Sequelize CLI → `src/database/migrations/*.cjs` |
| Request validation | Global `ValidationPipe` + `class-validator` DTOs |

## Folder layout

```text
src/
  main.ts                          # reflect-metadata, loadEnv, connect DB, ValidationPipe, listen
  load-env.ts
  common/
    validation/validation.pipe.ts  # shared ValidationPipe options
  database/
    database-config.ts             # DATABASE_* from env
    create-sequelize.ts            # Sequelize + sequelizeModels
    db.ts                          # connect / disconnect singleton
    config.cjs                     # sequelize-cli only (migrations)
    migrations/                    # schema changes (.cjs)
    models/
      index.ts                     # export sequelizeModels = [ ... ]
      <entity>.model.ts            # @Table decorated classes
  app/
    app.module.ts                  # register controllers + providers
    controllers/
      <feature>.controller.ts      # HTTP layer only
    services/
      <feature>.service.ts         # business logic
    repositories/
      <feature>.repository.ts      # DB access (models / queries)
    dtos/
      <action>-<feature>.dto.ts    # class-validator for body/query/params
```

## Adding a feature (checklist)

Use a **singular resource name** (e.g. `url`, `order`). Repeat per resource.

1. **Migration** (schema source of truth — do not use `sync()` in prod)
   ```bash
   cd backend
   npm run db:migrate:add -- create-urls
   # edit src/database/migrations/<timestamp>-create-urls.cjs
   npm run db:migrate
   ```
2. **Model** — `src/database/models/url.model.ts` (match migration columns; register in `models/index.ts`).
3. **Repository** — `@Injectable()` class; call `Url.findAll()`, `Url.create()`, etc.
4. **Service** — orchestration, rules, map DTO → repository inputs.
5. **DTOs** — `class-validator` decorators on fields in `app/dtos/`.
6. **Controller** — routes; `@Body() dto: CreateUrlDto`, `@Param()`, `@Query()` as needed.
7. **Module** — add controller + service + repository to `app.module.ts` (or a feature `*.module.ts` imported by `AppModule`).

## Validation

- Enabled globally in `main.ts`: `app.useGlobalPipes(createValidationPipe())`.
- Options: `whitelist`, `forbidNonWhitelisted`, `transform` (`common/validation/validation.pipe.ts`).
- Controllers use typed DTOs; invalid requests return **400** before the handler runs.

Example DTO:

```ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}
```

## Database scripts

| Command | Purpose |
|---------|---------|
| `npm run db:migrate:add -- <name>` | New migration file |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:migrate:undo` | Revert last migration |
| `npm run db:migrate:status` | Executed vs pending |

Run all DB commands from **`backend/`** (`.sequelizerc` + `.env`).

## Conventions

- ESM: import paths use **`.js`** extension in TypeScript sources.
- **Controller** → **Service** → **Repository** → **Model** (no SQL in controllers).
- Keep `GET /health` on `AppController` for smoke checks.
- Do not commit `backend/.env`; use `.env.example`.
