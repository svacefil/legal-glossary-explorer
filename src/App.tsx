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
          <p className="eyebrow">Srovnání právních pojmů</p>
          <h1>Jedno rozhraní, víc glosářů</h1>
          <p className="lede">
            Vyhledejte pojem napříč glosáři a porovnejte, jak se liší definice,
            typy i vztahy. Dotazy běží přímo proti SPARQL endpointu
            slovník.gov.cz.
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
              <p className="eyebrow">Výsledky</p>
              <h2>Glosářové záznamy</h2>
            </div>
            {loading && <span className="pill">Načítám…</span>}
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
