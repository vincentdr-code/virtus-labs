"use client";
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-azure-bright text-xs hover:underline print:hidden"
    >
      Print / Save PDF
    </button>
  );
}
