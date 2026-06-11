import { PartialType } from '@nestjs/swagger';
import { ApplyCarrierDto } from './apply-carrier.dto';

export class UpdateCarrierProfileDto extends PartialType(ApplyCarrierDto) {}
