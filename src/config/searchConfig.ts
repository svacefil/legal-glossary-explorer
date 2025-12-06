import type { ConstraintConfig, FacetConfig } from "../types/sparql";

export const ENDPOINT_URL = "https://dbpedia.org/sparql";
export const PAGE_SIZE = 10;

export const FACETS: FacetConfig[] = [
  {
    id: "name",
    kind: "text",
    predicate: "http://www.w3.org/2000/01/rdf-schema#label",
    name: "Name",
  },
  {
    id: "paradigm",
    kind: "select",
    predicate: "http://dbpedia.org/ontology/paradigm",
    name: "Paradigm",
  },
  {
    id: "developer",
    kind: "select",
    predicate: "http://dbpedia.org/ontology/developer",
    name: "Developer",
  },
];

export const CONSTRAINTS: ConstraintConfig[] = [
  {
    id: "programmingLanguage",
    predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    object: "http://dbpedia.org/ontology/ProgrammingLanguage",
  },
];

export const RESULT_QUERY_TEMPLATE = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT * WHERE
{
    {
        <RESULT_SET>
    }

    FILTER(BOUND(?id))
    ?id a dbo:ProgrammingLanguage .
    OPTIONAL
    {
        ?id rdfs:label ?label .
        FILTER(lang(?label)="en")
    }
    OPTIONAL {
        ?id dbo:abstract ?abstract .
        FILTER(lang(?abstract)="en")
    }
    OPTIONAL {
        ?id dbo:paradigm ?paradigm__id .
        OPTIONAL {
            ?paradigm__id rdfs:label ?paradigm__label .
            FILTER(lang(?paradigm__label) = "en")
        }
    }
    OPTIONAL {
        ?id dbo:developer ?developer__id .
        OPTIONAL
        {
            ?developer__id rdfs:label ?developer__label .
            FILTER(lang(?developer__label) = "en")
        }
    }
    OPTIONAL
    {
        ?id dbo:influencedBy ?influence__id.
        OPTIONAL
        {
            ?influence__id rdfs:label ?influence__label . FILTER(lang(?influence__label) = "en")
        }
    }
    OPTIONAL {
        ?id dbo:released ?released .
    }
}`;

export const SELECT_QUERY_TEMPLATE = `SELECT DISTINCT ?cnt ?facet_text ?result WHERE{
  {
    {
      <RESULT_SET0>
    }
  BIND("" AS ?result)
  BIND("-- No Selection --" AS ?facet_text)}
  UNION
  {
    SELECT DISTINCT ?cnt ?result ?facet_text WHERE
    {
      {
        <RESULT_SET1>
      }
      FILTER(BOUND(?result))
      BIND(COALESCE(?result, <http://ldf.fi/NONEXISTENT_URI>) AS ?labelValue)
OPTIONAL
{ 
   ?result <http://www.w3.org/2000/01/rdf-schema#label>
?enPref . FILTER(langMatches(lang(?enPref), "en")) . }
OPTIONAL{ ?result <http://www.w3.org/2000/01/rdf-schema#label>
?enLabel . FILTER(langMatches(lang(?enLabel), "en")) . }
OPTIONAL { ?result <http://www.w3.org/2000/01/rdf-schema#label>
?prefLabel . FILTER(langMatches(lang(?prefLabel), "")) . }
OPTIONAL { ?result <http://www.w3.org/2000/01/rdf-schema#label>
?label . FILTER(langMatches(lang(?label), "")) . }
BIND(COALESCE(?enPref, ?enLabel, ?prefLabel, ?label, "undefined label") AS ?facet_text)
    } LIMIT 10000
  }
}`;
