import { AppShell } from "@/components/layout/app-shell";
import { DiagnosticProvider } from "@/context/diagnostic-context";
import { RouteProtect } from "@/components/auth/route-protect";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteProtect>
      <DiagnosticProvider>
        <AppShell>{children}</AppShell>
      </DiagnosticProvider>
    </RouteProtect>
  );
}
