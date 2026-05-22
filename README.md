# Gastos Mensais

Aplicação estática para registrar e visualizar gastos mensais de forma simples, didática e fácil de publicar no GitHub Pages.

A ideia é ajudar a responder rapidamente: quanto foi gasto no mês, em quais categorias o dinheiro se concentrou e quais itens explicam melhor esse total.

## Stack

- HTML sem build step
- CSS próprio com [Pico CSS](https://picocss.com/) via CDN
- JavaScript puro
- Armazenamento local no navegador com `localStorage`

O Pico CSS entra como base visual leve para formulários, botões, tabelas e estados comuns, mantendo o projeto simples o bastante para funcionar em qualquer hospedagem estática, sem backend, banco de dados, login ou configuração de servidor.

## O que a aplicação faz

- Permite adicionar gastos mensais com nome do item, categoria, valor e descrição opcional.
- Mostra o total gasto no mês em destaque.
- Agrupa os gastos por categoria para facilitar a leitura.
- Lista os itens cadastrados de maneira clara, com opção de remover ou editar lançamentos.
- Mantém os dados salvos no próprio navegador.
- Permite filtrar ou trocar o mês de referência.
- Pode exportar um resumo simples para conferência ou compartilhamento.
- Permite exportar e importar os dados em um arquivo `.gastos.json`, para backup, migração entre máquinas ou guarda pessoal.
- Permite importar extratos OFX do banco, revisar os gastos extraídos e salvar vários itens de uma vez.

## Campos de um gasto

Cada gasto deve ser registrado com:

- `Nome`: produto, serviço, conta ou item comprado.
- `Categoria`: grupo principal do gasto, escolhido a partir de uma lista fixa.
- `Valor`: custo do item no mês.
- `Descrição`: observação curta e opcional para contextualizar o gasto.

## Categorias

A primeira versão deve trabalhar com categorias fixas para manter o resumo mensal consistente:

- Moradia
- Alimentação
- Transporte
- Saúde
- Educação
- Lazer
- Assinaturas
- Contas da casa
- Compras
- Cuidados pessoais
- Família
- Pets
- Viagens
- Impostos e taxas
- Outros

`Outros` deve servir para gastos que não se encaixam bem nas categorias principais.

## Arquivo de backup

A exportação de dados deve gerar um arquivo chamado `gastos.gastos.json`.

Apesar da extensão própria, o conteúdo deve ser JSON legível, para facilitar validação, manutenção e futuras migrações. O arquivo deve conter:

- versão do formato;
- data de exportação;
- lista de meses cadastrados;
- lista de gastos com nome, categoria, valor, descrição e mês de referência.

Na importação, a aplicação deve validar o formato antes de substituir ou mesclar os dados salvos no navegador.

## Experiência esperada

A tela principal deve ser objetiva e acolhedora, sem parecer uma planilha complicada. A prioridade é mostrar primeiro o total mensal e, logo em seguida, a distribuição por categoria.

O fluxo principal deve ter poucos passos:

1. Escolher ou confirmar o mês.
2. Informar o gasto.
3. Ver o total atualizado imediatamente.
4. Conferir a distribuição por categoria.

## Estrutura sugerida

```text
.
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Como rodar localmente

Por ser uma aplicação estática, basta servir os arquivos por HTTP local:

```bash
python3 -m http.server 8080
```

Depois acesse:

```text
http://localhost:8080
```

Também é possível usar qualquer servidor estático, como:

```bash
npx serve .
```

## Publicação no GitHub Pages

O projeto foi pensado para ser publicado diretamente pelo GitHub Pages.

Fluxo sugerido:

1. Criar um repositório no GitHub.
2. Enviar os arquivos estáticos para a branch `main`.
3. Ativar o GitHub Pages em `Settings > Pages`.
4. Selecionar `Deploy from a branch`.
5. Usar a branch `main` e a pasta `/root`.

## Direções de produto

Primeira versão:

- Cadastro, edição e remoção de gastos.
- Total mensal.
- Resumo por categoria.
- Persistência local.
- Importação e exportação em `.gastos.json`.
- Importação OFX com revisão antes de salvar.
- Layout responsivo para celular e desktop.

Possíveis evoluções:

- Gráficos simples por categoria.
- Comparação entre meses.
- Limite mensal por categoria.
- Importação e exportação em CSV.
- Compartilhamento de um resumo sem expor dados sensíveis.

## Observação

Este projeto não substitui uma ferramenta financeira completa. Ele é um totalizador leve para organizar gastos recorrentes e compras do mês com clareza, sem exigir cadastro ou configurações complexas.
