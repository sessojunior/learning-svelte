import { auth } from '$lib/server/auth'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
	// Obtem a sessão da API, usando os cabeçalhos da requisição
	const session = await auth.api.getSession({
		headers: request.headers
	})

	// Se não houver usuário na sessão, redireciona para o login
	if (!session?.user) {
		throw redirect(302, '/sign-in') // Redireciona para o login
	}

	// Retorna os dados da sessão para serem usados na página
	return { session }
}
