import { Injectable, NotFoundException } from '@nestjs/common';
import { Flag } from '../../database/models/flag.model.js';
import { CreateFlagInput, UpdateFlagInput } from './types.js';
import { WhereOptions } from 'sequelize';

@Injectable()
export class FlagsRepository {
  findAll(): Promise<Flag[]> {
    return Flag.findAll({ order: [['key', 'ASC']] });
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
