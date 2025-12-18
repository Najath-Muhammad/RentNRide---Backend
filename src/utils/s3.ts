import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {PutObjectCommand} from '@aws-sdk/client-s3';




const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

export const generateUploadUrl = async (fileName: string, fileType: string): Promise<string> => {
  const key = `uploads/${fileName}`
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

