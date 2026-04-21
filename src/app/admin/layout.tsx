import { ScopedThemeProvider } from "@/components/scoped-theme-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScopedThemeProvider isAdmin={true}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-brand-blue/30 selection:text-white">
        {children}
      </div>
    </ScopedThemeProvider>
  );
}
