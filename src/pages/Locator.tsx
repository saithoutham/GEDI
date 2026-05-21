import { Crosshair, ExternalLink, Loader2, MapPin, Navigation, Phone, SlidersHorizontal, Star } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { screenings, scripts, type CancerType } from '../lib/gedi';

const locatorFilterTypes = ['lung', 'breast', 'cervical', 'colorectal', 'prostate'] as const;
const locatorFilterLabels: Record<(typeof locatorFilterTypes)[number], string> = {
  lung: 'Lung',
  breast: 'Breast',
  cervical: 'Cervical',
  colorectal: 'Colon',
  prostate: 'Prostate',
};

type Facility = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  hours?: string;
  distanceMiles?: number;
  lat?: number;
  lng?: number;
  mapsUrl?: string;
  websiteUrl?: string;
  badges?: string[];
};

type DirectoryLink = {
  label: string;
  description: string;
  url: string;
};

type PlacesResponse = {
  mode: 'places' | 'directory';
  facilities: Facility[];
  fallbackLinks: DirectoryLink[];
};

type SearchGroup = {
  label: string;
  types: CancerType[];
  query: string;
  note: string;
};

export default function Locator() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const initialZip = searchParams.get('zip') ?? '';
  const queryTypes = parseCancerTypes(searchParams.get('types'));
  const initialCancer = queryTypes.length
    ? queryTypes
    : params.cancer && screenings[params.cancer as CancerType]
      ? [params.cancer as CancerType]
      : [];
  const [selected, setSelected] = useState<CancerType[]>(initialCancer);
  const [zip, setZip] = useState(initialZip);
  const [debouncedZip, setDebouncedZip] = useState(initialZip);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'ready' | 'blocked' | 'unavailable'>('idle');
  const [locationMessage, setLocationMessage] = useState('');
  const [radius, setRadius] = useState(25);
  const [data, setData] = useState<PlacesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const autoLocationRequested = useRef(false);
  const groups = useMemo(() => buildSearchGroups(selected), [selected]);

  const query = useMemo(() => selected.join(','), [selected]);
  const currentLat = coords?.lat;
  const currentLng = coords?.lng;
  const hasCoords = typeof currentLat === 'number' && typeof currentLng === 'number';
  const locationLabel = coords ? 'your current location' : debouncedZip.trim();
  const mapSearchUrl = useMemo(() => {
    const labels = groups[0]?.query || selected.map((type) => screenings[type].test).join(' OR ') || 'cancer screening';
    if (hasCoords) {
      return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${labels} near ${currentLat}, ${currentLng}`)}`;
    }
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${labels} near ${debouncedZip || 'me'}`)}`;
  }, [currentLat, currentLng, debouncedZip, groups, hasCoords, selected]);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setLocationMessage('Location is not available in this browser. Enter a ZIP or city instead.');
      return;
    }

    setLocationStatus('locating');
    setLocationMessage('Requesting your current location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setZip('');
        setDebouncedZip('');
        setLocationStatus('ready');
        setLocationMessage('Using your current location for nearby results.');
      },
      (error) => {
        setCoords(null);
        setLocationStatus(error.code === error.PERMISSION_DENIED ? 'blocked' : 'unavailable');
        setLocationMessage('Location access was not available. Enter a ZIP or city to list nearby centers.');
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedZip(zip.trim()), 450);
    return () => window.clearTimeout(timer);
  }, [zip]);

  useEffect(() => {
    if (initialZip) return;
    const timer = window.setTimeout(() => {
      if (autoLocationRequested.current) return;
      autoLocationRequested.current = true;
      requestCurrentLocation();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialZip, requestCurrentLocation]);

  useEffect(() => {
    if (!debouncedZip && !hasCoords) {
      const clearTimer = window.setTimeout(() => {
        setData({
          mode: 'directory',
          facilities: [],
          fallbackLinks: trustedClientLinks(selected, '', mapSearchUrl),
        });
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(clearTimer);
    }

    const controller = new AbortController();
    const loadingTimer = window.setTimeout(() => setLoading(true), 120);
    const params = new URLSearchParams({
      cancerTypes: query,
      radiusMiles: String(radius),
    });
    if (hasCoords) {
      params.set('lat', String(currentLat));
      params.set('lng', String(currentLng));
    } else if (debouncedZip) {
      params.set('zip', debouncedZip);
    }

    fetch(`/api/places?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<PlacesResponse>)
      .then((next) => setData(next))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setData({
          mode: 'directory',
          facilities: [],
          fallbackLinks: trustedClientLinks(selected, debouncedZip, mapSearchUrl),
        });
      })
      .finally(() => {
        window.clearTimeout(loadingTimer);
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [query, radius, debouncedZip, currentLat, currentLng, hasCoords, selected, mapSearchUrl]);

  function toggle(type: CancerType) {
    setSelected((prev) => {
      const next = prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type];
      return next;
    });
  }

  const facilities = data?.facilities ?? [];
  const links = data?.fallbackLinks?.length ? data.fallbackLinks : trustedClientLinks(selected, zip, mapSearchUrl);
  const hasLocation = Boolean(debouncedZip || coords);

  return (
    <section className="min-h-[calc(100vh-96px)]">
      <div className="border-b border-[var(--color-line)] bg-white">
        <div className="container-gedi py-8">
          <p className="eyebrow text-[var(--color-brand-primary)]">Locator</p>
          <h1 className="display-md mt-3 text-[var(--color-brand-aubergine)]">Find screening centers without losing the plan.</h1>
          <p className="mt-4 max-w-3xl leading-7 text-[var(--color-ink-muted)]">
            Search multiple screening types at once, then call with the right questions in front of you.
          </p>
        </div>
      </div>

      <div className="container-gedi space-y-6 py-8">
        <section className="card p-5 md:p-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[var(--color-brand-primary)]" aria-hidden="true" />
            <h2 className="font-black text-[var(--color-brand-aubergine)]">Filters</h2>
          </div>
          <div className="mt-5 grid gap-5">
            <fieldset>
              <legend className="font-bold text-[var(--color-brand-aubergine)]">Screening type</legend>
              <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2">
                {locatorFilterTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={selected.includes(type)}
                    aria-label={`Toggle ${screenings[type].shortName} screening`}
                    title={screenings[type].shortName}
                    onClick={() => toggle(type)}
                    className={`flex min-h-14 min-w-0 items-center justify-center rounded-2xl border px-3 py-2 text-center text-sm font-black leading-tight transition ${
                      selected.includes(type)
                        ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-aubergine)]'
                        : 'border-transparent bg-[var(--color-surface)] text-[var(--color-brand-aubergine)]'
                    }`}
                  >
                    <span className="block max-w-full whitespace-normal break-words">{locatorFilterLabels[type]}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
              <label className="block font-bold text-[var(--color-brand-aubergine)]">
                ZIP or city
                <input
                  value={zip}
                  onChange={(event) => {
                    setZip(event.target.value);
                    if (event.target.value.trim()) {
                      setCoords(null);
                      setLocationStatus('idle');
                      setLocationMessage('');
                    }
                  }}
                  placeholder="Enter ZIP or city"
                  className="mt-2 w-full rounded-2xl border border-[var(--color-line)] px-4 py-3"
                />
              </label>
              <button type="button" className="btn btn-secondary w-full" onClick={requestCurrentLocation} disabled={locationStatus === 'locating'}>
                {locationStatus === 'locating' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                {locationStatus === 'locating' ? 'Locating...' : 'Use my location'}
              </button>
            </div>
          </div>
          {locationMessage ? (
            <p className={`mt-4 rounded-2xl p-3 text-sm font-semibold ${locationStatus === 'ready' ? 'bg-[var(--color-brand-sage)] text-[var(--color-eligible-ink)]' : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)]'}`}>
              {locationMessage}
            </p>
          ) : null}
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.4fr_1fr] lg:items-center">
            <label className="block font-bold text-[var(--color-brand-aubergine)]">
              Within {radius} miles
              <input type="range" min={5} max={100} step={5} value={radius} onChange={(event) => setRadius(Number(event.target.value))} className="mt-3 w-full" />
            </label>
            <div className="rounded-3xl bg-[var(--color-surface)] p-4">
              <h3 className="font-black text-[var(--color-brand-aubergine)]">Search plan</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {groups.map((group) => (
                  <div key={group.label} className="rounded-2xl bg-white p-3">
                    <p className="text-sm font-black text-[var(--color-brand-aubergine)]">{group.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">{group.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <MapPanel facilities={facilities} selectedId={selectedFacility} onSelect={setSelectedFacility} mapSearchUrl={mapSearchUrl} zip={debouncedZip} coords={coords} />

        <section className="card p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[var(--color-brand-aubergine)]">Facilities</h2>
              {locationLabel ? <p className="mt-1 text-sm font-semibold text-[var(--color-ink-muted)]">Near {locationLabel}</p> : null}
            </div>
            <a href={mapSearchUrl} target="_blank" rel="noreferrer" className="btn btn-secondary min-h-10 px-4 text-sm">
              Open in OpenStreetMap <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {loading ? <p className="mt-4 rounded-2xl bg-[var(--color-surface)] p-4 font-semibold text-[var(--color-ink-muted)]">Searching OpenStreetMap...</p> : null}
          {!loading && facilities.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {facilities.map((facility, index) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  index={index + 1}
                  selected={selected}
                  active={selectedFacility === facility.id}
                  onSelect={() => setSelectedFacility(facility.id)}
                />
              ))}
            </div>
          ) : null}
          {!loading && !facilities.length && !hasLocation ? (
            <p className="mt-4 rounded-2xl bg-[var(--color-surface)] p-4 font-semibold text-[var(--color-ink-muted)]">
              Use your current location or enter a ZIP/city to load nearby hospitals, clinics, and screening centers.
            </p>
          ) : null}
          {!loading && !facilities.length && hasLocation ? (
            <DirectoryFallback links={links} mapSearchUrl={mapSearchUrl} selected={selected} />
          ) : null}
        </section>
      </div>
    </section>
  );
}

function FacilityCard({ facility, index, selected, active, onSelect }: { facility: Facility; index: number; selected: CancerType[]; active: boolean; onSelect: () => void }) {
  return (
    <article className={`rounded-3xl border p-5 ${active ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)]' : 'border-[var(--color-line)] bg-white'}`}>
      <button type="button" className="block w-full text-left" onClick={onSelect}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-aubergine)] text-xs font-black text-white">{index}</span>
              <h3 className="min-w-0 text-lg font-black leading-snug text-[var(--color-brand-aubergine)]">{facility.name}</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">{facility.address}</p>
          </div>
          {facility.distanceMiles ? <span className="rounded-full bg-[var(--color-brand-sage)] px-3 py-1 text-xs font-black text-[var(--color-eligible-ink)]">{facility.distanceMiles} mi</span> : null}
        </div>
      </button>
      <div className="mt-4 flex flex-wrap gap-2">
        {facility.rating ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-black">
            <Star className="h-3.5 w-3.5 fill-[var(--color-brand-amber)] text-[var(--color-brand-amber)]" />
            {facility.rating}
          </span>
        ) : null}
        {facility.hours ? <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-black">{facility.hours}</span> : null}
        {(facility.badges || []).map((badge) => (
          <span key={badge} className="rounded-full bg-[var(--color-brand-sky)] px-3 py-1 text-xs font-black text-[var(--color-brand-navy)]">{badge}</span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {facility.phone ? (
          <a href={`tel:${facility.phone.replace(/[^\d+]/g, '')}`} className="btn btn-secondary min-h-11 w-full px-4 text-sm sm:w-auto">
            <Phone className="h-4 w-4" />
            Call
          </a>
        ) : null}
        {facility.mapsUrl ? (
          <a href={facility.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary min-h-11 w-full px-4 text-sm sm:w-auto">
            <Navigation className="h-4 w-4" />
            Directions
          </a>
        ) : null}
        {facility.websiteUrl ? (
          <a href={facility.websiteUrl} target="_blank" rel="noreferrer" className="btn btn-secondary min-h-11 w-full px-4 text-sm sm:w-auto">
            Website
          </a>
        ) : null}
      </div>
      <CallScriptBlock selected={selected} />
    </article>
  );
}

function DirectoryFallback({ links, mapSearchUrl, selected }: { links: DirectoryLink[]; mapSearchUrl: string; selected: CancerType[] }) {
  return (
    <div className="mt-4 space-y-3">
      <a href={mapSearchUrl} target="_blank" rel="noreferrer" className="btn btn-primary w-full">
        Search map <ExternalLink className="h-4 w-4" />
      </a>
      {links.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="block rounded-3xl border border-[var(--color-line)] bg-white p-4 transition-transform hover:-translate-y-1">
          <span className="flex items-center justify-between gap-3 font-black text-[var(--color-brand-aubergine)]">
            {link.label}
            <ExternalLink className="h-4 w-4 shrink-0" />
          </span>
          <span className="mt-2 block text-sm leading-6 text-[var(--color-ink-muted)]">{link.description}</span>
        </a>
      ))}
      <CallScriptBlock selected={selected} />
    </div>
  );
}

function CallScriptBlock({ selected }: { selected: CancerType[] }) {
  const scriptTypes = selected.filter((type): type is keyof typeof scripts => type in scripts);
  if (!scriptTypes.length) return null;

  return (
    <details className="mt-4 rounded-3xl bg-[var(--color-surface)] p-4">
      <summary className="cursor-pointer font-black text-[var(--color-brand-aubergine)]">What to say when you call</summary>
      <div className="mt-4 space-y-4">
        {scriptTypes.map((type) => (
          <section key={type} className="rounded-2xl bg-white p-4">
            <h4 className="font-black text-[var(--color-brand-aubergine)]">{screenings[type].shortName}</h4>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--color-ink-muted)]">
              {scripts[type].map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </details>
  );
}

function MapPanel({
  facilities,
  selectedId,
  onSelect,
  mapSearchUrl,
  zip,
  coords,
}: {
  facilities: Facility[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mapSearchUrl: string;
  zip: string;
  coords: { lat: number; lng: number } | null;
}) {
  const mappedFacilities = facilities.filter((facility): facility is Facility & { lat: number; lng: number } => Boolean(facility.lat && facility.lng));
  const activeFacility = mappedFacilities.find((facility) => facility.id === selectedId) || mappedFacilities[0];

  return (
    <section className="card overflow-hidden">
      {mappedFacilities.length ? (
        <div>
          <LeafletFacilityMap facilities={mappedFacilities} activeId={activeFacility?.id} onSelect={onSelect} />
          <div className="border-t border-[var(--color-line)] bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-black text-[var(--color-brand-aubergine)]">Nearby results are labeled</h2>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Tap a number to match the map with the facility cards below.</p>
              </div>
              <a href={mapSearchUrl} target="_blank" rel="noreferrer" className="btn btn-primary shrink-0">
                Open in OpenStreetMap <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      ) : !zip && !coords ? (
        <MapPlaceholder mapSearchUrl={mapSearchUrl} />
      ) : (
        <div className="grid min-h-[520px] grid-rows-[1fr_auto]">
          <div className="relative min-h-[360px] overflow-hidden bg-[var(--color-brand-sky)]/25 sm:min-h-[460px]">
            <div className="absolute inset-0 opacity-50" aria-hidden="true">
              <div className="h-full w-full bg-[linear-gradient(90deg,rgba(23,59,94,0.12)_1px,transparent_1px),linear-gradient(rgba(23,59,94,0.12)_1px,transparent_1px)] bg-[size:56px_56px]" />
            </div>
            <div className="relative flex h-full min-h-[360px] items-center justify-center p-8 text-center sm:min-h-[460px]">
              <div>
                <MapPin className="mx-auto h-12 w-12 text-[var(--color-brand-primary)]" />
                <h2 className="display-md mt-5 text-[var(--color-brand-aubergine)]">No mapped facilities yet.</h2>
                <p className="mx-auto mt-4 max-w-xl leading-7 text-[var(--color-ink-muted)]">
                  GEDI is searching OpenStreetMap. Try a ZIP/city, use your location, or open a full OpenStreetMap search.
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--color-line)] bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-black text-[var(--color-brand-aubergine)]">OpenStreetMap search</h2>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Open the full map search while the facility list refreshes.</p>
              </div>
              <a href={mapSearchUrl} target="_blank" rel="noreferrer" className="btn btn-primary shrink-0">
                Open in OpenStreetMap <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function LeafletFacilityMap({
  facilities,
  activeId,
  onSelect,
}: {
  facilities: Array<Facility & { lat: number; lng: number }>;
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: false,
      touchZoom: true,
      zoomControl: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const bounds = L.latLngBounds(facilities.map((facility) => [facility.lat, facility.lng]));
    facilities.forEach((facility, index) => {
      const marker = L.marker([facility.lat, facility.lng], {
        icon: L.divIcon({
          className: '',
          html: `<span class="gedi-map-marker ${facility.id === activeId ? 'gedi-map-marker-active' : ''}">${index + 1}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
      }).addTo(map);
      const tooltip = document.createElement('span');
      tooltip.textContent = facility.name;
      marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -14], opacity: 0.95 });
      marker.on('click', () => onSelect(facility.id));
    });

    map.fitBounds(bounds.pad(0.18), {
      maxZoom: facilities.length === 1 ? 14 : 13,
      padding: [28, 28],
    });

    return () => {
      map.remove();
    };
  }, [activeId, facilities, onSelect]);

  return (
    <div className="bg-[var(--color-brand-sky)]/20 p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface-elevated)]">
        <div ref={mapRef} className="h-[340px] w-full sm:h-[470px]" aria-label="OpenStreetMap screening center map" />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[450] rounded-2xl bg-white/95 p-3 shadow-[var(--shadow-gedi)] sm:inset-x-4 sm:top-4">
          <p className="text-sm font-black text-[var(--color-brand-aubergine)]">OpenStreetMap results</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">Numbered markers match the facility cards below.</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility, index) => (
          <button
            key={facility.id}
            type="button"
            onClick={() => onSelect(facility.id)}
            className={`flex min-h-12 items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm font-bold ${
              activeId === facility.id
                ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-aubergine)]'
                : 'border-[var(--color-line)] bg-white text-[var(--color-brand-aubergine)]'
            }`}
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-aubergine)] text-xs text-white">{index + 1}</span>
            <span className="min-w-0">{facility.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MapPlaceholder({ mapSearchUrl }: { mapSearchUrl: string }) {
  return (
    <div className="relative flex h-full min-h-[620px] flex-col justify-between overflow-hidden bg-[var(--color-brand-sky)]/25 p-8">
      <div className="absolute inset-0 opacity-50" aria-hidden="true">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(23,59,94,0.12)_1px,transparent_1px),linear-gradient(rgba(23,59,94,0.12)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>
      <div className="relative max-w-xl">
        <MapPin className="h-12 w-12 text-[var(--color-brand-primary)]" />
        <h2 className="display-md mt-5 text-[var(--color-brand-aubergine)]">Enter a ZIP or city to center the search.</h2>
        <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">
          GEDI will group screenings that can share a facility, then split out the ones that need a different kind of center.
        </p>
      </div>
      <div className="relative rounded-3xl bg-white p-5 shadow-[var(--shadow-gedi)]">
        <p className="font-black text-[var(--color-brand-aubergine)]">Ready without a ZIP?</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">Open a live map search near your current location.</p>
        <a href={mapSearchUrl} target="_blank" rel="noreferrer" className="btn btn-primary mt-4">
          Open map search <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function parseCancerTypes(value: string | null): CancerType[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is CancerType => item in screenings);
}

function buildSearchGroups(selected: CancerType[]): SearchGroup[] {
  const groups: SearchGroup[] = [];
  const used = new Set<CancerType>();
  const has = (type: CancerType) => selected.includes(type);

  if (!selected.length) {
    return [
      {
        label: 'General screening access',
        types: [],
        query: 'hospital medical center primary care cancer screening',
        note: 'Select a screening type to narrow the list. Until then, GEDI shows nearby hospitals, primary care, and medical centers that can route you.',
      },
    ];
  }

  if (has('lung') || has('breast')) {
    const types = (['lung', 'breast'] as CancerType[]).filter(has);
    groups.push({
      label: types.length > 1 ? 'One imaging center may cover these' : `${screenings[types[0]].shortName} search`,
      types,
      query: types.length > 1 ? 'radiology imaging center mammography low dose CT lung cancer screening' : `${screenings[types[0]].test} center`,
      note: types.length > 1 ? 'LDCT and mammography are both radiology services, so GEDI tries imaging centers first.' : 'This screening is usually handled through an imaging or radiology center.',
    });
    types.forEach((type) => used.add(type));
  }

  if (has('cervical')) {
    groups.push({
      label: 'Cervical screening',
      types: ['cervical'],
      query: 'OBGYN cervical cancer screening HPV Pap test',
      note: 'Pap and HPV testing usually fit women’s health, OB-GYN, primary care, or community clinics.',
    });
    used.add('cervical');
  }

  if (has('colorectal')) {
    groups.push({
      label: 'Colorectal screening',
      types: ['colorectal'],
      query: 'gastroenterology colonoscopy colorectal cancer screening',
      note: 'Colonoscopy is usually a GI or endoscopy search; stool tests may start with primary care.',
    });
    used.add('colorectal');
  }

  if (has('prostate')) {
    groups.push({
      label: 'Prostate screening discussion',
      types: ['prostate'],
      query: 'primary care urology PSA prostate cancer screening',
      note: 'PSA screening starts as a clinician conversation; primary care or urology can handle it.',
    });
    used.add('prostate');
  }

  selected.filter((type) => !used.has(type)).forEach((type) => {
    groups.push({
      label: `${screenings[type].shortName} information`,
      types: [type],
      query: `${screenings[type].name} screening doctor`,
      note: 'This is risk-based or informational, so GEDI searches for the right clinician conversation rather than a routine screening center.',
    });
  });

  return groups;
}

function trustedClientLinks(selected: CancerType[], zip: string, mapSearchUrl: string): DirectoryLink[] {
  const links: DirectoryLink[] = [
    {
      label: 'OpenStreetMap screening search',
      description: zip ? `Search near ${zip}.` : 'Search near your current location.',
      url: mapSearchUrl,
    },
    {
      label: 'ACS screening finder',
      description: 'American Cancer Society screening location finder.',
      url: 'https://getscreened.cancer.org/',
    },
  ];
  if (selected.includes('lung')) {
    links.push({
      label: 'ACR lung screening locator',
      description: 'Find ACR-designated and LCSR-participating lung screening centers.',
      url: 'https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Screening-Resources/lung-cancer-resources/locator-tool',
    });
  }
  if (selected.includes('breast')) {
    links.push({
      label: 'FDA MQSA mammography search',
      description: 'Search FDA-certified mammography facilities by ZIP or state.',
      url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfMQSA/mqsa.cfm',
    });
  }
  if (selected.includes('breast') || selected.includes('cervical')) {
    links.push({
      label: 'CDC low-cost screening programs',
      description: 'Find breast and cervical screening support through CDC NBCCEDP.',
      url: 'https://www.cdc.gov/breast-cervical-cancer-screening/about/index.html',
    });
  }
  return links;
}
