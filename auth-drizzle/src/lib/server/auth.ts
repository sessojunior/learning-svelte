import { betterAuth } from 'better-auth'
import { genericOAuth, emailOTP } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { env } from '$env/dynamic/private'

import { db } from './db' // Não utilizar '$lib/server/db' se for usar o comando 'npx @better-auth/cli@latest generate', utilizar './db'.
// import * as schema from '../lib/server/db-schema' // Não utilizar '$lib/server/db-schema' se for usar o comando 'npx @better-auth/cli@latest generate', utilizar '../lib/server/db-schema'

import { sendEmail } from '../utils/email' // Não utilizar '$lib/server/utils/email' se for usar o comando 'npx @better-auth/cli@latest generate', utilizar '../utils/email'

// Cria uma instância do Better Auth e exporta como `auth`
export const auth = betterAuth({
	// Modifica o caminho base para a rota de API de autenticação manipulada em 'hooks.server.ts'.
	// Isso é importante caso venha a ser usado no futuro o manipulador de rotas `src/hooks.server.ts` junto com as funções do lado do cliente `auth-client.ts`
	// Se os arquivos `hooks.server.ts` e `auth-client.ts` não estiverem no projeto, podemos ignorar adicionar o 'basePath'
	basePath: '/api/auth', // Padrão: '/api/auth'. Para evitar interferências com as rotas de API próprias, utilize uma rota diferente de '/api/auth'
	// Configura o banco de dados a ser usado com o adaptador do Drizzle
	database: drizzleAdapter(db, {
		provider: 'sqlite', // Pode ser: 'mysql', 'pg', 'sqlite'
		// schema: {
		// 	...schema,
		// 	user: schema.users // Se o esquema mapeia a tabela 'user' como 'users'
		// },
		// Caso deseje que as tabelas sejam criadas com nomes no plural, defina 'usePlural' como 'true'
		usePlural: true
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
	// A rota de verificação de e-mail depende da existência do arquivo 'src/hooks.server.ts' e também depende
	// da configuração em basePath, neste arquivo '$lib/server/auth.ts'.
	// Deixar 'emailVerification' e 'sendVerificationEmail' comentado ou retirar do código caso utilize o código OTP
	// para fazer a verificação de e-mail.
	emailVerification: {
		// Para efetuar login automaticamente após ele verificar seu e-mail com sucesso, defina 'autoSignInAfterVerification' como 'true'
		autoSignInAfterVerification: true
		// Verificar e-mail utilizando um link de verificação, que somente irá funcionar na aba do navegador que está fazendo a solicitação
		// Se o link for aberto em outra aba, não irá funcionar, pois não corresponderá a sessão
		// sendVerificationEmail: async ({ user, url }) => {
		// 	// Enviar e-mail de verificação de e-mail
		// 	sendEmail({
		// 		to: user.email,
		// 		subject: 'Verificação de e-mail',
		// 		text: `Clique no link para verificar seu e-mail e confirmar sua conta: \n\n${url}`
		// 	})
		// }
	},
	// Autenticação por provedor social
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID as string,
			clientSecret: env.GOOGLE_CLIENT_SECRET as string
		}
		// microsoft: {
		// 	clientId: env.MICROSOFT_CLIENT_ID as string,
		// 	clientSecret: env.MICROSOFT_CLIENT_SECRET as string
		// },
		// apple: {
		// 	clientId: env.APPLE_CLIENT_ID as string,
		// 	clientSecret: env.APPLE_CLIENT_SECRET as string
		// },
		// facebook: {
		// 	clientId: env.FACEBOOK_CLIENT_ID as string,
		// 	clientSecret: env.FACEBOOK_CLIENT_SECRET as string
		// }
	},
	// Dados do usuário
	user: {
		changeEmail: {
			enabled: true // Padrão: false. Deixar como true para permitir que os usuários alterem seus e-mails
			// sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
			// 	// Para usuários com e-mail verificado, envia um e-mail de verificação com uma URL e um token
			// 	// Mas se o e-mail atual não estiver verificado, a alteração do e-mail ocorre sem enviar e-mail de verificação
			// 	await sendEmail({
			// 		to: newEmail,
			// 		subject: 'Aprove a alteração de e-mail',
			// 		text: `Clique no link a seguir para confirmar a alteração de seu e-mail: \n\n${url}`
			// 	})
			// 	console.log('user.email', user.email)
			// 	console.log('newEmail', newEmail)
			// 	console.log('token', token)
			// },
		}
	},
	// Dados da sessão
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
		// Generic OAuth
		genericOAuth({
			config: [
				{
					providerId: 'instagram', // Instagram
					clientId: env.INSTAGRAM_CLIENT_ID as string,
					clientSecret: env.INSTAGRAM_CLIENT_SECRET as string,
					authorizationUrl: 'https://api.instagram.com/oauth/authorize',
					tokenUrl: 'https://api.instagram.com/oauth/access_token',
					scopes: ['user_profile', 'user_media']
				}
			]
		}),
		// Email OTP
		emailOTP({
			// Opções
			otpLength: 6, // Padrão: 6. Quantidade de números que o OTP terá
			expiresIn: 300, // Padrão: 300 (5 minutos). Tempo de expiração do OTP em segundos
			disableSignUp: true, // Padrão: false. Se o usuário não estiver registrado, ele será registrado automaticamente. Deixar como true.
			sendVerificationOnSignUp: true, // Padrão: false. Envia OTP para o e-mail do usuário quando ele cria uma conta. Deixar como true.
			// Envia o OTP para o e-mail do usuário
			async sendVerificationOTP({ email, otp, type }) {
				// Enviar e-mail com o código OTP
				await sendEmail({
					to: email,
					subject: 'Código de verificação',
					text: `Utilize o seguinte código de verificação ${type === 'sign-in' ? 'para fazer login' : type === 'email-verification' ? 'para verificar seu e-mail' : type === 'forget-password' ? 'para recuperar sua senha' : 'a seguir'}: ${otp}`
				})
			}
		})
	]
})
