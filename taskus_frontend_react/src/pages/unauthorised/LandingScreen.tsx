import { LandingBanner } from '@/components/layout/LandingBanner';
import { Link } from 'react-router-dom';

export const LandingScreen = () => {
  return (
    <div className="flex min-h-screen">
      <LandingBanner />

      <div className="w-1/2 min-h-screen bg-mutd flex flex-col justify-center items-center px-16 py-12">
        <div className="w-full space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Welcome to Taskus!
            </h1>
            <p className="text-lg text-foreground leading-relaxed px-4">
              Your new favourite task manager. No nonsense, no complications, 
            </p>
            <p className="text-lg text-foreground leading-relaxed px-4">
              no useless features. Just straightforward task management 
            </p>
            <p className="text-lg text-foreground leading-relaxed px-4">
              for straightforward businesses.
            </p>
          </div>

          <div className="pt-8 max-w-md mx-auto flex flex-col items-center space-y-6">
            <div className="w-full flex flex-col items-center space-y-2">
              <p className="text-center text-foreground font-thin">
                Do you already have an account?
              </p>
              <Link 
                to="/login"
                className="w-3/5 bg-primary text-primary-foreground text-center py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Log in
              </Link>
            </div>

            <div className="w-full flex flex-col items-center space-y-2">
              <p className="text-center text-foreground font-thin">
                Don't have an account?
              </p>
              <Link 
                to="/request"
                className="w-3/5 bg-primary text-primary-foreground text-center py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Request Account
              </Link>
            </div>

            <div className="w-full flex flex-col items-center space-y-2">
              <p className="text-center text-foreground font-thin">
                Are you a business?
              </p>
              <Link 
                to="/create-org"
                className="w-3/5 bg-primary text-primary-foreground text-center py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Create Organisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};