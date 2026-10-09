DMD ACTIVITY V2 — AJV Build Fix

แก้ Error: Cannot find module ajv/dist/compile/codegen
แก้เฉพาะ package.json โดย:
- เพิ่ม dependency ajv 8.17.1 และ ajv-keywords 5.1.0 ให้เป็นคู่ที่รองรับกัน
- ระบุ engines.node = 22.x ลดความเสี่ยงกับ react-scripts 5

ไม่ได้เปลี่ยน Firebase, src/App.js หรือฐานข้อมูล

วิธีใช้: นำไฟล์ package.json ภายใน ZIP ไปแทนไฟล์ package.json ที่ root ของ GitHub Repository DMD-ACTIVITY
กด Commit changes รอ Vercel Build
หาก Vercel รายงาน Error ใหม่ โปรดส่ง Build Logs ส่วนท้ายเพื่อตรวจต่อ
