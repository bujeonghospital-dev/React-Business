/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://tpp-thanakon.store",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/api/*", "/_next/*"],
  transform: async (config, path) => {
    // โฮมเพจเด่นสุด
    if (path === "/") {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 1.0,
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
