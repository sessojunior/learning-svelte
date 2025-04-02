<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { errorCodes } from '$lib/utils/auth'
	import { checkIfUserExists } from '$lib/utils/db'
	import { handleSignOut, session } from '$lib/utils/auth'
	import { z } from 'zod'

	// Dados do perfil do usuário
	let name = $state(session?.user.name ?? '')
	let image = $state(session?.user.image ?? '')

	// Dados para alterar e-mail
	let stepEmail = $state(1)
	let email = $state(session?.user.email ?? '')

	// Senha do usuário
	let password = $state('')

	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])
	let success = $state('')

	// Mapeamento de campos para nomes amigáveis
	const fieldName: Record<string, string> = {
		email: 'E-mail',
		password: 'Senha',
		otp: 'Código'
	}

	// Schema de validação com Zod: tipo name
	const nameUpdateSchema = z.object({
		name: z.string().trim().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }) // Garante que o nome tenha pelo menos 2 caracteres
	})

	// Schema de validação com Zod: tipo email
	const emailUpdateSchema = z.object({
		email: z.string().trim().email({ message: 'O e-mail é inválido.' }) // Garante que o e-mail é válido
	})

	// Schema de validação com Zod: tipo password
	const passwordUpdateSchema = z.object({
		password: z
			.string()
			.min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }) // Garante que a senha tenha pelo menos 8 caracteres
			.regex(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula.' }) // Garante que a senha contenha pelo menos uma letra maiúscula
			.regex(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula.' }) // Garante que a senha contenha pelo menos uma letra minúscula
			.regex(/\d/, { message: 'A senha deve conter pelo menos um número.' }) // Garante que a senha contenha pelo menos um número
			.regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'A senha deve conter pelo menos um caractere especial.' }) // Garante que a senha contenha pelo menos um caractere especial
	})

	// Altera o nome
	const handleUpdateName = async () => {
		errors = []

		// 1 - Valida os dados recebidos
		const validatedSchema = nameUpdateSchema.safeParse({ name })
		if (!validatedSchema.success) {
			errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))

			return false
		}

		loading = true

		// 2 - Chama a API de alterar dados do usuário
		const { data, error } = await authClient.updateUser({
			name: validatedSchema.data.name
		})

		loading = false

		// 3 - Se obteve os dados com sucesso da API
		if (data) {
			// Exibe mensagem de sucesso
			success = 'Nome do usuário alterado com sucesso.'

			return false
		} else {
			// Traduz os erros de API para mensagens amigáveis
			const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
			errors = [{ code: error?.code ?? '', message: errorMessage ?? error?.message }]
		}
	}

	// Altera o e-mail
	const handleUpdateEmail = async () => {
		errors = []

		// 1 - Valida os dados recebidos
		const validatedSchema = emailUpdateSchema.safeParse({ email })
		if (!validatedSchema.success) {
			errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))

			return false
		}

		// Etapa 1: Se alterou apenas o email
		if (stepEmail === 1) {
			loading = true

			// 2 - Chama a API para enviar o OTP para o e-mail do usuário
			const { data, error } = await authClient.emailOtp.sendVerificationOtp({
				email: validatedSchema.data.email,
				type: 'email-verification' // Pode ser 'sign-in', 'forget-password' ou 'email-verification'
			})

			loading = false

			// 3 - Se obteve os dados com sucesso da API
			if (data) {
				// Exibe mensagem de sucesso
				success = 'Enviado um e-mail de verificação para seu novo e-mail para confirmar a alteração de e-mail.'

				return false
			} else {
				// Traduz os erros de API para mensagens amigáveis
				const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
				errors = [{ code: error?.code ?? '', message: errorMessage ?? error?.message }]
			}
		}

		// Etapa 2: Se alterou o email e confirmou clicando no link enviado por e-mail
		if (stepEmail === 2) {
			loading = true

			// 2 - Chama a API de alterar o e-mail do usuário
			const { data, error } = await authClient.changeEmail({
				newEmail: email,
				callbackURL: '/app/dashboard' // URL de redirecionamento após a verificação do e-mail
			})

			loading = false

			// 3 - Se obteve os dados com sucesso da API
			if (data) {
				// Exibe mensagem de sucesso
				success = 'E-mail do usuário alterado com sucesso.'

				return false
			} else {
				// Traduz os erros de API para mensagens amigáveis
				const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
				errors = [{ code: error?.code ?? '', message: errorMessage ?? error?.message }]
			}
		}
	}
</script>

<h1>Alterar dados do perfil</h1>

<p>Página privada</p>

<p>Esta página altera somente alguns dados da conta do usuário, como nome, e-mail, senha e imagem. Para alterar outros dados como sexo, data de nascimento, telefone etc. é necessário alterar a tabela de dados de perfil (profile), que deve ser criada depois.</p>

<hr />

<!-- Exibição de erros globais -->
{#if errors.length > 0}
	<div>
		<p>Ocorreram erros ao alterar os dados.</p>
		{#each errors as error}
			{error.code} {error.message}
		{/each}
		{#each errors as { field, message }}
			{#if !field}
				<!-- Erro geral, como 'Erro ao acessar o servidor.' -->
				<p>{message}</p>
			{/if}
		{/each}
	</div>
{/if}

<!-- Exibição de sucesso -->
{#if success}
	<p>{success}</p>
{/if}

<h2>Alterar dados do usuário</h2>

<p>Altere os dados do usuário abaixo.</p>

<form onsubmit={handleUpdateName}>
	<!-- Campo Nome -->
	<div>
		<label>
			Nome:
			<input type="text" bind:value={name} autocomplete="name" required />
		</label>
		{#each errors as { field, message }}
			{#if field === 'name'}
				<p class="error">{message}</p>
			{/if}
		{/each}
	</div>

	<div>
		<button type="submit" disabled={loading}>
			{loading ? 'Alterando...' : 'Alterar'}
		</button>
	</div>
</form>

<hr />

<h2>Alterar e-mail</h2>

<p>Altere o e-mail do usuário abaixo.</p>

<form onsubmit={handleUpdateEmail}>
	<!-- Campo E-mail -->
	<div>
		<label>
			E-mail:
			<input type="text" bind:value={email} autocomplete="email" required />
		</label>
		{#each errors as { field, message }}
			{#if field === 'email'}
				<p class="error">{message}</p>
			{/if}
		{/each}
	</div>

	<div>
		<button type="submit" disabled={loading}>
			{loading ? 'Alterando...' : 'Alterar'}
		</button>
	</div>
</form>

<hr />

<h2>Alterar senha</h2>

<hr />

<h2>Alterar imagem</h2>

<p>Image preview of file upload: <a href="https://svelte.dev/playground/b5333059a2f548809a3ac3f60a17a8a6?version=5.25.5" target="_blank">https://svelte.dev/playground/b5333059a2f548809a3ac3f60a17a8a6?version=5.25.5</a></p>
<p>Image file upload: <a href="https://www.okupter.com/blog/sveltekit-file-upload" target="_blank">https://www.okupter.com/blog/sveltekit-file-upload</a></p>

<hr />

<p><a href="/app/dashboard">Ir para o dashboard</a></p>
<p><button onclick={handleSignOut}>Logout</button></p>

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
