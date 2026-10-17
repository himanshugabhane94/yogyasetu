export type Role = 'USER' | 'ADMIN' | 'VERIFIED_OFFICER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  role: Role;
  state?: string | null;
  gender?: string | null;
  age?: number | null;
  occupation?: string | null;
  income?: number | null;
  category?: string | null;
  education?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface EligibilityCriteria {
  minAge?: number | null;
  maxAge?: number | null;
  gender?: 'All' | 'Female' | 'Male' | 'Transgender';
  maxIncome?: number | null;
  states?: string[];
  occupations?: string[];
  categories?: string[];
  education?: string[];
}

export interface ApplicationStep {
  step: number;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
}

export interface SchemeItem {
  id: string;
  categoryId: string;
  category?: {
    id: string;
    nameEn: string;
    nameHi: string;
    slug: string;
    icon: string;
  };
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  benefitsEn: string;
  benefitsHi: string;
  benefitType: string;
  benefitAmount?: string | null;
  eligibilityJson: string; // parsed to EligibilityCriteria
  documentsRequired: string; // parsed to string[]
  applicationProcess: string; // parsed to ApplicationStep[]
  officialLink: string;
  sourceUrl?: string | null;
  departmentEn: string;
  departmentHi: string;
  level: string;
  state?: string | null;
  slug?: string | null;
  lastVerified?: string | null;
  openDate?: string | null;
  closeDate?: string | null;
  deadline?: string | null;
  deadlineNote?: string | null;
  deadlineVerifiedAt?: string | null;
  tags?: string | null;
  status: 'DRAFT' | 'VERIFIED' | 'PUBLISHED' | 'CLOSED';
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  isBookmarked?: boolean;
  matchScore?: number;
  matchReasons?: string[];
  unmatchedReasons?: string[];
}

export interface EligibilityCheckInput {
  age?: number;
  state?: string;
  gender?: string;
  occupation?: string;
  income?: number;
  category?: string;
  education?: string;
}

export interface EligibilityResult {
  scheme: SchemeItem;
  matchPercentage: number;
  isEligible: boolean;
  isPartial: boolean;
  reasons: string[];
  missingCriteria: string[];
}

export type ApplicationStatus = 'APPLIED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';

export interface ApplicationTrackerItem {
  id: string;
  userId: string;
  schemeId: string;
  scheme: SchemeItem;
  status: ApplicationStatus;
  notes?: string | null;
  appliedDate: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type?: 'SCHEME_MATCH' | 'DEADLINE' | 'STATUS_UPDATE' | 'SYSTEM' | string;
  titleEn?: string;
  titleHi?: string;
  messageEn?: string;
  messageHi?: string;
  title_en?: string | null;
  title_hi?: string | null;
  body_en?: string | null;
  body_hi?: string | null;
  link?: string | null;
  read?: boolean;
  isRead?: boolean;
  createdAt: string;
}

export interface ReminderItem {
  id: string;
  userId: string;
  schemeId: string;
  scheme?: SchemeItem;
  daysBefore: number;
  remindOn?: string | null;
  remindOnFormatted?: string | null;
  daysLeft?: number | null;
  channelEmail: boolean;
  channelInApp: boolean;
  lastSentAt?: string | null;
  status: 'ACTIVE' | 'SENT' | 'CANCELLED';
  createdAt: string;
}
