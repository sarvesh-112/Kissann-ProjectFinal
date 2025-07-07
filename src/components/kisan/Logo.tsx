import { Sprout } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Sprout className="h-6 w-6 text-primary" />
      <h1 className="font-headline text-xl font-bold text-primary">
        Kisan Mitra
      </h1>
    </div>
  );
}
