import { json } from '@sveltejs/kit'
import { db } from '$lib/db'
import { books } from '$lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET({ params }) {
	const { id } = params

	const book = await db.select().from(books).where(eq(books.id, id)).get()
	if (!book) {
		return json({ error: 'Livro não encontrado' }, { status: 404 })
	}

	return json(book)
}

export async function PUT({ params, request }) {
	const { id } = params
	const { title, author } = await request.json()

	if (!title?.trim() || !author?.trim()) {
		return json({ error: 'Título e autor são obrigatórios' }, { status: 400 })
	}

	const updateBook = await db.update(books).set({ title, author }).where(eq(books.id, id)).returning()
	if (!updateBook.length) {
		return json({ error: 'Livro não encontrado' }, { status: 404 })
	}

	return json(updateBook[0])
}

export async function DELETE({ params }) {
	const { id } = params

	const existingBook = await db.select().from(books).where(eq(books.id, id)).get()
	if (!existingBook) {
		return json({ error: 'Livro não encontrado' }, { status: 404 })
	}
	await db.delete(books).where(eq(books.id, id))

	return json({ message: 'Livro removido com sucesso' })
}
