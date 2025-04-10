import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { users } from '$lib/server/db-schema'
import { eq } from 'drizzle-orm'

// Rota para verificar se o e-mail existe na tabela de usuários
// Recebe o e-mail como corpo da requisição
// Retorna um JSON com a resposta da API: { exists: true | false }
export const POST = async ({ request }) => {
	const data = await request.json()
	const email = data.email.trim().toLowerCase()

	const user = await db.select().from(users).where(eq(users.email, email)).get()
	return json({ exists: user !== undefined && user !== null })
}
