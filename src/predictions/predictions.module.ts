import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RoutesModule } from '../routes/routes.module';
import { PredictionsController } from './controllers/predictions.controller';
import { AggregatorService } from './services/aggregator.service';
import { OpenAiService } from './services/open-ai.service';
import { OpenWeatherService } from './services/open-weather.service';
import { PredictionsService } from './services/predictions.service';
import { RoutePointResolverService } from './services/route-point-resolver.service';

@Module({
  imports: [HttpModule, RoutesModule],
  controllers: [PredictionsController],
  providers: [
    PredictionsService,
    OpenWeatherService,
    RoutePointResolverService,
    AggregatorService,
    OpenAiService,
  ],
})
export class PredictionsModule {}
