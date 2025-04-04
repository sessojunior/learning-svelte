# Autenticação com Drizzle, Better Auth e Sveltekit

Esse projeto utiliza o Better Auth para autenticação.

O projeto fornece suporte de autenticação integrado para:

- Criar conta de usuário
- Login usando código OTP
- Login com e-mail e senha
- Login com Google One Tap (implementação futura)
- Login social com Google e outros provedores
- Login com Passkey (implementação futura)
- Captcha (implementação futura)
- Recuperar e redefinir a senha
- Perfil do usuário com dados da sessão
- Alterar senha
- Alterar dados do usuário (nome, imagem de avatar)
- Alterar e-mail (associado a conta do usuário e/ou vinculado a um login social)
- Verificar e-mail

## Instalação

Para instalar e configurar, siga os passos abaixo:

1. Dependências:

Instale as seguintes dependências:

```bash
npm install better-auth nodemailer zod
npm install --save-dev @types/nodemailer
```

O `bether-auth` para autenticação, `nodemailer` para envio de e-mails e `zod` para validação de formulários e campos.

Para tratamento, manipulação e corte de imagens no servidor, como deixar uma imagem quadrada ou outros utilizei o [sharp](https://www.npmjs.com/package/sharp), que é uma biblioteca eficiente para manipulação de imagens.

```bash
npm install sharp
```

Essa biblioteca será usada no corte de imagens do perfil do usuário, em `src/routes/app/profile/+page.server.ts`.

## Arquivos

2. Arquivo `.env` e `.env.example`.

O arquivo `.env` irá manter as configurações de identificação e segredo, configurações de e-mail. O arquivo `.env.example` só servirá de modelo de inclusão das variáveis de ambiente.

3. Arquivo `drizzle.config.ts`.

Esse arquivo mantém as configurações do Drizzle ORM, indica onde fica o caminho do arquivo de _schema_ de criação do banco de dados, entre outras configurações.

4. Arquivo `src/lib/server/db.ts`.

É um arquivo que mantém a configuração do cliente do banco de dados SQLite ou Postgres.

5. Arquivo `src/hooks.server.ts`.

Esse arquivo irá manipular as rotas que o arquivo `src/lib/auth-client.ts` utilizará para algumas funções de autenticação, utilizando a API do Better Auth.

Também fará a proteção de rotas que estão dentro de `/app`, onde só será possível acessar se tiver feito o login.

6. Arquivo `src/lib/auth-client.ts`.

Esse arquivo será usado para interagir com a API de autenticação. Esse script irá tratar de criar os cookies e sessões e irá lidar com diversos plugins, como OTP e outros tipos de autenticação.

7. Arquivo `src/lib/server/auth.ts`.

Esse arquivo funciona como uma instância de autenticação e contém todas as configurações de como irá funcionar a autenticação, envio de e-mails, controle de sessões do usuário, envio de OTP e login social.

8. Geração de esquema do banco de dados.

Após ter configurado os plugins em `src/lib/server/auth.ts`, você já pode gerar o esquema do banco de dados.

Para gerar o esquema do banco de dados execute: `npx @better-auth/cli@latest generate`.

Após gerar o esquema, será criado automaticamente o arquivo `auth-schema.ts` na raiz do projeto.

Como estamos utilizando o Drizzle ORM, iremos utilizar o migrate do Drizzle ou push para aplicar as alterações.

Então, vamos copiar o conteúdo de `auth-schema.ts` e substituir todo o conteúdo de `src/lib/db-schema.ts`. Em seguida iremos apagar o `auth-schema.ts`.

Em seguida, criaremos o arquivo do banco de dados fazendo um push com o comando: `npm run db:push`.

9. Arquivo `src/routes/+page.svelte`.

É o arquivo que será exibido para os usuário ao acessar a página inicial.

10. Arquivo `src/routes/api/check-if-user-exists/+server.ts`.

Esse arquivo serve como uma rota de backend (https://localhost:5173/api/check-if-user-exists) onde se passa pelo body o e-mail para verificar se o usuário existe e retorna um JSON como resposta ({ exists: true | false }).

11. Arquivo `src/routes/(auth)/sign-up/+page.svelte`.

Arquivo que exibe a tela de criar conta para o usuário.

12. Arquivo `src/routes/(auth)/sign-in/+page.svelte`.

Arquivo que exibe a tela de login para o usuário.

13. Arquivo `src/routes/(auth)/forget-password/+page.svelte`.

Arquivo que exibe a tela de esqueceu a senha e redefinição de senha para o usuário.

14. Arquivo `src/routes/app/dashboard/+page.svelte`.

Arquivo que exibe a tela do painel após o login. É uma página privada, protegida por senha.

15. Arquivo `src/routes/app/profile/+page.svelte`.

Arquivo que exibe a tela de alteração dos dados de perfil (como nome e imagem) e alteração de senha.

## Configuração do login com provedor social

Os provedores sociais abaixo são suficientes para o login com provedores sociais, alguns são os maiores detentores de sistemas operacionais (Google Android, Apple iOS, Microsoft Windows) existentes no mundo e cada usuário certamente possui uma conta em um desses provedores.

### Google

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

### Microsoft

O [Better Auth](https://www.better-auth.com/) possui instruções de como [configurar a autenticação com a Microsoft](https://www.better-auth.com/docs/authentication/microsoft).

Para usar a Microsoft como um provedor social, você precisa obter suas credenciais da Microsoft. O que envolve gerar seu próprio `Client ID` e `Client Secret` usando sua conta do painel do `Microsoft Entra ID`.

Habilitar o OAuth com o [Microsoft Azure Entra ID](https://www.microsoft.com/pt-br/security/business/identity-access/microsoft-entra-id) (o _Azure Active Directory_ agora é _Microsoft Entra ID_) pemitirá que seus usuários entrem e se inscrevam no seu aplicativo com suas contas da Microsoft.

Para saber como configurar com mais detalhes, acesse o [Guia rápido de como registrar um aplicativo na plataforma de identidade da Microsoft](https://learn.microsoft.com/pt-br/entra/identity-platform/quickstart-register-app) para saber mais.

A Microsoft realiza cobranças mensais para fazer autenticação, acesse [Planos e preços do Microsoft Entra](https://www.microsoft.com/pt-br/security/business/microsoft-entra-pricing) para saber mais detalhes.

Devido a realizar cobranças, a autenticação com a Microsoft **não será implementada**.

### Apple

O [Better Auth](https://www.better-auth.com/) possui instruções de como [configurar a autenticação com a Apple](https://www.better-auth.com/docs/authentication/apple).

Para usar o `Apple Sign In`, você precisa de um `Client ID` e um `Client Secret`. Você pode obtê-los no [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list).

A Apple exige uma configuração um pouco mais difícil para obter um segredo de cliente. Você pode usar o guia [Creating a client secret](https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret) para obter seu segredo de cliente.

Para criar uma conta Apple é necessário um dispositivo Apple. Devido a isso, a autenticação com a Apple **não será implementada** no momento.

### Facebook

O [Better Auth](https://www.better-auth.com/) possui instruções de como [configurar a autenticação com o Facebook](https://www.better-auth.com/docs/authentication/facebook).

Para usar o login do Facebook, você precisa de um _Client ID_ (denominado `ID do Aplicativo`) e um _Client Secret_ (denominado `Chave Secreta do Aplicativo`). Você pode obtê-los no [Portal do Desenvolvedor do Facebook](https://developers.facebook.com/).

Certifique-se de definir a URL de redirecionamento do desenvolvimento local para `http://localhost:5173/api/auth/callback/facebook`. Para produção, você deve defini-la para a URL do seu aplicativo. Se você alterar o caminho base das rotas de autenticação, você deve atualizar a URL de redirecionamento de acordo.

O login com o Facebook está apresentando erros com o código de erro `state_not_found`, que ainda não foi resolvido pelo Better Auth.

### Instagram

Para configurar o Instagram, verifique em [Outros provedores sociais](https://www.better-auth.com/docs/authentication/other-social-providers).
