"use client";
import Link from "next/link";
import Image from "next/image";

const items = [
  {
    title: "สินเชื่อซื้อขายรถบรรทุกมือสอง",
    img: "/images/product/product01.jpg",
    href: "/product/truck-loan",
  },
  {
    title: "สินเชื่อเพิ่มสภาพคล่อง",
    img: "/images/product/product02.jpg",
    href: "/product/cashflow-loan",
  },
  {
    title: "รถพร้อมประมูล",
    img: "/images/product/product03.jpg",
    href: "/product/auction",
  },
  {
    title: "สินเชื่อรถมอเตอร์ไซด์",
    img: "/images/product/product04.jpg",
    href: "/product/motorcycle-loan",
  },
  {
    title: "สินเชื่อจำนำทะเบียน",
    img: "/images/product/product05.jpg",
    href: "/product/registration-loan",
  },
  {
    title: "บริการนายหน้าประกันภัย",
    img: "/images/product/product06.jpg",
    href: "/product/insurance-broker",
  },
];

export default function ProductsServices() {
  return (
    <section>
      <h2 className="text-center text-2xl font-bold mb-8 underline decoration-red-500 decoration-8" style={{fontSize:"34px"}}>ผลิตภัณฑ์และบริการ</h2>
      <br/>
      <div className="container">
        <div className="row g-4 justify-content-center">
          {items.map((item, i) => (
            <div key={i} className="col-12 col-md-4">
              <Link
                href={item.href}
                className="card text-center h-100 shadow-sm p-0 border-0"
                style={{
                  cursor: "pointer",
                  background: "none",
                  display: "block",
                  textDecoration: "none",
                }}
              >
                <div
                  className="card-body d-flex flex-column align-items-center justify-content-end position-relative"
                  style={{ minHeight: 220, overflow: "hidden" }}
                >
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover rounded-3"
                    style={{
                      zIndex: 0,
                      opacity: 0.85,
                      pointerEvents: "none",
                    }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div
                    className="position-relative w-100"
                    style={{ zIndex: 1 }}
                  >
                    <h5 className="card-title fw-bold bg-white bg-opacity-80 rounded px-2 py-1 mb-2">
                      {item.title}
                    </h5>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
