import { Link } from 'react-router-dom';

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export default function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <Link to="/" className={`inline-flex min-w-0 items-center ${className}`} aria-label="GEDI home">
      {compact ? (
        <>
          <img
            src="/gedi_logo/gedi-logo-purple-mark.svg"
            alt="GEDI"
            className="h-10 w-[84px] object-contain sm:hidden"
          />
          <img
            src="/gedi_logo/gedi-logo-purple.svg"
            alt="GEDI Global Early Detection Initiative"
            className="hidden h-11 max-w-[230px] object-contain sm:block md:h-14 md:max-w-[280px]"
          />
        </>
      ) : (
        <img
          src="/gedi_logo/gedi-logo-purple.svg"
          alt="GEDI Global Early Detection Initiative"
          className="h-14 max-w-[240px] object-contain sm:h-16 sm:max-w-[300px] md:h-20 md:max-w-[380px]"
        />
      )}
    </Link>
  );
}
