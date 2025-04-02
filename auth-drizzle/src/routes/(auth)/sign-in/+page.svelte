<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { errorCodes } from '$lib/utils/auth'
	import { checkIfUserEmailExists } from '$lib/utils/db'
	import { z } from 'zod'

	// Tipo de login: 'email', 'otp', 'social'
	let type = $state('email')

	// Dados para login por e-mail
	let stepEmail = $state(1)
	let email = $state('')
	let password = $state('')

	// Dados para login com OTP
	let stepOtp = $state(1)
	let otp = $state('')

	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])

	// Login com e-mail e senha
	const handleSignInEmail = async () => {
		loading = true
		errors = []

		// Etapa 1: Se enviou os dados para criar a conta
		if (stepEmail === 1) {
			// Schema de validação com Zod
			const schema = z.object({
				email: z.string().trim().toLowerCase().email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
				password: z
					.string({ required_error: 'A senha é obrigatória.' }) // Garante que a senha é obrigatória
					.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, { message: 'A senha é inválida.' }) //Garante que a senha atende a todos os requisitos: pelo menos uma letra maiúscula, pelo menos uma letra minúscula, pelo menos um número e pelo menos um caractere especial
			})

			// 1 - Valida os dados recebidos
			const validatedSchema = schema.safeParse({ email, password })
			if (!validatedSchema.success) {
				errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))
				loading = false
				return false
			}

			// 2 - Chama a API de login com e-mail e senha
			const { data, error } = await authClient.signIn.email({
				email: validatedSchema.data.email,
				password: validatedSchema.data.password,
				rememberMe: true, // Padrão: true. Se falso, o usuário será desconectado quando o navegador for fechado. (opcional)
				callbackURL: '/app/dashboard'
			})

			// 3 - Se o e-mail do usuário não está verificado
			if (error?.code === 'EMAIL_NOT_VERIFIED') {
				// Chama a API para enviar o OTP para o e-mail do usuário
				await authClient.emailOtp.sendVerificationOtp({
					email: validatedSchema.data.email,
					type: 'email-verification' // Pode ser 'sign-in', 'forget-password' ou 'email-verification'
				})

				// Exibe mensagem de que será enviado um código para o e-mail para verificar a conta.
				errors = [{ code: 'EMAIL_NOT_VERIFIED', message: 'E-mail não verificado. Verifique a sua conta confirmando o código que foi enviado para o seu e-mail.' }]

				// Pula para a etapa 2
				stepEmail = 2
				loading = false
				return false
			} else {
				// Traduz os erros de API para mensagens amigáveis
				const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
				errors = [{ code: error?.code ?? '', message: errorMessage ?? error?.message }]
			}
		}

		// Etapa 2: Se enviou o código OTP
		if (stepEmail === 2) {
			// Schema de validação com Zod
			const schema = z.object({
				email: z.string().trim().toLowerCase().email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
				otp: z
					.string()
					.trim()
					.regex(/^\d{6}$/, { message: 'O código é inválido.' }) // Garante que o OTP seja composto por exatamente 6 números
			})

			// 1 - Valida os dados recebidos
			const validatedSchema = schema.safeParse({ email, otp })
			if (!validatedSchema.success) {
				errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))
				loading = false
				return false
			}

			// 2 - Chama a API de login com OTP para verificar o e-mail e fazer o login automaticamente
			// Para fazer login automático, no arquivo 'auth.ts', em 'emailVerification', a propriedade 'autoSignInAfterVerification' deve ser true
			const { data, error } = await authClient.emailOtp.verifyEmail({ email: validatedSchema.data.email, otp: validatedSchema.data.otp })

			// 3 - Se obteve os dados com sucesso da API
			if (data) {
				// 3.2 - Redireciona para a página de dashboard
				window.location.href = '/app/dashboard'

				loading = false
				return false
			}

			// Se obteve um erro
			if (error) {
				// Traduz os erros de API para mensagens amigáveis
				const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
				errors = [{ code: error?.code ?? '', message: errorMessage ?? error?.message }]
			}
		}

		loading = false
	}

	// Login com OTP
	const handleSignInOtp = async () => {
		loading = true
		errors = []

		// Etapa 1: Se enviou apenas o email
		if (stepOtp === 1) {
			// Schema de validação com Zod
			const schema = z.object({
				email: z.string().trim().toLowerCase().email({ message: 'O e-mail é inválido.' }) // Garante que o e-mail é válido
			})

			// 1 - Valida os dados recebidos
			const validatedSchema = schema.safeParse({ email })
			if (!validatedSchema.success) {
				errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))
				loading = false
				return false
			}

			// 2 - Verifica se o e-mail não existe
			if (!(await checkIfUserEmailExists(validatedSchema.data.email))) {
				errors = [{ field: 'email', code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }]
				loading = false
				return false
			}

			// 3 - Chama a API para enviar o OTP para o e-mail do usuário
			const { data, error } = await authClient.emailOtp.sendVerificationOtp({
				email: validatedSchema.data.email,
				type: 'sign-in' // Pode ser 'sign-in', 'forget-password' ou 'email-verification'
			})

			// 4 - Se obteve os dados com sucesso da API
			if (data) {
				// Muda para a etapa 2
				stepOtp = 2
				loading = false
				return false
			}

			// Se obteve um erro
			if (error) {
				// Traduz os erros de API para mensagens amigáveis
				const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
				errors = [{ code: error?.code ?? '', message: errorMessage ?? error?.message }]
			}
		}

		// Etapa 2: Se enviou o email e o otp
		if (stepOtp === 2) {
			// Schema de validação com Zod: tipo otp (etapa 2)
			const schema = z.object({
				email: z.string().trim().toLowerCase().email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
				otp: z
					.string()
					.trim()
					.regex(/^\d{6}$/, { message: 'O código é inválido.' }) // Garante que o OTP seja composto por exatamente 6 números
			})

			// 1 - Valida os dados recebidos
			const validatedSchema = schema.safeParse({ email, otp })
			if (!validatedSchema.success) {
				errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))
				loading = false
				return false
			}

			// 2 - Verifica se o e-mail não existe
			if (!(await checkIfUserEmailExists(validatedSchema.data.email))) {
				errors = [{ field: 'email', code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }]
				stepOtp = 1
				loading = false
				return false
			}

			// 3 - Chama a API de login com OTP
			const { data, error } = await authClient.signIn.emailOtp({
				email: validatedSchema.data.email,
				otp: validatedSchema.data.otp
			})

			// 4 - Se obteve os dados com sucesso da API
			if (data) {
				// Redireciona para o dashboard
				window.location.href = '/app/dashboard'

				loading = false
				return false
			}

			// Se obteve um erro
			if (error) {
				// Traduz os erros de API para mensagens amigáveis
				const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
				errors = [{ code: error?.code ?? '', message: errorMessage ?? error?.message }]
			}
		}

		loading = false
	}

	// Login social: Google, Microsoft, Apple ou Facebook
	const handleSignInSocial = async ({ social, oauth2 }: { social?: 'google' | 'microsoft' | 'apple' | 'facebook'; oauth2?: 'instagram' }) => {
		loading = true
		errors = []

		const options = {
			callbackURL: '/app/dashboard', // Padrão: '/'. URL de redirecionamento após o usuário fazer login com o provedor social.
			errorCallbackURL: '/sign-in', // URL de redirecionamento em caso de erro durante o processo de login com o provedor social.
			newUserCallbackURL: '/app/dashboard', //  URL de redirecionamento em caso de sucesso ao criar uma nova conta com o provedor social.
			disableRedirect: false // Padrão: false. Se true, o redirecionamento para a URL de sucesso ou erro será desabilitado.
		}

		if (social !== undefined) {
			// Chama a API de login social
			await authClient.signIn.social({ provider: social, ...options })
		} else if (oauth2 !== undefined) {
			// Chama a API de login oauth2
			await authClient.signIn.oauth2({ providerId: oauth2, ...options })
		}

		loading = false
	}
</script>

<h1>Login</h1>

<!-- Exibição de erros globais -->
{#if errors.length > 0}
	<div>
		<hr />
		<p>Ocorreram erros ao criar a conta.</p>
		{#each errors as { field, message }}
			{#if !field}
				<!-- Erro geral, como 'Erro ao acessar o servidor.' -->
				<p>{message}</p>
			{/if}
		{/each}
		<hr />
	</div>
{/if}

<!-- Tipo de login -->
<div>
	<p>Escolha a forma como deseja fazer login:</p>
	<select bind:value={type}>
		<option value="email">E-mail</option>
		<option value="otp">Código OTP</option>
		<option value="social">Social</option>
	</select>
</div>

<!-- Login por e-mail e senha -->
{#if type === 'email'}
	<form onsubmit={handleSignInEmail}>
		<!-- Etapa 1: informar o e-mail e senha -->
		{#if stepEmail === 1}
			<div>
				<p>Informe os dados abaixo para fazer o login.</p>
			</div>

			<!-- Campo Email -->
			<div>
				<label>
					Email:
					<input type="text" bind:value={email} autocomplete="email" required />
				</label>
				{#each errors as { field, message }}
					{#if field === 'email'}
						<p class="error">{message}</p>
					{/if}
				{/each}
			</div>

			<!-- Campo Senha -->
			<div>
				<label>
					Senha:
					<input type="password" bind:value={password} autocomplete="current-password" required minlength="8" />
				</label>
				{#each errors as { field, message }}
					{#if field === 'password'}
						<p class="error">{message}</p>
					{/if}
				{/each}
			</div>

			<div>
				<button type="submit" disabled={loading}>
					{loading ? 'Verificando dados...' : 'Entrar'}
				</button>
			</div>

			<!-- Esqueceu a senha? -->
			<div>
				<p><a href="/forget-password">Esqueceu a senha?</a></p>
			</div>
		{/if}

		<!-- Etapa 2: informar o OTP para fazer o login com e-mail e senha (se o e-mail não estiver verificado) -->
		{#if stepEmail === 2}
			<div>
				<h2>Etapa 2</h2>
				<p>Foi enviado um código para o e-mail informado. Informe abaixo o código que recebeu por e-mail para fazer o login.</p>
			</div>
			<div>
				<label>
					Código:
					<input type="text" bind:value={otp} />
				</label>
				{#each errors as { field, message }}
					{#if field === 'otp'}
						<p class="error">{message}</p>
					{/if}
				{/each}
			</div>
			<div>
				<button type="submit" disabled={loading}>
					{loading ? 'Verificando dados...' : 'Entrar'}
				</button>
			</div>
		{/if}
	</form>
{/if}

<!-- Login por OTP -->
{#if type === 'otp'}
	<form onsubmit={handleSignInOtp}>
		<!-- Etapa 1: informar o e-mail para enviar o OTP por e-mail -->
		{#if stepOtp === 1}
			<div>
				<h2>Etapa 1</h2>
				<p>Informe o e-mail abaixo para fazer o login. Enviaremos um código por e-mail que deverá ser informado na próxima etapa.</p>
			</div>
			<div>
				<label>
					Email:
					<input type="email" bind:value={email} autocomplete="email" required />
				</label>
				{#each errors as { field, message }}
					{#if field === 'email'}
						<p class="error">{message}</p>
					{/if}
				{/each}
			</div>
			<div>
				<button type="submit" disabled={loading}>
					{loading ? 'Enviando código...' : 'Enviar código'}
				</button>
			</div>
		{/if}

		<!-- Etapa 2: informar o OTP para fazer o login -->
		{#if stepOtp === 2}
			<div>
				<h2>Etapa 2</h2>
				<p>Foi enviado um código para o e-mail informado. Informe abaixo o código que recebeu por e-mail para fazer o login.</p>
			</div>
			<div>
				<label>
					Código:
					<input type="text" bind:value={otp} />
				</label>
				{#each errors as { field, message }}
					{#if field === 'otp'}
						<p class="error">{message}</p>
					{/if}
				{/each}
			</div>
			<div>
				<button type="submit" disabled={loading}>
					{loading ? 'Verificando dados...' : 'Entrar'}
				</button>
			</div>
		{/if}
	</form>
{/if}

<!-- Login social -->
{#if type === 'social'}
	<div>Login social</div>
	<div>
		<p>Escolha qual forma de login social deseja fazer:</p>
	</div>
	<div>
		<button onclick={() => handleSignInSocial({ social: 'google' })}>Login com Google</button>
	</div>
	<!---
	<div>
		<button onclick={() => handleSignInSocial({ social: 'facebook' })}>Login com Microsoft</button>
	</div>
	<div>
		<button onclick={() => handleSignInSocial({ social: 'facebook' })}>Login com Apple</button>
	</div>
	<div>
		<button onclick={() => handleSignInSocial({ social: 'facebook' })}>Login com Facebook</button>
	</div>
	<div>
		<button onclick={() => handleSignInSocial({ oauth2: 'instagram' })}>Login com Instagram</button>
	</div>
	<div>
		<p>Os provedores sociais acima são suficientes, pois são os maiores detentores de sistemas operacionais (Google Android, Apple iOS, Microsoft Windows) existentes no mundo.</p>
	</div>
	-->
{/if}

<div>
	<p>Não possui uma conta? <a href="/sign-up">Crie uma agora</a></p>
</div>

<!-- 
  Usando @apply com módulos Vue, Svelte ou CSS: 
	https://tailwindcss.com/docs/upgrade-guide#using-apply-with-vue-svelte-or-css-modules
	Usar: @reference "../../../app.css"; Ou usar: var(--text-red-500);
-->
<style>
	@reference "../../../app.css";

	.error {
		@apply text-sm text-red-500;
	}
</style>
