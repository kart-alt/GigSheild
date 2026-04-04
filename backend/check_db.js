const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
prisma.worker.findMany().then(function(ws) {
  console.log("Workers in DB:", ws.length);
  ws.forEach(function(w) {
    console.log(" -", w.id, w.name, w.phone, w.zone, w.platform);
  });
  return prisma.$disconnect();
}).catch(function(e) {
  console.error(e.message);
  process.exit(1);
});
