export const checkIfUserExists = async (email: string): Promise<boolean> => {
	const response = await fetch('/api/utils/db/check-if-user-exists', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email })
	})

	const data = await response.json()
	return data.exists
}
