import Image from "next/image";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  detail?: string;
  imageUrl: string;
  height?: "sm" | "md" | "lg";
}

export default function HeroBanner({ title, subtitle, detail, imageUrl, height = "md" }: HeroBannerProps) {
  const heightClass = {
    sm: "h-48",
    md: "h-72",
    lg: "h-screen max-h-[600px]",
  }[height];

  return (
    <div className={`relative ${heightClass} overflow-hidden`}>
      {/* Optimized image — Next.js handles resizing, caching, and format conversion */}
      <Image
        src={imageUrl}
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-end pb-8 px-4 text-center">
        <h1 className="font-serif text-white text-4xl md:text-6xl font-bold drop-shadow-lg leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/90 text-lg md:text-xl mt-2 drop-shadow max-w-2xl">
            {subtitle}
          </p>
        )}
        {detail && (
          <p className="text-white/70 text-sm md:text-base mt-1 drop-shadow tracking-wide">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
