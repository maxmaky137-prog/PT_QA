import React, { useState, useEffect } from 'react';
import { HospitalName, AssessmentRecord, StandardComment, ScheduleEntry } from '../types';
import { HOSPITAL_LIST, STANDARDS_DATA } from '../constants';
import { db } from '../services/db';

export const AssessmentForm: React.FC = () => {
  const [selectedHospital, setSelectedHospital] = useState<HospitalName | ''>('');
  const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<number, StandardComment>>({});
  
  // New state for fetching schedules and determining visitors
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [visitingTeam, setVisitingTeam] = useState<string[]>([]);

  // 1. Fetch Schedules on load
  useEffect(() => {
    const loadData = async () => {
        const data = await db.getSchedules();
        setSchedules(data);
    };
    loadData();
  }, []);

  // 2. Update Visiting Team when Hospital or Date changes
  useEffect(() => {
    if (selectedHospital && assessmentDate) {
        const match = schedules.find(s => s.hostHospital === selectedHospital && s.date === assessmentDate);
        if (match) {
            // Filter out nulls and set the team
            const team = match.hospitals.filter((h): h is HospitalName => h !== null);
            setVisitingTeam(team);
        } else {
            setVisitingTeam([]);
        }
    } else {
        setVisitingTeam([]);
    }
  }, [selectedHospital, assessmentDate, schedules]);
  
  const handleScoreChange = (itemId: string, score: number) => {
    setScores(prev => ({ ...prev, [itemId]: score }));
  };

  const handleCommentChange = (standardId: number, type: 'commendation' | 'suggestion', value: string) => {
      setComments(prev => ({
          ...prev,
          [standardId]: {
              commendation: type === 'commendation' ? value : (prev[standardId]?.commendation || ''),
              suggestion: type === 'suggestion' ? value : (prev[standardId]?.suggestion || '')
          }
      }));
  };

  const calculateResult = () => {
    let totalScore = 0;
    let criticalPassed = true;
    let criticalDetails: {id: string, pass: boolean}[] = [];

    STANDARDS_DATA.forEach(std => {
      std.items.forEach(item => {
        const rawScore = scores[item.id] || 0;
        const finalScore = item.isCritical ? rawScore * 3 : rawScore;
        totalScore += finalScore;

        if (item.isCritical) {
            const isPass = rawScore >= 3;
            if (!isPass) criticalPassed = false;
            criticalDetails.push({ id: item.id, pass: isPass });
        }
      });
    });

    const percent = (totalScore / 300) * 100;
    let grade: 'ดี' | 'ดีมาก' | 'ดีเยี่ยม' | 'ไม่ผ่าน' = 'ไม่ผ่าน';

    if (totalScore >= 240) grade = 'ดีเยี่ยม';
    else if (totalScore >= 210) grade = 'ดีมาก';
    else if (totalScore >= 180) grade = 'ดี';
    else grade = 'ไม่ผ่าน';

    const passed = percent >= 60 && criticalPassed;
    if (!passed) grade = 'ไม่ผ่าน';

    return { totalScore, percent, grade, passed, criticalDetails };
  };

  const result = calculateResult();

  const handleSave = () => {
    if (!selectedHospital) return alert("กรุณาเลือกโรงพยาบาล");
    
    let filled = true;
    STANDARDS_DATA.forEach(s => s.items.forEach(i => {
        if (!scores[i.id]) filled = false;
    }));

    if(!filled) {
        if(!confirm("คุณยังกรอกคะแนนไม่ครบทุกข้อ ต้องการบันทึกหรือไม่?")) return;
    }

    const record: AssessmentRecord = {
        id: Date.now().toString(),
        hospital: selectedHospital as HospitalName,
        date: assessmentDate,
        scores,
        comments,
        totalScore: result.totalScore,
        grade: result.grade,
        passed: result.passed,
        visitors: visitingTeam // Save the visiting team data
    };

    db.saveAssessment(record);
    alert("บันทึกผลการประเมินเรียบร้อยแล้ว");
    setScores({});
    setComments({});
    window.scrollTo(0,0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in print:shadow-none print:p-0">
      
      {/* PRINT HEADER */}
      <div className="print-only text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">ระบบบริหารจัดการคุณภาพมาตรฐานบริการกายภาพบำบัด จังหวัดชัยภูมิ</h1>
            <p className="text-lg mt-2">แบบบันทึกการประเมินมาตรฐานงานกายภาพบำบัด</p>
            <div className="border-b-2 border-gray-800 mt-4 mb-4"></div>
            <div className="flex flex-col gap-2 text-left mb-4 px-2 text-sm">
                <div className="flex justify-between">
                    <div className="font-semibold w-1/2">โรงพยาบาล: <span className="font-normal border-b border-dotted border-gray-400 px-2 inline-block min-w-[200px]">{selectedHospital}</span></div>
                    <div className="font-semibold w-1/2 text-right">วันที่: <span className="font-normal border-b border-dotted border-gray-400 px-2 inline-block min-w-[150px]">{new Date(assessmentDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}</span></div>
                </div>
                {/* Show Visitors in Print */}
                <div className="flex items-start mt-2">
                    <div className="font-semibold whitespace-nowrap mr-2">ทีมผู้เยี่ยม:</div>
                    <div className="font-normal border-b border-dotted border-gray-400 flex-1 px-2 leading-relaxed">
                        {visitingTeam.length > 0 ? visitingTeam.join(', ') : "- ไม่มีข้อมูลในแผนงาน -"}
                    </div>
                </div>
            </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 no-print">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-600">
            แบบตรวจสอบคะแนนมาตรฐาน
        </h2>
        <div className="mt-4 md:mt-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex flex-col items-end min-w-[200px] shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">คะแนนรวม (เต็ม 300)</span>
            <span className="text-4xl font-extrabold text-blue-700">{result.totalScore}</span>
            <span className={`text-sm font-bold px-3 py-1 mt-1 rounded-full ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {result.grade} ({result.percent.toFixed(1)}%)
            </span>
        </div>
      </div>

      {/* INPUT FORM (Hidden on print) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 no-print bg-gray-50 p-6 rounded-xl border border-gray-100">
        <div className="relative">
          <label className="block text-gray-700 mb-1 font-bold">1. โรงพยาบาลที่ประเมิน</label>
          <select 
            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value as HospitalName)}
          >
            <option value="">-- เลือกโรงพยาบาล --</option>
            {HOSPITAL_LIST.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-1 font-bold">2. วันที่ประเมิน</label>
          <input 
            type="date" 
            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
            value={assessmentDate}
            onChange={(e) => setAssessmentDate(e.target.value)}
          />
        </div>
        
        {/* Visitor Team Display (Web View) */}
        <div className="md:col-span-2 mt-2">
            <label className="block text-gray-700 mb-2 font-bold flex justify-between">
                3. ทีมผู้เยี่ยม (อ้างอิงจากแผนงาน)
                {visitingTeam.length === 0 && selectedHospital && (
                    <span className="text-xs text-red-500 font-normal self-center">* ไม่พบข้อมูลในแผนงานของวันที่นี้</span>
                )}
            </label>
            <div className="bg-white p-3 border rounded-lg min-h-[50px] flex items-center flex-wrap gap-2">
                {visitingTeam.length > 0 ? (
                    visitingTeam.map((team, idx) => (
                        <span key={idx} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium border border-teal-200">
                            {team}
                        </span>
                    ))
                ) : (
                    <span className="text-gray-400 italic text-sm">กรุณาเลือกโรงพยาบาลและวันที่ เพื่อแสดงรายชื่อทีมผู้เยี่ยม</span>
                )}
            </div>
        </div>
      </div>

      <div className="space-y-8 print:space-y-6">
        {STANDARDS_DATA.map((std) => (
          <div key={std.id} className="border border-gray-200 rounded-xl overflow-hidden print:border-gray-300 print:break-inside-avoid shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="bg-gradient-to-r from-teal-50 to-white px-5 py-4 border-b print:bg-gray-100 print:py-2 flex justify-between items-center">
                <h3 className="font-bold text-lg text-teal-800 print:text-black">{std.name}</h3>
            </div>
            <div className="p-5 space-y-4 print:p-2 print:space-y-2">
              {std.items.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between border-b last:border-0 pb-3 last:pb-0 gap-2 print:border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-gray-600 w-16 print:text-sm bg-gray-100 px-2 py-1 rounded text-center">{item.label}</span>
                    {item.isCritical && (
                        <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1 font-semibold print:border-gray-400 print:text-black">
                             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                             วิกฤต
                        </span>
                    )}
                  </div>
                  {/* Web View: Buttons */}
                  <div className="flex gap-1 no-print">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => handleScoreChange(item.id, score)}
                        className={`w-10 h-10 rounded-full font-bold transition-all duration-200 border ${
                          scores[item.id] === score
                            ? 'bg-teal-600 text-white shadow-lg scale-110 border-teal-700'
                            : 'bg-white text-gray-400 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  {/* Print View: Score Display */}
                  <div className="hidden print:block font-bold">
                      {scores[item.id] ? scores[item.id] : "_"} / 5
                  </div>
                </div>
              ))}
              
              {/* Comment Section (Commendation & Suggestion) */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed border-gray-300 print:mt-2 print:gap-2 print:border-gray-400">
                  <div className="print:break-inside-avoid">
                      <label className="block text-sm font-semibold text-green-700 mb-1 print:text-black">ข้อชื่นชม:</label>
                      <textarea 
                         rows={4}
                         className="w-full p-2 border border-green-200 rounded-md bg-green-50 text-sm focus:ring-green-500 focus:border-green-500 print:bg-white print:border-gray-400 print:h-24 resize-none"
                         placeholder="ระบุข้อชื่นชม..."
                         value={comments[std.id]?.commendation || ''}
                         onChange={(e) => handleCommentChange(std.id, 'commendation', e.target.value)}
                      />
                  </div>
                  <div className="print:break-inside-avoid">
                      <label className="block text-sm font-semibold text-orange-700 mb-1 print:text-black">ข้อเสนอแนะ:</label>
                       <textarea 
                         rows={4}
                         className="w-full p-2 border border-orange-200 rounded-md bg-orange-50 text-sm focus:ring-orange-500 focus:border-orange-500 print:bg-white print:border-gray-400 print:h-24 resize-none"
                         placeholder="ระบุข้อเสนอแนะ..."
                         value={comments[std.id]?.suggestion || ''}
                         onChange={(e) => handleCommentChange(std.id, 'suggestion', e.target.value)}
                      />
                  </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Print Summary Footer */}
      <div className="hidden print:block mt-8 border-t-2 border-gray-800 pt-4 break-inside-avoid">
            <div className="flex justify-between items-start">
                 <div>
                    <h4 className="font-bold underline mb-2 text-lg">สรุปผลการประเมิน</h4>
                    <div className="space-y-1">
                        <p>คะแนนรวม: <span className="font-bold">{result.totalScore}</span> / 300</p>
                        <p>คิดเป็นร้อยละ: <span className="font-bold">{result.percent.toFixed(2)} %</span></p>
                        <p>ระดับคุณภาพ: <span className="font-bold text-xl px-2 border border-black rounded">{result.grade}</span></p>
                    </div>
                 </div>
                 <div className="text-center pt-10">
                     <p>ลงชื่อ ...................................................... ผู้ประเมิน</p>
                     <p className="mt-2">( ...................................................... )</p>
                     <p className="mt-2">วันที่ ......./......./.......</p>
                 </div>
            </div>
      </div>

      <div className="mt-10 flex justify-center gap-4 no-print pb-10">
        <button 
            onClick={() => window.print()}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg shadow font-medium flex items-center gap-2 transition-colors"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            พิมพ์แบบฟอร์ม (PDF)
        </button>
        <button 
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg shadow-lg font-bold text-lg transform hover:-translate-y-1 transition-all"
        >
            บันทึกผลการประเมิน
        </button>
      </div>
    </div>
  );
};