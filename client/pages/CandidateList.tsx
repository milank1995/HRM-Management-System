import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Plus, Search, Eye } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { SimpleMultiSelect } from "@/components/ui/simple-multi-select";
import { useQuery } from "@tanstack/react-query";
import { candidateFilterApi, skillsApi, positionsApi, fetchCandidatesPaginated } from "@/lib/api";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ca } from "zod/v4/locales";

export default function CandidateList() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "Admin";
  const userRole = user.userType || "admin";

  const [filters, setFilters] = useState({
    search: "",
    position: [] as string[],
    skill: [] as string[],
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const applyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const empty = { search: "", position: [], skill: [] };
    setFilters(empty);
    setAppliedFilters(empty);
    setCurrentPage(1);
  };

  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ["candidates", currentPage, appliedFilters],

    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", String(itemsPerPage));

      if (appliedFilters.search)
        params.append("search", appliedFilters.search);

      if (appliedFilters.position.length)
        params.append("position", appliedFilters.position.join(","));

      if (appliedFilters.skill.length)
        params.append("skill", appliedFilters.skill.join(","));

      const hasFilters =
        appliedFilters.search ||
        appliedFilters.position.length > 0 ||
        appliedFilters.skill.length > 0;

      return hasFilters
        ? candidateFilterApi(params.toString())
        : fetchCandidatesPaginated({ pageParam: currentPage });
    },
    placeholderData: (previousData) => previousData,
  });

  const candidatesArray = Array.isArray(candidatesData?.data)
    ? candidatesData.data
    : [];

  const total = candidatesData?.total ?? 0;
  const totalPages = Math.ceil(total / itemsPerPage);
  const hasNextPage = candidatesData?.nextPage !== null;


  const { data: skillsData = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: skillsApi,
  });

  const { data: positionsData = [] } = useQuery({
    queryKey: ["positions"],
    queryFn: positionsApi,
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <MainLayout
      userRole={userRole as "admin" | "hr"}
      pageTitle="Candidates"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all job candidates
            </p>
          </div>
          <Link
            to="/candidate/add"
            className="w-[175px] h-12 text-white flex items-center justify-center shadow-xl bg-blue-500 rounded-md"
          >
            <Plus size={28} />
            Add Candidate
          </Link>
        </div>

        <div className="p-4">
          <h2 className="font-semibold text-[24px] pb-4">Filters</h2>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[260px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by candidate name and email..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full rounded-xl bg-white px-10 py-2.5 text-sm shadow-sm border focus:outline-none"
                />
              </div>
            </div>

            <div className="min-w-[200px]">
              <SimpleMultiSelect
                options={positionsData.map((p: any) => ({
                  value: p.name || p,
                  label: p.name || p,
                }))}
                selected={filters.position}
                onSelectionChange={(selected) =>
                  setFilters({ ...filters, position: selected })
                }
                placeholder="Select positions..."
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm"
              />
            </div>

            <div className="min-w-[200px]">
              <SimpleMultiSelect
                options={skillsData.map((s: any) => ({
                  value: s.name || s,
                  label: s.name || s,
                }))}
                selected={filters.skill}
                onSelectionChange={(selected) =>
                  setFilters({ ...filters, skill: selected })
                }
                placeholder="Select skills..."
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-md"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="rounded-xl border px-4 py-2.5 text-sm text-muted-foreground"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-card p-6 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!isLoading &&
                candidatesArray.map((candidate: any) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      {candidate.fullName}
                    </TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.phone}</TableCell>
                    <TableCell>
                      {candidate.appliedPosition?.[0]?.name || "No position"}
                    </TableCell>
                    <TableCell>
                      {candidate.totalExperience} years
                    </TableCell>
                    <TableCell>
                      {candidate.skills?.slice(0, 2).map((s: any) => (
                        <span
                          key={s.id}
                          className="inline-block px-2 py-1 bg-slate-200 text-xs rounded-full mr-1"
                        >
                          {s.name}
                        </span>
                      ))}

                      {candidate.skills?.length > 2 && (
                        <span className="inline-block px-2 py-1 bg-slate-200 text-xs rounded-full mr-1">
                          +{candidate.skills.length - 2}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>{candidate.addBy || "N/A"}</TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/candidate/${candidate.id}`}
                        className="inline-flex items-center gap-2 text-primary"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {candidatesArray.length === 0 && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              No candidates found
            </div>
          )}
        </div>



        {
          totalPages > 1 && (
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
          )
        }
      </div>
    </MainLayout>
  );
}
