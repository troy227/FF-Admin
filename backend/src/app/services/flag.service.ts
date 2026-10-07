import { Injectable, NotFoundException } from '@nestjs/common';
import { Flag } from '../../database/models/flag.model.js';
import { FlagsRepository } from '../repositories/flags.repository.js';
import { CreateFlagInput, UpdateFlagInput } from '../repositories/types.js';

@Injectable()
export class FlagService {
    constructor(private readonly flagsRepository: FlagsRepository) { }

    async getFlags(): Promise<Flag[]> {
        return await this.flagsRepository.findAll();
    }

    async getFlagByKey(key: string): Promise<Flag> {
        return await this.flagsRepository.findOne({ key });
    }

    async createFlag(input: CreateFlagInput): Promise<Flag> {
        return await this.flagsRepository.create(input);
    }

    async updateFlag(id: number, input: UpdateFlagInput): Promise<Flag> {
        const flag = await this.flagsRepository.update(id, input);
        if (!flag) {
            throw new NotFoundException('Flag not found');
        }
        return await this.flagsRepository.findOne({ id });
    }

    async deleteFlag(key: string): Promise<void> {
        const flag = await this.flagsRepository.delete(key);
        if (!flag) {
            throw new NotFoundException('Flag not found');
        }
        return;
    }
}
