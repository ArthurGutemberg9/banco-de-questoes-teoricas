# Banco de Questões Teóricas

Um caderno digital para organizar perguntas de múltipla escolha usadas em avaliações teóricas. Dá para cadastrar, consultar, editar e excluir questões; cada uma pode ter um assunto, quatro alternativas e uma resposta marcada como gabarito.

A interface foi pensada como um caderno de estudo: fundo claro, azul-petróleo, detalhes em âmbar, fichas organizadas e texto fácil de ler. O layout se adapta a celular e computador.

## O que o aplicativo faz

- **Cadastra questões** com enunciado, assunto opcional, quatro alternativas e gabarito.
- **Consulta e atualiza a lista em tempo real** enquanto o Firestore estiver conectado.
- **Edita questões** sem alterar o usuário proprietário nem a data de criação.
- **Exclui questões** só depois de uma confirmação.
- **Busca por enunciado ou assunto** e filtra a coleção por assunto.
- **Protege os registros por usuário:** cada navegador recebe uma sessão anônima do Firebase, e as regras limitam o acesso às questões desse UID.
- **Não simula gravação:** enquanto a configuração real do Firebase estiver ausente, o app mostra um passo a passo e não permite afirmar que algo foi salvo.

## Tecnologias

React 19, TypeScript, Vite, Firebase Authentication (login anônimo) e Cloud Firestore. O SDK Firebase é carregado somente quando há configuração válida. O projeto não guarda questões em `localStorage` nem usa dados de exemplo como se fossem registros reais.

## Antes de começar

Você precisa de Node.js 22.12 ou superior, pnpm 11 e um projeto no [Firebase Console](https://console.firebase.google.com/).

### 1. Preparar o Firebase

1. Crie um projeto no Firebase e registre nele um aplicativo Web.
2. No Firebase Authentication, abra os métodos de login e **habilite Anônimo**.
3. Crie um banco do Cloud Firestore.
4. No console do Firestore, abra **Regras**, copie o conteúdo de [`firestore.rules`](./firestore.rules) e publique as regras.
5. Anote a configuração Web fornecida pelo Firebase: `apiKey`, `authDomain`, `projectId` e `appId`.

As regras usam o UID da sessão para que uma pessoa não leia, altere ou apague as questões de outra. Não substitua essas regras por `allow read, write: if true`.

### 2. Configurar e executar localmente

Na pasta do projeto, copie o exemplo de variáveis e preencha os quatro valores do **seu** aplicativo Web Firebase:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```dotenv
VITE_FIREBASE_API_KEY=valor-fornecido-pelo-firebase
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-project-id
VITE_FIREBASE_APP_ID=seu-app-id
```

Em seguida, instale e inicie:

```bash
pnpm install
pnpm dev
```

O Vite informa o endereço local no terminal. Para conferir a versão de produção:

```bash
pnpm build
```

O arquivo `.env.local` fica fora do Git. Os campos da configuração Web são identificadores usados no navegador, não substituem as regras do Firestore; o controle de acesso é feito pelas Security Rules.

### 3. Configurar uma publicação Web

Antes de gerar a versão publicada, cadastre `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` e `VITE_FIREBASE_APP_ID` nas variáveis de build do serviço de hospedagem e gere o build novamente. Depois, se necessário, inclua o domínio publicado entre os domínios autorizados do Firebase Authentication.

## Onde ficam os dados

As perguntas são salvas na coleção `questions` do Cloud Firestore. Cada documento contém:

| Campo | Conteúdo |
| --- | --- |
| `ownerUid` | UID do usuário anônimo autenticado no Firebase |
| `statement` | Enunciado da questão |
| `subject` | Assunto, que pode ficar vazio |
| `options` | Quatro alternativas, na ordem A–D |
| `correctOptionIndex` | Posição do gabarito, de 0 a 3 |
| `createdAt` | Horário de criação registrado pelo servidor |
| `updatedAt` | Horário da última atualização registrado pelo servidor |

A sessão anônima é mantida pelo Firebase Authentication naquele navegador. Se os dados do navegador forem apagados, pode não ser possível recuperar as questões associadas ao UID anterior; por isso, este projeto serve para a atividade e não substitui um fluxo de cadastro permanente.

## Estrutura principal

```text
src/
  components/        Formulário, cartões e confirmação de exclusão
  lib/               Inicialização do Firebase e operações do Firestore
  types/             Tipos e validação das questões
  App.tsx            Tela principal, filtros, estados e fluxo CRUD
  styles.css         Identidade visual responsiva
firestore.rules      Regras de acesso e formato dos documentos
.env.example         Modelo vazio de configuração
```

## Situação da conexão

Este repositório não contém credenciais de um projeto Firebase e não inclui registros de demonstração. Até que as variáveis reais sejam preenchidas e as regras publicadas, o aplicativo abre em modo de orientação. Depois da conexão, cadastros, alterações e exclusões passam a ser feitos diretamente no Firestore.

## Referências

As decisões de integração foram baseadas na documentação oficial do Firebase, listada em [`FIREBASE_SOURCES.md`](./FIREBASE_SOURCES.md): configuração de apps Web, autenticação anônima e regras do Cloud Firestore.
