"use client";

import { useRouter } from "next/navigation";
import { Building2, MapPin, Briefcase, BarChart, DollarSign, Clock } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface Job {
  id: string;
  title: string;
  budget: string;
  description: string;
  deadline: string;
  employerName: string;
  discipline?: string;
  jobType?: string;
  location?: string;
  experience?: string;
  createdAt?: string;
  isPinned?: boolean;
  featured?: boolean;
}

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  const router = useRouter();
  const { tg } = useTelegram();

  const handleViewDetails = () => {
    tg?.HapticFeedback?.impactOccurred("light");
    router.push(`/apply/${job.id}`);
  };

  const handleApply = () => {
    tg?.HapticFeedback?.impactOccurred("light");
    
    tg?.showConfirm(
      `Apply for "${job.title}"?`,
      (confirmed) => {
        if (confirmed) {
          tg?.HapticFeedback?.notificationOccurred("success");
          onApply?.(job.id);
        }
      }
    );
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const formatJobType = (type?: string) => {
    if (type === "remote") return "Remote";
    if (type === "hybrid") return "Hybrid";
    if (type === "onsite") return "On-site";
    return "Full-time";
  };

  const formatDiscipline = (disc?: string) => {
    const map: Record<string, string> = {
      "ui-ux": "UI/UX Design",
      "branding": "Branding",
      "illustration": "Illustration",
      "motion": "Motion Graphics",
      "3d": "3D Modeling",
      "video": "Video Production",
      "web": "Web Development",
      "photography": "Photography",
    };
    return map[disc || ""] || disc || "General";
  };

  const isFeatured = job.isPinned || job.featured;

  return (
    <div className={`
      relative bg-light-surface rounded-3xl p-6 
      border border-light-border 
      hover:border-hiblink-orange/30 hover:shadow-[0_4px_20px_rgba(255,184,0,0.15)]
      transition-all duration-300
      ${isFeatured ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-hiblink-orange before:rounded-l-3xl' : ''}
    `}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-extrabold text-light-text-primary text-lg uppercase tracking-wide leading-tight">
          {job.title}
        </h3>
        {isFeatured && (
          <span className="px-2 py-1 bg-hiblink-orange/10 text-hiblink-orange text-xs font-bold rounded-full border border-hiblink-orange/20">
            Featured
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-light-text-muted text-sm mb-4">
        <Building2 className="w-4 h-4 text-hiblink-orange" />
        <span className="font-medium text-light-text-secondary">{job.employerName}</span>
        <span className="text-light-text-muted">•</span>
        <span className="text-light-text-muted">{getTimeAgo(job.createdAt)}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-hiblink-orange/10 text-hiblink-orange text-xs font-bold rounded-full border border-hiblink-orange/20">
          {formatDiscipline(job.discipline)}
        </span>
        {job.jobType && (
          <span className="px-3 py-1 bg-light-bg text-light-text-muted text-xs font-medium rounded-full">
            {formatJobType(job.jobType)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-light-text-muted text-sm mb-4">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-full bg-hiblink-orange/10">
            <DollarSign className="w-3.5 h-3.5 text-hiblink-orange" />
          </div>
          <span className="font-bold text-hiblink-orange">{job.budget}</span>
        </div>
        {job.location && (
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-full bg-hiblink-orange/10">
              <MapPin className="w-3.5 h-3.5 text-hiblink-orange" />
            </div>
            <span>{job.location}</span>
          </div>
        )}
        {job.experience && (
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-full bg-hiblink-orange/10">
              <BarChart className="w-3.5 h-3.5 text-hiblink-orange" />
            </div>
            <span>{job.experience}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-full bg-hiblink-orange/10">
            <Briefcase className="w-3.5 h-3.5 text-hiblink-orange" />
          </div>
          <span>{formatJobType(job.jobType)}</span>
        </div>
      </div>

      <p className="text-light-text-muted text-sm line-clamp-2 mb-5">{job.description}</p>

      <div className="flex gap-3">
        <button
          onClick={handleViewDetails}
          className="flex-1 py-3 border-2 border-hiblink-blue/50 text-hiblink-blue rounded-2xl font-bold text-sm hover:bg-hiblink-blue/10 hover:border-hiblink-blue transition-all"
        >
          View Details
        </button>
        {onApply && (
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-hiblink-blue text-white rounded-2xl font-bold text-sm hover:bg-hiblink-blue/90 active:scale-95 transition-all"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}