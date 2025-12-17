
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import DailyCheck from './components/DailyCheck';
import MaintenanceView from './components/MaintenanceView';
import LoanSystem from './components/LoanSystem';
import Compliance from './components/Compliance';
import Settings from './components/Settings';
import Login from './components/Login';
import { Menu, LogOut } from 'lucide-react';
import { AppSettings, User } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // User Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // App Settings State (Logo, Background, Telegram)
  const [settings, setSettings] = useState<AppSettings>({
    hospitalName: 'โรงพยาบาลแก้งคร้อ จ.ชัยภูมิ',
    logoUrl: '',
    backgroundUrl: '',
    telegramBotToken: '',
    telegramChatId: '',
    // Updated URL provided by user
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycby1ybhqftSC60VL0-YNmZGdc8osPCo-pcK8bbohhZcsvVBTKlA7BXMkdnXx2AzVlKrO/exec', 
    departments: ['ER', 'ICU', 'OPD', 'Radiology', 'Pediatrics', 'เวชกรรมฟื้นฟู']
  });

  const loadSettings = () => {
    const saved = localStorage.getItem('medEquipSettings');
    if (saved) {
        const parsed = JSON.parse(saved);
        if(!parsed.departments) parsed.departments = ['ER', 'ICU', 'OPD', 'Radiology', 'Pediatrics', 'เวชกรรมฟื้นฟู'];
        
        // Use the new URL if the stored one is empty or matches the old example URL
        const oldUrl = 'https://script.google.com/macros/s/AKfycbwNijcKqa1GrH4SsjsiUmlMaMXrhIMbaQMlmyh1WnJMM8GDd9xMQHhv6hEyxkntTp0/exec';
        if(!parsed.googleScriptUrl || parsed.googleScriptUrl === oldUrl) {
            parsed.googleScriptUrl = 'https://script.google.com/macros/s/AKfycby1ybhqftSC60VL0-YNmZGdc8osPCo-pcK8bbohhZcsvVBTKlA7BXMkdnXx2AzVlKrO/exec';
        }

        if(!parsed.hospitalName) parsed.hospitalName = 'โรงพยาบาลแก้งคร้อ จ.ชัยภูมิ';
        setSettings(parsed);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleLogin = (user: User) => {
    // Reload settings when login happens, because Registration might have added a new Department
    loadSettings();
    setCurrentUser(user);
  };
  
  const handleLogout = () => {
      setCurrentUser(null);
      setActiveTab('dashboard');
  };

  const renderContent = () => {
    // Pass currentUser to components that need filtering
    switch (activeTab) {
      case 'dashboard': return <Dashboard currentUser={currentUser} />;
      case 'assets': return <AssetList settings={settings} setActiveTab={setActiveTab} />;
      case 'checks': return <DailyCheck currentUser={currentUser} />;
      case 'maintenance': return <MaintenanceView currentUser={currentUser} />;
      case 'loans': return <LoanSystem />;
      case 'compliance': return <Compliance currentUser={currentUser} />;
      case 'settings': return <Settings onSettingsChange={setSettings} />;
      default: return <Dashboard currentUser={currentUser} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} availableDepartments={settings.departments || []} />;
  }

  return (
    <div 
        className="min-h-screen flex bg-slate-50 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: settings.backgroundUrl ? `url(${settings.backgroundUrl})` : 'none' }}
    >
      {/* Background Overlay to ensure text readability if image is present */}
      <div className={`fixed inset-0 z-0 pointer-events-none ${settings.backgroundUrl ? 'bg-white/90 backdrop-blur-sm' : ''}`}></div>

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        settings={settings}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 transition-all duration-300 relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur h-16 border-b border-slate-200 sticky top-0 z-10 px-4 flex items-center justify-between shadow-sm">
          <button 
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center text-lg font-semibold text-primary-700 pl-2 lg:pl-0">
             {settings.hospitalName}
          </div>
          
          <div className="ml-auto flex items-center space-x-3">
             <div className="flex items-center space-x-2 text-sm p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border ${currentUser.role === 'Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-primary-100 text-primary-700 border-primary-200'}`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-right pr-2">
                    <p className="font-medium text-slate-700 leading-tight">{currentUser.name}</p>
                    <p className="text-xs text-slate-400">
                        {currentUser.role === 'Admin' ? 'Administrator' : currentUser.department}
                    </p>
                </div>
             </div>
             <button 
                onClick={handleLogout} 
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100"
                title="ออกจากระบบ (Logout)"
             >
                 <LogOut className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
