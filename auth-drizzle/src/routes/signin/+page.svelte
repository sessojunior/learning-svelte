<script lang="ts">
	import { goto } from '$app/navigation'

	// Tipo de login: 'email', 'otp', 'social'
	let type = $state('email')

	// Dados para login por e-mail
	let email = $state('')
	let password = $state('')

	// Dados para login com OTP
	let stepOtp = $state(1)
	let otp = $state(null)

	// Carregando e erros
	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])

	// Mapeamento de campos para nomes amigáveis
	const fieldName: Record<string, string> = {
		name: 'Nome',
		email: 'E-mail',
		password: 'Senha'
	}

	// Login com e-mail e senha
	const handleSignInEmail = async () => {
		loading = true

		// Reseta a mensagem de erro antes de tentar fazer login novamente
		errors = []

		try {
			// Chama a API de login
			const response = await fetch('/api/auth/signin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'email', email, password })
			})

			loading = false // Desativa o loading após a resposta da API

			const data = await response.json() // Resposta da API

			// Se foi feito o login
			if (response.ok && data.success) {
				// Redireciona para o dashboard
				goto('/dashboard')
			} else {
				// Se houve erros recebidos pela API
				if (data.errors) {
					errors = data.errors
				} else {
					errors = [{ code: 'UNKNOWN', message: 'Erro desconhecido ao fazer o login.' }]
				}
			}
		} catch (err) {
			console.error('Erro ao processar a resposta:', err)
			errors = [{ code: 'PROCCESS_ERROR', message: 'Erro ao processar a resposta da API.' }]
		}
	}

	// Login com OTP
	const handleSignInOtp = async () => {
		try {
			// Se for o passo 1 do OTP
			if (stepOtp === 1) {
				// Se preencheu o e-mail
				if (email) {
					loading = true
					errors = []

					// Chama a API de login
					const response = await fetch('/api/auth/signin', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ type: 'otp', email })
					})

					loading = false // Desativa o loading após a resposta da API

					const data = await response.json() // Resposta da API

					// Se foi enviado o OTP por e-mail
					if (response.ok && data.success) {
						// Avança para o passo 2 do OTP
						stepOtp = 2
						// Reseta a mensagem de erro antes de tentar fazer login novamente
						errors = []
					} else {
						// Se houve erros recebidos pela API
						if (data.errors) {
							errors = data.errors
						} else {
							errors = [{ code: 'UNKNOWN', message: 'Erro desconhecido ao fazer o login.' }]
						}
					}
				}
			}

			// Se for o passo 2 do OTP
			if (stepOtp === 2) {
				// Se preencheu o e-mail e o OTP
				if (email && otp) {
					loading = true
					errors = []

					// Chama a API de login
					const response = await fetch('/api/auth/signin', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ type: 'otp', email, otp })
					})

					loading = false // Desativa o loading após a resposta da API

					const data = await response.json() // Resposta da API

					// Se o OTP corresponder ao fornecido
					if (response.ok && data.success) {
						// Redireciona para o dashboard
						goto('/dashboard')
					} else {
						// Se houve erros recebidos pela API
						if (data.errors) {
							errors = data.errors
						} else {
							errors = [{ code: 'UNKNOWN', message: 'Erro desconhecido ao fazer o login.' }]
						}
					}
				}
			}
		} catch (err) {
			console.error('Erro ao processar a resposta:', err)
			errors = [{ code: 'PROCCESS_ERROR', message: 'Erro ao processar a resposta da API.' }]
		}
	}
</script>

<h1>Login</h1>

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

<!-- Tipo de autenticação -->
<div>
	<p>Escolha a forma como deseja fazer login:</p>
	<select bind:value={type}>
		<option value="email">E-mail</option>
		<option value="otp">OTP</option>
		<option value="social">Social</option>
	</select>
</div>

{#if type === 'email'}
	<!-- Login por e-mail e senha -->
	<form onsubmit={handleSignInEmail}>
		<div>
			<p>Informe os dados abaixo para fazer o login. Enviaremos um código por e-mail que deverá ser informado na próxima etapa.</p>
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
				{loading ? 'Entrando...' : 'Entrar'}
			</button>
		</div>
	</form>
{:else if type === 'otp'}
	<!-- Login por OTP -->
	{#if stepOtp === 1}
		<!-- Login por OTP: Etapa 1 (informar o e-mail) -->
		<form onsubmit={handleSignInOtp}>
			<div>
				<p>Informe o e-mail abaixo para fazer o login.</p>
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
		</form>
	{:else if stepOtp === 2}
		<!-- Login por OTP: Etapa 2 (informar o OTP) -->
		<form onsubmit={handleSignInOtp}>
			<div>
				<p>Informe o OTP abaixo para fazer o login.</p>
			</div>
			<div>
				<label>
					OTP:
					<input type="text" bind:value={otp} required />
				</label>
				{#each errors as { field, message }}
					{#if field === 'otp'}
						<p class="error">{message}</p>
					{/if}
				{/each}
			</div>
			<div>
				<button type="submit" disabled={loading}>
					{loading ? 'Entrando...' : 'Entrar'}
				</button>
			</div>
		</form>
	{/if}
{:else if type === 'social'}
	<div>Login social</div>
{/if}

<div>
	<p>Não possui uma conta? <a href="/signup">Crie uma agora</a></p>
</div>

<!-- 
	Usando @apply com módulos Vue, Svelte ou CSS
	https://tailwindcss.com/docs/upgrade-guide#using-apply-with-vue-svelte-or-css-modules
	Usar: @reference "../../app.css";
	Ou usar: var(--text-red-500);
-->
<style>
	@reference "../../app.css";

	.error {
		@apply text-sm text-red-500;
	}
</style>
