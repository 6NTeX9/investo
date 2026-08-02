import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Scanning PostgreSQL database for Google imgres links...");

  const images = await prisma.propertyImage.findMany();
  console.log(`Checking ${images.length} property images...`);

  let fixedImagesCount = 0;
  for (const img of images) {
    if (img.url.includes("google.com/imgres") || img.url.includes("google.co.in/imgres")) {
      try {
        const u = new URL(img.url);
        const actual = u.searchParams.get("imgurl");
        if (actual) {
          const decoded = decodeURIComponent(actual);
          console.log(`✅ Fixing property image [ID: ${img.id}] -> ${decoded}`);
          await prisma.propertyImage.update({
            where: { id: img.id },
            data: { url: decoded },
          });
          fixedImagesCount++;
        }
      } catch (err) {
        console.error(`Failed to process image ${img.id}:`, err);
      }
    }
  }

  const blogs = await prisma.blog.findMany();
  console.log(`Checking ${blogs.length} blog posts...`);

  let fixedBlogsCount = 0;
  for (const blog of blogs) {
    if (blog.coverUrl && (blog.coverUrl.includes("google.com/imgres") || blog.coverUrl.includes("google.co.in/imgres"))) {
      try {
        const u = new URL(blog.coverUrl);
        const actual = u.searchParams.get("imgurl");
        if (actual) {
          const decoded = decodeURIComponent(actual);
          console.log(`✅ Fixing blog cover [ID: ${blog.id}] -> ${decoded}`);
          await prisma.blog.update({
            where: { id: blog.id },
            data: { coverUrl: decoded },
          });
          fixedBlogsCount++;
        }
      } catch (err) {
        console.error(`Failed to process blog ${blog.id}:`, err);
      }
    }
  }

  console.log(`🎉 Complete! Fixed ${fixedImagesCount} property images and ${fixedBlogsCount} blog posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
