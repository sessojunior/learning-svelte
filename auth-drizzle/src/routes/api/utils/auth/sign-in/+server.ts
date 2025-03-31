import { auth } from '$lib/server/auth'
import { errorCodes } from '$lib/utils/auth'
import { checkIfUserExists } from '$lib/server/utils/db'

import { json, type RequestEvent } from '@sveltejs/kit'
import { z } from 'zod'

// Tipagem para a resposta da API
type SignInResponse = {
	success: boolean
	errors?: { field?: string; code: string; message: string }[]
	user?: { id: string; name: string; email: string; image: string | null | undefined; emailVerified: boolean }
	token?: string | null
}

// Schema de validação com Zod: tipo
const typeSignInSchema = z.object({
	type: z.enum(['email', 'otp', 'social'], {
		invalid_type_error: 'Você deve enviar a forma correta que deseja fazer login.',
		required_error: 'O tipo de login é obrigatório.'
	})
})

// Schema de validação com Zod: tipo email
const emailSignInSchema = z.object({
	email: z
		.string({ required_error: 'O e-mail é obrigatório.' }) // Garante que o e-mail é obrigatório
		.email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
	password: z
		.string({ required_error: 'A senha é obrigatória.' }) // Garante que a senha é obrigatória
		.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, { message: 'A senha é inválida.' }) //Garante que a senha atende a todos os requisitos: pelo menos uma letra maiúscula, pelo menos uma letra minúscula, pelo menos um número e pelo menos um caractere especial
})

// Schema de validação com Zod: tipo otp
const otpSignInSchema = z.object({
	email: z
		.string({ required_error: 'O e-mail é obrigatório.' }) // Garante que o e-mail é obrigatório
		.email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
	otp: z
		.string() // Garante que seja uma string
		.regex(/^\d{6}$/, { message: 'O código é inválido.' }) // Garante que o OTP seja composto por exatamente 6 números
		.optional() // Garante que o OTP é opcional
})

// Função para fazer login
// Recebe para login com e-mail e senha: { type, email, password }
// Recebe para login com OTP: { type, email } ou { type, email, otp }
// Retorna um JSON com a resposta da API do tipo SignInResponse e o status
export async function POST({ request }: RequestEvent): Promise<Response> {
	// Obtem dados do corpo da requisição
	let body
	try {
		body = await request.json()
	} catch {
		return json({ success: false, errors: [{ code: 'INVALID_JSON', message: 'O corpo da requisição não é um JSON válido.' }] } as SignInResponse, { status: 400 })
	}

	// TIPO DE LOGIN

	// Valida o tipo recebido
	let validatedTypeSchema
	try {
		validatedTypeSchema = typeSignInSchema.parse(body)
	} catch (err) {
		if (err instanceof z.ZodError) {
			return json({ success: false, errors: err.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message })) } as SignInResponse, { status: 400 })
		}
		return json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message: 'Erro na validação dos dados.' }] } as SignInResponse, { status: 400 })
	}

	// LOGIN COM E-MAIL E SENHA

	// Verifica se é do tipo login com e-mail e senha
	if (validatedTypeSchema.type === 'email') {
		// Valida os dados recebidos
		let validatedEmailSchema
		try {
			validatedEmailSchema = emailSignInSchema.parse(body)
		} catch (err) {
			if (err instanceof z.ZodError) {
				return json({ success: false, errors: err.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message })) } as SignInResponse, { status: 400 })
			}
			return json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message: 'Erro na validação dos dados.' }] } as SignInResponse, { status: 400 })
		}

		// Se o e-mail e a senha forem válidos
		if (validatedEmailSchema.email && validatedEmailSchema.password) {
			// Verifica se o e-mail não existe
			if (!(await checkIfUserExists(validatedEmailSchema.email || ''))) {
				return json({ success: false, errors: [{ field: 'email', code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }] } as SignInResponse, { status: 400 })
			}

			// Chama a API para fazer login com e-mail e senha
			try {
				const api = await auth.api.signInEmail({
					returnHeaders: true,
					body: {
						email: validatedEmailSchema.email || '',
						password: validatedEmailSchema.password || ''
					}
				})

				// Verifica se a resposta contém erros
				if ('errors' in api.response) {
					return json({ success: false, errors: api.response.errors } as SignInResponse, { status: 400 })
				}

				// Caso a resposta contenha o 'user' e o 'token', então retorna com sucesso
				else if (api.response.user && api.response.token) {
					return json({ success: true, user: api.response.user, token: api.response.token, redirect: api.response.redirect, url: api.response.url } as SignInResponse, { status: 200 })
				}
			} catch (err) {
				const apiErrorCode = (err as { body?: { code?: string } })?.body?.code
				const errorMessage = apiErrorCode && errorCodes[apiErrorCode as keyof typeof errorCodes] ? errorCodes[apiErrorCode as keyof typeof errorCodes] : 'Erro inesperado no servidor.'

				return json({ success: false, errors: [{ code: apiErrorCode || 'INTERNAL_SERVER_ERROR', message: errorMessage }] } as SignInResponse, { status: 400 })
			}
		}
	}

	// LOGIN COM OTP

	// Verifica se é do tipo login com OTP
	else if (validatedTypeSchema.type === 'otp') {
		// Valida os dados recebidos
		let validatedOtpSchema
		try {
			validatedOtpSchema = otpSignInSchema.parse(body)
		} catch (err) {
			if (err instanceof z.ZodError) {
				return json({ success: false, errors: err.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message })) } as SignInResponse, { status: 400 })
			}
			return json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message: 'Erro na validação dos dados.' }] } as SignInResponse, { status: 400 })
		}

		// Verifica se o e-mail não existe
		if (!(await checkIfUserExists(validatedOtpSchema.email || ''))) {
			return json({ success: false, errors: [{ field: 'email', code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }] } as SignInResponse, { status: 400 })
		}

		// ETAPA 1 DO OTP

		// Etapa 1: Se enviou apenas o email
		if (validatedOtpSchema.email && !validatedOtpSchema.otp) {
			// Chama a API para enviar OTP para o e-mail do usuário
			try {
				const api = await auth.api.sendVerificationOTP({
					returnHeaders: true,
					body: {
						email: validatedOtpSchema.email || '',
						type: 'sign-in'
					}
				})

				// Caso a resposta seja sucesso
				if (api.response.success) {
					return json({ success: true } as SignInResponse, { status: 200 })
				}

				// Caso a resposta não seja sucesso
				else {
					return json({ success: false, errors: [{ code: 'API_ERROR', message: 'Erro ao enviar o código OTP para o e-mail do usuário.' }] } as SignInResponse, { status: 400 })
				}
			} catch {
				return json({ success: false, errors: [{ code: 'API_ERROR', message: 'Erro ao enviar o código OTP para o e-mail do usuário.' }] } as SignInResponse, { status: 400 })
			}
		}

		// ETAPA 2 DO OTP

		// Etapa 2: Se enviou o email e o OTP
		else if (validatedOtpSchema.email && validatedOtpSchema.otp) {
			// Chama a API para fazer login com o OTP
			try {
				const api = await auth.api.signInEmailOTP({
					returnHeaders: true,
					body: {
						email: validatedOtpSchema.email || '',
						otp: validatedOtpSchema.otp || ''
					}
				})

				// Para debugar
				// console.log('api.response', api.response)

				// Verifica se a resposta contém erros
				if ('errors' in api.response) {
					return json({ success: false, errors: api.response.errors } as SignInResponse, { status: 400 })
				}

				// Caso a resposta contenha o 'user' e o 'token', então retorna com sucesso
				else if (api.response.user && api.response.token) {
					return json({ success: true, user: api.response.user, token: api.response.token } as SignInResponse, { status: 200 })
				}
			} catch {
				return json({ success: false, errors: [{ code: 'API_ERROR', message: 'Erro ao fazer login com o código OTP.' }] } as SignInResponse, { status: 400 })
			}
		}
	}

	return json({ success: false, errors: [{ code: 'UNKNOWN_ERROR', message: 'Erro desconhecido no servidor.' }] } as SignInResponse, { status: 500 })
}
