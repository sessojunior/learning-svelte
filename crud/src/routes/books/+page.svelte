<script lang="ts">
	import { onMount } from 'svelte'
	import type { BookParams } from '$lib/db/schema'

	let books: BookParams[] = [] // Lista de livros
	let loading = $state(true) // Estado de carregamento
	let searchQuery = $state('') // Estado da busca
	let filteredBooks = $state<BookParams[]>([]) // Estado para armazenar livros filtrados
	let isModalOpen = $state(false) // Estado para o modal de confirmação
	let bookToDelete: string | null = null // ID do livro a ser excluído
	let sortBy = $state<'title' | 'author'>('title') // Estado para ordenação

	// Função para buscar livros na API
	async function fetchBooks() {
		const res = await fetch('/api/books')
		books = res.ok ? await res.json() : []
		loading = false // Atualiza o estado de carregamento
		filterBooks() // Atualiza os livros filtrados
	}

	// Função para filtrar e ordenar os livros dinamicamente
	function filterBooks() {
		let query = searchQuery.toLowerCase()

		// Filtra os livros
		let results = !query ? books : books.filter((book) => book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query))

		// Cria uma cópia do array e ordena dinamicamente
		results = [...results].sort((a, b) => (a[sortBy] || '').localeCompare(b[sortBy] || ''))

		// Atualiza a lista filtrada
		filteredBooks = results
	}

	// Atualiza o critério de ordenação
	function updateSortOrder(order: 'title' | 'author') {
		sortBy = order
		filterBooks()
	}

	// Função chamada quando o usuário confirma a exclusão
	async function confirmDelete() {
		if (bookToDelete) {
			const res = await fetch(`/api/books/${bookToDelete}`, {
				method: 'DELETE'
			})

			if (res.ok) {
				books = books.filter((book) => book.id !== bookToDelete)
				filterBooks()
			} else {
				alert('Erro ao excluir livro.')
			}

			// Fechar o modal após a exclusão
			isModalOpen = false
			bookToDelete = null // Limpar o ID do livro
		}
	}

	// Função chamada quando o usuário cancela a exclusão
	function cancelDelete() {
		isModalOpen = false
		bookToDelete = null // Limpar o ID do livro
	}

	// Função chamada para abrir o modal de exclusão
	function openDeleteDialog(id: string) {
		bookToDelete = id
		isModalOpen = true
	}

	// Função que será chamada toda vez que o usuário modificar a busca
	function updateSearchQuery(event: Event) {
		const input = event.target as HTMLInputElement
		searchQuery = input.value // Atualiza o estado da busca
		filterBooks() // Filtra os livros com base no novo valor da busca
	}

	// Carregar os livros ao montar o componente
	onMount(fetchBooks)
</script>

<h1>Lista de Livros</h1>

<!-- Barra de busca e ordenação -->
<div>
	<input type="text" placeholder="Buscar por título ou autor..." oninput={updateSearchQuery} aria-label="Buscar livros" />

	<label>
		Ordenar por:
		<select bind:value={sortBy} onchange={() => updateSortOrder(sortBy)}>
			<option value="title">Título</option>
			<option value="author">Autor</option>
		</select>
	</label>
</div>

{#if loading}
	<p>Carregando...</p>
{:else if filteredBooks.length === 0}
	<p>Nenhum livro encontrado.</p>
{:else}
	<ul>
		{#each filteredBooks as { id, title, author }}
			<li>
				{title} por {author}
				<a href={`/books/edit/${id}`}>✏️ Editar</a>
				<button onclick={() => openDeleteDialog(id)}>🗑 Excluir</button>
			</li>
		{/each}
	</ul>
{/if}

<p><a href="/books/add">Adicionar livro</a></p>

{#if isModalOpen}
	<div class="modal">
		<div class="modal-content">
			<h2>Confirmar exclusão</h2>
			<p>Tem certeza de que deseja excluir este livro?</p>
			<button onclick={confirmDelete}>Confirmar</button>
			<button onclick={cancelDelete}>Cancelar</button>
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-content {
		background-color: white;
		padding: 20px;
		border-radius: 8px;
		text-align: center;
		width: 300px;
	}

	button {
		margin: 10px;
		padding: 10px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	input {
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
		width: 100%;
		margin-bottom: 20px;
	}
</style>
