import "./App.css";
import { FilterPanel } from "./components/FilterPanel";
import { Pagination } from "./components/Pagination";
import { ResultTable } from "./components/ResultTable";
import { useGlossarySearch } from "./hooks/useGlossarySearch";

function App() {
  const {
    bindings,
    facetOptions,
    selectFacets,
    textFacets,
    selectValues,
    textValues,
    loading,
    error,
    page,
    totalPages,
    setPage,
    setSelect,
    setText,
    resetFilters,
  } = useGlossarySearch();

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <p className="eyebrow">DBpedia Programming Languages</p>
          <h1>Explore languages by paradigm and creators</h1>
          <p className="lede">
            Query the DBpedia SPARQL endpoint to browse programming languages,
            filter by paradigm or developer, and scan abstracts and influences.
          </p>
        </div>
      </header>

      <main className="layout">
        <FilterPanel
          selectFacets={selectFacets}
          textFacets={textFacets}
          options={facetOptions}
          selectValues={selectValues}
          textValues={textValues}
          onSelectChange={setSelect}
          onTextChange={setText}
          onReset={resetFilters}
        />

        <section className="results">
          <div className="results__header">
            <div>
              <p className="eyebrow">Results</p>
              <h2>Programming languages</h2>
            </div>
            {loading && <span className="pill">Loading…</span>}
            {error && <span className="pill pill--error">{error}</span>}
          </div>

          <ResultTable bindings={bindings} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </section>
      </main>
    </div>
  );
}

export default App;
