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
  title: string;
  url: string;
  type: 'image' | 'video';
  pageType: 'home' | 'agriculture' | 'fishing' | 'paa';
  createdAt: Date;
  updatedAt: Date;
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