export interface EquatorialCoords {
  raHours: number; // Right Ascension 0..24h
  decDeg: number;  // Declination -90..+90 deg
}

export interface HorizontalCoords {
  altitudeDeg: number; // -90..+90 deg above horizon
  azimuthDeg: number;  // 0..360 deg clockwise from North (0=N, 90=E, 180=S, 270=W)
}

export interface DomeProjectionPoint {
  x: number; // Normalized -1..+1 (East on left or standard sky-map convention: Looking Up -> North top, East left, West right)
  y: number; // Normalized -1..+1
  visible: boolean;
  altitudeDeg: number;
  azimuthDeg: number;
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Computes Julian Date from a calendar UTC date/time.
 */
export function computeJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Computes Local Sidereal Time (in degrees, 0..360) for a given Date and observer longitude (East positive).
 */
export function computeLocalSiderealTimeDeg(date: Date, longitudeDeg: number): number {
  const jd = computeJulianDate(date);
  const d = jd - 2451545.0; // Days since J2000.0
  // Greenwich Mean Sidereal Time approximation accurate to ~1 arcminute
  const gmstDeg = 280.46061837 + 360.98564736629 * d;
  const lst = (gmstDeg + longitudeDeg) % 360;
  return lst < 0 ? lst + 360 : lst;
}

/**
 * Converts J2000 Equatorial coordinates (RA/Dec) into observer Horizontal coordinates (Altitude/Azimuth).
 */
export function equatorialToHorizontal(
  coords: EquatorialCoords,
  latitudeDeg: number,
  longitudeDeg: number,
  date: Date
): HorizontalCoords {
  const lstDeg = computeLocalSiderealTimeDeg(date, longitudeDeg);
  const raDeg = coords.raHours * 15;
  let haDeg = (lstDeg - raDeg) % 360;
  if (haDeg < 0) haDeg += 360;

  const haRad = haDeg * DEG_TO_RAD;
  const decRad = coords.decDeg * DEG_TO_RAD;
  const latRad = latitudeDeg * DEG_TO_RAD;

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const clampedSinAlt = Math.max(-1, Math.min(1, sinAlt));
  const altRad = Math.asin(clampedSinAlt);

  const cosAlt = Math.cos(altRad);
  let azRad = 0;
  if (Math.abs(cosAlt) > 1e-7 && Math.abs(Math.cos(latRad)) > 1e-7) {
    const cosAz =
      (Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad)) /
      (cosAlt * Math.cos(latRad));
    const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
    azRad = Math.acos(clampedCosAz);
    if (Math.sin(haRad) > 0) {
      azRad = 2 * Math.PI - azRad;
    }
  }

  return {
    altitudeDeg: altRad * RAD_TO_DEG,
    azimuthDeg: azRad * RAD_TO_DEG,
  };
}

/**
 * Projects horizontal coordinates onto a zenith-centered stereographic sky dome (-1..1).
 * Overhead sky convention (looking up at the dome):
 * North = top (y = -1 in canvas top-down or +1 mathematical; here y = -cos(az)*r so North is top),
 * South = bottom, East = left, West = right.
 */
export function projectHorizontalToDome(horiz: HorizontalCoords): DomeProjectionPoint {
  const visible = horiz.altitudeDeg >= -2;
  // Stereographic / equidistant zenith projection: zenith (90°) -> r = 0, horizon (0°) -> r = 1
  const zenithAngleDeg = 90 - horiz.altitudeDeg;
  const r = zenithAngleDeg / 90;
  const azRad = horiz.azimuthDeg * DEG_TO_RAD;

  // Looking up at the sky dome: North (0°) at top (y = -r), East (90°) at left (x = -r), West (270°) at right (x = +r)
  const x = -Math.sin(azRad) * r;
  const y = -Math.cos(azRad) * r;

  return {
    x,
    y,
    visible,
    altitudeDeg: horiz.altitudeDeg,
    azimuthDeg: horiz.azimuthDeg,
  };
}

/**
 * Calculates visual radius ratios for Compare Worlds in both True Ratio and Presentation Scale modes.
 */
export function computeComparisonRadii(
  diameterKmA: number,
  diameterKmB: number,
  mode: 'true-scale' | 'presentation'
): { radiusFractionA: number; radiusFractionB: number; diameterRatio: number } {
  const safeA = Math.max(1, diameterKmA);
  const safeB = Math.max(1, diameterKmB);
  const maxD = Math.max(safeA, safeB);
  const diameterRatio = safeA / safeB;

  if (mode === 'true-scale') {
    return {
      radiusFractionA: Math.max(0.015, safeA / maxD),
      radiusFractionB: Math.max(0.015, safeB / maxD),
      diameterRatio,
    };
  }

  // Presentation scale: compresses extreme differences logarithmically while preserving which world is larger,
  // explicitly labeled as exaggerated for surface inspection.
  const logA = Math.pow(safeA, 0.35);
  const logB = Math.pow(safeB, 0.35);
  const maxLog = Math.max(logA, logB);
  return {
    radiusFractionA: Math.max(0.28, logA / maxLog),
    radiusFractionB: Math.max(0.28, logB / maxLog),
    diameterRatio,
  };
}

/**
 * Computes Keplerian circular/mean orbital angle (radians) at a given simulation day offset.
 */
export function computeOrbitalAngleRad(
  orbitalPeriodDays: number,
  initialPhaseDeg: number,
  elapsedDays: number
): number {
  if (orbitalPeriodDays <= 0) return 0;
  const revolutions = elapsedDays / orbitalPeriodDays;
  const totalDeg = (initialPhaseDeg + revolutions * 360) % 360;
  return (totalDeg < 0 ? totalDeg + 360 : totalDeg) * DEG_TO_RAD;
}

/**
 * Formats light-travel time from Sun given distance in AU (1 AU ≈ 499.005 light-seconds).
 */
export function formatLightTimeFromAu(au: number): string {
  if (au <= 0) return '0 light-seconds';
  const totalSeconds = au * 499.00478;
  if (totalSeconds < 90) {
    return `${Math.round(totalSeconds)} light-sec`;
  }
  const minutes = totalSeconds / 60;
  if (minutes < 90) {
    return `${minutes.toFixed(1)} light-min`;
  }
  const hours = minutes / 60;
  return `${hours.toFixed(2)} light-hr`;
}
