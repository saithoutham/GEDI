import { Link } from 'react-router-dom';

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export default function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <Link to="/" className={`inline-flex min-w-0 items-center ${className}`} aria-label="GEDI home">
      <img
        src="/gedi_logo/gedi-logo-purple.svg"
        alt="GEDI Global Early Detection Initiative"
        className={compact ? 'h-10 max-w-[190px] object-contain sm:h-11 sm:max-w-[230px] md:h-14 md:max-w-[260px]' : 'h-14 max-w-[240px] object-contain sm:h-16 sm:max-w-[280px] md:h-20 md:max-w-[345px]'}
      />
    </Link>
  );
}
