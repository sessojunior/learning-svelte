import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async (event) => {
	// Verifica se o usuário não está logado
	// Para saber mais sobre event.locals:
	// https://khromov.se/the-comprehensive-guide-to-locals-in-sveltekit/
	if (!event.locals.user) {
		return redirect(302, '/login')
	}

	// Retorna os dados do usuário do event.locals
	return { user: event.locals.user }
}
