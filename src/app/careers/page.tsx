import React from "react";
import { Metadata } from "next";
import CareersHero from "@/components/Careers/CareersHero";
import JobCategories from "@/components/Careers/JobCategories";
import JobListings from "@/components/Careers/JobListings";
import WhyJoinUs from "@/components/Careers/WhyJoinUs";
import Container from "@/components/Container";
export const metadata: Metadata = {
  title: "ร่วมงานกับเรา | BJH Bangkok",
  description:
    "โอกาสในการทำงานกับ BJH Bangkok ศูนย์ศัลยกรรมความงามชั้นนำ โดยแพทย์ศัลยกรรมเฉพาะทางมาตรฐานสากล",
  keywords: "สมัครงาน, ร่วมงาน, อาชีพ, BJH Bangkok, โรงพยาบาล, งานว่าง, ตำแหน่งงาน",
};
export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <CareersHero />
      {/* Why Join Us Section */}
      <WhyJoinUs />
      {/* Job Categories */}
      <section className="py-16 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ค้นหาตำแหน่งงานที่เหมาะกับคุณ
            </h2>
            <p className="text-lg text-gray-600">
              เรามีโอกาสในการทำงานหลากหลายสายงาน
            </p>
          </div>
          <JobCategories />
        </Container>
      </section>
      {/* Job Listings */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ตำแหน่งงานที่เปิดรับสมัคร
            </h2>
            <p className="text-lg text-gray-600">
              ตำแหน่งงานล่าสุดที่รอคุณอยู่
            </p>
          </div>
          <JobListings />
        </Container>
      </section>
    </div>
  );
}
