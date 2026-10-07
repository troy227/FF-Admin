export type CreateFlagInput = {
    key: string;
    userIds?: number[] | null;
    enabled?: boolean;
  };
  
  export type UpdateFlagInput = {
    userIds?: number[] | null;
    enabled?: boolean;
  };