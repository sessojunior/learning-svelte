<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/state'

	let id = page.params.id
	let title = $state('')
	let author = $state('')
	let message = $state('')

	async function fetchBook() {
		const res = await fetch(`/api/books/${id}`)
		const data = await res.json()

		if (res.ok) {
			title = data.title
			author = data.author
		} else {
			message = data.error || 'Erro ao carregar livro.'
		}
	}

	async function updateBook() {
		message = ''
		if (!title || !author) {
			message = 'Preencha todos os campos.'
			return
		}

		const res = await fetch(`/api/books/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title, author })
		})

		if (res.ok) {
			message = 'Livro atualizado com sucesso!'
		} else {
			message = 'Erro ao atualizar livro.'
		}
	}

	onMount(fetchBook)
</script>

<h1>Editar Livro</h1>

{#if message}
	<p>{message}</p>
{/if}

<form onsubmit={updateBook}>
	<div>
		<label for="title">Título:</label>
		<input id="title" bind:value={title} required />
	</div>

	<div>
		<label for="author">Autor:</label>
		<input id="author" bind:value={author} required />
	</div>

	<button type="submit">Salvar Alterações</button>
</form>

<p><a href="/books">Voltar para a lista</a></p>
