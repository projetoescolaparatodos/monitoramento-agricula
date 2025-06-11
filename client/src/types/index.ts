export interface ContentItem {
  id: string;
  title: string;
  content: string;
  pageType: 'home' | 'agriculture' | 'fishing' | 'paa';
  sectionType: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export interface ChartItem {
  id: string;
  title: string;
  chartType: 'bar' | 'line' | 'pie';
  chartData: any;
  pageType: 'home' | 'agriculture' | 'fishing' | 'paa';
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaItem {
  id: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  mediaType: 'image' | 'video';
  pageType?: 'home' | 'agriculture' | 'fishing' | 'paa' | 'sim';
  active?: boolean;
  createdAt?: string;
  author?: string;
  authorImage?: string;
  location?: string;
  views?: number;
  likes?: number;
  tags?: string[];
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5' | 'custom' | 'horizontal' | 'vertical' | 'square'; // Mantém compatibilidade
  customAspectRatio?: string;
  displayMode?: 'contain' | 'cover' | 'fill';
  verticalPadding?: number;
}

export interface StatisticItem {
  id: string;
  title: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PageType = 'home' | 'agriculture' | 'fishing' | 'paa';

export interface MediaFormData {
  pageType: PageType;
  title: string;
  description?: string;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  active: boolean;
  order: number;
  id?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5' | 'custom' | 'horizontal' | 'vertical' | 'square';
  customAspectRatio?: string;
  displayMode?: 'contain' | 'cover' | 'fill';
  verticalPadding?: number;
}

export interface InfoPanelItem {
  id: number;
  title: string;
  content: string;
  pageType: string;
  categoryId: string;
  icon: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InfoPanelFormData {
  title: string;
  content: string;
  pageType: string;
  categoryId: string;
  icon: string;
  order: number;
  active: boolean;
}