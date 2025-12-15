import React, { useState, useEffect } from 'react';
import { ScheduleManager } from './components/ScheduleManager';
import { AssessmentForm } from './components/AssessmentForm';
import { Dashboard } from './components/Dashboard';
import { db } from './services/db';
import { AppSettings } from './types';

enum Tab {
  Schedule = 'schedule',
  Assessment = 'assessment',
  Dashboard = 'dashboard',
  Settings = 'settings'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Schedule);
  // Default URL is handled in db.ts, but we initialize here for the UI input
  const [settings, setSettings] = useState<AppSettings>({
    googleSheetUrl: 'https://script.google.com/macros/s/AKfycbwxdDbrzitgYWbJ69A7prUozaOmt1XOwZc0EcABG69bAfHj8mRNUWcshgMQiIC3grZYNA/exec',
    themeColor: 'teal',
    logoUrl: '',
    headerGradient: 'from-teal-700 to-teal-900'
  });

  useEffect(() => {
    const saved = db.getSettings();
    if (saved) {
      setSettings(prev => ({ ...prev, ...saved }));
    }
  }, []);

  const handleSaveSettings = () => {
    db.saveSettings(settings);
    alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
  };

  const getGradientClass = (color: string) => {
      // Simple mapping for demo purposes. Real app might accept raw CSS classes or hex codes.
      if (color === 'blue') return 'from-blue-700 to-blue-900';
      if (color === 'indigo') return 'from-indigo-700 to-indigo-900';
      if (color === 'purple') return 'from-purple-700 to-purple-900';
      if (color === 'pink') return 'from-pink-700 to-pink-900';
      return 'from-teal-700 to-teal-900'; // default
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Schedule:
        return <ScheduleManager />;
      case Tab.Assessment:
        return <AssessmentForm />;
      case Tab.Dashboard:
        return <Dashboard />;
      case Tab.Settings:
        return (
          <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in no-print max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b pb-2">
              <CogIcon /> การตั้งค่าระบบ (System Settings)
            </h2>
            
            <div className="space-y-8">
                {/* Section 1: Connection */}
                <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        การเชื่อมต่อฐานข้อมูล
                    </h3>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4 text-sm text-blue-800">
                        <p><strong>Google Sheets Integration:</strong> ใส่ Web App URL ที่ได้จากการ Deploy Google Apps Script เพื่อเปิดใช้งานการบันทึกข้อมูลออนไลน์</p>
                    </div>
                    <label className="block text-sm font-medium text-gray-700">Google Sheet URL / Web App ID</label>
                    <input 
                        type="text" 
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition-colors" 
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={settings.googleSheetUrl}
                        onChange={(e) => setSettings({...settings, googleSheetUrl: e.target.value})}
                    />
                </div>

                {/* Section 2: Appearance */}
                <div>
                     <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        ปรับแต่งหน้าจอ (Appearance)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">สีธีมหัวข้อ (Theme Color)</label>
                            <div className="flex gap-2">
                                {['teal', 'blue', 'indigo', 'purple', 'pink'].map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setSettings({...settings, themeColor: color, headerGradient: getGradientClass(color)})}
                                        className={`w-8 h-8 rounded-full shadow-sm border-2 ${settings.themeColor === color ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: color === 'teal' ? '#0f766e' : color }}
                                    ></button>
                                ))}
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">URL โลโก้หน่วยงาน</label>
                             <input 
                                type="text" 
                                className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 text-sm focus:ring-teal-500 focus:border-teal-500" 
                                placeholder="https://example.com/logo.png"
                                value={settings.logoUrl || ''}
                                onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                             />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                    <button 
                        onClick={handleSaveSettings}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg font-bold transition-transform transform hover:-translate-y-0.5"
                    >
                        บันทึกการตั้งค่า
                    </button>
                </div>
            </div>
          </div>
        );
      default:
        return <ScheduleManager />;
    }
  };

  const headerGradient = settings.headerGradient || 'from-teal-700 to-teal-900';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sarabun">
      {/* Navbar with Dynamic Gradient */}
      <nav className={`bg-gradient-to-r ${headerGradient} text-white shadow-xl sticky top-0 z-50 no-print transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              {/* LOGO AREA */}
              <div className="bg-white p-1.5 rounded-full shadow-md overflow-hidden w-10 h-10 flex items-center justify-center">
                 {settings.logoUrl ? (
                     <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                 ) : (
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                 )}
              </div>
              <div className="flex flex-col">
                 <span className="text-lg font-bold tracking-tight leading-tight">PT Service Quality</span>
                 <span className="text-xs text-white/80 font-light">ระบบมาตรฐานกายภาพบำบัด จ.ชัยภูมิ</span>
              </div>
            </div>
            <div className="flex space-x-2 items-center overflow-x-auto ml-4 no-scrollbar">
              <NavButton 
                active={activeTab === Tab.Schedule} 
                onClick={() => setActiveTab(Tab.Schedule)} 
                icon={<CalendarIcon />}
                label="แผนงาน" 
              />
              <NavButton 
                active={activeTab === Tab.Assessment} 
                onClick={() => setActiveTab(Tab.Assessment)} 
                icon={<ClipboardIcon />}
                label="ประเมิน" 
              />
              <NavButton 
                active={activeTab === Tab.Dashboard} 
                onClick={() => setActiveTab(Tab.Dashboard)} 
                icon={<ChartIcon />}
                label="สรุปผล" 
              />
               <NavButton 
                active={activeTab === Tab.Settings} 
                onClick={() => setActiveTab(Tab.Settings)} 
                icon={<CogIcon />}
                label="ตั้งค่า" 
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 print:p-0 print:w-full">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p className="mb-2">© 2024 ระบบบริหารจัดการคุณภาพมาตรฐานบริการกายภาพบำบัด จังหวัดชัยภูมิ</p>
          <p className="text-xs text-gray-500">Designed for Physical Therapy Service Standards Assessment</p>
        </div>
      </footer>
    </div>
  );
};

// Subcomponents for UI
const NavButton: React.FC<{active: boolean, onClick: () => void, label: string, icon: React.ReactNode}> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
      active 
        ? 'bg-white/20 text-white shadow-inner backdrop-blur-sm' 
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`}
  >
    <span className="mr-2 hidden sm:block">{icon}</span>
    {label}
  </button>
);

// Icons
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
);
const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
);
const CogIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  );

export default App;