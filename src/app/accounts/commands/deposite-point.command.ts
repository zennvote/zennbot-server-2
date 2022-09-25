import { DepositePointDto } from '../dto/deposite-point.dto';

export class DepositePointCommand {
  constructor(public readonly depositePointDto: DepositePointDto) {}
}
