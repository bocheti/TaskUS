import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Github, Linkedin, Menu } from 'lucide-react';

interface AuthorizedLayoutProps {
  title: string;
  children: ReactNode;
}

export const AuthorizedLayout = ({ title, children }: AuthorizedLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleGithubClick = () => {
    window.open('https://github.com/bocheti', '_blank');
  };

  const handleLinkedinClick = () => {
    window.open('https://linkedin.com/in/salvadorespinosamerino', '_blank');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-muted text-foreground hover:bg-background transition-colors md:hidden"
      >
        <Menu size={24} />
      </button>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col p-4 md:p-8 md:pb-4 pt-16 md:pt-8 md:ml-48">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">{title}</h1>
                <hr className="border-border border-t-2" />
            </div>
            <div className="flex-1 bg-banner-bg rounded-2xl p-4 md:p-6 md:pb-4 relative flex flex-col">
                <div className="flex-1">
                    {children}
                </div>
                <div className="mt-4 md:mt-6 pt-3 md:pt-4 flex flex-row justify-center items-center gap-2">
                    <p className="text-xs text-foreground text-center">
                    Made By Salvador Ramón Espinosa Merino
                    </p>
                    
                    <div className="flex gap-3">
                    <button
                        onClick={handleGithubClick}
                        className="text-foreground hover:text-primary transition-colors"
                    >
                        <Github size={16} />
                    </button>
                    <button
                        onClick={handleLinkedinClick}
                        className="text-foreground hover:text-primary transition-colors"
                    >
                        <Linkedin size={16} />
                    </button>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};