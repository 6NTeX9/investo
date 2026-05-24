import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for our App, decoding upload rules
export const ourFileRouter = {
  // Image uploader for property photos and agent avatars
  imageUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload completed. File URL:", file.url);
    return { url: file.url, key: file.key };
  }),

  // Document uploader for property PDFs / brochures
  documentUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Document upload completed. File URL:", file.url);
    return { url: file.url, key: file.key };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
