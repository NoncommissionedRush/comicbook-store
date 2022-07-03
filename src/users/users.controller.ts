import {
  Body,
  CACHE_MANAGER,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { AuthGuard } from "./guards/auth.guard";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get("/me")
  @UseGuards(AuthGuard)
  me(): boolean {
    return true;
  }

  @Post("auth/register")
  async register(
    @Body() body: CreateUserDto,
    @Session() session: Record<string, any>,
  ): Promise<User> {
    const user = await this.authService.register(body.username, body.password);
    session.userId = user.id;
    return user;
  }

  @Post("auth/login")
  async login(
    @Body() body: CreateUserDto,
    @Session() session: Record<string, any>,
  ): Promise<User> {
    const user = await this.authService.login(body.username, body.password);
    session.userId = user.id;
    return user;
  }

  @Delete("auth/logout")
  logout(@Session() session: Record<string, any>): void {
    session.destroy((error) => {
      if (error) {
        console.log("session destroy error: ", error);
      }
    });
  }

  @Patch("/:id")
  update(@Query("id") id: string, @Body() body: UpdateUserDto): Promise<User> {
    return this.usersService.update(Number(id), body);
  }
}
