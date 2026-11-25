// Popular cities mapped to their country (ISO2). Coordinates from public geographic knowledge (city centres).
export const CITIES: { name: string; iso2: string; lng: number; lat: number; alt?: string[] }[] = [
  { name: "Tokyo", iso2: "JP", lng: 139.69, lat: 35.69 }, { name: "Kyoto", iso2: "JP", lng: 135.77, lat: 35.01 }, { name: "Osaka", iso2: "JP", lng: 135.5, lat: 34.69 },
  { name: "Marrakech", iso2: "MA", lng: -7.99, lat: 31.63, alt: ["Marrakesh"] }, { name: "Casablanca", iso2: "MA", lng: -7.59, lat: 33.57 }, { name: "Rabat", iso2: "MA", lng: -6.84, lat: 34.02 },
  { name: "New York", iso2: "US", lng: -74.0, lat: 40.71, alt: ["NYC"] }, { name: "Los Angeles", iso2: "US", lng: -118.24, lat: 34.05, alt: ["LA"] }, { name: "Miami", iso2: "US", lng: -80.19, lat: 25.76 }, { name: "Honolulu", iso2: "US", lng: -157.86, lat: 21.31, alt: ["Hawaii"] },
  { name: "Paris", iso2: "FR", lng: 2.35, lat: 48.86 }, { name: "London", iso2: "GB", lng: -0.13, lat: 51.51 }, { name: "Barcelona", iso2: "ES", lng: 2.17, lat: 41.39 }, { name: "Madrid", iso2: "ES", lng: -3.7, lat: 40.42 },
  { name: "Rome", iso2: "IT", lng: 12.5, lat: 41.9, alt: ["Roma"] }, { name: "Lisbon", iso2: "PT", lng: -9.14, lat: 38.72, alt: ["Lisboa"] }, { name: "Berlin", iso2: "DE", lng: 13.4, lat: 52.52 }, { name: "Amsterdam", iso2: "NL", lng: 4.9, lat: 52.37 },
  { name: "Istanbul", iso2: "TR", lng: 28.98, lat: 41.01 }, { name: "Dubai", iso2: "AE", lng: 55.27, lat: 25.2 }, { name: "Bangkok", iso2: "TH", lng: 100.5, lat: 13.76 }, { name: "Bali", iso2: "ID", lng: 115.19, lat: -8.41 },
  { name: "Singapore", iso2: "SG", lng: 103.82, lat: 1.35 }, { name: "Seoul", iso2: "KR", lng: 126.98, lat: 37.57 }, { name: "Sydney", iso2: "AU", lng: 151.21, lat: -33.87 }, { name: "Cairo", iso2: "EG", lng: 31.24, lat: 30.04 },
  { name: "Mexico City", iso2: "MX", lng: -99.13, lat: 19.43, alt: ["CDMX"] }, { name: "Rio de Janeiro", iso2: "BR", lng: -43.17, lat: -22.91, alt: ["Rio"] }, { name: "Toronto", iso2: "CA", lng: -79.38, lat: 43.65 }, { name: "Cape Town", iso2: "ZA", lng: 18.42, lat: -33.92 },
  { name: "Mecca", iso2: "SA", lng: 39.83, lat: 21.42, alt: ["Makkah"] }, { name: "Doha", iso2: "QA", lng: 51.53, lat: 25.29 }, { name: "Hong Kong", iso2: "HK", lng: 114.17, lat: 22.32 }, { name: "Reykjavik", iso2: "IS", lng: -21.94, lat: 64.15 },
];
