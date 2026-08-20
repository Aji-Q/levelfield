import type { CSSProperties, ReactNode } from "react";

interface Props {
  show: boolean;
  delay?: number;
  duration?: number;
  className?: string;
  children: ReactNode;
}

/**
 * clip-path text wipe. `.in` owns a real CSS keyframe, so it starts correctly
 * on the element's first paint rather than depending on a transition between
 * two React renders.
 */
export function MaskReveal({
  show,
  delay = 0,
  duration,
  className,
  children,
}: Props) {
  const cls = ["mask-reveal", show ? "in" : "", className]
    .filter(Boolean)
    .join(" ");
  const style: CSSProperties & Record<"--mask-delay" | "--mask-duration", string> = {
    display: "inline-block",
    "--mask-delay": `${delay}ms`,
    "--mask-duration": `${duration ?? 700}ms`,
  };
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  );
}
