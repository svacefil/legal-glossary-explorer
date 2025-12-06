# DBpedia Programming Languages Explorer

A SPARQL-powered explorer for programming languages from DBpedia. It builds queries client-side (React + Vite + TypeScript), lets you filter by name text, paradigm, or developer, and shows abstracts, release info, paradigms, developers, and influences.

## Features
- Typed query-builder using `sparqljs` with DBpedia result and facet templates.
- Faceted filtering (text + select), server-driven select options with counts, and pagination.
- React + Vite + TypeScript with a small test suite (`vitest`) to guard query generation.
- Clear separation of concerns: config in `src/config`, data layer in `src/services`, view logic in `src/hooks`, and presentational components in `src/components`.

## Getting started
```bash
cd bcproject-modern
npm install
npm run dev
```

Useful scripts:
- `npm run build` – production build
- `npm run test` – vitest suite for the query builder
- `npm run lint` – ESLint

The app targets the DBpedia SPARQL endpoint and requires network access to load live data.

## Key files
- `src/config/searchConfig.ts` – endpoint URL, facet definitions, SPARQL templates, page size.
- `src/services/queryBuilder.ts` – builds SPARQL queries from the current filters.
- `src/services/queryExecutor.ts` – fetches bindings, counts, and facet options.
- `src/hooks/useGlossarySearch.ts` – orchestrates fetching and state for filters, results, and pagination.
- `src/components/*` – filter panel, table rendering, and pagination UI.
