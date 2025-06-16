import { User, ShiftRequirement, ShiftPreference, ShiftAssignment, Message } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: '田中店長', role: 'admin', email: 'tanaka@store.com' },
  { id: '2', name: '佐藤花子', role: 'staff', email: 'sato@example.com' },
  { id: '3', name: '鈴木太郎', role: 'staff', email: 'suzuki@example.com' },
  { id: '4', name: '高橋美咲', role: 'staff', email: 'takahashi@example.com' },
  { id: '5', name: '伊藤健太', role: 'staff', email: 'ito@example.com' },
];

export const mockShiftRequirements: ShiftRequirement[] = [
  { dayOfWeek: 'monday', timeSlot: 'morning', requiredStaff: 2 },
  { dayOfWeek: 'monday', timeSlot: 'afternoon', requiredStaff: 3 },
  { dayOfWeek: 'monday', timeSlot: 'evening', requiredStaff: 2 },
  { dayOfWeek: 'tuesday', timeSlot: 'morning', requiredStaff: 2 },
  { dayOfWeek: 'tuesday', timeSlot: 'afternoon', requiredStaff: 3 },
  { dayOfWeek: 'tuesday', timeSlot: 'evening', requiredStaff: 2 },
  { dayOfWeek: 'wednesday', timeSlot: 'morning', requiredStaff: 2 },
  { dayOfWeek: 'wednesday', timeSlot: 'afternoon', requiredStaff: 3 },
  { dayOfWeek: 'wednesday', timeSlot: 'evening', requiredStaff: 2 },
  { dayOfWeek: 'thursday', timeSlot: 'morning', requiredStaff: 2 },
  { dayOfWeek: 'thursday', timeSlot: 'afternoon', requiredStaff: 3 },
  { dayOfWeek: 'thursday', timeSlot: 'evening', requiredStaff: 2 },
  { dayOfWeek: 'friday', timeSlot: 'morning', requiredStaff: 2 },
  { dayOfWeek: 'friday', timeSlot: 'afternoon', requiredStaff: 4 },
  { dayOfWeek: 'friday', timeSlot: 'evening', requiredStaff: 3 },
  { dayOfWeek: 'saturday', timeSlot: 'morning', requiredStaff: 3 },
  { dayOfWeek: 'saturday', timeSlot: 'afternoon', requiredStaff: 4 },
  { dayOfWeek: 'saturday', timeSlot: 'evening', requiredStaff: 3 },
  { dayOfWeek: 'sunday', timeSlot: 'morning', requiredStaff: 3 },
  { dayOfWeek: 'sunday', timeSlot: 'afternoon', requiredStaff: 4 },
  { dayOfWeek: 'sunday', timeSlot: 'evening', requiredStaff: 2 },
];

export const mockShiftPreferences: ShiftPreference[] = [
  { staffId: '2', dayOfWeek: 'monday', timeSlot: 'morning', weekdayDesiredHours: 4, weekendDesiredHours: 6 },
  { staffId: '2', dayOfWeek: 'tuesday', timeSlot: 'afternoon', weekdayDesiredHours: 4, weekendDesiredHours: 6 },
  { staffId: '2', dayOfWeek: 'saturday', timeSlot: 'morning', weekdayDesiredHours: 4, weekendDesiredHours: 6 },
  { staffId: '3', dayOfWeek: 'monday', timeSlot: 'afternoon', weekdayDesiredHours: 6, weekendDesiredHours: 4 },
  { staffId: '3', dayOfWeek: 'wednesday', timeSlot: 'evening', weekdayDesiredHours: 6, weekendDesiredHours: 4 },
  { staffId: '3', dayOfWeek: 'friday', timeSlot: 'afternoon', weekdayDesiredHours: 6, weekendDesiredHours: 4 },
  { staffId: '4', dayOfWeek: 'tuesday', timeSlot: 'morning', weekdayDesiredHours: 3, weekendDesiredHours: 8 },
  { staffId: '4', dayOfWeek: 'thursday', timeSlot: 'afternoon', weekdayDesiredHours: 3, weekendDesiredHours: 8 },
  { staffId: '4', dayOfWeek: 'saturday', timeSlot: 'afternoon', weekdayDesiredHours: 3, weekendDesiredHours: 8 },
  { staffId: '4', dayOfWeek: 'sunday', timeSlot: 'afternoon', weekdayDesiredHours: 3, weekendDesiredHours: 8 },
  { staffId: '5', dayOfWeek: 'monday', timeSlot: 'evening', weekdayDesiredHours: 5, weekendDesiredHours: 5 },
  { staffId: '5', dayOfWeek: 'wednesday', timeSlot: 'morning', weekdayDesiredHours: 5, weekendDesiredHours: 5 },
  { staffId: '5', dayOfWeek: 'friday', timeSlot: 'evening', weekdayDesiredHours: 5, weekendDesiredHours: 5 },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    from: '田中店長',
    to: 'all',
    title: '来月のシフトについて',
    content: '来月のシフト希望提出期限は今月25日までです。お忘れなく！',
    timestamp: new Date('2024-12-10T10:00:00'),
    type: 'announcement'
  },
  {
    id: '2',
    from: '佐藤花子',
    to: '田中店長',
    title: '12/15 欠勤申請',
    content: '体調不良のため、12/15の午前シフトを欠勤させていただきます。',
    timestamp: new Date('2024-12-12T08:30:00'),
    type: 'absence'
  }
];