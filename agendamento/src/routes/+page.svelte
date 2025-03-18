<script lang="ts">
	type Service = {
		serviceId: number
		professionalId: number
		date: string
		time: string
		duration: number
		price: number
	}

	type Time = {
		date: string
		time: string | null
		professionalId: number | null
		serviceId: number | null
	}

	// Dados dos usuário
	const user = [
		{
			id: 1,
			salonId: 1,
			name: 'John Doe',
			email: 'nV3d8@email.com'
		}
	]

	// Salão
	const salon = {
		id: 1,
		name: 'Barbearia',
		address: 'Av. Paulista, 1234',
		phone: '(11) 99999-9999'
	}

	// Agendamentos
	const appointments = [
		{
			id: 1,
			salonId: 1,
			professionalId: 1,
			default: {
				sunday: null,
				monday: {
					start: '08:00',
					end: '18:00',
					intervals: [
						{ start: '12:00', end: '13:00', description: 'Almoço' },
						{ start: '16:00', end: '16:30', description: 'Lanche' }
					]
				},
				tuesday: {
					start: '08:00',
					end: '18:00',
					intervals: [
						{ start: '12:00', end: '13:00', description: 'Almoço' },
						{ start: '16:00', end: '16:30', description: 'Lanche' }
					]
				},
				wednesday: {
					start: '08:00',
					end: '18:00',
					intervals: [
						{ start: '12:00', end: '13:00', description: 'Almoço' },
						{ start: '16:00', end: '16:30', description: 'Lanche' }
					]
				},
				thursday: {
					start: '08:00',
					end: '18:00',
					intervals: [
						{ start: '12:00', end: '13:00', description: 'Almoço' },
						{ start: '16:00', end: '16:30', description: 'Lanche' }
					]
				},
				friday: {
					start: '08:00',
					end: '18:00',
					intervals: [
						{ start: '12:00', end: '13:00', description: 'Almoço' },
						{ start: '16:00', end: '16:30', description: 'Lanche' }
					]
				},
				saturday: { start: '09:00', end: '14:00', duration: 30, intervals: [] },
				holidays: null
			},
			extraFreeTimeAppointments: [
				{
					id: 1,
					date: '2025-03-21',
					appointments: [
						{
							start: '07:00',
							end: '07:30'
						},
						{
							start: '18:00',
							end: '18:30'
						}
					]
				},
				{
					id: 1,
					date: '2025-03-22',
					appointments: [
						{
							start: '07:30',
							end: '08:00'
						},
						{
							start: '18:00',
							end: '18:30'
						}
					]
				}
			], // Tempos extras livres para agendamentos (por data)
			appointments: [
				{ id: 1, userId: 1, serviceId: 1, date: '2025-03-20', time: '08:00', duration: 30 },
				{ id: 1, userId: 1, serviceId: 1, date: '2025-03-20', time: '08:30', duration: 30 },
				{ id: 1, userId: 2, serviceId: 1, date: '2025-03-20', time: '09:00', duration: 30 },
				{ id: 1, userId: 2, serviceId: 1, date: '2025-03-20', time: '09:30', duration: 30 },
				{ id: 1, userId: 3, serviceId: 1, date: '2025-03-20', time: '10:00', duration: 30 },
				{ id: 1, userId: 3, serviceId: 1, date: '2025-03-20', time: '10:30', duration: 30 },
				{ id: 1, userId: 4, serviceId: 1, date: '2025-03-20', time: '11:00', duration: 30 },
				{ id: 1, userId: 4, serviceId: 1, date: '2025-03-20', time: '11:30', duration: 30 },
				{ id: 1, userId: 5, serviceId: 1, date: '2025-03-20', time: '12:00', duration: 30 },
				{ id: 1, userId: 5, serviceId: 1, date: '2025-03-20', time: '13:00', duration: 30 },
				{ id: 1, userId: 5, serviceId: 1, date: '2025-03-20', time: '13:30', duration: 30 },
				{ id: 1, userId: 5, serviceId: 1, date: '2025-03-20', time: '14:00', duration: 30 },
				{ id: 1, userId: 6, serviceId: 1, date: '2025-03-20', time: '14:30', duration: 30 },
				{ id: 1, userId: 6, serviceId: 1, date: '2025-03-20', time: '15:00', duration: 30 },
				{ id: 1, userId: 6, serviceId: 1, date: '2025-03-20', time: '15:30', duration: 30 },
				{ id: 1, userId: 7, serviceId: 1, date: '2025-03-20', time: '16:30', duration: 30 },
				{ id: 1, userId: 7, serviceId: 1, date: '2025-03-20', time: '17:00', duration: 30 },
				{ id: 1, userId: 7, serviceId: 1, date: '2025-03-20', time: '17:00', duration: 30 },
				{ id: 1, userId: 7, serviceId: 2, date: '2025-03-21', time: '09:00', duration: 30 },
				{ id: 1, userId: 7, serviceId: 2, date: '2025-03-21', time: '10:00', duration: 30 },
				{ id: 2, userId: 8, serviceId: 2, date: '2025-03-21', time: '07:30', duration: 30 }
			] // Agendamentos realizados
		},
		{
			id: 1,
			salonId: 1,
			professionalId: 2,
			default: {
				sunday: null,
				monday: {
					start: '08:00',
					end: '18:00',
					intervals: [
						{ start: '12:00', end: '13:00', description: 'Almoço' },
						{ start: '15:00', end: '16:15', description: 'Lanche' }
					]
				},
				tuesday: {
					start: '08:00',
					end: '18:00',
					intervals: [
						{ start: '12:00', end: '13:00', description: 'Almoço' },
						{ start: '15:00', end: '16:15', description: 'Lanche' }
					]
				},
				wednesday: null,
				thursday: {
					start: '08:00',
					end: '18:00',
					intervals: [
						{ start: '12:00', end: '13:00', description: 'Almoço' },
						{ start: '15:00', end: '16:15', description: 'Lanche' }
					]
				},
				friday: {
					start: '08:00',
					end: '18:00',
					intervals: [
						{ start: '12:00', end: '13:00', description: 'Almoço' },
						{ start: '15:00', end: '16:15', description: 'Lanche' }
					]
				},
				saturday: { start: '09:00', end: '14:00', duration: 30, intervals: [] },
				holidays: null
			},
			extraFreeTimeAppointments: [], // Tempos extras livres para agendamentos (por data)
			appointments: [] // Agendamentos realizados
		}
	]

	// Serviços cadastrados
	const services = [
		{ id: 1, salonId: 1, name: 'Corte masculino', description: 'Corte de cabelo masculino', available: true },
		{ id: 2, salonId: 1, name: 'Corte feminino', description: 'Corte de cabelo feminino', available: true },
		{ id: 3, salonId: 1, name: 'Corte infantil', description: 'Corte de cabelo infantil', available: true },
		{ id: 4, salonId: 1, name: 'Barba', description: 'Corte de cabelo masculino', available: true }
	]

	// Serviços disponíveis
	const availableServices = () => {
		const availableProfessionalsServices = professionalServices.filter((service) => service.available)
		const availableServices = services.filter((service) => availableProfessionalsServices.some((serviceProfessional) => serviceProfessional.serviceId === service.id))
		return availableServices
	}

	// Profissionais cadastrados
	const professionals = [
		{ id: 1, salonId: 1, name: 'João da Silva', description: 'Profissional 1', genre: 'MALE', available: true },
		{ id: 2, salonId: 1, name: 'Maria da Silva', description: 'Profissional 2', genre: 'FEMALE', available: true },
		{ id: 3, salonId: 1, name: 'Pedro Nelson', description: 'Profissional 3', genre: 'MALE', available: false },
		{ id: 3, salonId: 1, name: 'Gustavo Gomes', description: 'Profissional 4', genre: 'MALE', available: false }
	]

	// Serviços oferecidos pelos profissionais
	const professionalServices = [
		{ id: 1, salonId: 1, professionalId: 1, serviceId: 1, duration: 30, price: 25, available: true },
		{ id: 2, salonId: 1, professionalId: 1, serviceId: 2, duration: 45, price: 40, available: false },
		{ id: 3, salonId: 1, professionalId: 1, serviceId: 3, duration: 25, price: 20, available: true },
		{ id: 4, salonId: 1, professionalId: 2, serviceId: 1, duration: 15, price: 25, available: true },
		{ id: 5, salonId: 1, professionalId: 2, serviceId: 2, duration: 30, price: 25, available: true },
		{ id: 6, salonId: 1, professionalId: 2, serviceId: 3, duration: 20, price: 15, available: true },
		{ id: 7, salonId: 1, professionalId: 3, serviceId: 1, duration: 15, price: 25, available: true },
		{ id: 8, salonId: 1, professionalId: 3, serviceId: 2, duration: 30, price: 25, available: false }
	]

	// Dados do agendamento
	let currentStep = $state(1)
	let currentService = $state({ id: 0, name: '', duration: 0, price: 0 })
	let currentProfessional = $state({ id: 0, name: '' })
	let currentTime = $state<Time>({
		date: '',
		time: null,
		professionalId: null,
		serviceId: null
	})
	let currentOrder = $state({
		salonId: 1,
		userId: 1,
		services: [] as Service[]
	})
	let currentUser = user[0]

	// Verifica se o profissional está disponível
	function isProfessionalAvailable(date: string) {
		const professional = appointments.find((p) => p.professionalId === currentProfessional.id)
		if (!professional) return false

		// Garante que a data é tratada corretamente no fuso horário UTC
		const dayOfWeek = new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase()

		// Verifica se o profissional tem um horário padrão disponível para esse dia
		const hasDefaultSchedule = professional.default[dayOfWeek as keyof typeof professional.default] !== null

		// Verifica se há horários extras para esse dia
		const hasExtraFreeTime = professional.extraFreeTimeAppointments.some((extra) => extra.date === date)

		// Verifica se já há agendamentos no dia
		const hasAppointments = professional.appointments.some((appt) => appt.date === date)

		// Retorna verdadeiro apenas se houver um horário padrão, extra ou agendamentos
		return hasDefaultSchedule || hasExtraFreeTime || hasAppointments
	}

	// Profissionais disponíveis por serviço
	const availableProfessionalsByService = (serviceId: number) => {
		const availableProfessionalsServices = professionalServices.filter((serviceProfessional) => serviceProfessional.serviceId === serviceId && serviceProfessional.available)
		const availableProfessionals = availableProfessionalsServices
			.map((serviceProfessional) => {
				const professional = professionals.find((p) => p.id === serviceProfessional.professionalId)
				if (professional) {
					return {
						...professional, // Mantém os dados do profissional
						serviceId: serviceProfessional.serviceId, // Adiciona serviceId
						duration: serviceProfessional.duration, // Adiciona duração do serviço
						price: serviceProfessional.price, // Adiciona preço do serviço
						available: serviceProfessional.available // Adiciona disponibilidade
					}
				}
				return null
			})
			.filter(Boolean) // Remove possíveis valores nulos
		return availableProfessionals
	}

	// Atualiza o serviço selecionado
	function updateSelectedService(serviceId: Service['serviceId']) {
		const selectedService = services.find((service) => service.id === serviceId)
		currentService = { id: serviceId, name: selectedService?.name ?? '', duration: 0, price: 0 }
		currentProfessional = { id: 0, name: '' }
		currentTime = { date: '', time: null, professionalId: null, serviceId: null }
	}

	// Atualiza o profissional selecionado
	function updateSelectedProfessional(professionalId: Service['professionalId']) {
		const selectedProfessional = professionals.find((professional) => professional.id === professionalId)
		const selectedService = professionalServices.find((professionalService) => professionalService.professionalId === professionalId)
		currentProfessional = { id: professionalId, name: selectedProfessional?.name ?? '' }
		currentService = { ...currentService, duration: selectedService?.duration ?? 0, price: selectedService?.price ?? 0 }
		currentTime = { date: '', time: null, professionalId: null, serviceId: null }
		console.log('currentProfessional', $state.snapshot(currentProfessional))
		console.log('currentService', $state.snapshot(currentService))
	}

	// Retorna as datas dos próximos dias
	function days(qtyDays: number) {
		const today = new Date()
		const days = []

		const formatter = new Intl.DateTimeFormat('pt-BR', {
			weekday: 'short',
			day: '2-digit',
			month: 'short',
			year: '2-digit',
			timeZone: 'America/Sao_Paulo'
		})

		for (let i = 0; i < qtyDays; i++) {
			const dateToday = new Date(today)
			dateToday.setDate(dateToday.getDate() + i)

			// Obtém os componentes formatados corretamente
			const formattedParts = formatter.formatToParts(dateToday)
			let date = dateToday.toISOString().split('T')[0] // YYYY-MM-DD
			let weekday = formattedParts.find((part) => part.type === 'weekday')?.value.replace('.', '') || ''
			let day = formattedParts.find((part) => part.type === 'day')?.value || ''
			let month = formattedParts.find((part) => part.type === 'month')?.value.replace('.', '') || ''
			let year = formattedParts.find((part) => part.type === 'year')?.value || ''

			// Capitaliza a primeira letra do dia da semana e do mês
			weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
			month = month.charAt(0).toUpperCase() + month.slice(1)

			// Adiciona ao array como um objeto
			days.push({
				date,
				weekday,
				day,
				month,
				year
			})
		}

		return days
	}

	// Atualiza a data ou horário selecionado
	function updateCurrentTime(date: string, time: string | null) {
		currentTime.date = date
		currentTime.time = time
		currentTime.professionalId = currentProfessional.id
		currentTime.serviceId = currentService.id
		console.log('currentTime', $state.snapshot(currentTime))
	}

	// Gera horários disponíveis, bloqueando os horários agendados
	function generateTimes(date: string, professionalId: number, serviceId: number) {
		const selectedService = professionalServices.find((ps) => ps.professionalId === professionalId && ps.serviceId === serviceId)
		if (!selectedService) return []

		const duration = selectedService.duration
		const dayOfWeek = new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase()

		// Buscar horários de trabalho do profissional
		const professionalSchedule = appointments.find((a) => a.professionalId === professionalId)
		if (!professionalSchedule || !Object.keys(professionalSchedule.default).includes(dayOfWeek)) return []

		const workHours = professionalSchedule.default[dayOfWeek as keyof typeof professionalSchedule.default]
		if (!workHours) return []

		const startHour = parseTime(workHours.start)
		const endHour = parseTime(workHours.end)
		const intervals = workHours.intervals || []

		// Buscar horários já agendados (banco de dados + pedidos em andamento)
		const bookedTimes = [
			...professionalSchedule.appointments.filter((appt) => appt.date === date), // Banco de dados
			...currentOrder.services.filter((service) => service.date === date) // Serviços recém-agendados
		].map((appt) => ({
			start: parseTime(appt.time),
			end: parseTime(appt.time) + appt.duration,
			userId: (appt as { userId: number }).userId ?? user[0].id, // Garantir que serviços novos tenham um userId
			professionalId: (appt as { professionalId: number }).professionalId ?? professionalId // Adicionar profissionalId ao mapeamento
		}))

		// Buscar horários extras livres
		const extraFreeTime = professionalSchedule.extraFreeTimeAppointments.find((extra) => extra.date === date)?.appointments || []

		const timeSlots = []
		let currentTime = startHour

		while (currentTime + duration <= endHour) {
			const endTime = currentTime + duration
			let available = true
			let interval = false
			let description = 'Disponível'

			// Verifica se está dentro de um intervalo de pausa
			const intervalFound = intervals.find((interval) => currentTime >= parseTime(interval.start) && currentTime < parseTime(interval.end))
			if (intervalFound) {
				available = false
				interval = true
				description = intervalFound.description
			}

			// Verifica se o horário já está ocupado
			const bookedAppointment = bookedTimes.find((appt) => currentTime >= appt.start && currentTime < appt.end)

			if (bookedAppointment) {
				available = false
				interval = false
				description = bookedAppointment.userId === user[0].id ? 'Agendado por você' : 'Agendado por outro usuário'

				// Se o serviço foi agendado por outro profissional, adicionar a observação
				if (bookedAppointment.professionalId !== professionalId) {
					description += ' - Serviço de outro profissional'
				}
			}

			// Verifica se é um horário extra livre
			const isExtraFree = extraFreeTime.some((extra) => currentTime === parseTime(extra.start) && endTime === parseTime(extra.end))
			if (isExtraFree) {
				available = true
				interval = false
				description = ''
			}

			timeSlots.push({
				date,
				start: formatTime(currentTime),
				end: formatTime(endTime),
				available,
				interval,
				description
			})

			// Avança para o próximo horário
			currentTime = endTime
		}

		return timeSlots

		// Função auxiliar para converter "HH:mm" em minutos totais
		function parseTime(time: string): number {
			const [hours, minutes] = time.split(':').map(Number)
			return hours * 60 + minutes
		}

		// Função auxiliar para formatar minutos totais em "HH:mm"
		function formatTime(minutes: number): string {
			const hours = Math.floor(minutes / 60)
			const mins = minutes % 60
			return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
		}
	}

	// Função para verificar se o profissional tem dias disponíveis
	function hasAvailableDays(professionalId: number): boolean {
		const appointment = appointments.find((a) => a.professionalId === professionalId)
		if (!appointment) return false

		const weekDays = Object.keys(appointment.default || {}).filter((day) => day !== 'holidays')

		const hasDefaultAvailability = weekDays.some((day) => appointment.default?.[day as keyof typeof appointment.default]?.start)

		const hasExtraAvailability = (appointment.extraFreeTimeAppointments?.length ?? 0) > 0

		return hasDefaultAvailability || hasExtraAvailability
	}

	// Função para adicionar o serviço ao agendamento
	function addToSchedule() {
		if (!currentService.id || !currentProfessional.id || !currentTime.date || !currentTime.time) {
			return
		}

		// Adiciona o serviço ao pedido
		currentOrder.services.push({
			serviceId: currentService.id,
			professionalId: currentProfessional.id,
			date: currentTime.date,
			time: currentTime.time,
			duration: currentService.duration,
			price: currentService.price
		})

		// Reseta os valores para um novo serviço
		currentService = { id: 0, name: '', duration: 0, price: 0 }
		currentProfessional = { id: 0, name: '' }
		currentTime = { date: '', time: null, professionalId: null, serviceId: null }
	}

	// Função para adicionar o serviço e avançar para o próximo passo
	function addAndNextStep() {
		addToSchedule()
		currentStep++
	}

	// Função para remover um serviço agendado
	function removeService(serviceId: number) {
		currentOrder.services = currentOrder.services.filter((service) => service.serviceId !== serviceId)

		// Retorna para a etapa 2 se não houver mais serviços agendados
		if (currentOrder.services.length === 0) {
			currentStep = 2
		}
	}

	// Função para confirmar o agendamento
	function confirmAppointment() {
		if (currentOrder.services.length === 0) {
			alert('Nenhum serviço foi selecionado.')
			return
		}

		alert('Agendamento confirmado com sucesso!')

		// Resetando o pedido
		currentOrder.services = []
		currentStep = 1
	}

	// Função para calcular o horário de término
	function calcularHorarioFinal(time: string, duration: number): string {
		const [hour, minutes] = time.split(':').map(Number)
		const totalMinutes = minutes + duration
		const finalHour = hour + Math.floor(totalMinutes / 60)
		const finalMinutes = totalMinutes % 60
		return `${String(finalHour).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`
	}
</script>

<div class="pb-4">
	{@render nav()}
	{@render servicesAppointments()}
</div>
{#if currentStep === 1}
	{@render step1()}
{:else if currentStep === 2}
	{@render step2()}
{:else if currentStep === 3}
	{@render step3()}
{:else if currentStep === 4}
	{@render step4()}
{/if}

{#snippet nav()}
	<nav class="pb-4">
		<h1 class="pb-4 text-2xl">Agendamento</h1>
		<ul class="flex gap-x-4">
			<li>
				<button onclick={() => (currentStep = 1)} type="button" class="text-blue-600 hover:underline">1. Início</button>
			</li>
			<li>
				<button onclick={() => (currentStep = 2)} type="button" class="text-blue-600 hover:underline">2. Selecionar serviços, profissional, data e horário</button>
			</li>
			<li>
				<button onclick={() => (currentStep = 3)} type="button" class="text-blue-600 hover:underline">3. Login</button>
			</li>
			<li>4. Confirmar agendamento</li>
		</ul>
	</nav>
{/snippet}

{#snippet servicesAppointments()}
	<div class="pb-8">
		<h1 class="pb-4 text-2xl">Serviços agendados</h1>
		{#if currentOrder.services.length > 0}
			<ul class="space-y-2">
				{#each currentOrder.services as service}
					{@const serviceInfo = services.find((s) => s.id === service.serviceId)}
					<li class="flex items-center justify-between rounded-lg bg-gray-100 p-4 shadow">
						<div>
							<p class="text-lg font-semibold">
								{serviceInfo ? serviceInfo.name : 'Serviço não encontrado'}
							</p>
							<p class="text-sm text-gray-600">Profissional: {service.professionalId}</p>
							<p class="text-sm text-gray-600">Data: {service.date} às {service.time}</p>
							<p class="text-sm text-gray-600">Duração: {service.duration} minutos</p>
							<p class="text-sm text-gray-600">Preço: R$ {service.price.toFixed(2)}</p>
						</div>

						<!-- Botão de remover -->
						<button onclick={() => removeService(service.serviceId)} class="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600">
							Remover
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p>Nenhum serviço agendado.</p>
		{/if}
	</div>
{/snippet}

{#snippet step1()}
	<h1 class="pb-4 text-2xl">Passo {currentStep}</h1>
	<h2 class="pb-4 text-xl">Bem-vindo</h2>
	<p class="pb-4">
		Aqui você encontrará informações sobre o nosso estabelecimento e os serviços oferecidos. Entre em contato conosco para mais detalhes ou para agendar um serviço.
	</p>
	<div class="pb-8">
		<strong>Nome:</strong>
		{salon.name}
		<br />
		<strong>Endereço:</strong>
		{salon.address}
		<br />
		<strong>Telefone:</strong>
		{salon.phone}
	</div>
	<button
		onclick={() => currentStep++}
		type="button"
		class="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
	>
		Começar
	</button>
{/snippet}

{#snippet step2()}
	<h1 class="pb-4 text-2xl">Passo {currentStep}</h1>
	<h2 class="pb-4 text-xl">{currentStep}.1. Selecione um serviço</h2>
	<p class="mb-4">Aqui você deve selecionar o serviço que deseja agendar.</p>
	<!-- Passo 2.1 -->
	<div class="pb-8">
		{#each availableServices() as { id, name } (id)}
			<label class="flex items-center gap-x-2">
				<input
					type="radio"
					name="services"
					bind:group={currentService.id}
					value={id}
					onchange={(event: Event) => updateSelectedService(parseInt((event.currentTarget as HTMLInputElement).value ?? 0))}
				/>
				{name}
			</label>
		{/each}
	</div>
	<!-- Passo 2.2 -->
	{#if currentService.id}
		<h2 class="pb-4 text-xl">{currentStep}.2. Selecione um profissional</h2>
		<p class="mb-4">Aqui você deve selecionar o profissional que fará o serviço.</p>
		<div class="pb-8">
			{#each availableProfessionalsByService(currentService.id) as professional (professional!.id)}
				<label class="flex items-center gap-x-2">
					<input
						type="radio"
						name="professionals"
						bind:group={currentProfessional.id}
						value={professional?.id ?? 0}
						onchange={(event) => updateSelectedProfessional(parseInt(event.currentTarget.value ?? 0))}
						disabled={!hasAvailableDays(professional?.id ?? 0)}
					/>
					{professional?.name} - {professional?.description} - {professional?.genre} -
					{professional?.available ? 'Disponível' : 'Indisponível'} -
					{professional?.duration} min - R$ {professional?.price} -
					{hasAvailableDays(professional?.id ?? 0) ? 'Disponível' : 'Nenhum dia disponível'}
				</label>
			{/each}
		</div>
	{/if}
	<!-- Passos 2.3 e 2.4 -->
	{#if currentService.id && currentProfessional.id}
		<h2 class="pb-4 text-xl">{currentStep}.3. Selecione a data e horário</h2>
		<p class="mb-4">Aqui você deve selecionar a data e o horário que deseja agendar.</p>
		<!-- Passo 2.3 -->
		<div class="pb-8">
			<h3 class="pb-4 text-lg">{currentStep}.3.1. Datas disponíveis</h3>
			<p>Aqui estão as datas disponíveis:</p>
			{#each days(8) as { date, weekday, day, month, year } (date)}
				{#if currentProfessional.id !== 0 && isProfessionalAvailable(date)}
					<label class="flex items-center gap-x-2">
						<input type="radio" name="date" bind:group={currentTime.date} value={date} onchange={() => updateCurrentTime(date, '')} />
						{weekday} - {day} - {month}/{year}
					</label>
				{/if}
			{/each}
		</div>
		<!-- Passo 2.4 -->
		{#if currentTime.professionalId && currentTime.serviceId}
			<h3 class="pb-4 text-lg">{currentStep}.3.2. Horários disponíveis</h3>
			<p>Aqui estão os horários disponíveis:</p>
			{#each generateTimes(currentTime.date, currentTime.professionalId, currentTime.serviceId) as time (time.start)}
				{#if time.available}
					<!-- Horário disponível -->
					<label class="flex items-center gap-x-2 text-green-600">
						<input type="radio" name="time" bind:group={currentTime.time} value={time.start} onchange={() => updateCurrentTime(currentTime.date, currentTime.time)} />
						{time.start} às {time.end} (Disponível)
					</label>
				{:else if time.interval}
					<!-- Intervalo (ex: almoço, pausa) -->
					<div class="flex items-center gap-x-2 text-yellow-600">
						⏸️ {time.start} às {time.end} - {time.description}
					</div>
				{:else}
					<!-- Horário já agendado -->
					<div class="flex items-center gap-x-2 text-red-600">
						❌ {time.start} às {time.end} - {time.description}
					</div>
				{/if}
			{/each}
		{/if}
	{/if}
	<!-- Adicionar ao agendamento e resetar para adicionar novo serviço -->
	<button
		onclick={addToSchedule}
		disabled={!currentService.id || !currentProfessional.id || !currentTime.date || !currentTime.time}
		type="button"
		class="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
	>
		Adicionar ao agendamento
	</button>
	<!-- Adicionar ao agendamento e passar para o próximo passo  -->
	<button
		onclick={addAndNextStep}
		disabled={currentOrder.services.length === 0}
		type="button"
		class="inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:bg-blue-700 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
	>
		Próximo
	</button>
{/snippet}

{#snippet step3()}
	<h1 class="pb-4 text-2xl">Passo {currentStep}</h1>
	<h2 class="pb-4 text-xl">Login</h2>
	<p class="mb-4">Faça login para continuar com o agendamento.</p>

	<!-- Simulação de login -->
	<div class="mb-4 space-y-2">
		<input type="text" value="" placeholder="Nome" class="w-full rounded-lg border p-3 text-gray-900 shadow-sm" />

		<input type="email" value="" placeholder="E-mail" class="w-full rounded-lg border p-3 text-gray-900 shadow-sm" />

		<input type="tel" value="" placeholder="Telefone" class="w-full rounded-lg border p-3 text-gray-900 shadow-sm" />
	</div>

	<button onclick={() => currentStep++} type="button" class="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"> Próximo </button>
{/snippet}

{#snippet step4()}
	<h1 class="pb-4 text-2xl">Passo {currentStep}</h1>
	<h2 class="pb-4 text-xl">Confirmação do Agendamento</h2>

	<!-- Informações do Cliente -->
	<div class="mb-4 rounded-lg bg-gray-100 p-4 shadow">
		<h3 class="text-lg font-semibold">Informações do Cliente</h3>
		<p class="text-sm text-gray-700"><strong>Nome:</strong> {currentUser.name}</p>
		<p class="text-sm text-gray-700"><strong>E-mail:</strong> {currentUser.email}</p>
	</div>

	<!-- Lista de Serviços -->
	<div class="mb-4 rounded-lg bg-gray-100 p-4 shadow">
		<h3 class="text-lg font-semibold">Serviços</h3>
		{#if currentOrder.services.length > 0}
			<ul class="space-y-2">
				{#each currentOrder.services as service}
					{@const serviceInfo = services.find((s) => s.id === service.serviceId)}
					{@const professional = professionals.find((p) => p.id === service.professionalId)}
					{@const timeEnd = calcularHorarioFinal(service.time, service.duration)}
					<li class="text-sm text-gray-700">
						<strong>{serviceInfo ? serviceInfo.name : 'Serviço não encontrado'}</strong> - R$ {service.price.toFixed(2)}
						<p>Profissional: {professional ? professional.name : 'Não encontrado'}</p>
						<p>Data: {service.date || 'Não definida'}</p>
						<p>Horário: {service.time} até {timeEnd} ({service.duration} minutos)</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-gray-700">Nenhum serviço selecionado.</p>
		{/if}
	</div>

	<!-- Total -->
	{@const totalPrice = currentOrder.services.reduce((acc, service) => acc + (service.price || 0), 0)}
	<div class="mb-4 rounded-lg bg-gray-100 p-4 shadow">
		<h3 class="text-lg font-semibold">Total</h3>
		<p class="text-lg font-bold text-green-600">R$ {totalPrice.toFixed(2)}</p>
	</div>

	<!-- Botões -->
	<div class="flex flex-col gap-2">
		<button onclick={() => confirmAppointment()} type="button" class="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700">
			Confirmar Agendamento
		</button>

		<button onclick={() => (currentStep = 2)} type="button" class="w-full rounded-lg bg-yellow-600 px-4 py-3 text-sm font-medium text-white hover:bg-yellow-700">
			Editar Serviços
		</button>

		<button onclick={() => (currentStep = 1)} type="button" class="w-full rounded-lg bg-gray-600 px-4 py-3 text-sm font-medium text-white hover:bg-gray-700">
			Voltar para a Tela Inicial
		</button>
	</div>
{/snippet}
