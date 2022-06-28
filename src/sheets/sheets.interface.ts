export interface SheetsRequest<T extends ReadonlyArray<string>> {
  spreadsheetId: string;
  columns: T;
  startRow?: number;
  startColumn?: number;
  sheetsName?: string;
}
