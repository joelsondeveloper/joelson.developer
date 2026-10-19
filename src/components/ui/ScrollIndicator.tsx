export function ScrollIndicator({ label = "ROLE PARA EXPLORAR" }: { label?: string }) {
  return (
    <div className="scroll-indicator" aria-hidden="true" data-entry>
      <svg viewBox="0 0 30 50" fill="none" className="scroll-mouse">
        <rect x="4" y="2" width="22" height="38" rx="11" />
        <path className="scroll-wheel" d="M15 10v8" strokeLinecap="round" />
        <circle cx="15" cy="33" r="1" fill="currentColor" stroke="none" />
      </svg>
      <span>{label}</span>
      <svg viewBox="0 0 20 12" fill="none" className="scroll-chevron"><path d="m4 3 6 6 6-6" /></svg>
    </div>
  );
}
