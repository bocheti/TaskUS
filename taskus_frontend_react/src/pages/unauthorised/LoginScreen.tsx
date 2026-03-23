import { LandingBanner } from '@/components/layout/LandingBanner';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await login({ email, password }); 
    toast.success('Login successful!');
    navigate('/dashboard');
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.error;
      if (status === 401 || status === 403) {
        toast.error('Invalid email or password');
      } else if (message) {
        toast.error(message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } else {
      toast.error('Login failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <LandingBanner />

      <div className="w-full md:w-1/2 h-[60vh] md:min-h-screen flex flex-col justify-center items-center px-8 md:px-16 py-6 md:py-12">
        <div className="w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 md:mb-6">
              Log in
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="pt-0 md:pt-8 max-w-md mx-auto flex flex-col space-y-6">
            <div className="w-full flex flex-col space-y-2">
              <label htmlFor="email" className="text-foreground font-thin text-left">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="w-full flex flex-col space-y-2">
              <label htmlFor="password" className="text-foreground font-thin text-left">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <div className="text-right">
                <Link 
                  to="/reset-password-request" 
                  className="text-xs text-primary hover:text-[hsl(193,95%,68%)] hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="w-full flex justify-center pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-3/5 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>
          <div className="text-center text-foreground pt-2 md:pt-8">
            <p className="mb-2">
              Don't have an account?{' '}
              <Link 
                to="/request" 
                className="text-primary hover:text-[hsl(193,95%,68%)] hover:underline transition-colors font-medium"
              >
                Request an account
              </Link>
            </p>
            <p>
              Are you a business?{' '}
              <Link 
                to="/create-org" 
                className="text-primary hover:text-[hsl(193,95%,68%)] hover:underline transition-colors font-medium"
              >
                Create an organisation
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};