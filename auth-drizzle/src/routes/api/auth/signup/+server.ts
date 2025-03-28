import { auth } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

import { json, type RequestEvent } from '@sveltejs/kit'
import { z } from 'zod'

// Definição dos tipos para a resposta
export type ErrorResponse = {
	errors: { field: string | null; description: string }[]
}
export type SuccessResponse = {
	user: { id: string; name: string; email: string }
	token: string | null
}

// Schema de validação com Zod
const schema = z.object({
	name: z.string().min(2, 'O nome está muito curto.'),
	email: z.string().email('O e-mail é inválido.'),
	password: z
		.string()
		.min(8, 'A senha deve ter pelo menos 8 caracteres.')
		.regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
		.regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
		.regex(/\d/, 'A senha deve conter pelo menos um número.')
		.regex(/[!@#$%^&*(),.?":{}|<>]/, 'A senha deve conter pelo menos um caractere especial.')
})

// Função auxiliar que verifica se o usuário existe no banco de dados através do e-mail
const userExists = async (email: string) => await db.select().from(users).where(eq(users.email, email)).get()

// Função auxiliar para cadastrar um usuário com email e senha
export async function POST({ request }: RequestEvent): Promise<Response> {
	try {
		// Obter dados do corpo da requisição
		const body = await request.json()

		// Validação com Zod
		const validatedData = schema.parse(body)

		// Verifica se o e-mail ja existe
		if (await userExists(validatedData.email)) {
			return json({ errors: [{ field: 'email', description: 'E-mail já cadastrado.' }] } as ErrorResponse, { status: 400 })
		}

		// Chama a API para cadastrar o usuário
		const response = await auth.api.signUpEmail({
			body: {
				name: validatedData.name,
				email: validatedData.email,
				password: validatedData.password
			}
		})

		// Verifica se a resposta contém erros (ErrorResponse)
		if ('errors' in response) {
			return json({ errors: response.errors } as ErrorResponse, { status: 400 })
		}

		// Caso a resposta contenha user e token (SuccessResponse)
		if (response.user && response.token) {
			return json({ user: response.user, token: response.token } as SuccessResponse, { status: 200 })
		}

		// Caso nenhuma resposta tenha sido recebida ou resposta inválida
		return json({ errors: [{ field: null, description: 'Erro desconhecido ao cadastrar o usuário.' }] } as ErrorResponse, { status: 500 })
	} catch (err) {
		// Se houver erro na validação, retorna um array de erros
		if (err instanceof z.ZodError) {
			const errors = err.errors.map((e) => ({
				field: String(e.path[0]), // Garantir que 'field' seja uma string
				description: e.message // Mensagem de erro
			}))

			return json({ errors } as ErrorResponse, { status: 400 })
		}

		// Para outros erros inesperados, padroniza a resposta com um array
		const errorMessage = err instanceof Error ? err.message : 'Erro inesperado no servidor.'
		return json(
			{
				errors: [{ field: null, description: errorMessage }]
			} as ErrorResponse,
			{ status: 500 }
		)
	}
}
