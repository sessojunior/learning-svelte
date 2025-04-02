<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { errorCodes } from '$lib/utils/auth'
	import { checkIfUserEmailVerified } from '$lib/utils/db'
	import { z } from 'zod'
	import { goto } from '$app/navigation'

	// Tipo de etapa de cadastro: 'sign-in', 'email-verification'
	let type = $state('sign-in')

	// Dados para cadastro
	let name = $state('')
	let email = $state('')
	let password = $state('')

	// Dados para cadastro com OTP
	let stepOtp = $state(1)
	let otp = $state('')

	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])

	// Mapeamento de campos para nomes amigáveis
	const fieldName: Record<string, string> = {
		name: 'Nome',
		email: 'E-mail',
		password: 'Senha',
		otp: 'Código'
	}

	// Schema de validação com Zod: etapa 1
	const otpStep1SignUpSchema = z.object({
		name: z
			.string()
			.trim()
			.min(2, { message: 'O nome está muito curto.' }) // Garante que o campo tenha pelo menos 2 caracteres
			.regex(/^[A-Za-zÀ-ÿ\s\-.'À-ÿ]*$/, { message: 'O nome não pode conter caracteres especiais.' }), // Permite espaço, traço, ponto e apóstrofo
		email: z.string().trim().email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
		password: z
			.string()
			.min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }) // Garante que a senha tenha pelo menos 8 caracteres
			.regex(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula.' }) // Garante que a senha contenha pelo menos uma letra maiúscula
			.regex(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula.' }) // Garante que a senha contenha pelo menos uma letra minúscula
			.regex(/\d/, { message: 'A senha deve conter pelo menos um número.' }) // Garante que a senha contenha pelo menos um número
			.regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'A senha deve conter pelo menos um caractere especial.' }) // Garante que a senha contenha pelo menos um caractere especial
	})

	// Schema de validação com Zod: etapa 2
	const otpStep2SignUpSchema = z.object({
		name: z
			.string()
			.trim()
			.min(2, { message: 'O nome está muito curto.' }) // Garante que o campo tenha pelo menos 2 caracteres
			.regex(/^[A-Za-zÀ-ÿ\s\-.'À-ÿ]*$/, { message: 'O nome não pode conter caracteres especiais.' }), // Permite espaço, traço, ponto e apóstrofo
		email: z.string().trim().email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
		password: z
			.string()
			.min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }) // Garante que a senha tenha pelo menos 8 caracteres
			.regex(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula.' }) // Garante que a senha contenha pelo menos uma letra maiúscula
			.regex(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula.' }) // Garante que a senha contenha pelo menos uma letra minúscula
			.regex(/\d/, { message: 'A senha deve conter pelo menos um número.' }) // Garante que a senha contenha pelo menos um número
			.regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'A senha deve conter pelo menos um caractere especial.' }), // Garante que a senha contenha pelo menos um caractere especial
		otp: z
			.string()
			.trim()
			.regex(/^\d{6}$/, { message: 'O código é inválido.' }) // Garante que o OTP seja composto por exatamente 6 números
	})

	// Criar conta com e-mail e senha
	const handleSignUp = async () => {
		errors = []

		// Etapa 1: Se enviou o e-mail
		if (stepOtp === 1) {
			// 1 - Valida os dados recebidos
			const validatedSchema = otpStep1SignUpSchema.safeParse({ name, email, password })
			if (!validatedSchema.success) {
				errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))
				return false
			}

			loading = true

			// 2 - Chama a API para enviar o OTP para o e-mail do usuário
			const { data, error } = await authClient.signUp.email({ email, password, name })

			loading = false

			console.log('data 1', data)
			console.log('error 1', error)

			// 3 - Se obteve os dados com sucesso da API
			if (data) {
				// Muda para a etapa 2
				stepOtp = 2
				return false
			} else {
				// 3.1 - Se o usuário já existe
				if (error.code === 'USER_ALREADY_EXISTS') {
					console.log('ERROR USER_ALREADY_EXISTS')

					// 3.1.1 - Verifica se o e-mail está verificado
					const userEmailVerified = await checkIfUserEmailVerified(validatedSchema.data.email)

					// 3.1.2 - Se o e-mail do usuário já foi verificado
					if (userEmailVerified) {
						console.log('ERROR userEmailVerified')

						// Exibe mensagem de que a conta já existe, e que é necessário fazer o login.
						errors = [{ code: 'USER_EMAIL_ALREADY_VERIFIED', message: 'Usuário já existente. Faça login para entrar.' }]
						return false
					}

					// 3.1.3 - Se o e-mail do usuário ainda não foi verificado
					if (!userEmailVerified) {
						console.log('ERROR !userEmailVerified')

						loading = true

						// Chama a API para enviar o OTP para o e-mail do usuário
						const { data, error } = await authClient.emailOtp.sendVerificationOtp({
							email: validatedSchema.data.email,
							type: 'email-verification' // Pode ser 'sign-in', 'forget-password' ou 'email-verification'
						})

						loading = false

						// Exibe mensagem de que será enviado um código para o e-mail para verificar a conta.
						errors = [
							{
								code: 'USER_EMAIL_NOT_VERIFIED',
								message: 'Já existe um cadastro anterior com esse e-mail, mas não havia sido verificado. É preciso apenas que confirme o código enviado para o seu e-mail. Os dados como nome, e-mail e senha não serão alterados, ficarão como foram cadastrados anteriormente.'
							}
						]

						// Muda para a etapa 2
						stepOtp = 2
						return false
					}
				} else {
					// Traduz os erros de API para mensagens amigáveis
					const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
					errors = [{ code: error?.code ?? '', message: errorMessage ?? error?.message }]
				}
			}

			console.log('errors', errors)
		}

		// Etapa 2: Se enviou o name, email, password e otp
		if (stepOtp === 2) {
			// 1 - Valida os dados recebidos
			const validatedSchema = otpStep2SignUpSchema.safeParse({ name, email, password, otp })
			if (!validatedSchema.success) {
				errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))
				return false
			}

			loading = true

			// 3 - Chama a API de login com OTP para verificar o e-mail
			const { data, error } = await authClient.emailOtp.verifyEmail({
				email: validatedSchema.data.email,
				otp: validatedSchema.data.otp
			})

			console.log('data 2', data)
			console.log('error 2', error)

			// 4 - Se obteve os dados com sucesso da API
			if (data) {
				// // 4.1 - Atualiza o nome do usuário
				// await authClient.updateUser({ name: validatedSchema.data.name })

				// // 4.2 - Atualiza a senha do usuário
				// await authClient.changePassword({
				// 	newPassword: validatedSchema.data.password,
				// 	currentPassword: validatedSchema.data.password
				// })

				// 4.3 - Chama a API para fazer o login com os dados do usuário
				const { data: dataLogin, error: errorLogin } = await authClient.signIn.email({
					email: validatedSchema.data.email,
					password: validatedSchema.data.password,
					rememberMe: true,
					callbackURL: '/app/dashboard' // Redireciona para o dashboard
				})

				// 4.4 - Se obteve os dados com sucesso da API
				if (errorLogin) {
					// Traduz os erros de API para mensagens amigáveis
					const errorMessage = (errorLogin?.code as keyof typeof errorCodes) ? errorCodes[errorLogin?.code as keyof typeof errorCodes] : ''
					errors = [{ code: errorLogin?.code ?? '', message: errorMessage ?? errorLogin?.message }]
				}
			} else {
				// Traduz os erros de API para mensagens amigáveis
				const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
				errors = [{ code: error?.code ?? '', message: errorMessage ?? error?.message }]
			}

			loading = false
		}
	}
</script>

<h1>Criar conta</h1>

<!-- Exibição de erros globais -->
{#if errors.length > 0}
	<div>
		<p>Ocorreram erros ao criar a conta.</p>
		{#each errors as { field, message }}
			{#if !field}
				<!-- Erro geral, como 'Erro ao acessar o servidor.' -->
				<p>{message}</p>
			{:else}
				<!-- Erro de campo, como 'O campo nome é obrigatório.' -->
				<p>{fieldName[field]}: {message}</p>
			{/if}
		{/each}
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
				<input type="password" bind:value={password} autocomplete="new-password" required minlength="8" />
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

	<!-- Etapa 2: informar o OTP para confirmar o e-mail e criar a conta -->
	{#if stepOtp === 2}
		<div>
			<h2>Etapa 2</h2>
			<p>Foi enviado um código para o e-mail informado. Informe abaixo o código que recebeu por e-mail para criar a conta.</p>
		</div>

		<!-- Campo OTP -->
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

		<!-- Botão de envio -->
		<div>
			<button type="submit" disabled={loading}>
				{loading ? 'Enviando dados...' : 'Enviar código'}
			</button>
		</div>
	{/if}

	<!-- Etapa 3: conta criada com sucesso -->
	{#if stepOtp === 3}
		<div>
			<h2>Etapa 3</h2>
			<p>A conta foi criada com sucesso. Faça login agora para entrar.</p>
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
