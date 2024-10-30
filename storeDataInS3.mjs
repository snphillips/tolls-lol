import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import 'dotenv/config';

// Initialize the S3 client
const client = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION, // Use environment variable for region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function storeDataInS3(data, fileName) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  };

  try {
    // Use the PutObjectCommand and send method
    const command = new PutObjectCommand(params);
    await client.send(command);
    console.log(`💃 Data successfully stored in S3 as ${fileName}.`);
  } catch (error) {
    console.error('🫠 Error storing data in S3:', error);

    // Add more detailed error logging
    console.error('🛑 Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    // Re-throw the error for better error handling
    throw error;
  }
}
