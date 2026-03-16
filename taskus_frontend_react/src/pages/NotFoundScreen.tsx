import { Link } from 'react-router-dom';

export const NotFoundScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The page you're looking for doesn't exist
        </p>
        <Link 
          to="/" 
          className="text-primary hover:underline text-lg"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};