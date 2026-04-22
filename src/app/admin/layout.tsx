import { ScopedThemeProvider } from "@/components/scoped-theme-provider";
import { CurrencyProvider } from "@/context/currency-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScopedThemeProvider isAdmin={true}>
      <CurrencyProvider isAdmin={true}>
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-brand-blue/30 selection:text-white">
          {children}
        </div>
      </CurrencyProvider>
    </ScopedThemeProvider>
  );
}
