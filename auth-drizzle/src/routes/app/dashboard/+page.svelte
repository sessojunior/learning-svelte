<script lang="ts">
	import { handleSignOut, session } from '$lib/utils/auth'
</script>

<h1>Dashboard</h1>
<p>Página privada</p>

<hr />

{#if session}
	<p>Dados da sessão:</p>
	<ul>
		<li>Token: {session?.session.token}</li>
		<li>Criado em: {session?.session.createdAt}</li>
		<li>Expira em: {session?.session.expiresAt}</li>
		<li>Atualiza em: {session?.session.updatedAt}</li>
		<li>Expira em: {session?.session.expiresAt}</li>
		<li>userId: {session?.session.userId}</li>
		<li>id: {session?.session.id}</li>
		<li>
			<img src={session?.user.image} alt="Imagem do usuário" />
		</li>
		<li>ID: {session?.user.id}</li>
		<li>Data de atualização: {session?.user.updatedAt}</li>
	</ul>
	<hr />
	<p>Dados do usuário:</p>
	<ul>
		<li>Nome: {session?.user.name}</li>
		<li>E-mail: {session?.user.email}</li>
		<li>E-mail verificado: {session?.user.emailVerified}</li>
		<li>Imagem: {session?.user.image}</li>
		<li>
			<img src={session?.user.image} alt="Imagem do usuário" />
		</li>
		<li>ID: {session?.user.id}</li>
		<li>Data de atualização: {session?.user.updatedAt}</li>
	</ul>
	<hr />
	<p><a href="/app/profile">Ir para a página de perfil</a></p>
	<p><button onclick={handleSignOut}>Logout</button></p>
{/if}
