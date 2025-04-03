import { auth } from '$lib/server/auth'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { redirect } from '@sveltejs/kit'

// Autenticação do Better Auth
export async function handle({ event, resolve }) {
	const { request, url } = event

	// Protege todas as rotas dentro de "/app/"
	if (url.pathname.startsWith('/app/')) {
		// Obtém a sessão da API, usando os cabeçalhos da requisição
		const session = await auth.api.getSession({
			headers: request.headers
		})

		// Se não houver usuário autenticado, redireciona para "/sign-in"
		if (!session?.user) {
			throw redirect(302, '/sign-in')
		}
	}

	// Continua com a autenticação do Better Auth
	return svelteKitHandler({ event, resolve, auth })
}
