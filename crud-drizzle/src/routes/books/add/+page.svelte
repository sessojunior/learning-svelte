<script lang="ts">
	let title = ''
	let author = ''
	let message = ''

	async function addBook() {
		message = '' // Limpa mensagens anteriores
		if (!title || !author) {
			message = 'Preencha todos os campos.'
			return
		}

		const res = await fetch('/api/books', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title, author })
		})

		if (res.ok) {
			message = 'Livro adicionado com sucesso!'
			title = ''
			author = ''
		} else {
			message = 'Erro ao adicionar livro.'
		}
	}
</script>

<h1>Adicionar Livro</h1>

<form onsubmit={addBook}>
	<div>
		<label for="title">Título:</label>
		<input id="title" bind:value={title} required />
	</div>

	<div>
		<label for="author">Autor:</label>
		<input id="author" bind:value={author} required />
	</div>

	<button type="submit">Adicionar</button>
</form>

{#if message}
	<p>{message}</p>
{/if}

<p><a href="/books">Voltar para a lista</a></p>
