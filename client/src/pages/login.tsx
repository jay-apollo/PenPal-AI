import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { AuthForm } from "@/components/auth/auth-form";

function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const { login, register } = useAuth();
  const [, navigate] = useLocation();

  const handleSuccess = () => {
    navigate("/dashboard");
  };

  const toggleAuthMode = () => {
    setIsLoggingIn(!isLoggingIn);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - background image with gradient overlay */}
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center relative" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80')" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40">
          <div className="p-12 text-white flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 14h-6.5a2.5 2.5 0 0 0 0 5h5a2 2 0 0 0 0-4h-10a2 2 0 0 1 0-4h6.5"></path>
                  <path d="M9 18h10"></path>
                </svg>
                <h1 className="ml-3 text-2xl font-bold">PenPal AI</h1>
              </div>
              <div className="mt-16">
                <h2 className="text-3xl font-bold leading-tight">
                  {isLoggingIn
                    ? "Transform your sales outreach with personalized handwritten letters"
                    : "Join thousands of sales professionals using PenPal AI"}
                </h2>
                <p className="mt-6 text-lg text-white/80">
                  {isLoggingIn
                    ? "Connect with prospects on a personal level. Our AI-powered platform helps you create authentic handwritten correspondence at scale."
                    : "Our AI-powered platform helps you create authentic, personalized handwritten letters that get results."}
                </p>
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-center">
                <img 
                  src={isLoggingIn 
                    ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                  alt="Testimonial author" 
                  className="h-12 w-12 rounded-full object-cover" 
                />
                <div className="ml-4">
                  <p className="font-medium">
                    {isLoggingIn
                      ? '"PenPal AI has increased our response rates by 40%. The personalized touch makes all the difference."'
                      : '"We\'ve seen a 35% increase in response rates since implementing PenPal AI in our sales process."'}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    {isLoggingIn
                      ? "Michael Chen, Sales Director at TechGrowth"
                      : "Sarah Johnson, VP of Sales at GrowthLabs"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - login/signup form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center md:hidden mb-10">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 14h-6.5a2.5 2.5 0 0 0 0 5h5a2 2 0 0 0 0-4h-10a2 2 0 0 1 0-4h6.5"></path>
                <path d="M9 18h10"></path>
              </svg>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-neutral-900">PenPal AI</h2>
            <p className="mt-2 text-sm text-neutral-600">Personalized handwritten letters for sales professionals</p>
          </div>

          <AuthForm 
            mode={isLoggingIn ? 'login' : 'register'}
            onLogin={login}
            onRegister={register}
            onSuccess={handleSuccess}
            onToggleMode={toggleAuthMode}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
