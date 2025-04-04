<script lang="ts">
	import { onMount } from 'svelte'
	import { authClient } from '$lib/auth-client'
	import { handleSignOut } from '$lib/utils/auth'

	let userSession: { [key: string]: any } | null = null

	onMount(async () => {
		try {
			const { data } = await authClient.getSession()
			userSession = data
		} catch (err) {
			console.error('Erro ao obter a sessão:', err)
		}
	})
</script>

<h1>Dashboard</h1>
<p>Página privada</p>

<hr />

{#if userSession}
	<p>Dados da sessão:</p>
	<ul>
		<li>Token: {userSession?.session.token}</li>
		<li>Criado em: {userSession?.session.createdAt}</li>
		<li>Expira em: {userSession?.session.expiresAt}</li>
		<li>Atualiza em: {userSession?.session.updatedAt}</li>
		<li>Expira em: {userSession?.session.expiresAt}</li>
		<li>userId: {userSession?.session.userId}</li>
		<li>session id: {userSession?.session.id}</li>
	</ul>
	<hr />
	<p>Dados do usuário:</p>
	<ul>
		<li>Nome: {userSession?.user.name}</li>
		<li>E-mail: {userSession?.user.email}</li>
		<li>E-mail verificado: {userSession?.user.emailVerified}</li>
		<li>Imagem: {userSession?.user.image}</li>
		{#if userSession?.user.image}
			<li>
				<img src={userSession?.user.image} alt="Imagem do usuário" />
			</li>
		{/if}
		<li>user ID: {userSession?.user.id}</li>
		<li>Data de atualização: {userSession?.user.updatedAt}</li>
	</ul>
	<hr />
	<p><a href="/app/profile">Ir para a página de perfil</a></p>
	<p><button onclick={handleSignOut}>Logout</button></p>
{/if}
