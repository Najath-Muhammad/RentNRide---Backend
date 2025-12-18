import { generateUploadUrl } from '../../utils/s3';
import { IFileService } from '../Interfaces/IFileService';

export class FileService implements IFileService{

    async generateUploadUrl(fileName:string,fileType:string):Promise<{success:boolean,uploadUrl?:string}>{
        try {
            const uploadUrl = await generateUploadUrl(fileName, fileType);
            return {success:true,uploadUrl:uploadUrl}
        } catch (error) {
            console.log(error)
            return {success:false}
        }
    }
    
}