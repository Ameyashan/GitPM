import Image from "next/image";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import type { Project } from "@/types/project";

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  if (project.demo_video_url) {
    return <VideoEmbed url={project.demo_video_url} title={`${project.name} demo`} />;
  }

  if (project.thumbnail_url) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-dark">
        <Image
          src={project.thumbnail_url}
          alt={project.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-purple/10 via-surface-dark to-teal/10 flex items-center justify-center">
      <span className="text-white/20 text-sm font-mono">{project.name}</span>
    </div>
  );
}
