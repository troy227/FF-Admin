import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FlagService } from '../services/flag.service.js';
import {
  CreateFlagDto,
  FlagListResponseDto,
  FlagResponseDto,
  UpdateFlagDto,
} from '../dto/flag.dto.js';

@Controller('ff')
export class FlagController {
  constructor(private readonly flagService: FlagService) {}

  @Get('evaluate')
  async evaluateFlags(): Promise<FlagResponseDto[]> {
    return await this.flagService.getFlagsForEvaluation();
  }

  @Get()
  async getFlags(
    @Query('cursor', new DefaultValuePipe(undefined)) cursorRaw?: string,
    @Query('limit', new DefaultValuePipe('5'), ParseIntPipe) limit?: number,
    @Query('search') search?: string,
  ): Promise<FlagListResponseDto> {
    const cursor =
      cursorRaw != null && cursorRaw !== ''
        ? Number.parseInt(cursorRaw, 10)
        : undefined;
    const safeLimit = Math.min(Math.max(limit ?? 5, 1), 50);
    return await this.flagService.getFlagsPage(cursor, safeLimit, search);
  }

  @Get(':key')
  async getFlagByKey(@Param('key') key: string): Promise<FlagResponseDto> {
    return await this.flagService.getFlagByKey(key);
  }

  @Post()
  async createFlag(@Body() createFlagDto: CreateFlagDto): Promise<FlagResponseDto> {
    return await this.flagService.createFlag(createFlagDto);
  }

  @Patch(':id')
  async updateFlag(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlagDto: UpdateFlagDto,
  ): Promise<FlagResponseDto> {
    return await this.flagService.updateFlag(id, updateFlagDto);
  }

  @Delete(':key')
  async deleteFlag(@Param('key') key: string): Promise<{ message: string }> {
    await this.flagService.deleteFlag(key);
    return { message: 'Flag deleted successfully' };
  }
}
