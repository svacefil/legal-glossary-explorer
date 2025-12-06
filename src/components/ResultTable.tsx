import type { SparqlBinding } from "../types/sparql";

type Resource = { id: string; label?: string };

type LanguageRow = {
  id: string;
  label?: string;
  abstract?: string;
  released?: string;
  paradigms: Resource[];
  developers: Resource[];
  influences: Resource[];
};

type Props = {
  bindings: SparqlBinding[];
};

const uniqueById = (items: Resource[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const toLanguageRows = (bindings: SparqlBinding[]): LanguageRow[] => {
  const grouped: Record<string, SparqlBinding[]> = {};
  bindings.forEach((binding) => {
    const id = binding.id?.value;
    if (!id) return;
    grouped[id] = grouped[id] || [];
    grouped[id].push(binding);
  });

  return Object.values(grouped).map((group) => {
    const first = group[0];

    const buildResources = (
      idKey: string,
      labelKey: string,
    ): Resource[] => uniqueById(
      group
        .map((item) => item[idKey]?.value
          ? {
              id: item[idKey].value,
              label: item[labelKey]?.value,
            }
          : null)
        .filter(Boolean) as Resource[],
    );

    return {
      id: first.id?.value,
      label: first.label?.value,
      abstract: first.abstract?.value,
      released: first.released?.value,
      paradigms: buildResources("paradigm__id", "paradigm__label"),
      developers: buildResources("developer__id", "developer__label"),
      influences: buildResources("influence__id", "influence__label"),
    };
  });
};

const formatRelease = (released?: string) => {
  if (!released) return null;
  // DBpedia dates can be full timestamps; show just the year.
  const yearMatch = released.match(/\d{4}/);
  return yearMatch ? yearMatch[0] : released;
};

export function ResultTable({ bindings }: Props) {
  const languages = toLanguageRows(bindings);

  if (languages.length === 0) {
    return (
      <div className="empty-state">
        <p>No results for the selected filters.</p>
      </div>
    );
  }

  return (
    <table className="result-table">
      <thead>
        <tr>
          <th style={{ width: "22%" }}>Language</th>
          <th style={{ width: "56%" }}>Details</th>
          <th>DBpedia</th>
        </tr>
      </thead>
      <tbody>
        {languages.map((language) => (
          <tr key={language.id}>
            <td>
              {language.id && language.label ? (
                <a href={language.id} target="_blank" rel="noreferrer">
                  {language.label}
                </a>
              ) : (
                language.label || "—"
              )}
            </td>
            <td>
              {language.abstract && (
                <p className="definition">{language.abstract}</p>
              )}
              {formatRelease(language.released) && (
                <p>First released: {formatRelease(language.released)}</p>
              )}
              {language.paradigms.length > 0 && (
                <p>
                  Paradigms:{" "}
                  {language.paradigms.map((item, index) => (
                    <span key={item.id}>
                      <a href={item.id} target="_blank" rel="noreferrer">
                        {item.label || item.id}
                      </a>
                      {index < language.paradigms.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              )}
              {language.developers.length > 0 && (
                <p>
                  Developers:{" "}
                  {language.developers.map((item, index) => (
                    <span key={item.id}>
                      <a href={item.id} target="_blank" rel="noreferrer">
                        {item.label || item.id}
                      </a>
                      {index < language.developers.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              )}
              {language.influences.length > 0 && (
                <div>
                  <p>Influenced by:</p>
                  <ul>
                    {language.influences.map((relation) => (
                      <li key={relation.id}>
                        <a
                          href={relation.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {relation.label || relation.id}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </td>
            <td>
              {language.id ? (
                <a href={language.id} target="_blank" rel="noreferrer">
                  View on DBpedia
                </a>
              ) : (
                "—"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
