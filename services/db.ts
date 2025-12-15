import { ScheduleEntry, AssessmentRecord, AppSettings } from '../types';

const SCHEDULE_KEY = 'pt_app_schedules';
const ASSESSMENT_KEY = 'pt_app_assessments';
const SETTINGS_KEY = 'pt_app_settings';

// Hardcoded URL for easy deployment
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxdDbrzitgYWbJ69A7prUozaOmt1XOwZc0EcABG69bAfHj8mRNUWcshgMQiIC3grZYNA/exec';

// Helper to get settings synchronously for URL check
const getSettingsSync = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : { googleSheetUrl: DEFAULT_SCRIPT_URL, themeColor: 'teal' };
};

export const db = {
  getSettings: (): AppSettings => {
    return getSettingsSync();
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // ASYNC Methods for Data

  getSchedules: async (): Promise<ScheduleEntry[]> => {
    const settings = getSettingsSync();
    
    // 1. Google Sheets Mode
    if (settings.googleSheetUrl) {
      try {
        const response = await fetch(`${settings.googleSheetUrl}?action=getSchedules`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Failed to fetch from Google Sheets:", error);
        // Fallback to local if fetch fails (optional, but good for offline robustness)
        const localData = localStorage.getItem(SCHEDULE_KEY);
        return localData ? JSON.parse(localData) : [];
      }
    } 
    
    // 2. LocalStorage Mode (Fallback)
    else {
      const data = localStorage.getItem(SCHEDULE_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  saveSchedule: async (schedule: ScheduleEntry): Promise<boolean> => {
    const settings = getSettingsSync();

    if (settings.googleSheetUrl) {
        try {
            const formData = new FormData();
            formData.append('action', 'saveSchedule');
            formData.append('data', JSON.stringify(schedule));

            const response = await fetch(settings.googleSheetUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return result.success === true;
        } catch (error) {
            console.error("Save error:", error);
            alert("บันทึกออนไลน์ไม่สำเร็จ: " + error);
            return false;
        }
    } else {
        const schedules = await db.getSchedules(); 
        const existingIndex = schedules.findIndex(s => s.date === schedule.date);
        if (existingIndex >= 0) {
          schedules[existingIndex] = schedule;
        } else {
          schedules.push(schedule);
        }
        localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedules));
        return true;
    }
  },

  getAssessments: async (): Promise<AssessmentRecord[]> => {
    const settings = getSettingsSync();
    
    if (settings.googleSheetUrl) {
        try {
            const response = await fetch(`${settings.googleSheetUrl}?action=getAssessments`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Fetch assessment error:", error);
            return [];
        }
    } else {
        const data = localStorage.getItem(ASSESSMENT_KEY);
        return data ? JSON.parse(data) : [];
    }
  },

  saveAssessment: async (assessment: AssessmentRecord): Promise<boolean> => {
    const settings = getSettingsSync();

    if (settings.googleSheetUrl) {
         try {
            const formData = new FormData();
            formData.append('action', 'saveAssessment');
            formData.append('data', JSON.stringify(assessment));

            const response = await fetch(settings.googleSheetUrl, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            return result.success === true;
         } catch (error) {
             alert("บันทึกออนไลน์ไม่สำเร็จ: " + error);
             return false;
         }
    } else {
        const records = await db.getAssessments();
        records.push(assessment);
        localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(records));
        return true;
    }
  }
};