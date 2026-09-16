export default function CaptainBand({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-7 min-w-8 items-center justify-center px-1.5 text-xs font-black ${className}`}
      style={{
        background: "linear-gradient(180deg, #f8e7a0 0%, #d4af37 48%, #8a6d12 100%)",
        color: "#3b2a00",
        boxShadow: "0 2px 8px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.5)",
        border: "1px solid #f3e0a0",
        borderRadius: 3,
        transform: "skewX(-12deg)",
      }}
      title="Capitano"
    >
      <span style={{ transform: "skewX(12deg)" }}>C</span>
    </span>
  );
}
