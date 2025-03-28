# Autenticação com Drizzle, Better Auth e Sveltekit

O Better Auth fornece suporte de autenticação integrado para:

- E-mail e senha
- Provedor social (Google, GitHub, Facebook, Apple, Microsoft, Twitter (X), Linkedin e mais)
- Mas também pode ser facilmente estendido usando plugins, como: username, magic link, passkey, email-otp e muito mais.

Para instalar e configurar, siga os passos abaixo:

1. Instale os seguintes pacotes:

```bash
npm i better-auth nodemailer zod
npm i --save-dev @types/nodemailer
```

O `bether-auth` para autenticação, `nodemailer` para envio de e-mails e `zod` para validação de formulários e campos.

2. Configure criando um segredo para a variável de ambiente e definindo a URL base do aplicativo em `.env`:

```bash
# Banco de dados
DATABASE_URL=local.db

# Better Auth: https://www.better-auth.com/docs/installation
# Utilize o comando para gerar um segredo: 'npx @better-auth/cli@latest secret'
BETTER_AUTH_SECRET= # Segredo
BETTER_AUTH_URL=http://localhost:5173 # URL base do aplicativo

# Autenticação com Google: https://www.better-auth.com/docs/authentication/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Autenticação com Facebook: https://www.better-auth.com/docs/authentication/facebook
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Dados para envio de e-mails
SMTP_HOST= # Exemplo: smtp.mailgun.org
SMTP_PORT= # Porta para conexão (587 para TLS, 465 para SSL)
SMTP_SECURE= # Defina como true se usar SSL
SMTP_USERNAME= # E-mail do remetente
SMTP_PASSWORD= # Senha do SMTP
```

3. Deixe o arquivo `drizzle.config.ts` assim:

```typescript
import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não foi definido')

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dbCredentials: { url: process.env.DATABASE_URL },
	verbose: true,
	strict: true,
	dialect: 'sqlite'
})
```

4. Deixe o arquivo `src/lib/server/db/index.ts` assim:

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { env } from '$env/dynamic/private'

if (!env.DATABASE_URL) throw new Error('DATABASE_URL não foi definido')

const client = new Database(env.DATABASE_URL)

export const db = drizzle(client, { schema })
```

5. Crie o arquivo `src/lib/server/auth.ts` para servir como uma instância de autenticação:

```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '$lib/server/db' // Não utilizar '$lib/server/db' se for usar o comando 'npx @better-auth/cli@latest generate'
// import * as schema from '../lib/server/db/schema' // Não utilizar '$lib/server/db/schema' se for usar o comando 'npx @better-auth/cli@latest generate'
import { emailOTP } from 'better-auth/plugins'

// Cria uma instância do Better Auth e exporta como `auth`
export const auth = betterAuth({
	// Modifica o caminho base para a rota de API de autenticação manipulada em 'hooks.server.ts'.
	// Isso é importante caso venha a ser usado no futuro o manipulador de rotas `src/hooks.server.ts` junto com as funções do lado do cliente `auth-client.ts`
	// Se os arquivos `hooks.server.ts` e `auth-client.ts` não estiverem no projeto, podemos ignorar adicionar o 'basePath'
	basePath: '/api/better-auth', // Padrão: '/api/auth'. Muito importante alterar para '/api/better-auth' ou outra rota, para evitar interferências com as rotas de API próprias que estão em /api/auth
	// Configura o banco de dados a ser usado com o adaptador do Drizzle
	database: drizzleAdapter(db, {
		provider: 'sqlite', // Pode ser: 'mysql', 'pg', 'sqlite'
		// schema: {
		// 	...schema,
		// 	user: schema.users // Se o esquema mapeia a tabela 'user' como 'users'
		// },
		usePlural: true // Caso deseje que as tabelas sejam criadas com nomes no plural
	}),
	// Autenticação por e-mail e senha
	// Por padrão, os usuários são automaticamente conectados após se inscreverem com sucesso.
	// Para desabilitar esse comportamento, defina 'autoSignIn' como 'false'
	emailAndPassword: {
		enabled: true,
		autoSignIn: true, // Padrão: true
		requireEmailVerification: true // Padrão: false. Habilitando requer que o usuário verifique seu e-mail antes de fazer login
	},
	// Autenticação por provedor social
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
		},
		facebook: {
			clientId: process.env.FACEBOOK_CLIENT_ID || '',
			clientSecret: process.env.FACEBOOK_CLIENT_SECRET || ''
		}
	},
	session: {
		expiresIn: 604800, // Tempo de expiração do token de sessão em segundos (padrão: 604800- 7 dias)
		updateAge: 86400, // Com que frequência a sessão deve ser atualizada em segundos (padrão: 86400- 1 dia)
		storeSessionInDatabase: true, // Armazena sessão no banco de dados quando o armazenamento secundário é fornecido (padrão: false)
		preserveSessionInDatabase: false, // Preservar registros de sessão no banco de dados quando excluídos do armazenamento secundário (padrão: false)
		cookieCache: {
			enabled: true, // Habilitar sessão de cache no cookie
			maxAge: 300 // 5 minutes
		}
	},
	advanced: {
		cookiePrefix: 'auth', // Padrão: 'better-auth'. Prefixo para os cookies de autenticação. Formato: ${prefix}.${cookie_name}
		useSecureCookies: false // Padrão: true, somente quando em execução no modo de produção. Cookies seguros, necessário domínio com HTTPS.
	},
	// Plugins
	plugins: [
		emailOTP({
			// Opções
			disableSignUp: true, // Padrão: false. Se o usuário não estiver registrado, ele será registrado automaticamente. Para evitar isso, você deve passar 'disableSignUp' como true
			// Envia o OTP
			async sendVerificationOTP({ email, otp, type }) {
				// Implement the sendVerificationOTP method to send the OTP to the user's email address
				console.log('email', email, 'otp', otp, 'type', type)
			}
		})
	]
})
```

Não será necessário criar o arquivo `src/hooks.server.ts`, pois não haverá um manipulador de rotas que utilizará o `auth-client.ts`, pois faremos requisições via

Não será necessário criar o arquivo `lib/auth-client.ts`, pois não utilizaremos uma instância do cliente, já que faremos uso apenas de API.

6. Gere o esquema do banco de dados com o comando: `npx @better-auth/cli@latest generate`.

Após gerar o esquema, será criado automaticamente o arquivo `auth-schema.ts` na raiz do projeto.

O migrate só funciona com o adaptador Kysely. Para o Drizzle iremos utilizar o migrate do Drizzle ou push para aplicar as alterações.

Então, vamos copiar o conteúdo de `auth-schema.ts` e substituir todo o conteúdo de `src/lib/db/schema.ts`. Em seguida iremos apagar o `auth-schema.ts`.

Deixe o arquivo `src/lib/db/schema.ts` assim:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
})

export const accounts = sqliteTable('accounts', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

export const verifications = sqliteTable('verifications', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
})
```

Em seguida, criaremos o arquivo do banco de dados fazendo um push com o comando: `npm run db:push`.

7. Deixe o arquivo 'src/routes/+page.svelte' assim:

```html
<h1>Autenticação com Sveltekit, Drizzle e Better Auth</h1>

<p>Clique em um dos botões abaixo para prosseguir:</p>
<p><a href="/signup">Cadastre-se</a> ou <a href="/signin">Login</a></p>
```

8. Deixe o arquivo 'src/routes/api/signup/+server.ts' assim:

```typescript
import { auth } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

import { json, type RequestEvent } from '@sveltejs/kit'
import { z } from 'zod'

// Definição dos tipos para a resposta
export type ErrorResponse = {
	errors: { field: string | null; description: string }[]
}
export type SuccessResponse = {
	user: { id: string; name: string; email: string }
	token: string | null
}

// Schema de validação com Zod
const schema = z.object({
	name: z.string().min(2, 'O nome está muito curto.'),
	email: z.string().email('O e-mail é inválido.'),
	password: z
		.string()
		.min(8, 'A senha deve ter pelo menos 8 caracteres.')
		.regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
		.regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
		.regex(/\d/, 'A senha deve conter pelo menos um número.')
		.regex(/[!@#$%^&*(),.?":{}|<>]/, 'A senha deve conter pelo menos um caractere especial.')
})

// Função auxiliar que verifica se o usuário existe no banco de dados através do e-mail
const userExists = async (email: string) => await db.select().from(users).where(eq(users.email, email)).get()

// Função auxiliar para cadastrar um usuário com email e senha
export async function POST({ request }: RequestEvent): Promise<Response> {
	try {
		// Obter dados do corpo da requisição
		const body = await request.json()

		// Validação com Zod
		const validatedData = schema.parse(body)

		// Verifica se o e-mail ja existe
		if (await userExists(validatedData.email)) {
			return json({ errors: [{ field: 'email', description: 'E-mail já cadastrado.' }] } as ErrorResponse, { status: 400 })
		}

		// Chama a API para cadastrar o usuário
		const response = await auth.api.signUpEmail({
			body: {
				name: validatedData.name,
				email: validatedData.email,
				password: validatedData.password
			}
		})

		// Verifica se a resposta contém erros (ErrorResponse)
		if ('errors' in response) {
			return json({ errors: response.errors } as ErrorResponse, { status: 400 })
		}

		// Caso a resposta contenha user e token (SuccessResponse)
		if (response.user && response.token) {
			return json({ user: response.user, token: response.token } as SuccessResponse, { status: 200 })
		}

		// Caso nenhuma resposta tenha sido recebida ou resposta inválida
		return json({ errors: [{ field: null, description: 'Erro desconhecido ao cadastrar o usuário.' }] } as ErrorResponse, { status: 500 })
	} catch (err) {
		// Se houver erro na validação, retorna um array de erros
		if (err instanceof z.ZodError) {
			const errors = err.errors.map((e) => ({
				field: String(e.path[0]), // Garantir que 'field' seja uma string
				description: e.message // Mensagem de erro
			}))

			return json({ errors } as ErrorResponse, { status: 400 })
		}

		// Para outros erros inesperados, padroniza a resposta com um array
		const errorMessage = err instanceof Error ? err.message : 'Erro inesperado no servidor.'
		return json(
			{
				errors: [{ field: null, description: errorMessage }]
			} as ErrorResponse,
			{ status: 500 }
		)
	}
}
```

9. Deixe o arquivo 'src/routes/api/signup/+page.svelte' assim:

```typescript
<script lang="ts">
	import { goto } from '$app/navigation'

	let name = $state('')
	let email = $state('')
	let password = $state('')

	let loading = $state(false)
	let errors: { field: string | null; description: string }[] = $state([])

	// Mapeamento de campos para nomes amigáveis
	const fieldName: Record<string, string> = {
		name: 'Nome',
		email: 'E-mail',
		password: 'Senha'
	}

	// Criar conta com e-mail e senha
	const handleSignUpEmail = async () => {
		loading = true
		errors = [] // Reseta a mensagem de erro antes de tentar cadastrar novamente

		// Chama a API de cadastro
		const response = await fetch('/api/auth/signup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, email, password })
		})

		loading = false // Desativa o loading após a resposta da API

		try {
			const data = await response.json() // Resposta da API

			// Se foi feito o cadastro
			if (response.ok) {
				goto('/dashboard') // Redireciona para o dashboard
			} else {
				// Se houve erros recebidos pela API
				if (data.errors) {
					errors = data.errors
				} else {
					errors = [{ field: null, description: 'Erro desconhecido ao realizar o cadastro do usuário.' }]
				}
			}
		} catch (err) {
			console.error('Erro ao processar a resposta:', err)
			errors = [{ field: null, description: 'Erro ao processar a resposta da API.' }]
		}
	}
</script>

<h1>Criar conta</h1>

<!-- Exibição de erros globais -->
{#if errors.length > 0}
	<div>
		{#each errors as { field, description }}
			{#if field === null}
				<p>Mensagem: {description}</p>
				<!-- Erro geral, como 'Erro desconhecido' -->
			{:else}
				<!-- Exibe o nome amigável do campo -->
				<p>{fieldName[field] || field}: {description}</p>
				<!-- Erro específico do campo -->
			{/if}
		{/each}
	</div>
{/if}

<!-- Criar conta com e-mail e senha -->
<form onsubmit={handleSignUpEmail}>
	<div>
		<p>Informe os dados abaixo para criar uma conta.</p>
	</div>

	<!-- Campo Nome -->
	<div>
		<label>
			Nome:
			<input type="text" bind:value={name} autocomplete="name" minlength="2" required />
		</label>
		{#each errors as { field, description }}
			{#if field === 'name'}
				<p class="error">{description}</p>
				<!-- Exibe o erro se existir -->
			{/if}
		{/each}
	</div>

	<!-- Campo Email -->
	<div>
		<label>
			Email:
			<input type="email" bind:value={email} autocomplete="email" required />
		</label>
		{#each errors as { field, description }}
			{#if field === 'email'}
				<p class="error">{description}</p>
				<!-- Exibe o erro se existir -->
			{/if}
		{/each}
	</div>

	<!-- Campo Senha -->
	<div>
		<label>
			Senha:
			<input type="password" bind:value={password} autocomplete="new-password" required minlength="8" />
		</label>
		{#each errors as { field, description }}
			{#if field === 'password'}
				<p class="error">{description}</p>
				<!-- Exibe o erro se existir -->
			{/if}
		{/each}
	</div>

	<!-- Botão de envio -->
	<div>
		<button type="submit" disabled={loading}>
			{loading ? 'Cadastrando...' : 'Cadastrar'}
		</button>
	</div>
</form>

<div>
	<p>Já possui uma conta? <a href="/signin">Faça login</a></p>
</div>

<!--
	Usando @apply com módulos Vue, Svelte ou CSS
	https://tailwindcss.com/docs/upgrade-guide#using-apply-with-vue-svelte-or-css-modules
	Usar: @reference "../../app.css";
	Ou usar: var(--text-red-500);
-->
<style>
	@reference "../../app.css";

	.error {
		@apply text-sm text-red-500;
	}
</style>
```

10. Deixe o arquivo 'src/routes/dashboard/+page.svelte' assim:

```typescript
<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { goto } from '$app/navigation'

	// Obtém os dados da sessão	do usuário
	const session = authClient.useSession()

	// Função de logout
	async function handleSignOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					goto('/signin') // Redireciona para a página de login
				}
			}
		})
	}
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
```

11. Crie o arquivo 'src/routes/dashboard/+page.server.ts' com o seguinte conteúdo:

```typescript
import { auth } from '$lib/auth'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
	// Obtem a sessão da API, usando os cabeçalhos da requisição
	const session = await auth.api.getSession({
		headers: request.headers
	})

	// Se não houver usuário na sessão, redireciona para o login
	if (!session?.user) {
		throw redirect(302, '/signin') // Redireciona para o login
	}

	// Retorna os dados da sessão para serem usados na página
	return { session }
}
```

12. Crie o arquivo 'src/routes/signin/+page.svelte' com o seguinte conteúdo:

```
<script lang="ts">
	import { authClient } from '$lib/auth-client'

	let email = $state('')
	let password = $state('')
	let loading = $state(false)
	let errorMessage: string | null = $state('')

	// Função de login com e-mail e senha
	async function handleSignInEmail() {
		loading = true

		const { data, error } = await authClient.signIn.email(
			{
				email, // E-mail
				password, // Senha
				rememberMe: true, // Padrão: true. Lembra a sessão do usuário após o navegador ser fechado
				callbackURL: '/dashboard' // URL de redirecionamento depois que o usuário verificar seu e-mail (opcional)
			},
			{
				onRequest: (context) => {
					// Exibir o loading
					loading = true
				},
				onSuccess: (context) => {
					// Redireciona ao dashboard ou página de login
				},
				onError: (context) => {
					// Exibe a mensagem de erro
					errorMessage = context.error.message
					loading = false
					alert(context.error.message)
				}
			}
		)
		errorMessage = error?.statusText ?? null
		console.log('data', data)
		console.log('error', error)
	}

	async function handleSignInSocial(provider: 'google' | 'facebook' | 'twitter' | 'apple' | 'microsoft' | 'linkedin') {
		loading = true

		const { data, error } = await authClient.signIn.social(
			{
				provider: provider, // Nome do provedor social
				callbackURL: '/dashboard', // URL de redirecionamento depois que o usuário verificar seu e-mail (opcional)
				errorCallbackURL: '/error', // URL de redirecionamento em caso de erro durante o processo de login social
				newUserCallbackURL: '/welcome', // URL de redirecionamento para a página de boas-vindas para novos usuários
				disableRedirect: true // Padrão: false.Desabilita o redirecionamento automático para o provedor social
			},
			{
				onRequest: (context) => {
					// Exibir o loading
					loading = true
				},
				onSuccess: (context) => {
					// Redireciona ao dashboard ou página de login
				},
				onError: (context) => {
					// Exibe a mensagem de erro
					errorMessage = context.error.message
					loading = false
					alert(context.error.message)
				}
			}
		)
		errorMessage = error?.statusText ?? null
		console.log('data', data)
		console.log('error', error)
	}
</script>

<h1>Login</h1>

<form onsubmit={handleSignInEmail}>
	<h1>Criar conta</h1>
	<div>
		{#if errorMessage}
			<p>{errorMessage}</p>
		{/if}
	</div>
	<div>
		<label>
			Email:
			<input type="email" bind:value={email} autocomplete="email" required />
		</label>
	</div>
	<div>
		<label>
			Senha:
			<input type="password" bind:value={password} autocomplete="new-password" required />
		</label>
	</div>
	<div>
		<button type="submit" disabled={loading}>
			{loading ? 'Entrando...' : 'Entrar'}
		</button>
	</div>
	<div>
		<button type="button" onclick={() => handleSignInSocial('google')}>
			{loading ? 'Entrando...' : 'Entrar com Google'}
		</button>
	</div>
</form>
```
