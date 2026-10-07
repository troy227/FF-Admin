import { Injectable, NotFoundException } from '@nestjs/common';
import { Op, WhereOptions } from 'sequelize';
import { Flag } from '../../database/models/flag.model.js';
import { CreateFlagInput, UpdateFlagInput } from './types.js';

export type FindFlagsPageInput = {
  cursor?: number;
  limit: number;
  search?: string;
};

@Injectable()
export class FlagsRepository {
  findAll(): Promise<Flag[]> {
    return Flag.findAll({ order: [['id', 'ASC']] });
  }

  async findPage(input: FindFlagsPageInput): Promise<{
    items: Flag[];
    nextCursor: number | null;
  }> {
    const where: WhereOptions<Flag> = {};

    if (input.search?.trim()) {
      where.key = { [Op.iLike]: `%${input.search.trim()}%` };
    }

    if (input.cursor != null) {
      where.id = { [Op.gt]: input.cursor };
    }

    const rows = await Flag.findAll({
      where,
      order: [['id', 'ASC']],
      limit: input.limit + 1,
    });

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor };
  }

  async findOne(where: WhereOptions<Flag>): Promise<Flag> {
    const flag = await Flag.findOne({ where });
    if (!flag) {
      throw new NotFoundException('Flag not found');
    }
    return flag;
  }

  create(input: CreateFlagInput): Promise<Flag> {
    return Flag.create({
        ...input,
    });
  }

  async update(id: number, input: UpdateFlagInput): Promise<Flag> {
    const flag = await this.findOne({ id });
    return flag.update(input);
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await Flag.destroy({ where: { key } });
    return deleted > 0;
  }
}
