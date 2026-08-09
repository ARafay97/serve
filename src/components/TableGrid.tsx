"use client";

interface Props {
  selected: number;
  setSelected: (table: number) => void;
}

const TABLE_COUNT = 12;

export default function TableGrid({ selected, setSelected }: Props) {
  const tables = Array.from({ length: TABLE_COUNT }, (_, i) => i + 1);

  return (
    <div className="table-grid">
      {tables.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setSelected(t)}
          className={`table-tile${selected === t ? " is-selected" : ""}`}
          aria-pressed={selected === t}
        >
          Table {t}
        </button>
      ))}
    </div>
  );
}
