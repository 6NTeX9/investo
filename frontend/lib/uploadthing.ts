import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate typed hooks and functions to be used on the frontend
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
