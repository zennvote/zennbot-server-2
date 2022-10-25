export type RowType<T extends ReadonlyArray<string>>
  = { [key in T[number]]: string | undefined } & { index: number };

type RangeBuild = {
  sheetsName?: string;
  start: { column: number, row?: number };
  end?: { column: number, row?: number };
};

export const s = (value: number) => String.fromCharCode(value);

export const getRange = (build: RangeBuild) => {
  const range = build.sheetsName ? `${build.sheetsName}!` : '';
  const start = `${s(64 + build.start.column)}${build.start.row ?? ''}`;
  const end = build.end ? `:${s(64 + build.end.column)}${build.end.row ?? ''}` : '';

  return range + start + end;
};

export const convertToRowType = <T extends ReadonlyArray<string>>(
  columns: T,
  index: number,
  values: string[],
) => ({
  index,
  ...Object.fromEntries(
    columns.map((column, index) => [
      column, values[index],
    ]),
  ),
}) as RowType<T>;

export const getIndexFromRange = (range: string, startRow: number) => {
  const result = range.match(/[a-z|A-Z]+(\d+)/)?.[1];
  if (!result) return NaN;

  return parseInt(result, 10) + startRow;
};
