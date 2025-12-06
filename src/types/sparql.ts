export type SparqlPrimitive = {
  type: string;
  value: string;
  "xml:lang"?: string;
  datatype?: string;
};

export type SparqlBinding = Record<string, SparqlPrimitive>;

export type SparqlResponse = {
  head: { vars: string[] };
  results: { bindings: SparqlBinding[] };
};

export type FacetKind = "select" | "text";

export type FacetConfig = {
  id: string;
  name: string;
  predicate: string;
  kind: FacetKind;
};

export type ConstraintConfig = {
  id: string;
  predicate: string;
  object: string;
};

export type FacetOption = {
  count: number;
  value: string;
  label: string;
};

export type FacetState = Record<string, string | null>;
export type TextFacetState = Record<string, string>;
