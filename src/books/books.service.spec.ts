import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MockProvider } from "../../@types/common";
import { Book } from "./entities/book.entity";
import { BooksService } from "./books.service";

describe("BooksService", () => {
  let service: BooksService;
  let repository: MockProvider<Repository<Book>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(Book)) {
          return {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          };
        }
      })
      .compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get(getRepositoryToken(Book));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });
});
