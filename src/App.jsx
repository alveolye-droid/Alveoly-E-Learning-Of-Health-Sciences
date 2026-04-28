import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ===== Toastify =====
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ===== Public Pages =====
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import Programs from "./pages/Programs";
import Admissions from "./pages/Admissions";
import ApplyNow from "./pages/ApplyNow";
import Contact from "./pages/Contact";
import EditCourse from "./pages/EditCourse.jsx";

// ===== Auth Pages =====
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";

// ===== Dashboards =====
import Dashboard from "./pages/Dashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import LecturerDashboard from "./pages/LecturerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

// ===== Lecturer Pages =====
import LecturerCourseUpload from "./pages/LecturerCourseUpload.jsx";
import LecturerDashboardCourses from "./pages/LecturerDashboardCourses.jsx";
import LecturerStudents from "./pages/LecturerStudents.jsx";
import LecturerLiveSessions from "./pages/LecturerLiveSessions.jsx";
import LecturerActivate from "./pages/LecturerActivate.jsx";
import EditCourseLecturer from "./pages/EditCourseLecturer.jsx";

// 🔥 LECTURER EXAMS
import CreateExam from "./pages/lecturer/exams/CreateExam.jsx";
import ExamCodeGenerator from "./pages/lecturer/exams/ExamCodeGenerator.jsx";
import LecturerExamResults from "./pages/lecturer/exams/LecturerExamResults.jsx";

// ===== Student Pages =====
import StudentCourses from "./pages/StudentCourses.jsx";
import StudentLiveSessions from "./pages/StudentLiveSessions.jsx";
import StudentTakeExam from "./pages/student/exams/StudentTakeExam.jsx";


// ===== Admin Pages =====
import AppliedStudents from "./pages/AppliedStudents.jsx";
import CreateCourse from "./pages/CreateCourse.jsx";
import AllCourses from "./pages/AllCourses.jsx";
import LecturerSignUp from "./pages/LecturerSignUp.jsx";
import AllLecturers from "./pages/AllLecturers.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import UpdateUserRoles from "./pages/UpdateUserRoles.jsx";
import BlockVideos from "./pages/BlockVideos.jsx";
import CreateLiveSession from "./pages/CreateLiveSession.jsx";
import AllLiveSessions from "./pages/AllLiveSessions.jsx";
import AdminMessages from "./pages/AdminMessages.jsx";
import Settings from "./pages/Settings.jsx";

// ===== Admin Exam Page =====
import AdminApproveExams from "./pages/admin/exams/AdminApproveExams";
import StudentExamStart from "./pages/student/exams/StudentExamStart.jsx";
import StudentReceiveExamCode from "./pages/student/exams/StudentReceiveExamCode.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import StudentStudyList from "./pages/student/study/StudentStudyList.jsx";
import StudentStudyReader from "./pages/student/study/StudentStudyReader.jsx";
import AdminStudyList from "./pages/admin/study/AdminStudyList.jsx";
import AdminStudyCreate from "./pages/admin/study/AdminStudyCreate.jsx";
import AdminStudyEdit from "./pages/admin/study/AdminStudyEdit.jsx";
import AllMainContent from "./pages/AllMainContent.jsx";

import LecturerAccessControl from "./pages/LecturerAccessControl.jsx";
import StudyContentPage from "./pages/student/study/StudyContentPage.jsx";

function App() {
  // Enforce global scroll
  useEffect(() => {
    const elements = [
      document.documentElement,
      document.body,
      document.getElementById("root"),
    ];
    elements.forEach((el) => {
      if (el) {
        el.style.height = "auto";
        el.style.minHeight = "100vh";
        el.style.overflowY = "auto";
        el.style.margin = "0";
        el.style.padding = "0";
      }
    });
  }, []);

  return (
    <>
      <style>{`
        html, body, #root {
          height: auto !important;
          min-height: 100vh !important;
          overflow-y: auto !important;
          margin: 0;
          padding: 0;
        }
      `}</style>

      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <Routes>
          {/* ===== Public Routes ===== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/apply-now" element={<ApplyNow />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/edit-course/:courseId" element={<EditCourse />} />


          {/* ===== Public Content Pages (Nurseslabs-style) ===== */}
<Route path="/content/:slug" element={<AllMainContent />} />


          {/* ===== Auth Routes ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/auth/google/callback" element={<OAuthSuccess />} />
          <Route
            path="/auth/google/register/callback"
            element={<OAuthSuccess />}
          />

          {/* ===== Student Routes ===== */}
          <Route path="/student/:id/dashboard" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/courses" element={<StudentCourses />} />
          <Route path="/live" element={<StudentLiveSessions />} />

// ===== Student Exam Start =====
{/* ===== Student Exam Start ===== */}
<Route
  path="/student/:studentId/exams/:examId/start"
  element={<StudentExamStart />}
/>

{/* ===== Student Exam Code Input ===== */}
<Route
  path="/student/exams/:examId/code"
  element={<StudentReceiveExamCode />}
/>

{/* ===== Student Take Exam Page ===== */}
<Route
  path="/student/exams/:examId/take"
  element={<StudentTakeExam />}
/>

<Route path="/student/study" element={<StudentStudyList />} />
<Route path="/student/study/:slug" element={<StudentStudyReader />} />
<Route path="/study/:slug" element={<StudyContentPage />} />

          {/* ===== Lecturer Routes ===== */}
          <Route
            path="/lecturer/:id/dashboard"
            element={<LecturerDashboard />}
          />
          <Route
            path="/lecturer/:id/upload-course"
            element={<LecturerCourseUpload />}
          />
          <Route
            path="/lecturer/:id/courses"
            element={<LecturerDashboardCourses />}
          />
          <Route
  path="/lecturer/:id/access-control"
  element={<LecturerAccessControl />}
/>

          <Route
            path="/lecturer/:id/students"
            element={<LecturerStudents />}
          />
          <Route
            path="/lecturer/:id/live"
            element={<LecturerLiveSessions />}
          />

          {/* 🔥 CREATE EXAM ROUTE */}
          <Route
            path="/lecturer/:id/exams/create"
            element={<CreateExam />}
          />

          <Route
            path="/lecturer-activate/:token"
            element={<LecturerActivate />}
          />
          <Route
            path="/lecturer-dashboard/edit-course/:courseId"
            element={<EditCourseLecturer />}
          />
          
<Route
  path="/lecturer/:id/exams/:examId/code-generator"
  element={<ExamCodeGenerator />}
/>

<Route
  path="/lecturer/exams/:examId/results"
  element={<LecturerExamResults />}
/>


          {/* ===== General Dashboard ===== */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ===== Admin Routes ===== */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/applied-students" element={<AppliedStudents />} />
          <Route path="/admin/create-course" element={<CreateCourse />} />
          <Route path="/admin/all-courses" element={<AllCourses />} />
          <Route path="/admin/lecturer-signup" element={<LecturerSignUp />} />
          <Route path="/admin/all-lecturers" element={<AllLecturers />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/roles" element={<UpdateUserRoles />} />
          <Route path="/admin/block-videos" element={<BlockVideos />} />
          <Route path="/admin/create-live" element={<CreateLiveSession />} />
          <Route path="/admin/live-sessions" element={<AllLiveSessions />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/settings" element={<Settings />} />

          {/* ===== Admin Exam Approval ===== */}
          <Route path="/admin/approve-exams" element={<AdminApproveExams />} />

          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* ===== ADMIN STUDY ROUTES ===== */}
<Route path="/admin/study" element={<AdminStudyList />} />
<Route path="/admin/study/create" element={<AdminStudyCreate />} />
<Route path="/admin/study/edit/:id" element={<AdminStudyEdit />} />


          {/* ===== Catch-all ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
}

export default App;
