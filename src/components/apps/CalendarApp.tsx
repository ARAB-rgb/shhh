import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIconLucide,
  Clock,
  MapPin,
  X,
  Check,
  Download,
  Search,
  Filter,
  Trash2,
  CalendarDays,
  List,
  Eye,
  Sparkles,
} from 'lucide-react';
import { CalendarIcon } from '../icons/AppIcons';
import { CalendarEvent } from '../../types/suite';
import { storage } from '../../services/storage';

interface CalendarAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export const CalendarApp: React.FC<CalendarAppProps> = ({ onBack, lang }) => {
  const isAr = lang === 'ar';
  const [events, setEvents] = useState<CalendarEvent[]>(storage.getEvents());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'month' | 'agenda' | 'week'>('month');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Event Form State
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('10:00 AM');
  const [eventDuration, setEventDuration] = useState<string>('45 mins');
  const [eventLocation, setEventLocation] = useState<string>('SNNS Teams Meeting Room');
  const [eventCategory, setEventCategory] = useState<'work' | 'meeting' | 'urgent'>('meeting');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: eventTitle,
      date: selectedDate,
      time: eventTime,
      duration: eventDuration,
      location: eventLocation,
      category: eventCategory,
    };

    const updated = [...events, newEv];
    setEvents(updated);
    storage.saveEvents(updated);
    setShowAddEvent(false);
    setEventTitle('');
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = events.filter((ev) => ev.id !== id);
    setEvents(updated);
    storage.saveEvents(updated);
  };

  // Real iCalendar (.ics) export
  const exportIcsCalendar = () => {
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SNNS 365 Cloud Suite//EN\nCALSCALE:GREGORIAN\n';
    events.forEach((ev) => {
      const cleanDate = ev.date.replace(/-/g, '');
      icsContent += 'BEGIN:VEVENT\n';
      icsContent += `UID:${ev.id}@snns.pro\n`;
      icsContent += `DTSTAMP:${cleanDate}T090000Z\n`;
      icsContent += `DTSTART:${cleanDate}T090000Z\n`;
      icsContent += `SUMMARY:${ev.title}\n`;
      icsContent += `LOCATION:${ev.location || 'SNNS Cloud'}\n`;
      icsContent += `DESCRIPTION:Event from SNNS Calendar - ${ev.duration}\n`;
      icsContent += 'STATUS:CONFIRMED\n';
      icsContent += 'END:VEVENT\n';
    });
    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SNNS-Calendar-${Date.now()}.ics`;
    link.click();
  };

  const filteredEvents = events
    .filter((e) => (categoryFilter === 'all' ? true : e.category === categoryFilter))
    .filter((e) => (searchQuery ? e.title.toLowerCase().includes(searchQuery.toLowerCase()) : true));

  const selectedDateEvents = filteredEvents.filter((e) => e.date === selectedDate);

  return (
    <div className="min-h-screen bg-[#F3F2F1] flex flex-col font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <CalendarIcon className="w-8 h-8 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-gray-900">{isAr ? 'تقويم SNNS Calendar' : 'SNNS Calendar'}</h1>
              <span className="text-[10px] bg-sky-100 text-[#0078D4] font-bold px-2 py-0.5 rounded-full">
                {isAr ? MONTH_NAMES_AR[month] : MONTH_NAMES_EN[month]} {year}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              {isAr ? 'جدولة متزامنة، تصدير ICS، وإدارة المواعيد المعتمدة' : 'Synchronized scheduling, ICS export & event tracking'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-[#0078D4] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isAr ? 'شهر' : 'Month'}
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                viewMode === 'agenda' ? 'bg-white text-[#0078D4] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isAr ? 'جدول المواعيد' : 'Agenda'}
            </button>
          </div>

          <button
            onClick={exportIcsCalendar}
            className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title={isAr ? 'تصدير بصيغة iCalendar (.ics)' : 'Export iCalendar (.ics)'}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .ICS</span>
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1.5 text-xs border border-gray-300 hover:bg-gray-100 rounded-xl font-medium cursor-pointer"
          >
            {isAr ? 'اليوم' : 'Today'}
          </button>

          <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-200 rounded-s-xl transition cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-200 rounded-e-xl transition cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddEvent(true)}
            className="px-3.5 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'حدث جديد' : 'New Event'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Area */}
        <div className="flex-1 bg-white p-4 sm:p-6 flex flex-col overflow-auto">
          {viewMode === 'month' ? (
            <>
              {/* Day Names Bar */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center font-bold text-xs text-gray-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Month Cells Grid */}
              <div className="grid grid-cols-7 gap-2 flex-1">
                {/* Empty start padding */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-gray-50/40 rounded-2xl min-h-[90px] border border-transparent" />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <div
                      key={dayNum}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-h-[90px] p-2.5 rounded-2xl border transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#0078D4] bg-sky-50/50 shadow-xs ring-1 ring-[#0078D4]'
                          : 'border-gray-200/80 hover:bg-gray-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#0078D4]' : 'text-gray-800'}`}>
                          {dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] bg-blue-100 text-[#0078D4] font-bold px-1.5 py-0.2 rounded-full">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[10px] font-medium p-1 rounded-lg truncate ${
                              ev.category === 'urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : ev.category === 'work'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-[#0078D4]'
                            }`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Agenda View */
            <div className="max-w-2xl w-full mx-auto space-y-3">
              <h3 className="font-bold text-sm text-gray-800 mb-2">{isAr ? 'كافة المواعيد المجدولة:' : 'All Scheduled Agenda Events:'}</h3>
              {filteredEvents.map((ev) => (
                <div key={ev.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 text-[#0078D4]">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{ev.title}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {ev.date} • {ev.time} • {ev.location}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteEvent(ev.id, e)}
                    className="p-2 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Event Inspector Panel */}
        <aside className="w-72 bg-gray-50 border-s border-gray-200 p-4 flex flex-col space-y-4 text-xs select-none">
          <div className="border-b pb-3">
            <span className="font-bold text-gray-900 block text-sm">
              {isAr ? 'مواعيد اليوم المحدد' : 'Events for Selected Day'}
            </span>
            <span className="text-[11px] text-[#0078D4] font-mono font-bold mt-0.5 block">{selectedDate}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((ev) => (
                <div key={ev.id} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-1.5 relative group">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ev.category === 'urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : ev.category === 'work'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-[#0078D4]'
                      }`}
                    >
                      {ev.category}
                    </span>
                    <button
                      onClick={(e) => handleDeleteEvent(ev.id, e)}
                      className="text-gray-400 hover:text-rose-600 transition"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs">{ev.title}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                    <Clock className="w-3 h-3 text-[#0078D4]" />
                    <span>{ev.time} ({ev.duration})</span>
                  </div>
                  {ev.location && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-12">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>{isAr ? 'لا توجد مواعيد مسجلة في هذا اليوم.' : 'No events scheduled on this day.'}</p>
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="mt-3 text-[#0078D4] hover:underline font-bold text-xs"
                >
                  {isAr ? '+ إضافة موعد الآن' : '+ Add event now'}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 border border-gray-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-sm text-gray-900">{isAr ? 'إضافة حدث جديد' : 'New Calendar Event'}</h3>
              <button onClick={() => setShowAddEvent(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'عنوان الحدث:' : 'Event Title:'}</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: اجتماع فريق التطوير' : 'e.g. Design Sync'}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'التاريخ المحدد:' : 'Date:'}</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'الوقت:' : 'Time:'}</label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'المدة:' : 'Duration:'}</label>
                  <input
                    type="text"
                    value={eventDuration}
                    onChange={(e) => setEventDuration(e.target.value)}
                    placeholder="45 mins"
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'الموقع / الغرفة:' : 'Location:'}</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="SNNS Teams Room"
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">{isAr ? 'التصنيف:' : 'Category:'}</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                >
                  <option value="meeting">{isAr ? 'اجتماع (Meeting)' : 'Meeting'}</option>
                  <option value="work">{isAr ? 'عمل (Work)' : 'Work'}</option>
                  <option value="urgent">{isAr ? 'عاجل (Urgent)' : 'Urgent'}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-xl font-bold shadow-xs transition"
                >
                  {isAr ? 'حفظ الحدث' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
