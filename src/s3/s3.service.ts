import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import AWS from "aws-sdk";

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}

  private AWS_S3_BUCKET = this.configService.get("s3.bucket");
  private s3 = new AWS.S3({
    accessKeyId: this.configService.get("s3.accessKeyId"),
    secretAccessKey: this.configService.get("s3.secretAccessKey"),
  });

  async uploadFile(file) {
    const { originalname } = file;

    return await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
  }

  private async s3_upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: "public-read",
      ContentType: mimetype,
      ContentDisposition: "inline",
      CreateBucketConfiguration: {
        LocationConstraint: "ap-south-1",
      },
    };

    try {
      return await this.s3.upload(params).promise();
    } catch (e) {
      console.log("AWS s3 upload error", e);
    }
  }
}
