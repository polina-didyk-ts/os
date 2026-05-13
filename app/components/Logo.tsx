export function Logo() {
  return (
    <div className="inline-flex items-center gap-2 hover:opacity-80 transition">
      <div className="w-8 h-8 bg-[#FFC600] rounded-lg flex items-center justify-center shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-[#141414]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      </div>
      <span className="font-bold text-lg text-foreground">ts-web-starter</span>
    </div>
  );
}
