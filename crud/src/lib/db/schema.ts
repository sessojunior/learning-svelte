import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { randomUUID } from 'crypto'

export const books = sqliteTable('books', {
	id: text('id')
		.primaryKey()
		.$default(() => randomUUID()),
	title: text('title').notNull(),
	author: text('author').notNull()
})

export type BookParams = typeof books.$inferSelect
