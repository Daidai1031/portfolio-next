// components/mdx/Blocks.tsx
import Image from "next/image";

function joinUrl(base: string, src: string) {
  if (!src) return src;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `${base}/${src}`;
}

export function makeMdxComponents(opts: {
  assetBase: string; // e.g. /projects/hci/encoded-elevation
  heroUrl?: string | null;
  galleryUrls?: string[];
}) {
  const { assetBase, heroUrl, galleryUrls = [] } = opts;

  return {
    // 用法： <ImageBlock src="gallery-1.jpg" alt="..." width={1600} height={900} />
    ImageBlock: (props: any) => {
      const src = joinUrl(assetBase, props.src);
      const alt = props.alt ?? "";
      const width = props.width ?? 1600;
      const height = props.height ?? 900;

      return (
        <figure className="my-8">
          <div className="overflow-hidden rounded-2xl border border-neutral-800">
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="h-auto w-full"
            />
          </div>
          {props.caption ? (
            <figcaption className="mt-2 text-sm text-neutral-400">
              {props.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },

    // 用法： <Hero />
    Hero: () => {
      if (!heroUrl) return null;
      return (
        <div className="my-8 overflow-hidden rounded-2xl border border-neutral-800">
          <Image
            src={heroUrl}
            alt="Project hero"
            width={2000}
            height={1200}
            className="h-auto w-full"
            priority
          />
        </div>
      );
    },

    // 用法： <Gallery />
    Gallery: () => {
      if (!galleryUrls.length) return null;

      return (
        <section className="my-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {galleryUrls.map((u) => (
              <div
                key={u}
                className="overflow-hidden rounded-2xl border border-neutral-800"
              >
                <Image
                  src={u}
                  alt="Gallery image"
                  width={1600}
                  height={1000}
                  className="h-auto w-full"
                />
              </div>
            ))}
          </div>
        </section>
      );
    },
  };
}
