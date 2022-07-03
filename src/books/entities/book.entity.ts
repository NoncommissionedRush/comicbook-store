import { Transform } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Tag } from "./tag.entity";

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  amount: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToMany(() => Tag, (tag) => tag.books)
  @JoinTable()
  // show only tag names instead of full tag objects
  @Transform(({ value }) => value.map((tag: { name: string }) => tag.name))
  tags: Tag[];
}
