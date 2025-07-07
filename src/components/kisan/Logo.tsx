import { Sprout } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Sprout className="h-7 w-7 text-sidebar-primary" />
      <h1 className="text-xl font-bold text-sidebar-foreground font-headline">
        Kisan Mitra
      </h1>
    </div>
  );
}
