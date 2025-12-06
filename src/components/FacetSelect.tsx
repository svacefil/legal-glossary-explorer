import type { FacetConfig, FacetOption } from "../types/sparql";

type Props = {
  facet: FacetConfig;
  options: FacetOption[];
  value: string | null;
  onChange: (value: string | null) => void;
};

export function FacetSelect({ facet, options, value, onChange }: Props) {
  return (
    <label className="control">
      <span className="control__label">{facet.name}</span>
      <select
        className="control__input"
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : event.target.value)
        }
      >
        <option value="">Bez výběru</option>
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );
}
