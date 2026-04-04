import { LandingBanner } from '@/components/layout/LandingBanner';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { userService } from '@/services/api';
import { AxiosError } from 'axios';

export const ResetPasswordScreen = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    if (newPassword !== repeatPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    try {
      await userService.resetPassword(token, newPassword);
      toast.success('Password reset successful! You can now log in.');
      navigate('/login');
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.error;
        if (message) {
          toast.error(message);
        } else {
          toast.error('Failed to reset password. The link may have expired.');
        }
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <LandingBanner />

      <div className="w-full md:w-1/2 h-[60vh] md:min-h-screen flex flex-col justify-center items-center px-8 md:px-16 py-6 md:py-12">
        <div className="w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 md:mb-6">
              Reset Password
            </h1>
            <p className="text-sm md:text-base text-foreground mb-4">
              Enter your new password below.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col space-y-3">
            <div className="w-full flex flex-col space-y-2">
              <label htmlFor="newPassword" className="text-foreground font-thin text-left">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your new password"
                required
                disabled={isLoading}
              />
            </div>
            <div className="w-full flex flex-col space-y-2">
              <label htmlFor="repeatPassword" className="text-foreground font-thin text-left">
                Repeat Password
              </label>
              <input
                id="repeatPassword"
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Repeat your new password"
                required
                disabled={isLoading}
              />
            </div>
            <div className="w-full flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-3/5 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
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