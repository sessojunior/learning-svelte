export const checkIfUserEmailExists = async (email: string): Promise<boolean> => {
	const response = await fetch('/api/utils/db/check-email', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email })
	})

	const data = await response.json()
	return data.exists
}
