import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Save, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addInterviewRoundApi, fetchCandidateById } from "@/lib/api";

interface FormData {
  roundName: string;
  interviewer: string;
  date: string;
  time: string;
  score: number;
  status: "pass" | "fail";
  feedback: string;
}

export default function AddInterviewRound() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "User"
  );
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    roundName: "",
    interviewer: "",
    date: "",
    time: "",
    score: 5,
    status: "pass",
    feedback: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userRole = JSON.parse(localStorage.getItem("user") || "{}").userType || "admin";

  useEffect(() => {
    const loadCandidate = async () => {
      if (candidateId) {
        try {
          const candidateData = await fetchCandidateById(candidateId);
          setCandidate(candidateData.candidate);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load candidate details",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    loadCandidate();
  }, [candidateId, toast]);

  const roundNames = [
    "Initial Screening",
    "Technical Assessment",
    "HR Round",
    "Manager Round",
    "Final Round",
  ];

  const interviewers = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Williams",
    "David Brown",
  ];

  const handleSave = async () => {
    if (
      !formData.roundName ||
      !formData.interviewer ||
      !formData.date ||
      !formData.time
    ) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const interviewData = {
        name: formData.roundName,
        description: `${formData.interviewer} - ${formData.date} ${formData.time} - Score: ${formData.score} - Status: ${formData.status} - Feedback: ${formData.feedback}`
      };
      
      await addInterviewRoundApi(interviewData);
      
      toast({
        title: "Interview round added successfully!",
        description: "The interview round has been scheduled.",
      });
      navigate(`/candidate/${candidateId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add interview round. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout
      userRole={userRole as "admin" | "hr"}
      pageTitle="Add Interview Round"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Add Interview Round
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new interview round for the candidate
          </p>
        </div>

        {/* Candidate Info Card */}
        {candidate && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-blue-900">Candidate Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Name:</span>
                <p className="text-blue-700">{candidate.fullName}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Email:</span>
                <p className="text-blue-700">{candidate.email}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Phone:</span>
                <p className="text-blue-700">{candidate.phone}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Experience:</span>
                <p className="text-blue-700">{candidate.totalExperience} years</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Current Salary:</span>
                <p className="text-blue-700">₹{candidate.currentSalary?.toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Expected Salary:</span>
                <p className="text-blue-700">₹{candidate.expectedSalary?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-card p-8">
          <div className="space-y-6">
            {/* Round Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Round Name *
              </label>
              <select
                value={formData.roundName}
                onChange={(e) =>
                  setFormData({ ...formData, roundName: e.target.value })
                }
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a round</option>
                {roundNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Interviewer */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Interviewer *
              </label>
              <select
                value={formData.interviewer}
                onChange={(e) =>
                  setFormData({ ...formData, interviewer: e.target.value })
                }
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select an interviewer</option>
                {interviewers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Score Slider */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Score: <span className="text-primary font-semibold">{formData.score}/10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={formData.score}
                onChange={(e) =>
                  setFormData({ ...formData, score: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="pass"
                    checked={formData.status === "pass"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "pass" | "fail",
                      })
                    }
                    className="w-4 h-4 text-primary cursor-pointer"
                  />
                  <span className="text-foreground font-medium">Pass</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="fail"
                    checked={formData.status === "fail"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "pass" | "fail",
                      })
                    }
                    className="w-4 h-4 text-primary cursor-pointer"
                  />
                  <span className="text-foreground font-medium">Fail</span>
                </label>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Feedback
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) =>
                  setFormData({ ...formData, feedback: e.target.value })
                }
                placeholder="Add detailed feedback about the interview..."
                rows={5}
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
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
              Save Interview Round
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
