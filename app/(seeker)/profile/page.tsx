"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Palette, Link as LinkIcon, Sparkles } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const profileSchema = z.object({
  professionalTitle: z.string().min(2, "Title is required"),
  bio: z.string().min(20, "Bio must be at least 20 characters").max(500),
  portfolioLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  sectors: z.array(z.string()).min(1, "Select at least one sector"),
  techStack: z.array(z.string()).min(1, "Select at least one tech"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const HIBLINK_SECTORS = [
  { id: "fintech", label: "Fintech", icon: "💳" },
  { id: "agrotech", label: "Agrotech", icon: "🌱" },
  { id: "healthtech", label: "Healthtech", icon: "🏥" },
  { id: "edtech", label: "Edtech", icon: "📚" },
  { id: "realestate", label: "Real Estate", icon: "🏠" },
];

const TECH_STACKS = [
  { id: "nextjs", label: "Next.js" },
  { id: "react", label: "React" },
  { id: "flutter", label: "Flutter" },
  { id: "python", label: "Python" },
  { id: "ai-ml", label: "AI/ML" },
  { id: "typescript", label: "TypeScript" },
  { id: "nodejs", label: "Node.js" },
  { id: "rust", label: "Rust" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      professionalTitle: "",
      bio: "",
      portfolioLink: "",
      sectors: [],
      techStack: [],
    },
  });

  const selectedSectors = watch("sectors");
  const selectedTechStack = watch("techStack");

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.back();
      });
    }
  }, [tg, router]);

  const toggleSector = useCallback((sectorId: string) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
    const current = watch("sectors") || [];
    const newSectors = current.includes(sectorId)
      ? current.filter((s) => s !== sectorId)
      : [...current, sectorId];
    setValue("sectors", newSectors, { shouldValidate: true });
  }, [tg, watch, setValue]);

  const toggleTech = useCallback((techId: string) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
    const current = watch("techStack") || [];
    const newTech = current.includes(techId)
      ? current.filter((t) => t !== techId)
      : [...current, techId];
    setValue("techStack", newTech, { shouldValidate: true });
  }, [tg, watch, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!tg) return;
    
    tg.HapticFeedback.impactOccurred("medium");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalTitle: data.professionalTitle,
          bio: data.bio,
          portfolioLink: data.portfolioLink,
          fullName: user?.first_name,
          skills: data.sectors,
          techStack: data.techStack,
          telegramId: user?.id,
        }),
      });

      if (response.ok) {
        tg.HapticFeedback.notificationOccurred("success");
        router.push("/jobs");
      } else {
        tg.showAlert("Failed to create profile. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      tg.showAlert("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!tg) return;

    tg.MainButton.setText("Create Profile");
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
      handleSubmit(onSubmit)();
    });

    return () => {
      tg.MainButton.offClick(handleSubmit(onSubmit));
      tg.MainButton.hide();
    };
  }, [tg, handleSubmit]);

  return (
    <div className="min-h-screen bg-hiblink-dark px-4 pt-4 pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-hiblink-light" />
          </button>
          <h1 className="text-lg font-bold text-hiblink-light">Create Profile</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h2 className="text-sm font-bold text-hiblink-light mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-hiblink-orange" />
              About You
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Professional Title
                </label>
                <div className="relative">
                  <Palette className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input
                    {...register("professionalTitle")}
                    className="w-full pl-9 p-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-hiblink-light focus:outline-none focus:ring-2 focus:ring-hiblink-blue"
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
                {errors.professionalTitle && (
                  <p className="text-red-400 text-xs mt-1">{errors.professionalTitle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Bio (20-500 chars)
                </label>
                <textarea
                  {...register("bio")}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-hiblink-light focus:outline-none focus:ring-2 focus:ring-hiblink-blue h-20 resize-none"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                {errors.bio && (
                  <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h2 className="text-sm font-bold text-hiblink-light mb-3">Hiblink Sectors</h2>
            <div className="grid grid-cols-2 gap-2">
              {HIBLINK_SECTORS.map((sector) => (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => toggleSector(sector.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedSectors.includes(sector.id)
                      ? "bg-hiblink-orange text-white"
                      : "bg-white/5 border border-white/10 text-text-muted"
                  }`}
                >
                  <span className="mr-1">{sector.icon}</span>
                  {sector.label}
                </button>
              ))}
            </div>
            {errors.sectors && (
              <p className="text-red-400 text-xs mt-2">{errors.sectors.message}</p>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h2 className="text-sm font-bold text-hiblink-light mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {TECH_STACKS.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => toggleTech(tech.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedTechStack.includes(tech.id)
                      ? "bg-hiblink-blue text-white"
                      : "bg-white/5 border border-white/10 text-text-muted"
                  }`}
                >
                  {tech.label}
                </button>
              ))}
            </div>
            {errors.techStack && (
              <p className="text-red-400 text-xs mt-2">{errors.techStack.message}</p>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h2 className="text-sm font-bold text-hiblink-light mb-3">Portfolio (Optional)</h2>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
              <input
                {...register("portfolioLink")}
                className="w-full pl-9 p-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-hiblink-light focus:outline-none focus:ring-2 focus:ring-hiblink-blue"
                placeholder="https://github.com/yourname"
              />
            </div>
            {errors.portfolioLink && (
              <p className="text-red-400 text-xs mt-1">{errors.portfolioLink.message}</p>
            )}
          </div>

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-hiblink-dark p-4 rounded-2xl flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-hiblink-blue"></div>
                <span className="text-sm text-hiblink-light">Creating profile...</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}