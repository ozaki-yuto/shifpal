import { ShiftRequirement, ShiftPreference, ShiftAssignment, DayOfWeek, TimeSlot } from '../types';
import { mockUsers } from '../data/mockData';

interface StaffFulfillment {
  staffId: string;
  staffName: string;
  weekdayDesiredHours: number;
  weekendDesiredHours: number;
  totalDesiredHours: number;
  currentAssignedHours: number;
  fulfillmentRate: number;
  weekdayAssigned: number;
  weekendAssigned: number;
}

interface GenerationResult {
  assignments: ShiftAssignment[];
  statistics: {
    totalSlots: number;
    filledSlots: number;
    unfilledSlots: number;
    staffFulfillment: StaffFulfillment[];
    warnings: string[];
  };
}

const MAX_CONSECUTIVE_DAYS = 5; // 最大連勤日数
const TIME_SLOTS_ORDER = ['morning', 'afternoon', 'evening'] as const;

export function generateShifts(
  requirements: ShiftRequirement[],
  preferences: ShiftPreference[]
): ShiftAssignment[] {
  const result = generateShiftsWithDetails(requirements, preferences);
  return result.assignments;
}

export function generateShiftsWithDetails(
  requirements: ShiftRequirement[],
  preferences: ShiftPreference[]
): GenerationResult {
  console.log('Generating shifts with requirements:', requirements);
  console.log('Generating shifts with preferences:', preferences);
  
  const assignments: ShiftAssignment[] = [];
  const staffFulfillment: Map<string, StaffFulfillment> = new Map();
  const warnings: string[] = [];

  // 要件と希望が空の場合の処理
  if (requirements.length === 0) {
    warnings.push('シフト要件が設定されていません');
    return {
      assignments: [],
      statistics: {
        totalSlots: 0,
        filledSlots: 0,
        unfilledSlots: 0,
        staffFulfillment: [],
        warnings
      }
    };
  }

  if (preferences.length === 0) {
    warnings.push('スタッフのシフト希望が提出されていません');
    return {
      assignments: [],
      statistics: {
        totalSlots: requirements.reduce((sum, req) => sum + req.requiredStaff, 0),
        filledSlots: 0,
        unfilledSlots: requirements.reduce((sum, req) => sum + req.requiredStaff, 0),
        staffFulfillment: [],
        warnings
      }
    };
  }

  // スタッフ充足率追跡の初期化
  initializeStaffFulfillment(preferences, staffFulfillment);

  // 要件を曜日・時間帯でグループ化
  const preferencesBySlot = groupPreferencesBySlot(preferences);
  
  console.log('Preferences by slot:', preferencesBySlot);

  // ステップ1: 確定処理（希望者数 ≤ 必要人数）
  const confirmedSlots = new Set<string>();
  requirements.forEach(req => {
    const key = `${req.dayOfWeek}-${req.timeSlot}`;
    const candidatePrefs = preferencesBySlot.get(key) || [];
    
    console.log(`Processing ${key}: ${candidatePrefs.length} candidates for ${req.requiredStaff} required`);

    if (candidatePrefs.length <= req.requiredStaff) {
      // 全員確定
      candidatePrefs.forEach(pref => {
        if (isValidAssignment(pref, assignments)) {
          const assignment = createShiftAssignment(pref, req.dayOfWeek, req.timeSlot);
          assignments.push(assignment);
          updateFulfillment(staffFulfillment, pref.staffId, req.dayOfWeek);
          confirmedSlots.add(key);
          console.log(`Assigned ${getStaffName(pref.staffId)} to ${key}`);
        } else {
          warnings.push(`${getStaffName(pref.staffId)}の${getDayLabel(req.dayOfWeek)}${getTimeSlotLabel(req.timeSlot)}は制約により割り当てできませんでした`);
        }
      });

      if (candidatePrefs.length < req.requiredStaff) {
        warnings.push(`${getDayLabel(req.dayOfWeek)}${getTimeSlotLabel(req.timeSlot)}: 希望者${candidatePrefs.length}人 < 必要人数${req.requiredStaff}人`);
      }
    }
  });

  // ステップ2: 超過処理（希望者数 > 必要人数）
  requirements.forEach(req => {
    const key = `${req.dayOfWeek}-${req.timeSlot}`;
    if (confirmedSlots.has(key)) return; // 既に処理済み

    const candidatePrefs = preferencesBySlot.get(key) || [];
    if (candidatePrefs.length > req.requiredStaff) {
      // 制約チェック後の有効な候補者を取得
      const validCandidates = candidatePrefs.filter(pref => 
        isValidAssignment(pref, assignments)
      );

      if (validCandidates.length === 0) {
        warnings.push(`${getDayLabel(req.dayOfWeek)}${getTimeSlotLabel(req.timeSlot)}: 制約により割り当て可能なスタッフがいません`);
        return;
      }

      // 充足率による優先度付け
      const sortedCandidates = validCandidates
        .map(pref => ({
          preference: pref,
          fulfillment: staffFulfillment.get(pref.staffId)!
        }))
        .sort((a, b) => {
          // 優先度1: 充足率が低い順
          if (a.fulfillment.fulfillmentRate !== b.fulfillment.fulfillmentRate) {
            return a.fulfillment.fulfillmentRate - b.fulfillment.fulfillmentRate;
          }
          // 優先度2: 希望総コマ数が少ない順
          if (a.fulfillment.totalDesiredHours !== b.fulfillment.totalDesiredHours) {
            return a.fulfillment.totalDesiredHours - b.fulfillment.totalDesiredHours;
          }
          // 優先度3: ランダム
          return Math.random() - 0.5;
        });

      // 上位候補者に割り当て
      const assignCount = Math.min(req.requiredStaff, sortedCandidates.length);
      for (let i = 0; i < assignCount; i++) {
        const { preference } = sortedCandidates[i];
        const assignment = createShiftAssignment(preference, req.dayOfWeek, req.timeSlot);
        assignments.push(assignment);
        updateFulfillment(staffFulfillment, preference.staffId, req.dayOfWeek);
        console.log(`Assigned ${getStaffName(preference.staffId)} to ${key} (competitive)`);
      }

      if (assignCount < req.requiredStaff) {
        warnings.push(`${getDayLabel(req.dayOfWeek)}${getTimeSlotLabel(req.timeSlot)}: 制約により${req.requiredStaff - assignCount}人不足`);
      }
    }
  });

  console.log('Generated assignments:', assignments);
  console.log('Warnings:', warnings);
  
  // 統計情報の計算
  const totalSlots = requirements.reduce((sum, req) => sum + req.requiredStaff, 0);
  const filledSlots = assignments.length;
  const unfilledSlots = totalSlots - filledSlots;

  return {
    assignments,
    statistics: {
      totalSlots,
      filledSlots,
      unfilledSlots,
      staffFulfillment: Array.from(staffFulfillment.values()),
      warnings
    }
  };
}

function initializeStaffFulfillment(
  preferences: ShiftPreference[],
  staffFulfillment: Map<string, StaffFulfillment>
) {
  // スタッフごとの希望コマ数を集計
  const staffPrefs = new Map<string, { weekday: number; weekend: number }>();
  
  preferences.forEach(pref => {
    if (!staffPrefs.has(pref.staffId)) {
      staffPrefs.set(pref.staffId, { weekday: 0, weekend: 0 });
    }
    
    const isWeekend = ['saturday', 'sunday'].includes(pref.dayOfWeek);
    if (isWeekend) {
      staffPrefs.get(pref.staffId)!.weekend = pref.weekendDesiredHours;
    } else {
      staffPrefs.get(pref.staffId)!.weekday = pref.weekdayDesiredHours;
    }
  });

  // 充足率追跡オブジェクトを初期化
  staffPrefs.forEach((hours, staffId) => {
    const user = mockUsers.find(u => u.id === staffId);
    staffFulfillment.set(staffId, {
      staffId,
      staffName: user?.name || 'Unknown',
      weekdayDesiredHours: hours.weekday,
      weekendDesiredHours: hours.weekend,
      totalDesiredHours: hours.weekday + hours.weekend,
      currentAssignedHours: 0,
      fulfillmentRate: 0,
      weekdayAssigned: 0,
      weekendAssigned: 0
    });
  });
}

function groupPreferencesBySlot(preferences: ShiftPreference[]): Map<string, ShiftPreference[]> {
  const grouped = new Map<string, ShiftPreference[]>();
  
  preferences.forEach(pref => {
    const key = `${pref.dayOfWeek}-${pref.timeSlot}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(pref);
  });

  return grouped;
}

function isValidAssignment(
  preference: ShiftPreference,
  existingAssignments: ShiftAssignment[]
): boolean {
  const staffAssignments = existingAssignments.filter(a => a.staffId === preference.staffId);
  
  // 連勤制限チェック
  if (!checkConsecutiveDaysLimit(preference, staffAssignments)) {
    return false;
  }

  // 連続勤務制限チェック
  if (!checkConsecutiveShiftsLimit(preference, staffAssignments)) {
    return false;
  }

  return true;
}

function checkConsecutiveDaysLimit(
  preference: ShiftPreference,
  staffAssignments: ShiftAssignment[]
): boolean {
  // 簡易実装: 実際の日付ベースでの連勤チェックは複雑なため、
  // ここでは週内での連勤をチェック
  const assignedDays = new Set(staffAssignments.map(a => a.dayOfWeek));
  
  // 既に多くの日に割り当てられている場合は制限
  if (assignedDays.size >= MAX_CONSECUTIVE_DAYS) {
    return false;
  }

  return true;
}

function checkConsecutiveShiftsLimit(
  preference: ShiftPreference,
  staffAssignments: ShiftAssignment[]
): boolean {
  // 同じ日の他の時間帯での割り当てをチェック
  const sameDayAssignments = staffAssignments.filter(a => a.dayOfWeek === preference.dayOfWeek);
  
  if (sameDayAssignments.length === 0) {
    return true; // 同じ日に他の割り当てがない
  }

  const existingTimeSlots = sameDayAssignments.map(a => a.timeSlot);
  const newTimeSlot = preference.timeSlot;

  // 3連続（朝・昼・夜）の禁止
  if (existingTimeSlots.length >= 2) {
    return false;
  }

  // 2連続の場合、連続する時間帯かチェック
  if (existingTimeSlots.length === 1) {
    const existingSlot = existingTimeSlots[0];
    const existingIndex = TIME_SLOTS_ORDER.indexOf(existingSlot as any);
    const newIndex = TIME_SLOTS_ORDER.indexOf(newTimeSlot as any);

    // 連続する時間帯のみ許可（朝・昼 または 昼・夜）
    const isConsecutive = Math.abs(existingIndex - newIndex) === 1;
    return isConsecutive;
  }

  return true;
}

function createShiftAssignment(
  preference: ShiftPreference,
  dayOfWeek: DayOfWeek,
  timeSlot: TimeSlot
): ShiftAssignment {
  const user = mockUsers.find(u => u.id === preference.staffId);
  const date = getNextDateForDayOfWeek(dayOfWeek);
  
  return {
    id: `${preference.staffId}-${dayOfWeek}-${timeSlot}-${Date.now()}`,
    staffId: preference.staffId,
    staffName: user?.name || 'Unknown',
    date,
    dayOfWeek,
    timeSlot,
    status: 'confirmed'
  };
}

function updateFulfillment(
  fulfillmentMap: Map<string, StaffFulfillment>,
  staffId: string,
  dayOfWeek: DayOfWeek
) {
  const fulfillment = fulfillmentMap.get(staffId);
  if (fulfillment) {
    fulfillment.currentAssignedHours += 1;
    
    const isWeekend = ['saturday', 'sunday'].includes(dayOfWeek);
    if (isWeekend) {
      fulfillment.weekendAssigned += 1;
    } else {
      fulfillment.weekdayAssigned += 1;
    }

    fulfillment.fulfillmentRate = fulfillment.totalDesiredHours > 0 
      ? fulfillment.currentAssignedHours / fulfillment.totalDesiredHours 
      : 0;
  }
}

function getNextDateForDayOfWeek(dayOfWeek: DayOfWeek): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  const targetDay = days.indexOf(dayOfWeek);
  const currentDay = today.getDay();
  
  // 今週の該当曜日の日付を計算
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7; // 来週の該当曜日
  }
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  
  return targetDate.toISOString().split('T')[0];
}

function getStaffName(staffId: string): string {
  const user = mockUsers.find(u => u.id === staffId);
  return user?.name || 'Unknown';
}

function getDayLabel(dayOfWeek: DayOfWeek): string {
  const labels = {
    monday: '月曜日',
    tuesday: '火曜日',
    wednesday: '水曜日',
    thursday: '木曜日',
    friday: '金曜日',
    saturday: '土曜日',
    sunday: '日曜日'
  };
  return labels[dayOfWeek];
}

function getTimeSlotLabel(timeSlot: TimeSlot): string {
  const labels = {
    morning: '朝',
    afternoon: '昼',
    evening: '夜'
  };
  return labels[timeSlot];
}