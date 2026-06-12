import Image from "next/image";

export function LifeOSLogo({ size = 48 }: { size?: number }) {
  return (
    <Image
      src="/images/logo.png"
      alt="LifeOS"
      width={size}
      height={size}
      priority
    />
  );
}
