# Tutorial de configuração do login com provedor social

Os provedores sociais abaixo são suficientes para o login com provedores sociais, alguns são os maiores detentores de sistemas operacionais (Google Android, Apple iOS, Microsoft Windows) existentes no mundo e cada usuário certamente possui uma conta em um desses provedores.

## Google

O [Better Auth](https://www.better-auth.com/) possui instruções de como [configurar a autenticação com o Google](https://www.better-auth.com/docs/authentication/google), entretanto não dá muitos detalhes.

Para usar o Google como um provedor social, você precisa obter suas credenciais do Google. Você pode obtê-las criando um novo projeto no [Google Cloud Console](https://console.cloud.google.com/apis/dashboard).

Para isso siga as seguintes etapas:

1. Dentro do [Google Cloud Console](https://console.cloud.google.com/apis/dashboard), clique no botão `Criar credenciais` e em seguida selecione `ID do cliente OAuth`.

2. Na tela a seguir, com o título `Criar ID do cliente do OAuth`, você deve selecionar o tipo de aplicativo. Selecione `Aplicativo da Web`. Depois dissom digite o nome como `Better Auth` (mas pode ser o nome que quiser, utilize um que identifique melhor o seu aplicativo).

3. Em URIs de redirecionamento autorizados, adicione a seguinte URL: `http://localhost:5173/api/auth/callback/google` (se estiver em ambiente de desenvolvimento).

4. Irá exibir um modal, com o título `Cliente OAuth criado`. Irá exibir o `ID do cliente` e a `Chave secreta do cliente`. Você irá precisar copiar ambos.

5. Retornando ao Visual Studio Code, no arquivo `.env`, você deverá colar o conteúdo do `ID do cliente` em `GOOGLE_CLIENT_ID`. E o conteúdo da `Chave secreta do cliente` em `GOOGLE_CLIENT_SECRET`.

6. Ao fechar o modal, você verá a credencial criada em `IDs do cliente OAuth 2.0`. Se quiser ver novamente o conteúdo do `ID do cliente` e da `Chave secreta do cliente`, clique no botão com o ícone `Editar cliente OAuth`.

7. E é isso. Agora já pode utilizar no projeto.

# Microsoft

O [Better Auth](https://www.better-auth.com/) possui instruções de como [configurar a autenticação com a Microsoft](https://www.better-auth.com/docs/authentication/microsoft).

Para usar a Microsoft como um provedor social, você precisa obter suas credenciais da Microsoft. O que envolve gerar seu próprio `Client ID` e `Client Secret` usando sua conta do painel do `Microsoft Entra ID`.

Habilitar o OAuth com o [Microsoft Azure Entra ID](https://www.microsoft.com/pt-br/security/business/identity-access/microsoft-entra-id) (o _Azure Active Directory_ agora é _Microsoft Entra ID_) pemitirá que seus usuários entrem e se inscrevam no seu aplicativo com suas contas da Microsoft.

Para saber como configurar com mais detalhes, acesse o [Guia rápido de como registrar um aplicativo na plataforma de identidade da Microsoft](https://learn.microsoft.com/pt-br/entra/identity-platform/quickstart-register-app) para saber mais.

A Microsoft realiza cobranças mensais para fazer autenticação, acesse [Planos e preços do Microsoft Entra](https://www.microsoft.com/pt-br/security/business/microsoft-entra-pricing) para saber mais detalhes.

Devido a realizar cobranças, a autenticação com a Microsoft **não será implementada**.

# Apple

O [Better Auth](https://www.better-auth.com/) possui instruções de como [configurar a autenticação com a Apple](https://www.better-auth.com/docs/authentication/apple).

Para usar o `Apple Sign In`, você precisa de um `Client ID` e um `Client Secret`. Você pode obtê-los no [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list).

A Apple exige uma configuração um pouco mais difícil para obter um segredo de cliente. Você pode usar o guia [Creating a client secret](https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret) para obter seu segredo de cliente.

Para criar uma conta Apple é necessário um dispositivo Apple. Devido a isso, a autenticação com a Apple **não será implementada** no momento.

# Facebook

O [Better Auth](https://www.better-auth.com/) possui instruções de como [configurar a autenticação com o Facebook](https://www.better-auth.com/docs/authentication/facebook).

Para usar o login do Facebook, você precisa de um _Client ID_ (denominado `ID do Aplicativo`) e um _Client Secret_ (denominado `Chave Secreta do Aplicativo`). Você pode obtê-los no [Portal do Desenvolvedor do Facebook](https://developers.facebook.com/).

Certifique-se de definir a URL de redirecionamento do desenvolvimento local para `http://localhost:5173/api/auth/callback/facebook`. Para produção, você deve defini-la para a URL do seu aplicativo. Se você alterar o caminho base das rotas de autenticação, você deve atualizar a URL de redirecionamento de acordo.

O login com o Facebook está apresentando erros com o código de erro `state_not_found`, que ainda não foi resolvido pelo Better Auth.

# Instagram

Para configurar o Instagram, verifique em [Outros provedores sociais](https://www.better-auth.com/docs/authentication/other-social-providers).
