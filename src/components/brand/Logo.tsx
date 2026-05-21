import { Link } from 'react-router-dom';

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export default function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <Link to="/" className={`inline-flex min-w-0 items-center ${className}`} aria-label="GEDI home">
      <img
        src="/gedi_logo/gedi-logo-transparent.png"
        alt="GEDI Global Early Detection Initiative"
        className={compact ? 'h-10 max-w-[190px] object-contain sm:h-11 sm:max-w-[230px] md:h-14 md:max-w-none' : 'h-14 max-w-[230px] object-contain sm:h-16 md:h-20 md:max-w-none'}
      />
    </Link>
  );
}
