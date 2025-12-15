# Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── ui/         # shadcn/ui primitives
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities (trpc client, utils)
│   │   ├── pages/          # Route page components
│   │   └── _core/          # Core/framework hooks (auth)
│   └── public/             # Static assets
│
├── server/                 # Backend Express + tRPC
│   ├── routers/            # Feature-specific tRPC routers
│   ├── _core/              # Core infrastructure
│   │   ├── trpc.ts         # tRPC setup, procedures
│   │   ├── context.ts      # Request context creation
│   │   └── env.ts          # Environment config
│   ├── routers.ts          # Main router aggregation
│   ├── db.ts               # Database queries
│   └── storage.ts          # File storage helpers
│
├── shared/                 # Code shared between client/server
│   ├── const.ts            # Shared constants
│   ├── types.ts            # Type exports
│   └── _core/              # Core shared utilities
│
├── drizzle/                # Database schema and migrations
│   ├── schema.ts           # Drizzle table definitions
│   └── *.sql               # Generated migrations
```

## Conventions

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

### tRPC Procedures
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authenticated user
- `adminProcedure` - Requires admin role

### Adding Features
1. Define schema in `drizzle/schema.ts`
2. Add queries in `server/db.ts`
3. Create router in `server/routers/<feature>.ts`
4. Register router in `server/routers.ts`
5. Add pages/components in `client/src/`

### Database
- Tables use camelCase column names
- Types exported from schema: `User`, `InsertUser`, etc.
- Lazy DB connection via `getDb()` for graceful degradation
