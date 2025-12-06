import type { SparqlBinding } from "../types/sparql";

type Resource = { id: string; label?: string };
type ConceptRow = {
  id: string;
  label?: string;
  definition?: string;
  glosar?: Resource;
  broader: Resource[];
  types: Resource[];
  relations: Resource[];
};

type Props = {
  bindings: SparqlBinding[];
};

const FALLBACK_GLOSSARY_URL =
  "https://slovník.gov.cz/datový/klasifikace/glosář";

const uniqueById = (items: Resource[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const toConceptRows = (bindings: SparqlBinding[]): ConceptRow[] => {
  const grouped: Record<string, SparqlBinding[]> = {};
  bindings.forEach((binding) => {
    const id = binding.id?.value;
    if (!id) return;
    grouped[id] = grouped[id] || [];
    grouped[id].push(binding);
  });

  return Object.values(grouped).map((group) => {
    const first = group[0];
    const broader = uniqueById(
      group
        .map((item) => item.nadtyp__id?.value && item.nadtyp__nazev?.value
          ? {
              id: item.nadtyp__id.value,
              label: item.nadtyp__nazev.value,
            }
          : null)
        .filter(Boolean) as Resource[],
    );

    const types = uniqueById(
      group
        .map((item) => item.typ__id?.value && item.typ__nazev?.value
          ? { id: item.typ__id.value, label: item.typ__nazev.value }
          : null)
        .filter(Boolean) as Resource[],
    );

    const relations = uniqueById(
      group
        .map((item) => item.typvztahu__id?.value && item.typvztahu__nazev?.value
          ? {
              id: item.typvztahu__id.value,
              label: item.typvztahu__nazev.value,
            }
          : null)
        .filter(Boolean) as Resource[],
    );

    const glosar =
      first.glosar__id?.value && first.glosar__nazev?.value
        ? {
            id: first.glosar__id.value,
            label: first.glosar__nazev.value,
          }
        : first.glosar__id?.value
          ? { id: first.glosar__id.value }
          : undefined;

    return {
      id: first.id?.value,
      label: first.nazev?.value,
      definition: first.definice?.value,
      glosar,
      broader,
      types,
      relations,
    };
  });
};

export function ResultTable({ bindings }: Props) {
  const concepts = toConceptRows(bindings);

  if (concepts.length === 0) {
    return (
      <div className="empty-state">
        <p>Žádné výsledky pro zvolený filtr.</p>
      </div>
    );
  }

  return (
    <table className="result-table">
      <thead>
        <tr>
          <th style={{ width: "22%" }}>Pojem</th>
          <th style={{ width: "56%" }}>Informace</th>
          <th>Glosář</th>
        </tr>
      </thead>
      <tbody>
        {concepts.map((concept) => (
          <tr key={concept.id}>
            <td>
              {concept.id && concept.label ? (
                <a href={concept.id} target="_blank" rel="noreferrer">
                  {concept.label}
                </a>
              ) : (
                concept.label || "—"
              )}
            </td>
            <td>
              {concept.definition && (
                <p className="definition">„{concept.definition}“</p>
              )}
              {concept.broader.length > 0 && (
                <p>
                  je specializací typu{" "}
                  {concept.broader.map((item, index) => (
                    <span key={item.id}>
                      <a href={item.id} target="_blank" rel="noreferrer">
                        {item.label || item.id}
                      </a>
                      {index < concept.broader.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              )}
              {concept.types.length > 0 && (
                <p>
                  je instancí{" "}
                  {concept.types.map((item, index) => (
                    <span key={item.id}>
                      <a href={item.id} target="_blank" rel="noreferrer">
                        {item.label || item.id}
                      </a>
                      {index < concept.types.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              )}
              {concept.relations.length > 0 && (
                <div>
                  <p>má vztahy typu</p>
                  <ul>
                    {concept.relations.map((relation) => (
                      <li key={relation.id}>
                        <a href={relation.id} target="_blank" rel="noreferrer">
                          {relation.label || relation.id}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </td>
            <td>
              <a
                href={concept.glosar?.id ?? FALLBACK_GLOSSARY_URL}
                target="_blank"
                rel="noreferrer"
              >
                {concept.glosar?.label ?? FALLBACK_GLOSSARY_URL}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
