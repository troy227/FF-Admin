import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { FlagService } from '../services/flag.service.js';
import { Flag } from '../../database/models/flag.model.js';
import { CreateFlagDto, UpdateFlagDto } from '../dto/flag.dto.js';

@Controller('ff')
export class FlagController {
  constructor(private readonly flagService: FlagService) {}

  @Get()
  async getFlags(): Promise<Flag[]> {
    return await this.flagService.getFlags();
  }

  @Get(":key")
  async getFlagByKey(@Param('key') key: string): Promise<Flag> {
    const flag = await this.flagService.getFlagByKey(key);
    if (!flag) {
      throw new NotFoundException('Flag not found');
    }
    return flag;
  }

  @Post()
  async createFlag(@Body() createFlagDto: CreateFlagDto): Promise<Flag> {
    return await this.flagService.createFlag(createFlagDto);
  }

  @Patch(":id")
  async updateFlag(@Param('id') id: number, @Body() updateFlagDto: UpdateFlagDto): Promise<Flag> {
    return await this.flagService.updateFlag(id, updateFlagDto);
  }

  @Delete(":key")
  async deleteFlag(@Param('key') key: string): Promise<{ message: string }> {
    await this.flagService.deleteFlag(key);
    return { message: 'Flag deleted successfully' };
  }
}