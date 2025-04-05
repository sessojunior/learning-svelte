import type { RequestEvent } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'

// Sessões
// Os usuários usarão um token de sessão vinculado a uma sessão em vez do ID diretamente.
// O ID da sessão será o hash SHA-256 do token.
// O SHA-256 é uma função de hash unidirecional.
// Isso garante que, mesmo que o conteúdo do banco de dados tenha vazado,
// o invasor não conseguirá recuperar tokens válidos.

// Um dia em milissegundos
const DAY_IN_MS = 24 * 60 * 60 * 1000 // 86400000 ms (1 dia)

// Nome do cookie de sessão
export const sessionCookieName = 'auth-session'

// Gera o token de sessão
export function generateSessionToken() {
	// Gera um token aleatório com pelo menos 20 bytes
	const bytes = crypto.getRandomValues(new Uint8Array(20))
	const token = encodeBase64url(bytes)

	// Retorna o token
	return token
}

// Cria uma sessão para o usuário
// O ID da sessão será um hash SHA-256 do token
// A sessão expira em 30 dias
export async function createSession(token: string, userId: string) {
	// Gera o hash SHA-256 do token
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

	// Insere a sessão no banco de dados
	const session: table.Session = {
		id: sessionId,
		userId,
		// Sessão expira em 30 dias
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	}
	await db.insert(table.session).values(session)

	// Retorna a sessão
	return session
}

// Valida um token de sessão
// As sessões são validadas em 2 etapas:
// 1. Verifica se a sessão existe no banco de dados
// 2. Verifica se a sessão expirou
export async function validateSessionToken(token: string) {
	// Gera o hash SHA-256 do token
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

	// 1. Verifica se a sessão existe no banco de dados
	const [result] = await db
		.select({
			// Dados retornados da tabela user
			user: { id: table.user.id, username: table.user.username },
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId))

	// Se a sessão não existir, retorna null
	// Caso contrário, retorna a sessão e o usuário
	if (!result) {
		return { session: null, user: null }
	}
	const { session, user } = result

	// 2. Verifica se a sessão expirou
	const sessionExpired = Date.now() >= session.expiresAt.getTime()

	// Se a sessão expirou, exclui a sessão do banco de dados
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id))
		return { session: null, user: null }
	}

	// Se a sessão não expirou, verifica se ela precisa ser estendida
	// Isso garante que as sessões ativas sejam persistidas, enquanto as inativas eventualmente expirarão.
	// Verifica se há menos de 15 dias (metade da expiração de 30 dias) antes da expiração.
	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15

	// Se a sessão precisa ser estendida, atualiza a data de expiração
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30)
		await db.update(table.session).set({ expiresAt: session.expiresAt }).where(eq(table.session.id, session.id))
	}

	// Retorna a sessão e o usuário
	return { session, user }
}

// Tipo de retorno da função validateSessionToken
export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>

// Invalida uma sessão pelo ID excluindo-a do banco de dados
export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId))
}

// Invalida todas as sessões de um usuário excluindo-as do banco de dados
export async function invalidateAllSessions(userId: string) {
	await db.delete(table.session).where(eq(table.session.userId, userId))
}

// Cookies
// A proteção CSRF é essencial ao usar cookies.
// O SvelteKit tem proteção CSRF básica usando o header Origin que é habilitado por padrão.
// Os cookies de sessão devem ter os seguintes atributos:

// - HttpOnly: Os cookies são acessíveis apenas no lado do servidor
// - SameSite=Lax: Use Strict para sites críticos
// - Secure: Os cookies só podem ser enviados por HTTPS (deve ser omitido ao testar no localhost)
// - Max-Age ou Expires: Deve ser definido para persistir cookies
// - Path=/: Os cookies podem ser acessados de todas as rotas

// O SvelteKit define automaticamente a flag Secure quando implantado na produção.

// Cria o cookie de sessão com o token e a data de expiração
export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		// httpOnly: true,
		// sameSite: 'lax',
		expires: expiresAt,
		path: '/'
	})
}

// Exclui o cookie de sessão
export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		// httpOnly: true,
		// sameSite: 'lax',
		maxAge: 0,
		path: '/'
	})
}
