import Image from "next/image";

export function HeroBanner() {
  return (
    <div className="absolute inset-x-0 top-0 h-64 overflow-hidden sm:h-80">
      <Image
        src="/images/dashboard-hero.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      {/* Fade into the page background, matching the mockup */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent" />
    </div>
  );
}
