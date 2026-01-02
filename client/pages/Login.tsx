import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Building2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";


export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: { email: string; password: string }) => {
    return axios.post("http://localhost:4000/api/user/login", userData)
      .then((loginRes) => {
        const { token } = loginRes.data;
        return axios.get("http://localhost:4000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((profileRes) => {
            const user = {
              email: profileRes.data.decoded.email,
              role: profileRes.data.decoded.role,
              name: profileRes.data.decoded.name,
              token: token
            };

            localStorage.setItem("user", JSON.stringify(user));
             return { success: true, user };
          })
          .catch((error) => {
            throw new Error(error.response?.data?.error || "Profile fetch failed");
          });
      })
      .catch((error) => {
        throw new Error(error.response?.data?.error || "Login failed");
      });
  };

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
      });
      
      // Use the user data directly from the mutation result
      const { user } = data;
      navigate(user.role === "admin" ? "/admin/dashboard" : "/hr/dashboard");
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    mutation.mutate(credentials);

    // Simulate login delay
    // setTimeout(() => {
    //   // Store user info in localStorage for demo
    //   localStorage.setItem(
    //     "user",
    //     JSON.stringify({ email: credentials.email, userType, name: "User" })
    //   );
    //
    //   // Navigate based on user type
    //   if (userType === "admin") {
    //     navigate("/admin/dashboard");
    //   } else if (userType === "hr") {
    //     navigate("/hr/dashboard");
    //   } else {
    //     navigate("/interviewer/dashboard");
    //   }
    //   setIsLoading(false);
    // }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary opacity-10 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Building2 size={28} className="text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-foreground">HRM</h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Sign in to your account
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* User Type Selection */}
            {/*<div className="grid grid-cols-3 gap-2">*/}
            {/*  <button*/}
            {/*    type="button"*/}
            {/*    onClick={() => setUserType("admin")}*/}
            {/*    className={`py-3 px-2 rounded-lg font-medium transition-all duration-200 text-sm ${*/}
            {/*      userType === "admin"*/}
            {/*        ? "bg-primary text-white shadow-lg"*/}
            {/*        : "bg-muted text-foreground hover:bg-slate-200"*/}
            {/*    }`}*/}
            {/*  >*/}
            {/*    Admin*/}
            {/*  </button>*/}
            {/*  <button*/}
            {/*    type="button"*/}
            {/*    onClick={() => setUserType("hr")}*/}
            {/*    className={`py-3 px-2 rounded-lg font-medium transition-all duration-200 text-sm ${*/}
            {/*      userType === "hr"*/}
            {/*        ? "bg-secondary text-white shadow-lg"*/}
            {/*        : "bg-muted text-foreground hover:bg-slate-200"*/}
            {/*    }`}*/}
            {/*  >*/}
            {/*    HR User*/}
            {/*  </button>*/}
            {/*  <button*/}
            {/*    type="button"*/}
            {/*    onClick={() => setUserType("interviewer")}*/}
            {/*    className={`py-3 px-2 rounded-lg font-medium transition-all duration-200 text-sm ${*/}
            {/*      userType === "interviewer"*/}
            {/*        ? "bg-cyan-500 text-white shadow-lg"*/}
            {/*        : "bg-muted text-foreground hover:bg-slate-200"*/}
            {/*    }`}*/}
            {/*  >*/}
            {/*    Interviewer*/}
            {/*  </button>*/}
            {/*</div>*/}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-foreground">Remember me</span>
              </label>
              <a href="/login" className="text-primary hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200
              bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary shadow-lg
               ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-slate-700">
              <strong>Demo Mode:</strong> Use any email and password to login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



//                ${
//                 userType === "admin"
//                   ? "bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg"
//                   : "bg-gradient-to-r from-secondary to-secondary/90 hover:shadow-lg"
//               }