import { Test, TestingModule } from "@nestjs/testing";
import { MockProvider } from "../../@types/common";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";

describe("BooksController", () => {
  let controller: BooksController;
  let booksService: MockProvider<BooksService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
    })
      .useMocker((token) => {
        if (token === BooksService) {
          return {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          };
        }
      })
      .compile();

    controller = module.get<BooksController>(BooksController);
    booksService = module.get(BooksService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(booksService).toBeDefined();
  });
});
