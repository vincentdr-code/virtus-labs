"use client";
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-emerald-bright text-xs hover:underline print:hidden"
    >
      Print / Save PDF
    </button>
  );
}
