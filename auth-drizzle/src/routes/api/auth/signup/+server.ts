import { auth } from '$lib/server/auth'
import { errorCodes } from '$lib/server/auth-utils'
import { checkIfUserEmailExists } from '$lib/server/db-utils'

import { json, type RequestEvent } from '@sveltejs/kit'
import { z } from 'zod'

// Tipagem para a resposta da API
type SignUpResponse = {
	success: boolean
	errors?: { field?: string; code: string; message: string }[]
	user?: { id: string; name: string; email: string }
	token?: string | null
}

// Schema de validação com Zod
const signUpSchema = z.object({
	name: z
		.string({ required_error: 'O nome é obrigatório.' }) // Garante que o campo é obrigatório
		.min(2, { message: 'O nome está muito curto.' }) // Garante que o campo tenha pelo menos 2 caracteres
		.regex(/^[A-Za-zÀ-ÿ\s\-.'À-ÿ]*$/, { message: 'O nome não pode conter caracteres especiais.' }), // Permite espaço, traço, ponto e apóstrofo
	email: z
		.string({ required_error: 'O e-mail é obrigatório.' }) // Garante que o e-mail é obrigatório
		.email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
	password: z
		.string({ required_error: 'A senha é obrigatória.' }) // Garante que a senha é obrigatória
		.min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }) // Garante que a senha tenha pelo menos 8 caracteres
		.regex(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula.' }) // Garante que a senha contenha pelo menos uma letra maiúscula
		.regex(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula.' }) // Garante que a senha contenha pelo menos uma letra minúscula
		.regex(/\d/, { message: 'A senha deve conter pelo menos um número.' }) // Garante que a senha contenha pelo menos um número
		.regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'A senha deve conter pelo menos um caractere especial.' }) // Garante que a senha contenha pelo menos um caractere especial
})

// Função para cadastrar um usuário com email e senha
// Recebe: { name, email, password }
// Retorna um JSON com a resposta da API do tipo SignUpResponse e o status
export async function POST({ request }: RequestEvent): Promise<Response> {
	// Obtem dados do corpo da requisição
	let body
	try {
		body = await request.json()
	} catch {
		return json({ success: false, errors: [{ code: 'INVALID_JSON', message: 'O corpo da requisição não é um JSON válido.' }] } as SignUpResponse, { status: 400 })
	}

	// CADASTRAR USUÁRIO COM NOME, EMAIL E SENHA

	// Valida os dados recebidos
	let validatedSchema
	try {
		validatedSchema = signUpSchema.parse(body)
	} catch (err) {
		if (err instanceof z.ZodError) {
			return json(
				{
					success: false,
					errors: err.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))
				} as SignUpResponse,
				{ status: 400 }
			)
		}
		return json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message: 'Erro na validação dos dados.' }] } as SignUpResponse, { status: 400 })
	}

	// Verifica se o e-mail já está cadastrado
	if (await checkIfUserEmailExists(validatedSchema.email)) {
		return json({ success: false, errors: [{ field: 'email', code: 'USER_ALREADY_EXISTS', message: 'Usuário já existe.' }] } as SignUpResponse, { status: 400 })
	}

	// Chama a API para cadastrar o usuário com nome, email e senha
	try {
		const api = await auth.api.signUpEmail({
			returnHeaders: true,
			body: {
				name: validatedSchema.name,
				email: validatedSchema.email,
				password: validatedSchema.password
			}
		})

		// Verifica se a resposta contém erros
		if ('errors' in api.response) {
			return json({ success: false, errors: api.response.errors } as SignUpResponse, { status: 400 })
		}

		// Caso a resposta contenha o 'user', então retorna com sucesso
		else if (api.response.user) {
			return json({ success: true, user: api.response.user, token: api.response.token } as SignUpResponse, { status: 200 })
		}
	} catch (err) {
		const apiErrorCode = (err as { body?: { code?: string } })?.body?.code
		const errorMessage = apiErrorCode && errorCodes[apiErrorCode as keyof typeof errorCodes] ? errorCodes[apiErrorCode as keyof typeof errorCodes] : 'Erro inesperado no servidor.'

		return json({ success: false, errors: [{ code: apiErrorCode || 'INTERNAL_SERVER_ERROR', message: errorMessage }] } as SignUpResponse, { status: 400 })
	}

	return json({ success: false, errors: [{ code: 'UNKNOWN_ERROR', message: 'Erro desconhecido no servidor.' }] } as SignUpResponse, { status: 500 })
}
