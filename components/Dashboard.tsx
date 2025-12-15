import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { db } from '../services/db';
import { AssessmentRecord, ScheduleEntry } from '../types';

export const Dashboard: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [assessmentData, scheduleData] = await Promise.all([
          db.getAssessments(),
          db.getSchedules()
      ]);
      setAssessments(Array.isArray(assessmentData) ? assessmentData : []);
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // 1. Process data for Bar Chart (Average score per hospital)
  const hospitalScores = assessments.reduce((acc, curr) => {
    if (!acc[curr.hospital]) {
      acc[curr.hospital] = { total: 0, count: 0 };
    }
    acc[curr.hospital].total += curr.totalScore;
    acc[curr.hospital].count += 1;
    return acc;
  }, {} as Record<string, { total: number, count: number }>);

  const barData = Object.keys(hospitalScores).map(h => ({
    name: h,
    score: Math.round(hospitalScores[h].total / hospitalScores[h].count)
  })).sort((a,b) => b.score - a.score);

  // 2. Process data for Pie Chart (Grading Distribution)
  const gradeCounts = assessments.reduce((acc, curr) => {
    acc[curr.grade] = (acc[curr.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(gradeCounts).map(g => ({
    name: g,
    value: gradeCounts[g]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleExportCSV = () => {
      if (assessments.length === 0) {
          alert("ไม่มีข้อมูลสำหรับการ Export");
          return;
      }
      
      const header = ["ID", "Hospital", "Date", "Total Score", "Grade", "Passed"];
      const rows = assessments.map(a => [
          a.id, 
          `"${a.hospital}"`, 
          a.date, 
          a.totalScore, 
          a.grade, 
          a.passed ? "Yes" : "No"
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" // Add BOM for Thai support
          + header.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "assessment_data_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // 3. Process Schedule Data for Table
  const sortedSchedules = [...schedules].sort((a,b) => a.date.localeCompare(b.date));

  if (loading) return <div className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล Dashboard...</div>;

  return (
    <div className="space-y-8 animate-fade-in no-print">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">แดชบอร์ดสรุปผล</h2>
             <button onClick={handleExportCSV} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 Export Data (CSV)
             </button>
        </div>

      {/* NEW: Visit Schedule Table */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
        <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            ตารางการออกเยี่ยม (Visit Schedule)
        </h3>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-teal-50 border-b border-teal-200">
                        <th className="px-4 py-3 text-left font-semibold text-teal-900 w-32">วันที่</th>
                        <th className="px-4 py-3 text-left font-semibold text-teal-900 w-1/4">โรงพยาบาลที่รับการเยี่ยม (Host)</th>
                        <th className="px-4 py-3 text-left font-semibold text-teal-900">ทีมผู้เยี่ยม (Visitors)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {sortedSchedules.length === 0 && (
                        <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">ยังไม่มีแผนการเยี่ยม</td></tr>
                    )}
                    {sortedSchedules.map((s, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-700 align-top">
                                <div className="text-base">{new Date(s.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short'})}</div>
                                <div className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString('th-TH', { year: '2-digit'})}</div>
                            </td>
                            <td className="px-4 py-3 font-bold text-teal-700 align-top text-base">
                                {s.hostHospital || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-600 align-top">
                                <div className="flex items-center gap-2 mb-2">
                                     <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                        จำนวน {s.hospitals.filter(Boolean).length} แห่ง
                                     </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {s.hospitals.filter(Boolean).map((h, i) => (
                                        <span key={i} className="inline-block bg-teal-50 rounded px-2 py-1 text-sm border border-teal-100 text-teal-800">
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-700 mb-4">สัดส่วนระดับผลการประเมิน</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-700 mb-4">แนวโน้มคะแนนเฉลี่ยรายปี</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                  { year: '2563', score: 190 },
                  { year: '2564', score: 215 },
                  { year: '2565', score: 200 },
                  { year: '2566', score: 230 },
                  { year: '2567', score: 245 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 300]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hospital Ranking */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-4">คะแนนเฉลี่ยรายโรงพยาบาล</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 300]} />
              <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
              <Tooltip />
              <Bar dataKey="score" fill="#0f766e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};