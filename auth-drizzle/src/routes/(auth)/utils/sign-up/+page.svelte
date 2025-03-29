<script lang="ts">
	import { goto } from '$app/navigation'

	// Dados para cadastro
	let name = $state('')
	let email = $state('')
	let password = $state('')

	// Carregando e erros
	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])

	// Mapeamento de campos para nomes amigáveis
	const fieldName: Record<string, string> = {
		name: 'Nome',
		email: 'E-mail',
		password: 'Senha'
	}

	// Criar conta com e-mail e senha
	const handleSignUpEmail = async () => {
		loading = true
		errors = [] // Reseta a mensagem de erro antes de tentar cadastrar novamente

		try {
			// Chama a API de cadastro
			const response = await fetch('/api/auth/sign-up', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			})

			loading = false // Desativa o loading após a resposta da API

			const data = await response.json() // Resposta da API

			// Se foi feito o cadastro
			if (response.ok && data.success) {
				goto('/app/dashboard') // Redireciona para o dashboard
			} else {
				// Se houve erros recebidos pela API
				if (data.errors) {
					errors = data.errors
				} else {
					errors = [{ code: 'UNKNOWN', message: 'Erro desconhecido ao realizar o cadastro do usuário.' }]
				}
			}
		} catch (err) {
			console.error('Erro ao processar a resposta:', err)
			errors = [{ code: 'PROCCESS_ERROR', message: 'Erro ao processar a resposta da API.' }]
		}
	}
</script>

<h1>Criar conta</h1>

<!-- Exibição de erros globais -->
{#if errors.length > 0}
	<div>
		{#each errors as { field, message }}
			{#if !field}
				<!-- Erro geral, como 'Erro desconhecido' -->
				<p>Mensagem: {message}</p>
			{:else}
				<!-- Erro específico do campo -->
				<p>{fieldName[field] || field}: {message}</p>
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
	Usando @apply com módulos Vue, Svelte ou CSS
	https://tailwindcss.com/docs/upgrade-guide#using-apply-with-vue-svelte-or-css-modules
	Usar: @reference "../../app.css";
	Ou usar: var(--text-red-500);
-->
<style>
	@reference "../../../app.css";

	.error {
		@apply text-sm text-red-500;
	}
</style>
