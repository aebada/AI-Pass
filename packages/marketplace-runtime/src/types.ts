export interface IndustryPack {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  appIds: string[];
  skillIds: string[];
  status: 'available' | 'stub' | 'coming_soon';
  certified: boolean;
}
