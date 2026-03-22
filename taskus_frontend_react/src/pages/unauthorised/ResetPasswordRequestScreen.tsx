import { LandingBanner } from '@/components/layout/LandingBanner';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { userService } from '@/services/api';
import { AxiosError } from 'axios';

export const ResetPasswordRequestScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await userService.requestPasswordReset(email);
      
      toast.success('Password reset email sent! Check your inbox.');
      navigate('/login');
      
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.error;
        if (message) {
          toast.error(message);
        } else {
          toast.error('Failed to send reset email. Please try again.');
        }
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <LandingBanner />

      <div className="w-full md:w-1/2 h-[50vh] md:min-h-screen flex flex-col justify-center items-center px-8 md:px-16 py-6 md:py-12">
        <div className="w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 md:mb-6">
              Forgot Password
            </h1>
            <p className="text-sm md:text-base text-foreground mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col space-y-6">
            <div className="w-full flex flex-col space-y-2">
              <label htmlFor="email" className="text-foreground font-thin text-left">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-2 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="w-full flex justify-center pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-3/5 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
          <div className="text-center text-foreground pt-4">
            <p>
              Remember your password?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:text-[hsl(193,95%,68%)] hover:underline transition-colors font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};