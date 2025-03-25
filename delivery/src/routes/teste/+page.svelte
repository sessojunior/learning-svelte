<script lang="ts">
	// JSON para simular a base de dados
	const pizzaSizes = [
		{
			id: 'P',
			name: 'Pequena',
			description: '4 fatias',
			size: '35 cm',
			maxQtyFlavors: 1,
			available: true
		},
		{
			id: 'M',
			name: 'Média',
			description: '4 fatias',
			size: '30 cm',
			maxQtyFlavors: 2,
			available: true
		},
		{
			id: 'G',
			name: 'Grande',
			description: '8 fatias',
			size: '35 cm',
			maxQtyFlavors: 3,
			available: true
		},
		{
			id: 'GG',
			name: 'Gigante',
			description: '8 fatias',
			size: '40 cm',
			maxQtyFlavors: 4,
			available: false
		}
	];

	const pizzaFlavors = [
		{
			id: 'MARGUERITA',
			name: 'Marguerita',
			ingredients: ['TOMATE', 'MUSSARELA', 'MANJERICAO'],
			prices: { P: 24, M: 31, G: 45, GG: 69 },
			available: true
		},
		{
			id: 'PEPERONI',
			name: 'Pepperoni',
			ingredients: ['PEPPERONI', 'MUSSARELA'],
			prices: { P: 25, M: 32, G: 46, GG: 70 },
			available: true
		},
		{
			id: 'FRANGO_CATUPIRY',
			name: 'Frango com Catupiry',
			ingredients: ['FRANGO', 'CATUPIRY', 'CEBOLA', 'TOMATE'],
			prices: { P: 26, M: 33, G: 47, GG: 71 },
			available: true
		}
	];

	const pizzaCrustTypes = [
		{ id: 'NORMAL', name: 'Normal', price: 0, available: true },
		{ id: 'CHEDDAR', name: 'Com Cheddar', price: 5, available: true },
		{ id: 'CATUPIRY', name: 'Com Catupiry', price: 5, available: true }
	];

	const pizzaDoughTypes = [
		{ id: 'TRADICIONAL', name: 'Tradicional', price: 0, available: true },
		{ id: 'SEM_LACTOSE', name: 'Sem lactose', price: 5, available: true }
	];

	const pizzaIngredients = [
		{ id: 'TOMATE', name: 'Tomate' },
		{ id: 'MUSSARELA', name: 'Mussarela' },
		{ id: 'CEBOLA', name: 'Cebola' },
		{ id: 'MANJERICAO', name: 'Manjericão' },
		{ id: 'PEPPERONI', name: 'Pepperoni' },
		{ id: 'CATUPIRY', name: 'Catupiry' },
		{ id: 'FRANGO', name: 'Frango' }
	];

	const pizzaExtraIngredients = [
		{ id: 'AZEITONA', name: 'Azeitona', price: 3, available: true },
		{ id: 'MILHO', name: 'Milho', price: 3, available: false },
		{ id: 'BACON', name: 'Bacon', price: 5, available: true }
	];

	const drinks = [
		{ id: 'SODA_LIMONADA', name: 'Soda Limonada', price: 6, stock: 5 },
		{ id: 'COCACOLA', name: 'Coca Cola', price: 7, stock: 4 },
		{ id: 'GUARANA', name: 'Guarana', price: 5, stock: 8 },
		{ id: 'AGUA', name: 'Agua', price: 2, stock: 9 }
	];

	// Definição dos tipos
	type PizzaSize = {
		id: string;
		name: string;
		description: string;
		size: string;
		maxQtyFlavors: number;
		available: boolean;
	};

	type PizzaFlavor = {
		id: string;
		name: string;
		ingredients: string[];
		prices: Record<string, number>;
		available: boolean;
	};

	type PizzaCrust = {
		id: string;
		name: string;
		price: number;
		available: boolean;
	};

	type PizzaDough = {
		id: string;
		name: string;
		price: number;
		available: boolean;
	};

	type ExtraIngredient = {
		id: string;
		price: number;
	} | null;

	type PizzaFlavorSelection = {
		id: string;
		name: string;
		price: number;
		ingredients: string[];
		extraIngredients: ExtraIngredient[];
	} | null;

	type Customer = {
		name: string;
		address: string;
		phone: string;
		email: string;
		paymentMethod: string;
	};

	type Order = Record<string, any>;

	// Variáveis reativas
	let selectedSize = $state<PizzaSize>(pizzaSizes[1]); // Tamanho da pizza
	let selectedCrust = $state<PizzaCrust>(pizzaCrustTypes[0]); // Borda da pizza
	let selectedDough = $state<PizzaDough>(pizzaDoughTypes[0]); // Massa da pizza
	let selectedFlavorQty = $state<number>(1); // Quantidade de sabores
	let selectedFlavors = $state<PizzaFlavorSelection[]>([]); // Sabores da pizza
	let observations = $state<string>(''); // Observações
	let cart = $state<any[]>([]); // Carrinho de compras
	let customer = $state<Customer>({
		name: '',
		address: '',
		phone: '',
		email: '',
		paymentMethod: ''
	}); // Dados do cliente
	let payment = $state<string>(''); // Forma de pagamento
	let order = $state<Order>({}); // Informações do pedido

	// Tamanho da pizza
	const handleSize = (size: PizzaSize) => {
		selectedSize = size;
		selectedFlavorQty = 1;
		selectedFlavors = [];
	};

	// Borda da pizza
	const handleCrust = (crust: PizzaCrust) => (selectedCrust = crust);

	// Massa da pizza
	const handleDough = (dough: PizzaDough) => (selectedDough = dough);

	// Quantidade de sabores
	const handleFlavorQty = (flavorQty: number) => (selectedFlavorQty = flavorQty);

	// Sabores da pizza
	const handleFlavor = (index: number, flavorId: string) => {
		const newFlavors = [...selectedFlavors]; // Cria um novo array para modificar o estado
		if (flavorId === '') {
			newFlavors[index] = null; // Remove a seleção do sabor
		} else {
			const flavor = pizzaFlavors.find((f) => f.id === flavorId);
			if (flavor) {
				newFlavors[index] = {
					id: flavor.id,
					name: flavor.name,
					price: flavor.prices[selectedSize.id as keyof typeof flavor.prices],
					ingredients: flavor.ingredients,
					extraIngredients: []
				};
			}
		}
		selectedFlavors = newFlavors;
	};

	// Ingredientes do sabor da pizza
	const handleFlavorIngredients = (index: number, ingredient: string) => {
		// Encontra o ID do ingrediente selecionado
		const foundIngredient = pizzaIngredients.find((i) => i.id === ingredient);
		if (!foundIngredient) {
			console.error(`Ingrediente "${ingredient}" não encontrado.`);
			return;
		}
		const pizzaIngredient = foundIngredient.id;
		// Copia o array de sabores
		const newFlavors = [...selectedFlavors];
		// Garante que o sabor selecionado existe antes de manipular os ingredientes
		if (!newFlavors[index]) return;
		// Verifica se o ingrediente já está na lista
		const existsIngredientSelectedFlavor = newFlavors[index]?.ingredients.includes(pizzaIngredient);
		let ingredientsSelectedFlavor: string[] = [];
		if (existsIngredientSelectedFlavor) {
			// Filtra os ingredientes, removendo o selecionado
			ingredientsSelectedFlavor = newFlavors[index].ingredients.filter(
				(i) => i !== pizzaIngredient
			);
			// Verifica se está tentando remover todos os ingredientes
			if (ingredientsSelectedFlavor.length === 0) {
				alert('A pizza deve ter pelo menos um ingrediente.');
				return;
			}
		} else {
			// Adiciona o ingrediente se ele ainda não estiver na lista
			ingredientsSelectedFlavor = [...newFlavors[index].ingredients, pizzaIngredient];
		}
		// Atualiza o sabor com a nova lista de ingredientes
		newFlavors[index] = {
			...newFlavors[index],
			ingredients: ingredientsSelectedFlavor
		};
		console.log('newFlavors', newFlavors);
		selectedFlavors = newFlavors; // Atualiza o estado corretamente
	};

	// Ingredientes extras do sabor da pizza
	const handleFlavorExtraIngredients = (
		index: number,
		extraIngredient: string,
		qtyFlavors: number
	) => {
		// Clona o array de sabores para evitar mutação direta
		const newFlavors = [...selectedFlavors];
		// Verifica se o sabor selecionado existe
		if (!newFlavors[index]) return;
		// Garante que `extraIngredients` é um array antes de manipulá-lo
		if (!newFlavors[index].extraIngredients) {
			newFlavors[index].extraIngredients = [];
		}
		// Encontra o ingrediente extra com base no ID
		const ingredient = pizzaExtraIngredients.find((i) => i.id === extraIngredient);
		if (!ingredient) {
			console.error(`Ingrediente extra "${extraIngredient}" não encontrado.`);
			return;
		}
		// Verifica se o ingrediente já existe nos ingredientes extras do sabor
		const existsIngredientSelectedFlavor = newFlavors[index]?.extraIngredients?.some(
			(i) => typeof i === 'object' && i?.id === ingredient.id
		);
		if (existsIngredientSelectedFlavor) {
			// Remove o ingrediente se já estiver selecionado
			newFlavors[index].extraIngredients = newFlavors[index].extraIngredients.filter(
				(i) => i?.id !== ingredient.id
			);
		} else {
			// Preço do ingrediente extra deve ser dividido pelo número de sabores
			const price = ingredient.price > 0 ? ingredient.price / qtyFlavors : 0;
			// Adiciona o ingrediente com id e price se não estiver presente
			newFlavors[index].extraIngredients.push({ id: ingredient.id, price: price });
		}
		console.log('newFlavors', newFlavors);
		selectedFlavors = newFlavors; // Atualiza o estado corretamente
	};

	// Observações
	const handleObservations = (observations: string) => {
		observations = observations;
	};

	// Calcular o preço da pizza
	const calculatePizzaPrice = (
		flavors: (PizzaFlavorSelection | null)[], // Aceita `null` explicitamente
		crust: PizzaCrust,
		dough: PizzaDough,
		size: PizzaSize // Adicionado para acessar os preços corretamente
	): number => {
		// Inicializa o preço com o preço da massa e da borda
		let price = crust.price + dough.price;

		// Filtra sabores válidos (ignora os que são null)
		const validFlavors = flavors.filter(
			(flavor): flavor is PizzaFlavorSelection => flavor !== null
		);

		// Se não houver sabores válidos, retorna apenas o preço da borda e da massa
		if (validFlavors.length === 0) return price;

		// Verifica o preço do sabor mais caro com base no tamanho da pizza
		const maxFlavorPrice = Math.max(
			...validFlavors.map((flavor) => flavor?.price ?? 0) // Garante que flavor.price sempre existe
		);

		// Adiciona o preço do sabor mais caro
		price += maxFlavorPrice;

		// Adiciona o total dos ingredientes extras de todos os sabores
		validFlavors.forEach((flavor) => {
			if (flavor?.extraIngredients) {
				flavor.extraIngredients.forEach((extra) => {
					price += extra?.price ?? 0;
				});
			}
		});

		return price;
	};

	// Adicionar ao carrinho de compras
	const handleAddCart = ({
		product,
		type
	}: {
		product?: { id: string; price: number; name: string };
		type: 'pizza' | 'other';
	}) => {
		if (type === 'pizza') {
			if (selectedFlavors.length < selectedFlavorQty) {
				alert('You must select all flavors.');
				return;
			}

			const pizzaPrice = calculatePizzaPrice(
				selectedFlavors,
				selectedCrust,
				selectedDough,
				selectedSize
			);

			const pizza = {
				size: selectedSize,
				qtyFlavors: selectedFlavorQty,
				flavors: selectedFlavors,
				crust: selectedCrust,
				dough: selectedDough,
				observations: observations,
				price: pizzaPrice
			};

			cart = [
				...cart,
				{
					id: Math.floor(Math.random() * 10 ** 8).toString(),
					qty: 1,
					type: type,
					data: pizza
				}
			];

			resetSelections();
			console.log('pizza', pizza);
		} else if (product) {
			// Outros produtos
			const item = {
				id: product.id,
				price: product.price,
				name: product.name
			};

			const existingItem = cart.find(
				(cartItem) => cartItem.data.id === product.id && cartItem.type === type
			);

			if (existingItem) {
				cart = cart.map((cartItem) =>
					cartItem.data.id === product.id && cartItem.type === type
						? { ...cartItem, qty: cartItem.qty + 1 }
						: cartItem
				);
			} else {
				cart = [
					...cart,
					{
						id: Math.floor(Math.random() * 10 ** 8).toString(),
						qty: 1,
						price: product.price,
						type: type,
						data: item
					}
				];
			}
		}

		console.log('cart', cart);
	};

	// Limpa as informações da pizza
	const resetSelections = () => {
		selectedSize = pizzaSizes[1]; // Tamanho da pizza
		selectedCrust = pizzaCrustTypes[0]; // Borda da pizza
		selectedDough = pizzaDoughTypes[0]; // Massa da pizza
		selectedFlavorQty = 1; // Quantidade de sabores
		selectedFlavors = []; // Sabores da pizza
		observations = ''; // Observações
	};

	// Remover item do carrinho
	const handleRemoveCart = (productId: string) => {
		cart = cart.filter((item) => item.id !== productId);
		console.log('Item removido, novo carrinho:', cart);
	};

	// Aumentar a quantidade de um item no carrinho
	const handleIncreaseItemCart = (productId: string) => {
		cart = cart.map((cartItem) =>
			cartItem.id === productId ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
		);
		console.log('Item aumentado, novo carrinho:', cart);
	};

	// Diminuir a quantidade de um item no carrinho
	const handleDecreaseItemCart = (productId: string) => {
		cart = cart.map((cartItem) =>
			cartItem.id === productId && cartItem.qty > 1
				? { ...cartItem, qty: cartItem.qty - 1 }
				: cartItem
		);
		console.log('Item diminuido, novo carrinho:', cart);
	};

	// Calcular o total a pagar
	const calculateTotalPrice = () => {
		return cart.reduce((total, item) => total + item.price * item.qty, 0);
	};

	// Informações do cliente
	const handleCustomer = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target?.name) customer = { ...customer, [target.name]: target.value };
	};

	// Forma de pagamento
	const handlePayment = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target) payment = target.value;
	};

	// Finalizar pedido
	const handleCheckout = () => {
		if (cart.length === 0) {
			alert('Adicione itens ao carrinho antes de finalizar o pedido.');
			return;
		}
		if (!customer.name || !customer.address || !customer.phone || !customer.email) {
			alert('Preencha todos os dados do cliente antes de finalizar o pedido.');
			return;
		}

		const orderDetails = {
			customer,
			cart,
			total: calculateTotalPrice()
		};
		order = orderDetails;

		console.log('order', orderDetails);

		alert('Pedido realizado com sucesso!');
		resetSelections();
		cart = [];
	};

	// Demais funções
</script>

<h1 class="mt-8 mb-4 text-center text-4xl font-bold">Pizzaria delivery</h1>
<div class="flex justify-between gap-8 p-8">
	<div class="flex w-1/3 flex-col">
		<div>
			<h2 class="mb-4 text-2xl font-bold">Monte sua pizza</h2>

			<!-- Tamanho da pizza-->
			<h3 class="mb-4 text-xl font-semibold">Escolha o tamanho da pizza</h3>
			{#each pizzaSizes.filter((size) => size.available) as size}
				<div class="mb-2">
					<input
						type="radio"
						id={size.id}
						name="pizza-size"
						checked={selectedSize.id === size.id}
						onchange={() => handleSize(size)}
						class="mr-2"
					/>
					<label for={size.id} class="text-md">
						{size.name} - {size.description} - {size.size}
					</label>
				</div>
			{/each}

			<!-- Se selecionou o tamanho da pizza -->
			{#if selectedSize}
				<!-- Borda da pizza-->
				<h3 class="mt-6 mb-4 text-xl font-semibold">Escolha a borda da pizza</h3>
				{#each pizzaCrustTypes.filter((crust) => crust.available) as crust}
					<div class="mb-2">
						<input
							type="radio"
							id={crust.id}
							name="pizza-crust"
							checked={selectedCrust.id === crust.id}
							onchange={() => handleCrust(crust)}
							class="mr-2"
						/>
						<label for={crust.id} class="text-md">
							{crust.name}
							{crust.price > 0 ? `(+R$ ${crust.price})` : ''}
						</label>
					</div>
				{/each}

				<!-- Massa da pizza -->
				<h3 class="mt-6 mb-4 text-xl font-semibold">Escolha a massa da pizza</h3>
				{#each pizzaDoughTypes.filter((dough) => dough.available) as dough}
					<div class="mb-2">
						<input
							type="radio"
							id={dough.id}
							name="pizza-dough"
							checked={selectedDough.id === dough.id}
							onchange={() => handleDough(dough)}
							class="mr-2"
						/>
						<label for={dough.id} class="text-md">
							{dough.name}
							{dough.price > 0 ? `(+R$ ${dough.price})` : ''}
						</label>
					</div>
				{/each}

				<!-- Quantidade de sabores -->
				<h3 class="mt-6 mb-4 text-xl font-semibold">Escolha a quantidade de sabores</h3>
				<select
					bind:value={selectedFlavorQty}
					onchange={(e) => handleFlavorQty(+(e.target as HTMLSelectElement).value)}
					class="w-full rounded border border-gray-300 p-2"
				>
					{#each [...Array(selectedSize.maxQtyFlavors).keys()].map((i) => i + 1) as qty}
						<option value={qty}>
							{qty}
							{qty > 1 ? 'sabores' : 'sabor'}
						</option>
					{/each}
				</select>

				<!-- Sabores da pizza -->
				{#each selectedFlavors as flavor, index}
					<div>
						<h3 class="mt-6 mb-4 text-xl font-semibold">Escolha o {index + 1}º sabor</h3>

						{#if flavor}
							<!-- Select para escolher sabor -->
							<select
								bind:value={flavor.id}
								onchange={(e) => {
									const target = e.target as HTMLSelectElement;
									if (target?.value) {
										const selectedFlavor = pizzaFlavors.find(({ id }) => id === target.value);
										if (selectedFlavor) {
											selectedFlavors[index] = {
												...selectedFlavor,
												price:
													selectedFlavor.prices[
														selectedSize?.id as keyof typeof selectedFlavor.prices
													] ?? 0,
												extraIngredients: []
											};
										}
									}
								}}
								class="w-full rounded border border-gray-300 p-2"
							>
								<option value="">Selecione um sabor</option>
								{#each pizzaFlavors.filter(({ available }) => available) as { id, name, prices }}
									<option value={id}>
										{name} - R$ {prices[selectedSize?.id as keyof typeof prices] ?? 'N/A'}
									</option>
								{/each}
							</select>

							<!-- Ingredientes do sabor -->
							<h4 class="text-md mt-6 mb-4 font-semibold">
								Ingredientes do {index + 1}º sabor:
								<span class="font-normal">{flavor.name}</span>
							</h4>
							<ul>
								{#if flavor.ingredients?.length}
									{#each flavor.ingredients as ingredientId}
										<div class="mb-2">
											<!-- <input
												type="checkbox"
												bind:checked={flavor.ingredients.includes(ingredientId) ? true : false}
												onchange={() => handleFlavorIngredients(index, ingredientId)}
												class="mr-1"
											/> -->
											[==> {flavor.ingredients.includes(ingredientId) ? 'true' : 'false'}]
											<label for={ingredientId} class="text-md">
												{pizzaIngredients.find((item) => item.id === ingredientId)?.name ??
													'Desconhecido'}
											</label>
										</div>
									{/each}
								{/if}
							</ul>

							<!-- Ingredientes extras do sabor -->
							<h4 class="text-md mt-6 mb-4 font-semibold">Ingredientes extras:</h4>
							<ul>
								{#each pizzaExtraIngredients as { id, name, price }}
									<div class="mb-2 flex items-center gap-2">
										<!-- <input
											type="checkbox"
											bind:checked={$checkedMap.get(`${flavorIndex}-${id}`}
											on:changed={() => handleFlavorExtraIngredients(index, id, selectedFlavorQty)}
											class="mr-1"
										/> -->
										<label for={id} class="text-md">
											{name}
											{#if price > 0}
												(+R$ {(price / selectedFlavorQty).toFixed(2)})
											{/if}
										</label>
									</div>
								{/each}
							</ul>
						{/if}
					</div>
				{/each}

				<!-- Observações -->
				<h3 class="mt-6 mb-4 text-xl font-semibold">Observações sobre a pizza:</h3>
				<textarea
					bind:value={observations}
					placeholder="Observações adicionais"
					class="w-full rounded-md border p-2"
				></textarea>

				<!-- Adicionar pizza ao carrinho -->
				<button
					onclick={() => handleAddCart({ type: 'pizza' })}
					class="mt-6 rounded bg-blue-500 p-2 text-white"
				>
					Adicionar pizza ao carrinho
				</button>
			{/if}
		</div>
		<div class="pt-8">
			<h2 class="mb-4 text-2xl font-bold">Bebidas</h2>

			<!-- Bebidas -->
			<h3 class="mt-6 mb-4 text-xl font-semibold">Escolha uma bebida</h3>
			{#each drinks as drink}
				<div class="mb-2">
					<div class="flex items-center justify-between">
						<div>{drink.name} - R$ {drink.price}</div>

						<!-- Adicionar ao carrinho-->
						<button
							onclick={() => handleAddCart({ product: drink, type: 'other' })}
							class="rounded bg-blue-500 p-2 text-white"
						>
							Adicionar ao carrinho
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="w-1/3">
		<h2 class="mb-4 text-2xl font-bold">Carrinho de compras</h2>
		{#if cart.length === 0}
			<div>
				{console.log(cart)}
				<h3 class="mt-6 mb-4 text-xl font-semibold">Pizzas:</h3>
				{#if cart.filter((product) => product.type === 'pizza').length === 0}
					<p>Nenhuma pizza no carrinho</p>
				{:else}
					{#each cart.filter((product) => product.type === 'pizza') as product}
						<div class="mb-4">
							<h4 class="text-md font-medium">
								Pizza {product.data.size.name} - {product.data.size.description}
							</h4>
							<button
								onclick={() => handleRemoveCart(product.id)}
								class="mx-1 rounded bg-red-500 px-2 text-white"
							>
								Remover
							</button>
							<p>
								Massa: {product.data.dought.name}{' '}
								{#if product.data.dought.price > 0}
									<span class="text-red-500">(+R$ {product.data.dought.price})</span>
								{/if}
							</p>
							<p>
								Borda: {product.data.crust.name}{' '}
								{#if product.data.crust.price > 0}
									<span class="text-red-500">(+R$ {product.data.crust.price})</span>
								{/if}
							</p>
							<p>Sabores: ({product.data.qtyFlavors})</p>
							<ul>
								{#each product.data.flavors as flavor}
									{@const pizzaBase = pizzaFlavors.find((pizza) => pizza.name === flavor.name)}

									{#if pizzaBase}
										{@const removedIngredients = pizzaBase.ingredients
											.filter((ing) => !flavor.ingredients.includes(ing))
											.map((ing) => pizzaIngredients.find((i) => i.id === ing)?.name)
											.filter(Boolean)
											.join(', ')}
										<li class="ml-4">
											<p class="font-medium">{flavor.name} (R$ {flavor.price})</p>
											<p class="text-xs">
												Ingredientes da receita original:
												{flavor.ingredients
													.map((ing: string) => pizzaIngredients.find((i) => i.id === ing)?.name)
													.filter(Boolean)
													.join(', ')}
											</p>

											{#if removedIngredients}
												<p class="text-xs">Retirar da receita original: {removedIngredients}</p>
											{/if}

											{#if flavor.extraIngredients.length > 0}
												<p class="text-xs">
													Ingredientes extras:
													{#each flavor.extraIngredients as extraIng, idx}
														{@const foundIngredient = pizzaExtraIngredients.find(
															(i) => i.id === extraIng.id
														)}

														{#if foundIngredient}
															<span>
																{foundIngredient.name}
																<span class="text-red-500">(R$ {extraIng.price})</span>
																{#if idx < flavor.extraIngredients.length - 1},
																{/if}
															</span>
														{/if}
													{/each}
												</p>
											{/if}
										</li>
									{/if}
								{/each}
							</ul>
							<p>
								Preço da pizza:
								<span class="font-medium text-red-500">
									R$ {product.price}{product.data.qtyFlavors > 1 ? '*' : ''}
								</span>
							</p>

							{#if product.data.observations}
								<p>Observação: {product.data.observations}</p>
							{/if}

							{#if product.data.qtyFlavors > 1}
								<p class="text-xs text-red-500">
									* Quando a pizza tem mais de um sabor, o valor é calculado pelo sabor com o maior
									preço. Entretanto, o valor dos ingredientes extras é dividido pela quantidade
									total de sabores, e é também somado no cálculo do preço da pizza.
								</p>
							{/if}
						</div>
					{/each}
				{/if}

				<h3 class="mt-6 mb-4 text-xl font-semibold">Demais produtos:</h3>
				{#each cart.filter((product) => product.type !== 'pizza') as product (product.id)}
					<div class="mb-4">
						<h4 class="text-md font-medium">{product.data.name}</h4>
						<p>
							Quantidade:
							<button
								onclick={() => handleDecreaseItemCart(product.id)}
								class="mx-1 rounded bg-blue-500 px-2 text-white"
							>
								-
							</button>
							<span>{product.qty}</span>
							<button
								onclick={() => handleIncreaseItemCart(product.id)}
								class="mx-1 rounded bg-blue-500 px-2 text-white"
							>
								+
							</button>
							<button
								onclick={() => handleRemoveCart(product.id)}
								class="mx-1 rounded bg-red-500 px-2 text-white"
							>
								Remover
							</button>
						</p>
						<p>Preço: R$ {product.data.price}</p>
					</div>
				{/each}
				<h3 class="mt-6 mb-4 text-xl font-semibold">
					Total a pagar: R$ {calculateTotalPrice()}
				</h3>
			</div>
		{:else}
			<p>O carrinho de compras está vazio.</p>
		{/if}
	</div>
	<div class="w-1/3">
		<h2 class="mb-4 text-2xl font-bold">Informações do pedido</h2>
		<label class="mb-2 block">
			Nome:
			<input
				type="text"
				name="name"
				value={customer.name}
				onchange={handleCustomer}
				class="w-full rounded border border-gray-300 p-2"
			/>
		</label>
		<label class="mb-2 block">
			Endereço:
			<input
				type="text"
				name="address"
				value={customer.address}
				onchange={handleCustomer}
				class="w-full rounded border border-gray-300 p-2"
			/>
		</label>
		<label class="mb-2 block">
			Telefone:
			<input
				type="text"
				name="phone"
				value={customer.phone}
				onchange={handleCustomer}
				class="w-full rounded border border-gray-300 p-2"
			/>
		</label>
		<label class="mb-2 block">
			E-mail:
			<input
				type="email"
				name="email"
				value={customer.email}
				onchange={handleCustomer}
				class="w-full rounded border border-gray-300 p-2"
			/>
		</label>
		<label class="mb-2 block">
			Forma de Pagamento:
			<select
				name="paymentMethod"
				value={customer.paymentMethod}
				onchange={handlePayment}
				class="w-full rounded border border-gray-300 p-2"
			>
				<option value="cartao">Cartão</option>
				<option value="dinheiro">Dinheiro</option>
			</select>
		</label>
		<!-- Finalizar pedido -->
		<button onclick={() => handleCheckout()} class="rounded bg-blue-500 p-2 text-white">
			Finalizar pedido
		</button>
	</div>
</div>
