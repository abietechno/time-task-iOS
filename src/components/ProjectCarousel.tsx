import React from 'react';
import { Project, Task } from '../types';

interface ProjectCarouselProps {
  projects: Project[];
  tasks: Task[];
  onSelectProject: (projectId: string) => void;
}

export const ProjectCarousel: React.FC<ProjectCarouselProps> = ({ projects, tasks, onSelectProject }) => {
  if (projects.length === 0) return null;

  return (
    <div className="flex items-stretch gap-3 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
      {projects.slice(0, 8).map((proj) => {
        const projTasks = tasks.filter((t) => t.project_id === proj.id);
        const total = projTasks.length;
        const done = projTasks.filter((t) => t.status === 'done').length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const accent = proj.color || '#007AFF';

        return (
          <button
            key={proj.id}
            onClick={() => onSelectProject(proj.id)}
            className="flex-shrink-0 w-[152px] rounded-[24px] p-4 text-left flex flex-col justify-between transition-transform active:scale-[0.97]"
            style={{ backgroundColor: `${accent}22` }}
          >
            <h3 className="text-[14px] font-bold leading-snug text-[#1C1C1E] dark:text-white line-clamp-2">
              {proj.name}
            </h3>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                <span className="text-[#8E8E93] font-medium">{proj.deadline}</span>
                <span style={{ color: accent }}>{pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
