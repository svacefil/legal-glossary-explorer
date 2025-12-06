import { Generator } from "sparqljs";
import {
  CONSTRAINTS,
  ENDPOINT_URL,
  FACETS,
  PAGE_SIZE,
  RESULT_QUERY_TEMPLATE,
  SELECT_QUERY_TEMPLATE,
} from "../config/searchConfig";
import {
  createFirstFacetQueryShape,
  createResultCountShape,
  createResultSubQueryShape,
  createSecondFacetQueryShape,
  createTextFacetFilter,
} from "./queryShapes";
import type {
  FacetConfig,
  FacetState,
  TextFacetState,
} from "../types/sparql";

const variable = (value: string) => ({ termType: "Variable", value });
const namedNode = (value: string) => ({ termType: "NamedNode", value });

export type SearchFilters = {
  select: FacetState;
  text: TextFacetState;
};

type WhereBlock = { triples: any[] };

export class QueryBuilder {
  private readonly generator = new Generator();
  private readonly selectFacets: FacetConfig[];
  private readonly textFacets: FacetConfig[];

  constructor() {
    this.selectFacets = FACETS.filter((f) => f.kind === "select");
    this.textFacets = FACETS.filter((f) => f.kind === "text");
  }

  buildResultQuery(filters: SearchFilters, page: number): string {
    const offset = page * PAGE_SIZE;
    const resultJson = createResultSubQueryShape(offset);
    this.addConstraints(resultJson.where[0], "id");
    this.addSelectedFacets(resultJson.where[0], filters.select, "id");
    this.addTextFacets(resultJson, filters.text, "1", "id");
    const parsedQuery = this.generator.stringify(resultJson);
    return RESULT_QUERY_TEMPLATE.replace("<RESULT_SET>", parsedQuery);
  }

  buildResultCountQuery(filters: SearchFilters): string {
    const countJson = createResultCountShape();
    this.addConstraints(countJson.where[0], "id");
    this.addSelectedFacets(countJson.where[0], filters.select, "id");
    this.addTextFacets(countJson, filters.text, "1", "id");
    return this.generator.stringify(countJson);
  }

  buildFacetQueries(filters: SearchFilters): Record<string, string> {
    const queries: Record<string, string> = {};
    this.selectFacets.forEach((facet) => {
      const firstSubQuery = createFirstFacetQueryShape();
      this.addConstraints(firstSubQuery.where[0], "id");
      this.addSelectedFacets(firstSubQuery.where[0], filters.select, "id");
      this.addTextFacets(firstSubQuery, filters.text, "1", "id");
      const firstString = this.generator.stringify(firstSubQuery);

      const secondSubQuery = createSecondFacetQueryShape();
      this.addConstraints(secondSubQuery.where[0], "cnt_id");
      this.addSelectedFacets(
        secondSubQuery.where[0],
        filters.select,
        "cnt_id",
      );
      this.addFacetResultProjection(secondSubQuery.where[0], facet);
      this.addTextFacets(secondSubQuery, filters.text, "2", "cnt_id");
      const secondString = this.generator.stringify(secondSubQuery);

      const selectQuery = SELECT_QUERY_TEMPLATE.replace(
        "<RESULT_SET0>",
        firstString,
      ).replace("<RESULT_SET1>", secondString);

      queries[facet.id] = selectQuery;
    });
    return queries;
  }

  resultUrl(filters: SearchFilters, page: number): string {
    return this.asEndpointUrl(this.buildResultQuery(filters, page));
  }

  resultCountUrl(filters: SearchFilters): string {
    return this.asEndpointUrl(this.buildResultCountQuery(filters));
  }

  facetUrls(filters: SearchFilters): Record<string, string> {
    const queries = this.buildFacetQueries(filters);
    return Object.fromEntries(
      Object.entries(queries).map(([facetId, query]) => [
        facetId,
        this.asEndpointUrl(query),
      ]),
    );
  }

  private asEndpointUrl(query: string): string {
    return `${ENDPOINT_URL}?query=${encodeURIComponent(query)}&format=json`;
  }

  private addConstraints(where: WhereBlock, subjectName: string) {
    CONSTRAINTS.forEach((constraint) => {
      where.triples.push({
        subject: variable(subjectName),
        predicate: namedNode(constraint.predicate),
        object: namedNode(constraint.object),
      });
    });
  }

  private addSelectedFacets(
    where: WhereBlock,
    selects: FacetState,
    subjectName: string,
  ) {
    this.selectFacets.forEach((facet) => {
      const selectedValue = selects[facet.id];
      if (!selectedValue) {
        return;
      }
      where.triples.push({
        subject: variable(subjectName),
        predicate: namedNode(facet.predicate),
        object: namedNode(selectedValue),
      });
    });
  }

  private addTextFacets(
    structure: { where: any[] },
    textFacets: TextFacetState,
    suffix: string,
    subjectName: string,
  ) {
    this.textFacets.forEach((facet) => {
      const variableName = `${facet.id}${suffix}`;
      const whereBlock = structure.where[0];
      whereBlock.triples.push({
        subject: variable(subjectName),
        predicate: namedNode(facet.predicate),
        object: variable(variableName),
      });

      const filterText = textFacets[facet.id];
      if (filterText && filterText.trim().length > 0) {
        structure.where.push(
          createTextFacetFilter(variableName, filterText.trim().toLowerCase()),
        );
      }
    });
  }

  private addFacetResultProjection(where: WhereBlock, facet: FacetConfig) {
    where.triples.push({
      subject: variable("cnt_id"),
      predicate: namedNode(facet.predicate),
      object: variable("result"),
    });
  }
}
