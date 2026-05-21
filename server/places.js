import { inflateRawSync } from 'node:zlib';

const FDA_MQSA_ZIP_URL = 'https://www.accessdata.fda.gov/premarket/ftparea/public.zip';
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const OSM_USER_AGENT = 'GEDI-local-screening-locator/1.0 (https://www.alcsi.org/)';

let mqsaCache = {
  fetchedAt: 0,
  rows: [],
};

const cancerQueries = {
  lung: 'low dose CT lung cancer screening',
  breast: 'mammography center',
  cervical: 'OBGYN cervical cancer screening',
  colorectal: 'colonoscopy gastroenterology colorectal cancer screening',
  prostate: 'urology prostate cancer screening PSA',
};

export async function handlePlacesRequest(requestUrl) {
  const url = new URL(requestUrl, 'http://localhost');
  const cancerTypeParam = url.searchParams.get('cancerTypes');
  const cancerTypes = cancerTypeParam
    ? cancerTypeParam.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
  const radiusMiles = Number(url.searchParams.get('radiusMiles') || 25);
  const zip = (url.searchParams.get('zip') || '').trim();

  const fallbackLinks = trustedDirectoryLinks(cancerTypes, zip);
  const latParam = url.searchParams.get('lat');
  const lngParam = url.searchParams.get('lng');
  let lat = latParam === null ? NaN : Number(latParam);
  let lng = lngParam === null ? NaN : Number(lngParam);
  if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && zip) {
    const geocoded = await osmGeocode(zip);
    lat = geocoded?.lat ?? NaN;
    lng = geocoded?.lng ?? NaN;
  }

  const queries = buildSearchQueries(cancerTypes);

  if (!queries.length) {
    return {
      status: 200,
      body: { mode: 'directory', facilities: [], fallbackLinks },
    };
  }

  let facilities = [];

  if (!facilities.length && Number.isFinite(lat) && Number.isFinite(lng)) {
    facilities = await osmFacilitySearch(cancerTypes, queries, { lat, lng, radiusMiles, locationText: zip });
  }

  if (cancerTypes.includes('breast')) {
    facilities = await enrichMqsa(facilities, zip);
  }

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    facilities = facilities
      .map((facility) => ({
        ...facility,
        distanceMiles:
          facility.lat && facility.lng
            ? round(distanceMiles({ lat, lng }, { lat: facility.lat, lng: facility.lng }))
            : undefined,
      }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999));
  }

  return {
    status: 200,
    body: {
      mode: facilities.length ? 'places' : 'directory',
      facilities: facilities.slice(0, 18).map(publicFacility),
      fallbackLinks,
    },
  };
}

function publicFacility(facility) {
  const { score, searchText, zip, ...safeFacility } = facility;
  return safeFacility;
}

async function osmGeocode(location) {
  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set('q', `${location}, United States`);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'us');
  url.searchParams.set('limit', '1');

  try {
    const response = await fetch(url, { headers: osmHeaders() });
    if (!response.ok) return null;
    const data = await response.json();
    const first = data?.[0];
    return first ? { lat: Number(first.lat), lng: Number(first.lon) } : null;
  } catch {
    return null;
  }
}

async function osmFacilitySearch(cancerTypes, queries, { lat, lng, radiusMiles, locationText }) {
  const [overpassResults, namedResults] = await Promise.all([
    overpassHealthcareSearch({ lat, lng, radiusMiles }),
    nominatimFacilitiesForQueries(queries, { lat, lng, radiusMiles, locationText }),
  ]);

  const scored = dedupeFacilities([...namedResults, ...overpassResults])
    .map((facility) => ({
      ...facility,
      score: scoreFacility(facility, cancerTypes),
    }));

  const specificMatches = scored
    .filter((facility) => facility.score >= 12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  if (specificMatches.length >= 8) return specificMatches;

  const nearestCareOptions = scored
    .filter((facility) => isGeneralCareFacility(facility, cancerTypes))
    .map((facility) => ({
      ...facility,
      score: Math.max(facility.score, 12),
      badges: [...new Set([...(facility.badges || []), 'Nearest care option'])],
    }))
    .sort((a, b) => distanceMiles({ lat, lng }, a) - distanceMiles({ lat, lng }, b));

  return dedupeFacilities([...specificMatches, ...nearestCareOptions]).slice(0, 30);
}

async function overpassHealthcareSearch({ lat, lng, radiusMiles }) {
  const radiusMeters = Math.min(Math.max(radiusMiles * 1609.34, 5000), 25000);
  const query = `
    [out:json][timeout:18];
    (
      nwr(around:${radiusMeters},${lat},${lng})["amenity"~"^(hospital|clinic|doctors)$"];
      nwr(around:${radiusMeters},${lat},${lng})["healthcare"~"^(hospital|clinic|doctor|centre|diagnostic_centre|laboratory)$"];
      nwr(around:${radiusMeters},${lat},${lng})["healthcare:speciality"~"(radiology|oncology|pulmonology|gastroenterology|gynaecology|gynecology|urology|general)",i];
    );
    out center tags 120;
  `;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        ...osmHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({ data: query }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.elements || []).map(facilityFromOverpassElement).filter(Boolean);
  } catch {
    return [];
  }
}

async function nominatimFacilitiesForQueries(queries, options) {
  const facilities = [];
  for (const query of queries.slice(0, 5)) {
    facilities.push(...(await nominatimFacilitySearch(query, options)));
    await delay(250);
  }
  return facilities;
}

async function nominatimFacilitySearch(query, { lat, lng, radiusMiles, locationText }) {
  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set('q', locationText ? `${query} ${locationText}` : query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('countrycodes', 'us');
  url.searchParams.set('dedupe', '1');
  url.searchParams.set('limit', '8');

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const radiusLat = radiusMiles / 69;
    const radiusLng = radiusMiles / Math.max(20, 69 * Math.cos(toRad(lat)));
    url.searchParams.set('bounded', '1');
    url.searchParams.set('viewbox', [lng - radiusLng, lat + radiusLat, lng + radiusLng, lat - radiusLat].join(','));
  }

  try {
    const response = await fetch(url, { headers: osmHeaders() });
    if (!response.ok) return [];
    const data = await response.json();
    return (data || []).map(facilityFromNominatimResult).filter(Boolean);
  } catch {
    return [];
  }
}

function facilityFromOverpassElement(element) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  const name = tags.name || tags.operator || tags.brand;

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    address: formatOsmAddress(tags) || 'Address not listed in OpenStreetMap',
    phone: tags.phone || tags['contact:phone'] || '',
    lat,
    lng,
    mapsUrl: openStreetMapUrl(lat, lng),
    websiteUrl: tags.website || tags['contact:website'] || tags.url || '',
    badges: ['OpenStreetMap'],
    searchText: Object.values(tags).join(' '),
    zip: tags['addr:postcode'] || '',
  };
}

function facilityFromNominatimResult(result) {
  const lat = Number(result.lat);
  const lng = Number(result.lon);
  const name =
    result.namedetails?.name ||
    result.name ||
    result.address?.hospital ||
    result.address?.clinic ||
    result.address?.doctors ||
    result.display_name?.split(',')[0];

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const extratags = result.extratags || {};
  return {
    id: `nominatim-${result.osm_type}-${result.osm_id}`,
    name,
    address: result.display_name || 'Address not listed in OpenStreetMap',
    phone: extratags.phone || extratags['contact:phone'] || '',
    lat,
    lng,
    mapsUrl: openStreetMapUrl(lat, lng),
    websiteUrl: extratags.website || extratags['contact:website'] || '',
    badges: ['OpenStreetMap'],
    searchText: `${result.class || ''} ${result.type || ''} ${Object.values(extratags).join(' ')}`,
    zip: result.address?.postcode || '',
  };
}

function scoreFacility(facility, cancerTypes) {
  const text = normalize(`${facility.name} ${facility.address} ${facility.searchText || ''}`);
  const genericCare = /(hospital|medicalcenter|healthcenter|healthcarecenter|clinic|doctors|physicians|primarycare|familymedicine|communityhealth)/.test(text);
  const strongSystem = /(massachusettsgeneral|massgeneral|mgh|tuftsmedical|brigham|bethisrael|lahey|danafarber|cancercenter|medicalcenter)/.test(text);
  let score = genericCare ? 6 : 0;
  if (!cancerTypes.length && genericCare) score += 20;
  if (strongSystem) score += 14;

  const keywordGroups = {
    lung: /(lung|ldct|lowdose|computedtomography|ctscan|radiology|imaging|thoracic|pulmonary|pulmonology|cancer|oncology|hospital|medicalcenter)/,
    breast: /(breast|mammogram|mammography|mqsa|womens|radiology|imaging|cancer|oncology|hospital|medicalcenter)/,
    cervical: /(cervical|pap|hpv|obgyn|obstetric|gynecology|gynaecology|womens|plannedparenthood|familymedicine|primarycare|clinic)/,
    colorectal: /(colon|colorectal|colonoscopy|gastro|endoscopy|digestive|gi|cancer|oncology)/,
    prostate: /(prostate|psa|urology|urologic|primarycare|familymedicine|clinic|cancer|oncology)/,
    liver: /(liver|hepatology|gastro|ultrasound|radiology|imaging|clinic|hospital)/,
    skin: /(skin|dermatology|dermatologist|clinic|hospital)/,
    'oral-hpv': /(oral|ent|otolaryngology|headneck|dentist|dental|clinic|hospital)/,
  };

  cancerTypes.forEach((type) => {
    if (keywordGroups[type]?.test(text)) score += 16;
  });

  if (/(screening|diagnostic|center|centre|institute|department)/.test(text)) score += 5;
  if (/(radiology|imaging|mammography|oncology|cancercenter|pulmonary|pulmonology)/.test(text)) score += 16;
  if (/(mentalhealth|psychiatry|psychiatric|behavioral|counseling|psychology|plastic|cosmetic|aesthetic|facial|rejuvenation|eyelid|eyeplastic|spa|massage|pharmacy|veterinary|chiropractic|nursinghome|back|neck|vein|clinicalresearch|researchgroup|orthopedic|orthopaedic|integrative|physicaltherapy|healthinmotion)/.test(text)) score -= 80;
  if (!cancerTypes.includes('skin') && /(dermatology|dermatologist|skin)/.test(text)) score -= 60;
  if (/(children|childrens|pediatric|paediatric)/.test(text) && (!cancerTypes.length || cancerTypes.some((type) => ['lung', 'breast', 'prostate', 'colorectal'].includes(type)))) score -= 50;
  if (facility.address === 'Address not listed in OpenStreetMap') score -= 2;

  return score;
}

function isGeneralCareFacility(facility, cancerTypes) {
  const text = normalize(`${facility.name} ${facility.address} ${facility.searchText || ''}`);
  if (/(mentalhealth|psychiatry|psychiatric|behavioral|counseling|psychology|plastic|cosmetic|facial|rejuvenation|eyelid|eyeplastic|spa|massage|pharmacy|veterinary|chiropractic|nursinghome)/.test(text)) {
    return false;
  }
  if (/(back|neck|vein|clinicalresearch|researchgroup|orthopedic|orthopaedic|integrative|physicaltherapy|healthinmotion|aesthetic)/.test(text)) return false;
  if (!cancerTypes.includes('skin') && /(dermatology|dermatologist|skin)/.test(text)) return false;
  if (!cancerTypes.includes('cervical') && !cancerTypes.includes('breast') && /(childrens|children|pediatric|paediatric)/.test(text)) return false;
  return /(hospital|medicalcenter|healthcenter|healthcarecenter|clinic|doctors|physicians|primarycare|familymedicine|communityhealth|urgentcare)/.test(text);
}

function formatOsmAddress(tags) {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  const cityLine = [tags['addr:city'] || tags['addr:town'] || tags['addr:village'], tags['addr:state'], tags['addr:postcode']]
    .filter(Boolean)
    .join(', ');
  return [street, cityLine].filter(Boolean).join(', ');
}

function openStreetMapUrl(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

function osmHeaders() {
  return {
    'User-Agent': OSM_USER_AGENT,
    'Accept-Language': 'en-US,en',
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summarizeHours(hours) {
  if (!hours) return '';
  if (typeof hours.openNow === 'boolean') return hours.openNow ? 'Open now' : 'Closed now';
  return Array.isArray(hours.weekdayDescriptions) ? hours.weekdayDescriptions[0] : '';
}

function zipFromAddress(address) {
  const match = address.match(/\b\d{5}(?:-\d{4})?\b/);
  return match?.[0] || '';
}

function dedupeFacilities(facilities) {
  const seen = new Map();
  facilities.forEach((facility) => {
    const key = facility.id || `${facility.name}|${facility.address}`.toLowerCase();
    if (!seen.has(key)) seen.set(key, facility);
  });
  return [...seen.values()];
}

async function enrichMqsa(facilities, zip) {
  const rows = await mqsaRows();
  if (!rows.length) return facilities;
  const zipPrefix = zip ? zip.slice(0, 3) : '';

  return facilities.map((facility) => {
    const facilityZip = facility.zip || zipFromAddress(facility.address);
    const match = rows.find((row) => {
      if (zipPrefix && !row.zip.startsWith(zipPrefix) && !facilityZip.startsWith(row.zip.slice(0, 5))) return false;
      return normalize(row.name).includes(normalize(facility.name).slice(0, 14)) ||
        normalize(facility.name).includes(normalize(row.name).slice(0, 14));
    });
    return match
      ? {
          ...facility,
          phone: facility.phone || match.phone,
          badges: [...new Set([...(facility.badges || []), 'FDA MQSA certified'])],
        }
      : facility;
  });
}

async function mqsaRows() {
  const fresh = Date.now() - mqsaCache.fetchedAt < 24 * 60 * 60 * 1000;
  if (fresh) return mqsaCache.rows;
  try {
    const response = await fetch(FDA_MQSA_ZIP_URL);
    if (!response.ok) return mqsaCache.rows;
    const buffer = Buffer.from(await response.arrayBuffer());
    const files = unzipStore(buffer);
    const text = files.find((file) => /public/i.test(file.name) || /\.txt$/i.test(file.name))?.content || '';
    const rows = parseMqsaText(text);
    mqsaCache = { fetchedAt: Date.now(), rows };
    return rows;
  } catch {
    return mqsaCache.rows;
  }
}

function parseMqsaText(text) {
  return text
    .split(/\r?\n/)
    .map((line) => ({
      name: line.slice(0, 75).trim(),
      address: line.slice(75, 125).trim(),
      city: line.slice(225, 275).trim(),
      state: line.slice(275, 277).trim(),
      zip: line.slice(277, 292).trim(),
      phone: line.slice(292, 342).trim(),
    }))
    .filter((row) => row.name && row.zip);
}

function unzipStore(buffer) {
  const files = [];
  let offset = 0;
  while (offset < buffer.length - 30) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) break;
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + fileNameLength + extraLength;
    const name = buffer.toString('utf8', nameStart, nameStart + fileNameLength);
    const data = buffer.subarray(dataStart, dataStart + compressedSize);
    if (method === 0) files.push({ name, content: data.toString('utf8') });
    if (method === 8) files.push({ name, content: inflateRawSync(data).toString('utf8') });
    offset = dataStart + compressedSize;
  }
  return files;
}

function trustedDirectoryLinks(cancerTypes, zip) {
  const location = zip ? ` near ${zip}` : ' near me';
  const searchText = cancerTypes.length
    ? cancerTypes.map((type) => cancerQueries[type] || `${type} cancer screening`).join(' OR ')
    : 'hospital medical center primary care cancer screening';
  const links = [
    {
      label: 'Search OpenStreetMap',
      description: 'Open a map search for the selected screening types.',
      url: `https://www.openstreetmap.org/search?query=${encodeURIComponent(searchText + location)}`,
    },
    {
      label: 'ACS screening finder',
      description: 'American Cancer Society screening location finder.',
      url: 'https://getscreened.cancer.org/',
    },
  ];
  if (cancerTypes.includes('lung')) {
    links.push({
      label: 'ACR lung screening locator',
      description: 'Find ACR-designated and LCSR-participating lung screening centers.',
      url: 'https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Screening-Resources/lung-cancer-resources/locator-tool',
    });
  }
  if (cancerTypes.includes('breast')) {
    links.push({
      label: 'FDA MQSA mammography search',
      description: 'Search FDA-certified mammography facilities by ZIP or state.',
      url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfMQSA/mqsa.cfm',
    });
  }
  if (cancerTypes.includes('breast') || cancerTypes.includes('cervical')) {
    links.push({
      label: 'CDC low-cost screening programs',
      description: 'Find breast and cervical screening support through CDC NBCCEDP.',
      url: 'https://www.cdc.gov/breast-cervical-cancer-screening/about/index.html',
    });
  }
  return links;
}

function buildSearchQueries(cancerTypes) {
  const queries = [];
  const used = new Set();
  const has = (type) => cancerTypes.includes(type);

  if (!cancerTypes.length) {
    return [
      'hospital medical center cancer screening',
      'primary care cancer screening',
      'radiology imaging center',
    ];
  }

  if (has('lung') && has('breast')) {
    queries.push('radiology imaging center mammography low dose CT lung cancer screening');
    used.add('lung');
    used.add('breast');
  }

  cancerTypes.forEach((type) => {
    if (used.has(type)) return;
    if (cancerQueries[type]) queries.push(cancerQueries[type]);
  });

  return queries;
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function distanceMiles(a, b) {
  const radius = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function round(value) {
  return Math.round(value * 10) / 10;
}
