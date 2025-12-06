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
        glosar: "http://example.com/glossary",
        typ: null,
      },
      text: {
        pojem: "Budova",
      },
    };

    const query = decodeQuery(builder.resultUrl(filters, 0));

    expect(query).toContain(
      '<http://www.w3.org/2004/02/skos/core#inScheme> <http://example.com/glossary>',
    );
    expect(query.toLowerCase()).toContain(
      `filter(contains(lcase(?pojem1), "budova"))`,
    );
    expect(query).toContain(`LIMIT ${PAGE_SIZE}`);
  });

  it("builds facet queries for each select facet", () => {
    const filters = { select: { glosar: null, typ: null }, text: { pojem: "" } };
    const facetUrls = builder.facetUrls(filters);
    expect(Object.keys(facetUrls).length).toBeGreaterThan(0);
    Object.values(facetUrls).forEach((url) => {
      const query = decodeQuery(url);
      expect(query).toContain("SELECT DISTINCT ?cnt ?result ?facet_text");
    });
  });
});
