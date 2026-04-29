import downloadsData from './downloads.json';

export interface DownloadItem {
  id: string;
  name: string;
  description: string;
  category: 'OS' | 'DRIVER' | 'APP' | string;
  version: string;
  link: string;
  size?: string;
  stats?: string;
}

export const downloads: DownloadItem[] = downloadsData as DownloadItem[];
