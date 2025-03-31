// Esse arquivo só é usado na API /api/utils/sign-in e /api/utils/sign-up.

import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

// Função auxiliar que verifica se o usuário existe no banco de dados através do e-mail
// Retorna: true | false
export const checkIfUserExists = async (email: string): Promise<boolean> => {
	const user = await db.select().from(users).where(eq(users.email, email)).get()
	return user !== undefined && user !== null
}
