import { LucideIcon } from 'lucide-react';

export interface ServiceItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ContactItem {
  phone?: string;
  email: string;
  label: string;
}

export interface ValueItem {
  title: string;
  description: string;
  icon: LucideIcon;
}