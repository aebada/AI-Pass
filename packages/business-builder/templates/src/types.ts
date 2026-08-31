export type TemplatePlatform = 'web' | 'mobile' | 'desktop' | 'workflow';

export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  category: 'crm' | 'finance' | 'support' | 'supply_chain' | 'general';
  platforms: TemplatePlatform[];
  modules: string[];
  defaultScreens: string[];
  agentPacks: string[];
  storeAppId?: string;
}
