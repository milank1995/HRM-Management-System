import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Download, Edit, Plus, Clock, CheckCircle, XCircle, MoreVertical, MessageSquare } from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchCandidateById, fetchUsersPaginated, getInterviewsByCandidateId } from "@/lib/api";
import { Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog } from '../components/Dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateInterviewApi, deleteInterviewApi, addInterviewApi, interviewRoundsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { validateInterviewSchema } from '../../validators/interviewSchemaValidators';
import { SearchableSelect } from "@/components/ui/searchable-select";

interface Candidate {
  id: number;
  fullName: string;
  appliedPosition: string[];
  status: string;
  email: string;
  phone: string;
  totalExperience: number;
  skills: string[];
  currentSalary: string;
  expectedSalary: string;
  previousCompanies: string[];
  education: string[];
  notes: string;
}

interface Interview {
  id: number;
  interviewer: string;
  candidate: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'passed' | 'failed';
  score?: number;
  interviewRound: string;
  feedback?: string;
  meetingLink?: string;
  review?: {
    score: number;
    feedback: string;
  };
}

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "User"
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ score: '', feedback: '', status: 'pending' });
  const [newInterview, setNewInterview] = useState<Partial<Interview>>({
    interviewer: '',
    candidate: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'pending',
    interviewRound: '',
    meetingLink: ''
  });
  const { data: details, isLoading, error } = useQuery({
    queryKey: ["candidateDetail", id],
    queryFn: () => fetchCandidateById(id),
  });

  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ["candidateInterviews", id],
    queryFn: async () => {
      return await getInterviewsByCandidateId(id!);
    },
    enabled: !!id
  });

  const { data: interviewRounds = [] } = useQuery({
    queryKey: ['interviewRounds'],
    queryFn: interviewRoundsApi
  });

  const {
    data: usersData,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasMoreUsers,
    isFetchingNextPage: loadingUsers,
  } = useInfiniteQuery({
    queryKey: ["users-paginated"],
    queryFn: fetchUsersPaginated,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.nextPage ?? undefined,
  });

  const userOptions = useMemo(() => {
    if (!usersData?.pages) return [];

    return usersData.pages.flatMap((page: any) =>
      page.data.map((u: any) => {
        return {
          value: `${u.firstName} ${u.lastName}`,
          label: `${u.firstName} ${u.lastName}`,
          mail: u.email
        };
      })
    );
  }, [usersData]);

  const addMutation = useMutation({
    mutationFn: addInterviewApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateInterviews', id] });
      setScheduleModalOpen(false);
      setNewInterview({
        interviewer: '',
        candidate: '',
        date: '',
        startTime: '',
        endTime: '',
        status: 'pending',
        interviewRound: ''
      });
      toast({
        title: "Interview scheduled successfully",
        description: "Interview scheduled successfully",
        variant: "default"
      })
    },
    onError: (error) => {
      toast({
        title: 'Error during schedule interview.',
        description: error.message,
        variant: "destructive"
      })
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateInterviewApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateInterviews', id] });
      setEditModalOpen(false);
      setSelectedInterview(null);
      toast({
        title: "Interview updated successfully",
        description: "Interview updated successfully",
        variant: "default"
      })
    },
    onError: (error) => {
      toast({
        title: "Error updating interview",
        description: error.message,
        variant: "destructive"
      })
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInterviewApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateInterviews', id] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setDeleteModalOpen(false);
      setSelectedInterview(null);
      toast({
        title: "Interview deleted successfully",
        description: "Interview deleted successfully",
        variant: "default"
      })
    },
    onError: (error) => {
      toast({
        title: "Error deleting interview",
        description: error.message,
        variant: "destructive"
      })
    }
  });

  useEffect(() => {
    if (details) {
      const candidateData = details?.data;
      setCandidate({
        ...candidateData,
        skills: Array.isArray(candidateData.skills)
          ? candidateData.skills.map((s: any) => typeof s === 'object' ? s.name || 'Unknown Skill' : s)
          : candidateData.skills ? [candidateData.skills] : [],
        previousCompanies: candidateData.previousCompanies ? [candidateData.previousCompanies] : [],
        appliedPosition: Array.isArray(candidateData.appliedPosition)
          ? candidateData.appliedPosition.map((p: any) => typeof p === 'object' ? p.name || 'Unknown Position' : p)
          : candidateData.appliedPosition ? [candidateData.appliedPosition] : [],
        education: Array.isArray(candidateData.education) ? [candidateData.education] : []
      });
    }
    if (error) {
      toast({
        title: "Failed to load candidate",
        description: error.message || "Error",
        variant: "destructive",
      });
    }
  }, [details, error, toast]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userRole = JSON.parse(localStorage.getItem("user") || "{}").userType || "admin";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "Company History" },
    { id: "education", label: "Education" },
    { id: "interviews", label: "Interview Rounds" },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-orange-100 text-orange-800",
      passed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getInterviewStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      passed: <CheckCircle size={16} className="text-green-600" />,
      failed: <XCircle size={16} className="text-red-600" />,
      pending: <Clock size={16} className="text-orange-600" />,
    };
    return icons[status];
  };

  const handleViewInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setViewModalOpen(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setEditModalOpen(true);
  };

  const handleDeleteInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedInterview) {
      deleteMutation.mutate(selectedInterview.id);
    }
  };

  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const convertTo24Hour = (time12: string) => {
    const [time, ampm] = time12.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const saveNewInterview = () => {
    try {
      const interviewData = {
        ...newInterview,
        candidateId: candidate?.id || parseInt(id!),
        startTime: convertTo12Hour(newInterview.startTime!),
        endTime: convertTo12Hour(newInterview.endTime!)
      };
      validateInterviewSchema.parse(interviewData);
      addMutation.mutate(interviewData);
    } catch (error: any) {
      toast({
        title: 'Validation Error',
        description: error.errors?.[0]?.message || 'Invalid interview data',
        variant: "destructive"
      });
    }
  };

  const saveEdit = () => {
    if (selectedInterview) {
      try {
        const interviewData = {
          id: selectedInterview.id,
          interviewer: selectedInterview.interviewer || '',
          candidate: candidate?.fullName || '',
          candidateId: candidate?.id || parseInt(id!),
          date: selectedInterview.date || '',
          startTime: selectedInterview.startTime?.includes('AM') || selectedInterview.startTime?.includes('PM')
            ? selectedInterview.startTime
            : convertTo12Hour(selectedInterview.startTime || ''),
          endTime: selectedInterview.endTime?.includes('AM') || selectedInterview.endTime?.includes('PM')
            ? selectedInterview.endTime
            : convertTo12Hour(selectedInterview.endTime || ''),
          interviewRound: selectedInterview.interviewRound || '',
          meetingLink: selectedInterview.meetingLink || '',
          status: selectedInterview.status,
        };
        validateInterviewSchema.parse(interviewData);
        updateMutation.mutate(interviewData);
      } catch (error: any) {
        toast({
          title: 'Validation Error',
          description: error.errors?.[0]?.message || 'Invalid interview data',
          variant: "destructive"
        });
      }
    }
  };

  const handleAddReview = (interview: Interview) => {
    setSelectedInterview(interview);
    setReviewData({
      score: interview?.review?.score?.toString() || '',
      feedback: interview?.review?.feedback || '',
      status: interview.status
    });
    setReviewModalOpen(true);
  };

  const handleScoreChange = (score: string) => {
    const numScore = parseInt(score);
    const newStatus = numScore >= 5 ? 'passed' : 'failed';
    setReviewData({ ...reviewData, score, status: newStatus });
  };

  const saveReview = () => {
    if (selectedInterview) {
      const updatedInterview = {
        ...selectedInterview,
        candidate: candidate?.fullName || '',
        candidateId: candidate?.id || parseInt(id!),
        review: {
          score: parseInt(reviewData.score),
          feedback: reviewData.feedback,
        },
        status: reviewData.status as 'pending' | 'passed' | 'failed',
        meetingLink: selectedInterview.meetingLink
      };
      updateMutation.mutate(updatedInterview);
      setReviewModalOpen(false);
    }
  };

  return (
    <MainLayout
      userRole={userRole as "admin" | "hr"}
      pageTitle="Candidate Details"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="max-w-5xl">
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
        ) : isLoading || !candidate ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-lg text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-card p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {candidate?.fullName}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    {candidate?.appliedPosition?.join(", ") || "No positions"}
                  </p>
                  <span
                    className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      candidate?.status || 'applied'
                    )}`}
                  >
                    {(candidate?.status || 'applied').charAt(0).toUpperCase() +
                      (candidate?.status || 'applied').slice(1)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
                    <Download size={18} />
                    Download Resume
                  </button>
                  <button
                    onClick={() => navigate(`/candidate/${id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    <Edit size={18} />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-card p-4">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-foreground font-medium mt-1">{candidate?.email}</p>
              </div>
              <div className="bg-white rounded-xl shadow-card p-4">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-foreground font-medium mt-1">{candidate?.phone}</p>
              </div>
              <div className="bg-white rounded-xl shadow-card p-4">
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="text-foreground font-medium mt-1">
                  {candidate?.totalExperience} years
                </p>
              </div>
            </div>

            <div className="rounded-xl shadow-card">
              <div className="flex border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium transition-all border-b-2 ${activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Salary Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Salary Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Current Salary
                          </p>
                          <p className="text-foreground font-medium mt-1">
                            {candidate?.currentSalary}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Expected Salary
                          </p>
                          <p className="text-foreground font-medium mt-1">
                            {candidate?.expectedSalary}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {candidate?.skills?.map((skill) => (
                          <span
                            key={skill}
                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {candidate?.notes && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-3">
                          Notes
                        </h3>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-foreground">{candidate?.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Company History Tab */}
                {activeTab === "history" && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Work Experience
                    </h3>
                    <div className="space-y-4">
                      {candidate?.previousCompanies?.map((company, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-muted rounded-lg border border-border"
                        >
                          <p className="font-semibold text-foreground">{company}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === "education" && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Education
                    </h3>
                    <div className="space-y-4">
                      {candidate?.education?.map((edu, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-muted rounded-lg border border-border"
                        >
                          <p className="text-foreground font-medium">{edu}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interview Rounds Tab */}
                {activeTab === "interviews" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Interview Timeline
                      </h3>
                      <button onClick={() => {
                        setNewInterview({
                          ...newInterview,
                          candidate: candidate?.fullName || ''
                        });
                        setScheduleModalOpen(true);
                      }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
                        <Plus size={18} />
                        Add Round
                      </button>
                    </div>

                    {interviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground">Loading interviews...</div>
                      </div>
                    ) : !interviewsData || interviewsData.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground">No interviews scheduled yet.</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {interviewsData.map((interview: any) => (
                          <div
                            key={interview.id}
                            className="border-l-4 border-primary pl-6 "
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-lg font-semibold text-foreground">
                                  {interview.interviewRound || 'Interview Round'}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Interviewer: {interview.interviewer || 'TBD'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Date: {interview.date ? new Date(interview.date).toLocaleDateString() : 'TBD'}
                                </p>
                                {interview.status !== "pending" && interview.review?.score && (
                                  <p className="text-sm text-muted-foreground">
                                    Score: {interview.review?.score}/10
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <span
                                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm ${(interview.status || 'pending') === "passed"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : (interview.status || 'pending') === "failed"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : "bg-orange-50 text-orange-700 border border-orange-200"
                                    }`}
                                >
                                  {getInterviewStatusIcon(interview.status || 'pending')}
                                  {((interview.status || 'pending').charAt(0).toUpperCase() +
                                    (interview.status || 'pending').slice(1))}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white data-[state=open]:bg-blue-600 data-[state=open]:text-white focus:outline-none transition-colors">
                                      <MoreVertical size={18} />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleViewInterview(interview)}>
                                      <Eye size={16} className="mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleEditInterview(interview)}>
                                      <Edit size={16} className="mr-2" />
                                      Edit Interview
                                    </DropdownMenuItem>
                                    {
                                      (!interview.review || !interview.review.score) && (
                                        <DropdownMenuItem onClick={() => handleAddReview(interview)}>
                                          <MessageSquare size={16} className="mr-2" />
                                          Add Review
                                        </DropdownMenuItem>
                                      )
                                    }

                                    {
                                      interview.status === "pending" &&
                                      <DropdownMenuItem onSelect={() => handleDeleteInterview(interview)} className="text-red-600">
                                        <Trash2 size={16} className="mr-2" />
                                        Cancel Interview
                                      </DropdownMenuItem>
                                    }
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {interview.review?.feedback && (
                              <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
                                <p className="text-sm font-medium text-foreground">
                                  Feedback :- {interview.review?.feedback}
                                </p>

                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* add model */}
        <Dialog
          isOpen={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false);
            setNewInterview({
              interviewer: '',
              candidate: '',
              date: '',
              startTime: '',
              endTime: '',
              interviewRound: ''
            });
          }}
          title="Schedule Interview"
          size="lg"
        >
          <div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Interviewer</label>
                <SearchableSelect
                  options={userOptions}
                  value={newInterview.interviewer || ""}
                  onValueChange={(value) =>
                    setNewInterview({ ...newInterview, interviewer: value })
                  }
                  placeholder="Select Interviewer"
                  searchPlaceholder="Search interviewers..."
                  onLoadMore={fetchNextUsers}
                  hasMore={hasMoreUsers}
                  loading={loadingUsers}
                  className="w-full px-4 py-6 border border-border rounded-xl bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Date</label>
                <input
                  type="date"
                  value={newInterview.date || ''}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setNewInterview({ ...newInterview, date: e.target.value })
                  }}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Interview Round</label>
                <select
                  value={newInterview.interviewRound || ''}
                  onChange={(e) => setNewInterview({ ...newInterview, interviewRound: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                >
                  <option value="">Select Interview Round</option>
                  {Array.isArray(interviewRounds) && interviewRounds.map((round: any) => (
                    <option key={round.id} value={round.name}>
                      {round.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Start Time</label>
                <input
                  type="time"
                  step="60"
                  value={newInterview.startTime || ''}
                  onChange={(e) => {
                    setNewInterview({ ...newInterview, startTime: e.target.value })
                  }}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">End Time</label>
                <input
                  type="time"
                  step="60"
                  value={newInterview.endTime || ''}
                  onChange={(e) => setNewInterview({ ...newInterview, endTime: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Meeting Link</label>
                <input
                  type="url"
                  value={newInterview.meetingLink || ''}
                  onChange={(e) => setNewInterview({ ...newInterview, meetingLink: e.target.value })}
                  placeholder="https://www.example.com"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>
            <div className=" mt-4 border-t ">
              <div className="flex mt-4 justify-end gap-4">
                <button
                  onClick={() => {
                    setScheduleModalOpen(false);
                    setNewInterview({
                      interviewer: '',
                      candidate: '',
                      date: '',
                      startTime: '',
                      endTime: '',
                      status: 'pending',
                      interviewRound: ''
                    });
                  }}
                  className="px-6 py-3 text-muted-foreground border border-border rounded-xl hover:bg-muted/50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewInterview}
                  disabled={addMutation.isPending}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 font-medium shadow-lg transition-all"
                >
                  {addMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </div>
          </div>
        </Dialog>

        {/* View Modal */}
        <Dialog
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Interview Details"
          size="lg"
        >
          {selectedInterview && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Interviewer
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {selectedInterview.interviewer}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Date
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {selectedInterview.date}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Time
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {selectedInterview.startTime} – {selectedInterview.endTime}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Round
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {selectedInterview.interviewRound}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm ${getStatusColor(
                      selectedInterview.status
                    )}`}
                  >
                    {selectedInterview.status.charAt(0).toUpperCase() +
                      selectedInterview.status.slice(1)}
                  </span>
                </div>
              </div>

              {selectedInterview.meetingLink && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Meeting Link</label>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <p onClick={() => window.open(selectedInterview.meetingLink, "_blank")}>{selectedInterview.meetingLink}</p>
                  </div>
                </div>
              )}

              {selectedInterview?.review && selectedInterview?.review?.score !== null && (
                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-5 py-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Score
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedInterview?.review?.score}/10
                    </p>
                  </div>
                </div>
              )}

              {selectedInterview?.review?.feedback && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Feedback
                  </p>
                  <div className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
                    {selectedInterview?.review?.feedback}
                  </div>
                </div>
              )}
            </div>

          )}
        </Dialog>

        {/* Edit Modal */}
        <Dialog
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Interview"
          size="lg"
        >
          {selectedInterview && (
            <div >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Interviewer</label>
                  <SearchableSelect
                    options={userOptions}
                    value={selectedInterview.interviewer || ""}
                    onValueChange={(value) =>
                      setSelectedInterview({ ...selectedInterview, interviewer: value })
                    }
                    placeholder="Select Interviewer"
                    searchPlaceholder="Search interviewers..."
                    onLoadMore={fetchNextUsers}
                    hasMore={hasMoreUsers}
                    loading={loadingUsers}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Interview Round</label>
                  <select
                    value={selectedInterview.interviewRound}
                    onChange={(e) => setSelectedInterview({ ...selectedInterview, interviewRound: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="">Select Interview Round</option>
                    {Array.isArray(interviewRounds) && interviewRounds.map((round: any) => (
                      <option key={round.id} value={round.name}>
                        {round.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedInterview.date}
                    onChange={(e) => setSelectedInterview({ ...selectedInterview, date: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Start Time</label>
                  <input
                    type="time"
                    value={convertTo24Hour(selectedInterview.startTime)}
                    onChange={(e) => setSelectedInterview({ ...selectedInterview, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">End Time</label>
                  <input
                    type="time"
                    value={convertTo24Hour(selectedInterview.endTime)}
                    onChange={(e) => setSelectedInterview({ ...selectedInterview, endTime: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Meeting Link</label>
                  <input
                    type="url"
                    value={selectedInterview.meetingLink}
                    placeholder="https://www.example.com"
                    onChange={(e) => setSelectedInterview({ ...selectedInterview, meetingLink: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  />
                </div>
              </div>
              <div className=" border-t border-border mt-4">
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="px-6 py-3 text-muted-foreground border border-border rounded-xl hover:bg-muted/50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={updateMutation.isPending}
                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 font-medium shadow-lg transition-all"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Dialog>

        {/* Delete Modal */}
        <Dialog
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Interview"
          size="sm"
        >
          {selectedInterview && (
            <div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Delete Interview?
                  </p>
                  <p className="text-muted-foreground">
                    Are you sure you want to delete the interview with ?
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-6 py-3 text-muted-foreground border border-border rounded-xl hover:bg-muted/50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium shadow-lg transition-all"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Interview'}
                </button>
              </div>
            </div>
          )}
        </Dialog>

        {/* Review Model */}
        <Dialog
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Add Interview Review"
          size="md"
        >
          {selectedInterview && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Review for {candidate?.fullName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedInterview.interviewRound} - {selectedInterview.date}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Score (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reviewData.score}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                    placeholder="Enter score (1-10)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Feedback
                  </label>
                  <textarea
                    value={reviewData.feedback}
                    onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm resize-none"
                    placeholder="Enter your feedback about the interview..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="px-6 py-3 text-muted-foreground border border-border rounded-xl hover:bg-muted/50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveReview}
                  disabled={updateMutation.isPending || !reviewData.score}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 font-medium shadow-lg transition-all"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </div>
          )}
        </Dialog>

      </div>
    </MainLayout>


  );
}
