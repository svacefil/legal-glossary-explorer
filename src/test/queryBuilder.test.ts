import { describe, expect, it } from "vitest";
import { QueryBuilder } from "../services/queryBuilder";
import { PAGE_SIZE } from "../config/searchConfig";

const builder = new QueryBuilder();

const decodeQuery = (url: string) => {
  const [, queryPart] = url.split("query=");
  const [encoded] = queryPart.split("&format=");
  return decodeURIComponent(encoded);
};

describe("QueryBuilder", () => {
  it("builds a result query with text and select filters", () => {
    const filters = {
      select: {
        paradigm: "http://dbpedia.org/resource/Functional_programming",
        developer: null,
      },
      text: {
        name: "Haskell",
      },
    };

    const query = decodeQuery(builder.resultUrl(filters, 0));

    expect(query).toContain(
      '<http://dbpedia.org/ontology/paradigm> <http://dbpedia.org/resource/Functional_programming>',
    );
    expect(query.toLowerCase()).toContain(
      `filter(contains(lcase(?name1), "haskell"))`,
    );
    expect(query).toContain(`LIMIT ${PAGE_SIZE}`);
  });

  it("builds facet queries for each select facet", () => {
    const filters = { select: { paradigm: null, developer: null }, text: { name: "" } };
    const facetUrls = builder.facetUrls(filters);
    expect(Object.keys(facetUrls)).toEqual(["paradigm", "developer"]);
    Object.values(facetUrls).forEach((url) => {
      const query = decodeQuery(url);
      expect(query).toContain("SELECT DISTINCT ?cnt ?result ?facet_text");
    });
  });
});
