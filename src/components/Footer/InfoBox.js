import Link from "next/link";

export default function FooterInfoBox() {
  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-2">
        {/* Column 2: ที่อยู่ */}
        <div className="flex-1 min-w-[180px]">
          <h4 className="text-micro-blue-200 text-xl md:text-2xl font-bold mb-2">ติดต่อสอบถาม</h4>
          <p className="text-white">02-175-2201-8<br />Contact@microleasingplc.com</p>
          <h4 className="text-micro-blue-200 text-lg md:text-xl font-bold mt-6 mb-1">เวลาทำการ</h4>
          <p className="text-white">
            จันทร์ - เสาร์ 8.30 - 17.30 น.<br />
            วันหยุด วันอาทิตย์
          </p>
        </div>
        {/* Column 3: เกี่ยวกับเรา */}
        <div className="flex-1 min-w-[180px]">
          <h4 className="text-micro-blue-200 text-xl md:text-2xl font-bold mb-4">เกี่ยวกับเรา</h4>
          <ul className="text-white space-y-2 pl-0">
            {['เกี่ยวกับเรา', 'ติดต่อเรา', 'ร่วมงานกับเรา', 'นักลงทุนสัมพันธ์'].map((text, idx) => (
              <li key={idx} className="flex items-center">
                <span className="me-2 text-white" style={{fontSize: '20px'}}>•</span>
                <Link href="#" className="hover:underline text-micro-white no-underline">{text}</Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Column 4: สินค้าและบริการ */}
        <div className="flex-1 min-w-[180px]">
          <h4 className="text-micro-blue-200 text-xl md:text-2xl font-bold mb-4">สินค้าและบริการ</h4>
          <ul className="space-y-2 pl-0" style={{ listStyle: "none" }}>
            {["บริการของเรา","Pakku Packaging"].map((text, idx) => (
              <li key={idx} className="flex items-center" style={{ lineHeight: 1.6 }}>
                <span
                  className="me-2 text-white"
                  style={{
                    fontSize: "20px",
                    lineHeight: 1.3,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                >•</span>
                <Link href="#" className="hover:underline text-micro-white no-underline">{text}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
