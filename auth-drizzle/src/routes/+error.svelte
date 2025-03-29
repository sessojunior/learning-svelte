<script lang="ts">
	import { page } from '$app/state'
</script>

<div>
	<h1>Erro {page.status}</h1>
	<p>{page.error?.message || 'Algo deu errado.'}</p>
	<a href="/">Voltar para a página inicial</a>
</div>
