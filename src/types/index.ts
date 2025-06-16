export type UserRole = 'admin' | 'staff';

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface ShiftRequirement {
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
  requiredStaff: number;
}

export interface ShiftPreference {
  staffId: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
  weekdayDesiredHours: number;
  weekendDesiredHours: number;
}

export interface ShiftAssignment {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
  status: 'confirmed' | 'absent' | 'exchange-requested';
}

export interface Message {
  id: string;
  from: string;
  to: string | 'all';
  title: string;
  content: string;
  timestamp: Date;
  type: 'announcement' | 'absence' | 'exchange';
}

export interface ShiftExchange {
  id: string;
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  requesterShift: ShiftAssignment;
  targetShift: ShiftAssignment;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}