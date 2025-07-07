import { Sprout } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Sprout className="h-7 w-7 text-white" />
      <h1 className="text-xl font-bold text-white">
        Project Kisan
      </h1>
    </div>
  );
}
