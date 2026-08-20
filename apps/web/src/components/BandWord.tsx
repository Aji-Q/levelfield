import type { Band } from "@/lib/types";
import { BAND_LABEL } from "@/lib/format";

// The band word always accompanies the number — color varies (muted gray ->
// amber) but is never the only signal, per the design language.
export function BandWord({ band, className = "" }: { band: Band; className?: string }) {
  return <span className={`band-word band-word--${band} ${className}`.trim()}>{BAND_LABEL[band]}</span>;
}
