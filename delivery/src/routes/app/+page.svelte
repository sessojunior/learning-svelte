<script lang="ts">
	// Dados da loja
	const shop = {
		id: 1,
		type: 'PIZZERIA',
		name: 'Pizzaria do João',
		address: 'Rua do João, 123',
		phone: '(11) 1234-5678',
		email: 'joao@examplo.com',
		website: 'https://pizzariajoao.com.br'
	}
	
	const productTypes = [
		{ id: 'FOOD', name: 'Comida', available: true },
		{ id: 'DRINK', name: 'Bebidas', available: true },
		{ id: 'OTHER', name: 'Outros', available: true }
	]

	const productCategories = [
		{ id: 'PIZZA', typeId: 'FOOD', name: 'Pizzas', available: true },
		{ id: 'SANDUICHE', typeId: 'FOOD', name: 'Sanduíches', available: true },
		{ id: 'MARMITEX', typeId: 'FOOD', name: 'Marmitex', available: true },
		{ id: 'ORIENTAL', typeId: 'FOOD', name: 'Comida japonesa', available: true },
		{ id: 'FITNESS', typeId: 'FOOD', name: 'Comida fitness', available: true },
		{ id: 'VEGANA', typeId: 'FOOD', name: 'Comida vegana', available: true },
		{ id: 'ESFIRRA', typeId: 'FOOD', name: 'Esfirras', available: true },
		{ id: 'ACAI', typeId: 'FOOD', name: 'Açaí', available: true },
		{ id: 'SALGADO', typeId: 'FOOD', name: 'Salgados', available: true },
		{ id: 'DOCE', typeId: 'FOOD', name: 'Doces', available: true },
		{ id: 'HORTIFRUTI', typeId: 'FOOD', name: 'Hortifruti', available: true }
	]

	const productSubcategories = [
		{ catogoryId: 'PIZZA', id: 'PIZZA_DOCE', name: 'Doces' },
		{ catogoryId: 'PIZZA', id: 'PIZZA_TRADICIONAL', name: 'Tradicionais' }
	]

	// Produtos
	const products = {
		idShop: 1,
		items: [],
		food: {

			// Tamanhos (id, nome, fatias, diametro, maximo de sabores, disponivel)
			sizes: [
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_P', name: 'Pequena', slices: 4, diameter: 35, maxQtyFlavors: 2, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_M', name: 'Média', slices: 4, diameter: 30, maxQtyFlavors: 2, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_G', name: 'Grande', slices: 8, diameter: 35, maxQtyFlavors: 3, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_GG', name: 'Gigante', slices: 8, diameter: 45, maxQtyFlavors: 4, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_XG', name: 'Maracanã', slices: 8, diameter: 55, maxQtyFlavors: 4, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_90G', name: '90 gramas', slices: null, diameter: null, maxQtyFlavors: null, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_120G', name: '120 gramas', slices: null, diameter: null, maxQtyFlavors: null, available: true }
			], 
			// Bordas
			crusts: [
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_TRADICIONAL', name: 'Tradicional', price: 0, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_CHEDDAR', name: 'Cheddar', price: 7, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_CATUPIRY', name: 'Catupiry', price: 5, available: true }
			], 
			// Massas
			doughs: [
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_TRADICIONAL', name: 'Tradicional', price: 0, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_SEM_LACTOSE', name: 'Sem lactose', price: 5, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_SEM_GLUTEN', name: 'Sem gluten', price: 5, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_SEM_LACTOSE_E_GLUTEN', name: 'Sem lactose e sem gluten', price: 10, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_INTEGRAL', name: 'Integral', price: 10, available: true }
			], 
			// Sabores
			flavors: [
				{ idFoodCategory: 'PIZZA', id: '', idFlavorCategory: '', name: 'Mista', description: '', ingredients: [], price: 0, available: true },
				{ idFoodCategory: 'PIZZA', id: '', idFlavorCategory: '', name: 'Mista', description: '', ingredients: [], price: 0, available: true }
			], 
			// Pães de sanduiche
			breads: [
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_TRADICIONAL', name: 'Tradicional', price: 0, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_GERGELIM', name: 'Gergelim', price: 5, available: true }
			], 
			// Ponto da carne
			meatPoints: [
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_BEM_PASSADO', name: 'Bem passado', price: 0, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_AO_PONTO', name: 'Ao ponto', price: 5, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_MAL_PASSADO', name: 'Mal passado', price: 5, available: true }
			], 
			// Molho
			sauces: [
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_BARBECUE', name: 'Barbecue', price: 0, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_MAIONESE_VERDE', name: 'Maionese verde', price: 5, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_MAIONESE_DEFUMADA_COM_BACON', name: 'Maionese defumada com bacon', price: 5, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_CHEDDAR', name: 'Cheddar', price: 5, available: true }
			], 
			// Sachês de condimentos
			sachets: [
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_MOSTARDA', name: 'Mostarda', price: 0, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_KETCHUP', name: 'Ketchup', price: 5, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_MAIONESE', name: 'Maionese', price: 5, available: true },
			], 
			// Proteínas
			proteins: [
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_CARNE_COZIDA', name: 'Carne cozida', price: 0, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_FILE_DE_FRANGO', name: 'Filé de frango', price: 5, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_FILE_DE_PEIXE', name: 'Filé de peixe', price: 5, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_CARNE_DE_PORCO', name: 'Carne de porco', price: 5, available: true },
			], 
			// Guarnições
			garnishes: [
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_ARROZ', name: 'Arroz', price: 0, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_BATATA_FRITA', name: 'Batata frita', price: 5, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_FEIJAO', name: 'Feijão', price: 5, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_MANDIOCA_FRITA', name: 'Mandioca frita', price: 5, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_PURE_DE_BATATA', name: 'Purê de batata', price: 5, available: true },
			], 
			// Saladas
			salad: [
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_COUVE_REFOGADA', name: 'Couve refogada', price: 0, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_MIX_DE_FOLHAS', name: 'Mix de folhas', price: 5, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_ALFACE', name: 'Alface', price: 5, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_REPOLHO', name: 'Repolho', price: 5, available: true },
			], 
			// Talheres
			cutlery: [
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_TALHERES', name: 'Enviar talheres de plástico', price: 0, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_PRATO', name: 'Enviar prato de plástico', price: 0, available: true },
				{ idFoodCategory: 'MARMITEX', id: 'MARMITEX_COPO', name: 'Enviar copo de plástico', price: 0, available: true },
			], 
			// Ingredientes extras
			extraIngredients: [
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_AZEITONA', idFlavorCategory: 'NORMAL', name: 'Azeitona', price: 0, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_CALABRESA', idFlavorCategory: 'NORMAL', name: 'Calabresa', price: 0, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_CHEDDAR', idFlavorCategory: 'NORMAL', name: 'Cheddar', price: 0, available: true },
				{ idFoodCategory: 'PIZZA', id: 'PIZZA_CHOCOLATE', idFlavorCategory: 'DOCE', name: 'Chocolate', price: 0, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_CHEDDAR', name: 'Cheddar', price: 0, available: true },
				{ idFoodCategory: 'SANDUICHE', id: 'SANDUICHE_CEBOLA', name: 'Cebola', price: 0, available: true }
			],
		}, // Comidas
		drinks: {}, // Bebidas
		others: {}, // Outros produtos (balas, picolés, produtos na vitrine, etc)
		kits: {}, // Kits de produtos
		menu: {} // Cardapio do dia
	} // Produtos

	// Formas de pagamento
	const paymentMethods = {
		idShop: 1,
		methods: [
			{ id: 'cash', name: 'Dinheiro', discount: 0 },
			{ id: 'card', name: 'Cartão', discount: 0 }
		]
	}

	// Dados do cliente
	let customer = $state({
		idShop: 1,
		id: 100,
		name: 'Fulano de tal',
		email: 'fulano@email.com.br',
		address: [
			{
				id: 1,
				name: 'Casa',
				street: '',
				number: '',
				complement: '',
				neighborhood: '',
				city: '',
				state: '',
				cep: ''
			}
		],
		default: {
			address: 1
		}
	})

	// Dados do pedido
	let order = $state({
		id: 1,
		idShop: shop.id,
		idCustomer: customer.id,
		products: [], // Produtos
		discount: 0, // Desconto
		total: 0, // Total
		paymentMethod: '', // Forma de pagamento
		customerId: '', // ID do cliente
		delivery: {
			address: {
				street: '',
				number: '',
				complement: '',
				neighborhood: '',
				city: '',
				state: '',
				cep: ''
			} // Endereço
		}, // Entrega
		observations: '' // Observações
	})
</script>

<div class="flex flex-col p-8">
	<h1 class="p-4 text-center text-4xl font-bold">Restaurante</h1>
	<h2 class="py-4 text-3xl font-bold">Escolha a categoria</h2>
	<div class="grid grid-cols-2 gap-4">
		<div>
			<h2 class="py-4 text-2xl font-bold">Monte sua pizza</h2>
			<h3 class="py-4 text-lg font-medium">Escolha o tamanho da pizza</h3>
			<h3 class="py-4 text-lg font-medium">Escolha a borda da pizza</h3>
			<h3 class="py-4 text-lg font-medium">Escolha a massa da pizza</h3>
			<h3 class="py-4 text-lg font-medium">Observações sobre a pizza</h3>
		</div>
		<div>
			<h2 class="py-4 text-2xl font-bold">Sabores</h2>
			<h3 class="py-4 text-lg font-medium">Escolha a quantidade de sabores</h3>
			<h3 class="py-4 text-lg font-medium">Escolha o 1º sabor</h3>
			<h3 class="py-4 text-lg font-medium">Escolha os ingredientes do 1º sabor</h3>
			<h3 class="py-4 text-lg font-medium">Escolha os ingredientes extras do 1º sabor</h3>
		</div>
		<div>
			<h2 class="py-4 text-2xl font-bold">Carrinho de compras</h2>
			<h3 class="py-4 text-lg font-medium">Pizzas</h3>
			<h3 class="py-4 text-lg font-medium">Demais produtos</h3>
		</div>
		<div>
			<h2 class="py-4 text-2xl font-bold">Informações do pedido</h2>
			<h3 class="py-4 text-lg font-medium">Dados do cliente</h3>
			<h3 class="py-4 text-lg font-medium">Dados de entrega</h3>
			<h3 class="py-4 text-lg font-medium">Forma de pagamento</h3>
		</div>
	</div>
	<div>
		<h3 class="py-4 text-2xl font-bold">Dados do restaurante</h3>
		<p>Tipo: {shop.type}</p>
		<p>Nome: {shop.name}</p>
		<p>Endereço: {shop.address}</p>
		<p>Telefone: {shop.phone}</p>
		<p>Email: {shop.email}</p>
		<p>Site: {shop.website}</p>
	</div>
</div>
