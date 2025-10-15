/**
 * ตัวอย่างการใช้งาน Google Maps Component
 *
 * ไฟล์นี้แสดงตัวอย่างการใช้งาน GoogleMapComponent ในหลายสถานการณ์
 */

import GoogleMapComponent from "@/components/GoogleMap";

// ========================================
// ตัวอย่างที่ 1: การใช้งานพื้นฐาน
// ========================================

export function BasicMapExample() {
  return (
    <div className="h-[400px] w-full">
      <GoogleMapComponent
        center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
        zoom={15}
        markerPosition={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
        markerTitle="สำนักงานใหญ่"
      />
    </div>
  );
}

// ========================================
// ตัวอย่างที่ 2: ซูมระดับต่างๆ
// ========================================

export function ZoomLevelsExample() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* ซูมไกล - มองเห็นทั้งเมือง */}
      <div className="h-[300px]">
        <h3>Zoom 12 - City View</h3>
        <GoogleMapComponent
          center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
          zoom={12}
          markerPosition={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
          markerTitle="ซูมไกล"
        />
      </div>

      {/* ซูมปานกลาง - มองเห็นย่าน */}
      <div className="h-[300px]">
        <h3>Zoom 15 - District View</h3>
        <GoogleMapComponent
          center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
          zoom={15}
          markerPosition={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
          markerTitle="ซูมปานกลาง"
        />
      </div>

      {/* ซูมใกล้ - มองเห็นรายละเอียด */}
      <div className="h-[300px]">
        <h3>Zoom 18 - Street View</h3>
        <GoogleMapComponent
          center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
          zoom={18}
          markerPosition={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
          markerTitle="ซูมใกล้"
        />
      </div>
    </div>
  );
}

// ========================================
// ตัวอย่างที่ 3: หลายสถานที่ด้วย Tabs
// ========================================

import { useState } from "react";

export function MultipleLocationsExample() {
  const locations = [
    {
      id: "headquarters",
      name: "สำนักงานใหญ่",
      coordinates: { lat: 13.685984091307898, lng: 100.72794861574249 },
      zoom: 15,
    },
    {
      id: "factory",
      name: "โรงงาน",
      coordinates: { lat: 13.642518, lng: 100.732842 },
      zoom: 16,
    },
    {
      id: "warehouse",
      name: "คลังสินค้า",
      coordinates: { lat: 13.695143, lng: 100.751829 },
      zoom: 15,
    },
  ];

  const [activeLocation, setActiveLocation] = useState(locations[0]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => setActiveLocation(location)}
            className={`px-4 py-2 rounded ${
              activeLocation.id === location.id
                ? "bg-red-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {location.name}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="h-[500px]">
        <GoogleMapComponent
          center={activeLocation.coordinates}
          zoom={activeLocation.zoom}
          markerPosition={activeLocation.coordinates}
          markerTitle={activeLocation.name}
        />
      </div>
    </div>
  );
}

// ========================================
// ตัวอย่างที่ 4: Responsive Map
// ========================================

export function ResponsiveMapExample() {
  return (
    <div className="container mx-auto px-4">
      {/* Mobile: Full width, Tablet: 2/3, Desktop: 1/2 */}
      <div className="w-full md:w-2/3 lg:w-1/2 mx-auto">
        {/* Aspect ratio 16:9 */}
        <div className="aspect-video">
          <GoogleMapComponent
            center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
            zoom={15}
            markerPosition={{
              lat: 13.685984091307898,
              lng: 100.72794861574249,
            }}
            markerTitle="Responsive Map"
          />
        </div>
      </div>
    </div>
  );
}

// ========================================
// ตัวอย่างที่ 5: Map with Card Layout
// ========================================

export function MapWithCardExample() {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
        <h2 className="text-2xl font-bold">ที่ตั้งของเรา</h2>
        <p className="text-red-100">มาเยี่ยมชมเราได้ที่นี่</p>
      </div>

      {/* Map */}
      <div className="aspect-video">
        <GoogleMapComponent
          center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
          zoom={15}
          markerPosition={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
          markerTitle="สำนักงานใหญ่"
        />
      </div>

      {/* Footer with Action */}
      <div className="p-4 bg-gray-50">
        <a
          href="https://www.google.com/maps/search/?api=1&query=13.685984091307898,100.72794861574249"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-600 hover:text-red-700 font-semibold"
        >
          เปิดใน Google Maps →
        </a>
      </div>
    </div>
  );
}

// ========================================
// ตัวอย่างที่ 6: Grid of Maps
// ========================================

export function MapGridExample() {
  const offices = [
    {
      name: "สำนักงานกรุงเทพ",
      coordinates: { lat: 13.685984091307898, lng: 100.72794861574249 },
    },
    {
      name: "สำนักงานเชียงใหม่",
      coordinates: { lat: 18.788244, lng: 98.985368 },
    },
    {
      name: "สำนักงานภูเก็ต",
      coordinates: { lat: 7.880775, lng: 98.392187 },
    },
    {
      name: "สำนักงานขอนแก่น",
      coordinates: { lat: 16.432087, lng: 102.835755 },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {offices.map((office, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold">{office.name}</h3>
          </div>
          <div className="h-[250px]">
            <GoogleMapComponent
              center={office.coordinates}
              zoom={13}
              markerPosition={office.coordinates}
              markerTitle={office.name}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================================
// ตัวอย่างที่ 7: Map with Animation
// ========================================

import { motion } from "framer-motion";

export function AnimatedMapExample() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-[500px] rounded-2xl overflow-hidden shadow-2xl"
    >
      <GoogleMapComponent
        center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
        zoom={15}
        markerPosition={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
        markerTitle="Animated Map"
      />
    </motion.div>
  );
}

// ========================================
// ตัวอย่างที่ 8: Full Screen Map
// ========================================

export function FullScreenMapExample() {
  return (
    <div className="fixed inset-0">
      <GoogleMapComponent
        center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
        zoom={15}
        markerPosition={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
        markerTitle="Full Screen Map"
      />
    </div>
  );
}

// ========================================
// ตัวอย่างที่ 9: Map in Modal/Dialog
// ========================================

export function MapInModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-600 text-white px-6 py-3 rounded-lg"
      >
        ดูแผนที่
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">ที่ตั้งของเรา</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="h-[500px]">
              <GoogleMapComponent
                center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
                zoom={15}
                markerPosition={{
                  lat: 13.685984091307898,
                  lng: 100.72794861574249,
                }}
                markerTitle="สำนักงานใหญ่"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// ตัวอย่างที่ 10: Custom Map ID (Styled Map)
// ========================================

export function StyledMapExample() {
  return (
    <div className="h-[500px]">
      <GoogleMapComponent
        center={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
        zoom={15}
        markerPosition={{ lat: 13.685984091307898, lng: 100.72794861574249 }}
        markerTitle="Styled Map"
        mapId="YOUR_CUSTOM_MAP_ID" // สร้างได้จาก Google Cloud Console
      />
    </div>
  );
}
