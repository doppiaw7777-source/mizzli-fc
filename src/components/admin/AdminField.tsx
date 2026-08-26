export default function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium opacity-70">{label}</span>
      {children}
    </label>
  );
}
