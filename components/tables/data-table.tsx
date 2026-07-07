import { cn } from "@/lib/utils";

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="motion-card overflow-hidden rounded-[1.25rem] bg-[color:var(--panel)] shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[color:var(--panel-raised)] text-xs font-semibold text-[color:var(--muted)]">
            <tr>
              {columns.map((column) => (
                <th key={column} className="border-b border-[color:var(--border)]/45 px-4 py-3 font-black">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "transition-[background-color,box-shadow] duration-160 ease-[var(--ease-out-premium)] hover:bg-[color:var(--surface-soft)]/70",
                  rowIndex % 2 ? "bg-[color:var(--panel)]" : "bg-[color:var(--panel-raised)]/45",
                )}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-b border-[color:var(--border)]/35 px-4 py-3 align-middle">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
