import { Book } from "../../src/books/entities/book.entity";

export type MockProvider<T> = {
  [P in keyof T]: jest.Mock<any>;
};

export type Cart = {
  items: CartItem[];
  size: number;
  total: number;
};

export type CartItem = {
  book: Book;
  amount: number;
};
