/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://app.bjhbangkok.com",
  generateRobotsTxt: false, // We have a custom robots.txt
  changefreq: "weekly",
  priority: 0.7,
  exclude: [
    "/api/*", 
    "/_next/*", 
    "/home", 
    "/login", 
    "/register",
    "/oauth2callback",
    "/all-files-gallery",
    "/facebook-ads-manager/*",
    "/customer-contact-dashboard/*",
  ],
  additionalPaths: async (config) => [
    // Ensure homepage is always included with highest priority
    {
      loc: '/',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString(),
    },
  ],
  transform: async (config, path) => {
    // โฮมเพจเด่นสุด - สำคัญที่สุดสำหรับ "bjh bangkok", "bjh", "โรงพยาบาลบีเจเอช"
    if (path === "/") {
      return {
        loc: path,
        changefreq: "daily",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }
    
    // หน้าหลักที่สำคัญ - priority สูง
    const highPriorityPages = [
      "/about",
      "/about-executives", 
      "/services",
      "/contact",
      "/careers",
      "/quality-certification",
      "/quality-control",
    ];
    
    if (highPriorityPages.includes(path)) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // หน้าข่าวสาร - priority ปานกลาง
    if (path.startsWith("/tpp-news") || path.startsWith("/news")) {
      return {
        loc: path,
        changefreq: "daily",
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // ค่าเริ่มต้นสำหรับหน้าทั่วไป
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
