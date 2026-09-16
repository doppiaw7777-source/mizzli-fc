export default function CaptainBand({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-[14px] min-w-[22px] items-center justify-center px-1 text-[9px] font-black leading-none ${className}`}
      style={{
        background: "linear-gradient(180deg, #f8e7a0 0%, #d4af37 50%, #9a7418 100%)",
        color: "#3b2a00",
        boxShadow: "0 1px 4px rgba(0,0,0,.4)",
        border: "1px solid #f3e0a0",
        borderRadius: 2,
        transform: "skewX(-14deg)",
      }}
      title="Capitano"
    >
      <span style={{ transform: "skewX(14deg)" }}>C</span>
    </span>
  );
}
