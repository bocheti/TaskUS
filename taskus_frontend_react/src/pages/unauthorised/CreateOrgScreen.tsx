import { LandingBanner } from '@/components/layout/LandingBanner';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { organisationService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { AxiosError } from 'axios';

export const CreateOrgScreen = () => {
  const [orgName, setOrgName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setAuthData } = useAuth(); // ← Add this

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await organisationService.createOrganisation({
        organisationName: orgName,
        firstName,
        lastName,
        email,
        password,
      });
      setAuthData(response.authToken, response.userInfo);
      toast.success(`Organisation created successfully! Welcome, ${firstName} ${lastName}!`);
      navigate('/dashboard');
      
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.error;
        if (status === 409) {
          toast.error('An account with this email already exists');
        } else if (message) {
          toast.error(message);
        } else {
          toast.error('Failed to create organisation. Please try again.');
        }
      } else {
        toast.error('Failed to create organisation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <LandingBanner />

      <div className="w-full md:w-1/2 h-[75vh] md:min-h-screen flex flex-col justify-center items-center px-8 md:px-16 py-6">
        <div className="w-full space-y-1">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
              Create an Organisation
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col space-y-3">
            <div className="w-full flex flex-col space-y-2">
              <label htmlFor="orgName" className="text-foreground font-thin text-left">
                Organisation Name
              </label>
              <input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-background text-foreground px-4 py-3 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your organisation name"
                required
                disabled={isLoading}
              />
            </div>
            <div className='w-full flex flex-row space-x-2'>
              <div className="w-full flex flex-col space-y-2">
                <label htmlFor="firstName" className="text-foreground font-thin text-left">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-background text-foreground px-4 py-3 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="First name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="w-full flex flex-col space-y-2">
                <label htmlFor="lastName" className="text-foreground font-thin text-left">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-background text-foreground px-4 py-3 rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Last name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
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
                placeholder="Repeat your password"
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
                {isLoading ? 'Creating...' : 'Create Organisation'}
              </button>
            </div>
          </form>
          
          <div className="text-center text-foreground text-sm lg:text-lg pt-4">
            <p>
              Already have an account?{' '}
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