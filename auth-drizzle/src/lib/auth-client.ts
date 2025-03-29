import { createAuthClient } from 'better-auth/svelte'
import { emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
	plugins: [emailOTPClient()]
})
