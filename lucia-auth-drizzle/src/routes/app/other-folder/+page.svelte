<script lang="ts">
	import { enhance } from '$app/forms'
	import type { LayoutServerData } from '../$types'

	let { data }: { data: LayoutServerData } = $props()
</script>

<h1>Olá, {data.user.username}!</h1>

<p>Página /app/other-folder</p>
<p><a href="/app">Voltar para a página /app</a></p>

<p>Seu user ID é {data.user.id}.</p>

<form method="post" action="?/logout" use:enhance>
	<button>Sair</button>
</form>
