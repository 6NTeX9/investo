async function test() {
  console.log("Testing new API key...");
  try {
    const res = await fetch("https://uploadthing.com/api/prepareUpload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": "sk_live_856f815f61ef0fde941bdf80892f161590d36db61e67e0c7005034b127fe3622",
        "x-uploadthing-version": "6.12.0"
      },
      body: JSON.stringify({
        files: [{ name: "test.png", size: 100, type: "image/png" }],
        fileRoute: "imageUploader",
        callbackUrl: "http://localhost:3000/api/uploadthing",
        callbackSlug: "test"
      })
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
  } catch (err) {
    console.error(err);
  }
}
test();
