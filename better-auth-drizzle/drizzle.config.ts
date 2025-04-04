import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não foi definido')

export default defineConfig({
	schema: './src/lib/server/db-schema.ts',
	dbCredentials: { url: process.env.DATABASE_URL },
	verbose: true,
	strict: true,
	dialect: 'sqlite'
})
