import Link from "next/link";

type LogoProps = {
  className?: string;
  style?: React.CSSProperties;
};

export default function Logo({ className = "", style }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`} style={style}>
      <Link href="/" className="inline-block shrink-0" aria-label="Go home">
        <picture>
          {/* Desktop: >=lg (1024px) ใช้โลโก้แนวนอน */}
          <source
            media="(min-width: 1024px)"
            srcSet="/images/logo/LOGO-TPP-SIDE_8.png"
          />

          {/* Tablet: >=md (768px) ใช้โลโก้แนวตั้ง */}
          <source
            media="(min-width: 768px)"
            srcSet="/images/logo/LOGO-name-2.webp"
          />

          {/* Mobile & Fallback: <768px */}
          <img
            src="/images/logo/LOGO-name-2.webp"
            alt="THAI PACKAGING & PRINTING PCL"
            width={300}
            height={140}
            className="object-contain 
                       /* Mobile */
                       w-[150px] h-[70px]
                       /* Small Mobile */
                       sm:w-[200px] sm:h-[93px]
                       /* Tablet */
                       md:w-[250px] md:h-[116px]
                       /* Desktop */
                       lg:w-[180px] lg:h-[160px]
                       /* Large Desktop */
                       xl:w-[205px] xl:h-[185px]
                       /* Extra Large */
                       2xl:w-[195px] 2xl:h-[184px]"
            loading="eager"
          />
        </picture>
      </Link>
    </div>
  );
}
