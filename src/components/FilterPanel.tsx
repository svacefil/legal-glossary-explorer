import type { FacetConfig, FacetOption } from "../types/sparql";
import { FacetSelect } from "./FacetSelect";
import { TextFacet } from "./TextFacet";

type Props = {
  selectFacets: FacetConfig[];
  textFacets: FacetConfig[];
  options: Record<string, FacetOption[]>;
  selectValues: Record<string, string | null>;
  textValues: Record<string, string>;
  onSelectChange: (facetId: string, value: string | null) => void;
  onTextChange: (facetId: string, value: string) => void;
  onReset: () => void;
};

export function FilterPanel({
  selectFacets,
  textFacets,
  options,
  selectValues,
  textValues,
  onSelectChange,
  onTextChange,
  onReset,
}: Props) {
  return (
    <aside className="filters">
      <div className="filters__header">
        <div>
          <p className="eyebrow">Filtry</p>
          <h2 className="filters__title">Zúžit hledání</h2>
        </div>
        <button className="ghost-button" onClick={onReset}>
          Vymazat
        </button>
      </div>
      <div className="filters__grid">
        {textFacets.map((facet) => (
          <TextFacet
            key={facet.id}
            facet={facet}
            value={textValues[facet.id] ?? ""}
            onChange={(value) => onTextChange(facet.id, value)}
          />
        ))}
        {selectFacets.map((facet) => (
          <FacetSelect
            key={facet.id}
            facet={facet}
            value={selectValues[facet.id] ?? null}
            onChange={(value) => onSelectChange(facet.id, value)}
            options={options[facet.id] ?? []}
          />
        ))}
      </div>
    </aside>
  );
}
