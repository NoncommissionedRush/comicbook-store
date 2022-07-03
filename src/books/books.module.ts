import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Book } from "./entities/book.entity";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";
import { TagsService } from "./tags.service";
import { Tag } from "./entities/tag.entity";
import { S3Service } from "../s3/s3.service";
import { S3Controller } from "../s3/s3.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Book, Tag])],
  providers: [BooksService, TagsService, S3Service],
  controllers: [BooksController, S3Controller],
  exports: [BooksService],
})
export class BooksModule {}
