type LogoProps = {
  className?: string;
  size?: number;
  variant?: "default" | "blue";
};

export default function Logo({ className = "", size = 32, variant = "default" }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="TreeTrack India logo"
      className={className}
      width={size}
      height={size}
      style={{
        objectFit: "contain",
        filter: variant === "blue" ? "hue-rotate(190deg) saturate(1.4) brightness(0.95)" : undefined,
      }}
    />
  );
}
