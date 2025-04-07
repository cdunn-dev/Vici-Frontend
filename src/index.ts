export interface SharedConfig {
  apiUrl: string;
  version: string;
}

export const createConfig = (config: SharedConfig): SharedConfig => {
  return {
    ...config,
  };
};
