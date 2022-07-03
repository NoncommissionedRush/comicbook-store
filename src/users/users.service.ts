import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findOne(id: number): Promise<User>;
  findOne(username: string): Promise<User>;
  findOne(idOrUsername: number | string): Promise<User> {
    if (typeof idOrUsername === "number") {
      return this.repo.findOne(idOrUsername);
    }

    return this.repo.findOne({ where: { username: idOrUsername } });
  }

  create(username: string, password: string): Promise<User> {
    const user = this.repo.create({ username, password });
    return this.repo.save(user);
  }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    const user = await this.repo.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }

    Object.assign(user, attrs);

    const updatedUser = this.repo.save(user);

    return updatedUser;
  }
}
