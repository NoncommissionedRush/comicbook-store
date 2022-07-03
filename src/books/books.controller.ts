import {
  Body,
  CACHE_MANAGER,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { AuthGuard } from "../users/guards/auth.guard";
import { BooksService } from "./books.service";
import { CreateBookDto } from "./dtos/create-book.dto";
import { TagsQueryDto } from "./dtos/tags-query.dto";
import { UpdateBookDto } from "./dtos/update-book.dto";
import { Book } from "./entities/book.entity";
import { Tag } from "./entities/tag.entity";
import { TagsService } from "./tags.service";

@Controller("books")
@UseInterceptors(ClassSerializerInterceptor)
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly tagsService: TagsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get()
  findAll(): Promise<Book[]> {
    return this.booksService.findAll();
  }

  @Get("/search")
  findByTags(@Query() query: TagsQueryDto): Promise<Book[]> {
    return this.booksService.findByTags(query.tags);
  }

  @Get("/tags")
  findAllTags(): Promise<Tag[]> {
    return this.tagsService.findAll();
  }

  @Get("/:id")
  findOne(@Param("id") id: number): Promise<Book> {
    return this.booksService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() body: CreateBookDto): Promise<Book> {
    this.cacheManager.del("/books");
    return this.booksService.create(
      body.title,
      body.amount,
      body.price,
      body.imageUrl,
      body.tags || [],
    );
  }

  @Patch("/:id")
  @UseGuards(AuthGuard)
  update(id: number, attrs: UpdateBookDto): Promise<Book> {
    return this.booksService.update(id, attrs);
  }
}
