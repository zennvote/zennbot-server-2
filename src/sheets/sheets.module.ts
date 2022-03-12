import { DynamicModule, Global, Module } from '@nestjs/common';
import { readFileSync } from 'fs';
import { google } from 'googleapis';
import { SheetsService } from './sheets.service';

export type Options = {
  credentialsPath: string;
  tokenPath: string;
};

@Global()
@Module({})
export class SheetsModule {
  static forRoot(option: Options): DynamicModule {
    const clientFactory = {
      provide: 'CLIENT',
      useFactory: async () => {
        const credentials = JSON.parse(readFileSync(option.credentialsPath, 'utf8'));
        const token = JSON.parse(readFileSync(option.tokenPath, 'utf8'));

        const { client_id: id, client_secret: secret, redirect_uris: uris } = credentials.installed;
        const authClient = new google.auth.OAuth2(id, secret, uris[0]);

        authClient.setCredentials(token);

        return google.sheets({ auth: authClient, version: 'v4' });
      },
    };

    return {
      module: SheetsModule,
      providers: [SheetsService, clientFactory],
      exports: [SheetsService],
    };
  }
}
