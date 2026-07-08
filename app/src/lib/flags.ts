// Map a TxLINE participant (national-team) name to a circle-flags ISO code.
// circle-flags is served by the same Iconify runtime the app already uses.
const MAP: Record<string, string> = {
  // demo fixtures (confirmed on devnet)
  usa: 'us', 'united states': 'us', 'united states of america': 'us',
  'bosnia & herzegovina': 'ba', 'bosnia and herzegovina': 'ba', bosnia: 'ba',
  spain: 'es', austria: 'at',
  // 2026 World Cup hosts + likely qualifiers
  canada: 'ca', mexico: 'mx',
  argentina: 'ar', brazil: 'br', uruguay: 'uy', colombia: 'co', ecuador: 'ec',
  peru: 'pe', chile: 'cl', paraguay: 'py', venezuela: 've', bolivia: 'bo',
  france: 'fr', germany: 'de', portugal: 'pt', netherlands: 'nl', belgium: 'be',
  italy: 'it', croatia: 'hr', switzerland: 'ch', denmark: 'dk', poland: 'pl',
  serbia: 'rs', sweden: 'se', norway: 'no', ukraine: 'ua', greece: 'gr',
  czechia: 'cz', 'czech republic': 'cz', hungary: 'hu', romania: 'ro',
  slovakia: 'sk', slovenia: 'si', turkey: 'tr', turkiye: 'tr', 'türkiye': 'tr',
  england: 'gb-eng', scotland: 'gb-sct', wales: 'gb-wls', 'northern ireland': 'gb-nir',
  'united kingdom': 'gb',
  japan: 'jp', 'south korea': 'kr', 'korea republic': 'kr', 'korea, republic of': 'kr',
  'saudi arabia': 'sa', qatar: 'qa', iran: 'ir', australia: 'au',
  morocco: 'ma', senegal: 'sn', ghana: 'gh', nigeria: 'ng', cameroon: 'cm',
  'ivory coast': 'ci', "côte d'ivoire": 'ci', "cote d'ivoire": 'ci',
  egypt: 'eg', tunisia: 'tn', algeria: 'dz', 'south africa': 'za',
  'costa rica': 'cr', panama: 'pa', honduras: 'hn', jamaica: 'jm', 'new zealand': 'nz',
  guatemala: 'gt', 'el salvador': 'sv', nicaragua: 'ni', 'dominican republic': 'do',
  'trinidad & tobago': 'tt', 'trinidad and tobago': 'tt', haiti: 'ht', cuba: 'cu',
  // Asia + Oceania (friendlies show up on devnet)
  vietnam: 'vn', myanmar: 'mm', thailand: 'th', indonesia: 'id', malaysia: 'my',
  singapore: 'sg', philippines: 'ph', india: 'in', china: 'cn', 'hong kong': 'hk',
  cambodia: 'kh', laos: 'la', 'sri lanka': 'lk', nepal: 'np', bangladesh: 'bd',
  pakistan: 'pk', afghanistan: 'af', taiwan: 'tw', 'chinese taipei': 'tw',
  'north korea': 'kp', 'korea dpr': 'kp', uzbekistan: 'uz', kazakhstan: 'kz',
  'united arab emirates': 'ae', uae: 'ae', iraq: 'iq', jordan: 'jo', oman: 'om',
  kuwait: 'kw', bahrain: 'bh', lebanon: 'lb', syria: 'sy', yemen: 'ye', palestine: 'ps',
  fiji: 'fj', 'papua new guinea': 'pg',
  // more of Africa
  kenya: 'ke', 'dr congo': 'cd', congo: 'cg', mali: 'ml', 'burkina faso': 'bf',
  zambia: 'zm', angola: 'ao', 'cape verde': 'cv', gabon: 'ga', guinea: 'gn',
  uganda: 'ug', zimbabwe: 'zw', 'equatorial guinea': 'gq', libya: 'ly', sudan: 'sd',
  // more of Europe
  finland: 'fi', iceland: 'is', ireland: 'ie', 'republic of ireland': 'ie',
  albania: 'al', 'north macedonia': 'mk', montenegro: 'me', kosovo: 'xk',
  georgia: 'ge', armenia: 'am', azerbaijan: 'az', bulgaria: 'bg', luxembourg: 'lu',
  moldova: 'md', russia: 'ru', estonia: 'ee', latvia: 'lv', lithuania: 'lt', cyprus: 'cy',
}

export function flagCode(name: string): string | null {
  if (!name) return null
  const k = name.trim().toLowerCase().replace(/\s+/g, ' ')
  return MAP[k] ?? MAP[k.replace(/&/g, 'and')] ?? MAP[k.replace(/[.,]/g, '')] ?? null
}
