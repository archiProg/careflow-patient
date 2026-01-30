export const user_role = { p: "patient", d: "doctor", a: "admin" };

export const user_sex = [
  {
    label: "Male",
    value: 1,
  },
  {
    label: "Female",
    value: 2,
  },
];

export const measurement_types = {
  BMI: 1,
  BP: 2,
  BF: 3,
  temp: 4,
  bo: 5,
  bs: 6,
  whr: 7,
  ncg: 8,
  zytz: 9,
  ecg: 10,
  xzsx: 11,
  eye: 12,
  sds: 13,
  thxhdb: 14,
  fei: 15,
  jiu: 16,
  gmd: 17,
  com: 18,
};

export const lng_list = [
  { lable: "lng_th", value: "th" },
  { lable: "lng_en", value: "en" },
];

export const ws_cmd = {
  // ======== COMMON ========
  LOGIN: 1,
  DOCTOR_STATUS: 100, // doctor toggle ready/not ready
  MEASUREMENT_RESULT: 10,

  // ======== PATIENT FLOW ========
  PATIENT_REQUEST_CONSULT: 200, // คนไข้กด "ต้องการพบหมอ" + ส่งประเภทหมอที่เลือก
  PATIENT_WAITING: 201, // server แจ้งคนไข้ว่าเข้าสู่คิวรอแล้ว
  PATIENT_ASSIGNED_DOCTOR: 202, // server แจ้งคนไข้ว่าเจอหมอแล้ว ส่งข้อมูลหมอพื้นฐาน
  PATIENT_ENTER_CALL: 203, // คนไข้เข้าสู่หน้าพร้อมคุย

  // ======== DOCTOR FLOW ========
  DOCTOR_NEW_JOB: 300, // server ส่งงานให้หมอเมื่อมีคนไข้ต้องการ (auto assign)
  DOCTOR_ACCEPT_JOB: 301, // หมอกดรับงาน (หรือ auto accept ถ้าตั้งค่าไว้)
  DOCTOR_ENTER_CALL: 302, // หมอเข้าสู่หน้าพร้อมคุย

  // ======== SERVER INTERNAL FEEDBACK ========
  NO_DOCTOR_AVAILABLE: 400, // แจ้งคนไข้ว่าไม่เจอหมอที่ว่าง
  DOCTOR_REJECTED: 401, // หมอ reject งาน → server หาหมอคนอื่น
  DOCTOR_BUSY_FINDING: 402, // server กำลังหาใหม่ (optional)
  CALL_END: 403, // จบการสนทนา
};
