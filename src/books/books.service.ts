import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Book } from "./entities/book.entity";
import { TagsService } from "./tags.service";

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private readonly repo: Repository<Book>,
    private readonly tagsService: TagsService,
  ) {}

  async findAll(): Promise<Book[]> {
    return await this.repo.find({ relations: ["tags"] });
  }

  async findByTags(tags: string[]): Promise<Book[]> {
    return await this.repo
      .createQueryBuilder("book")
      .innerJoinAndSelect("book.tags", "tagSelect")
      .groupBy("book.id")
      .addGroupBy("tagSelect.id")
      .innerJoin("book.tags", "tag")
      .having("array_agg(tag.name)::text[] @> ARRAY[:...tags]", {
        tags,
      })
      .getMany();
  }

  async findOne(title: string): Promise<Book>;
  async findOne(id: number): Promise<Book>;
  async findOne(param: string | number): Promise<Book> {
    let book: Book;

    if (typeof param === "number") {
      book = await this.repo.findOne(param, { relations: ["tags"] });
    }

    if (typeof param === "string") {
      book = await this.repo.findOne({
        where: { title: param },
        relations: ["tags"],
      });
    }

    if (!book) {
      throw new NotFoundException("book not found");
    }

    return book;
  }

  async create(
    title: string,
    amount: number,
    price: number,
    imageUrl: string,
    tags: string[],
  ): Promise<Book> {
    const book = this.repo.create({ title, amount, price, imageUrl });

    book.tags = await this.tagsService.fromStringArray(tags);

    return await this.repo.save(book);
  }

  async update(id: number, attrs: Partial<Book>): Promise<Book> {
    const book = await this.findOne(id);

    Object.assign(book, attrs);

    return await this.repo.save(book);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
