import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({ width = 400, height = 100, className = "", priority = false }: LogoProps) {
  return (
    <div className="relative">
      {/* Light mode logo */}
      <Image 
        src="/logos/websiteMainLogoLight.png" 
        alt="DealLetter Logo" 
        width={width}
        height={height}
        className={`block dark:hidden ${className}`}
        priority={priority}
      />
      {/* Dark mode logo */}
      <Image 
        src="/logos/websiteMainLogo.png" 
        alt="DealLetter Logo" 
        width={width}
        height={height}
        className={`hidden dark:block ${className}`}
        priority={priority}
      />
    </div>
  );
}