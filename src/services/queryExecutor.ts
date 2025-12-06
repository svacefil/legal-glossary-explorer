import type {
  FacetOption,
  SparqlBinding,
  SparqlResponse,
} from "../types/sparql";

export class QueryExecutor {
  async fetchBindings(url: string): Promise<SparqlBinding[]> {
    const response = await fetch(url, {
      headers: { Accept: "application/sparql-results+json" },
    });
    if (!response.ok) {
      throw new Error(`SPARQL endpoint responded with ${response.status}`);
    }
    const payload = (await response.json()) as SparqlResponse;
    return payload.results.bindings || [];
  }

  async fetchCount(url: string): Promise<number> {
    const bindings = await this.fetchBindings(url);
    const lastEntry = bindings[bindings.length - 1];
    if (!lastEntry || !lastEntry.cnt) {
      return 0;
    }
    const parsed = Number(lastEntry.cnt.value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  async fetchFacetOptions(
    facetUrls: Record<string, string>,
  ): Promise<Record<string, FacetOption[]>> {
    const entries = await Promise.all(
      Object.entries(facetUrls).map(async ([facetId, url]) => {
        try {
          const bindings = await this.fetchBindings(url);
          return [facetId, this.parseFacetOptions(bindings)] as const;
        } catch (error) {
          console.error(`Failed to load facet ${facetId}:`, error);
          return [facetId, []] as const;
        }
      }),
    );
    return Object.fromEntries(entries);
  }

  private parseFacetOptions(bindings: SparqlBinding[]): FacetOption[] {
    return bindings
      .map((binding) => {
        const value = binding.result?.value ?? "";
        const label = binding.facet_text?.value ?? value;
        const count = Number(binding.cnt?.value ?? 0);
        return { value, label, count };
      })
      .filter((item) => item.value);
  }
}
