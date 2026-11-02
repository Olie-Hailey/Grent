import Image from "next/image";

type Props = {
  imageUrl?: string | null;
  imageEmoji?: string | null;
  alt: string;
  className?: string;
  emojiClassName?: string;
};

export function PhoneImage({
  imageUrl,
  alt,
  className = "h-36",
}: Props) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#e8eef2_0%,#f7f9fb_55%,#dfe7ec_100%)] ${className}`}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-3">
          <svg className="h-9 w-9 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider line-clamp-1">{alt}</span>
        </div>
      )}
    </div>
  );
}
