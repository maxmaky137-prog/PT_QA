export enum HospitalName {
  PakdiChumpol = "รพ.ภักดีชุมพล",
  SapYai = "รพ.ซับใหญ่",
  BamnetNarong = "รพ.บำเหน็จณรงค์",
  Chatturat = "รพ.จตุรัส",
  BanKhwao = "รพ.บ้านเขว้า",
  ChaiyaphumMunicipality = "เทศบาลเมืองชัยภูมิ",
  ThepSathit = "รพ.เทพสถิต",
  KaengKhro = "รพ.แก้งคร้อ",
  NongBuaDaeng = "รพ.หนองบัวแดง",
  PhuKhieo = "รพ.ภูเขียวเฉลิมพระเกียรติ",
  KhonSan = "รพ.คอนสาร",
  Chaiyaphum = "รพ.ชัยภูมิ",
  NongBuaRawe = "รพ.หนองบัวระเหว",
  NoenSaNga = "รพ.เนินสง่า",
  BanThaen = "รพ.บ้านแท่น",
  KhonSawan = "รพ.คอนสวรรค์",
  KasetSombun = "รพ.เกษตรสมบูรณ์",
  SpecialEducationCenter = "ศูนย์การศึกษาพิเศษ"
}

export interface StandardItem {
  id: string;
  label: string;
  isCritical: boolean;
}

export interface StandardCategory {
  id: number;
  name: string;
  items: StandardItem[];
}

export interface ScheduleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  hostHospital: HospitalName; // The hospital being visited
  hospitals: (HospitalName | null)[]; // Array of 5 slots (The visiting team)
}

export interface StandardComment {
    commendation: string; // ข้อชื่นชม
    suggestion: string;   // ข้อเสนอแนะ
}

export interface AssessmentRecord {
  id: string;
  hospital: HospitalName;
  date: string;
  scores: Record<string, number>; // itemID -> score (1-5)
  comments?: Record<number, StandardComment>; // standardID -> { commendation, suggestion }
  totalScore: number;
  grade: 'ดี' | 'ดีมาก' | 'ดีเยี่ยม' | 'ไม่ผ่าน';
  passed: boolean;
  visitors?: string[]; // Added: List of visiting hospitals
}

export interface AppSettings {
  googleSheetUrl: string;
  themeColor: string;
  logoUrl?: string; // Optional custom logo
  headerGradient?: string; // Optional custom header gradient
}