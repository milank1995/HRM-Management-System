import axios from "axios";


export const createUserApi = async (data: any) => {
    const res = await axios.post(`http://localhost:4000/api/user/create-user`, data);
    return res.data;
};

export const updateUserApi = async(data: any) => {
    const res = await axios.put(`http://localhost:4000/api/user/update-user/${data.id}`, data);
    return res.data;
}   

export const deleteUserApi = async (id: any) => {
    const res = await axios.delete(`http://localhost:4000/api/user/delete-user/${id}`);
    return res.data;
}

export const fetchCandidateById = async (id: any) => {
    const res = await axios.get(`http://localhost:4000/api/candidate/get-candidate/${id}`);
    return res.data;
};

export const fetchCandidatesPaginated = async ({ pageParam = 1, search = "" }) => {
    const params = new URLSearchParams();
    params.append("page", String(pageParam));
    params.append("limit", "10");
    if (search) {
        params.append("search", search);
    }
    console.log(params);
    
    
    const res = await fetch(
        `http://localhost:4000/api/candidate/paginate-searchable?${params.toString()}`
    );
    const json = await res.json();
    return {
        data: json.data ?? [],
        total: json.total ?? 0,
        nextPage: json.nextPage ?? null,
    };
};

export const candidateFilterApi = async (data: any) => {
    const res = await axios.get(`http://localhost:4000/api/candidate/filter?${data}`);
    return res.data;
}

export const skillsApi = async () => {
    const response = await axios.get(`http://localhost:4000/api/skills/get-skill`);
    return response.data.skills;
}

export const positionsApi = async () => {
    const response = await axios.get(`http://localhost:4000/api/positions/get-position`);
    return response.data.positions;
}

export const interviewRoundsApi = async () => {
    const response = await axios.get(`http://localhost:4000/api/interview-round/get-interview-round`);
    return response.data.interviewRounds;
}

export const addInterviewRoundApi = async (data: any) => {
    const response = await axios.post(`http://localhost:4000/api/interview-round/add-interview-round`, data);
    return response.data;
}

export const getInterviewsApi = async () => {
    const response = await axios.get(`http://localhost:4000/api/interview/get-interview`);
    return response.data.interviews;
}

export const getInterviewsByCandidateId = async (candidateId: string) => {
    const response = await axios.get(`http://localhost:4000/api/interview/get-interview-by-candidate-id/${candidateId}`);
    return response.data;
}

export const addInterviewApi = async (interview: any) => {
    const response = await axios.post(`http://localhost:4000/api/interview/add-interview`, interview);
    return response.data;
}

export const updateInterviewApi = async (interview: any) => {    
    const response = await axios.put(`http://localhost:4000/api/interview/update-interview/${interview.id}`, interview);
    return response.data.message;
}

export const deleteInterviewApi = async (id: number) => {
    const response = await axios.delete(`http://localhost:4000/api/interview/delete-interview/${id}`);
    return response.data.message;
}

export const interviewFilterApi = async (data: any) => {
    const response = await axios.get(`http://localhost:4000/api/interview/interview-filter?${data}`);    
    return response.data;
}

export const fetchUsersPaginated = async ({ pageParam = 1, search = "" }) => {
    const params = new URLSearchParams();
    params.append("page", String(pageParam));
    params.append("limit", "10");
    if (search) {
        params.append("search", search);
    }
    
    const res = await fetch(
        `http://localhost:4000/api/user/get-user?${params.toString()}`
    );
    const json = await res.json();
    if (!res.ok) {
        throw new Error("Failed to fetch users");
    }
    return {
        data: json.data ?? [],
        total: json.total ?? 0,
        nextPage: json.nextPage ?? null,
    };
};
