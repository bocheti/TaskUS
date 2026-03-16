import { Github, Linkedin } from 'lucide-react';
import BannerLogo from '@/assets/bannerLogo.svg';

export const LandingBanner = () => {
  const handleGithubClick = () => {
    window.open('https://github.com/bocheti', '_blank');
  };

  const handleLinkedinClick = () => {
    window.open('https://linkedin.com/in/salvadorespinosamerino', '_blank');
  };

  return (
    <div className="w-1/2 min-h-screen bg-banner-bg flex flex-col justify-between px-36 py-2">
      {/* Logo and Slogan - centered */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="mb-6">
          <img src={BannerLogo} alt="TaskUS Logo" className="w-auto" />
        </div>
        
        <p className="text-4xl text-center text-foreground py-4">
          Make task managing <span className="text-[hsl(193,95%,68%)]">easier</span>
        </p>
      </div>

      {/* Footer - centered, inline */}
      <div className="flex justify-center gap-2">
        <p className="text-sm text-foreground">
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