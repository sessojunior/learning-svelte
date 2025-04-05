<script lang="ts">
	import { enhance } from '$app/forms'
	import type { LayoutServerData } from './$types'

	let { data }: { data: LayoutServerData } = $props()
</script>

<h1>Olá, {data.user.username}!</h1>

<p>Página /app</p>
<p><a href="/app/other-folder">Ir para a página /app/other-folder</a></p>

<p>Seu user ID é {data.user.id}.</p>

<form method="post" action="?/logout" use:enhance>
	<button>Sair</button>
</form>
