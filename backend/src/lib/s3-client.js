// backend/src/lib/s3-client.js
import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_S3_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error(
    "AWS S3 environment variables (AWS_S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are not fully configured."
  );
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export { s3Client };
