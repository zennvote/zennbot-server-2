/* eslint-disable import/no-extraneous-dependencies */
import * as fs from 'fs';
import * as path from 'path';

import { authenticate } from '@google-cloud/local-auth';
import { ConfigService } from '@nestjs/config';
import { Console, Command } from 'nestjs-console';

@Console({
  command: 'sheets',
  description: 'Sheets console',
})
export class SheetsConsoleApp {
  constructor(private readonly configService: ConfigService) {}

  @Command({
    command: 'generate-token',
    description: 'Generate auth token for Google Sheets with credentials',
  })
  async generateToken() {
    const credentialsPath = this.getSheetsCredentialsPath();

    const client = await authenticate({
      keyfilePath: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    const credential = credentials.installed || credentials.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: credential.client_id,
      client_secret: credential.client_secret,
      refresh_token: client.credentials.refresh_token,
    });

    console.log(payload);
  }

  private getSheetsCredentialsPath() {
    const sheetsCredentialPath = this.configService.get('SHEETS_CREDENTIALS_PATH');
    if (sheetsCredentialPath) return sheetsCredentialPath;

    const sheetsCredential = this.configService.get('SHEETS_CREDENTIALS');
    if (!sheetsCredential) throw new Error('SHEETS_CREDENTIALS or SHEETS_CREDENTIALS_PATH is required');

    const defaultPath = path.join(process.cwd(), 'sheets-credentials.json');
    fs.writeFileSync(defaultPath, sheetsCredential);

    return defaultPath;
  }
}
