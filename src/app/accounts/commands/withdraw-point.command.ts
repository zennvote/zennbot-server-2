import { WithdrawPointDto } from '../dto/withdraw-point.dto';

export class WithdrawPointCommand {
  constructor(public readonly withdrawPointDto: WithdrawPointDto) {}
}
