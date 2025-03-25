import { json } from '@sveltejs/kit'
import { db } from '$lib/db'
import { books, type BookParams } from '$lib/db/schema'

export async function GET({ url }) {
	// Definir um critério de ordenação válido
	const sortBy = (url.searchParams.get('sortBy') as 'title' | 'author') || 'title'

	const selectBooks: BookParams[] = await db
		.select()
		.from(books)
		.orderBy(books[sortBy]) // Ordena dinamicamente pelo campo escolhido
		.all()

	return json(selectBooks)
}

export async function POST({ request }) {
	const { title, author } = await request.json()

	if (!title?.trim() || !author?.trim()) {
		return json({ error: 'Título e autor são obrigatórios' }, { status: 400 })
	}

	const insertBook = await db.insert(books).values({ title, author }).returning()
	return json(insertBook)
}
