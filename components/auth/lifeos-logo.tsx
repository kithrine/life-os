export function LifeOSLogo({ size = 48 }: { size?: number }) {
  const id = "lifeos-gradient";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" stroke={`url(#${id})`} strokeWidth="5" fill="none" />
      <circle cx="24" cy="24" r="10" fill="white" fillOpacity="0.9" />
    </svg>
  );
}
