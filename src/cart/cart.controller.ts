import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Session,
} from "@nestjs/common";
import { ReservationItemDto } from "../reservations/dtos/reservation-item.dto";
import { CartService } from "./cart.service";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@Session() session: Record<string, any>) {
    return this.cartService.get(session.id);
  }

  @Post()
  add(
    @Session() session: Record<any, string>,
    @Body() item: ReservationItemDto,
  ) {
    return this.cartService.add(session.id, item);
  }

  @Put("update")
  update(
    @Session() session: Record<any, string>,
    @Body() item: ReservationItemDto,
  ) {
    return this.cartService.update(session.id, item);
  }

  @Put("remove")
  remove(
    @Session() session: Record<any, string>,
    @Body() item: ReservationItemDto,
  ) {
    return this.cartService.remove(session.id, item.bookId);
  }

  @Delete()
  clear(@Session() session: Record<any, string>) {
    return this.cartService.clear(session.id);
  }
}
