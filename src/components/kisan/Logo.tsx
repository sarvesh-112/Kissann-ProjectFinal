import { Sprout } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-sidebar-primary/10 p-2 rounded-lg">
        <Sprout className="h-6 w-6 text-sidebar-primary" />
      </div>
      <h1 className="text-xl font-bold text-sidebar-foreground font-headline">
        Kisan Mitra
      </h1>
    </div>
  );
}
