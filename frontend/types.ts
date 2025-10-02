export type FundMeta = {
  code: string;
  name: string;
  type?: string;
  company?: string;
  manager?: string;
  scale?: string;
  trace?: string;
};

export type FundHistoryRow = {
  date: string;
  nav: number;
  accNav?: number;
  dailyReturn?: number;
};

export type FundHistory = {
  code: string;
  rows: FundHistoryRow[];
};
