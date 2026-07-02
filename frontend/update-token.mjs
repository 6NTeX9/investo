import fs from 'fs';

const rawJson = JSON.stringify({
  apiKey: "sk_live_856f815f61ef0fde941bdf80892f161590d36db61e67e0c7005034b127fe3622",
  appId: "nv3jinq3tz",
  regions: ["sea1"]
});

const token = Buffer.from(rawJson).toString('base64');
console.log("New Token:", token);

function updateEnv(path) {
  let content = fs.readFileSync(path, 'utf-8');
  content = content.replace(/UPLOADTHING_TOKEN=.*/, `UPLOADTHING_TOKEN=${token}`);
  fs.writeFileSync(path, content);
  console.log(`Updated ${path}`);
}

updateEnv('frontend/.env');
updateEnv('backend/.env');
