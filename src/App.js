import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Shield,
  UserPlus,
  FileText,
  Download,
  Upload,
  Printer,
  Award
} from "lucide-react";

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyDCZ52fpo2BT3gK3bLuzWU0IJ19Jrhul6E",
  authDomain: "dmdavtivity.firebaseapp.com",
  projectId: "dmdavtivity",
  storageBucket: "dmdavtivity.firebasestorage.app",
  messagingSenderId: "327352683433",
  appId: "1:327352683433:web:0e37bb0b416fb244f852b8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PROFILES_PATH = "profiles";
const ACTIVITIES_PATH = "activities";
const RECORDS_PATH = "records";

export default function App() {
  // ฝัง Tailwind CSS เพื่อความสวยงาม
  useEffect(() => {
    if (!document.getElementById("tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  // --- States ---
  const [appUser, setAppUser] = useState(null);

  const [profiles, setProfiles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [records, setRecords] = useState([]);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingDb, setLoadingDb] = useState(true);

  // --- Sync กับ Firebase แบบ Real-time ---
  useEffect(() => {
    const unsubProfiles = onSnapshot(
      collection(db, PROFILES_PATH),
      (snapshot) => {
        setProfiles(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLoadingDb(false);
      }
    );
    const unsubActivities = onSnapshot(
      collection(db, ACTIVITIES_PATH),
      (snapshot) => {
        setActivities(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );
    const unsubRecords = onSnapshot(
      collection(db, RECORDS_PATH),
      (snapshot) => {
        setRecords(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => {
      unsubProfiles();
      unsubActivities();
      unsubRecords();
    };
  }, []);

  // --- Login Logic ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!loginId.trim()) return;

    if (loginId.trim() === "admin") {
      if (password !== "995622") {
        setErrorMsg("รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง");
        return;
      }
      const adminProfile = profiles.find((p) => p.userId === "admin");
      if (adminProfile) {
        setAppUser(adminProfile);
      } else {
        const newAdminId = `admin_${Date.now()}`;
        const adminData = {
          userId: "admin",
          role: "admin",
          firstName: "ผู้ดูแลระบบ",
          lastName: "สูงสุด",
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, PROFILES_PATH, newAdminId), adminData);
        setAppUser({ id: newAdminId, ...adminData });
      }
      return;
    }

    const foundUser = profiles.find((p) => p.userId === loginId.trim());
    if (foundUser) {
      setAppUser(foundUser);
    } else {
      setErrorMsg("ไม่พบรหัสประจำตัวนี้ในระบบ");
    }
  };

  const handleLogout = () => {
    setAppUser(null);
    setLoginId("");
    setPassword("");
    setActiveTab("dashboard");
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // --- Renders ---
  if (loadingDb) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>กำลังเชื่อมต่อฐานข้อมูล...</p>
      </div>
    );
  }

  if (!appUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            ระบบบันทึกกิจกรรม
          </h1>
          <p className="text-center text-gray-500 mb-8">สาขาดิจิทัลกราฟิก</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสประจำตัว (อาจารย์/นักศึกษา)
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="กรอกรหัสประจำตัว"
                required
              />
            </div>
            {loginId.trim() === "admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน (เฉพาะแอดมิน)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
              </div>
            )}
            {errorMsg && (
              <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {errorMsg}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center print:hidden">
        <h1 className="font-bold text-gray-800">ระบบบันทึกกิจกรรม</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-gray-100 rounded text-gray-600"
        >
          {isMobileMenuOpen ? (
            <XCircle />
          ) : (
            <div className="space-y-1">
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </div>
          )}
        </button>
      </div>

      <aside
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-white shadow-md md:min-h-screen flex flex-col print:hidden absolute md:static z-10 min-h-screen`}
      >
        <div className="p-6 border-b flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {appUser.role === "admin" ? (
              <Shield className="text-blue-600" size={32} />
            ) : appUser.role === "teacher" ? (
              <BookOpen className="text-indigo-600" size={32} />
            ) : (
              <Users className="text-green-600" size={32} />
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-800 text-center">
            {appUser.firstName} {appUser.lastName}
          </h2>
          <p className="text-sm text-gray-500">
            {appUser.role === "teacher"
              ? "อาจารย์"
              : appUser.role === "student"
              ? "นักศึกษา"
              : "ผู้ดูแลระบบ"}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {appUser.role === "admin" && (
            <>
              <SidebarButton
                icon={<UserPlus />}
                label="จัดการอาจารย์"
                active={activeTab === "manage_teachers"}
                onClick={() => switchTab("manage_teachers")}
              />
              <SidebarButton
                icon={<Users />}
                label="จัดการนักศึกษา"
                active={activeTab === "manage_students"}
                onClick={() => switchTab("manage_students")}
              />
              <SidebarButton
                icon={<FileText />}
                label="รายงานภาพรวมทั้งหมด"
                active={activeTab === "admin_report"}
                onClick={() => switchTab("admin_report")}
              />
            </>
          )}
          {appUser.role === "teacher" && (
            <>
              <SidebarButton
                icon={<Plus />}
                label="สร้างกิจกรรม"
                active={activeTab === "dashboard"}
                onClick={() => switchTab("dashboard")}
              />
              <SidebarButton
                icon={<CheckCircle />}
                label="อนุมัติกิจกรรม"
                active={activeTab === "approvals"}
                onClick={() => switchTab("approvals")}
              />
              <SidebarButton
                icon={<Printer />}
                label="พิมพ์รายงาน"
                active={activeTab === "report"}
                onClick={() => switchTab("report")}
              />
            </>
          )}
          {appUser.role === "student" && (
            <>
              <SidebarButton
                icon={<FileText />}
                label="บันทึกกิจกรรม"
                active={activeTab === "dashboard"}
                onClick={() => switchTab("dashboard")}
              />
              <SidebarButton
                icon={<Clock />}
                label="ประวัติกิจกรรมของฉัน"
                active={activeTab === "history"}
                onClick={() => switchTab("history")}
              />
            </>
          )}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:overflow-visible bg-white">
        {/* Admin Views */}
        {appUser.role === "admin" && activeTab === "manage_teachers" && (
          <AdminManageUsers role="teacher" profiles={profiles} />
        )}
        {appUser.role === "admin" && activeTab === "manage_students" && (
          <AdminManageUsers role="student" profiles={profiles} />
        )}
        {appUser.role === "admin" && activeTab === "admin_report" && (
          <AdminReport records={records} />
        )}

        {/* Teacher Views */}
        {appUser.role === "teacher" && activeTab === "dashboard" && (
          <TeacherDashboard user={appUser} activities={activities} />
        )}
        {appUser.role === "teacher" && activeTab === "approvals" && (
          <TeacherApprovals user={appUser} records={records} />
        )}
        {appUser.role === "teacher" && activeTab === "report" && (
          <TeacherReport user={appUser} records={records} profiles={profiles} />
        )}

        {/* Student Views */}
        {appUser.role === "student" && activeTab === "dashboard" && (
          <StudentDashboard
            user={appUser}
            activities={activities}
            profiles={profiles}
            records={records}
          />
        )}
        {appUser.role === "student" && activeTab === "history" && (
          <StudentHistory user={appUser} records={records} />
        )}
      </main>
    </div>
  );
}

const SidebarButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
      active
        ? "bg-blue-50 text-blue-700 font-medium"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </button>
);

const Card = ({ children, title, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 ${className}`}>
    {title && (
      <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
        {title}
      </h3>
    )}
    {children}
  </div>
);

// --- Admin Components ---
const AdminManageUsers = ({ role, profiles }) => {
  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    major: "ดิจิทัลกราฟิก",
    level: "",
    room: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [importing, setImporting] = useState(false);

  const users = useMemo(
    () => profiles.filter((p) => p.role === role),
    [profiles, role]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, PROFILES_PATH, editingId), formData);
        setMsg("อัพเดทข้อมูลสำเร็จ");
      } else {
        if (profiles.some((p) => p.userId === formData.userId))
          return setMsg("รหัสนี้มีในระบบแล้ว");
        const newId = `${role}_${Date.now()}`;
        await setDoc(doc(db, PROFILES_PATH, newId), {
          ...formData,
          role,
          createdAt: new Date().toISOString(),
        });
        setMsg("เพิ่มข้อมูลสำเร็จ");
      }
      setFormData({
        userId: "",
        firstName: "",
        lastName: "",
        major: "ดิจิทัลกราฟิก",
        level: "",
        room: "",
      });
      setEditingId(null);
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ต้องการลบผู้ใช้นี้ใช่หรือไม่?")) {
      await deleteDoc(doc(db, PROFILES_PATH, id));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setMsg("กำลังนำเข้าข้อมูล...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const lines = event.target.result
          .split("\n")
          .filter((line) => line.trim() !== "");
        let count = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i]
            .split(",")
            .map((c) => c.trim().replace(/^"|"$/g, ""));
          if (cols.length < 3 || profiles.some((p) => p.userId === cols[0]))
            continue;
          const newId = `${role}_${Date.now()}_${i}`;
          await setDoc(doc(db, PROFILES_PATH, newId), {
            userId: cols[0],
            firstName: cols[1] || "",
            lastName: cols[2] || "",
            role,
            ...(role === "student"
              ? {
                  major: cols[3] || "ดิจิทัลกราฟิก",
                  level: cols[4] || "",
                  room: cols[5] || "",
                }
              : {}),
            createdAt: new Date().toISOString(),
          });
          count++;
        }
        setMsg(`นำเข้าข้อมูลสำเร็จ ${count} รายการ`);
      } catch (err) {
        setMsg("เกิดข้อผิดพลาดในการนำเข้า");
      }
      setImporting(false);
      e.target.value = null;
      setTimeout(() => setMsg(""), 5000);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const header =
      role === "teacher"
        ? "userId,firstName,lastName\n"
        : "userId,firstName,lastName,major,level,room\n";
    const blob = new Blob(["\uFEFF" + header], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `template_${role}.csv`;
    link.click();
  };

  return (
    <div>
      <Card
        title={
          role === "teacher" ? "จัดการข้อมูลอาจารย์" : "จัดการข้อมูลนักศึกษา"
        }
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              รหัสประจำตัว
            </label>
            <input
              type="text"
              required
              value={formData.userId}
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
              disabled={editingId}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ชื่อ</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">นามสกุล</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          {role === "student" && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">สาขา</label>
                <input
                  type="text"
                  required
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  ระดับชั้น (เช่น ปวช.1)
                </label>
                <input
                  type="text"
                  required
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ห้อง</label>
                <input
                  type="text"
                  required
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </>
          )}
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {editingId ? "บันทึก" : "เพิ่มข้อมูล"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    userId: "",
                    firstName: "",
                    lastName: "",
                    major: "ดิจิทัลกราฟิก",
                    level: "",
                    room: "",
                  });
                }}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                ยกเลิก
              </button>
            )}
            {msg && <span className="text-green-600 self-center">{msg}</span>}
          </div>
        </form>
      </Card>

      <Card title={`รายชื่อ${role === "teacher" ? "อาจารย์" : "นักศึกษา"}`}>
        <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-2 border-b pb-4">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-sm bg-gray-200 px-3 py-2 rounded flex items-center"
          >
            <Download size={16} className="mr-1" /> โหลดไฟล์แม่แบบ CSV
          </button>
          <label className="text-sm bg-indigo-100 text-indigo-700 px-3 py-2 rounded flex items-center cursor-pointer">
            <Upload size={16} className="mr-1" />{" "}
            {importing ? "กำลังนำเข้า..." : "นำเข้าจาก CSV"}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-3">รหัส</th>
                <th className="p-3">ชื่อ-นามสกุล</th>
                {role === "student" && <th className="p-3">ชั้น/ห้อง</th>}
                <th className="p-3">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">{u.userId}</td>
                  <td className="p-3">
                    {u.firstName} {u.lastName}
                  </td>
                  {role === "student" && (
                    <td className="p-3">
                      {u.level}/{u.room}
                    </td>
                  )}
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(u.id);
                        setFormData(u);
                      }}
                      className="text-blue-500"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const AdminReport = ({ records }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    taskDescription: "",
    hours: 0,
    status: "pending"
  });

  const handleExportCSV = () => {
    const headers = [
      "อ.ผู้ดูแล",
      "รหัสนักศึกษา",
      "ชื่อนักศึกษา",
      "กิจกรรม",
      "รายละเอียดงานที่ทำ",
      "ชั่วโมง",
      "สถานะ",
    ];

    const csvData = records
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((r) => {
        // ครอบข้อความที่มีช่องว่างหรือเครื่องหมายคอมม่าด้วย "" ป้องกัน CSV เลื่อน
        const safeTaskDesc = r.taskDescription
          ? `"${r.taskDescription.replace(/"/g, '""')}"`
          : "";
        const statusThai =
          r.status === "approved"
            ? "อนุมัติ"
            : r.status === "rejected"
            ? "ไม่อนุมัติ"
            : "รอตรวจสอบ";

        return [
          r.teacherName,
          r.studentId,
          r.studentName,
          r.activityName,
          safeTaskDesc,
          r.hours,
          statusThai,
        ].join(",");
      });

    const csvContent = [headers.join(","), ...csvData].join("\n");
    // เพิ่ม \uFEFF เพื่อให้รองรับภาษาไทยใน Excel
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `admin_report_all_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const handleUpdateRecord = async (id) => {
    try {
      await updateDoc(doc(db, RECORDS_PATH, id), {
        taskDescription: editData.taskDescription,
        hours: Number(editData.hours),
        status: editData.status
      });
      setEditingId(null);
    } catch(err) {
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการกิจกรรมนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      try {
        await deleteDoc(doc(db, RECORDS_PATH, id));
      } catch(err) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 print:hidden gap-4">
        <h3 className="text-xl font-bold text-gray-800">รายงานภาพรวมทั้งหมด</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center shadow-sm"
          >
            <Download size={18} className="mr-2" /> ส่งออก CSV
          </button>
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center shadow-sm"
          >
            <Printer size={18} className="mr-2" /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      <div className="print:block overflow-x-auto">
        <div className="hidden print:block text-center mb-8">
          <h2 className="text-2xl font-bold">
            รายงานบันทึกกิจกรรมทั้งหมด (ผู้ดูแลระบบ)
          </h2>
        </div>

        <table className="w-full text-left border-collapse border border-gray-300 whitespace-nowrap">
          <thead>
            <tr className="bg-gray-100 text-gray-800 text-sm">
              <th className="p-3 border border-gray-300">อ.ผู้ดูแล</th>
              <th className="p-3 border border-gray-300">รหัสนักศึกษา</th>
              <th className="p-3 border border-gray-300">ชื่อนักศึกษา</th>
              <th className="p-3 border border-gray-300">กิจกรรม</th>
              <th className="p-3 border border-gray-300">รายละเอียดงานที่ทำ</th>
              <th className="p-3 border border-gray-300 text-center">
                ชั่วโมง
              </th>
              <th className="p-3 border border-gray-300">สถานะ</th>
              <th className="p-3 border border-gray-300 text-center print:hidden">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {records
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((r) => (
                <tr key={r.id} className="border-b">
                  {editingId === r.id ? (
                    // โหมดแก้ไขกิจกรรม (Admin Edit Mode)
                    <>
                      <td className="p-3 border border-gray-300 text-gray-500">{r.teacherName}</td>
                      <td className="p-3 border border-gray-300 text-gray-500">{r.studentId}</td>
                      <td className="p-3 border border-gray-300 text-gray-500">{r.studentName}</td>
                      <td className="p-3 border border-gray-300 text-gray-500">{r.activityName}</td>
                      <td className="p-2 border border-gray-300">
                        <input 
                          type="text" 
                          value={editData.taskDescription} 
                          onChange={(e) => setEditData({...editData, taskDescription: e.target.value})}
                          className="w-full p-1 border rounded text-sm min-w-[200px]"
                        />
                      </td>
                      <td className="p-2 border border-gray-300 text-center">
                        <input 
                          type="number" 
                          min="1" 
                          value={editData.hours} 
                          onChange={(e) => setEditData({...editData, hours: e.target.value})}
                          className="w-16 p-1 border rounded text-sm text-center mx-auto"
                        />
                      </td>
                      <td className="p-2 border border-gray-300">
                        <select 
                          value={editData.status} 
                          onChange={(e) => setEditData({...editData, status: e.target.value})}
                          className="w-full p-1 border rounded text-sm"
                        >
                          <option value="pending">รอตรวจสอบ</option>
                          <option value="approved">อนุมัติ</option>
                          <option value="rejected">ไม่อนุมัติ</option>
                        </select>
                      </td>
                      <td className="p-2 border border-gray-300 text-center flex gap-2 justify-center items-center print:hidden">
                        <button onClick={() => handleUpdateRecord(r.id)} className="text-green-600 hover:text-green-800" title="บันทึก">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700" title="ยกเลิก">
                          <XCircle size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    // โหมดแสดงผลปกติ
                    <>
                      <td className="p-3 border border-gray-300 text-indigo-700 font-medium">
                        {r.teacherName}
                      </td>
                      <td className="p-3 border border-gray-300">{r.studentId}</td>
                      <td className="p-3 border border-gray-300">
                        {r.studentName}
                      </td>
                      <td className="p-3 border border-gray-300">
                        {r.activityName}
                      </td>
                      <td className="p-3 border border-gray-300 text-sm whitespace-normal min-w-[200px]">
                        {r.taskDescription}
                      </td>
                      <td className="p-3 border border-gray-300 text-center font-bold">
                        {r.hours}
                      </td>
                      <td className="p-3 border border-gray-300 font-medium text-sm">
                        {r.status === "approved" ? (
                          <span className="text-green-600">อนุมัติ</span>
                        ) : r.status === "rejected" ? (
                          <span className="text-red-600">ไม่อนุมัติ</span>
                        ) : (
                          <span className="text-yellow-600">รอตรวจสอบ</span>
                        )}
                      </td>
                      <td className="p-3 border border-gray-300 text-center flex gap-2 justify-center print:hidden">
                        <button 
                          onClick={() => {
                            setEditingId(r.id);
                            setEditData({
                              taskDescription: r.taskDescription || "",
                              hours: r.hours || 1,
                              status: r.status || "pending"
                            });
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="แก้ไขรายการ"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(r.id)}
                          className="text-red-500 hover:text-red-700"
                          title="ลบรายการ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            {records.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  ไม่มีข้อมูลกิจกรรมในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// --- Teacher Components ---
const TeacherDashboard = ({ user, activities }) => {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    activityName: "",
    location: "",
    hours: 1,
    date: today,
  });

  // State สำหรับการแก้ไขกิจกรรม
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    activityName: "",
    location: "",
    hours: 1,
    date: "",
  });

  const myActivities = useMemo(
    () => activities.filter((a) => a.teacherId === user.userId),
    [activities, user]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newId = `act_${Date.now()}`;
    await setDoc(doc(db, ACTIVITIES_PATH, newId), {
      ...formData,
      teacherId: user.userId,
      teacherName: `${user.firstName} ${user.lastName}`,
    });
    setFormData({ activityName: "", location: "", hours: 1, date: today });
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleUpdate = async (id) => {
    await updateDoc(doc(db, ACTIVITIES_PATH, id), {
      activityName: editData.activityName,
      location: editData.location,
      hours: Number(editData.hours),
      date: editData.date,
    });
    setEditingId(null);
  };

  return (
    <div>
      <Card title="สร้างกิจกรรมใหม่">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="md:col-span-4">
            <label className="block text-sm mb-1">ชื่อกิจกรรม</label>
            <input
              type="text"
              required
              value={formData.activityName}
              onChange={(e) =>
                setFormData({ ...formData, activityName: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm mb-1">วันที่จัดกิจกรรม</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">สถานที่</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm mb-1">จำนวนชั่วโมง</label>
            <input
              type="number"
              min="1"
              required
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: Number(e.target.value) })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="md:col-span-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded mt-2"
            >
              สร้างกิจกรรม
            </button>
          </div>
        </form>
      </Card>
      <Card title="กิจกรรมที่ฉันสร้าง">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100 text-sm">
                <th className="p-3">วันที่จัด</th>
                <th className="p-3">ชื่อกิจกรรม</th>
                <th className="p-3">สถานที่</th>
                <th className="p-3 text-center">ชั่วโมง</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {myActivities
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((a) => (
                  <tr key={a.id} className="border-b">
                    {editingId === a.id ? (
                      // โหมดแก้ไข
                      <>
                        <td className="p-2">
                          <input type="date" value={editData.date} onChange={(e) => setEditData({...editData, date: e.target.value})} className="w-full p-1 border rounded text-sm" />
                        </td>
                        <td className="p-2">
                          <input type="text" value={editData.activityName} onChange={(e) => setEditData({...editData, activityName: e.target.value})} className="w-full p-1 border rounded text-sm" />
                        </td>
                        <td className="p-2">
                          <input type="text" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} className="w-full p-1 border rounded text-sm" />
                        </td>
                        <td className="p-2">
                          <input type="number" min="1" value={editData.hours} onChange={(e) => setEditData({...editData, hours: e.target.value})} className="w-full p-1 border rounded text-sm text-center" />
                        </td>
                        <td className="p-2 text-center flex gap-2 justify-center items-center mt-1">
                          <button onClick={() => handleUpdate(a.id)} className="text-green-600 hover:text-green-800" title="บันทึก">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700" title="ยกเลิก">
                            <XCircle size={18} />
                          </button>
                        </td>
                      </>
                    ) : (
                      // โหมดแสดงผลปกติ
                      <>
                        <td className="p-3 text-gray-600">
                          {new Date(a.date).toLocaleDateString("th-TH")}
                        </td>
                        <td className="p-3 font-medium">{a.activityName}</td>
                        <td className="p-3">{a.location}</td>
                        <td className="p-3 text-center text-indigo-700 font-bold">
                          {a.hours}
                        </td>
                        <td className="p-3 text-center flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setEditingId(a.id);
                              setEditData({ activityName: a.activityName, location: a.location, hours: a.hours, date: a.date });
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="แก้ไข"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("ต้องการลบกิจกรรมนี้ใช่หรือไม่?"))
                                deleteDoc(doc(db, ACTIVITIES_PATH, a.id));
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="ลบ"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const TeacherApprovals = ({ user, records }) => {
  const myPending = records.filter(
    (r) => r.teacherId === user.userId && r.status === "pending"
  );
  const handleStatus = async (id, status) => {
    await updateDoc(doc(db, RECORDS_PATH, id), { status });
  };

  return (
    <Card title={`รอการอนุมัติ (${myPending.length})`}>
      <div className="space-y-4">
        {myPending.map((r) => (
          <div
            key={r.id}
            className="border p-4 rounded-lg bg-yellow-50 flex flex-col md:flex-row justify-between gap-4"
          >
            <div>
              <p className="font-bold">
                {r.studentName} ({r.studentId})
              </p>
              <p className="text-indigo-700">
                {r.activityName} • {r.hours} ชั่วโมง
              </p>
              <p className="text-sm mt-2">
                <strong>หน้าที่:</strong> {r.taskDescription}
              </p>
            </div>
            <div className="flex gap-2 self-end md:self-center">
              <button
                onClick={() => handleStatus(r.id, "approved")}
                className="bg-green-500 text-white px-3 py-2 rounded flex"
              >
                <CheckCircle size={18} className="mr-1" /> อนุมัติ
              </button>
              <button
                onClick={() => handleStatus(r.id, "rejected")}
                className="bg-red-500 text-white px-3 py-2 rounded flex"
              >
                <XCircle size={18} className="mr-1" /> ไม่อนุมัติ
              </button>
            </div>
          </div>
        ))}
        {myPending.length === 0 && (
          <p className="text-center text-gray-500">ไม่มีรายการรออนุมัติ</p>
        )}
      </div>
    </Card>
  );
};

// Teacher Report Component (เพิ่มชั้น/ห้อง และรับ props `profiles` มาใช้งาน)
const TeacherReport = ({ user, records, profiles }) => {
  const myRecords = records.filter((r) => r.teacherId === user.userId);

  const handleExportCSV = () => {
    const headers = [
      "รหัสนักศึกษา",
      "ชื่อ-นามสกุล",
      "ชั้น/ห้อง",
      "กิจกรรม",
      "รายละเอียดงานที่ทำ",
      "ชั่วโมง",
      "สถานะ",
    ];

    const csvData = myRecords.map((r) => {
      // ค้นหาโปรไฟล์นักศึกษาเพื่อเอาข้อมูล ชั้นและห้อง
      const studentProfile = profiles.find(p => p.userId === r.studentId);
      const levelRoomInfo = studentProfile ? `${studentProfile.level || '-'}/${studentProfile.room || '-'}` : '-';

      // ครอบข้อความที่มีช่องว่างหรือเครื่องหมายคอมม่าด้วย "" ป้องกัน CSV เลื่อน
      const safeTaskDesc = r.taskDescription
        ? `"${r.taskDescription.replace(/"/g, '""')}"`
        : "";
      const statusThai =
        r.status === "approved"
          ? "อนุมัติ"
          : r.status === "rejected"
          ? "ไม่อนุมัติ"
          : "รอตรวจสอบ";

      return [
        r.studentId,
        r.studentName,
        levelRoomInfo,
        r.activityName,
        safeTaskDesc,
        r.hours,
        statusThai,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvData].join("\n");
    // เพิ่ม \uFEFF เพื่อให้รองรับภาษาไทยใน Excel
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report_${user.firstName}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 print:hidden gap-4">
        <h3 className="text-xl font-bold">รายงาน</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center shadow-sm"
          >
            <Download size={18} className="mr-2" /> ส่งออก CSV
          </button>
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center shadow-sm"
          >
            <Printer size={18} className="mr-2" /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      <div className="print:block overflow-x-auto">
        <h2 className="hidden print:block text-2xl font-bold text-center mb-4">
          รายงานบันทึกกิจกรรม (อ.{user.firstName})
        </h2>
        <table className="w-full text-left border-collapse border border-gray-300 whitespace-nowrap">
          <thead>
            <tr className="bg-gray-100 text-sm">
              <th className="p-3 border">รหัส</th>
              <th className="p-3 border">ชื่อ</th>
              <th className="p-3 border">ชั้น/ห้อง</th>
              <th className="p-3 border">กิจกรรม</th>
              <th className="p-3 border text-center">ชั่วโมง</th>
              <th className="p-3 border">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {myRecords.map((r) => {
              const studentProfile = profiles.find(p => p.userId === r.studentId);
              const levelRoomInfo = studentProfile ? `${studentProfile.level || '-'}/${studentProfile.room || '-'}` : '-';

              return (
                <tr key={r.id} className="border-b">
                  <td className="p-3 border">{r.studentId}</td>
                  <td className="p-3 border">{r.studentName}</td>
                  <td className="p-3 border text-gray-600">{levelRoomInfo}</td>
                  <td className="p-3 border">{r.activityName}</td>
                  <td className="p-3 border text-center">{r.hours}</td>
                  <td className="p-3 border text-sm">
                    {r.status === "approved" ? (
                      <span className="text-green-600">อนุมัติแล้ว</span>
                    ) : r.status === "rejected" ? (
                      <span className="text-red-600">ไม่อนุมัติ</span>
                    ) : (
                      <span className="text-yellow-600">รอตรวจสอบ</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {myRecords.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// --- Student Components ---
const StudentDashboard = ({ user, activities, profiles, records }) => {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [msg, setMsg] = useState("");
  const [imgError, setImgError] = useState(false);

  const teachers = profiles.filter((p) => p.role === "teacher");
  const currentActivityObj = activities.find((a) => a.id === selectedActivity);
  
  // คำนวณชั่วโมงสะสม
  const totalHours = records
    .filter((r) => r.studentId === user.userId && r.status === "approved")
    .reduce((sum, r) => sum + r.hours, 0);

  // ฟังก์ชันคำนวณ Rank (อัพเดทใหม่)
  const getRankInfo = (hours) => {
    if (hours <= 3) {
      return {
        level: "Rank 0",
        name: "หนูคือสลอตที่ยังไม่ตื่นไปทำกิจกรรมค่ะคุณลูก",
        message: "สลอตยังหลับ... แต่นักเรียนห้ามหลับตามนะ!เตรียมตัวให้พร้อม แล้วมาร่วมกิจกรรมเพื่อฝึกความรู้และความคล่องตัวกันเถอะ",
        image: "Rank (0).png",
        bgColor: "from-gray-200 to-gray-100",
        textColor: "text-gray-800",
        iconColor: "text-gray-500"
      };
    } else if (hours <= 40) {
      return {
        level: "Rank 1",
        name: "หนูคือ นกกระจอก ค่ะลูก",
        message: "เริ่มบินแล้ว แต่ยังต้องสะสมพลังจากการทำกิจกรรมอีกหน่อย",
        image: "Rank (1).png",
        bgColor: "from-amber-100 to-amber-50",
        textColor: "text-amber-800",
        iconColor: "text-amber-500"
      };
    } else if (hours <= 60) {
      return {
        level: "Rank 2",
        name: "คุณคือพญาเหยี่ยว",
        message: "เริ่มเฉียบคมและมุ่งมั่น ทำกิจกรรมต่อเนื่องอีกนิดจะไปได้ไกล",
        image: "Rank (2).png",
        bgColor: "from-slate-200 to-slate-100",
        textColor: "text-slate-800",
        iconColor: "text-slate-500"
      };
    } else if (hours <= 80) {
      return {
        level: "Rank 3",
        name: "คุณคือพญาเสือเบงกอล",
        message: "พลังมาเต็มแล้ว คุณคือสายลุยกิจกรรมตัวจริง",
        image: "Rank (3).png",
        bgColor: "from-orange-200 to-orange-100",
        textColor: "text-orange-800",
        iconColor: "text-orange-500"
      };
    } else {
      return {
        level: "Rank 4",
        name: "คุณคือพญามังกรผงาด",
        message: "คุณคือระดับสูงสุดของกิจกรรม โดดเด่น สม่ำเสมอ และเป็นแบบอย่างที่ดี",
        image: "Rank (4).png",
        bgColor: "from-red-200 to-red-100",
        textColor: "text-red-800",
        iconColor: "text-red-500"
      };
    }
  };

  const rankInfo = getRankInfo(totalHours);

  const mySubmittedActivityIds = records
    .filter((r) => r.studentId === user.userId)
    .map((r) => r.activityId);
  const availableActivities = activities.filter(
    (a) =>
      a.teacherId === selectedTeacher && !mySubmittedActivityIds.includes(a.id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentActivityObj) return;
    const newId = `rec_${Date.now()}`;
    await setDoc(doc(db, RECORDS_PATH, newId), {
      studentId: user.userId,
      studentName: `${user.firstName} ${user.lastName}`,
      activityId: currentActivityObj.id,
      activityName: currentActivityObj.activityName,
      teacherId: currentActivityObj.teacherId,
      teacherName: currentActivityObj.teacherName,
      hours: currentActivityObj.hours,
      taskDescription: taskDesc,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    setTaskDesc("");
    setSelectedActivity("");
    setMsg("ส่งรออนุมัติแล้ว");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      {/* ส่วนแสดงข้อมูลผู้ใช้และเวลาสะสม */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-6 text-white shadow-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-blue-100 flex items-center">
              <span className="bg-blue-800 bg-opacity-50 px-2 py-1 rounded text-sm mr-2">{user.userId}</span>
              <span>สาขา {user.major}</span>
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center md:text-right min-w-[150px]">
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">เวลาสะสมทั้งหมด</p>
            <div className="text-4xl font-extrabold flex items-center justify-center md:justify-end">
              <Clock className="mr-2 h-8 w-8 text-yellow-300" /> 
              <span>{totalHours} <span className="text-xl font-normal">ชม.</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนแสดง Rank */}
      <Card className={`bg-gradient-to-br ${rankInfo.bgColor} border-none shadow-md overflow-hidden relative`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-40 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-white rounded-full p-2 shadow-inner flex items-center justify-center relative">
            {/* วงแหวนตกแต่งรอบ Logo */}
            <div className={`absolute inset-0 rounded-full border-4 border-dashed ${rankInfo.iconColor} opacity-50 animate-[spin_10s_linear_infinite]`}></div>
            
            {!imgError ? (
              <img 
                src={rankInfo.image} 
                alt={rankInfo.name} 
                className="w-full h-full object-contain rounded-full relative z-10"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white rounded-full">
                <Award className={`w-16 h-16 ${rankInfo.iconColor}`} />
              </div>
            )}

          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-white ${rankInfo.textColor} shadow-sm`}>
              {rankInfo.level}
            </div>
            <h3 className={`text-2xl md:text-3xl font-extrabold ${rankInfo.textColor} mb-2`}>
              {rankInfo.name}
            </h3>
            <p className={`text-sm md:text-base font-medium ${rankInfo.textColor} opacity-90 bg-white bg-opacity-40 p-3 rounded-lg inline-block md:block`}>
              "{rankInfo.message}"
            </p>
            
            {/* Progress bar to next rank */}
            {totalHours <= 80 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1 font-medium text-gray-600">
                  <span>ความคืบหน้า</span>
                  <span>
                    {totalHours <= 3 ? "เป้าหมาย: 4 ชม." : 
                     totalHours <= 40 ? "เป้าหมาย: 41 ชม." : 
                     totalHours <= 60 ? "เป้าหมาย: 61 ชม." : 
                     "เป้าหมาย: 81 ชม."}
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      totalHours <= 3 ? 'bg-gray-500' : 
                      totalHours <= 40 ? 'bg-amber-500' : 
                      totalHours <= 60 ? 'bg-slate-500' : 
                      'bg-orange-500'
                    }`} 
                    style={{ 
                      width: `${
                        totalHours <= 3 ? (totalHours/4)*100 : 
                        totalHours <= 40 ? (totalHours/41)*100 : 
                        totalHours <= 60 ? ((totalHours-40)/21)*100 : 
                        ((totalHours-60)/21)*100
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="บันทึกกิจกรรมใหม่">
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={selectedTeacher}
            onChange={(e) => {
              setSelectedTeacher(e.target.value);
              setSelectedActivity("");
            }}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
          >
            <option value="">-- 1. เลือกอาจารย์ --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.userId}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            required
            disabled={!selectedTeacher}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow disabled:opacity-50"
          >
            <option value="">-- 2. เลือกกิจกรรม --</option>
            {availableActivities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.activityName} ({a.hours} ชม.)
              </option>
            ))}
          </select>

          {selectedTeacher && availableActivities.length === 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
              ไม่มีกิจกรรมใหม่ให้เลือก
              (คุณได้กรอกกิจกรรมของอาจารย์ท่านนี้ครบหมดแล้ว หรืออาจารย์ยังไม่ได้สร้างกิจกรรมใหม่)
            </p>
          )}

          <textarea
            rows="3"
            required
            placeholder="3. ระบุภาระหน้าที่ที่ได้รับมอบหมาย..."
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow resize-none"
          ></textarea>
          <div className="flex items-center">
            <button
              type="submit"
              disabled={!selectedActivity}
              className={`font-bold px-6 py-3 rounded-lg text-white shadow-md transition-all ${
                selectedActivity
                  ? "bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              ส่งบันทึกเพื่อรออนุมัติ
            </button>
            {msg && (
              <span className="ml-4 text-green-600 flex items-center bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5 mr-1" /> {msg}
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

const StudentHistory = ({ user, records }) => {
  const [editingId, setEditingId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const myRecords = records
    .filter((r) => r.studentId === user.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleSave = async (id) => {
    await updateDoc(doc(db, RECORDS_PATH, id), { taskDescription: editDesc });
    setEditingId(null);
  };

  return (
    <Card title="ประวัติกิจกรรมของฉัน">
      <div className="space-y-4">
        {myRecords.map((r) => (
          <div
            key={r.id}
            className={`border p-4 rounded-lg flex flex-col md:flex-row gap-4 ${
              r.status === "approved"
                ? "bg-green-50 border-green-200"
                : r.status === "rejected"
                ? "bg-red-50 border-red-200"
                : "bg-white border-gray-200"
            } transition-shadow hover:shadow-md`}
          >
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-gray-800 text-lg">{r.activityName}</h4>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  r.status === "approved" ? "bg-green-100 text-green-700" :
                  r.status === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {r.status === "approved"
                    ? "อนุมัติแล้ว"
                    : r.status === "rejected"
                    ? "ไม่อนุมัติ"
                    : "รอตรวจ"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-1 inline" /> อ. {r.teacherName}
              </p>
              
              {editingId === r.id ? (
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="แก้ไขรายละเอียดงาน..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(r.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      บันทึก
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg flex justify-between items-start border border-black/5">
                  <p className="text-sm text-gray-700 leading-relaxed">{r.taskDescription}</p>
                  {r.status === "pending" && (
                    <button
                      onClick={() => {
                        setEditingId(r.id);
                        setEditDesc(r.taskDescription);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm ml-4 flex items-center flex-shrink-0"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> แก้ไข
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-row md:flex-col items-center justify-center md:min-w-[100px] border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 pl-0 md:pl-4 mt-2 md:mt-0">
              <span className="text-3xl font-black text-indigo-600 mr-2 md:mr-0">
                {r.hours}
              </span>
              <span className="text-sm text-gray-500 font-medium">ชั่วโมง</span>
            </div>
          </div>
        ))}
        {myRecords.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">ยังไม่มีประวัติการทำกิจกรรม</p>
          </div>
        )}
      </div>
    </Card>
  );
};
