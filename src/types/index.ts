export type MachineState = 'idle' | 'washing' | 'cycle_done' | 'opening' | 'awarding';

export type ChannelType = 'dismac' | 'mercado';

export interface PrizeResultData {
  kind: string;
  amt: string;
  how: string;
  code: string;
  where: string;
  due: string;
  isJackpot?: boolean;
}
