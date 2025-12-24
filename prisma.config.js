const { defineConfig } = require("@prisma/config");

module.exports = defineConfig({
  datasource: {
    db: {
      url: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_URL,
    },
  },
});
