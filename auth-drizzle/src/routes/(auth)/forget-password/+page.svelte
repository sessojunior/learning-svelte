<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { errorCodes } from '$lib/utils/auth'
	import { checkIfUserEmailExists } from '$lib/utils/db'
	import { z } from 'zod'

	// Dados para recuperar senha
	let email = $state('')
	let password = $state('')

	// Dados para recuperar senha com OTP
	let stepOtp = $state(1)
	let otp = $state(null)

	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])

	// Esqueceu a senha
	const handleForgotPassword = async () => {
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
				type: 'forget-password' // Pode ser 'sign-in', 'forget-password' ou 'email-verification'
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
				errors = [{ code: error?.code ?? '', message: errorMessage ?? 'Erro ao acessar o servidor.' }]
			}
		}

		// Etapa 2: envia o email, o OTP e a nova senha
		if (stepOtp === 2) {
			// Schema de validação com Zod
			const schema = z.object({
				email: z.string().trim().toLowerCase().email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
				otp: z
					.string()
					.trim()
					.regex(/^\d{6}$/, { message: 'O código é inválido.' }), // Garante que o OTP seja composto por exatamente 6 números
				password: z
					.string()
					.min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }) // Garante que a senha tenha pelo menos 8 caracteres
					.regex(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula.' }) // Garante que a senha contenha pelo menos uma letra maiúscula
					.regex(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula.' }) // Garante que a senha contenha pelo menos uma letra minúscula
					.regex(/\d/, { message: 'A senha deve conter pelo menos um número.' }) // Garante que a senha contenha pelo menos um número
					.regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'A senha deve conter pelo menos um caractere especial.' }) // Garante que a senha contenha pelo menos um caractere especial
			})

			// 1 - Valida os dados recebidos
			const validatedSchema = schema.safeParse({ email, otp, password })
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
			const { data, error } = await authClient.emailOtp.resetPassword({
				email: validatedSchema.data.email,
				otp: validatedSchema.data.otp,
				password: validatedSchema.data.password
			})

			// 4 - Se obteve os dados com sucesso da API
			if (data) {
				// Senha redefinida com sucesso
				// Muda para a etapa 3
				stepOtp = 3
				loading = false
				return false
			}

			// Se obteve um erro
			if (error) {
				// Traduz os erros de API para mensagens amigáveis
				const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
				errors = [{ code: error?.code ?? '', message: errorMessage ?? 'Erro ao acessar o servidor.' }]
			}
		}

		loading = false
	}
</script>

<h1>Esqueceu a senha?</h1>

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

<form onsubmit={handleForgotPassword}>
	<!-- Etapa 1: informar o e-mail para enviar o OTP por e-mail -->
	{#if stepOtp === 1}
		<div>
			<p>Informe os dados abaixo para enviar um e-mail de recuperação de senha.</p>
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
				{loading ? 'Enviando e-mail...' : 'Enviar e-mail'}
			</button>
		</div>
	{/if}

	<!-- Etapa 2: informar o OTP para fazer o login -->
	{#if stepOtp === 2}
		<div>
			<p>Informe abaixo o código que recebeu por e-mail para fazer o login e a sua nova senha.</p>
		</div>
		<div>
			<label>
				Código:
				<input type="text" bind:value={otp} autocomplete="one-time-code" required minlength="6" maxlength="6" />
			</label>
			{#each errors as { field, message }}
				{#if field === 'otp'}
					<p class="error">{message}</p>
				{/if}
			{/each}
		</div>
		<div>
			<label>
				Senha:
				<input type="password" bind:value={password} autocomplete="new-password" required minlength="8" />
			</label>
			{#each errors as { field, message }}
				{#if field === 'password'}
					<p class="error">{message}</p>
				{/if}
			{/each}
		</div>
		<div>
			<button type="submit" disabled={loading}>
				{loading ? 'Redefinindo senha...' : 'Redefinir senha'}
			</button>
		</div>
	{/if}
</form>

<!-- Etapa 3: senha redefinida com sucesso -->
{#if stepOtp === 3}
	<div>
		<p>A senha foi redefinida com sucesso. Faça login novamente.</p>
	</div>
	<div>
		<p><a href="/sign-in">Fazer login</a>.</p>
	</div>
{/if}

<p><a href="/sign-up">Cadastre-se</a> ou <a href="/sign-in">Login</a></p>

<!-- 
  Usando @apply com módulos Vue, Svelte ou CSS: https://tailwindcss.com/docs/upgrade-guide#using-apply-with-vue-svelte-or-css-modules
	Usar: @reference "../../../app.css"; Ou usar: var(--text-red-500);
-->
<style>
	@reference "../../../app.css";

	.error {
		@apply text-sm text-red-500;
	}
</style>
