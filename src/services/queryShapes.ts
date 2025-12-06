import { PAGE_SIZE } from "../config/searchConfig";

const variable = (value: string) => ({ termType: "Variable", value });
const namedNode = (value: string) => ({ termType: "NamedNode", value });

export const createResultCountShape = () => ({
  queryType: "SELECT",
  distinct: true,
  variables: [
    {
      expression: {
        expression: variable("id"),
        type: "aggregate",
        aggregation: "count",
        distinct: true,
      },
      variable: variable("cnt"),
    },
  ],
  where: [
    {
      type: "bgp",
      triples: [],
    },
  ],
  type: "query",
  prefixes: {},
});

export const createResultSubQueryShape = (offset: number) => ({
  queryType: "SELECT",
  distinct: true,
  variables: [variable("id")],
  where: [
    {
      type: "bgp",
      triples: [],
    },
  ],
  order: [
    {
      expression: variable("id"),
    },
  ],
  limit: PAGE_SIZE,
  offset,
});

export const createTextFacetFilter = (variableName: string, searchText: string) => ({
  type: "filter",
  expression: {
    type: "operation",
    operator: "contains",
    args: [
      {
        type: "operation",
        operator: "lcase",
        args: [variable(variableName)],
      },
      {
        termType: "Literal",
        value: searchText,
        language: "",
        datatype: namedNode("http://www.w3.org/2001/XMLSchema#string"),
      },
    ],
  },
});

export const createFirstFacetQueryShape = () => ({
  queryType: "SELECT",
  distinct: true,
  variables: [
    {
      expression: {
        expression: variable("id"),
        type: "aggregate",
        aggregation: "count",
        distinct: true,
      },
      variable: variable("cnt"),
    },
  ],
  where: [
    {
      type: "bgp",
      triples: [],
    },
  ],
  type: "query",
  prefixes: {},
});

export const createSecondFacetQueryShape = () => ({
  queryType: "SELECT",
  distinct: true,
  variables: [
    {
      expression: {
        expression: variable("cnt_id"),
        type: "aggregate",
        aggregation: "count",
        distinct: true,
      },
      variable: variable("cnt"),
    },
    variable("result"),
  ],
  where: [
    {
      type: "bgp",
      triples: [],
    },
  ],
  group: [
    {
      expression: variable("result"),
    },
  ],
  type: "query",
  prefixes: {},
});
