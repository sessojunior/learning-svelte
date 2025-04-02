// Verifica se o e-mail existe na tabela de usuários
export const checkIfUserEmailExists = async (email: string): Promise<boolean> => {
	const response = await fetch('/api/check-if-user-email-exists', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email })
	})

	const data = await response.json()
	return data.exists
}

// Verifica se o e-mail do usuário está marcado como verificado na tabela de usuários
export const checkIfUserEmailVerified = async (email: string): Promise<boolean> => {
	const response = await fetch('/api/check-if-user-email-verified', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email })
	})

	const data = await response.json()
	return data.verified
}
