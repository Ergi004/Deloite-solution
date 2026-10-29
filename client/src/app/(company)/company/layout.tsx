import { RequireRole } from '@/components/auth/require-role';
import { CompanyNav } from '@/components/layout/company-nav';
import { UserRole } from '@/types/enums';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role={UserRole.COMPANY_ADMIN}>
      <CompanyNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </RequireRole>
  );
}
