export interface IFileService {
	generateUploadUrl(
		fileName: string,
		fileType: string,
	): Promise<{ success: boolean; uploadUrl?: string; publicUrl?: string }>;
}
