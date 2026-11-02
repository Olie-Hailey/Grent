import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const gadgets = [
  {
    model: "MacBook Pro 14\" M3 Pro",
    category: "Laptop",
    storage: "18GB RAM · 512GB SSD",
    color: "Space Black",
    dailyPrice: 250000,
    weeklyPrice: 1450000,
    monthlyPrice: 4500000,
    stock: 3,
    description: "Performa tinggi untuk video editing 4K, coding, dan rendering berat. Layar Liquid Retina XDR 120Hz.",
    imageEmoji: "💻",
  },
  {
    model: "MacBook Air 13\" M2",
    category: "Laptop",
    storage: "8GB RAM · 256GB SSD",
    color: "Midnight",
    dailyPrice: 150000,
    weeklyPrice: 890000,
    monthlyPrice: 2800000,
    stock: 5,
    description: "Desain ultra-tipis, baterai awet hingga 18 jam. Sangat cocok untuk presentasi, kuliah, dan kerja kantor.",
    imageEmoji: "💻",
  },
  {
    model: "Lenovo ThinkPad T14 Gen 4",
    category: "Laptop",
    storage: "Core i7 · 16GB · 512GB",
    color: "Thunder Black",
    dailyPrice: 100000,
    weeklyPrice: 590000,
    monthlyPrice: 1900000,
    stock: 4,
    description: "Laptop bisnis legendaris dengan keyboard ternyaman dan ketahanan militer. Ideal untuk kantor & seminar.",
    imageEmoji: "💼",
  },
  {
    model: "ASUS ROG Zephyrus G14",
    category: "Laptop",
    storage: "Ryzen 9 · RTX 4060 · 16GB",
    color: "Eclipse Gray",
    dailyPrice: 220000,
    weeklyPrice: 1300000,
    monthlyPrice: 4200000,
    stock: 2,
    description: "Laptop gaming & 3D rendering powerful dengan layar OLED Nebula Display. Siap untuk turnamen eSports.",
    imageEmoji: "⚡",
  },
  {
    model: "iPhone 16 Pro Max",
    category: "Smartphone",
    storage: "256GB",
    color: "Natural Titanium",
    dailyPrice: 160000,
    weeklyPrice: 950000,
    monthlyPrice: 3000000,
    stock: 4,
    description: "Flagship Apple tercanggih dengan kamera 48MP, 5x optical zoom, dan layar Super Retina XDR 6.9\".",
    imageEmoji: "📱",
  },
  {
    model: "iPhone 16 Pro",
    category: "Smartphone",
    storage: "128GB",
    color: "Black Titanium",
    dailyPrice: 140000,
    weeklyPrice: 820000,
    monthlyPrice: 2600000,
    stock: 5,
    description: "Performa A18 Pro, Camera Control button, dan desain titanium ringan untuk konten kreator.",
    imageEmoji: "🖤",
  },
  {
    model: "Samsung Galaxy S24 Ultra",
    category: "Smartphone",
    storage: "256GB · 12GB RAM",
    color: "Titanium Gray",
    dailyPrice: 150000,
    weeklyPrice: 890000,
    monthlyPrice: 2800000,
    stock: 3,
    description: "Layar Dynamic AMOLED 2X, S-Pen terintegrasi, Galaxy AI, dan zoom kamera hingga 100x.",
    imageEmoji: "🤖",
  },
  {
    model: "iPhone 15",
    category: "Smartphone",
    storage: "128GB",
    color: "Pink",
    dailyPrice: 85000,
    weeklyPrice: 500000,
    monthlyPrice: 1600000,
    stock: 6,
    description: "Pilihan favorit untuk kebutuhan sehari-hari, liburan, dan foto estetik dengan Dynamic Island.",
    imageEmoji: "💗",
  },
  {
    model: "iPad Pro 11\" M4 (2024)",
    category: "Tablet",
    storage: "256GB · Apple Pencil Pro",
    color: "Space Black",
    dailyPrice: 160000,
    weeklyPrice: 950000,
    monthlyPrice: 3000000,
    stock: 3,
    description: "iPad tertipis dengan layar Ultra Retina Tandem OLED dan chip M4 revolusioner. Sudah termasuk Apple Pencil Pro.",
    imageEmoji: "🎨",
  },
  {
    model: "iPad Air 5 M1",
    category: "Tablet",
    storage: "64GB · WiFi",
    color: "Starlight",
    dailyPrice: 90000,
    weeklyPrice: 530000,
    monthlyPrice: 1700000,
    stock: 4,
    description: "Sangat fleksibel untuk digital sketching, baca modul kuliah, POS kasir event, dan konsumsi media.",
    imageEmoji: "📱",
  },
];

async function main() {
  await prisma.rental.deleteMany();
  await prisma.phone.deleteMany();
  await prisma.phone.createMany({ data: gadgets });
  console.log(`Berhasil melakukan seed ${gadgets.length} unit gadget.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
