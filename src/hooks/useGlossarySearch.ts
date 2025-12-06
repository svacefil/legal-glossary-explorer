import { useEffect, useMemo, useState } from "react";
import { FACETS, PAGE_SIZE } from "../config/searchConfig";
import { QueryBuilder, type SearchFilters } from "../services/queryBuilder";
import { QueryExecutor } from "../services/queryExecutor";
import type {
  FacetConfig,
  FacetOption,
  FacetState,
  SparqlBinding,
  TextFacetState,
} from "../types/sparql";

type UseGlossarySearchResult = {
  bindings: SparqlBinding[];
  facetOptions: Record<string, FacetOption[]>;
  selectFacets: FacetConfig[];
  textFacets: FacetConfig[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  selectValues: FacetState;
  textValues: TextFacetState;
  setSelect: (facetId: string, value: string | null) => void;
  setText: (facetId: string, value: string) => void;
  resetFilters: () => void;
};

const buildInitialSelectState = (selectFacets: FacetConfig[]): FacetState =>
  Object.fromEntries(selectFacets.map((facet) => [facet.id, null]));

const buildInitialTextState = (textFacets: FacetConfig[]): TextFacetState =>
  Object.fromEntries(textFacets.map((facet) => [facet.id, ""]));

export function useGlossarySearch(): UseGlossarySearchResult {
  const selectFacets = useMemo(
    () => FACETS.filter((facet) => facet.kind === "select"),
    [],
  );
  const textFacets = useMemo(
    () => FACETS.filter((facet) => facet.kind === "text"),
    [],
  );

  const [selectState, setSelectState] = useState<FacetState>(() =>
    buildInitialSelectState(selectFacets),
  );
  const [textState, setTextState] = useState<TextFacetState>(() =>
    buildInitialTextState(textFacets),
  );
  const [bindings, setBindings] = useState<SparqlBinding[]>([]);
  const [facetOptions, setFacetOptions] = useState<
    Record<string, FacetOption[]>
  >({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters: SearchFilters = useMemo(
    () => ({
      select: selectState,
      text: textState,
    }),
    [selectState, textState],
  );

  const builder = useMemo(() => new QueryBuilder(), []);
  const executor = useMemo(() => new QueryExecutor(), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const [resultBindings, totalCount] = await Promise.all([
          executor.fetchBindings(builder.resultUrl(filters, page)),
          executor.fetchCount(builder.resultCountUrl(filters)),
        ]);
        if (!active) return;
        setBindings(resultBindings);
        const pages = Math.ceil(totalCount / PAGE_SIZE);
        setTotalPages(pages);
        if (pages > 0 && page >= pages) {
          setPage(pages - 1);
        }
      } catch (err) {
        if (!active) return;
        console.error(err);
        setError("Nepodařilo se načíst data ze SPARQL endpointu.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [builder, executor, filters, page]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const urls = builder.facetUrls(filters);
        const options = await executor.fetchFacetOptions(urls);
        if (active) {
          setFacetOptions(options);
        }
      } catch (err) {
        if (active) {
          console.error(err);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [builder, executor, filters]);

  const setSelect = (facetId: string, value: string | null) => {
    setSelectState((prev) => ({ ...prev, [facetId]: value }));
    setPage(0);
  };

  const setText = (facetId: string, value: string) => {
    setTextState((prev) => ({ ...prev, [facetId]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setSelectState(buildInitialSelectState(selectFacets));
    setTextState(buildInitialTextState(textFacets));
    setPage(0);
  };

  return {
    bindings,
    facetOptions,
    selectFacets,
    textFacets,
    loading,
    error,
    page,
    totalPages,
    selectValues: selectState,
    textValues: textState,
    setPage,
    setSelect,
    setText,
    resetFilters,
  };
}
