import React, { useState } from 'react';
import { Save, Calendar, Clock, CheckCircle } from 'lucide-react';
import { ShiftPreference, DayOfWeek, TimeSlot } from '../types';

interface ShiftPreferencesProps {
  preferences: ShiftPreference[];
  staffId: string;
  onUpdatePreferences: (preferences: ShiftPreference[]) => void;
}

export function ShiftPreferences({ preferences, staffId, onUpdatePreferences }: ShiftPreferencesProps) {
  const [weekdayHours, setWeekdayHours] = useState(4);
  const [weekendHours, setWeekendHours] = useState(6);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(
    new Set(preferences.map(p => `${p.dayOfWeek}-${p.timeSlot}`))
  );

  const daysOfWeek: { value: DayOfWeek; label: string; isWeekend: boolean }[] = [
    { value: 'monday', label: '月曜日', isWeekend: false },
    { value: 'tuesday', label: '火曜日', isWeekend: false },
    { value: 'wednesday', label: '水曜日', isWeekend: false },
    { value: 'thursday', label: '木曜日', isWeekend: false },
    { value: 'friday', label: '金曜日', isWeekend: false },
    { value: 'saturday', label: '土曜日', isWeekend: true },
    { value: 'sunday', label: '日曜日', isWeekend: true },
  ];

  const timeSlots: { value: TimeSlot; label: string; color: string }[] = [
    { value: 'morning', label: '朝 (9:00-13:00)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'afternoon', label: '昼 (13:00-17:00)', color: 'bg-blue-100 text-blue-800' },
    { value: 'evening', label: '夜 (17:00-21:00)', color: 'bg-purple-100 text-purple-800' },
  ];

  const toggleSlot = (dayOfWeek: DayOfWeek, timeSlot: TimeSlot) => {
    const key = `${dayOfWeek}-${timeSlot}`;
    const newSelected = new Set(selectedSlots);
    
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    
    setSelectedSlots(newSelected);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    const newPreferences: ShiftPreference[] = Array.from(selectedSlots).map(slotKey => {
      const [dayOfWeek, timeSlot] = slotKey.split('-') as [DayOfWeek, TimeSlot];
      return {
        staffId,
        dayOfWeek,
        timeSlot,
        weekdayDesiredHours: weekdayHours,
        weekendDesiredHours: weekendHours,
      };
    });

    onUpdatePreferences(newPreferences);
    
    // Show success feedback
    setTimeout(() => {
      setSaveStatus('saved');
      
      // Show alert with summary
      const totalSelectedSlots = selectedSlots.size;
      const weekdaySlots = selectedWeekdaySlots;
      const weekendSlots = selectedWeekendSlots;
      const totalDesiredHours = weekdayHours + weekendHours;
      
      alert(`✅ シフト希望が提出されました！\n\n📊 提出内容:\n• 選択したシフト枠: ${totalSelectedSlots}枠\n• 平日選択枠: ${weekdaySlots}枠 (希望: ${weekdayHours}コマ/週)\n• 休日選択枠: ${weekendSlots}枠 (希望: ${weekendHours}コマ/週)\n• 希望総コマ数: ${totalDesiredHours}コマ/週\n\n管理者がシフトを作成する際に、この希望が考慮されます。`);
      
      // Reset status after showing feedback
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const selectedWeekdaySlots = Array.from(selectedSlots).filter(slot => {
    const [dayOfWeek] = slot.split('-');
    return !['saturday', 'sunday'].includes(dayOfWeek);
  }).length;

  const selectedWeekendSlots = Array.from(selectedSlots).filter(slot => {
    const [dayOfWeek] = slot.split('-');
    return ['saturday', 'sunday'].includes(dayOfWeek);
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">シフト希望提出</h1>
          <p className="text-gray-600 mt-1">勤務希望日時と希望時間数を設定してください</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            saveStatus === 'saved'
              ? 'bg-green-600 text-white'
              : saveStatus === 'saving'
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saveStatus === 'saved' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              提出完了
            </>
          ) : saveStatus === 'saving' ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              提出中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              希望を提出
            </>
          )}
        </button>
      </div>

      {/* Hours Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">希望時間数設定</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              平日の希望コマ数 (週)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={weekdayHours}
                onChange={(e) => setWeekdayHours(parseInt(e.target.value) || 0)}
                min="0"
                max="15"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">コマ / 週</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">選択中: {selectedWeekdaySlots}コマ</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              休日の希望コマ数 (週)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={weekendHours}
                onChange={(e) => setWeekendHours(parseInt(e.target.value) || 0)}
                min="0"
                max="15"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">コマ / 週</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">選択中: {selectedWeekendSlots}コマ</p>
          </div>
        </div>
      </div>

      {/* Save Status Banner */}
      {saveStatus === 'saved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">シフト希望が正常に提出されました</h3>
              <p className="text-sm text-green-700 mt-1">
                管理者がシフトを作成する際に、あなたの希望が考慮されます。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shift Selection Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">勤務希望選択</h2>
          <p className="text-sm text-gray-600 mt-1">勤務可能な曜日・時間帯をクリックして選択してください</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekdays */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                平日
              </h3>
              <div className="space-y-4">
                {daysOfWeek.filter(day => !day.isWeekend).map(day => (
                  <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{day.label}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {timeSlots.map(slot => {
                        const key = `${day.value}-${slot.value}`;
                        const isSelected = selectedSlots.has(key);
                        return (
                          <button
                            key={slot.value}
                            onClick={() => toggleSlot(day.value, slot.value)}
                            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Clock className="h-4 w-4 mx-auto mb-1" />
                            {slot.label.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekends */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                休日
              </h3>
              <div className="space-y-4">
                {daysOfWeek.filter(day => day.isWeekend).map(day => (
                  <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{day.label}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {timeSlots.map(slot => {
                        const key = `${day.value}-${slot.value}`;
                        const isSelected = selectedSlots.has(key);
                        return (
                          <button
                            key={slot.value}
                            onClick={() => toggleSlot(day.value, slot.value)}
                            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Clock className="h-4 w-4 mx-auto mb-1" />
                            {slot.label.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {saveStatus === 'saved' ? '提出済み希望サマリー' : '選択サマリー'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">平日選択コマ数</p>
            <p className="text-2xl font-bold text-blue-600">{selectedWeekdaySlots}</p>
            <p className="text-xs text-gray-500">希望: {weekdayHours}コマ/週</p>
          </div>
          <div>
            <p className="text-gray-600">休日選択コマ数</p>
            <p className="text-2xl font-bold text-blue-600">{selectedWeekendSlots}</p>
            <p className="text-xs text-gray-500">希望: {weekendHours}コマ/週</p>
          </div>
          <div>
            <p className="text-gray-600">合計選択コマ数</p>
            <p className="text-2xl font-bold text-blue-600">{selectedSlots.size}</p>
          </div>
          <div>
            <p className="text-gray-600">希望総コマ数</p>
            <p className="text-2xl font-bold text-purple-600">{weekdayHours + weekendHours}</p>
            <p className="text-xs text-gray-500">平日+休日</p>
          </div>
        </div>
        
        {saveStatus === 'saved' && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              ✅ この希望内容で提出が完了しています
            </p>
            <p className="text-xs text-green-700 mt-1">
              変更したい場合は、再度選択して「希望を提出」ボタンを押してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}