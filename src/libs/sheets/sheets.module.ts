import { DynamicModule, Global, Module } from '@nestjs/common';
import { readFileSync } from 'fs';
import { google } from 'googleapis';
import { SheetsService } from './sheets.service';
import { SHEETS_CLIENT } from './sheets.types';

export type Options = {
  credentials?: string;
  credentialsPath?: string;
  token?: string;
  tokenPath?: string;
};

@Global()
@Module({})
export class SheetsModule {
  static forRoot(option: Options): DynamicModule {
    const clientFactory = {
      provide: SHEETS_CLIENT,
      useFactory: async () => {
        if (
          (!option.credentials && !option.credentialsPath)
          || (!option.token && !option.tokenPath)
        ) {
          throw new Error('No token for tmi.js');
        }

        const credentials = JSON.parse(option.credentials ?? readFileSync(option.credentialsPath ?? '', 'utf8'));
        const token = JSON.parse(option.token ?? readFileSync(option.tokenPath ?? '', 'utf8'));

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
