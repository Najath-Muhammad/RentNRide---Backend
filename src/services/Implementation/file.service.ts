import { generateUploadUrl } from "../../utils/s3";
import type { IFileService } from "../Interfaces/file.interface.service";

export class FileService implements IFileService {
	async generateUploadUrl(
		fileName: string,
		fileType: string,
	): Promise<{ success: boolean; uploadUrl?: string; publicUrl?: string }> {
		try {
			const { uploadUrl, publicUrl } = await generateUploadUrl(
				fileName,
				fileType,
			);

			return { success: true, uploadUrl, publicUrl };
		} catch (error) {
			console.error("S3 upload URL error:", error);
			return { success: false };
		}
	}
}
