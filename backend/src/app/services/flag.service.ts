import { Injectable, NotFoundException } from '@nestjs/common';
import { Flag } from '../../database/models/flag.model.js';
import {
  FlagListResponseDto,
  FlagResponseDto,
} from '../dto/flag.dto.js';
import { FlagsRepository } from '../repositories/flags.repository.js';
import { CreateFlagInput, UpdateFlagInput } from '../repositories/types.js';

function toFlagResponseDto(flag: Flag): FlagResponseDto {
  return {
    id: flag.id,
    key: flag.key,
    userIds: flag.userIds,
    enabled: flag.enabled,
  };
}

@Injectable()
export class FlagService {
  constructor(private readonly flagsRepository: FlagsRepository) {}

  async getFlagsPage(
    cursor: number | undefined,
    limit: number,
    search?: string,
  ): Promise<FlagListResponseDto> {
    const { items, nextCursor } = await this.flagsRepository.findPage({
      cursor,
      limit,
      search,
    });

    return {
      items,
      nextCursor,
    };
  }

  async getFlagsForEvaluation(): Promise<FlagResponseDto[]> {
    const flags = await this.flagsRepository.findAll();
    return flags.map(toFlagResponseDto);
  }

  async getFlagByKey(key: string): Promise<FlagResponseDto> {
    const flag = await this.flagsRepository.findOne({ key });
    return toFlagResponseDto(flag);
  }

  async createFlag(input: CreateFlagInput): Promise<FlagResponseDto> {
    const flag = await this.flagsRepository.create(input);
    return toFlagResponseDto(flag);
  }

  async updateFlag(
    id: number,
    input: UpdateFlagInput,
  ): Promise<FlagResponseDto> {
    const flag = await this.flagsRepository.update(id, input);
    if (!flag) {
      throw new NotFoundException('Flag not found');
    }
    return toFlagResponseDto(await this.flagsRepository.findOne({ id }));
  }

  async deleteFlag(key: string): Promise<void> {
    const deleted = await this.flagsRepository.delete(key);
    if (!deleted) {
      throw new NotFoundException('Flag not found');
    }
  }
}
