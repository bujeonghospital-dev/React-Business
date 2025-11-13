"use client";
import Link from "next/link";
import Image from "next/image";

const LanguageSwitcher: React.FC = () => (
  <div className="d-flex align-items-center gap-1 gap-md-2 ms-auto header-lang">
    <Link
      href="/en"
      className="d-flex align-items-center gap-1 gap-md-2 text-decoration-none lang-link"
    >
      <Image
        src="/images/icons/us.svg"
        alt="US Flag"
        width={20}
        height={14}
        className="lang-flag"
      />
      <span className="lang-text">English</span>
    </Link>
    <Link
      href="/th"
      className="d-flex align-items-center gap-1 gap-md-2 text-decoration-none lang-link"
    >
      <Image
        src="/images/icons/th.svg"
        alt="TH Flag"
        width={20}
        height={14}
        className="lang-flag"
      />
      <span className="lang-text">Thai</span>
    </Link>
    <div style={{ width: 75 }} aria-hidden="true"></div>
  </div>
);

export default LanguageSwitcher;
