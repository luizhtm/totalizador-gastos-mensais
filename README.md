# Totalizador de Gastos Mensais

Aplicacao estatica para registrar e visualizar gastos mensais de forma simples, didatica e facil de publicar no GitHub Pages.

A ideia e ajudar a responder rapidamente: quanto foi gasto no mes, em quais categorias o dinheiro se concentrou e quais itens explicam melhor esse total.

## Stack

- HTML sem build step
- CSS proprio com [Pico CSS](https://picocss.com/) via CDN
- JavaScript puro
- Armazenamento local no navegador com `localStorage`

O Pico CSS entra como base visual leve para formularios, botoes, tabelas e estados comuns, mantendo o projeto simples o bastante para funcionar em qualquer hospedagem estatica, sem backend, banco de dados, login ou configuracao de servidor.

## O que a aplicacao faz

- Permite adicionar gastos mensais com nome do item, categoria, valor e descricao opcional.
- Mostra o total gasto no mes em destaque.
- Agrupa os gastos por categoria para facilitar a leitura.
- Lista os itens cadastrados de maneira clara, com opcao de remover ou editar lancamentos.
- Mantem os dados salvos no proprio navegador.
- Permite filtrar ou trocar o mes de referencia.
- Pode exportar um resumo simples para conferencia ou compartilhamento.
- Permite exportar e importar os dados em um arquivo `.gastos.json`, para backup, migracao entre maquinas ou guarda pessoal.

## Campos de um gasto

Cada gasto deve ser registrado com:

- `Nome`: produto, servico, conta ou item comprado.
- `Categoria`: grupo principal do gasto, escolhido a partir de uma lista fixa.
- `Valor`: custo do item no mes.
- `Descricao`: observacao curta e opcional para contextualizar o gasto.

## Categorias

A primeira versao deve trabalhar com categorias fixas para manter o resumo mensal consistente:

- Moradia
- Alimentacao
- Transporte
- Saude
- Educacao
- Lazer
- Assinaturas
- Contas da casa
- Compras
- Cuidados pessoais
- Familia
- Pets
- Viagens
- Impostos e taxas
- Outros

`Outros` deve servir para gastos que nao se encaixam bem nas categorias principais.

## Arquivo de backup

A exportacao de dados deve gerar um arquivo chamado `gastos.gastos.json`.

Apesar da extensao propria, o conteudo deve ser JSON legivel, para facilitar validacao, manutencao e futuras migracoes. O arquivo deve conter:

- versao do formato;
- data de exportacao;
- lista de meses cadastrados;
- lista de gastos com nome, categoria, valor, descricao e mes de referencia.

Na importacao, a aplicacao deve validar o formato antes de substituir ou mesclar os dados salvos no navegador.

## Experiencia esperada

A tela principal deve ser objetiva e acolhedora, sem parecer uma planilha complicada. A prioridade e mostrar primeiro o total mensal e, logo em seguida, a distribuicao por categoria.

O fluxo principal deve ter poucos passos:

1. Escolher ou confirmar o mes.
2. Informar o gasto.
3. Ver o total atualizado imediatamente.
4. Conferir a distribuicao por categoria.

## Estrutura sugerida

```text
.
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Como rodar localmente

Por ser uma aplicacao estatica, basta servir os arquivos por HTTP local:

```bash
python3 -m http.server 8080
```

Depois acesse:

```text
http://localhost:8080
```

Tambem e possivel usar qualquer servidor estatico, como:

```bash
npx serve .
```

## Publicacao no GitHub Pages

O projeto foi pensado para ser publicado diretamente pelo GitHub Pages.

Fluxo sugerido:

1. Criar um repositorio no GitHub.
2. Enviar os arquivos estaticos para a branch `main`.
3. Ativar o GitHub Pages em `Settings > Pages`.
4. Selecionar `Deploy from a branch`.
5. Usar a branch `main` e a pasta `/root`.

## Direcoes de produto

Primeira versao:

- Cadastro, edicao e remocao de gastos.
- Total mensal.
- Resumo por categoria.
- Persistencia local.
- Importacao e exportacao em `.gastos.json`.
- Layout responsivo para celular e desktop.

Possiveis evolucoes:

- Graficos simples por categoria.
- Comparacao entre meses.
- Limite mensal por categoria.
- Importacao e exportacao em CSV.
- Compartilhamento de um resumo sem expor dados sensiveis.

## Observacao

Este projeto nao substitui uma ferramenta financeira completa. Ele e um totalizador leve para organizar gastos recorrentes e compras do mes com clareza, sem exigir cadastro ou configuracoes complexas.
