import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Upload,
  Wand2,
  X,
  Plus,
  Save,
} from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";

interface CandidateData {
  fullName: string;
  email: string;
  phone: string;
  appliedPosition: string[];
  totalExperience: number;
  currentSalary: number;
  expectedSalary: number;
  availability: string;
  skills: string[];
  previousCompanies: string[];
  education: string[];
  notes: string;
}

export default function AddCandidate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "User"
  );

  const [candidateData, setCandidateData] = useState<CandidateData>({
    fullName: "",
    email: "",
    phone: "",
    appliedPosition: [],
    totalExperience: 0,
    currentSalary: 0,
    expectedSalary: 0,
    availability: "",
    skills: [],
    previousCompanies: [],
    education: [],
    notes: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [newCompany, setNewCompany] = useState("");
  const [newEducation, setNewEducation] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  // Fetch skills and positions from API
  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:4000/api/skills/get-skill');
      return response.data.skills;
    },
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:4000/api/positions/get-position');
      return response.data.positions;
    },
  });

  const skillsOptions = skillsData?.map((skill: any) => ({
    value: skill.name.toLowerCase(),
    label: skill.name
  })) || [];

  const positionsOptions = positionsData?.map((position: any) => ({
    value: position.name.toLowerCase(),
    label: position.name
  })) || [];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userRole = JSON.parse(localStorage.getItem("user") || "{}").userType || "admin";

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAutoExtract = async () => {
    if (!resumeFile) {
      toast({
        title: "Resume Required",
        description: "Please upload a resume first",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    // Simulate extraction delay
    setTimeout(() => {
      // Mock auto-extracted data from resume
      setCandidateData((prev) => ({
        ...prev,
        fullName: "John Doe",
        email: "john.doe@email.com",
        phone: "1234567890",
        totalExperience: 5,
        skills: ["React", "Node.js", "TypeScript", "MongoDB"],
        previousCompanies: ["Tech Corp"],
        education: ["B.S. Computer Science - State University"],
      }));
      setIsExtracting(false);
    }, 1000);
  };

  const addCompany = () => {
    if (newCompany.trim() && !candidateData.previousCompanies.includes(newCompany)) {
      setCandidateData({
        ...candidateData,
        previousCompanies: [...candidateData.previousCompanies, newCompany],
      });
      setNewCompany("");
    }
  };

  const addEducation = () => {
    if (newEducation.trim() && !candidateData.education.includes(newEducation)) {
      setCandidateData({
        ...candidateData,
        education: [...candidateData.education, newEducation],
      });
      setNewEducation("");
    }
  };

  const createCandidateMutation = useMutation({
    mutationFn: async (data: CandidateData) => {
      const getData = localStorage.getItem('user')
      const user = getData ? JSON.parse(getData).name : null
      return await axios.post('http://localhost:4000/api/candidate/add-details', {
        ...data,
        previousCompanies: data.previousCompanies.join(', '),
        addBy: user,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        return res.data;
      }).catch((error) => {
        const errorData = error.response?.data;
        let errorMessage = 'Failed to save candidate';
        
        if (errorData?.error && Array.isArray(errorData.error) && errorData.error.length > 0) {
          errorMessage = errorData.error[0].message;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      });
    },
    onSuccess: (data) => {
      // console.log(data);
      
      toast({
        title: "Candidate saved successfully!",
        description: "The new candidate has been added to the system.",
      });
      navigate("/hr/candidates");
    },
    onError: (error) => {
      toast({
        title: "Failed to save candidate",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    createCandidateMutation.mutate(candidateData);
  };

  return (
    <MainLayout
      userRole={userRole as "admin" | "hr"}
      pageTitle="Add Candidate"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Candidate</h1>
          <p className="text-muted-foreground mt-1">
            Create a new candidate profile with automatic or manual data entry
          </p>
        </div>

        {/* Resume Upload Section */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Resume Upload
          </h2>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <label className="cursor-pointer block">
              <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-foreground font-medium">
                {resumeFile
                  ? resumeFile.name
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground">
                PDF files only (max 5MB)
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={handleAutoExtract}
            disabled={isExtracting || !resumeFile}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 size={20} />
            {isExtracting ? "Extracting..." : "Auto Extract Details"}
          </button>
        </div>

        {/* Auto-filled Fields */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Candidate Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={candidateData.fullName}
                onChange={(e) =>
                  setCandidateData({ ...candidateData, fullName: e.target.value })
                }
                placeholder="Enter full name"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={candidateData.email}
                onChange={(e) =>
                  setCandidateData({ ...candidateData, email: e.target.value })
                }
                placeholder="Enter email address"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={candidateData.phone}
                onChange={(e) =>
                  setCandidateData({ ...candidateData, phone: e.target.value })
                }
                placeholder="Enter phone number"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* totalExperience */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Years of totalExperience
              </label>
              <input
                type="number"
                value={candidateData.totalExperience}
                onChange={(e) =>
                  setCandidateData({
                    ...candidateData,
                    totalExperience: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter years of totalExperience"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Skills
            </label>
            <MultiSelect
              options={skillsOptions}
              selected={candidateData.skills}
              onSelectionChange={(skills) =>
                setCandidateData({ ...candidateData, skills })
              }
              placeholder="Select skills..."
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {candidateData.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    onClick={() =>
                      setCandidateData({
                        ...candidateData,
                        skills: candidateData.skills.filter((s) => s !== skill),
                      })
                    }
                    className="hover:bg-purple-200 rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Companies */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Previous Companies
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCompany();
                  }
                }}
                placeholder="Add a company"
                className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={addCompany}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidateData.previousCompanies.map((company) => (
                <div
                  key={company}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {company}
                  <button
                    onClick={() =>
                      setCandidateData({
                        ...candidateData,
                        previousCompanies: candidateData.previousCompanies.filter(
                          (c) => c !== company
                        ),
                      })
                    }
                    className="hover:bg-purple-200 rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Education
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newEducation}
                onChange={(e) => setNewEducation(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEducation();
                  }
                }}
                placeholder="Add education details"
                className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {candidateData.education.map((edu) => (
                <div
                  key={edu}
                  className="flex items-center justify-between px-4 py-2 bg-muted border border-border rounded-lg"
                >
                  <span className="text-foreground">{edu}</span>
                  <button
                    onClick={() =>
                      setCandidateData({
                        ...candidateData,
                        education: candidateData.education.filter((e) => e !== edu),
                      })
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manual Fields */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Additional Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Position Applying For *
              </label>
              <MultiSelect
                options={positionsOptions}
                selected={candidateData.appliedPosition}
                onSelectionChange={(positions) =>
                  setCandidateData({ ...candidateData, appliedPosition: positions })
                }
                placeholder="Select positions..."
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {candidateData.appliedPosition.map((position) => (
                  <div
                    key={position}
                    className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {position}
                    <button
                      onClick={() =>
                        setCandidateData({
                          ...candidateData,
                          appliedPosition: candidateData.appliedPosition.filter((p) => p !== position),
                        })
                      }
                      className="hover:bg-green-200 rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Availability
              </label>
              <input
                type="text"
                value={candidateData.availability}
                onChange={(e) =>
                  setCandidateData({ ...candidateData, availability: e.target.value })
                }
                placeholder="e.g., Immediate, 2 weeks, 1 month"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Current Salary */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Salary
              </label>
              <input
                type="number"
                value={candidateData.currentSalary}
                onChange={(e) =>
                  setCandidateData({ ...candidateData, currentSalary: Number(e.target.value) || 0 })
                }
                placeholder="e.g., $80,000"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Expected Salary */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expected Salary
              </label>
              <input
                type="number"
                value={candidateData.expectedSalary}
                onChange={(e) =>
                  setCandidateData({ ...candidateData, expectedSalary: Number(e.target.value) || 0 })
                }
                placeholder="e.g., $100,000 - $120,000"
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              value={candidateData.notes}
              onChange={(e) =>
                setCandidateData({ ...candidateData, notes: e.target.value })
              }
              placeholder="Add any additional notes or observations"
              rows={4}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={createCandidateMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Save size={20} />
            {createCandidateMutation.isPending ? 'Saving...' : 'Save Candidate'}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
