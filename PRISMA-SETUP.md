# Prisma Setup Guide

## ✅ What's Been Configured

1. **Prisma Client Generated**: The Prisma client has been successfully generated to `lib/generated/prisma/`
2. **Dependencies Installed**: All Prisma packages are installed (@prisma/client, @prisma/adapter-pg, pg)
3. **NPM Scripts Added**: Easy-to-use scripts for common Prisma operations (see below)

## 🔧 Current Status

- ✅ Prisma CLI: v7.8.0
- ✅ @prisma/client: v7.8.0
- ✅ Schema: `prisma/schema.prisma`
- ✅ Generated Client: `lib/generated/prisma/`
- ⚠️ **DATABASE_URL**: Needs to be added to `.env` file

## 📋 Required: Database URL Configuration

**You must add your PostgreSQL database URL to the `.env` file:**

```bash
# In .env file
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

For Neon PostgreSQL, the format is:
```bash
DATABASE_URL="postgresql://[user]:[password]@[neon-host]/[database]?sslmode=require"
```

## 🚀 Available NPM Scripts

**Instead of using `npx` commands, your team can use these npm scripts:**

```bash
# Generate Prisma Client (run this after schema changes)
npm run prisma:generate

# Open Prisma Studio (visual database editor)
npm run prisma:studio

# Push schema changes to database (for development)
npm run prisma:push

# Create and run migrations (for production)
npm run prisma:migrate

# Format the Prisma schema file
npm run prisma:format

# Pull schema from existing database
npm run prisma:pull
```

## 🔄 Common Workflows

### After Pulling from Git
```bash
npm install  # This automatically runs prisma generate via postinstall
```

### After Changing the Schema
```bash
npm run prisma:format    # Format schema (optional)
npm run prisma:push      # Push changes to dev database
# OR
npm run prisma:migrate   # Create migration for production
```

### Starting Fresh
```bash
npm install              # Install dependencies & generate client
npm run prisma:push      # Push schema to database
npm run dev              # Start development server
```

## 🐛 Troubleshooting

### Error: "Cannot find module '@/lib/generated/prisma/client'"
**Solution**: Run `npm run prisma:generate`

### Error: "Can't reach database server"
**Solution**: Check your DATABASE_URL in the `.env` file

### Error: "npx command not working"
**Solution**: Use the npm scripts instead (e.g., `npm run prisma:generate`)

### Teammates Get Errors After Pulling
**Solution**: Make sure they run `npm install` which triggers the postinstall script

## 📁 File Structure

```
life-os/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   └── generated/
│       └── prisma/            # Generated Prisma client (auto-generated)
├── prisma.config.ts           # Prisma configuration
└── .env                       # Environment variables (DATABASE_URL)
```

## 🔐 Environment Variables Needed

Make sure your `.env` file has:
```bash
DATABASE_URL=                   # PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Adapter Docs](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [Neon PostgreSQL](https://neon.tech/docs/introduction)
