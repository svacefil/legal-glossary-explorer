import type { ConstraintConfig, FacetConfig } from "../types/sparql";

export const ENDPOINT_URL = "https://xn--slovnk-7va.gov.cz/sparql";
export const PAGE_SIZE = 10;

export const FACETS: FacetConfig[] = [
  {
    id: "pojem",
    kind: "text",
    predicate: "http://www.w3.org/2004/02/skos/core#prefLabel",
    name: "Pojem",
  },
  {
    id: "glosar",
    kind: "select",
    predicate: "http://www.w3.org/2004/02/skos/core#inScheme",
    name: "Glosář",
  },
  {
    id: "typ",
    kind: "select",
    predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    name: "Typ",
  },
];

export const CONSTRAINTS: ConstraintConfig[] = [
  {
    id: "concept",
    predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    object: "http://www.w3.org/2004/02/skos/core#Concept",
  },
];

export const RESULT_QUERY_TEMPLATE = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX zs: <https://slovník.gov.cz/základní/pojem/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>

SELECT DISTINCT * WHERE
{
    {
        <RESULT_SET>
    }

    FILTER(BOUND(?id))
    ?id a skos:Concept .
    OPTIONAL
    {
        ?id skos:prefLabel ?nazev .
        FILTER(lang(?nazev)="cs")
    }
    OPTIONAL {
        ?id skos:definition ?definice .
        FILTER(lang(?definice)="cs")
    }
    OPTIONAL {
        ?id rdfs:subClassOf ?nadtyp__id .
        OPTIONAL {
            ?nadtyp__id skos:prefLabel ?nadtyp__nazev .
            FILTER(lang(?nadtyp__nazev) = "cs")
        }
        FILTER(?nadtyp__id not in (skos:Concept,owl:Class,owl:NamedIndividual,owl:ObjectProperty,owl:DataProperty,owl:AnnotationProperty))
        FILTER(isIri(?nadtyp__id))
    }
    OPTIONAL {
        ?id a ?typ__id .
        OPTIONAL
        {
            ?typ__id skos:prefLabel ?typ__nazev .
            FILTER(lang(?typ__nazev) = "cs")
        }
        FILTER(?typ__id not in (skos:Concept,owl:Class,owl:NamedIndividual,owl:ObjectProperty,owl:DataProperty,owl:AnnotationProperty))
        FILTER(isIri(?nadtyp__id))
        }
        OPTIONAL {
            ?typvlastnosti__id rdfs:subClassOf ?r2 .
            ?r2 (owl:allValuesFrom/(owl:unionOf/rdf:rest*/rdf:first)?) ?id .
            ?r2 owl:onProperty zs:je-vlastností .
            OPTIONAL
            {
                ?typvlastnosti__id skos:prefLabel ?typvlastnosti__nazev . FILTER(lang(?typvlastnosti__nazev) = "cs")
            }
        }
        OPTIONAL
        {
            ?typvztahu__id rdfs:subClassOf ?r1.
            ?r1 owl:onProperty zs:má-vztažený-prvek-1 .
            ?r1 (owl:allValuesFrom/(owl:unionOf/rdf:rest*/rdf:first)?) ?id .
            OPTIONAL
            {
                ?typvztahu__id skos:prefLabel ?typvztahu__nazev . FILTER(lang(?typvztahu__nazev) = "cs")
            }
        }
        OPTIONAL
        {
            ?id skos:inScheme ?glosar__id .
            OPTIONAL { ?glosar__id rdfs:label ?glosar__nazev .
            FILTER(lang(?glosar__nazev)="cs")}
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
   ?result <http://www.w3.org/2004/02/skos/core#prefLabel>
?enPref . FILTER(langMatches(lang(?enPref), "en")) . }
OPTIONAL{ ?result <http://www.w3.org/2000/01/rdf-schema#label>
?enLabel . FILTER(langMatches(lang(?enLabel), "en")) . }
OPTIONAL { ?result <http://www.w3.org/2004/02/skos/core#prefLabel>
?prefLabel . FILTER(langMatches(lang(?prefLabel), "")) . }
OPTIONAL { ?result <http://www.w3.org/2000/01/rdf-schema#label>
?label . FILTER(langMatches(lang(?label), "")) . }
BIND(COALESCE(?enPref, ?enLabel, ?prefLabel, ?label, "undefined label") AS ?facet_text)
    } LIMIT 10000
  }
}`;
