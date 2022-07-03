import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { BooksModule } from "../books/books.module";

@Module({
  imports: [BooksModule],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
