import Svg, { Circle, Path, Rect } from "react-native-svg";

// Line icons drawn for BLEUSIM (24px grid, 1.9 stroke).
const P: Record<string, React.ReactNode> = {
  home: <Path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z" />,
  sim: <><Path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><Rect x="9" y="11" width="6" height="6" rx="1" /></>,
  help: <><Path d="M4 5h16v11H9l-5 4V5Z" /><Path d="M10 8.8a2.2 2.2 0 1 1 3 2c-.6.3-1 .8-1 1.4M12 14.3h.01" /></>,
  user: <><Circle cx="12" cy="8" r="4" /><Path d="M4 21a8 8 0 0 1 16 0" /></>,
  search: <><Circle cx="11" cy="11" r="7" /><Path d="m20 20-3.5-3.5" /></>,
  chevronRight: <Path d="m9 6 6 6-6 6" />,
  chevronLeft: <Path d="m15 6-6 6 6 6" />,
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  globe: <><Circle cx="12" cy="12" r="9" /><Path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  rocket: <><Path d="M14 4c3-1 6-1 6-1s0 3-1 6l-6 6-4-4 5-7Z" /><Path d="M9 11 5 12l-1 3 4-1M13 15l-1 4-3 1 1-4" /><Circle cx="15.5" cy="8.5" r="1.3" /></>,
  question: <><Circle cx="12" cy="12" r="9" /><Path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5M12 16.6h.01" /></>,
  chat: <><Path d="M4 5h16v11H9l-5 4V5Z" /><Path d="M8.5 10h7M8.5 13h4" /></>,
  refund: <><Rect x="3" y="5" width="18" height="13" rx="2" /><Path d="M3 9h18M7 14h4" /><Path d="M16 13a2.5 2.5 0 1 0 2.4 3.2" /></>,
  signal: <><Path d="M4 20v-3M9 20v-6M14 20V9M19 20V4" /></>,
  flag: <><Path d="M5 21V4" /><Path d="M5 4h11l-2 4 2 4H5" /></>,
  external: <><Path d="M14 4h6v6M20 4l-9 9" /><Path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  info: <><Circle cx="12" cy="12" r="9" /><Path d="M12 11v5M12 8h.01" /></>,
  phone: <><Rect x="7" y="3" width="10" height="18" rx="2.5" /><Path d="M11 18h2" /></>,
  layers: <Path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />,
  check: <Path d="m5 12.5 4.5 4.5L19 7.5" />,
  wifi: <><Path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><Circle cx="12" cy="19" r="0.8" /></>,
  refresh: <Path d="M20 11a8 8 0 0 0-14.5-4.6L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.6L20 16m0 4v-4h-4" />,
  mail: <><Rect x="3" y="5" width="18" height="14" rx="2" /><Path d="m4 7 8 6 8-6" /></>,
  language: <><Path d="M4 5h9M8.5 3v2c0 4-2 7-5 8.5M6 9c1 2 3 4 6 5" /><Path d="m13 21 4-10 4 10M14.5 17.5h5" /></>,
  doc: <><Path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><Path d="M9 12h6M9 16h6" /></>,
  plus: <Path d="M12 5v14M5 12h14" />,
  bolt: <Path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />,
};
export type IconName = keyof typeof P;
export function Icon({ name, size = 24, color = "#0D1526", stroke = 1.9 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {P[name]}
    </Svg>
  );
}

/** BLEUSIM symbol: planet, orbit and a live (pink) node. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx="16" cy="16" r="11" fill="#0057FF" />
      <Circle cx="13" cy="12" r="7" fill="#39C6FF" opacity={0.55} />
      <Path d="M3.2 21.5C1.6 18.4 7.4 12.2 16.2 8.1 25 4 31.4 4 30.3 7.6" fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M30.3 7.6c-1 3.3-6.9 8.6-14.6 12.2C8.5 23.2 4.4 23.6 3.2 21.5" fill="none" stroke="#0057FF" strokeOpacity={0.35} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx="23.9" cy="6.1" r="2.4" fill="#FF3EA5" />
    </Svg>
  );
}
