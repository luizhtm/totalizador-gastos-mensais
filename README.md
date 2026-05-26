# Gastos Mensais

Aplicação estática para registrar, importar e totalizar gastos mensais diretamente no navegador.

## Stack

- HTML, CSS e JavaScript sem etapa de build obrigatória
- [Pico CSS](https://picocss.com/) via CDN
- Persistência em `localStorage`
- Testes com `node:test`
- Especificações com OpenSpec

## Funcionalidades

- Cadastro, edição, remoção e seleção em massa de gastos
- Total mensal e resumo por categoria
- Ordenação por item, categoria e valor
- Importação OFX com revisão antes de salvar
- Exportação e importação de backup em `.gastos.json`
- Alternância entre tema claro, escuro e automático
- Execução sem backend, login ou banco de dados

## Estrutura

```text
.
├── app-core.js
├── app.js
├── index.html
├── ofx-category-rules.js
├── styles.css
├── test/
└── openspec/
```

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Rode os testes:

```bash
npm test
```

Sirva os arquivos localmente:

```bash
python3 -m http.server 8080
```

## OpenSpec

Valide as especificações:

```bash
openspec validate --all --strict --no-interactive
```

## Deploy

O projeto é publicado como site estático no GitHub Pages. O workflow de deploy fica em `.github/workflows/pages.yml`.
