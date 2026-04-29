import toolsData from './tools.json';

export interface ToolItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  desc: string;
  status: string;
}

export const tools: ToolItem[] = toolsData as ToolItem[];
