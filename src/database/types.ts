/**
 * TypeScript Interfaces for Personal Electrician Business Management System
 */

export interface Project {
  id: string;
  name: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  workLocation?: string;
  category: 'residential' | 'commercial' | 'industrial' | 'office' | 'factory';
  contractAmount: number;
  advanceReceived: number;
  status: 'running' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  notes?: string;
  mediaUrls?: string[]; // Support local mock uploads or URLs
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  ownerId: string;
}

export interface Employee {
  id: string;
  name: string;
  phone?: string;
  dailyWage: number;
  role?: string;
  status: 'active' | 'inactive';
  ownerId: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'half_day';
  workingHours: number;
  overtimeHours: number;
  advancePaid: number;
  projectId: string; // Attributed to a project
  ownerId: string;
}

export interface DailyLog {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  description: string;
  startTime?: string;
  endTime?: string;
  totalHours: number;
  weather?: string;
  remarks?: string;
  mediaUrls?: string[];
  ownerId: string;
}

export interface Material {
  id: string;
  name: string;
  brand?: string;
  category: 'wire' | 'mcb' | 'switch' | 'socket' | 'conduit_pipe' | 'pvc_pipe' | 'panel' | 'lights' | 'fan' | 'tools' | 'safety_equipment' | 'others';
  quantity: number;
  unit: string;
  rate: number;
  gst?: number; // percentage
  totalCost: number;
  supplier?: string;
  purchaseDate: string; // YYYY-MM-DD
  billUrl?: string;
  projectId: string;
  ownerId: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: 'transport' | 'petrol' | 'food' | 'tea' | 'hotel' | 'vehicle_repair' | 'material_purchase' | 'labour' | 'equipment' | 'tool_purchase' | 'miscellaneous';
  date: string; // YYYY-MM-DD
  description: string;
  projectId?: string; // Optional if general, otherwise linked to project
  billUrl?: string;
  ownerId: string;
}

export interface Payment {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: 'cash' | 'upi' | 'bank' | 'cheque';
  transactionId?: string;
  screenshotUrl?: string;
  ownerId: string;
}

export interface Setting {
  id: string;
  businessName: string;
  businessLogo?: string;
  phone?: string;
  email?: string;
  address?: string;
  currency: string; // e.g. "USD", "INR", "EUR"
  theme: 'light' | 'dark';
  ownerId: string;
}
