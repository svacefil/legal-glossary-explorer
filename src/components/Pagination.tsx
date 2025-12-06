type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const handlePrev = () => onChange(Math.max(0, page - 1));
  const handleNext = () => onChange(Math.min(totalPages - 1, page + 1));

  return (
    <div className="pagination">
      <button
        className="ghost-button"
        disabled={page === 0}
        onClick={handlePrev}
      >
        Previous
      </button>
      <span className="pagination__label">
        Page {page + 1} / {totalPages}
      </span>
      <button
        className="ghost-button"
        disabled={page + 1 >= totalPages}
        onClick={handleNext}
      >
        Next
      </button>
    </div>
  );
}
