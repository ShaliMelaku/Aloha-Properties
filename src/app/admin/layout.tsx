import { ThemeProvider } from "@/components/theme-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem 
      storageKey="aloha-hq-admin-theme"
    >
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-brand-blue/30 selection:text-white">
        {children}
      </div>
    </ThemeProvider>
  );
}
