// backend/src/scripts/migrate-images-to-s3.js
import { pool } from "../db.js";
import { cacheProductImageToS3 } from "../lib/image-handler.js";

async function migrateImages() {
  console.log("Starting image migration to S3...");

  let client;
  try {
    client = await pool.connect();

    // 1. image_url があり、image_path がない商品を取得
    const { rows: productsToMigrate } = await client.query(
      `SELECT id, image_url FROM products WHERE image_url IS NOT NULL AND image_path IS NULL`
    );

    if (productsToMigrate.length === 0) {
      console.log("No images to migrate. All products seem to be up-to-date.");
      return;
    }

    console.log(`Found ${productsToMigrate.length} products to migrate.`);

    let successCount = 0;
    let errorCount = 0;

    // 2. 各商品をループして処理
    for (const product of productsToMigrate) {
      try {
        console.log(
          `Processing product ID: ${product.id}, URL: ${product.image_url}`
        );

        // 3. 画像をS3にキャッシュ
        const s3Path = await cacheProductImageToS3(
          product.image_url,
          product.id
        );

        if (s3Path) {
          // 4. DBのimage_pathを更新
          await client.query(
            `UPDATE products SET image_path = $1 WHERE id = $2`,
            [s3Path, product.id]
          );
          console.log(
            `  -> Successfully migrated and updated DB for product ID: ${product.id}. Path: ${s3Path}`
          );
          successCount++;
        }
      } catch (error) {
        console.error(
          `  -> Failed to migrate product ID: ${product.id}. Error: ${error.message}`
        );
        errorCount++;
      }
    }

    console.log("\nMigration finished.");
    console.log(`- Successful migrations: ${successCount}`);
    console.log(`- Failed migrations: ${errorCount}`);
  } catch (err) {
    console.error("An unexpected error occurred during migration:", err);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log("Migration script finished.");
  }
}

migrateImages();
