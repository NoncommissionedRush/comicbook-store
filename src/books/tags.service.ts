import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tag } from "./entities/tag.entity";

@Injectable()
export class TagsService {
  constructor(@InjectRepository(Tag) private readonly repo: Repository<Tag>) {}

  async findAll(): Promise<Tag[]> {
    return await this.repo.find();
  }

  async findOne(name: string): Promise<Tag>;
  async findOne(id: number): Promise<Tag>;
  async findOne(param: string | number): Promise<Tag> {
    if (typeof param === "number") {
      return await this.repo.findOne(param);
    }
    return await this.repo.findOne({ where: { name: param } });
  }

  async create(name: string): Promise<Tag> {
    const tag = this.repo.create({ name });

    return await this.repo.save(tag);
  }

  async update(id: number, attrs: Partial<Tag>): Promise<Tag> {
    const tag = await this.repo.findOne(id);
    if (!tag) {
      throw new NotFoundException("Tag not found");
    }
    Object.assign(tag, attrs);
    return await this.repo.save(tag);
  }

  async delete(id: number): Promise<void> {
    const tag = await this.repo.findOne(id);
    if (!tag) {
      throw new NotFoundException("Tag not found");
    }
    await this.repo.delete(id);
  }

  async fromStringArray(tags: string[]): Promise<Tag[]> {
    const tagEntities: Tag[] = [];

    for (const tag of tags) {
      let tagEntity = await this.findOne(tag);
      if (!tagEntity) {
        tagEntity = await this.create(tag);
      }
      tagEntities.push(tagEntity);
    }

    return tagEntities;
  }
}
