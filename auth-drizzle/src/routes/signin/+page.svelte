<script lang="ts">
	import { signInEmail, signInOtp } from '$lib/utils/auth-functions'
	import { goto } from '$app/navigation'

	// Tipo de login: 'email', 'otp', 'social'
	let type = $state('email')

	// Login com e-mail e senha
	let email = $state('')
	let password = $state('')

	// Login com OTP
	let stepOtp = $state(1)
	let otp = $state(null)

	// Carregando e mensagem
	let loading = $state(false)
	let errorMessage: string | null = $state(null)

	// Login com e-mail e senha
	const handleSignInEmail = async () => {
		loading = true
		try {
			const response = await signInEmail(email, password)
			loading = false
			// Se obteve dados, redireciona para o dashboard
			if (response?.data) return goto('/dashboard')
			// Se obteve erro, exibe a mensagem
			errorMessage = response?.errorMsg || 'Ocorreu um erro ao tentar fazer login.'
			console.error('Erro ao fazer login:', response?.error)
		} catch (err) {
			loading = false
			// Exibe a mensagem de erro
			errorMessage = 'Erro inesperado. Tente novamente.'
			console.error('Erro inesperado no login:', err)
		}
	}

	// Login com OTP
	const handleSignInOtp = async () => {
		loading = true
		try {
			const response = await signInOtp(email)
			loading = false
			// Se obteve dados, avança para o passo 2 (informar o OTP)
			if (response?.data?.success) {
				errorMessage = null
				console.log('response?.data', response?.data)
				return (stepOtp = 2)
			}
			// Se obteve erro, exibe a mensagem
			errorMessage = response?.errorMsg || 'Erro ao enviar OTP.'
			console.error('Erro ao enviar OTP:', response?.error)
		} catch (err) {
			loading = false
			// Exibe a mensagem de erro
			errorMessage = 'Erro inesperado. Tente novamente.'
			console.error('Erro inesperado no login OTP:', err)
		}
	}
</script>

<h1>Login</h1>

<!-- Mensagem de erro -->
{#if errorMessage}
	<div>
		<p>Mensagem: {errorMessage}</p>
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
		</div>
		<div>
			<label>
				Senha:
				<input type="password" bind:value={password} autocomplete="new-password" required minlength="8" />
			</label>
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
