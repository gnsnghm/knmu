import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  file: File,
  productId: string
): Promise<string> {
  // 1. ファイルをBufferに変換
  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = file.name.split(".").pop() || "jpg";

  // 2. sharpでサムネイルを生成 (200x200のJPEG形式)
  const thumbnailBuffer = await sharp(originalBuffer)
    .resize(200, 200, { fit: "inside" })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 3. S3のキーと各種設定を定義
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;
  const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
  if (!cloudfrontDomain) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDFRONT_DOMAIN must be set in environment variables."
    );
  }

  const originalKey = `img/products/${productId}/original.${fileExtension}`;
  const thumbnailKey = `img/products/${productId}/thumbnail.jpg`; // サムネイルはJPEGに統一

  // 4. オリジナルとサムネイルを並列でS3にアップロード
  const uploadOriginalCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: originalKey,
    Body: originalBuffer,
    ContentType: file.type,
  });

  const uploadThumbnailCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: thumbnailKey,
    Body: thumbnailBuffer,
    ContentType: "image/jpeg",
  });

  await Promise.all([
    s3Client.send(uploadOriginalCommand),
    s3Client.send(uploadThumbnailCommand),
  ]);

  // 5. DBにはオリジナル画像のURLを返す
  return `https://${cloudfrontDomain}/${originalKey}`;
}
