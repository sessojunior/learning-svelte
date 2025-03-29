<script lang="ts">
	import { handleSignOut, session } from '$lib/utils/auth'
</script>

<h1>Dashboard</h1>
<p>Página privada</p>

{#if $session.data}
	<p>Dados do usuário:</p>
	<ul>
		<li>Nome: {$session.data?.user.name}</li>
		<li>E-mail: {$session.data?.user.email}</li>
		<li>E-mail verificado: {$session.data?.user.emailVerified}</li>
		<li>Imagem: {$session.data?.user.name}</li>
		<li>ID: {$session.data?.user.id}</li>
		<li>Data de atualização: {$session.data?.user.updatedAt}</li>
	</ul>
	<p><button onclick={handleSignOut}>Logout</button></p>
{/if}
