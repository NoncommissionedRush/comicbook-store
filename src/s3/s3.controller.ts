import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { S3Service } from "./s3.service";

@Controller("upload")
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @Post()
  @UseInterceptors(FileInterceptor("file")) // this saves the file to the request object ?
  async uploadFile(@UploadedFile() file) {
    const { Location } = await this.s3Service.uploadFile(file);
    return Location;
  }
}
