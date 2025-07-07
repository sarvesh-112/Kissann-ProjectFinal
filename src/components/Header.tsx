import Image from 'next/image';

// You'll need to replace these with the actual paths to your logo files
import googleLogo from '@/assets/google-logo.png'; // Example path
import agenticAILogo from '@/assets/agentic-ai-logo.png'; // Example path

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center gap-4">
        <Image src={googleLogo} alt="Google Logo" width={80} height={30} />
        <Image src={agenticAILogo} alt="Agentic AI Logo" width={40} height={40} />
        <h1 className="font-bold text-xl">Procedural Prospectors</h1>
      </div>
      {/* You can add other header elements here like navigation */}
    </header>
  );
}
