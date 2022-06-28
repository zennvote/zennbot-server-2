export interface SheetRow {
  index: number;
  twitchId: string;
  username: string;
  ticket: number;
  ticketPiece: number;
  prefix?: string;
}

export interface SheetsRequest<T extends ReadonlyArray<string>> {
  spreadsheetId: string;
  columns: T;
  startRow?: number;
  startColumn?: number;
  sheetsName?: string;
}
