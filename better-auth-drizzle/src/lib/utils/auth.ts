import { goto } from '$app/navigation'
import { authClient } from '$lib/auth-client'

// Códigos de erro de autenticação amigáveis do Better Auth
export const errorCodes = {
	// Códigos de erro comuns
	USER_NOT_FOUND: 'Usuário não encontrado',
	FAILED_TO_CREATE_USER: 'Falha ao criar usuário',
	FAILED_TO_CREATE_SESSION: 'Falha ao criar sessão',
	FAILED_TO_UPDATE_USER: 'Falha ao atualizar usuário',
	FAILED_TO_GET_SESSION: 'Falha ao recuperar sessão',
	INVALID_PASSWORD: 'Senha inválida',
	INVALID_EMAIL: 'E-mail inválido',
	INVALID_EMAIL_OR_PASSWORD: 'E-mail ou senha inválida',
	SOCIAL_ACCOUNT_ALREADY_LINKED: 'Conta social já vinculada',
	PROVIDER_NOT_FOUND: 'Provedor não encontrado',
	INVALID_TOKEN: 'Token inválido',
	ID_TOKEN_NOT_SUPPORTED: 'Token de ID não suportado',
	FAILED_TO_GET_USER_INFO: 'Falha ao obter informações do usuário',
	USER_EMAIL_NOT_FOUND: 'E-mail do usuário não encontrado',
	EMAIL_NOT_VERIFIED: 'E-mail não verificado',
	PASSWORD_TOO_SHORT: 'Senha muito curta',
	PASSWORD_TOO_LONG: 'Senha muito longa',
	USER_ALREADY_EXISTS: 'Usuário já existente',
	EMAIL_CAN_NOT_BE_UPDATED: 'E-mail não pode ser atualizado',
	CREDENTIAL_ACCOUNT_NOT_FOUND: 'Conta de credencial não encontrada',
	SESSION_EXPIRED: 'Sessão expirada',
	FAILED_TO_UNLINK_LAST_ACCOUNT: 'Falha ao desvincular a última conta',
	ACCOUNT_NOT_FOUND: 'Conta não encontrada',
	// Códigos de erro do OTP
	OTP_EXPIRED: 'Código expirado.',
	INVALID_OTP: 'Código inválido.',
	// Códigos de erro de verificação e alteração de dados
	CHANGE_EMAIL_IS_DISABLED: 'Alteração de e-mail desabilitada.',
	VERIFICATION_EMAIL_ISNT_ENABLED: 'Verificação de e-mail não está habilitada.',
	EMAIL_IS_THE_SAME: 'O e-mail é o mesmo.',
	COULDNT_UPDATE_YOUR_EMAIL: 'Não foi possivel alterar seu e-mail.'
}

// Função de logout
export const handleSignOut = async () => {
	try {
		await authClient.signOut()
		goto('/sign-in') // Redireciona após o logout
	} catch (err) {
		console.error('Erro ao realizar logout:', err)
	}
}
