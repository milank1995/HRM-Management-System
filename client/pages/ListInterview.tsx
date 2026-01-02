import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Plus, Search, Eye, Edit, Trash2, MoreVertical, MessageSquare } from 'lucide-react';
import { Dialog } from '../components/Dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { SimpleMultiSelect } from '@/components/ui/simple-multi-select';
import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { updateInterviewApi, deleteInterviewApi, getInterviewsApi, addInterviewApi, interviewRoundsApi, interviewFilterApi, fetchCandidatesPaginated, fetchUsersPaginated } from '../lib/api';
import { useToast } from '@/hooks/use-toast';
import { validateInterviewSchema } from '../../validators/interviewSchemaValidators';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface Interview {
    id: number;
    interviewer: string;
    candidate: {
        id: number;
        fullName: string;
        email: string;
        phone: string;
        totalExperience: number;
        education: string[];
        previousCompanies: string;
        availability: string;
        currentSalary: number;
        expectedSalary: number;
        notes: string;
        addBy: string;
        resume?: string | null;
    };
    candidateId?: number;
    date: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'passed' | 'failed';
    interviewRound: string;
    meetingLink?: string
    review?: {
        score: number;
        feedback: string;
    };
}

export const ListInterview = () => {
    const { toast } = useToast()
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const queryClient = useQueryClient();

    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({ score: '', feedback: '', status: 'pending' });
    const [candidateSearch, setCandidateSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [filters, setFilters] = useState({
        search: '',
        dateRange: '',
        round: [] as string[],
        status: [] as string[],
        startDate: '',
        endDate: ''
    });

    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        dateRange: '',
        round: [] as string[],
        status: [] as string[],
        startDate: '',
        endDate: ''
    });

    const { data: interviews = [], isLoading, error } = useQuery({
        queryKey: ['interviews', appliedFilters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (appliedFilters.search) params.append('search', appliedFilters.search);
            if (appliedFilters.round.length > 0) params.append('round', appliedFilters.round.join(','));
            if (appliedFilters.status.length > 0) params.append('status', appliedFilters.status.join(','));
            // if (appliedFilters.dateRange) {
            //     params.append('dateRange', appliedFilters.dateRange);

            //     if (appliedFilters.dateRange === 'custom') {
            //         params.append('startDate', appliedFilters.startDate);
            //         params.append('endDate', appliedFilters.endDate);
            //     }
            // }

             if(filters.dateRange !== "custom"){
                switch(filters.dateRange){
                    case "today":
                        params.append('startDate', new Date().toISOString());
                        params.append('endDate', new Date().toISOString());
                        break;
                    case "yesterday":
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        params.append('startDate', yesterday.toISOString().split('T')[0]);
                        params.append('endDate', yesterday.toISOString().split('T')[0]);
                        break;
                   
                    default:
                        break;
                }
            }
            const queryString = params.toString(); 

            if (queryString) {
                return interviewFilterApi(queryString);
            }

            return getInterviewsApi();
        }
    });

    const applyFilters = () => {
        setAppliedFilters(filters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            search: '',
            dateRange: '',
            round: [],
            status: [],
            startDate: '',
            endDate: ''
        };
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
    };

    const [newInterview, setNewInterview] = useState<{
        interviewer?: string;
        candidate?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
        status?: 'pending' | 'passed' | 'failed';
        interviewRound?: string;
        meetingLink?: string;
    }>({
        interviewer: '',
        candidate: '',
        date: '',
        startTime: '',
        endTime: '',
        status: 'pending',
        interviewRound: '',
        meetingLink: ''
    });



    const {
        data: usersData,
        fetchNextPage: fetchNextUsers,
        hasNextPage: hasMoreUsers,
        isFetchingNextPage: loadingUsers,
    } = useInfiniteQuery({
        queryKey: ["users-paginated", userSearch],
        queryFn: ({ pageParam }) => fetchUsersPaginated({ pageParam, search: userSearch }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage?.nextPage ?? undefined,
    });

    const userOptions = React.useMemo(() => {
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

    const { data: interviewRounds = [] } = useQuery({
        queryKey: ['interviewRounds'],
        queryFn: interviewRoundsApi
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["candidates-paginated", candidateSearch],
        queryFn: ({ pageParam }) => fetchCandidatesPaginated({ pageParam, search: candidateSearch }),
        getNextPageParam: (lastPage) => {
            return lastPage?.nextPage ?? undefined;
        },
        initialPageParam: 1,
    });

    const candidateOptions = React.useMemo(() => {
        if (!data?.pages) return [];

        return data.pages.flatMap((page: any) =>
            Array.isArray(page?.data)
                ? page.data.map((c: any) => ({
                    value: c.fullName,
                    label: c.fullName,
                    mail: c.email
                }))
                : []
        );
    }, [data]);

    const flattenedCandidates = React.useMemo(() => {
        const pages = data?.pages ?? [];
        const flat = pages.flatMap((p: any) => Array.isArray(p?.data) ? p.data : []);
        return flat.length > 0 ? flat : [];
    }, [data]);

    const addMutation = useMutation({
        mutationFn: addInterviewApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interviews'] });
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
            queryClient.invalidateQueries({ queryKey: ['interviews'] });
            setEditModalOpen(false);
            setSelectedInterview(null);
            toast({
                title: "Interview updated successfully",
                description: "Interview updated successfully",
                variant: "default"
            })
        },
        onError: (error: any) => {            
            toast({
                title: "Error updating interview",
                description: error?.response?.data?.error?.message || error?.message || "Retry to add review",
                variant: "destructive"
            })
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInterviewApi,
        onSuccess: () => {
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

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getStatusColor = (status: 'pending' | 'passed' | 'failed') => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            passed: "bg-green-200 text-green-800",
            failed: "bg-red-200 text-red-800",
        };
        return colors[status];
    };

    const handleViewInterview = (interview: Interview) => {
        setSelectedInterview(interview);
        setViewModalOpen(true);
    };

    const handleEditInterview = (interview: Interview) => {       
        setSelectedInterview(interview);
        setEditModalOpen(true);
    };

    const handleAddReview = (interview: Interview) => {
        setSelectedInterview(interview);        
        setReviewData({
            score: interview.review?.score?.toString() || '',
            feedback: interview.review?.feedback || '',
            status: interview.status
        });
        setReviewModalOpen(true);
    };

    const handleDeleteInterview = (interview: Interview) => {
        setSelectedInterview(interview);
        setDeleteModalOpen(true);
    };

    const handleScoreChange = (score: string) => {
        const numScore = parseInt(score);
        const newStatus = numScore >= 5 ? 'passed' : 'failed';
        setReviewData({ ...reviewData, score, status: newStatus });
    };

    const saveReview = () => {
        if (selectedInterview) {
            const updatedInterview: any = {
                ...selectedInterview,
                candidate: selectedInterview.candidate.fullName,
                candidateId: selectedInterview.candidate.id,
                review: {
                    score: parseInt(reviewData.score),
                    feedback: reviewData.feedback,
                },
                status: reviewData.status as 'pending' | 'passed' | 'failed',
                meetingLink: selectedInterview.meetingLink || ''
            };           
            updateMutation.mutate(updatedInterview);
            setReviewModalOpen(false);
        }
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
            const interviewData: any = {
                ...newInterview,
                startTime: convertTo12Hour(newInterview.startTime!),
                endTime: convertTo12Hour(newInterview.endTime!),
                candidateId: flattenedCandidates.find((c: any) => c.fullName === newInterview.candidate)?.id
            };
            if (newInterview.meetingLink && newInterview.meetingLink.trim() !== '') {
                interviewData.meetingLink = newInterview.meetingLink;
            }
            
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
                    candidateId: selectedInterview.candidate?.id,
                    date: selectedInterview.date || '',
                    startTime: selectedInterview.startTime?.includes('AM') || selectedInterview.startTime?.includes('PM')
                        ? selectedInterview.startTime
                        : convertTo12Hour(selectedInterview.startTime || ''),
                    endTime: selectedInterview.endTime?.includes('AM') || selectedInterview.endTime?.includes('PM')
                        ? selectedInterview.endTime
                        : convertTo12Hour(selectedInterview.endTime || ''),
                    interviewRound: selectedInterview.interviewRound || '',
                    candidate: selectedInterview.candidate.fullName || '',
                    meetingLink: selectedInterview.meetingLink || '',
                    status: selectedInterview.status
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

    const interviewsArray = Array.isArray(interviews) ? interviews : [];
    const totalPages = Math.ceil(interviewsArray.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <MainLayout
            userRole={user.role}
            pageTitle="Interviews"
            userName={user.name}
            onLogout={handleLogout}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Interviews</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and schedule interviews
                    </p>
                </div>
                <button onClick={() => setScheduleModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
                    <Plus size={18} />
                    Schedule Interview
                </button>
            </div>

            <div className="p-4">
                <h1 className='font-semibold text-[24px] pb-4'>Filters</h1>

                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 w-[100px]">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                size={18}
                            />
                            <input
                                type="text"
                                name='search'
                                placeholder="Search by candidate name, email and phone number..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full rounded-xl bg-white px-10 py-2.5 text-sm shadow-sm border focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>
                    <div className="w-[350px] relative">
                        <Select
                            value={filters.dateRange}
                            onValueChange={(value) =>
                                setFilters({ ...filters, dateRange: value })
                                // if(value !== "custom"){
                                //     setFilters({ ...filters, startDate: e.target.value })
                                // }
                            }
                        >
                            <SelectTrigger className="rounded-xl bg-white shadow-sm">
                                <SelectValue placeholder="Select date range..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="tw">This Week</SelectItem>
                                <SelectItem value="lw">Last Week</SelectItem>
                                <SelectItem value="nw">Next Week</SelectItem>
                                <SelectItem value="custom">Select Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Floating Custom Date Panel */}
                        {filters.dateRange === "custom" && (
                            <div className="absolute left-0 top-[48px] z-50 w-full">
                                <div className="rounded-lg border bg-white p-3 shadow-lg">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                From
                                            </label>
                                            <input
                                                type="date"
                                                value={filters.startDate}
                                                onChange={(e) =>
                                                    setFilters({ ...filters, startDate: e.target.value })
                                                }
                                                className="w-full rounded-md border px-2 py-1.5 text-sm"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                To
                                            </label>
                                            <input
                                                type="date"
                                                value={filters.endDate}
                                                onChange={(e) =>
                                                    setFilters({ ...filters, endDate: e.target.value })
                                                }
                                                className="w-full rounded-md border px-2 py-1.5 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>



                    <div className="min-w-[200px]">
                        <SimpleMultiSelect
                            options={Array.isArray(interviewRounds) ? interviewRounds.map((round: any) => (
                                {
                                value: round.name.trim(),
                                label: round.name.trim()
                            })) : []}
                            selected={filters.round}
                            onSelectionChange={(selected) => setFilters({ ...filters, round: selected })}
                            placeholder="Select rounds..."
                            className="w-full rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm"
                        />
                    </div>
                    <div className="min-w-[200px]">
                        <SimpleMultiSelect
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'passed', label: 'Passed' },
                                { value: 'failed', label: 'Failed' }
                            ]}
                            selected={filters.status}
                            onSelectionChange={(selected) => setFilters({ ...filters, status: selected })}
                            placeholder="Select status..."
                            className="w-full rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={applyFilters}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-primary/90 hover:shadow-lg"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="rounded-xl border px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-muted"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-card">
                    <div className="py-9 px-4">
                        <h2 className="text-2xl font-semibold text-foreground">Scheduled Interviews</h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-card py-4">
                        {isLoading ? (
                            <div className="text-center py-8">
                                <p>Loading interviews...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-600">
                                <p>Error loading interviews</p>
                            </div>
                        ) : interviewsArray.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg font-medium mb-2">No interviews scheduled</p>
                                <p>Start by scheduling your first interview</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-border">
                                            <TableHead className="text-left py-3 px-4 font-semibold text-foreground">Candidate</TableHead>
                                            <TableHead className="text-left py-3 px-4 font-semibold text-foreground">Phone</TableHead>
                                            <TableHead className="text-left py-3 px-4 font-semibold text-foreground">Interviewer</TableHead>
                                            <TableHead className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</TableHead>
                                            <TableHead className="text-left py-3 px-4 font-semibold text-foreground">Round</TableHead>
                                            <TableHead className="text-left py-3 px-4 font-semibold text-foreground">Status</TableHead>
                                            <TableHead className="text-left py-3 px-4 font-semibold text-foreground">Score</TableHead>
                                            <TableHead className="text-left py-3 px-4 font-semibold text-foreground">Feedback</TableHead>
                                            <TableHead className="text-center py-3 px-4 font-semibold text-foreground">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {interviewsArray.slice(startIndex, startIndex + itemsPerPage).map((interview) => (
                                            <TableRow key={interview.id} className="border-b border-border">
                                                <TableCell className="py-4 px-4 text-foreground font-medium ">
                                                    {interview.candidate.fullName}<br />
                                                    <span className="text-sm text-muted-foreground">{interview.candidate.email}</span>
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-foreground">{interview.candidate.phone}</TableCell>
                                                <TableCell className="py-4 px-4 text-foreground">{interview.interviewer}</TableCell>
                                                <TableCell className="py-4 px-4 text-muted-foreground">
                                                    {interview.date}<br />
                                                    <span className="text-sm">{interview.startTime} - {interview.endTime}</span>
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-foreground">{interview.interviewRound}</TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <span className={`inline-block px-4 py-1 rounded-full text-[13px] font-semibold ${getStatusColor(interview.status)}`}>
                                                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-foreground font-medium">
                                                    {interview.review?.score ?? '-'}
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-foreground">
                                                    {interview.review?.feedback
                                                        ? interview.review.feedback.length > 30
                                                            ? interview.review.feedback.substring(0, 30) + "..."
                                                            : interview.review.feedback
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="py-4 px-4 text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white data-[state=open]:bg-blue-600 data-[state=open]:text-white focus:outline-none transition-colors">
                                                                <MoreVertical size={18} />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewInterview(interview)}>
                                                                <Eye size={16} className="mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditInterview(interview)}>
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

                                                            {interview.status === 'pending' && (
                                                                <DropdownMenuItem onClick={() => handleDeleteInterview(interview)} className="text-red-600">
                                                                    <Trash2 size={16} className="mr-2" />
                                                                    Cancel Interview
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(page)}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedule Modal */}
                <Dialog
                    isOpen={scheduleModalOpen}
                    onClose={() => setScheduleModalOpen(false)}
                    title="Schedule Interview"
                    size="lg"
                >
                    <div className="space-y-6">
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
                                    onSearch={setUserSearch}
                                    className="w-full px-4 py-6 border border-border rounded-xl bg-white shadow-sm"
                                />

                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">Candidate</label>
                                <SearchableSelect
                                    options={candidateOptions}
                                    value={newInterview.candidate || ""}
                                    onValueChange={(value) =>
                                        setNewInterview({ ...newInterview, candidate: value })
                                    }
                                    placeholder="Select Candidate"
                                    onLoadMore={fetchNextPage}
                                    hasMore={hasNextPage}
                                    loading={isFetchingNextPage}
                                    onSearch={setCandidateSearch}
                                     className="w-full px-4 py-6 border border-border rounded-xl bg-white shadow-sm"
                                />



                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">Date</label>
                                <input
                                    type="date"
                                    value={newInterview.date || ''}
                                    min={new Date().toISOString().split('T')[0]}
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
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Meeting Link</label>
                            <input
                                type="url"
                                value={newInterview.meetingLink || ''}
                                placeholder="https://www.example.com"
                                onChange={(e) => setNewInterview({ ...newInterview, meetingLink: e.target.value })}
                                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                            />
                        </div>
                        <div className="flex justify-end gap-4 pt-4 border-t border-border">
                            <button
                                onClick={() => setScheduleModalOpen(false)}
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
                </Dialog>

                {/* View Modal */}
                <Dialog
                    isOpen={viewModalOpen}
                    onClose={() => setViewModalOpen(false)}
                    title="Interview Details"
                    size="lg"
                >
                    {selectedInterview && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-muted-foreground">Candidate</label>
                                    <p className="text-lg font-medium text-foreground">{selectedInterview.candidate?.fullName}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                                    <p className="text-lg font-medium text-foreground">{selectedInterview.candidate?.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-muted-foreground">Email</label>
                                    <p className="text-lg font-medium text-foreground">{selectedInterview.candidate?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-muted-foreground">Interviewer</label>
                                    <p className="text-lg font-medium text-foreground">{selectedInterview.interviewer}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-muted-foreground">Date</label>
                                    <p className="text-lg font-medium text-foreground">{selectedInterview.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-muted-foreground">Time</label>
                                    <p className="text-lg font-medium text-foreground">{selectedInterview.startTime} - {selectedInterview.endTime}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-muted-foreground">Round</label>
                                    <p className="text-lg font-medium text-foreground">{selectedInterview.interviewRound}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-muted-foreground">Status</label>
                                    <span className={`block px-4 py-1 w-[40%] text-center rounded-full text-sm font-semibold ${getStatusColor(selectedInterview.status)}`}>
                                        {selectedInterview.status.charAt(0).toUpperCase() + selectedInterview.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            {selectedInterview.review?.score && (
                                <div className="space-y-1 pt-4 border-t border-border">
                                    <label className="text-sm font-semibold text-muted-foreground">Score</label>
                                    <p className="text-2xl font-bold text-foreground">{selectedInterview.review.score}/10</p>
                                </div>
                            )}
                            {selectedInterview.review?.feedback && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground">Feedback</label>
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <p className="text-foreground leading-relaxed">{selectedInterview.review.feedback}</p>
                                    </div>
                                </div>
                            )}
                            {selectedInterview.meetingLink && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground">Meeting Link</label>
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <p onClick={() => window.open(selectedInterview.meetingLink, "_blank")}>{selectedInterview.meetingLink}</p>
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
                        <div className="space-y-6">
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
                                        onSearch={setUserSearch}
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

                            <div className="flex justify-end gap-4 pt-4 border-t border-border">
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
                        <div className="space-y-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-foreground mb-2">
                                        Delete Interview?
                                    </p>
                                    <p className="text-muted-foreground">
                                        Are you sure you want to delete the interview with <span className="font-semibold text-foreground">{selectedInterview.candidate?.fullName}</span>?
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

                {/* Review Modal */}
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
                                    Review for {selectedInterview.candidate?.fullName}
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
};