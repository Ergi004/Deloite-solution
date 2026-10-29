import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-grain bg-ambient-glow relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="animate-scale-in relative w-full flex justify-center items-center z-10">
        {children}
      </div>
    </div>
  );
}
