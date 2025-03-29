<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { errorCodes } from '$lib/utils/auth'
	import { z } from 'zod'
	import { goto } from '$app/navigation'

	// Dados para cadastro
	let name = $state('')
	let email = $state('')
	let password = $state('')

	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])

	// Mapeamento de campos para nomes amigáveis
	const fieldName: Record<string, string> = {
		name: 'Nome',
		email: 'E-mail',
		password: 'Senha'
	}

	// Schema de validação com Zod
	const signUpSchema = z.object({
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

	// Criar conta com e-mail e senha
	const handleSignUpEmail = async () => {
		errors = []

		// 1 - Valida os dados recebidos
		const validatedSchema = signUpSchema.safeParse({ name, email, password })
		if (!validatedSchema.success) {
			errors = validatedSchema.error.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))

			return false
		}

		loading = true

		// 2 - Chama a API de cadastro do usuário
		const { data, error } = await authClient.signUp.email({
			name: validatedSchema.data.name,
			email: validatedSchema.data.email,
			password: validatedSchema.data.password
		})

		loading = false

		// 3 - Se obteve os dados com sucesso da API
		if (data) {
			// Redireciona para o dashboard
			goto('/app/dashboard')

			return false
		} else {
			// Traduz os erros de API para mensagens amigáveis
			const errorMessage = (error?.code as keyof typeof errorCodes) ? errorCodes[error?.code as keyof typeof errorCodes] : ''
			errors = [{ code: error?.code ?? '', message: errorMessage ?? 'Erro ao acessar o servidor.' }]
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
			{/if}
		{/each}
	</div>
{/if}

<!-- Criar conta com e-mail e senha -->
<form onsubmit={handleSignUpEmail}>
	<div>
		<p>Informe os dados abaixo para criar uma conta.</p>
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
			{loading ? 'Cadastrando...' : 'Cadastrar'}
		</button>
	</div>
</form>

<div>
	<p>Já possui uma conta? <a href="/sign-in">Faça login</a></p>
</div>

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
