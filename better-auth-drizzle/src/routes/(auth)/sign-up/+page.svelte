<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { errorCodes } from '$lib/utils/auth'
	import { checkIfUserEmailVerified } from '$lib/utils/db'
	import { z } from 'zod'

	// Dados para cadastro
	let name = $state('')
	let email = $state('')
	let password = $state('')

	// Dados para cadastro com OTP
	let stepOtp = $state(1)
	let otp = $state('')

	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])

	// Criar conta
	const handleSignUp = async () => {
		loading = true
		errors = []

		// Etapa 1: Se enviou os dados para criar a conta
		if (stepOtp === 1) {
			// Schema de validação com Zod
			const schema = z.object({
				name: z
					.string()
					.trim()
					.min(2, { message: 'O nome está muito curto.' }) // Garante que o campo tenha pelo menos 2 caracteres
					.regex(/^[A-Za-zÀ-ÿ\s\-.'À-ÿ]*$/, { message: 'O nome não pode conter caracteres especiais.' }), // Permite espaço, traço, ponto e apóstrofo
				email: z.string().trim().toLowerCase().email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
				password: z
					.string()
					.min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }) // Garante que a senha tenha pelo menos 8 caracteres
					.regex(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula.' }) // Garante que a senha contenha pelo menos uma letra maiúscula
					.regex(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula.' }) // Garante que a senha contenha pelo menos uma letra minúscula
					.regex(/\d/, { message: 'A senha deve conter pelo menos um número.' }) // Garante que a senha contenha pelo menos um número
					.regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'A senha deve conter pelo menos um caractere especial.' }) // Garante que a senha contenha pelo menos um caractere especial
			})

			// 1 - Valida os dados recebidos
			const validatedSchema = schema.safeParse({ name, email, password })
			if (!validatedSchema.success) {
				errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))
				loading = false
				return false
			}

			// 2 - Chama a API para enviar o OTP para o e-mail do usuário
			const { data, error } = await authClient.signUp.email({ email: validatedSchema.data.email, password: validatedSchema.data.password, name: validatedSchema.data.name })

			// 3 - Se obteve os dados com sucesso da API
			if (data) {
				// Pula para a etapa 2
				stepOtp = 2
				loading = false
				return false
			}

			// 4 - Se o usuário já existe
			if (error?.code === 'USER_ALREADY_EXISTS') {
				// 4.1 - Verifica se o e-mail está verificado
				const userEmailVerified = await checkIfUserEmailVerified(validatedSchema.data.email)

				// 4.2 - Se o e-mail do usuário já foi verificado
				// Exibe mensagem de que a conta já existe, e que é necessário fazer o login.
				if (userEmailVerified) {
					errors = [{ code: 'USER_ALREADY_EXISTS', message: 'Usuário já existente. Faça login para entrar.' }]
					loading = false
					return false
				}

				// 4.3 - Se o e-mail do usuário ainda não foi verificado
				// Exibe mensagem de que é necessário enviar um código para o e-mail do usuário para verificar a conta.
				if (!userEmailVerified) {
					// Chama a API para enviar o OTP para o e-mail do usuário
					await authClient.emailOtp.sendVerificationOtp({
						email: validatedSchema.data.email,
						type: 'email-verification' // Pode ser 'sign-in', 'forget-password' ou 'email-verification'
					})

					// Exibe mensagem de que será enviado um código para o e-mail para verificar a conta.
					errors = [{ code: 'EMAIL_NOT_VERIFIED', message: 'E-mail não verificado. Verifique a sua conta confirmando o código que foi enviado para o seu e-mail.' }]

					// Pula para a etapa 2
					stepOtp = 2
					loading = false
					return false
				}
			} else {
				// Traduz os erros de API para mensagens amigáveis
				const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
				errors = [{ code: error?.code ?? '', message: errorMessage ?? 'Erro ao acessar o servidor.' }]
			}
		}

		// Etapa 2: Se enviou o código OTP
		if (stepOtp === 2) {
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
				// 3.1 - Altera o nome do usuário com o último nome de usuário digitado pelo usuário
				await authClient.updateUser({ name: name.trim() })

				// 3.3 - Redireciona para a página de dashboard
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
</script>

<h1>Criar conta</h1>

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

<!-- Criar conta -->
<form onsubmit={handleSignUp}>
	<!-- Etapa 1: informar os dados para criar a conta -->
	{#if stepOtp === 1}
		<div>
			<h2>Etapa 1</h2>
			<p>Insira os dados abaixo para cria sua conta.</p>
		</div>
		<!-- Campo Nome -->
		<div>
			<label>
				Nome:
				<input type="text" bind:value={name} autocomplete="name" minlength="2" required />
			</label>
			{#each errors as { field, message }}
				{#if field === 'name'}
					<p class="error">{message}</p>
				{/if}
			{/each}
		</div>

		<!-- Campo Email -->
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

		<!-- Botão de envio -->
		<div>
			<button type="submit" disabled={loading}>
				{loading ? 'Enviando dados...' : 'Criar conta'}
			</button>
		</div>
	{/if}

	<!-- Etapa 2: informar o OTP para verificar o e-mail e criar a conta com os dados informados -->
	{#if stepOtp === 2}
		<div>
			<h2>Etapa 2</h2>
			<p>Foi enviado um código para o e-mail informado. Informe abaixo o código que recebeu por e-mail para criar a conta.</p>
		</div>

		<!-- Campo OTP -->
		<div>
			<label>
				Código:
				<input type="text" bind:value={otp} autocomplete="one-time-code" required />
			</label>
			{#each errors as { field, message }}
				{#if field === 'otp'}
					<p class="error">{message}</p>
				{/if}
			{/each}
		</div>

		<!-- Botão de envio -->
		<div>
			<button type="submit" disabled={loading}>
				{loading ? 'Enviando dados...' : 'Enviar código'}
			</button>
		</div>
	{/if}
</form>

<div>
	<p>Já possui uma conta? <a href="/sign-in">Faça login</a></p>
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
