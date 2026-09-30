# Plano de implementação — Banco de Questões Teóricas

## Escopo aprovado

Construir um aplicativo web responsivo em português para o tema individual **“Banco de Questões Teóricas: CRUD de perguntas de múltipla escolha para avaliações teóricas”**. O app terá identidade visual própria e permitirá cadastrar, consultar, editar e excluir perguntas. Os dados deverão ser persistidos no Firebase Firestore. A entrega inclui um README em português com a descrição e as instruções de configuração do Firebase e uma demonstração em vídeo fiel ao estado real do app e do banco.

O Blueprint aprovado define os seguintes comportamentos: cadastrar enunciado, alternativas e resposta correta; listar questões; editar esses campos; confirmar antes de excluir; validar o formulário e informar sucesso, erro e estado vazio em português; sincronizar com Firestore quando o Firebase for configurado; enquanto não houver configuração, explicar isso sem alegar que existe persistência real; documentar o esquema de dados e a configuração; só mostrar registros no console Firestore na demonstração depois de haver uma conexão real.

## Direção visual aprovada

**Caderno Técnico**: inspiração em folhas pautadas, fichários e marcações acadêmicas, com composição limpa e detalhes gráficos discretos; deve transmitir organização, estudo e clareza sem aspecto infantil. Cor principal `#244B5A`, cor de destaque `#D98E32` e família tipográfica IBM Plex Sans. Será criado um símbolo original simples para o projeto e usado também como favicon.

## Arquitetura

- Aplicação de página única feita com React, TypeScript e Vite, em português.
- Publicação como front-end estático (`dist/`) no site gerenciado da Manus. A interface é renderizada no navegador e usa o SDK Web modular do Firebase diretamente; não será habilitado o banco MySQL da Manus nem um servidor da Manus, pois isso não substituiria o Firestore exigido pela atividade.
- Os módulos de Auth e Firestore são carregados sob demanda depois que há configuração/sessão válida; sem Firebase, a tela informativa não baixa o SDK de banco.
- Uma rota de aplicação (`/`) declarada em `public/manus-routes.json`; assets servidos pelo build do Vite.
- Configuração pública do app Firebase fornecida por variáveis `VITE_FIREBASE_*`. Não colocar valores fictícios no app nem incluir valores reais em commits. O arquivo `.env.example` conterá apenas nomes de variáveis e valores vazios/placeholders.
- Firestore com coleção `questions`. Cada documento conterá `ownerUid`, `statement`, quatro `options`, `correctOptionIndex`, `subject` opcional e timestamps de criação/atualização.
- Para evitar regras abertas de leitura e escrita, o app usará autenticação anônima do Firebase sem formulário de cadastro; cada navegador anônimo verá e editará somente os próprios documentos. As regras correspondentes ficarão em `firestore.rules` e serão explicadas no README.
- Sem projeto Firebase (situação atual), o app exibirá um aviso de configuração claro e não usará armazenamento temporário que possa ser confundido com persistência. A integração será real assim que o proprietário criar o projeto, habilitar Firestore e login anônimo, publicar as regras e adicionar a configuração Web.

## Estrutura prevista

- `src/App.tsx`: composição da tela, estados de carregamento/erro/configuração e lista.
- `src/components/`: formulário/modal, cartão de questão, confirmação de exclusão e avisos.
- `src/lib/firebase.ts`: inicialização condicional do Firebase, Auth anônima e Firestore.
- `src/lib/questions.ts`: consultas e operações CRUD tipadas.
- `src/types/question.ts`: tipo e validações do documento.
- `src/styles.css`: tokens visuais e estilos responsivos.
- `public/manus-routes.json`, `public/favicon.svg` e assets da marca.
- `firestore.rules`, `.env.example`, `README.md`, `ideas.md` e este plano.

## Fluxos funcionais

1. O carregamento detecta se as variáveis Firebase necessárias existem; sem elas, mostra o aviso e instruções, sem habilitar um CRUD enganoso.
2. Com Firebase configurado, o app autentica anonimamente, escuta em tempo real as questões do UID atual e lista o resultado.
3. O formulário cria/edita questões com enunciado, assunto opcional, quatro alternativas preenchidas e escolha explícita da alternativa correta.
4. Exclusão requer confirmação. Erros de leitura/gravação aparecem em linguagem simples e não são apresentados como sucesso.
5. Regras Firestore restringem cada operação aos documentos cujo `ownerUid` é o UID autenticado; a consulta filtra pelo mesmo campo.

## Configuração e implantação

O comando de build será autocontido e produzirá `dist/index.html`; o domínio `build` do projeto apontará para `dist`. A equipe não habilitará publicação automática. O Firebase não será substituído por armazenamento local nem por um serviço Manus. O README dará um passo a passo para criar o projeto Firebase, registrar o app Web, ativar Firestore e autenticação anônima, configurar as regras, preencher as variáveis localmente e, para publicação, informar os valores públicos `VITE_FIREBASE_*` ao build e republicar.

## Verificação e entrega

Verificar o código com os diagnósticos TypeScript registrados pelo host, o comando de build definido no projeto, a coerência entre os tipos/queries/regras e a resposta HTTP de `manus-routes.json`. Fazer uma revisão independente das conexões entre interface, configuração Firebase, autenticação, regras, consulta por proprietário e operações CRUD.

Salvar o código no GitHub por meio do fluxo canônico de transferência do Webdev, que cria um repositório privado após a confirmação nativa do proprietário; não usar um segundo fluxo de `gh repo create`. Preparar o vídeo somente com fatos que possam ser demonstrados. **Não há projeto Firebase nem dados reais ainda**, portanto não será alegado que o app já grava no Firestore nem que uma gravação mostrando registros reais foi feita. A etapa final do vídeo depende de existir um projeto configurado; até lá, a interface e as instruções de conexão podem ser demonstradas, mas isso não satisfaz a parte de exibir registros reais.
