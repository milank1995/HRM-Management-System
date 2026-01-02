import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  X,
  Plus,
  Save,
} from "lucide-react";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchCandidateById, positionsApi, skillsApi } from "@/lib/api";
import { MultiSelect } from "@/components/ui/multi-select";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  appliedPosition: string[];
  totalExperience: number;
  currentSalary: string;
  expectedSalary: string;
  availability: string;
  skills: string[];
  previousCompanies: string[];
  education: string[];
  notes: string;
}

export default function EditCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "User"
  );

  // Mock candidate data
  const [formData, setFormData] = useState<FormData | null>(null);
  const { toast } = useToast();
  const [newCompany, setNewCompany] = useState("");
  const [newEducation, setNewEducation] = useState("");

  // Fetch skills and positions from API
  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsApi
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn:positionsApi
  });

  const skillsOptions = skillsData?.map((skill: any) => ({
    value: skill.name,
    label: skill.name
  })) || [];

  const positionsOptions = positionsData?.map((position: any) => ({
    value: position.name,
    label: position.name
  })) || [];

   const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchCandidateById(id),
  });

  useEffect(() => {
    if (data?.data) {
      const candidateData = data.data;
      setFormData({
        ...candidateData,
        skills: Array.isArray(candidateData.skills) ? candidateData.skills.map((s: any) => s.name || s) : candidateData.skills ? [candidateData.skills] : [],
        previousCompanies: candidateData.previousCompanies ? candidateData.previousCompanies.split(', ').filter(Boolean) : [],
        appliedPosition: Array.isArray(candidateData.appliedPosition) ? candidateData.appliedPosition.map((p: any) => p.name || p) : candidateData.appliedPosition ? [candidateData.appliedPosition] : [],
        education: Array.isArray(candidateData.education) ? candidateData.education : candidateData.education ? [candidateData.education] : []
      });
    }
    if (error) {
      toast({
        title: "Failed to load candidate",
        description: "Unable to fetch candidate data. Please try again.",
        variant: "destructive",
      });
    }
  }, [data, error, toast]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userRole = JSON.parse(localStorage.getItem("user") || "{}").userType || "admin";

  const handleSave = () => {
    if (!formData || !formData.fullName || !formData.email || !formData.appliedPosition.length) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }
    updateCandidateMutation.mutate(formData);
  };

   const updateCandidateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await axios.put(`http://localhost:4000/api/candidate/update-candidate/${id}`, {
        ...data,
        previousCompanies: data.previousCompanies.join(', '),
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        return res.data;
      }).catch((error) => {
        throw new Error(error.response?.data?.message || 'Failed to save candidate');
      });
    },
    onSuccess: (data) => {
      // console.log(data);
       toast({
        title: "Candidate updated successfully.",
        description: "The candidate information has been updated and saved.",
      });
      navigate(`/candidate/${id}`);
    },
    onError: (error) => {
       toast({
        title: "Candidate updated Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });



  const addCompany = () => {
    if (newCompany.trim() && formData && !(formData.previousCompanies || []).includes(newCompany)) {
      setFormData({
        ...formData,
        previousCompanies: [...(formData.previousCompanies || []), newCompany],
      });
      setNewCompany("");
    }
  };



  const addEducation = () => {
    if (newEducation.trim() && formData && !(formData.education || []).includes(newEducation)) {
      setFormData({
        ...formData,
        education: [...(formData.education || []), newEducation],
      });
      setNewEducation("");
    }
  };

  const safeArray = (arr: any): any[] => {
    return Array.isArray(arr) ? arr : [];
  };

  return (
    <MainLayout
      userRole={userRole as "admin" | "hr"}
      pageTitle="Edit Candidate"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-8 max-w-4xl">
        {error ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-2">Error loading candidate</div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        ) : isLoading || !formData ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-lg text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Candidate</h1>
          <p className="text-muted-foreground mt-1">
            Update candidate information
          </p>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData?.fullName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
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
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Position Applying For *
              </label>
              <MultiSelect
                options={positionsOptions}
                selected={formData.appliedPosition}
                onSelectionChange={(positions) =>
                  setFormData({ ...formData, appliedPosition: positions })
                }
                placeholder="Select positions..."
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {safeArray(formData.appliedPosition).map((position) => (
                  <div
                    key={position}
                    className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {position}
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          appliedPosition: safeArray(formData.appliedPosition).filter((p) => p !== position),
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

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.totalExperience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalExperience: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Availability
              </label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Current Salary */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Salary
              </label>
              <input
                type="text"
                value={formData.currentSalary}
                onChange={(e) =>
                  setFormData({ ...formData, currentSalary: e.target.value })
                }
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Expected Salary */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expected Salary
              </label>
              <input
                type="text"
                value={formData.expectedSalary}
                onChange={(e) =>
                  setFormData({ ...formData, expectedSalary: e.target.value })
                }
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
              selected={formData.skills}
              onSelectionChange={(skills) =>
                setFormData({ ...formData, skills })
              }
              placeholder="Select skills..."
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {safeArray(formData.skills).map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        skills: safeArray(formData.skills).filter((s) => s !== skill),
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
              {safeArray(formData.previousCompanies).map((company) => (
                <div
                  key={company}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {company}
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        previousCompanies: safeArray(formData.previousCompanies).filter(
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
              {safeArray(formData.education).map((edu) => (
                <div
                  key={edu}
                  className="flex items-center justify-between px-4 py-2 bg-muted border border-border rounded-lg"
                >
                  <span className="text-foreground">{edu}</span>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        education: safeArray(formData.education).filter((e) => e !== edu),
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

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any additional notes"
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
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
