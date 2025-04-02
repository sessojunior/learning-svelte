import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './db-schema'
import { env } from '$env/dynamic/private'

if (!env.DATABASE_URL) throw new Error('DATABASE_URL não foi definido')

const client = createClient({ url: env.DATABASE_URL })

export const db = drizzle(client, { schema })
