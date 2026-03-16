"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VideoEmbed } from "@/components/shared/VideoEmbed";
import {
  BUILD_TOOLS,
  HOSTING_PLATFORMS,
  CATEGORY_TAGS,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "@/lib/validators/project";
import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

interface StepErrors {
  [key: string]: string[] | undefined;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  live_url: string;
  category_tags: string[];
  build_tools: string[];
  hosting_platform: string;
  problem_statement: string;
  target_user: string;
  key_decisions: string;
  learnings: string;
  demo_video_url: string;
  github_repo_url: string;
}

interface ProjectFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Project>;
}

const STEPS: { label: string; description: string }[] = [
  { label: "Basics", description: "Name, URL, and categories" },
  { label: "Build Details", description: "Tools and hosting" },
  { label: "Product Context", description: "Problem, decisions, learnings" },
  { label: "Media", description: "Video and screenshots" },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="text-xs text-red-400 mt-1">{errors[0]}</p>
  );
}

function StepIndicator({ step, current }: { step: number; current: Step }) {
  const isDone = step < current;
  const isActive = step === current;

  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono transition-colors shrink-0",
        isDone && "bg-teal text-white",
        isActive && "bg-purple text-white",
        !isDone && !isActive && "bg-white/10 text-white/30"
      )}
    >
      {isDone ? <Check className="h-3.5 w-3.5" /> : step}
    </div>
  );
}

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<StepErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    live_url: initialData?.live_url ?? "",
    category_tags: initialData?.category_tags ?? [],
    build_tools: initialData?.build_tools ?? [],
    hosting_platform: initialData?.hosting_platform ?? "",
    problem_statement: initialData?.problem_statement ?? "",
    target_user: initialData?.target_user ?? "",
    key_decisions: initialData?.key_decisions ?? "",
    learnings: initialData?.learnings ?? "",
    demo_video_url: initialData?.demo_video_url ?? "",
    github_repo_url: initialData?.github_repo_url ?? "",
  });

  const set = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleArrayItem = useCallback(
    (key: "build_tools" | "category_tags", item: string) => {
      setFormData((prev) => {
        const arr = prev[key];
        return {
          ...prev,
          [key]: arr.includes(item)
            ? arr.filter((t) => t !== item)
            : [...arr, item],
        };
      });
    },
    []
  );

  function validateStep(step: Step): boolean {
    function parseAndCheck(
      result: { success: boolean; error?: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } } }
    ): boolean {
      if (!result.success && result.error) {
        setErrors(result.error.flatten().fieldErrors as StepErrors);
        return false;
      }
      setErrors({});
      return true;
    }

    if (step === 1) {
      return parseAndCheck(
        step1Schema.safeParse({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          live_url: formData.live_url,
          category_tags: formData.category_tags,
        })
      );
    }
    if (step === 2) {
      return parseAndCheck(
        step2Schema.safeParse({
          build_tools: formData.build_tools,
          hosting_platform: formData.hosting_platform || null,
        })
      );
    }
    if (step === 3) {
      return parseAndCheck(
        step3Schema.safeParse({
          problem_statement: formData.problem_statement,
          target_user: formData.target_user || undefined,
          key_decisions: formData.key_decisions || undefined,
          learnings: formData.learnings || undefined,
        })
      );
    }
    return parseAndCheck(
      step4Schema.safeParse({
        demo_video_url: formData.demo_video_url || null,
      })
    );
  }

  function handleNext() {
    if (!validateStep(currentStep)) return;
    setCurrentStep((s) => Math.min(4, s + 1) as Step);
  }

  function handleBack() {
    setErrors({});
    setCurrentStep((s) => Math.max(1, s - 1) as Step);
  }

  async function handleSubmit() {
    if (!validateStep(4)) return;

    setSubmitting(true);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      live_url: formData.live_url,
      category_tags: formData.category_tags,
      build_tools: formData.build_tools,
      hosting_platform: formData.hosting_platform || null,
      problem_statement: formData.problem_statement,
      target_user: formData.target_user || null,
      key_decisions: formData.key_decisions || null,
      learnings: formData.learnings || null,
      demo_video_url: formData.demo_video_url || null,
      github_repo_url: formData.github_repo_url || null,
    };

    try {
      const url =
        mode === "create"
          ? "/api/projects"
          : `/api/projects/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Something went wrong");
        return;
      }

      toast.success(
        mode === "create" ? "Project created!" : "Project updated!"
      );
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-start gap-3">
        {STEPS.map((s, i) => {
          const stepNum = (i + 1) as Step;
          const isActive = stepNum === currentStep;
          return (
            <div key={s.label} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={cn(
                    "h-px w-8 transition-colors",
                    stepNum <= currentStep
                      ? "bg-purple/60"
                      : "bg-white/10"
                  )}
                />
              )}
              <div className="flex items-center gap-2">
                <StepIndicator step={stepNum} current={currentStep} />
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isActive ? "text-white" : "text-white/30"
                  )}
                >
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step description */}
      <div>
        <p className="text-xs font-mono text-purple uppercase tracking-widest mb-1">
          Step {currentStep} of 4
        </p>
        <h2 className="text-lg font-display font-semibold text-white">
          {STEPS[currentStep - 1].label}
        </h2>
        <p className="text-sm text-white/40 mt-0.5">
          {STEPS[currentStep - 1].description}
        </p>
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-gitpm-border/40 bg-surface-dark/30 p-6 space-y-5">
        {currentStep === 1 && (
          <Step1
            formData={formData}
            errors={errors}
            set={set}
            toggleArrayItem={toggleArrayItem}
          />
        )}
        {currentStep === 2 && (
          <Step2
            formData={formData}
            errors={errors}
            set={set}
            toggleArrayItem={toggleArrayItem}
          />
        )}
        {currentStep === 3 && (
          <Step3 formData={formData} errors={errors} set={set} />
        )}
        {currentStep === 4 && (
          <Step4 formData={formData} errors={errors} set={set} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1 || submitting}
          className="text-white/50 hover:text-white gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            className="bg-purple hover:bg-purple/90 text-white gap-1.5"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-teal hover:bg-teal/90 text-white gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting
              ? "Saving…"
              : mode === "create"
              ? "Create Project"
              : "Save Changes"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ---- Step sub-components ----

interface StepProps {
  formData: FormData;
  errors: StepErrors;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  toggleArrayItem?: (
    key: "build_tools" | "category_tags",
    item: string
  ) => void;
}

function Step1({ formData, errors, set, toggleArrayItem }: StepProps) {
  const handleNameChange = (value: string) => {
    set("name", value);
    // Auto-update slug only if user hasn't manually edited it
    const autoSlug = generateSlug(value);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      set("slug", autoSlug);
    }
  };

  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Project Name <span className="text-red-400">*</span>
        </Label>
        <Input
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="My Awesome Project"
          className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 h-9"
          aria-invalid={Boolean(errors.name)}
        />
        <FieldError errors={errors.name} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          URL Slug <span className="text-red-400">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-sm font-mono shrink-0">
            gitpm.dev/you/
          </span>
          <Input
            value={formData.slug}
            onChange={(e) =>
              set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))
            }
            placeholder="my-awesome-project"
            className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 h-9 font-mono"
            aria-invalid={Boolean(errors.slug)}
          />
        </div>
        <FieldError errors={errors.slug} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Live URL <span className="text-red-400">*</span>
        </Label>
        <Input
          value={formData.live_url}
          onChange={(e) => set("live_url", e.target.value)}
          placeholder="https://myproject.vercel.app"
          type="url"
          className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 h-9 font-mono"
          aria-invalid={Boolean(errors.live_url)}
        />
        <FieldError errors={errors.live_url} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Description
          <span className="text-white/25 ml-1 normal-case font-sans tracking-normal">
            (optional, max 300 chars)
          </span>
        </Label>
        <Textarea
          value={formData.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="A one-line summary of what this project does."
          rows={2}
          className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 resize-none"
          aria-invalid={Boolean(errors.description)}
        />
        <div className="flex justify-between">
          <FieldError errors={errors.description} />
          <span className="text-xs text-white/20 font-mono ml-auto">
            {formData.description.length}/300
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Categories
          <span className="text-white/25 ml-1 normal-case font-sans tracking-normal">
            (optional)
          </span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TAGS.map((tag) => {
            const selected = formData.category_tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleArrayItem?.("category_tags", tag)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-mono transition-colors",
                  selected
                    ? "border-forest/60 bg-forest/15 text-forest"
                    : "border-gitpm-border/30 bg-transparent text-white/40 hover:border-gitpm-border/60 hover:text-white/60"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <FieldError errors={errors.category_tags} />
      </div>
    </>
  );
}

function Step2({ formData, errors, set, toggleArrayItem }: StepProps) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Build Tools <span className="text-red-400">*</span>
          <span className="text-white/25 ml-1 normal-case font-sans tracking-normal">
            (select all that apply)
          </span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {BUILD_TOOLS.map((tool) => {
            const selected = formData.build_tools.includes(tool);
            return (
              <button
                key={tool}
                type="button"
                onClick={() => toggleArrayItem?.("build_tools", tool)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-mono transition-colors capitalize",
                  selected
                    ? "border-purple/60 bg-purple/15 text-purple"
                    : "border-gitpm-border/30 bg-transparent text-white/40 hover:border-gitpm-border/60 hover:text-white/60"
                )}
              >
                {tool}
              </button>
            );
          })}
        </div>
        <FieldError errors={errors.build_tools} />
      </div>

      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Hosting Platform
          <span className="text-white/25 ml-1 normal-case font-sans tracking-normal">
            (optional)
          </span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {HOSTING_PLATFORMS.map((platform) => {
            const selected = formData.hosting_platform === platform;
            return (
              <button
                key={platform}
                type="button"
                onClick={() =>
                  set("hosting_platform", selected ? "" : platform)
                }
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-mono transition-colors capitalize",
                  selected
                    ? "border-teal/60 bg-teal/15 text-teal"
                    : "border-gitpm-border/30 bg-transparent text-white/40 hover:border-gitpm-border/60 hover:text-white/60"
                )}
              >
                {platform.replace("_", " ")}
              </button>
            );
          })}
        </div>
        <FieldError errors={errors.hosting_platform} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          GitHub Repo URL
          <span className="text-white/25 ml-1 normal-case font-sans tracking-normal">
            (optional — auto-enriched in Ticket 6)
          </span>
        </Label>
        <Input
          value={formData.github_repo_url}
          onChange={(e) => set("github_repo_url", e.target.value)}
          placeholder="https://github.com/you/repo"
          type="url"
          className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 h-9 font-mono"
        />
      </div>
    </>
  );
}

function Step3({ formData, errors, set }: StepProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Problem Statement <span className="text-red-400">*</span>
        </Label>
        <p className="text-xs text-white/30">
          What problem does this solve? Who has this problem?
        </p>
        <Textarea
          value={formData.problem_statement}
          onChange={(e) => set("problem_statement", e.target.value)}
          placeholder="I noticed that PMs who build with AI tools had no way to showcase their work with proof of deployment…"
          rows={4}
          className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 resize-none"
          aria-invalid={Boolean(errors.problem_statement)}
        />
        <FieldError errors={errors.problem_statement} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Target User
          <span className="text-white/25 ml-1 normal-case font-sans tracking-normal">
            (optional)
          </span>
        </Label>
        <Textarea
          value={formData.target_user}
          onChange={(e) => set("target_user", e.target.value)}
          placeholder="Product managers at B2B SaaS companies who want to demonstrate technical credibility."
          rows={2}
          className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Key Decisions
          <span className="text-white/25 ml-1 normal-case font-sans tracking-normal">
            (optional)
          </span>
        </Label>
        <p className="text-xs text-white/30">
          What trade-offs or product decisions did you make?
        </p>
        <Textarea
          value={formData.key_decisions}
          onChange={(e) => set("key_decisions", e.target.value)}
          placeholder="Chose Supabase over Firebase for its PostgreSQL foundation and built-in RLS…"
          rows={3}
          className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Learnings
          <span className="text-white/25 ml-1 normal-case font-sans tracking-normal">
            (optional)
          </span>
        </Label>
        <Textarea
          value={formData.learnings}
          onChange={(e) => set("learnings", e.target.value)}
          placeholder="Learned that server components dramatically reduce client-side JS bundle size…"
          rows={3}
          className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 resize-none"
        />
      </div>
    </>
  );
}

function Step4({ formData, errors, set }: StepProps) {
  const videoPreviewUrl = formData.demo_video_url || null;
  const isValidVideoUrl =
    videoPreviewUrl &&
    (videoPreviewUrl.includes("loom.com") ||
      videoPreviewUrl.includes("youtube.com") ||
      videoPreviewUrl.includes("youtu.be"));

  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs font-mono uppercase tracking-wider">
          Demo Video URL
          <span className="text-white/25 ml-1 normal-case font-sans tracking-normal">
            (Loom or YouTube)
          </span>
        </Label>
        <Input
          value={formData.demo_video_url}
          onChange={(e) => set("demo_video_url", e.target.value)}
          placeholder="https://www.loom.com/share/… or https://youtu.be/…"
          type="url"
          className="bg-navy/40 border-gitpm-border/40 text-white placeholder:text-white/20 h-9 font-mono"
          aria-invalid={Boolean(errors.demo_video_url)}
        />
        <FieldError errors={errors.demo_video_url} />
        {isValidVideoUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-gitpm-border/30">
            <VideoEmbed url={videoPreviewUrl} title="Video preview" />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-dashed border-gitpm-border/30 bg-navy/20 p-5 text-center space-y-2">
        <p className="text-sm font-medium text-white/50">Screenshot Upload</p>
        <p className="text-xs text-white/30 max-w-xs mx-auto">
          Screenshot uploads (up to 6 images) are enabled in Ticket 8 when the
          storage API route is wired up. For now, use a demo video URL above.
        </p>
      </div>
    </>
  );
}
