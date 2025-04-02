import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { users } from '$lib/server/db-schema'
import { eq } from 'drizzle-orm'

// Rota para verificar se o e-mail está marcado como verificado na tabela de usuários
// Recebe o e-mail como corpo da requisição
// Retorna um JSON com a resposta da API: { verified: true | false }
export const POST = async ({ request }) => {
	const { email } = await request.json()

	const user = await db.select({ emailVerified: users.emailVerified }).from(users).where(eq(users.email, email)).get()
	return json({ verified: !!user?.emailVerified })
}
