import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "dotenv";

config();

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsBucketName = process.env.AWS_BUCKET_NAME;

if (!awsAccessKeyId || !awsSecretAccessKey) {
	throw new Error("AWS credentials are not defined in environment variables");
}

const s3Client = new S3Client({
	region: awsRegion,
	credentials: {
		accessKeyId: awsAccessKeyId,
		secretAccessKey: awsSecretAccessKey,
	},
	requestChecksumCalculation: "WHEN_REQUIRED",
});

export const generateUploadUrl = async (
	fileName: string,
	fileType: string,
): Promise<{ uploadUrl: string; publicUrl: string }> => {
	if (!awsBucketName) {
		throw new Error("AWS_BUCKET_NAME is not defined in environment variables");
	}

	const key = `uploads/${fileName}`;

	const command = new PutObjectCommand({
		Bucket: awsBucketName,
		Key: key,
		ContentType: fileType,
	});

	const uploadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: 600,
	});

	const publicUrl = `https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/${key}`;

	return { uploadUrl, publicUrl };
};
