<script lang="ts">
	// Página de verificação de e-mail

	// Etapa 1:

	// O usuário alterou seu e-mail na página de perfil (/app/profile).
	// O sistema enviou um e-mail para o e-mail atual que o usuário solicitou trocar, para confirmar a troca de e-mail.
	// O envio do e-mail foi configurado em 'auth.ts', 'user: { changeEmail: { sendVerificationEmail: ... } }'
	// O link configurado tem esse formato: ${env.BETTER_AUTH_URL}/verify-email?token=${token}

	// Quando o usuário receber o e-mail enviado, ele verá que contém um link que ele deve clicar.
	// Quando o usuário clicar no link, o sistema irá exibir esta página que você está vendo agora.

	// Etapa 2:

	// Verifica se o usuário está logado.
	// Caso o usuário esteja logado, ele será redirecionado para a página de perfil, onde verá o e-mail alterado.

	// Etapa 3:

	// Se o usuário não estiver logado, ele será redirecionado para a página de login.
	// O link para a página de login tem esse formato: /sign-in?redirectType=${redirectType}&redirectURL=${redirectURL}&token=${token}&callbackURL=${callbackURL}
	// Serão usados parâmetros para personalizar a experiência do usuário ao redirecionar para a página de login.
	// O usuário saberá que ele precisa fazer login para ver o e-mail alterado.

	// Etapa 4:

	// Quando o usuário fizer login novamente, ele precisará confirmar o e-mail novo com um token OTP.

	import { onMount } from 'svelte'
	import { authClient } from '$lib/auth-client'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'

	// Executa o código assim que a página for montada
	onMount(async () => {
		// Configurações iniciais
		const redirectType = 'verify-email'
		const redirectURL = '/api/auth/verify-email'
		const token = page.url.searchParams.get('token') ?? ''
		const callbackURL = '/app/profile'

		try {
			const { data: session } = await authClient.getSession()

			// Usuário logado
			if (session) {
				const redirectPage = `${redirectURL}?token=${token}&callbackURL=${callbackURL}`

				// Redireciona para a página da API que irá enviá-lo para a página de perfil
				goto(redirectPage)
				console.log('redirectPage', redirectPage)
			}

			// Usuário não logado
			else {
				const redirectPage = `/sign-in?redirectType=${redirectType}&redirectURL=${redirectURL}&token=${token}&callbackURL=${callbackURL}`

				// Redireciona para a página de login
				goto(`/sign-in?redirectType=verify-email&redirectURL=${redirectURL}&token=${token}&callbackURL=${callbackURL}`)
				console.log('redirectPage', redirectPage)
			}
		} catch (err) {
			console.error('Erro ao obter a sessão:', err)
			goto('/')
		}
	})
</script>
