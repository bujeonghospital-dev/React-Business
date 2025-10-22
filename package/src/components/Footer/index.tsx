import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

const Footer = () => {
  return (
    <footer className="footer-img1 pt-4">
      <div className="container">
        <div className="row gy-4 gx-4 text-white">
          {/* โลโก้ + ที่อยู่/ติดตามเรา */}
          <div className="col-md-3 col-sm-6">
            <Image
              src="/images/footer/LOGO-name white.png"
              alt="Micro Leasing Logo"
              width={300}
              height={70}
              className="mb-3 img-fluid"
            />
            <p>
              9/9 หมู่ 6 ถนนกิ่งแก้ว
              <br />
              ตำบลราชาเทวะ อำเภอบางพลี
              <br />
              จังหวัดสมุทรปราการ 10540
            </p>
            <h6 className="text-white fw-bold">ติดตามเรา</h6>
            <div className="d-flex gap-3 ">
              <Link href="#">
                <Icon icon="ic:baseline-facebook" fontSize={24} color="white" />
              </Link>
              <Link href="#">
                <Icon icon="simple-icons:line" fontSize={24} color="white" />
              </Link>
              <Link href="#">
                <Icon icon="mdi:youtube" fontSize={24} color="white" />
              </Link>
            </div>
          </div>

          {/* ติดต่อสอบถาม/เวลาทำการ */}
          <div className="col-md-3 col-sm-6">
            <h6 className="text-white fw-bold">ติดต่อสอบถาม</h6>
            <p>
              02-175-2201-8
              <br />
              marketingcenter@tpppack.com
            </p>
            <h6 className="text-white fw-bold mt-3">เวลาทำการ</h6>
            <p>
              จันทร์ - เสาร์ 8.30 - 17.30 น.
              <br />
              วันหยุด วันอาทิตย์
            </p>
          </div>

          {/* เกี่ยวกับเรา */}
          <div className="col-md-3 col-sm-6">
            <h6 className="text-white fw-bold">เกี่ยวกับเรา</h6>
            <ul className="list-unstyled">
              <li>
                <Link
                  href="about-history"
                  className="text-white text-decoration-none"
                >
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link
                  href="contact-inquiry"
                  className="text-white text-decoration-none"
                >
                  ติดต่อเรา
                </Link>
              </li>
              <li>
                <Link
                  href="careers"
                  className="text-white text-decoration-none"
                >
                  ร่วมงานกับเรา
                </Link>
              </li>
              <li>
                <Link
                  href="investor-financials"
                  className="text-white text-decoration-none"
                >
                  นักลงทุนสัมพันธ์
                </Link>
              </li>
            </ul>
          </div>

          {/* สินค้าและบริการ */}
          <div className="col-md-3 col-sm-6">
            <h6 className="text-white fw-bold">สินค้าและบริการ</h6>
            <ul className="list-unstyled">
              <li>
                <Link
                  href="our-services"
                  className="text-white text-decoration-none"
                >
                  บริการของเรา
                </Link>
              </li>
              <li>
                <Link
                  href="products-pakku-packaging"
                  className="text-white text-decoration-none"
                >
                  Pakku Packaging
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white text-decoration-none">
                  สอบถามบริการ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white py-3 mt-4">
        <div className="container d-flex flex-wrap justify-content-between align-items-center text-secondary">
          <span>
            © สงวนลิขสิทธิ์ พ.ศ. 2568 บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด
            (มหาชน)
          </span>
          <ul className="list-inline mb-0">
            <li className="list-inline-item">
              <Link
                href="/PDPA"
                className="text-secondary text-decoration-underline"
              >
                ข้อกำหนดและเงื่อนไข
              </Link>
            </li>
            <li className="list-inline-item">|</li>
            <li className="list-inline-item">
              <Link
                href="/downloads/pdpa/3-นโยบายคุ้มครองข้อมูลส่วนบุคคล-ของบริษัท-ไทยบรรจุภัณฑ์และการพิมพ์-จำกัด-มหาชน.pdf"
                className="text-secondary text-decoration-underline"
                target="_blank"
              >
                การคุ้มครองข้อมูลส่วนบุคคล
              </Link>
            </li>
            <li className="list-inline-item">|</li>
            <li className="list-inline-item">
              <Link
                href="/downloads/pdpa/2-นโยบายคุกกี้-Cookies-Policy-ของ-บริษัท-ไทยบรรจุภัณฑ์และการพิมพ์-จำกัด-มหาชน.pdf"
                className="text-secondary text-decoration-underline"
                target="_blank"
              >
                นโยบายการใช้คุกกี้
              </Link>
            </li>
            <li className="list-inline-item">|</li>
            <li className="list-inline-item">
              <Link
                href="/downloads/pdpa/คำประกาศ-เกี่ยวกับความเป็นส่วนตัวในการใช้กล้องวงจรปิด-CCTV-Rev.01.pdf"
                className="text-secondary text-decoration-underline"
                target="_blank"
              >
                นโยบายกล้องวงจรปิด CCTV
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
