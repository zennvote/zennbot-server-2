export class CreateAccountDto {
  constructor(
    public username: string,
    public twitchId?: string,
  ) {}
}
