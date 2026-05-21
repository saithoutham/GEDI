import { Link } from 'react-router-dom';

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export default function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <Link to="/" className={`inline-flex items-center ${className}`} aria-label="GEDI home">
      <img
        src="/gedi_logo/gedi-logo-transparent.png"
        alt="GEDI Global Early Detection Initiative"
        className={compact ? 'h-11 w-auto md:h-14' : 'h-16 w-auto md:h-20'}
      />
    </Link>
  );
}
