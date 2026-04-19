export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-brand-blue/30 selection:text-white">
      {children}
    </div>
  );
}
