/* eslint-disable @next/next/no-img-element */

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({ className = "", priority = false }: LogoProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Light mode logo */}
      <img
        src="/logos/websiteMainLogoLight.png"
        alt="Dealsletter Logo"
        className="block dark:hidden h-full w-auto max-h-full object-contain"
        {...(priority ? { fetchPriority: 'high' } : {})}
      />
      {/* Dark mode logo */}
      <img
        src="/logos/websiteMainLogo.png"
        alt="Dealsletter Logo"
        className="hidden dark:block h-full w-auto max-h-full object-contain"
        {...(priority ? { fetchPriority: 'high' } : {})}
      />
    </div>
  );
}