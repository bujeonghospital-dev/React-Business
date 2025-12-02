import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

const Footer = () => {
  return (
    <footer className="pt-5 pb-4" style={{ backgroundColor: "#4AC0BF" }}>
      <div className="container">
        <div className="row gy-4 gx-4 text-white">
          {/* โลโก้ + ข้อมูลหลัก */}
          <div className="col-lg-4 col-md-6 text-center text-md-start">
            <h2 className="text-white fw-bold mb-3">BJH BANGKOK</h2>
            <p className="mb-2" style={{ opacity: 0.9 }}>
              ฆสพ.สบส : ๔๖๒๗ / ๒๕๖๘
            </p>
            <h6 className="text-white fw-bold mt-4">ติดตามเรา</h6>
            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
              <Link
                href="https://www.facebook.com/bjhbangkok"
                target="_blank"
                aria-label="Facebook"
              >
                <Icon icon="ic:baseline-facebook" fontSize={28} color="white" />
              </Link>
              <Link
                href="https://www.instagram.com/bjh.bangkok"
                target="_blank"
                aria-label="Instagram"
              >
                <Icon icon="mdi:instagram" fontSize={28} color="white" />
              </Link>
              <Link
                href="https://www.tiktok.com/@bjhbangkok"
                target="_blank"
                aria-label="TikTok"
              >
                <Icon icon="simple-icons:tiktok" fontSize={24} color="white" />
              </Link>
              <Link
                href="https://lin.ee/D9KIJyb"
                target="_blank"
                aria-label="LINE"
              >
                <Icon icon="simple-icons:line" fontSize={26} color="white" />
              </Link>
            </div>
          </div>

          {/* ติดต่อสอบถาม / เวลาทำการ */}
          <div className="col-lg-4 col-md-6 text-center text-md-start">
            <h6 className="text-white fw-bold">Call Center</h6>
            <p style={{ opacity: 0.9 }}>
              <Link
                href="tel:020954799"
                className="text-white text-decoration-none"
              >
                02-095-4799
              </Link>
              <br />
              <Link
                href="tel:0864114262"
                className="text-white text-decoration-none"
              >
                086-411-4262
              </Link>
            </p>
            <h6 className="text-white fw-bold mt-3">เวลาทำการ</h6>
            <p style={{ opacity: 0.9 }}>เปิดทุกวัน 11:00 - 20:00 น.</p>
          </div>

          {/* เมนูลิงก์ */}
          <div className="col-lg-4 col-md-12 text-center text-md-start">
            <h6 className="text-white fw-bold">เมนู</h6>
            <ul className="list-unstyled" style={{ opacity: 0.9 }}>
              <li>
                <Link href="/" className="text-white text-decoration-none">
                  HOME
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="text-white text-decoration-none"
                >
                  ABOUT US
                </Link>
              </li>
              <li>
                <Link
                  href="/our-services"
                  className="text-white text-decoration-none"
                >
                  OUR SERVICE
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="mt-4 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
      >
        <div className="container text-center text-white" style={{ opacity: 0.8 }}>
          <span>© 2024 BJH BANGKOK. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
