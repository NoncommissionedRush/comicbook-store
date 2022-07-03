import { Transform, Type } from "class-transformer";
import { IsArray, IsOptional, IsString } from "class-validator";

export class TagsQueryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.split(","))
  tags?: string[];
}
