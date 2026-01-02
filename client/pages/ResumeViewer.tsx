import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function ResumeViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "User"
  );
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1; // Mock single page PDF

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userRole = JSON.parse(localStorage.getItem("user") || "{}").userType || "admin";

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  return (
    <MainLayout
      userRole={userRole as "admin" | "hr"}
      pageTitle="Resume Viewer"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Resume Viewer</h1>
            <p className="text-muted-foreground mt-1">Sarah Johnson</p>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
            <Download size={20} />
            Download Resume
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom === 50}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomOut size={20} className="text-muted-foreground" />
            </button>

            <span className="px-3 py-1 bg-muted rounded-lg text-sm font-medium text-foreground min-w-16 text-center">
              {zoom}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom === 200}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ZoomIn size={20} className="text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-4 border-l border-r border-border px-4 py-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="text-muted-foreground" />
            </button>

            <span className="text-sm font-medium text-foreground min-w-20 text-center">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-slate-300 transition-colors"
          >
            Back
          </button>
        </div>

        {/* PDF Viewer Area */}
        <div className="bg-white rounded-xl shadow-card p-8 flex items-center justify-center min-h-screen">
          <div
            className="bg-muted rounded-lg flex items-center justify-center"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* Mock PDF Display */}
            <div
              className="bg-white rounded-lg shadow-lg p-12 w-screen"
              style={{
                maxWidth: "8.5in",
                minHeight: "11in",
                aspectRatio: "8.5/11",
              }}
            >
              {/* Resume Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
                <h1 className="text-4xl font-bold text-gray-900">
                  Sarah Johnson
                </h1>
                <p className="text-lg text-gray-700 mt-2">
                  Senior Full Stack Developer
                </p>
                <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
                  <span>📧 sarah@example.com</span>
                  <span>📞 +1 (555) 123-4567</span>
                  <span>📍 San Francisco, CA</span>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Professional Summary
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Experienced Full Stack Developer with 5+ years of proven
                  expertise in building scalable web applications using React,
                  Node.js, and modern web technologies. Strong problem-solving
                  skills and a track record of delivering high-quality
                  solutions on time.
                </p>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Work Experience
                </h2>

                <div className="mb-4">
                  <h3 className="font-bold text-gray-900">
                    Senior Developer - Tech Corp
                  </h3>
                  <p className="text-sm text-gray-600">2021 - Present</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside mt-2">
                    <li>Led development of React-based applications</li>
                    <li>Mentored junior developers</li>
                    <li>Improved performance by 40%</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    Full Stack Engineer - StartUp Inc
                  </h3>
                  <p className="text-sm text-gray-600">2018 - 2021</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside mt-2">
                    <li>Built REST APIs with Node.js and Express</li>
                    <li>Implemented responsive UI with React</li>
                    <li>Collaborated with cross-functional teams</li>
                  </ul>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {["React", "Node.js", "TypeScript", "MongoDB", "AWS", "Docker"].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Education
                </h2>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Bachelor of Science in Computer Science
                  </h3>
                  <p className="text-sm text-gray-600">
                    State University, Graduated 2018
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
