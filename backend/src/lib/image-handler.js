// backend/src/lib/image-handler.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import sharp from "sharp";
import { s3Client } from "./s3-client.js";

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN;

/**
 * URLから画像をダウンロードし、AWS S3にキャッシュします。
 * @param {string} externalUrl ダウンロード元の画像URL
 * @param {number} productId 関連付ける商品ID
 * @returns {Promise<string>} CloudFrontの公開URL
 */
export async function cacheProductImageToS3(externalUrl, productId) {
  if (!BUCKET_NAME || !CLOUDFRONT_DOMAIN) {
    throw new Error(
      "AWS_S3_BUCKET_NAME and AWS_CLOUDFRONT_DOMAIN must be set in environment variables.",
    );
  }
  if (!externalUrl) {
    // URLがなければ何もしないで成功とみなす
    return null;
  }

  // 1. 画像データをバッファとして取得
  const response = await axios.get(externalUrl, {
    responseType: "arraybuffer",
  });
  const imageBuffer = Buffer.from(response.data);

  // サムネイル画像を生成
  const thumbnailBuffer = await sharp(imageBuffer)
    .resize(200, 200, { fit: "inside" })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 2. S3のキー（ファイルパス）とContent-Typeを決定
  const contentType = response.headers["content-type"] || "image/jpeg"; // デフォルトはjpeg
  const extension = (contentType.split("/")[1] || "jpg").split(";")[0];
  const originalKey = `img/products/${productId}/original.${extension}`;
  const thumbnailKey = `img/products/${productId}/thumbnail.jpg`;

  // 3. S3にアップロードするためのコマンドを作成
  const uploadOriginal = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: originalKey,
    Body: imageBuffer,
    ContentType: contentType,
  });

  const uploadThumbnail = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: thumbnailKey,
    Body: thumbnailBuffer,
    ContentType: "image/jpeg",
  });

  await Promise.all([
    s3Client.send(uploadOriginal),
    s3Client.send(uploadThumbnail),
  ]);

  return `https://${CLOUDFRONT_DOMAIN}/${originalKey}`;
}

/**
 * ファイルバッファをS3にアップロードします。
 * @param {Buffer} fileBuffer - 画像のバッファ
 * @param {string} mimeType - 画像のMIMEタイプ (e.g., 'image/jpeg')
 * @param {number} productId - 関連付ける商品ID
 * @returns {Promise<string>} CloudFrontの公開URL
 */
export async function uploadImageBufferToS3(fileBuffer, mimeType, productId) {
  if (!BUCKET_NAME || !CLOUDFRONT_DOMAIN) {
    throw new Error(
      "AWS_S3_BUCKET_NAME and AWS_CLOUDFRONT_DOMAIN must be set in environment variables.",
    );
  }

  const extension = (mimeType.split("/")[1] || "jpg").split(";")[0];
  const originalKey = `img/products/${productId}/original.${extension}`;
  const thumbnailKey = `img/products/${productId}/thumbnail.jpg`;

  const thumbnailBuffer = await sharp(fileBuffer)
    .resize(200, 200, { fit: "inside" })
    .jpeg({ quality: 80 })
    .toBuffer();

  const uploadOriginal = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: originalKey,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  const uploadThumbnail = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: thumbnailKey,
    Body: thumbnailBuffer,
    ContentType: "image/jpeg",
  });

  await Promise.all([
    s3Client.send(uploadOriginal),
    s3Client.send(uploadThumbnail),
  ]);

  return `https://${CLOUDFRONT_DOMAIN}/${originalKey}`;
}
