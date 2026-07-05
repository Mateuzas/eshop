import Image from "next/image";

import { PlaceholderImage } from "./placeholder-image";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  if (images.length === 0) {
    return (
      <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
        <PlaceholderImage className="absolute inset-0" label={name} />
      </div>
    );
  }

  return (
    <>
      {/* Mobile / tablet: horizontal snap-scroll carousel. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
        {images.map((src, i) => (
          <div
            key={src}
            className="relative aspect-3/4 w-[85vw] shrink-0 snap-center overflow-hidden bg-muted sm:w-[60vw]"
          >
            <Image
              src={src}
              alt={i === 0 ? name : ""}
              fill
              sizes="85vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Desktop: stacked vertical scroll, one image per viewport row. */}
      <div className="hidden lg:flex lg:flex-col lg:gap-1">
        {images.map((src, i) => (
          <div
            key={src}
            className="relative aspect-3/4 w-full overflow-hidden bg-muted"
          >
            <Image
              src={src}
              alt={i === 0 ? name : ""}
              fill
              sizes="50vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </>
  );
}
