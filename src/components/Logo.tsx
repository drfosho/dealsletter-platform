import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({ width = 200, height = 50, className = "", priority = false }: LogoProps) {
  return (
    <div className={`relative ${className}`} style={{ lineHeight: 0 }}>
      {/* Light mode logo */}
      <Image
        src="/logos/websiteMainLogoLight.png"
        alt="Dealsletter Logo"
        width={width}
        height={height}
        className="block dark:hidden h-full w-auto"
        priority={priority}
      />
      {/* Dark mode logo */}
      <Image
        src="/logos/websiteMainLogo.png"
        alt="Dealsletter Logo"
        width={width}
        height={height}
        className="hidden dark:block h-full w-auto"
        priority={priority}
      />
    </div>
  );
}