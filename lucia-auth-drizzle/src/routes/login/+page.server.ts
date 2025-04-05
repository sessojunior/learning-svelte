import { hash, verify } from '@node-rs/argon2'
import { encodeBase32LowerCase } from '@oslojs/encoding'
import { fail, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import * as auth from '$lib/server/auth'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	// Verifica se o usuário já está logado
	if (event.locals.user) {
		// Redireciona o usuário para a página privada
		return redirect(302, '/app')
	}
	return {}
}

export const actions: Actions = {
	// Login
	login: async (event) => {
		const formData = await event.request.formData()
		const username = formData.get('username')
		const password = formData.get('password')

		// Valida o nome de usuário
		if (!validateUsername(username)) {
			return fail(400, {
				message: 'Invalid username (min 3, max 31 characters, alphanumeric only)'
			})
		}

		// Valida a senha
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 255 characters)' })
		}

		// Busca o usuário no banco de dados pelo nome de usuário
		const results = await db.select().from(table.user).where(eq(table.user.username, username))

		// Se o usuário não existir, retorna um erro
		const existingUser = results.at(0)
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' })
		}

		// Verifica se a senha corresponde ao hash armazenado no banco de dados
		// Se a senha for inválida, retorna um erro
		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		})
		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password' })
		}

		// Cria a sessão e o cookie de sessão
		const sessionToken = auth.generateSessionToken()
		const session = await auth.createSession(sessionToken, existingUser.id)
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)

		// Redireciona o usuário para a página privada
		return redirect(302, '/app')
	},
	// Cadastro de usuário
	register: async (event) => {
		const formData = await event.request.formData()
		const username = formData.get('username')
		const password = formData.get('password')

		// Valida o nome de usuário
		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username' })
		}

		// Valida a senha
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' })
		}

		// Gera o ID do usuário
		const userId = generateUserId()

		// Cria o hash da senha
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		})

		try {
			// Insere o usuário no banco de dados
			await db.insert(table.user).values({ id: userId, username, passwordHash })

			// Cria a sessão e o cookie de sessão
			const sessionToken = auth.generateSessionToken()
			const session = await auth.createSession(sessionToken, userId)
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
		} catch {
			return fail(500, { message: 'An error has occurred' })
		}

		// Redireciona o usuário para a página privada
		return redirect(302, '/app')
	}
}

// Gera um ID para o usuário
function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15))
	const id = encodeBase32LowerCase(bytes)
	return id
}

// Valida o nome de usuário
function validateUsername(username: unknown): username is string {
	return typeof username === 'string' && username.length >= 3 && username.length <= 31 && /^[a-z0-9_-]+$/.test(username)
}

// Valida a senha
function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255
}
