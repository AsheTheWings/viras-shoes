"use client";

export function LogoButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="absolute start-4 font-[family-name:var(--font-geist)] text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-80"
    >
      VIRAS
    </button>
  );
}
