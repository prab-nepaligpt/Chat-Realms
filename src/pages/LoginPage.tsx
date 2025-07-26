import { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/groups', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const validateForm = () => {
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError("Please enter your name");
        return false;
      }
      
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          navigate('/groups');
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Handle signup logic
        console.log("Signing up with:", { name, email, password });
        setError("Signup is not implemented yet.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setError("");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800">
        <h1 className="text-3xl font-extrabold text-center mb-8 text-white">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm text-gray-300 mb-2">
                Full Name
              </label>
              <div className="flex items-center bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <div className="px-3 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none 
                           [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:text-white
                           [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111827_inset]
                           [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-2">
              Email
            </label>
            <div className="flex items-center bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <div className="px-3 text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none 
                         [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:text-white
                         [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111827_inset]
                         [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-2">
              Password
            </label>
            <div className="flex items-center bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <div className="px-3 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none
                         [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:text-white
                         [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111827_inset]
                         [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="flex items-center bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <div className="px-3 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none
                           [&:-webkit-autofill]:!bg-transparent [&:-webkit-autofill]:text-white
                           [&:-webkit-autofill]:shadow-[0_0_0_1000px_#111827_inset]
                           [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  placeholder="Confirm Password"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="px-3 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full !bg-blue-600 hover:!bg-blue-700 disabled:!bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl hover:shadow-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? "Signing In..." : "Creating Account..."}
              </div>
            ) : (
              isLogin ? "SIGN IN" : "CREATE ACCOUNT"
            )}
          </button>

          <button
            type="button"
            onClick={toggleMode}
            className="w-full text-center text-sm text-gray-400 hover:text-blue-400 transition-all !bg-transparent !border-0 focus:outline-none focus:ring-0"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}; 