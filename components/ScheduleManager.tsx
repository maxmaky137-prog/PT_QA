import React, { useState, useEffect } from 'react';
import { HospitalName, ScheduleEntry } from '../types';
import { HOSPITAL_LIST, SLOT_COLORS, SLOT_LABELS } from '../constants';
import { db } from '../services/db';

export const ScheduleManager: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hostHospital, setHostHospital] = useState<HospitalName | ''>('');
  const [slots, setSlots] = useState<(HospitalName | null)[]>([null, null, null, null, null]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    const existing = schedules.find(s => s.date === selectedDate);
    if (existing) {
      setHostHospital(existing.hostHospital);
      setSlots(existing.hospitals);
    } else {
      setHostHospital('');
      setSlots([null, null, null, null, null]);
    }
    setWarnings([]);
  }, [selectedDate, schedules]);

  const loadSchedules = async () => {
    setIsLoading(true);
    const data = await db.getSchedules();
    setSchedules(data);
    setIsLoading(false);
  };

  const checkConstraints = (newSlots: (HospitalName | null)[], currentHost: HospitalName | ''): string[] => {
    const msgs: string[] = [];
    const dateObj = new Date(selectedDate);
    const threeMonthsAgo = new Date(dateObj);
    threeMonthsAgo.setMonth(dateObj.getMonth() - 3);

    // 0. Check if host is also in visitor slots
    if (currentHost && newSlots.includes(currentHost)) {
       msgs.push(`โรงพยาบาล ${currentHost} เป็นเจ้าภาพ ไม่ควรอยู่ในรายชื่อทีมผู้เยี่ยม`);
    }

    // 1. Check duplicates in current day
    const distinct = newSlots.filter(h => h !== null);
    const unique = new Set(distinct);
    if (distinct.length !== unique.size) {
      msgs.push("ไม่สามารถเลือกโรงพยาบาลซ้ำในทีมผู้เยี่ยมวันเดียวกันได้");
    }

    // 2. Check 3-month history rule for Visiting Team
    newSlots.forEach(hospital => {
      if (!hospital || hospital === HospitalName.Chaiyaphum) return; 

      let count = 0;
      schedules.forEach(sch => {
        const sDate = new Date(sch.date);
        if (sDate >= threeMonthsAgo && sDate < dateObj) {
          if (sch.hospitals.includes(hospital)) {
            count++;
          }
        }
      });

      if (count >= 3) {
        msgs.push(`${hospital} ออกเยี่ยมครบ 3 ครั้งแล้วในช่วง 3 เดือนที่ผ่านมา`);
      }
    });

    return msgs;
  };

  const handleSlotChange = (index: number, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = value === "" ? null : value as HospitalName;
    setSlots(newSlots);
    setWarnings(checkConstraints(newSlots, hostHospital));
  };

  const handleHostChange = (value: string) => {
      const newHost = value as HospitalName | '';
      setHostHospital(newHost);
      setWarnings(checkConstraints(slots, newHost));
  }

  const handleSave = async () => {
    if (!hostHospital) {
        alert("กรุณาเลือกโรงพยาบาลที่รับการเยี่ยม (เจ้าภาพ)");
        return;
    }
    const validation = checkConstraints(slots, hostHospital);
    if (validation.length > 0) {
      alert("กรุณาแก้ไขตามคำเตือนก่อนบันทึก: \n" + validation.join("\n"));
      return;
    }
    const count = slots.filter(Boolean).length;
    if (count < 3 || count > 5) {
      alert("ต้องเลือกทีมผู้เยี่ยม 3-5 แห่ง");
      return;
    }

    setIsLoading(true);
    const success = await db.saveSchedule({
      id: selectedDate,
      date: selectedDate,
      hostHospital: hostHospital,
      hospitals: slots
    });
    
    if (success) {
        alert("บันทึกแผนงานเรียบร้อยแล้ว");
        await loadSchedules(); // Reload to ensure sync
    }
    setIsLoading(false);
  };

  const handlePrint = () => {
      window.print();
  }

  // Helper to group schedules by month
  const getSchedulesByMonth = () => {
    const groups: Record<string, ScheduleEntry[]> = {};
    const sorted = [...schedules].sort((a,b) => a.date.localeCompare(b.date));
    
    sorted.forEach(s => {
        const date = new Date(s.date);
        const key = date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
        if(!groups[key]) groups[key] = [];
        groups[key].push(s);
    });
    return groups;
  };

  const monthGroups = getSchedulesByMonth();

  return (
    <div className="space-y-6 animate-fade-in p-4 bg-white rounded-lg shadow-md print:shadow-none print:p-0">
       {/* PRINT HEADER ONLY */}
       <div className="print-only mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800">ระบบบริหารจัดการคุณภาพมาตรฐานบริการกายภาพบำบัด จังหวัดชัยภูมิ</h1>
            <p className="text-lg mt-2">แผนการออกเยี่ยมประเมิน</p>
            <p className="text-sm text-gray-500 mt-1">วันที่พิมพ์เอกสาร: {new Date().toLocaleDateString('th-TH')}</p>
            <div className="border-b-2 border-gray-800 mt-4"></div>
       </div>

      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 no-print">
        <h2 className="text-2xl font-bold text-teal-800 flex items-center gap-2">
            จัดการแผนออกเยี่ยม
            {isLoading && <span className="text-sm text-gray-500 font-normal animate-pulse">(กำลังโหลดข้อมูล...)</span>}
        </h2>
        <div className="flex gap-2 mt-2 md:mt-0">
             <button onClick={handlePrint} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                พิมพ์ / PDF
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: List of Schedules (Month View) */}
        <div className="md:col-span-1 print:hidden order-2 md:order-1">
          <div className="bg-gray-50 rounded-lg p-4 h-full border">
             <h3 className="font-bold text-teal-800 mb-4 flex justify-between items-center">
                 ปฏิทินการเยี่ยม (รายเดือน)
                 <button onClick={loadSchedules} className="text-xs text-teal-600 hover:underline">รีเฟรช</button>
             </h3>
             <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {Object.keys(monthGroups).length === 0 && <p className="text-gray-400 text-center py-4">ยังไม่มีแผนการเยี่ยม</p>}
                {Object.entries(monthGroups).map(([month, items]) => (
                    <div key={month}>
                        <h4 className="text-sm font-bold text-gray-500 border-b mb-2 pb-1 sticky top-0 bg-gray-50">{month}</h4>
                        <div className="space-y-2">
                            {items.map(sch => (
                                <div 
                                    key={sch.date} 
                                    onClick={() => setSelectedDate(sch.date)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedDate === sch.date ? 'bg-white border-teal-500 shadow-md ring-1 ring-teal-200' : 'bg-white border-gray-200 hover:border-teal-300'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="text-teal-700 font-bold text-lg">
                                            {new Date(sch.date).getDate()}
                                        </div>
                                        <div className="text-right flex-1 ml-3">
                                            <div className="font-bold text-gray-800 text-sm">{sch.hostHospital || "ไม่ระบุ"}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Expanded Details: Visitor Count and Names */}
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                         <div className="text-xs font-semibold text-gray-500 flex justify-between">
                                            <span>ทีมผู้เยี่ยม:</span>
                                            <span className="bg-teal-100 text-teal-800 px-1.5 rounded-full text-[10px]">{sch.hospitals.filter(Boolean).length} แห่ง</span>
                                         </div>
                                         <div className="flex flex-wrap gap-1 mt-1">
                                            {sch.hospitals.filter(Boolean).map((h, i) => (
                                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded">
                                                    {h}
                                                </span>
                                            ))}
                                         </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2 space-y-4 print:col-span-3 order-1 md:order-2">
          {/* Header for Print View */}
          <div className="hidden print:block mb-4">
             <h3 className="text-xl font-semibold">วันที่: {new Date(selectedDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</h3>
             <h3 className="text-xl font-bold mt-2">โรงพยาบาลที่รับการเยี่ยม (Host): <span className="text-teal-800 underline">{hostHospital || "-"}</span></h3>
          </div>

          {warnings.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 no-print">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm leading-5 font-medium text-red-800">พบข้อผิดพลาดตามเงื่อนไข</h3>
                  <div className="mt-2 text-sm leading-5 text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 no-print">
             <h3 className="font-bold text-teal-800 mb-3 border-b border-teal-200 pb-2">1. ข้อมูลการเยี่ยม</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">โรงพยาบาลที่รับการเยี่ยม (Host)</label>
                    <select
                        className="w-full p-2 border rounded border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        value={hostHospital}
                        onChange={(e) => handleHostChange(e.target.value)}
                    >
                        <option value="">-- เลือกโรงพยาบาล --</option>
                        {HOSPITAL_LIST.map(h => (
                        <option key={h} value={h}>{h}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เยี่ยม</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-2 border rounded border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
             </div>
          </div>

          <div className="no-print">
             <h3 className="font-bold text-gray-700 mb-2 mt-4">2. ทีมผู้เยี่ยม (Visiting Team)</h3>
          </div>

          {slots.map((hospital, index) => (
            <div key={index} className={`p-4 rounded-lg border flex items-center gap-4 transition-all print:border-gray-400 print:break-inside-avoid ${hospital ? SLOT_COLORS[index] : 'bg-white border-gray-200'}`}>
              <div className="font-bold w-24 text-sm print:text-black">{SLOT_LABELS[index]}</div>
              <select
                className="flex-1 p-2 rounded border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 no-print"
                value={hospital || ""}
                onChange={(e) => handleSlotChange(index, e.target.value)}
              >
                <option value="">-- ว่าง --</option>
                {HOSPITAL_LIST.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              {/* Text display for Print only */}
              <div className="hidden print:block flex-1 font-medium text-lg border-b border-dotted border-gray-400 pb-1">
                  {hospital || "-"}
              </div>
            </div>
          ))}

          <div className="pt-4 flex justify-end no-print">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกแผนงาน'}
            </button>
          </div>

          <div className="hidden print:block mt-12">
            <div className="flex justify-between px-10">
                <div className="text-center">
                    <p>......................................................</p>
                    <p className="mt-2">ผู้จัดทำแผน</p>
                </div>
                <div className="text-center">
                    <p>......................................................</p>
                    <p className="mt-2">ผู้อนุมัติ</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};