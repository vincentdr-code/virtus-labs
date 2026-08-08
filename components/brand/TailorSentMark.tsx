/**
 * The TailorSent mark: a starred seal with motion lines trailing behind it.
 *
 * Built as geometry rather than shipped as a raster so it stays sharp from a
 * 16px favicon to a 512px install icon, and so the palette drives its colors.
 *
 * Both halves of the name are in here on purpose — the seal is the "tailored"
 * half (a maker's mark, struck once, precise), and the trailing lines are the
 * "sent" half (already in motion, leaving).
 */

/** Five-point star centered on the seal at (42, 22), outer radius 8. */
const STAR_PATH =
  "M42 14 L43.80 19.53 L49.61 19.53 L44.91 22.94 L46.70 28.47 " +
  "L42 25.06 L37.30 28.47 L39.09 22.94 L34.39 19.53 L40.20 19.53 Z";

const SEAL_CX = 42;
const SEAL_CY = 22;

export interface TailorSentMarkProps {
  /** Rendered height in px. Width follows the aspect of the chosen variant. */
  size?: number;
  /**
   * Motion lines read as noise below roughly 24px, so the compact form drops
   * them and crops to the seal, which then fills the full square.
   */
  withMotion?: boolean;
  className?: string;
  title?: string;
}

export function TailorSentMark({
  size = 32,
  withMotion = true,
  className,
  title = "TailorSent",
}: TailorSentMarkProps) {
  // With motion the artwork is landscape (lines trail off to the left); the
  // seal-only crop is square so it can sit in a tight rail or a favicon.
  const viewBox = withMotion ? "0 0 64 44" : "21 1 42 42";
  const width = withMotion ? Math.round(size * (64 / 44)) : size;

  return (
    <svg
      width={width}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        {/*
         * userSpaceOnUse is required, not stylistic: a horizontal line has a
         * zero-height bounding box, so the default objectBoundingBox units
         * produce a degenerate gradient and the strokes render as nothing.
         */}
        <linearGradient
          id="ts-trail"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="22"
          y2="0"
        >
          <stop offset="0%" stopColor="var(--flag-red-bright, #E04255)" stopOpacity="0" />
          <stop offset="45%" stopColor="var(--flag-red-bright, #E04255)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--gold-bright, #E8C468)" />
        </linearGradient>
      </defs>

      {withMotion && (
        // Unequal lengths on purpose — an even set reads as a barcode, an
        // uneven one reads as speed.
        <g stroke="url(#ts-trail)" strokeWidth="2.5" strokeLinecap="round">
          <line x1="7" y1="14" x2="21" y2="14" />
          <line x1="1" y1="22" x2="21" y2="22" />
          <line x1="11" y1="30" x2="21" y2="30" />
        </g>
      )}

      {/* Outer seal ring */}
      <circle
        cx={SEAL_CX}
        cy={SEAL_CY}
        r="20"
        stroke="var(--gold-bright, #E8C468)"
        strokeWidth="3"
      />
      {/* Inner rule — the double ring of a struck seal */}
      <circle
        cx={SEAL_CX}
        cy={SEAL_CY}
        r="13.5"
        stroke="var(--gold, #C9A227)"
        strokeWidth="1.5"
        opacity="0.85"
      />
      <path d={STAR_PATH} fill="var(--gold-bright, #E8C468)" />
    </svg>
  );
}

export interface TailorSentLockupProps {
  /** Height of the mark; the wordmark scales against it. */
  size?: number;
  showTagline?: boolean;
  className?: string;
}

/**
 * Mark plus wordmark. "TAILOR" in white and "SENT" in gold splits the name at
 * its actual seam so the two ideas read separately at a glance.
 */
export function TailorSentLockup({
  size = 34,
  showTagline = true,
  className,
}: TailorSentLockupProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <TailorSentMark size={size} />
      <div className="leading-none">
        <p
          className="font-bold leading-none tracking-[0.12em]"
          style={{ fontSize: size * 0.52 }}
        >
          <span className="text-text-primary">TAILOR</span>
          <span className="text-gold-bright">SENT</span>
        </p>
        {showTagline && (
          <p
            className="mt-1.5 font-medium uppercase leading-none tracking-[0.22em] text-text-tertiary"
            style={{ fontSize: Math.max(7, size * 0.2) }}
          >
            Tailored. Sent. Forward.
          </p>
        )}
      </div>
    </div>
  );
}
