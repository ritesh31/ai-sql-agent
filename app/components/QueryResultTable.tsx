type Props = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export function QueryResultTable({ columns, rows }: Props) {
  if (!rows.length) {
    return <p className="text-xs text-zinc-400 italic mt-1">No rows returned.</p>;
  }

  return (
    <div className="overflow-x-auto mt-2 rounded border border-zinc-200 dark:border-zinc-700">
      <table className="text-xs w-full">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-semibold text-zinc-600 dark:text-zinc-300 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-zinc-200 dark:border-zinc-700 odd:bg-white even:bg-zinc-50 dark:odd:bg-transparent dark:even:bg-zinc-800/30"
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-3 py-2 text-zinc-700 dark:text-zinc-200 whitespace-nowrap"
                >
                  {row[col] === null || row[col] === undefined ? (
                    <span className="text-zinc-400 italic">null</span>
                  ) : (
                    String(row[col])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
