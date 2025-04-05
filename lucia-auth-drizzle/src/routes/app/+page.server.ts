import * as auth from '$lib/server/auth'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	// Logout
	logout: async (event) => {
		// Verifica se o usuário não está logado
		if (!event.locals.session) {
			return fail(401)
		}

		// Invalida a sessão e exclui o cookie de sessão do usuário
		await auth.invalidateSession(event.locals.session.id)
		auth.deleteSessionTokenCookie(event)

		// Redireciona o usuário para a página de login
		return redirect(302, '/login')
	}
}
