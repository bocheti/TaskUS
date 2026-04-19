import { Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import BannerLogo2 from '@/assets/bannerLogo2.svg';

export const LandingBanner = () => {
  const handleGithubClick = () => {
    window.open('https://github.com/bocheti', '_blank');
  };

  const handleLinkedinClick = () => {
    window.open('https://linkedin.com/in/salvadorespinosamerino', '_blank');
  };

  return (
    <div className="w-full md:w-1/2 h-[50vh] md:min-h-screen bg-banner-bg flex flex-col justify-between px-8 md:px-[8%] py-8 md:py-2 mb-4 md:mb-0">
      <div className="flex-1 flex flex-col justify-center items-center">
        <Link to="/" className="mb-6 w-11/12 md:w-auto max-h-[25vh] md:max-h-none">
          <img 
            src={BannerLogo2} 
            alt="TaskUS Logo" 
            className="w-full h-auto max-h-[25vh] md:max-h-none object-contain cursor-pointer hover:opacity-90 transition-opacity" 
          />
        </Link>
      </div>
      <div className="flex flex-row justify-center items-center gap-2">
        <p className="text-xs md:text-sm text-foreground text-center">
          Made By Salvador Ramón Espinosa Merino
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={handleGithubClick}
            className="text-foreground hover:text-[hsl(193,95%,68%)] transition-colors"
          >
            <Github size={20} />
          </button>
          <button
            onClick={handleLinkedinClick}
            className="text-foreground hover:text-[hsl(193,95%,68%)] transition-colors"
          >
            <Linkedin size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};