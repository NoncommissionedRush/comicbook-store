import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { Cart } from "../../@types/common";
import { BooksService } from "../books/books.service";
import { ReservationItemDto } from "../reservations/dtos/reservation-item.dto";

@Injectable()
export class CartService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly booksService: BooksService,
  ) {}

  async get(sessionId: string): Promise<Cart> {
    const key = "cart:" + sessionId;
    let cart: Cart = await this.cacheManager.get(key);

    if (!cart) {
      cart = { items: [], size: 0, total: 0 };
    }

    return cart;
  }

  async add(sessionId: string, item: ReservationItemDto): Promise<Cart> {
    const book = await this.booksService.findOne(item.bookId);
    if (!book) {
      throw new NotFoundException("Book not found");
    }

    if (book.amount < item.amount) {
      throw new BadRequestException("Not enough items in the inventory");
    }

    const cart = await this.get(sessionId);

    if (cart.items.some((i) => i.book.id === book.id)) {
      return await this.update(sessionId, item);
    }

    cart.items.push({ book, amount: item.amount });
    cart.total += book.price * item.amount;
    cart.size += item.amount;
    const key = "cart:" + sessionId;
    await this.cacheManager.set(key, cart);
    return cart;
  }

  async remove(sessionId: string, bookId: number): Promise<Cart> {
    const cart = await this.get(sessionId);
    cart.items = cart.items.filter((item) => item.book.id !== bookId);
    cart.total = cart.items.reduce((acc, item) => {
      return acc + item.book.price * item.amount;
    }, 0);
    await this.cacheManager.set("cart:" + sessionId, cart);
    return cart;
  }

  async update(sessionId: string, item: ReservationItemDto): Promise<Cart> {
    const cart = await this.get(sessionId);
    const index = cart.items.findIndex((i) => i.book.id === item.bookId);
    if (index === -1) {
      throw new NotFoundException("Item not found");
    }
    const cartItem = cart.items[index];
    cart.total -= cartItem.book.price * cartItem.amount;
    cart.items[index] = { ...cartItem, amount: cartItem.amount + item.amount };
    cart.total += cartItem.book.price * cartItem.amount;
    cart.size += item.amount;
    await this.cacheManager.set("cart:" + sessionId, cart);
    return cart;
  }

  async clear(sessionId: string) {
    await this.cacheManager.del("cart:" + sessionId);
  }
}
