import { Request, Response } from 'express';
import { HttpStatus } from '../../constants/enum/StatusCode';
import { IFileController } from '../interfaces/IFileController';
import { IFileService } from '../../services/Interfaces/IFileService';

export class FileController implements IFileController{

  constructor(private _fileService:IFileService) {}

  async generateUploadUrl(req: Request, res: Response):Promise<Response> {
    try {
      const { fileName, fileType } = req.body;
  
      if (!fileName || !fileType) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'fileName and fileType required' });
      }

      const response = await this._fileService.generateUploadUrl(fileName, fileType);
      return res.json({
          uploadUrl: response.uploadUrl, 
          publicUrl: response.publicUrl 
      });
    } catch (error) {
      console.error('Generate upload URL error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to generate upload URL' });
    }
  }
}        