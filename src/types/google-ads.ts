// types/google-ads.ts

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status?: string; // ENABLED, PAUSED, REMOVED
  clicks: number;
  impressions: number;
  averageCpc: number; // in THB
  cost: number; // in THB
  ctr: number; // Click-through rate (%)
  conversions?: number;
}

export interface GoogleAdsMetrics {
  totalClicks: number;
  totalImpressions: number;
  averageCpc: number;
  totalCost: number;
  averageCtr: number;
}

export interface GoogleAdsApiResponse {
  campaigns: GoogleAdsCampaign[];
  summary: GoogleAdsMetrics;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}
