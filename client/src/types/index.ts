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
  description?: string; // Agora pode conter HTML formatado do ReactQuill
  mediaType: 'image' | 'video';
  pageType?: 'home' | 'agriculture' | 'fishing' | 'paa';
  active?: boolean;
  createdAt?: string;
  author?: string;
  authorImage?: string;
  location?: string;
  views?: number;
  likes?: number;
  tags?: string[]; // Array opcional de tags para facilitar a busca
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