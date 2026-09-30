# Direção visual — Caderno Técnico

## Tema e propósito

O aplicativo é um banco de questões teóricas para avaliações de múltipla escolha. A tela deve lembrar uma mesa de trabalho organizada: material de estudo fácil de consultar, sem a linguagem visual de uma prova infantil ou de uma plataforma corporativa genérica.

## Movimento de design

Editorial acadêmico contemporâneo, com referências discretas a fichários, folhas pautadas e marcações feitas durante o estudo. A composição usa superfícies claras, linhas finas e pequenos índices de seção como em um caderno técnico.

## Princípios centrais

- Clareza antes de decoração: enunciado e alternativas são os elementos mais legíveis.
- Organização visual: espaço consistente, alinhamento e agrupamento simples.
- Tom acolhedor, sóbrio e humano, adequado a um trabalho acadêmico.
- Interface honesta: quando não existe configuração Firebase, dizer isso claramente e não apresentar dados temporários como se fossem gravados.
- Acessibilidade: contraste suficiente, estados com texto além de cor, controles identificáveis e comportamento responsivo.

## Filosofia de cor

- Azul-petróleo `#244B5A` como assinatura e ação principal: firmeza, confiança e foco.
- Âmbar `#D98E32` em marcações e destaques de baixa frequência: lembrete de marca-texto, sem competir com o conteúdo.
- Fundo de papel claro `#F6F4EE`, branco quente `#FFFEFA` para superfícies, tinta `#233238` para leitura e cinza-azulado para texto auxiliar.
- Linhas e bordas em `#D9E1DF`; estados de sucesso e erro usam cores semânticas com rótulos explícitos.

## Paradigma de layout

Área de trabalho ampla, com navegação lateral compacta em telas grandes e cabeçalho/atalhos recolhidos em telas pequenas. O conteúdo abre com um título de seção, contador simples e uma ação clara para adicionar questão. A lista usa cartões com separadores sutis e bom espaço de leitura; criação e edição usam um formulário em diálogo ou painel que mantém o contexto da coleção.

## Elementos de assinatura

- Símbolo original de um livro aberto com um pequeno marcador âmbar, em formas chapadas e legíveis.
- Guias de linha horizontal quase imperceptíveis, aplicadas a superfícies e pequenos rótulos, não como textura pesada.
- Etiquetas de assunto e número da questão como fichas de índice.
- Indicador de resposta correta com marcador simples, sempre acompanhado de rótulo ou contexto acessível.

## Interações e animação

A interface responde imediatamente a ações comuns, com transições breves de opacidade/posição. Erros de gravação desfazem o estado otimista e mostram mensagem clara. Excluir pede confirmação. Não há animação decorativa contínua nem efeitos que atrapalhem leitura.

## Tipografia

IBM Plex Sans para títulos, rótulos e texto de interface, em pesos 400–700. Números de questão e pequenos metadados podem usar IBM Plex Mono com parcimônia. Tamanhos adaptáveis e entrelinha confortável; evitar texto explicativo em caixa alta.

## Essência e voz de marca

Essência: “um caderno organizado para guardar e revisar boas perguntas”. Voz: direta, calma e encorajadora. Usar microtextos naturais em português (“Questões”, “Nova questão”, “Ainda não há questões”, “Conecte o Firebase para começar”) e evitar jargão desnecessário.

## Logotipo e assinatura

Nome de produto: **Banco de Questões**. O ícone é um livro aberto geométrico, em azul-petróleo e papel claro, com um único marcador âmbar. Não incluir texto no símbolo; usar o nome em IBM Plex Sans ao lado. O mesmo símbolo será usado no cabeçalho, favicon e ícone quadrado do projeto.
