import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({ width = 400, height = 100, className = "", priority = false }: LogoProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Light mode logo */}
      <Image 
        src="/logos/websiteMainLogoLight.png" 
        alt="Dealsletter Logo" 
        width={width}
        height={height}
        className="block dark:hidden w-full h-auto"
        priority={priority}
      />
      {/* Dark mode logo */}
      <Image 
        src="/logos/websiteMainLogo.png" 
        alt="Dealsletter Logo" 
        width={width}
        height={height}
        className="hidden dark:block w-full h-auto"
        priority={priority}
      />
    </div>
  );
}