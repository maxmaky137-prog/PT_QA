import { HospitalName, StandardCategory } from './types';

export const HOSPITAL_LIST: HospitalName[] = Object.values(HospitalName);

export const CRITICAL_ITEMS = [
  "1.2", "2.2.1", "2.2.2", "2.5", "8.2", "8.3", "8.5", "8.9"
];

export const STANDARDS_DATA: StandardCategory[] = [
  {
    id: 1,
    name: "มาตรฐานที่ 1: การจัดองค์กรและการบริหารงานกายภาพบำบัด",
    items: ["1.1", "1.2", "1.3", "1.4", "1.5"].map(id => ({ id, label: `ข้อ ${id}`, isCritical: CRITICAL_ITEMS.includes(id) }))
  },
  {
    id: 2,
    name: "มาตรฐานที่ 2: การบริหารและพัฒนาทรัพยากรบุคคล",
    items: ["2.1", "2.2", "2.2.1", "2.2.2", "2.2.3", "2.3.1", "2.3.2", "2.3.3", "2.4", "2.5"].map(id => ({ id, label: `ข้อ ${id}`, isCritical: CRITICAL_ITEMS.includes(id) }))
  },
  {
    id: 3,
    name: "มาตรฐานที่ 3: การบริหารสิ่งแวดล้อมและความปลอดภัย",
    items: ["3.1.1", "3.1.2", "3.1.3", "3.2", "3.3.1", "3.3.2", "3.4", "3.5.1", "3.5.2"].map(id => ({ id, label: `ข้อ ${id}`, isCritical: CRITICAL_ITEMS.includes(id) }))
  },
  {
    id: 4,
    name: "มาตรฐานที่ 4: การบริหารความเสี่ยง",
    items: ["4.1", "4.2", "4.3", "4.4"].map(id => ({ id, label: `ข้อ ${id}`, isCritical: CRITICAL_ITEMS.includes(id) }))
  },
  {
    id: 5,
    name: "มาตรฐานที่ 5: เครื่องมือทางกายภาพบำบัด อุปกรณ์ และสิ่งอำนวยความสะดวก",
    items: ["5.1", "5.2", "5.3", "5.4", "5.5"].map(id => ({ id, label: `ข้อ ${id}`, isCritical: CRITICAL_ITEMS.includes(id) }))
  },
  {
    id: 6,
    name: "มาตรฐานที่ 6: ระบบข้อมูลสารสนเทศทางกายภาพบำบัด",
    items: ["6.1", "6.2"].map(id => ({ id, label: `ข้อ ${id}`, isCritical: CRITICAL_ITEMS.includes(id) }))
  },
  {
    id: 7,
    name: "มาตรฐานที่ 7: การบริการทางกายภาพบำบัด",
    items: ["7.1"].map(id => ({ id, label: `ข้อ ${id}`, isCritical: CRITICAL_ITEMS.includes(id) }))
  },
  {
    id: 8,
    name: "มาตรฐานที่ 8: กระบวนการทางกายภาพบำบัด",
    items: ["8.1.1", "8.1.2", "8.2", "8.3", "8.4.1", "8.4.2", "8.4.3", "8.5", "8.6", "8.7", "8.8", "8.9"].map(id => ({ id, label: `ข้อ ${id}`, isCritical: CRITICAL_ITEMS.includes(id) }))
  },
  {
    id: 9,
    name: "มาตรฐานที่ 9: ผลลัพธ์การดำเนินงานของงานกายภาพบำบัด",
    items: ["9.1", "9.2", "9.3"].map(id => ({ id, label: `ข้อ ${id}`, isCritical: CRITICAL_ITEMS.includes(id) }))
  }
];

export const SLOT_COLORS = [
  "bg-red-100 text-red-800 border-red-200",
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-purple-100 text-purple-800 border-purple-200",
];

export const SLOT_LABELS = [
  "ลำดับที่ 1", "ลำดับที่ 2", "ลำดับที่ 3", "ลำดับที่ 4", "ลำดับที่ 5"
];