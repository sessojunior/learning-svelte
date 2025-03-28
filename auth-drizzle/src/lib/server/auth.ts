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
		requireEmailVerification: false // Padrão: false. Habilitando requer que o usuário verifique seu e-mail antes de fazer login
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
