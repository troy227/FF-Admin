import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller.js';
import { AppService } from './services/app.service.js';
import { FlagController } from './controllers/flag.controller.js';
import { FlagService } from './services/flag.service.js';
import { FlagsRepository } from './repositories/flags.repository.js';

@Module({
  imports: [],
  controllers: [AppController, FlagController],
  providers: [AppService, FlagService, FlagsRepository],
})
export class AppModule {}
