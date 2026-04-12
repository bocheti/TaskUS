import { AuthorizedLayout } from '@/components/layout/AuthorizedLayout';
import BannerLogo from '@/assets/bannerLogo.svg';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AboutUsScreen = () => {
  const navigate = useNavigate();
  return (
    <AuthorizedLayout title="About TaskUS">
      <div className="space-y-8">
        <div className="flex gap-3 items-items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
        <div className="flex flex-col items-center">
          <img 
            src={BannerLogo} 
            alt="TaskUS Logo" 
            className="w-full max-w-md h-auto object-contain mb-6" 
          />
          <p className="text-2xl md:text-4xl text-center text-foreground">
            Make task managing <span className="text-[hsl(193,95%,68%)]">easier</span>
          </p>
        </div>
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="bg-background rounded-lg border-2 border-border p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">About TaskUS</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                TaskUS is a modern task management application designed specifically for organizations and their teams. Built with simplicity and
                intuitiveness at its core, TaskUS enables seamless collaboration between administrators and members, making project coordination 
                effortless and efficient.
              </p>
              <p>
                The platform allows organizations to structure their work through projects and task groups, assign responsibilities to team members, track
                progress in real-time, and maintain complete visibility over task status. Whether you're managing a small team or coordinating across 
                multiple departments, TaskUS provides the tools you need without overwhelming complexity. Every feature is crafted to reduce friction in
                team workflows, from intuitive dashboards that highlight what needs attention, to flexible role-based permissions that give admins control
                while empowering members to focus on their work.
              </p>
            </div>
          </div>
          <div className="bg-background rounded-lg border-2 border-border p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">Academic Context</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                TaskUS was developed by Salvador Ramón Espinosa Merino, whose LinkedIn and Github repository links can be found on the footer of every 
                content container, as part of a Software Engineering bachelor's thesis at the Universidad de Sevilla. The project's primary objective is to
                compare the development experience, performance, and maintainability of two of the most popular and widely-used frontend frameworks in
                web development: Angular and React.
              </p>
              <p>
                By implementing identical functionality in both frameworks against the same Node.js + Express backend, this thesis provides insights into
                the practical differences between these technologies. <strong>The React implementation (the one you are currently seeing)</strong> utilizes Vite, TypeScript,
                Tailwind CSS, and shadcn/ui, while the Angular version employs pure SCSS and Angular Material. This comparative approach allows for a 
                comprehensive evaluation of developer ergonomics, build performance and long-term maintainability—factors crucial for making informed
                technology decisions in real-world software projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthorizedLayout>
  );
};