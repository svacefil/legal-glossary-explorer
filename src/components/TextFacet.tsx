import type { FacetConfig } from "../types/sparql";

type Props = {
  facet: FacetConfig;
  value: string;
  onChange: (value: string) => void;
};

export function TextFacet({ facet, value, onChange }: Props) {
  return (
    <label className="control">
      <span className="control__label">{facet.name}</span>
      <input
        className="control__input"
        type="search"
        placeholder="Search text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
