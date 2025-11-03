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
  const [description, setDescription] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register, isAuthenticated } = useAuth();
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
      if (!description.trim()) {
        setError("Please enter a short description");
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
        const success = await register({ name, email, password, description });
        if (success) {
          navigate('/groups');
        } else {
          setError('Registration failed. Please try again.');
        }
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
    setDescription("");
    setError("");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main Container - Glass Effect */}
      <div className="w-full max-w-6xl bg-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden flex flex-col lg:flex-row relative z-10 ring-1 ring-white/10">
        {/* Left Side - Branding & Visual */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600/90 via-teal-600/90 to-cyan-600/90 backdrop-blur-xl p-12 flex-col justify-between relative overflow-hidden border-r border-white/30">
          {/* Animated Background Circles */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          
          <div className="relative z-10">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Welcome to<br/>
              <span className="text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">ChatRealms</span>
            </h1>
            <p className="text-emerald-50 text-lg leading-relaxed">
              Connect, communicate, and collaborate in real-time. Experience seamless messaging with your team and friends.
            </p>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Lightning Fast</h3>
                <p className="text-emerald-100 text-sm">Real-time messaging with instant delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Secure & Private</h3>
                <p className="text-emerald-100 text-sm">Your conversations are protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8 bg-white/5 backdrop-blur-xl overflow-y-auto max-h-screen">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold">
              <span className="text-emerald-400">Chat</span>
              <span className="text-white">Realms</span>
            </h1>
          </div>

          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {isLogin ? "Welcome Back!" : "Get Started"}
              </h2>
              <p className="text-gray-300 text-sm">
                {isLogin ? "Sign in to continue to ChatRealms" : "Create your account to join ChatRealms"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-xl border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-100 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:border-emerald-400 transition-all"
                        placeholder="John Doe"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:border-emerald-400 transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="animate-fadeIn">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
                    About You
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:border-emerald-400 transition-all resize-none"
                    placeholder="Tell us a little about yourself..."
                    required={!isLogin}
                  />
                </div>
              )}

              {isLogin && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:border-emerald-400 transition-all"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
              )}

              <div className={!isLogin ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:border-emerald-400 transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="animate-fadeIn">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:border-emerald-400 transition-all"
                        placeholder="Confirm your password"
                        required={!isLogin}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-400 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : (
                  <span className="text-lg">{isLogin ? "Sign In" : "Create Account"}</span>
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="text-emerald-400 font-semibold">{isLogin ? "Sign Up" : "Sign In"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 