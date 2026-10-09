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
  Award,
  ClipboardList,
  Search,
  ArrowLeft
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
              <SidebarButton
                icon={<ClipboardList />}
                label="รายงานรายบุคคล"
                active={activeTab === "individual_report"}
                onClick={() => switchTab("individual_report")}
              />
              <SidebarButton
                icon={<BookOpen />}
                label="รายงานอาจารย์"
                active={activeTab === "teacher_report_admin"}
                onClick={() => switchTab("teacher_report_admin")}
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
                label="รายงานกิจกรรม"
                active={activeTab === "report"}
                onClick={() => switchTab("report")}
              />
              <SidebarButton
                icon={<ClipboardList />}
                label="รายงานรายบุคคล"
                active={activeTab === "teacher_individual_report"}
                onClick={() => switchTab("teacher_individual_report")}
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
          <AdminReport records={records} activities={activities} profiles={profiles} />
        )}
        {appUser.role === "admin" && activeTab === "individual_report" && (
          <StudentIndividualReport profiles={profiles} records={records} activities={activities} />
        )}

        {appUser.role === "admin" && activeTab === "teacher_report_admin" && (
          <AdminTeacherReport profiles={profiles} activities={activities} records={records} />
        )}

        {/* Teacher Views */}
        {appUser.role === "teacher" && activeTab === "dashboard" && (
          <TeacherDashboard user={appUser} activities={activities} />
        )}
        {appUser.role === "teacher" && activeTab === "approvals" && (
          <TeacherApprovals user={appUser} records={records} />
        )}
        {appUser.role === "teacher" && activeTab === "report" && (
          <TeacherReport user={appUser} records={records} profiles={profiles} activities={activities} />
        )}

        {appUser.role === "teacher" && activeTab === "teacher_individual_report" && (
          <StudentIndividualReport
            title="รายงานรายบุคคล (นักเรียนที่บันทึกกับอาจารย์)"
            records={records.filter((r) => r.teacherId === appUser.userId)}
            profiles={profiles.filter((p) => p.role === "student" && records.some((r) => r.teacherId === appUser.userId && r.studentId === p.userId))}
            activities={activities}
          />
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

// --- Report helpers: shared by admin and teacher reports ---
const ACTIVITY_CATEGORIES = [
  { value: "academic_service", label: "บริการวิชาการ" },
  { value: "professional_service", label: "บริการวิชาชีพ" },
  { value: "volunteer", label: "จิตอาสา" },
  { value: "competency_training", label: "ฝึกสมรรถนะวิชาชีพ" },
];
const UNCLASSIFIED = "ยังไม่ระบุ";
const COURSE_TYPES = [
  { value: "curricular", label: "ในหลักสูตร" },
  { value: "extracurricular", label: "นอกหลักสูตร" }
];
const activityCategoryLabel = (value) =>
  ACTIVITY_CATEGORIES.find((c) => c.value === value || c.label === value)?.label ||
  (typeof value === "string" && value.trim() ? value : UNCLASSIFIED);
const activityTypeLabels = (types) => (
  Array.isArray(types) ? types : []
).map((value) => COURSE_TYPES.find((type) => type.value === value || type.label === value)?.label).filter(Boolean);
const activityLookup = (activities) => new Map(activities.map((activity) => [activity.id, activity]));
const reportCategory = (record, lookup) => activityCategoryLabel(
  record.activityCategory || lookup.get(record.activityId)?.activityCategory
);
const reportTypes = (record, lookup) => activityTypeLabels(
  Array.isArray(record.trainingTypes) && record.trainingTypes.length
    ? record.trainingTypes : lookup.get(record.activityId)?.trainingTypes
);
const reportDate = (record, lookup) => record.activityDate || lookup.get(record.activityId)?.date || record.createdAt;
const reportHours = (record) => Number(record.hours) || 0;
const reportStatus = (record) => record.status === "approved" ? "อนุมัติ" : record.status === "rejected" ? "ไม่อนุมัติ" : "รอตรวจสอบ";
const approvedHours = (records) => records.reduce((total, record) =>
  total + (record.status === "approved" ? reportHours(record) : 0), 0);
const newestFirst = (records) => [...records].sort((a, b) =>
  new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
const formatActivityDate = (dateValue) => {
  if (!dateValue) return "–";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "–" : date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
};
const studentLevelRoom = (profile) => profile
  ? [profile.level, profile.room].filter(Boolean).join("/") || "ไม่ระบุ"
  : "ไม่ระบุ";
const downloadActivityCsv = (rows, filename) => {
  const csvCell = (value) => {
    const str = String(value ?? "");
    // Protect CSV cells from being interpreted as formulas by Excel.
    const safe = /^[=+@\-\t\r\n]/.test(str) ? "'" + str : str;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};
const reportRows = (records, activities, profiles) => {
  const lookup = activityLookup(activities);
  const people = new Map(profiles.filter((p) => p.role === "student").map((p) => [p.userId, p]));
  return [
    ["วันที่", "อาจารย์ผู้ดูแล", "รหัสนักเรียน", "ชื่อ-นามสกุล", "ชั้น/ห้อง", "หมวดกิจกรรมหลัก", "ใน/นอกหลักสูตร", "ชื่อกิจกรรม", "รายละเอียดงานที่ทำ", "ชั่วโมง", "สถานะ"],
    ...records.map((record) => [
      formatActivityDate(reportDate(record, lookup)), record.teacherName || "", record.studentId || "",
      record.studentName || "", studentLevelRoom(people.get(record.studentId)),
      reportCategory(record, lookup), reportTypes(record, lookup).join(" / ") || UNCLASSIFIED,
      record.activityName || "", record.taskDescription || "", reportHours(record), reportStatus(record)
    ])
  ];
};
const categoryStats = (records, lookup) => {
  const categories = [
    ...ACTIVITY_CATEGORIES.map(({ label }) => label), UNCLASSIFIED,
    ...[...new Set(records.map((r) => reportCategory(r, lookup)))].filter((label) =>
      !ACTIVITY_CATEGORIES.some((c) => c.label === label) && label !== UNCLASSIFIED)
  ];
  return categories.map((label) => {
    const matches = records.filter((record) => reportCategory(record, lookup) === label);
    return {
      label, total: matches.length,
      approved: matches.filter((r) => r.status === "approved").length,
      pending: matches.filter((r) => r.status !== "approved" && r.status !== "rejected").length,
      hours: approvedHours(matches)
    };
  });
};
const curriculumStats = (records, lookup) => [
  ...COURSE_TYPES.map(({ label }) => label), UNCLASSIFIED
].map((label) => {
  const matches = records.filter((record) => {
    const labels = reportTypes(record, lookup);
    return label === UNCLASSIFIED ? labels.length === 0 : labels.includes(label);
  });
  return {
    label, total: matches.length,
    approved: matches.filter((r) => r.status === "approved").length,
    pending: matches.filter((r) => r.status !== "approved" && r.status !== "rejected").length,
    hours: approvedHours(matches)
  };
});
const ReportBreakdown = ({ records, activities }) => {
  const lookup = activityLookup(activities);
  const renderStats = (items, title) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <h4 className="p-3 font-semibold bg-gray-50 text-gray-800">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[450px]">
          <thead className="bg-gray-100 text-gray-600"><tr>
            <th className="p-3">ประเภท</th><th className="p-3 text-center">รายการทั้งหมด</th>
            <th className="p-3 text-center">อนุมัติแล้ว</th><th className="p-3 text-center">รอตรวจสอบ</th>
            <th className="p-3 text-right">ชั่วโมงอนุมัติ</th>
          </tr></thead>
          <tbody>{items.map((item) => <tr key={item.label} className="border-t">
            <td className="p-3 font-medium whitespace-nowrap">{item.label}</td>
            <td className="p-3 text-center">{item.total}</td><td className="p-3 text-center">{item.approved}</td>
            <td className="p-3 text-center">{item.pending}</td>
            <td className="p-3 text-right font-bold text-green-700">{item.hours}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
  return <div className="space-y-3 mb-5">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-xl bg-blue-50 p-4"><p className="text-sm text-blue-800">รายการทั้งหมด</p><p className="text-2xl font-bold">{records.length}</p></div>
      <div className="rounded-xl bg-green-50 p-4"><p className="text-sm text-green-800">ชั่วโมงอนุมัติรวม</p><p className="text-2xl font-bold">{approvedHours(records)} ชม.</p></div>
      <div className="rounded-xl bg-amber-50 p-4"><p className="text-sm text-amber-800">รอตรวจสอบ</p><p className="text-2xl font-bold">{records.filter((r) => r.status !== "approved" && r.status !== "rejected").length} รายการ</p></div>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {renderStats(categoryStats(records, lookup), "สรุปแยกตามหมวดกิจกรรมหลัก")}
      {renderStats(curriculumStats(records, lookup), "สรุปแยกตามในหลักสูตร / นอกหลักสูตร")}
    </div>
    <p className="text-xs text-gray-500">* ชั่วโมงนับเฉพาะรายการอนุมัติแล้ว · กิจกรรมที่เลือกทั้งในและนอกหลักสูตรจะปรากฏทั้งสองแถว จึงไม่ควรนำยอดสองแถวนี้มาบวกกัน · รายการเดิมที่ไม่ระบุประเภทแสดงในกลุ่ม “ยังไม่ระบุ”</p>
  </div>;
};
const ReportFilters = ({ search, setSearch, category, setCategory, training, setTraining, status, setStatus, extra }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5 print:hidden">
    <div className="lg:col-span-2 relative"><Search size={17} className="absolute left-3 top-3 text-gray-400" />
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อ รหัส หรือกิจกรรม" className="w-full border rounded-lg p-2 pl-10" />
    </div>
    <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded-lg bg-white" aria-label="กรองหมวดกิจกรรม">
      <option value="all">ทุกหมวดกิจกรรม</option>{ACTIVITY_CATEGORIES.map((c) => <option value={c.label} key={c.value}>{c.label}</option>)}<option value={UNCLASSIFIED}>{UNCLASSIFIED}</option>
    </select>
    <select value={training} onChange={(e) => setTraining(e.target.value)} className="p-2 border rounded-lg bg-white" aria-label="กรองในหรือนอกหลักสูตร">
      <option value="all">ทุกประเภทหลักสูตร</option><option value="ในหลักสูตร">ในหลักสูตร</option><option value="นอกหลักสูตร">นอกหลักสูตร</option><option value={UNCLASSIFIED}>{UNCLASSIFIED}</option>
    </select>
    <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded-lg bg-white" aria-label="กรองสถานะ">
      <option value="all">ทุกสถานะ</option><option value="approved">อนุมัติแล้ว</option><option value="pending">รอตรวจสอบ</option><option value="rejected">ไม่อนุมัติ</option>
    </select>
    {extra}
  </div>
);
const applyReportFilters = (records, lookup, { search = "", category = "all", training = "all", status = "all", teacherId = "all" }) => {
  const keyword = search.trim().toLocaleLowerCase("th-TH");
  return newestFirst(records.filter((record) => {
    const categoryLabel = reportCategory(record, lookup);
    const types = reportTypes(record, lookup);
    const matched = [record.studentName, record.studentId, record.teacherName, record.activityName,
      record.taskDescription, categoryLabel, types.join(" ")].join(" ").toLocaleLowerCase("th-TH");
    return (!keyword || matched.includes(keyword)) &&
      (category === "all" || categoryLabel === category) &&
      (training === "all" || (training === UNCLASSIFIED ? types.length === 0 : types.includes(training))) &&
      (status === "all" || (status === "pending" ? record.status !== "approved" && record.status !== "rejected" : record.status === status)) &&
      (teacherId === "all" || record.teacherId === teacherId);
  }));
};
const RecordReportTable = ({ records, activities, profiles, canEdit = false }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ taskDescription: "", hours: 1, status: "pending" });
  const lookup = activityLookup(activities);
  const students = new Map(profiles.filter((p) => p.role === "student").map((p) => [p.userId, p]));
  const handleSave = async (recordId) => {
    if (!Number.isFinite(Number(editData.hours)) || Number(editData.hours) < 0) {
      window.alert("จำนวนชั่วโมงต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป"); return;
    }
    try {
      await updateDoc(doc(db, RECORDS_PATH, recordId), {
        taskDescription: editData.taskDescription, hours: Number(editData.hours), status: editData.status
      });
      setEditingId(null);
    } catch (error) { window.alert("บันทึกไม่สำเร็จ กรุณาตรวจสอบสิทธิ์และการเชื่อมต่อ"); }
  };
  const handleDelete = async (recordId) => {
    if (!window.confirm("ต้องการลบรายการนี้ถาวรหรือไม่? ไม่สามารถย้อนกลับได้")) return;
    try { await deleteDoc(doc(db, RECORDS_PATH, recordId)); }
    catch (error) { window.alert("ลบรายการไม่สำเร็จ กรุณาตรวจสอบสิทธิ์"); }
  };
  return <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
    <table className="w-full min-w-[1190px] text-sm text-left border-collapse">
      <thead className="bg-gray-100 text-gray-700"><tr>
        <th className="p-3">วันที่จัด</th><th className="p-3">ครูผู้ดูแล</th><th className="p-3">นักเรียน / ชั้น</th>
        <th className="p-3">หมวดกิจกรรมหลัก</th><th className="p-3">ใน/นอกหลักสูตร</th>
        <th className="p-3">กิจกรรม / รายละเอียด</th><th className="p-3 text-center">ชั่วโมง</th><th className="p-3">สถานะ</th>
        {canEdit && <th className="p-3 text-center print:hidden">จัดการ</th>}
      </tr></thead>
      <tbody>{records.map((record) => <tr key={record.id} className="border-t align-top hover:bg-gray-50">
        <td className="p-3 whitespace-nowrap">{formatActivityDate(reportDate(record, lookup))}</td>
        <td className="p-3">{record.teacherName || "–"}</td>
        <td className="p-3"><div className="font-semibold">{record.studentName || "–"}</div>
          <div className="text-xs text-gray-500">{record.studentId || "–"} · {studentLevelRoom(students.get(record.studentId))}</div></td>
        <td className="p-3">{reportCategory(record, lookup)}</td>
        <td className="p-3">{reportTypes(record, lookup).join(" / ") || UNCLASSIFIED}</td>
        <td className="p-3 whitespace-normal min-w-[210px]"><div className="font-medium">{record.activityName || "–"}</div>
          {editingId === record.id ? <textarea className="border rounded-lg p-2 mt-2 w-full" rows={2} value={editData.taskDescription} onChange={(e) => setEditData({ ...editData, taskDescription: e.target.value })} />
            : <div className="text-gray-500 mt-1">{record.taskDescription || "–"}</div>}</td>
        <td className="p-3 text-center font-bold">{editingId === record.id ?
          <input type="number" min="0" className="border rounded p-1 w-20" value={editData.hours} onChange={(e) => setEditData({ ...editData, hours: e.target.value })} /> : reportHours(record)}</td>
        <td className="p-3">{editingId === record.id ?
          <select className="border rounded p-1" value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
            <option value="approved">อนุมัติ</option><option value="pending">รอตรวจสอบ</option><option value="rejected">ไม่อนุมัติ</option>
          </select> : <span className={record.status === "approved" ? "text-green-700 font-semibold" : record.status === "rejected" ? "text-red-600" : "text-amber-600"}>{reportStatus(record)}</span>}</td>
        {canEdit && <td className="p-3 text-center print:hidden">
          {editingId === record.id ? <div className="flex gap-2 justify-center">
            <button onClick={() => handleSave(record.id)} title="บันทึก" className="text-green-700"><CheckCircle size={19} /></button>
            <button onClick={() => setEditingId(null)} title="ยกเลิก" className="text-gray-600"><XCircle size={19} /></button>
          </div> : <div className="flex gap-3 justify-center">
            <button onClick={() => { setEditingId(record.id); setEditData({ taskDescription: record.taskDescription || "", hours: record.hours || 0, status: record.status || "pending" }); }} className="text-blue-600" title="แก้ไข"><Edit2 size={18} /></button>
            <button onClick={() => handleDelete(record.id)} className="text-red-600" title="ลบ"><Trash2 size={18} /></button>
          </div>}
        </td>}
      </tr>)}
        {records.length === 0 && <tr><td colSpan={canEdit ? 9 : 8} className="text-center p-8 text-gray-500">ไม่พบข้อมูลตามเงื่อนไข</td></tr>}
      </tbody>
    </table>
  </div>;
};
const ReportHeader = ({ title, onExport }) => <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5 print:mb-6">
  <h2 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
  <div className="flex flex-wrap gap-2 print:hidden">
    <button type="button" onClick={onExport} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center gap-2"><Download size={18} /> ส่งออก CSV</button>
    <button type="button" onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 flex items-center gap-2"><Printer size={18} /> พิมพ์รายงาน</button>
  </div>
</div>;
const AdminReport = ({ records, activities, profiles }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [training, setTraining] = useState("all");
  const [status, setStatus] = useState("all");
  const [teacherId, setTeacherId] = useState("all");
  const lookup = activityLookup(activities);
  const teachers = profiles.filter((p) => p.role === "teacher");
  const visible = applyReportFilters(records, lookup, { search, category, training, status, teacherId });
  return <Card>
    <ReportHeader title="รายงานภาพรวมทั้งหมด" onExport={() => downloadActivityCsv(reportRows(visible, activities, profiles), "รายงานภาพรวมทั้งหมด.csv")} />
    <ReportFilters {...{ search, setSearch, category, setCategory, training, setTraining, status, setStatus }} extra={
      <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="p-2 border rounded-lg bg-white" aria-label="กรองครูผู้ดูแล">
        <option value="all">อาจารย์ทุกคน</option>{teachers.map((teacher) => <option key={teacher.userId} value={teacher.userId}>{teacher.firstName} {teacher.lastName}</option>)}
      </select>
    } />
    <ReportBreakdown records={visible} activities={activities} />
    <h3 className="font-bold text-lg mb-3">รายการกิจกรรมทั้งหมด ({visible.length})</h3>
    <RecordReportTable records={visible} activities={activities} profiles={profiles} canEdit />
  </Card>;
};
const AdminTeacherReport = ({ profiles, activities, records }) => {
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);
  const [detailSearch, setDetailSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [training, setTraining] = useState("all");
  const [status, setStatus] = useState("all");
  const lookup = activityLookup(activities);
  const teachersById = new Map();
  const addTeacher = (key, name) => {
    if (key && !teachersById.has(key)) teachersById.set(key, { key, name: name || "ไม่พบชื่ออาจารย์" });
  };
  profiles.filter((p) => p.role === "teacher").forEach((p) => addTeacher(p.userId, `${p.firstName || ""} ${p.lastName || ""}`.trim()));
  activities.forEach((a) => addTeacher(a.teacherId || a.teacherName, a.teacherName));
  records.forEach((r) => addTeacher(r.teacherId || r.teacherName, r.teacherName));
  const teachers = [...teachersById.values()].map((teacher) => {
    const relatedRecords = records.filter((r) => (r.teacherId || r.teacherName) === teacher.key);
    const relatedActivities = activities.filter((a) => (a.teacherId || a.teacherName) === teacher.key);
    return { ...teacher, records: relatedRecords, activities: relatedActivities,
      approvedHours: approvedHours(relatedRecords), studentCount: new Set(relatedRecords.map((r) => r.studentId).filter(Boolean)).size };
  }).sort((a, b) => a.name.localeCompare(b.name, "th"));
  const visibleTeachers = teachers.filter((teacher) => `${teacher.key} ${teacher.name}`.toLocaleLowerCase("th-TH").includes(search.trim().toLocaleLowerCase("th-TH")));
  const selected = teachers.find((teacher) => teacher.key === selectedKey);
  const visible = selected ? applyReportFilters(selected.records, lookup, { search: detailSearch, category, training, status }) : [];
  const exportTeachers = () => downloadActivityCsv([
    ["รหัสอาจารย์", "ชื่อ-นามสกุล", "กิจกรรมที่สร้าง", "รายการบันทึก", "จำนวนนักเรียน", "ชั่วโมงอนุมัติรวม", ...ACTIVITY_CATEGORIES.map((c) => `${c.label} (ชม.)`), "ยังไม่ระบุหมวด (ชม.)", "ในหลักสูตร (ชม.)", "นอกหลักสูตร (ชม.)", "ยังไม่ระบุใน/นอกหลักสูตร (ชม.)"],
    ...visibleTeachers.map((teacher) => {
      const cat = categoryStats(teacher.records, lookup);
      const types = curriculumStats(teacher.records, lookup);
      return [teacher.key, teacher.name, teacher.activities.length, teacher.records.length, teacher.studentCount, teacher.approvedHours,
        ...ACTIVITY_CATEGORIES.map((c) => cat.find((item) => item.label === c.label)?.hours || 0), cat.find((item) => item.label === UNCLASSIFIED)?.hours || 0,
        ...["ในหลักสูตร", "นอกหลักสูตร", UNCLASSIFIED].map((label) => types.find((item) => item.label === label)?.hours || 0)];
    })
  ], "รายงานอาจารย์_ภาพรวม.csv");
  return <Card>
    {selected && <button onClick={() => setSelectedKey(null)} className="flex items-center gap-2 text-blue-700 mb-4 print:hidden"><ArrowLeft size={18} /> กลับไปรายชื่ออาจารย์</button>}
    <ReportHeader title={selected ? `รายงานอาจารย์: ${selected.name}` : "รายงานอาจารย์รายบุคคล"} onExport={() => selected
      ? downloadActivityCsv(reportRows(visible, activities, profiles), `รายงานอาจารย์_${selected.key}.csv`) : exportTeachers()} />
    {selected ? <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-indigo-50 p-4"><p className="text-sm">กิจกรรมที่สร้าง</p><p className="text-2xl font-bold">{selected.activities.length}</p></div>
        <div className="rounded-xl bg-blue-50 p-4"><p className="text-sm">นักเรียนที่มีรายการ</p><p className="text-2xl font-bold">{selected.studentCount} คน</p></div>
        <div className="rounded-xl bg-green-50 p-4"><p className="text-sm">ชั่วโมงนักเรียนที่อนุมัติ</p><p className="text-2xl font-bold">{selected.approvedHours} ชม.</p></div>
      </div>
      <ReportFilters {...{ category, setCategory, training, setTraining, status, setStatus }} search={detailSearch} setSearch={setDetailSearch} />
      <ReportBreakdown records={visible} activities={activities} />
      <h3 className="font-semibold mb-3">รายการบันทึกภายใต้การดูแล ({visible.length})</h3>
      <RecordReportTable records={visible} activities={activities} profiles={profiles} />
    </> : <>
      <div className="mb-4 relative print:hidden"><Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border rounded-lg p-2 pl-10" placeholder="ค้นหารหัสหรือชื่ออาจารย์" /></div>
      <ReportBreakdown records={visibleTeachers.flatMap((teacher) => teacher.records)} activities={activities} />
      <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-gray-100"><tr><th className="p-3">รหัสอาจารย์</th><th className="p-3">ชื่อ-นามสกุล</th><th className="p-3 text-center">กิจกรรมที่สร้าง</th><th className="p-3 text-center">รายการบันทึก</th><th className="p-3 text-center">นักเรียน</th><th className="p-3 text-center">ชั่วโมงอนุมัติรวม</th><th className="p-3 text-center">ในหลักสูตร</th><th className="p-3 text-center">นอกหลักสูตร</th><th className="p-3 print:hidden">รายละเอียด</th></tr></thead>
        <tbody>{visibleTeachers.map((teacher) => <tr key={teacher.key} className="border-t"><td className="p-3">{teacher.key}</td><td className="p-3 font-semibold">{teacher.name}</td><td className="p-3 text-center">{teacher.activities.length}</td><td className="p-3 text-center">{teacher.records.length}</td><td className="p-3 text-center">{teacher.studentCount}</td><td className="p-3 text-center font-bold text-green-700">{teacher.approvedHours}</td><td className="p-3 text-center">{curriculumStats(teacher.records, lookup)[0].hours}</td><td className="p-3 text-center">{curriculumStats(teacher.records, lookup)[1].hours}</td><td className="p-3 print:hidden"><button className="text-blue-700 bg-blue-50 px-3 py-2 rounded-lg" onClick={() => { setSelectedKey(teacher.key); setCategory("all"); setTraining("all"); setStatus("all"); }}>ดูรายละเอียด</button></td></tr>)}
        {visibleTeachers.length === 0 && <tr><td colSpan="9" className="p-7 text-center text-gray-500">ไม่พบรายชื่ออาจารย์</td></tr>}</tbody></table></div>
      <p className="mt-4 text-xs text-gray-500">* ชั่วโมงอาจารย์ในรายงานนี้หมายถึงผลรวมชั่วโมงกิจกรรมของนักเรียนที่อนุมัติแล้ว ไม่ใช่จำนวนชั่วโมงปฏิบัติงานของอาจารย์</p>
    </>}
  </Card>;
};
const StudentIndividualReport = ({ profiles, records, activities, title = "รายงานรายบุคคล" }) => {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [detailSearch, setDetailSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [training, setTraining] = useState("all");
  const [status, setStatus] = useState("all");
  const lookup = useMemo(() => activityLookup(activities), [activities]);
  const students = useMemo(() => {
    const map = new Map();
    profiles.filter((p) => p.role === "student").forEach((p) => map.set(p.userId, {
      userId: p.userId, name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      level: p.level || "", room: p.room || "", records: []
    }));
    records.forEach((r) => {
      if (!r.studentId) return;
      if (!map.has(r.studentId)) map.set(r.studentId, {
        userId: r.studentId, name: r.studentName || "ไม่พบชื่อในฐานข้อมูล", level: "", room: "", records: []
      });
      map.get(r.studentId).records.push(r);
    });
    return [...map.values()].map((s) => ({
      ...s, levelRoom: [s.level, s.room].filter(Boolean).join("/") || "ไม่ระบุ",
      approvedHours: approvedHours(s.records),
      categoryHours: categoryStats(s.records, lookup),
      pendingHours: s.records.filter((r) => r.status !== "approved" && r.status !== "rejected").reduce((sum, r) => sum + reportHours(r), 0),
      approvedCount: s.records.filter((r) => r.status === "approved").length
    })).sort((a, b) => (a.levelRoom + a.name).localeCompare(b.levelRoom + b.name, "th"));
  }, [profiles, records, lookup]);
  const levels = [...new Set(students.map((s) => s.level).filter(Boolean))].sort((a, b) => a.localeCompare(b, "th"));
  const visibleStudents = students.filter((student) =>
    (level === "all" || student.level === level) && `${student.userId} ${student.name} ${student.levelRoom}`.toLocaleLowerCase("th-TH").includes(query.trim().toLocaleLowerCase("th-TH"))
  );
  const selectedStudent = students.find((student) => student.userId === selectedId);
  const detail = selectedStudent ? applyReportFilters(selectedStudent.records, lookup, { search: detailSearch, category, training, status }) : [];
  const exportSummary = () => downloadActivityCsv([
    ["รหัสนักเรียน", "ชื่อ-นามสกุล", "ชั้น/ห้อง", "ชั่วโมงอนุมัติรวม", ...ACTIVITY_CATEGORIES.map((c) => `${c.label} (ชม.)`), "ยังไม่ระบุหมวด (ชม.)", "ในหลักสูตร (ชม.)", "นอกหลักสูตร (ชม.)", "ยังไม่ระบุใน/นอกหลักสูตร (ชม.)", "ชั่วโมงรอตรวจสอบ", "จำนวนรายการทั้งหมด"],
    ...visibleStudents.map((s) => [s.userId, s.name, s.levelRoom, s.approvedHours,
      ...ACTIVITY_CATEGORIES.map((c) => s.categoryHours.find((item) => item.label === c.label)?.hours || 0),
      s.categoryHours.find((item) => item.label === UNCLASSIFIED)?.hours || 0,
      ...["ในหลักสูตร", "นอกหลักสูตร", UNCLASSIFIED].map((label) => curriculumStats(s.records, lookup).find((item) => item.label === label)?.hours || 0),
      s.pendingHours, s.records.length])
  ], "รายงานนักเรียนรายบุคคล_ภาพรวม.csv");
  const exportDetail = () => downloadActivityCsv(reportRows(detail, activities, profiles), `รายงานนักเรียน_${selectedStudent.userId}.csv`);
  return <div className="space-y-5">
    {selectedStudent && <button onClick={() => { setSelectedId(null); setCategory("all"); setTraining("all"); setStatus("all"); }} className="flex items-center gap-2 text-blue-700 print:hidden"><ArrowLeft size={18} /> กลับไปรายชื่อนักเรียน</button>}
    <ReportHeader title={selectedStudent ? `${title}: ${selectedStudent.name}` : title} onExport={selectedStudent ? exportDetail : exportSummary} />
    {selectedStudent ? <>
      <Card><p className="text-gray-500">รหัสนักเรียน {selectedStudent.userId} · ชั้น/ห้อง {selectedStudent.levelRoom}</p>
        <p className="text-xl font-bold mt-2">{selectedStudent.name}</p>
        <div className="flex flex-wrap gap-4 mt-3"><span className="font-bold text-green-700">ชั่วโมงอนุมัติรวม {selectedStudent.approvedHours} ชม.</span><span>รอตรวจสอบ {selectedStudent.pendingHours} ชม.</span><span>ทั้งหมด {selectedStudent.records.length} รายการ</span></div>
      </Card>
      <Card>
        <ReportFilters {...{ category, setCategory, training, setTraining, status, setStatus }} search={detailSearch} setSearch={setDetailSearch} />
        <ReportBreakdown records={detail} activities={activities} />
        <h3 className="font-semibold mb-3">รายละเอียดกิจกรรม ({detail.length} รายการ)</h3>
        <RecordReportTable records={detail} activities={activities} profiles={profiles} />
      </Card>
    </> : <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-blue-50"><p className="text-sm">นักเรียนทั้งหมด</p><p className="text-2xl font-bold">{students.length} คน</p></div>
        <div className="p-4 rounded-xl bg-green-50"><p className="text-sm">ชั่วโมงอนุมัติรวม</p><p className="text-2xl font-bold">{students.reduce((total, s) => total + s.approvedHours, 0)} ชม.</p></div>
        <div className="p-4 rounded-xl bg-indigo-50"><p className="text-sm">รายการที่อนุมัติแล้ว</p><p className="text-2xl font-bold">{students.reduce((total, s) => total + s.approvedCount, 0)} รายการ</p></div>
      </div>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 print:hidden">
          <div className="relative"><Search size={17} className="absolute top-3 left-3 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full p-2 pl-10 border rounded-lg" placeholder="ค้นหาชื่อ รหัส หรือชั้นเรียน" /></div>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="border rounded-lg p-2"><option value="all">ทุกระดับชั้น</option>{levels.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>
        <h3 className="font-semibold mb-3">ตารางชั่วโมงกิจกรรมนักเรียนแยกตาม 4 หมวด</h3>
        <div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-sm"><thead className="bg-gray-100"><tr>
          <th className="p-3">รหัส</th><th className="p-3">ชื่อ-นามสกุล</th><th className="p-3">ชั้น/ห้อง</th>
          {ACTIVITY_CATEGORIES.map((c) => <th key={c.value} className="p-3 text-center">{c.label}</th>)}
          <th className="p-3 text-center">ยังไม่ระบุ</th><th className="p-3 text-center">ในหลักสูตร</th><th className="p-3 text-center">นอกหลักสูตร</th><th className="p-3 text-center">รวมอนุมัติ</th><th className="p-3 text-center">จำนวนรายการ</th><th className="p-3 print:hidden">รายละเอียด</th>
        </tr></thead><tbody>{visibleStudents.map((s) => <tr key={s.userId} className="border-t hover:bg-blue-50/40">
          <td className="p-3">{s.userId}</td><td className="p-3 font-medium">{s.name}</td><td className="p-3">{s.levelRoom}</td>
          {ACTIVITY_CATEGORIES.map((c) => <td key={c.value} className="p-3 text-center">{s.categoryHours.find((item) => item.label === c.label)?.hours || 0}</td>)}
          <td className="p-3 text-center">{s.categoryHours.find((item) => item.label === UNCLASSIFIED)?.hours || 0}</td>
          <td className="p-3 text-center">{curriculumStats(s.records, lookup)[0].hours}</td><td className="p-3 text-center">{curriculumStats(s.records, lookup)[1].hours}</td>
          <td className="p-3 text-center font-bold text-green-700">{s.approvedHours}</td><td className="p-3 text-center">{s.records.length}</td>
          <td className="p-3 print:hidden"><button className="bg-blue-50 text-blue-700 rounded-lg px-3 py-2" onClick={() => { setSelectedId(s.userId); setCategory("all"); setTraining("all"); setStatus("all"); }}>ดูรายละเอียด</button></td>
        </tr>)}{visibleStudents.length === 0 && <tr><td colSpan="12" className="text-center p-8 text-gray-500">ไม่พบรายชื่อนักเรียน</td></tr>}</tbody></table></div>
        <p className="text-xs text-gray-500 mt-3">* ชั่วโมงรวมของนักเรียนเป็นชั่วโมงที่อนุมัติแล้วเท่านั้น รายการเดิมที่ไม่มีหมวดจะอยู่ในคอลัมน์ “ยังไม่ระบุ”</p>
      </Card>
      <ReportBreakdown records={visibleStudents.flatMap((s) => s.records)} activities={activities} />
    </>}
  </div>;
};

// --- Teacher Components ---
const TeacherDashboard = ({ user, activities }) => {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    activityCategory: "",
    activityName: "",
    location: "",
    hours: 1,
    date: today,
    trainingTypes: [],
  });

  const [formError, setFormError] = useState("");

  // State สำหรับการแก้ไขกิจกรรม
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    activityCategory: "",
    activityName: "",
    location: "",
    hours: 1,
    date: "",
    trainingTypes: [],
  });

  const myActivities = useMemo(
    () => activities.filter((a) => a.teacherId === user.userId),
    [activities, user]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ACTIVITY_CATEGORIES.some((category) => category.value === formData.activityCategory)) {
      setFormError("กรุณาเลือกหมวดกิจกรรมหลัก 1 ประเภท");
      return;
    }
    if (formData.trainingTypes.length === 0) {
      setFormError("กรุณาเลือกอย่างน้อย 1 ประเภท (ในหลักสูตร / นอกหลักสูตร)");
      return;
    }
    setFormError("");
    const newId = `act_${Date.now()}`;
    await setDoc(doc(db, ACTIVITIES_PATH, newId), {
      ...formData,
      teacherId: user.userId,
      teacherName: `${user.firstName} ${user.lastName}`,
    });
    setFormData({ activityCategory: "", activityName: "", location: "", hours: 1, date: today, trainingTypes: [] });
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleUpdate = async (id) => {
    if (!ACTIVITY_CATEGORIES.some((category) => category.value === editData.activityCategory)) {
      window.alert("กรุณาเลือกหมวดกิจกรรมหลัก 1 ประเภท");
      return;
    }
    if (!editData.trainingTypes?.length) {
      window.alert("กรุณาเลือกอย่างน้อย 1 ประเภทกิจกรรม");
      return;
    }
    await updateDoc(doc(db, ACTIVITIES_PATH, id), {
      activityCategory: editData.activityCategory,
      activityName: editData.activityName,
      location: editData.location,
      hours: Number(editData.hours),
      date: editData.date,
      trainingTypes: editData.trainingTypes,
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
          <fieldset className="md:col-span-4 p-4 rounded-xl border border-blue-200 bg-blue-50/70">
            <legend className="px-2 font-semibold text-blue-900">1. หมวดกิจกรรมหลัก <span className="text-red-600">*</span></legend>
            <p className="text-sm text-gray-600 mb-3">กรุณาเลือกประเภทที่ตรงกับกิจกรรม 1 ข้อ</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ACTIVITY_CATEGORIES.map((category) => (
                <label key={category.value} className={`flex items-center gap-2 cursor-pointer rounded-xl border p-3 bg-white transition-colors ${formData.activityCategory === category.value ? "border-blue-500 ring-2 ring-blue-200 text-blue-900" : "border-gray-200 hover:border-blue-300"}`}>
                  <input
                    type="radio"
                    name="activityCategory"
                    value={category.value}
                    checked={formData.activityCategory === category.value}
                    onChange={() => setFormData((previous) => ({ ...previous, activityCategory: category.value }))}
                    className="w-5 h-5 accent-blue-600 shrink-0"
                    required
                  />
                  <span className="font-medium text-sm">{category.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="md:col-span-4">
            <label className="block text-sm mb-1">2. ชื่อกิจกรรม</label>
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
          <div className="md:col-span-4 p-4 border border-indigo-100 rounded-lg bg-indigo-50/50">
            <p className="font-semibold text-gray-800 mb-2">การส่งเสริม สนับสนุนการฝึกประสบการณ์ สมรรถนะวิชาชีพหรือฝึกอาชีพให้กับผู้เรียน</p>
            <p className="text-sm text-gray-500 mb-3">เลือกได้มากกว่า 1 ข้อ ให้ทำเครื่องหมาย ✓ ในช่องที่ตรงกับการดำเนินการของสถานศึกษา</p>
            <div className="flex flex-wrap gap-5">
              {[{ value: "curricular", label: "ในหลักสูตร" }, { value: "extracurricular", label: "นอกหลักสูตร" }].map((option) => (
                <label key={option.value} className="flex gap-2 items-center cursor-pointer text-gray-800">
                  <input type="checkbox" checked={formData.trainingTypes.includes(option.value)}
                    onChange={(e) => setFormData((previous) => ({ ...previous,
                      trainingTypes: e.target.checked
                        ? [...previous.trainingTypes, option.value]
                        : previous.trainingTypes.filter((type) => type !== option.value)
                    }))}
                    className="w-5 h-5 accent-indigo-600" />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {formError && <p className="text-sm text-red-600 mt-3">{formError}</p>}
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
      <Card title="กิจกรรมที่สร้าง">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100 text-sm">
                <th className="p-3">วันที่จัด</th>
                <th className="p-3">หมวดกิจกรรมหลัก</th>
                <th className="p-3">ชื่อกิจกรรม</th>
                <th className="p-3">สถานที่</th>
                <th className="p-3 text-center">ชั่วโมง</th>
                <th className="p-3">ใน/นอกหลักสูตร</th>
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
                          <select value={editData.activityCategory || ""} onChange={(e) => setEditData((previous) => ({ ...previous, activityCategory: e.target.value }))} className="w-full min-w-[170px] p-1 border rounded text-sm bg-white">
                            <option value="">-- เลือกประเภท --</option>
                            {ACTIVITY_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                          </select>
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
                        <td className="p-2">
                          <div className="space-y-2 text-sm">
                            {[{ value: "curricular", label: "ในหลักสูตร" }, { value: "extracurricular", label: "นอกหลักสูตร" }].map((option) => (
                              <label key={option.value} className="flex items-center gap-1 whitespace-nowrap cursor-pointer">
                                <input type="checkbox" checked={(editData.trainingTypes || []).includes(option.value)}
                                  onChange={(e) => setEditData((previous) => ({ ...previous,
                                    trainingTypes: e.target.checked
                                      ? [...(previous.trainingTypes || []), option.value]
                                      : (previous.trainingTypes || []).filter((type) => type !== option.value)
                                  }))} />
                                {option.label}
                              </label>
                            ))}
                          </div>
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
                        <td className="p-3 text-sm">{activityCategoryLabel(a.activityCategory)}</td>
                        <td className="p-3 font-medium">{a.activityName}</td>
                        <td className="p-3">{a.location}</td>
                        <td className="p-3 text-center text-indigo-700 font-bold">
                          {a.hours}
                        </td>
                        <td className="p-3 text-sm">{activityTypeLabels(a.trainingTypes).join(" / ") || "ยังไม่ระบุ"}</td>
                        <td className="p-3 text-center flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setEditingId(a.id);
                              setEditData({ activityCategory: a.activityCategory || "", activityName: a.activityName, location: a.location, hours: a.hours, date: a.date, trainingTypes: Array.isArray(a.trainingTypes) ? a.trainingTypes : [] });
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

// Teacher report: only records associated with the logged-in teacher.
const TeacherReport = ({ user, records, profiles, activities }) => {
  const myRecords = records.filter((record) => record.teacherId === user.userId);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [training, setTraining] = useState("all");
  const [status, setStatus] = useState("all");
  const visible = applyReportFilters(myRecords, activityLookup(activities), { search, category, training, status });
  return <Card>
    <ReportHeader title={`รายงานกิจกรรม (อ.${user.firstName} ${user.lastName})`}
      onExport={() => downloadActivityCsv(reportRows(visible, activities, profiles), `รายงานกิจกรรมอาจารย์_${user.userId}.csv`)} />
    <ReportFilters {...{ search, setSearch, category, setCategory, training, setTraining, status, setStatus }} />
    <ReportBreakdown records={visible} activities={activities} />
    <h3 className="font-bold text-lg mb-3">รายการบันทึกกิจกรรม ({visible.length})</h3>
    <RecordReportTable records={visible} activities={activities} profiles={profiles} />
  </Card>;
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
    .reduce((sum, r) => sum + (Number(r.hours) || 0), 0);

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
      activityCategory: currentActivityObj.activityCategory || "",
      teacherId: currentActivityObj.teacherId,
      teacherName: currentActivityObj.teacherName,
      hours: Number(currentActivityObj.hours) || 0,
      trainingTypes: Array.isArray(currentActivityObj.trainingTypes) ? currentActivityObj.trainingTypes : [],
      activityDate: currentActivityObj.date || null,
      location: currentActivityObj.location || "",
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
                {a.activityName} ({a.hours} ชม.){a.activityCategory ? ` · ${activityCategoryLabel(a.activityCategory)}` : ""}
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
