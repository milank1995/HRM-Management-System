import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Plus, Trash2, Edit } from "lucide-react";
import { skillsApi, positionsApi, interviewRoundsApi } from "@/lib/api";
import { validatePositionSchema } from "../../validators/positionSchemaValidators";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface JobPosition {
  name: string;
  department: string;
  level: string;
}

interface InterviewRound {
  name: string;
  description: string;
}

interface Skill {
  name: string;
  category: string;
}

export default function Settings() {
  const { toast } = useToast()
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [userName] = useState(JSON.parse(localStorage.getItem("user") || "{}").name || "Admin");
  const [newPosition, setNewPosition] = useState<JobPosition>({
    name: "",
    department: "",
    level: "",
  });
  const [positionErrors, setPositionErrors] = useState<{ [key: string]: string }>({});

  const [newRound, setNewRound] = useState<InterviewRound>({
    name: "",
    description: "",
  });

  const [newSkill, setNewSkill] = useState<Skill>({
    name: "",
    category: "",
  });

  const [editData, setEditData] = useState<{ id: number, type: 'position' | 'round' | 'skill', data: any }>({ id: 0, type: 'position', data: {} });
  const [editFormData, setEditFormData] = useState<any>({});

  // Job Positions
  const [jobPositions, setJobPositions] = useState([]);
  const { data: positionsData = [], isLoading: positionsLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionsApi()
  });

  // Interview Rounds
  const [interviewRounds, setInterviewRounds] = useState([]);
  const { data: interviewRoundData = [], isLoading: roundsLoading } = useQuery({
    queryKey: ['interviewRounds'],
    queryFn: () => interviewRoundsApi()
  });

  // Skill Dictionary
  const [skills, setSkills] = useState([]);
  const { data: skillData = [], isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillsApi()
  });

  useEffect(() => {
    if (positionsData.length > 0) {
      setJobPositions(positionsData);
    }
    if (interviewRoundData.length > 0) {
      setInterviewRounds(interviewRoundData);
    }
    if (skillData.length > 0) {
      setSkills(skillData);
    }
  }, [positionsData, interviewRoundData, skillData]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userRole = JSON.parse(localStorage.getItem("user") || "{}").userType || "admin";

  const createPositionMutation = useMutation({

    mutationFn: async (data: JobPosition) => {
      return await axios.post('http://localhost:4000/api/positions/add-position', {
        ...data,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        return res.data;
      })
    },
    onSuccess: (data) => {
      setNewPosition({ name: "", department: "", level: "" });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast({
        title: "Position created successfully",
        description: "The position has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create position",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  })
  const addJobPosition = async () => {
    const validate = validatePositionSchema.safeParse(newPosition);
    if (!validate.success) {
      const errors: { [key: string]: string } = {};
      validate.error.issues.forEach(issue => {
        errors[issue.path[0]] = issue.message;
      });
      setPositionErrors(errors);
      console.log(errors);
      toast({
        title: "Validation Error",
        description: errors.message || "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }
    setPositionErrors({});
    createPositionMutation.mutate(newPosition);
  };

  const deletePositionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await axios.delete(`http://localhost:4000/api/positions/delete-position/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        console.log(res.data);

        return res.data;
      })
    },
    onSuccess: (data) => {
      setJobPositions(prev => prev.filter(p => p.id !== data.deletedId));
      toast({
        title: "Position deleted successfully",
        description: "The position has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete position",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  })
  const deleteJobPosition = (id: number) => {
    setJobPositions(prev => prev.filter(p => p.id !== id));
    deletePositionMutation.mutate(id);
  };



  const createInterviewRoundMutation = useMutation({
    mutationFn: async (data: InterviewRound) => {
      return await axios.post('http://localhost:4000/api/interview-round/add-interview-round', {
        ...data,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        return res.data;
      })
    },
    onSuccess: (data) => {
      setNewRound({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ['interviewRounds'] });
      toast({
        title: "Interview Round created successfully",
        description: "The interview round has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create round",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  })
  const addInterviewRound = () => {
    //    if (newRound.name && newRound.description) {
    //   setInterviewRounds([
    //     ...interviewRounds,
    //     {
    //       id: Math.max(...interviewRounds.map((r) => r.id), 0) + 1,
    //       ...newRound,
    //     },
    //   ]);
    //   setNewRound({ name: "", description: "" });
    // }
    createInterviewRoundMutation.mutate(newRound);
  };

  const DeleteInterviewRound = useMutation({
    mutationFn: async (id: number) => {
      return await axios.delete(`http://localhost:4000/api/interview-round/delete-interview-round/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        return res.data;
      })
    },
    onSuccess: (data) => {
      setInterviewRounds(prev => prev.filter(r => r.id !== data.deletedId));
      toast({
        title: "Interview Round deleted successfully",
        description: "The Interview Round has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete Interview Round",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  })
  const deleteInterviewRound = (id: number) => {
    setInterviewRounds(prev => prev.filter(r => r.id !== id));
    DeleteInterviewRound.mutate(id)
  };



  const createSkillMutation = useMutation({
    mutationFn: async (data: Skill) => {
      return await axios.post('http://localhost:4000/api/skills/add-skill', {
        ...data,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        return res.data;
      })
    },
    onSuccess: (data) => {
      setNewSkill({ name: "", category: "" });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({
        title: "Skill created successfully",
        description: "The skill has been created successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Please try again.";
      toast({
        title: "Failed to create skill",
        description: errorMessage,
        variant: "destructive",
      });
    },
  })
  const addSkill = () => {
    createSkillMutation.mutate(newSkill);
  };
  const deleteSkillMutation = useMutation({
    mutationFn: async (id: number) => {
      return await axios.delete(`http://localhost:4000/api/skills/delete-skill/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        return res.data;
      })
    },
    onSuccess: (data) => {
      setSkills(prev => prev.filter(s => s.id !== data.deletedId));
      toast({
        title: "Skill deleted successfully",
        description: "The skill has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete skill",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  })
  const deleteSkill = (id: number) => {
    setSkills(prev => prev.filter(s => s.id !== id));
    deleteSkillMutation.mutate(id);
  };

  const handleEdit = (id: number, type: 'position' | 'round' | 'skill', data: any) => {
    setEditData({ id, type, data });
    setEditFormData({ ...data });
  };

  const handleCloseModal = () => {
    setEditData({ id: 0, type: 'position', data: {} });
    setEditFormData({});
  };

  // Update mutations
  const updatePositionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: JobPosition }) => {
      return await axios.put(`http://localhost:4000/api/positions/update-position/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      handleCloseModal();
      toast({ title: "Position updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update position", description: error.message, variant: "destructive" });
    }
  });

  const updateRoundMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: InterviewRound }) => {
      return await axios.put(`http://localhost:4000/api/interview-round/update-interview-round/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewRounds'] });
      handleCloseModal();
      toast({ title: "Round updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update round", description: error.message, variant: "destructive" });
    }
  });

  const updateSkillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Skill }) => {
      return await axios.put(`http://localhost:4000/api/skills/update-skill/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      handleCloseModal();
      toast({ title: "Skill updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update skill", description: error.message, variant: "destructive" });
    }
  });

  const handleUpdate = () => {
    const { id, type } = editData;
    if (type === 'position') {
      updatePositionMutation.mutate({ id, data: editFormData });
    } else if (type === 'round') {
      updateRoundMutation.mutate({ id, data: editFormData });
    } else if (type === 'skill') {
      updateSkillMutation.mutate({ id, data: editFormData });
    }
  };
  return (
    <MainLayout
      userRole={userRole as "admin" | "hr"}
      pageTitle="Settings"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className=" max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage job positions, interview rounds, and skills dictionary
          </p>
        </div>

        {/* Job Positions Section */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Job Positions
          </h2>

          {/* Add Position Form */}
          <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
            <h3 className="font-medium text-foreground mb-3">Add New Position</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Position name"
                  name="name"
                  value={newPosition.name}
                  onChange={(e) =>
                    setNewPosition({ ...newPosition, name: e.target.value })
                  }
                  className={`px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${positionErrors.name ? 'border-red-500' : 'border-border'
                    }`}
                />
                {positionErrors.name && <p className="text-red-500 text-sm mt-1">{positionErrors.name}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Department"
                  name="department"
                  value={newPosition.department}
                  onChange={(e) =>
                    setNewPosition({ ...newPosition, department: e.target.value })
                  }
                  className={`px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${positionErrors.department ? 'border-red-500' : 'border-border'
                    }`}
                />
                {positionErrors.department && <p className="text-red-500 text-sm mt-1">{positionErrors.department}</p>}
              </div>
              <div>
                <select
                  name="level"
                  value={newPosition.level}
                  onChange={(e) =>
                    setNewPosition({ ...newPosition, level: e.target.value })
                  }
                  className={`px-3 w-full py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${positionErrors.level ? 'border-red-500' : 'border-border'
                    }`}
                >
                  <option value="">Select Level</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Manager">Manager</option>
                </select>
                {positionErrors.level && <p className="text-red-500 text-sm mt-1">{positionErrors.level}</p>}
              </div>
              <button
                onClick={addJobPosition}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Positions List */}
          <div className="space-y-2">
            {positionsLoading ? (
              <div className="text-center py-4">Loading positions...</div>
            ) : (
              jobPositions.map((position, key) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-1 bg-muted rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{position.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {position.department} • {position.level} Level
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEdit(position.id, 'position', position)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteJobPosition(position?.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Interview Rounds Section */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Interview Rounds
          </h2>

          {/* Add Round Form */}
          <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
            <h3 className="font-medium text-foreground mb-3">Add New Round</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Round Name"
                value={newRound.name}
                onChange={(e) => setNewRound({ ...newRound, name: e.target.value })}
                className="px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Description"
                value={newRound.description}
                onChange={(e) =>
                  setNewRound({ ...newRound, description: e.target.value })
                }
                className="px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={addInterviewRound}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Rounds List */}
          <div className="space-y-2">
            {roundsLoading ? (
              <div className="text-center py-4">Loading rounds...</div>
            ) : (
              interviewRounds.map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{round.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {round.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEdit(round.id, 'round', round)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteInterviewRound(round.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Skill Dictionary Section */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Skill Dictionary
          </h2>

          {/* Add Skill Form */}
          <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
            <h3 className="font-medium text-foreground mb-3">Add New Skill</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Skill Name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <select
                value={newSkill.category}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, category: e.target.value })
                }
                className="px-3 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Languages">Languages</option>
                <option value="Databases">Databases</option>
                <option value="Cloud">Cloud</option>
                <option value="DevOps">DevOps</option>
              </select>
              <button
                onClick={addSkill}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skillsLoading ? (
              <div className="col-span-full text-center py-4">Loading skills...</div>
            ) : (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{skill.name}</p>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full inline-block mt-1">
                      {skill.category}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEdit(skill.id, 'skill', skill)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editData.id > 0 && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
                <h3 className="text-xl font-bold text-white capitalize flex items-center gap-2">
                  <Edit size={20} />
                  Edit {editData.type}
                </h3>
              </div>
      
              <div className="p-6">
                {editData.type === 'position' && (
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                        Position Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter position name"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                        Department
                      </label>
                      <input
                        type="text"
                        placeholder="Enter department"
                        value={editFormData.department || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                        Level
                      </label>
                      <select
                        value={editFormData.level || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white"
                      >
                        <option value="">Select Level</option>
                        <option value="Junior">Junior</option>
                        <option value="Mid">Mid</option>
                        <option value="Senior">Senior</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {editData.type === 'round' && (
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                        Round Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter round name"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                        Description
                      </label>
                      <textarea
                        placeholder="Enter description"
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
                
                {editData.type === 'skill' && (
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                        Skill Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter skill name"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                        Category
                      </label>
                      <select
                        value={editFormData.category || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white"
                      >
                        <option value="">Select Category</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Languages">Languages</option>
                        <option value="Databases">Databases</option>
                        <option value="Cloud">Cloud</option>
                        <option value="DevOps">DevOps</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 transform hover:scale-[0.98]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={updatePositionMutation.isPending || updateRoundMutation.isPending || updateSkillMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {(updatePositionMutation.isPending || updateRoundMutation.isPending || updateSkillMutation.isPending) ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </span>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
