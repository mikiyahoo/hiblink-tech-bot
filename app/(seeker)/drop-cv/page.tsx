"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useAppStore } from "@/lib/store";

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

interface Candidate {
  name: string;
  skills: string[];
  techStack: string[];
  sectors: string[];
  cvFile?: File;
}

export default function DropCVPage() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const { role } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<"upload" | "sectors" | "tech" | "done">("upload");
  const [uploading, setUploading] = useState(false);
  const [candidate, setCandidate] = useState<Candidate>({
    name: "",
    skills: [],
    techStack: [],
    sectors: [],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (role === "employer") {
      router.replace("/");
    }

    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.push("/");
      });
    }

    setCandidate((prev) => ({ ...prev, name: user?.first_name || "" }));
  }, [tg, router, role, user]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        tg?.HapticFeedback?.notificationOccurred("success");
      } else {
        tg?.showAlert("Please upload a PDF or Word document");
      }
    }
  }, [tg]);

  const handleUploadCV = useCallback(async () => {
    if (!selectedFile) {
      tg?.showAlert("Please select a CV file first");
      return;
    }

    setUploading(true);
    setStep("sectors");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("telegramId", String(user?.id));
      formData.append("name", candidate.name);

      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("CV upload error:", error);
    } finally {
      setUploading(false);
    }
  }, [selectedFile, candidate.name, user]);

  const toggleSector = useCallback((sectorId: string) => {
    setCandidate((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sectorId)
        ? prev.sectors.filter((s) => s !== sectorId)
        : [...prev.sectors, sectorId],
    }));
    tg?.HapticFeedback?.impactOccurred("light");
  }, [tg]);

  const toggleTechStack = useCallback((techId: string) => {
    setCandidate((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(techId)
        ? prev.techStack.filter((t) => t !== techId)
        : [...prev.techStack, techId],
    }));
    tg?.HapticFeedback?.impactOccurred("light");
  }, [tg]);

  const handleSubmitProfile = useCallback(async () => {
    if (candidate.sectors.length === 0) {
      tg?.showAlert("Please select at least one sector");
      return;
    }

    try {
      await fetch("/api/cv/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: user?.id,
          name: candidate.name,
          sectors: candidate.sectors,
          techStack: candidate.techStack,
        }),
      });

      setStep("done");
      tg?.HapticFeedback?.notificationOccurred("success");
    } catch (error) {
      console.error("Profile submit error:", error);
    }
  }, [candidate, user, tg]);

  if (step === "done") {
    return (
      <div className="h-screen bg-hiblink-dark flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-hiblink-light text-center mb-2">
          CV Submitted!
        </h1>
        <p className="text-text-muted text-center mb-8">
          We'll notify you when there's a matching opportunity.
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full py-4 bg-hiblink-blue text-white rounded-2xl font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (step === "sectors" || step === "tech") {
    return (
      <div className="h-screen bg-hiblink-dark overflow-y-auto">
        <div className="max-w-md mx-auto p-6 pb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-hiblink-light">
              {step === "sectors" ? "Select Your Sectors" : "Tech Stack"}
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {step === "sectors"
                ? "Which Hiblink sectors interest you?"
                : "What technologies do you work with?"}
            </p>
          </div>

          {step === "sectors" && (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {HIBLINK_SECTORS.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => toggleSector(sector.id)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    candidate.sectors.includes(sector.id)
                      ? "border-hiblink-orange bg-hiblink-orange/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className="text-2xl">{sector.icon}</span>
                  <span className="block mt-2 font-bold text-hiblink-light">
                    {sector.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === "tech" && (
            <div className="flex flex-wrap gap-2 mb-8">
              {TECH_STACKS.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => toggleTechStack(tech.id)}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    candidate.techStack.includes(tech.id)
                      ? "border-hiblink-blue bg-hiblink-blue/10 text-hiblink-blue"
                      : "border-white/10 text-text-muted"
                  }`}
                >
                  {tech.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              if (step === "sectors") {
                setStep("tech");
              } else {
                handleSubmitProfile();
              }
            }}
            className="w-full py-4 bg-hiblink-blue text-white rounded-2xl font-bold"
          >
            {step === "sectors" ? "Continue" : "Submit Profile"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-hiblink-dark flex flex-col">
      <div className="max-w-md mx-auto w-full px-6 py-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-hiblink-light">Drop Your CV</h1>
          <p className="text-text-muted text-sm mt-1">
            Upload your resume. We'll match you with Hiblink opportunities.
          </p>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all min-h-[200px] ${
            selectedFile
              ? "border-hiblink-blue bg-hiblink-blue/5"
              : "border-white/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="text-center">
              <FileText className="w-12 h-12 text-hiblink-blue mx-auto mb-3" />
              <p className="text-hiblink-light font-bold">{selectedFile.name}</p>
              <p className="text-text-muted text-sm mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="mt-4 text-red-400 text-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-hiblink-light font-bold">Tap to upload</p>
              <p className="text-text-muted text-sm mt-1">PDF or Word (max 10MB)</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-6 pb-6">
        <button
          onClick={handleUploadCV}
          disabled={!selectedFile || uploading}
          className="w-full py-4 bg-hiblink-blue text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
}