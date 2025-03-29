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
import { emailOTP } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '$lib/server/db' // Não utilizar '$lib/server/db' se for usar o comando 'npx @better-auth/cli@latest generate'
// import * as schema from '../lib/server/db/schema' // Não utilizar '$lib/server/db/schema' se for usar o comando 'npx @better-auth/cli@latest generate'

import { sendEmail } from '$lib/utils/email'

// Cria uma instância do Better Auth e exporta como `auth`
export const auth = betterAuth({
	// Modifica o caminho base para a rota de API de autenticação manipulada em 'hooks.server.ts'.
	// Isso é importante caso venha a ser usado no futuro o manipulador de rotas `src/hooks.server.ts` junto com as funções do lado do cliente `auth-client.ts`
	// Se os arquivos `hooks.server.ts` e `auth-client.ts` não estiverem no projeto, podemos ignorar adicionar o 'basePath'
	// basePath: '/api/auth', // Padrão: '/api/auth'. Para evitar interferências com as rotas de API próprias, utilize uma rota diferente de '/api/auth'
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
	// Verificação de e-mail
	// A rota de verificação de e-mail depende da existência do arquivo 'src/hooks.server.ts'
	// E também depende da configuração em basePath, neste arquivo '$lib/server/auth.ts'
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			// Enviar e-mail de verificação de e-mail
			sendEmail({
				to: user.email,
				subject: 'Verificação de e-mail',
				text: `Clique no link para verificar seu e-mail e confirmar sua conta: \n\n${url}`
			})
		}
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
				// Enviar e-mail com o código OTP
				sendEmail({
					to: email,
					subject: 'Código de verificação',
					text: `Utilize o seguinte código de verificação ${type === 'sign-in' ? 'para fazer login' : type === 'email-verification' ? 'para verificar seu e-mail' : type === 'forget-password' ? 'para recuperar sua senha' : 'a seguir'}: ${otp}`
				})
			}
		})
	]
})
```

6. Crie o arquivo `src/hooks.server.ts`, que será o manipulador de rotas que utilizará o `auth-client.ts` para algumas funções de autenticação. Deixe-o assim:

```typescript
import { auth } from '$lib/server/auth'
import { svelteKitHandler } from 'better-auth/svelte-kit'

export async function handle({ event, resolve }) {
	return svelteKitHandler({ event, resolve, auth })
}
```

7. Crie o arquivo `lib/auth-client.ts` para interagir com o servidor de autenticação. É melhor utilizar ele que uma API própria de autenticação, pois ele já cuida de criar os cookies e sessões. Deixe-o assim:

```typescript
import { createAuthClient } from 'better-auth/svelte'

export const authClient = createAuthClient()
```

Após já ter configurado os plugins em `$lib/server/auth.ts`, você já pode gerar o esquema do banco de dados.

8. Gere o esquema do banco de dados com o comando: `npx @better-auth/cli@latest generate`.

Após gerar o esquema, será criado automaticamente o arquivo `auth-schema.ts` na raiz do projeto.

Como estamos utilizando o Drizzle ORM, iremos utilizar o migrate do Drizzle ou push para aplicar as alterações.

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

9. Deixe o arquivo 'src/routes/+page.svelte' assim:

```html
<h1>Autenticação com Sveltekit, Drizzle e Better Auth</h1>

<p>Clique em um dos botões abaixo para prosseguir:</p>
<p><a href="/sign-up">Cadastre-se</a> ou <a href="/sign-in">Login</a></p>
```

10. Deixe o arquivo 'src/routes/api/utils/sign-up/+server.ts' assim:

```typescript
import { auth } from '$lib/server/auth'
import { errorCodes } from '$lib/utils/auth'
import { checkIfUserEmailExists } from '$lib/server/utils/db'

import { json, type RequestEvent } from '@sveltejs/kit'
import { z } from 'zod'

// Tipagem para a resposta da API
type SignUpResponse = {
	success: boolean
	errors?: { field?: string; code: string; message: string }[]
	user?: { id: string; name: string; email: string }
	token?: string | null
}

// Schema de validação com Zod
const signUpSchema = z.object({
	name: z
		.string({ required_error: 'O nome é obrigatório.' }) // Garante que o campo é obrigatório
		.min(2, { message: 'O nome está muito curto.' }) // Garante que o campo tenha pelo menos 2 caracteres
		.regex(/^[A-Za-zÀ-ÿ\s\-.'À-ÿ]*$/, { message: 'O nome não pode conter caracteres especiais.' }), // Permite espaço, traço, ponto e apóstrofo
	email: z
		.string({ required_error: 'O e-mail é obrigatório.' }) // Garante que o e-mail é obrigatório
		.email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
	password: z
		.string({ required_error: 'A senha é obrigatória.' }) // Garante que a senha é obrigatória
		.min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }) // Garante que a senha tenha pelo menos 8 caracteres
		.regex(/[A-Z]/, { message: 'A senha deve conter pelo menos uma letra maiúscula.' }) // Garante que a senha contenha pelo menos uma letra maiúscula
		.regex(/[a-z]/, { message: 'A senha deve conter pelo menos uma letra minúscula.' }) // Garante que a senha contenha pelo menos uma letra minúscula
		.regex(/\d/, { message: 'A senha deve conter pelo menos um número.' }) // Garante que a senha contenha pelo menos um número
		.regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'A senha deve conter pelo menos um caractere especial.' }) // Garante que a senha contenha pelo menos um caractere especial
})

// Função para cadastrar um usuário com email e senha
// Recebe: { name, email, password }
// Retorna um JSON com a resposta da API do tipo SignUpResponse e o status
export async function POST({ request }: RequestEvent): Promise<Response> {
	// Obtem dados do corpo da requisição
	let body
	try {
		body = await request.json()
	} catch {
		return json({ success: false, errors: [{ code: 'INVALID_JSON', message: 'O corpo da requisição não é um JSON válido.' }] } as SignUpResponse, { status: 400 })
	}

	// CADASTRAR USUÁRIO COM NOME, EMAIL E SENHA

	// Valida os dados recebidos
	let validatedSchema
	try {
		validatedSchema = signUpSchema.parse(body)
	} catch (err) {
		if (err instanceof z.ZodError) {
			return json(
				{
					success: false,
					errors: err.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message }))
				} as SignUpResponse,
				{ status: 400 }
			)
		}
		return json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message: 'Erro na validação dos dados.' }] } as SignUpResponse, { status: 400 })
	}

	// Verifica se o e-mail já está cadastrado
	if (await checkIfUserEmailExists(validatedSchema.email)) {
		return json({ success: false, errors: [{ field: 'email', code: 'USER_ALREADY_EXISTS', message: 'Usuário já existe.' }] } as SignUpResponse, { status: 400 })
	}

	// Chama a API para cadastrar o usuário com nome, email e senha
	try {
		const api = await auth.api.signUpEmail({
			returnHeaders: true,
			body: {
				name: validatedSchema.name,
				email: validatedSchema.email,
				password: validatedSchema.password
			}
		})

		// Verifica se a resposta contém erros
		if ('errors' in api.response) {
			return json({ success: false, errors: api.response.errors } as SignUpResponse, { status: 400 })
		}

		// Caso a resposta contenha o 'user', então retorna com sucesso
		else if (api.response.user) {
			return json({ success: true, user: api.response.user, token: api.response.token } as SignUpResponse, { status: 200 })
		}
	} catch (err) {
		const apiErrorCode = (err as { body?: { code?: string } })?.body?.code
		const errorMessage = apiErrorCode && errorCodes[apiErrorCode as keyof typeof errorCodes] ? errorCodes[apiErrorCode as keyof typeof errorCodes] : 'Erro inesperado no servidor.'

		return json({ success: false, errors: [{ code: apiErrorCode || 'INTERNAL_SERVER_ERROR', message: errorMessage }] } as SignUpResponse, { status: 400 })
	}

	return json({ success: false, errors: [{ code: 'UNKNOWN_ERROR', message: 'Erro desconhecido no servidor.' }] } as SignUpResponse, { status: 500 })
}
```

11. Deixe o arquivo 'src/routes/(auth)/sign-up/+page.svelte' assim:

```typescript
<script lang="ts">
	import { goto } from '$app/navigation'

	// Dados para cadastro
	let name = $state('')
	let email = $state('')
	let password = $state('')

	// Carregando e erros
	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])

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

		try {
			// Chama a API de cadastro
			const response = await fetch('/api/auth/sign-up', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			})

			loading = false // Desativa o loading após a resposta da API

			const data = await response.json() // Resposta da API

			// Se foi feito o cadastro
			if (response.ok && data.success) {
				goto('/app/dashboard') // Redireciona para o dashboard
			} else {
				// Se houve erros recebidos pela API
				if (data.errors) {
					errors = data.errors
				} else {
					errors = [{ code: 'UNKNOWN', message: 'Erro desconhecido ao realizar o cadastro do usuário.' }]
				}
			}
		} catch (err) {
			console.error('Erro ao processar a resposta:', err)
			errors = [{ code: 'PROCCESS_ERROR', message: 'Erro ao processar a resposta da API.' }]
		}
	}
</script>

<h1>Criar conta</h1>

<!-- Exibição de erros globais -->
{#if errors.length > 0}
	<div>
		{#each errors as { field, message }}
			{#if !field}
				<!-- Erro geral, como 'Erro desconhecido' -->
				<p>Mensagem: {message}</p>
			{:else}
				<!-- Erro específico do campo -->
				<p>{fieldName[field] || field}: {message}</p>
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
		{#each errors as { field, message }}
			{#if field === 'name'}
				<p class="error">{message}</p>
			{/if}
		{/each}
	</div>

	<!-- Campo Email -->
	<div>
		<label>
			Email:
			<input type="email" bind:value={email} autocomplete="email" required />
		</label>
		{#each errors as { field, message }}
			{#if field === 'email'}
				<p class="error">{message}</p>
			{/if}
		{/each}
	</div>

	<!-- Campo Senha -->
	<div>
		<label>
			Senha:
			<input type="password" bind:value={password} autocomplete="new-password" required minlength="8" />
		</label>
		{#each errors as { field, message }}
			{#if field === 'password'}
				<p class="error">{message}</p>
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
	<p>Já possui uma conta? <a href="/sign-in">Faça login</a></p>
</div>

<!--
	Usando @apply com módulos Vue, Svelte ou CSS
	https://tailwindcss.com/docs/upgrade-guide#using-apply-with-vue-svelte-or-css-modules
	Usar: @reference "../../app.css";
	Ou usar: var(--text-red-500);
-->
<style>
	@reference "../../../app.css";

	.error {
		@apply text-sm text-red-500;
	}
</style>
```

12. Deixe o arquivo 'src/routes/app/dashboard/+page.svelte' assim:

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
					// Redireciona para a página de login
					goto('/sign-in')
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

13. Crie o arquivo 'src/routes/dashboard/+page.server.ts' com o seguinte conteúdo:

```typescript
import { auth } from '$lib/server/auth'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
	// Obtem a sessão da API, usando os cabeçalhos da requisição
	const session = await auth.api.getSession({
		headers: request.headers
	})

	// Se não houver usuário na sessão, redireciona para o login
	if (!session?.user) {
		throw redirect(302, '/sign-in') // Redireciona para o login
	}

	// Retorna os dados da sessão para serem usados na página
	return { session }
}
```

14. Deixe o arquivo 'src/routes/api/utils/sign-in/+server.ts' assim:

```typescript
import { auth } from '$lib/server/auth'
import { errorCodes } from '$lib/utils/auth'
import { checkIfUserEmailExists } from '$lib/server/utils/db'

import { json, type RequestEvent } from '@sveltejs/kit'
import { z } from 'zod'

// Tipagem para a resposta da API
type SignInResponse = {
	success: boolean
	errors?: { field?: string; code: string; message: string }[]
	user?: { id: string; name: string; email: string; image: string | null | undefined; emailVerified: boolean }
	token?: string | null
}

// Schema de validação com Zod: tipo
const typeSignInSchema = z.object({
	type: z.enum(['email', 'otp', 'social'], {
		invalid_type_error: 'Você deve enviar a forma correta que deseja fazer login.',
		required_error: 'O tipo de login é obrigatório.'
	})
})

// Schema de validação com Zod: tipo email
const emailSignInSchema = z.object({
	email: z
		.string({ required_error: 'O e-mail é obrigatório.' }) // Garante que o e-mail é obrigatório
		.email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
	password: z
		.string({ required_error: 'A senha é obrigatória.' }) // Garante que a senha é obrigatória
		.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, { message: 'A senha é inválida.' }) //Garante que a senha atende a todos os requisitos: pelo menos uma letra maiúscula, pelo menos uma letra minúscula, pelo menos um número e pelo menos um caractere especial
})

// Schema de validação com Zod: tipo otp
const otpSignInSchema = z.object({
	email: z
		.string({ required_error: 'O e-mail é obrigatório.' }) // Garante que o e-mail é obrigatório
		.email({ message: 'O e-mail é inválido.' }), // Garante que o e-mail é válido
	otp: z
		.string() // Garante que seja uma string
		.regex(/^\d{6}$/, { message: 'O código é inválido.' }) // Garante que o OTP seja composto por exatamente 6 números
		.optional() // Garante que o OTP é opcional
})

// Função para fazer login
// Recebe para login com e-mail e senha: { type, email, password }
// Recebe para login com OTP: { type, email } ou { type, email, otp }
// Retorna um JSON com a resposta da API do tipo SignInResponse e o status
export async function POST({ request }: RequestEvent): Promise<Response> {
	// Obtem dados do corpo da requisição
	let body
	try {
		body = await request.json()
	} catch {
		return json({ success: false, errors: [{ code: 'INVALID_JSON', message: 'O corpo da requisição não é um JSON válido.' }] } as SignInResponse, { status: 400 })
	}

	// TIPO DE LOGIN

	// Valida o tipo recebido
	let validatedTypeSchema
	try {
		validatedTypeSchema = typeSignInSchema.parse(body)
	} catch (err) {
		if (err instanceof z.ZodError) {
			return json({ success: false, errors: err.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message })) } as SignInResponse, { status: 400 })
		}
		return json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message: 'Erro na validação dos dados.' }] } as SignInResponse, { status: 400 })
	}

	// LOGIN COM E-MAIL E SENHA

	// Verifica se é do tipo login com e-mail e senha
	if (validatedTypeSchema.type === 'email') {
		// Valida os dados recebidos
		let validatedEmailSchema
		try {
			validatedEmailSchema = emailSignInSchema.parse(body)
		} catch (err) {
			if (err instanceof z.ZodError) {
				return json({ success: false, errors: err.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message })) } as SignInResponse, { status: 400 })
			}
			return json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message: 'Erro na validação dos dados.' }] } as SignInResponse, { status: 400 })
		}

		// Se o e-mail e a senha forem válidos
		if (validatedEmailSchema.email && validatedEmailSchema.password) {
			// Verifica se o e-mail não existe
			if (!(await checkIfUserEmailExists(validatedEmailSchema.email || ''))) {
				return json({ success: false, errors: [{ field: 'email', code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }] } as SignInResponse, { status: 400 })
			}

			// Chama a API para fazer login com e-mail e senha
			try {
				const api = await auth.api.signInEmail({
					returnHeaders: true,
					body: {
						email: validatedEmailSchema.email || '',
						password: validatedEmailSchema.password || ''
					}
				})

				// Verifica se a resposta contém erros
				if ('errors' in api.response) {
					return json({ success: false, errors: api.response.errors } as SignInResponse, { status: 400 })
				}

				// Caso a resposta contenha o 'user' e o 'token', então retorna com sucesso
				else if (api.response.user && api.response.token) {
					return json({ success: true, user: api.response.user, token: api.response.token, redirect: api.response.redirect, url: api.response.url } as SignInResponse, { status: 200 })
				}
			} catch (err) {
				const apiErrorCode = (err as { body?: { code?: string } })?.body?.code
				const errorMessage = apiErrorCode && errorCodes[apiErrorCode as keyof typeof errorCodes] ? errorCodes[apiErrorCode as keyof typeof errorCodes] : 'Erro inesperado no servidor.'

				return json({ success: false, errors: [{ code: apiErrorCode || 'INTERNAL_SERVER_ERROR', message: errorMessage }] } as SignInResponse, { status: 400 })
			}
		}
	}

	// LOGIN COM OTP

	// Verifica se é do tipo login com OTP
	else if (validatedTypeSchema.type === 'otp') {
		// Valida os dados recebidos
		let validatedOtpSchema
		try {
			validatedOtpSchema = otpSignInSchema.parse(body)
		} catch (err) {
			if (err instanceof z.ZodError) {
				return json({ success: false, errors: err.errors.map((e) => ({ field: String(e.path[0]), code: e.code, message: e.message })) } as SignInResponse, { status: 400 })
			}
			return json({ success: false, errors: [{ code: 'VALIDATION_ERROR', message: 'Erro na validação dos dados.' }] } as SignInResponse, { status: 400 })
		}

		// Verifica se o e-mail não existe
		if (!(await checkIfUserEmailExists(validatedOtpSchema.email || ''))) {
			return json({ success: false, errors: [{ field: 'email', code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }] } as SignInResponse, { status: 400 })
		}

		// ETAPA 1 DO OTP

		// Etapa 1: Se enviou apenas o email
		if (validatedOtpSchema.email && !validatedOtpSchema.otp) {
			// Chama a API para enviar OTP para o e-mail do usuário
			try {
				const api = await auth.api.sendVerificationOTP({
					returnHeaders: true,
					body: {
						email: validatedOtpSchema.email || '',
						type: 'sign-in'
					}
				})

				// Caso a resposta seja sucesso
				if (api.response.success) {
					return json({ success: true } as SignInResponse, { status: 200 })
				}

				// Caso a resposta não seja sucesso
				else {
					return json({ success: false, errors: [{ code: 'API_ERROR', message: 'Erro ao enviar o código OTP para o e-mail do usuário.' }] } as SignInResponse, { status: 400 })
				}
			} catch {
				return json({ success: false, errors: [{ code: 'API_ERROR', message: 'Erro ao enviar o código OTP para o e-mail do usuário.' }] } as SignInResponse, { status: 400 })
			}
		}

		// ETAPA 2 DO OTP

		// Etapa 2: Se enviou o email e o OTP
		else if (validatedOtpSchema.email && validatedOtpSchema.otp) {
			// Chama a API para fazer login com o OTP
			try {
				const api = await auth.api.signInEmailOTP({
					returnHeaders: true,
					body: {
						email: validatedOtpSchema.email || '',
						otp: validatedOtpSchema.otp || ''
					}
				})

				// Para debugar
				// console.log('api.response', api.response)

				// Verifica se a resposta contém erros
				if ('errors' in api.response) {
					return json({ success: false, errors: api.response.errors } as SignInResponse, { status: 400 })
				}

				// Caso a resposta contenha o 'user' e o 'token', então retorna com sucesso
				else if (api.response.user && api.response.token) {
					return json({ success: true, user: api.response.user, token: api.response.token } as SignInResponse, { status: 200 })
				}
			} catch {
				return json({ success: false, errors: [{ code: 'API_ERROR', message: 'Erro ao fazer login com o código OTP.' }] } as SignInResponse, { status: 400 })
			}
		}
	}

	return json({ success: false, errors: [{ code: 'UNKNOWN_ERROR', message: 'Erro desconhecido no servidor.' }] } as SignInResponse, { status: 500 })
}
```

15. Crie o arquivo 'src/routes/sign-in/+page.svelte' com o seguinte conteúdo:

```typescript
<script lang="ts">
	import { goto } from '$app/navigation'

	// Tipo de login: 'email', 'otp', 'social'
	let type = $state('email')

	// Dados para login por e-mail
	let email = $state('')
	let password = $state('')

	// Dados para login com OTP
	let stepOtp = $state(1)
	let otp = $state(null)

	// Carregando e erros
	let loading = $state(false)
	let errors: { field?: string; code: string; message: string }[] = $state([])

	// Mapeamento de campos para nomes amigáveis
	const fieldName: Record<string, string> = {
		name: 'Nome',
		email: 'E-mail',
		password: 'Senha'
	}

	// Login com e-mail e senha
	const handleSignInEmail = async () => {
		loading = true

		// Reseta a mensagem de erro antes de tentar fazer login novamente
		errors = []

		try {
			// Chama a API de login
			const response = await fetch('/api/auth/sign-in', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'email', email, password })
			})

			loading = false // Desativa o loading após a resposta da API

			const data = await response.json() // Resposta da API

			// Se foi feito o login
			if (response.ok && data.success) {
				// Redireciona para o dashboard
				goto('/app/dashboard')
			} else {
				// Se houve erros recebidos pela API
				if (data.errors) {
					errors = data.errors
				} else {
					errors = [{ code: 'UNKNOWN', message: 'Erro desconhecido ao fazer o login.' }]
				}
			}
		} catch (err) {
			console.error('Erro ao processar a resposta:', err)
			errors = [{ code: 'PROCCESS_ERROR', message: 'Erro ao processar a resposta da API.' }]
		}
	}

	// Login com OTP
	const handleSignInOtp = async () => {
		try {
			// Se for o passo 1 do OTP
			if (stepOtp === 1) {
				// Se preencheu o e-mail
				if (email) {
					loading = true
					errors = []

					// Chama a API de login
					const response = await fetch('/api/auth/sign-in', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ type: 'otp', email })
					})

					loading = false // Desativa o loading após a resposta da API

					const data = await response.json() // Resposta da API

					// Se foi enviado o OTP por e-mail
					if (response.ok && data.success) {
						// Avança para o passo 2 do OTP
						stepOtp = 2
						// Reseta a mensagem de erro antes de tentar fazer login novamente
						errors = []
					} else {
						// Se houve erros recebidos pela API
						if (data.errors) {
							errors = data.errors
						} else {
							errors = [{ code: 'UNKNOWN', message: 'Erro desconhecido ao fazer o login.' }]
						}
					}
				}
			}

			// Se for o passo 2 do OTP
			if (stepOtp === 2) {
				// Se preencheu o e-mail e o OTP
				if (email && otp) {
					loading = true
					errors = []

					// Chama a API de login
					const response = await fetch('/api/auth/sign-in', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ type: 'otp', email, otp })
					})

					loading = false // Desativa o loading após a resposta da API

					const data = await response.json() // Resposta da API

					// Se o OTP corresponder ao fornecido
					if (response.ok && data.success) {
						// Redireciona para o dashboard
						goto('/app/dashboard')
					} else {
						// Se houve erros recebidos pela API
						if (data.errors) {
							errors = data.errors
						} else {
							errors = [{ code: 'UNKNOWN', message: 'Erro desconhecido ao fazer o login.' }]
						}
					}
				}
			}
		} catch (err) {
			console.error('Erro ao processar a resposta:', err)
			errors = [{ code: 'PROCCESS_ERROR', message: 'Erro ao processar a resposta da API.' }]
		}
	}
</script>

<h1>Login</h1>

<!-- Exibição de erros globais -->
{#if errors.length > 0}
	<div>
		{#each errors as { field, message }}
			{#if !field}
				<!-- Erro geral, como 'Erro desconhecido' -->
				<p>Mensagem: {message}</p>
			{:else}
				<!-- Erro específico do campo -->
				<p>{fieldName[field] || field}: {message}</p>
			{/if}
		{/each}
	</div>
{/if}

<!-- Tipo de autenticação -->
<div>
	<p>Escolha a forma como deseja fazer login:</p>
	<select bind:value={type}>
		<option value="email">E-mail</option>
		<option value="otp">OTP</option>
		<option value="social">Social</option>
	</select>
</div>

{#if type === 'email'}
	<!-- Login por e-mail e senha -->
	<form onsubmit={handleSignInEmail}>
		<div>
			<p>Informe os dados abaixo para fazer o login.</p>
		</div>
		<div>
			<label>
				Email:
				<input type="email" bind:value={email} autocomplete="email" required />
			</label>
			{#each errors as { field, message }}
				{#if field === 'email'}
					<p class="error">{message}</p>
				{/if}
			{/each}
		</div>
		<div>
			<label>
				Senha:
				<input type="password" bind:value={password} autocomplete="new-password" required minlength="8" />
			</label>
			{#each errors as { field, message }}
				{#if field === 'password'}
					<p class="error">{message}</p>
				{/if}
			{/each}
		</div>
		<div>
			<button type="submit" disabled={loading}>
				{loading ? 'Entrando...' : 'Entrar'}
			</button>
		</div>
	</form>
{:else if type === 'otp'}
	<!-- Login por OTP -->
	{#if stepOtp === 1}
		<!-- Login por OTP: Etapa 1 (informar o e-mail) -->
		<form onsubmit={handleSignInOtp}>
			<div>
				<p>Informe o e-mail abaixo para fazer o login. Enviaremos um código por e-mail que deverá ser informado na próxima etapa.</p>
			</div>
			<div>
				<label>
					Email:
					<input type="email" bind:value={email} autocomplete="email" required />
				</label>
				{#each errors as { field, message }}
					{#if field === 'email'}
						<p class="error">{message}</p>
					{/if}
				{/each}
			</div>
			<div>
				<button type="submit" disabled={loading}>
					{loading ? 'Enviando código...' : 'Enviar código'}
				</button>
			</div>
		</form>
	{:else if stepOtp === 2}
		<!-- Login por OTP: Etapa 2 (informar o OTP) -->
		<form onsubmit={handleSignInOtp}>
			<div>
				<p>Informe o OTP abaixo para fazer o login.</p>
			</div>
			<div>
				<label>
					OTP:
					<input type="text" bind:value={otp} required />
				</label>
				{#each errors as { field, message }}
					{#if field === 'otp'}
						<p class="error">{message}</p>
					{/if}
				{/each}
			</div>
			<div>
				<button type="submit" disabled={loading}>
					{loading ? 'Entrando...' : 'Entrar'}
				</button>
			</div>
		</form>
	{/if}
{:else if type === 'social'}
	<div>Login social</div>
{/if}

<div>
	<p>Não possui uma conta? <a href="/sign-up">Crie uma agora</a></p>
</div>

<!--
	Usando @apply com módulos Vue, Svelte ou CSS
	https://tailwindcss.com/docs/upgrade-guide#using-apply-with-vue-svelte-or-css-modules
	Usar: @reference "../../app.css";
	Ou usar: var(--text-red-500);
-->
<style>
	@reference "../../../app.css";

	.error {
		@apply text-sm text-red-500;
	}
</style>
```
