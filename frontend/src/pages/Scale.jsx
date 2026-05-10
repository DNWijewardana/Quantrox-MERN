import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ruler,
  ArrowRight,
  Info,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Scale = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const projectId = params.get("id");

  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [activeTab, setActiveTab] = useState("pixel");

  const [pixelsPerMeter, setPixelsPerMeter] = useState("100");
  const [manualScale, setManualScale] = useState("1:100");
  const [referenceLength, setReferenceLength] = useState("");
  const [referencePixels, setReferencePixels] = useState("");

  const [saving, setSaving] = useState(false);

  // Auth + URL guard
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in first");
      navigate("/login");
      return;
    }
    if (!projectId && !authLoading) {
      toast.info("Please upload a plan first");
      navigate("/upload");
    }
  }, [authLoading, user, projectId, navigate]);

  // Fetch project
  useEffect(() => {
    if (!projectId || !user) return;

    (async () => {
      try {
        setLoadingProject(true);
        const { data } = await axiosInstance.get(`/api/project/${projectId}`);
        if (data.success) {
          setProject(data.project);

          // Pre-fill any saved scale from previous session
          if (data.project.scale?.pixelsPerMeter) {
            setPixelsPerMeter(String(data.project.scale.pixelsPerMeter));
          }
          if (data.project.scale?.manualScale) {
            setManualScale(data.project.scale.manualScale);
          }
          if (data.project.scale?.referenceLength) {
            setReferenceLength(String(data.project.scale.referenceLength));
          }
          if (data.project.scale?.referencePixels) {
            setReferencePixels(String(data.project.scale.referencePixels));
          }
          if (data.project.scale?.method) {
            setActiveTab(data.project.scale.method);
          }
        } else {
          toast.error(data.message || "Could not load project");
          navigate("/upload");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load project");
        navigate("/upload");
      } finally {
        setLoadingProject(false);
      }
    })();
  }, [projectId, user, navigate]);

  // Image URL
  // Files in backend/uploads/plans/* are served at /uploads/plans/*
  // Plus use the sessionStorage preview as a fallback while loading.
  const sessionPreview =
    typeof window !== "undefined"
      ? sessionStorage.getItem("uploadedPlanPreview")
      : null;

  const imageUrl = project?.planFile?.path
    ? `${BACKEND_URL}/${project.planFile.path}`
    : sessionPreview;

  // When the image loads, save its natural dimensions to the backend
  // so the Editor knows the canvas size.
  const handleImageLoad = async (e) => {
    const naturalWidth = e.target.naturalWidth;
    const naturalHeight = e.target.naturalHeight;

    if (project && (!project.planFile.width || !project.planFile.height)) {
      try {
        await axiosInstance.put(`/api/project/${projectId}/scale`, {
          width: naturalWidth,
          height: naturalHeight,
        });
      } catch (err) {
        console.warn("Could not save image dimensions:", err.message);
      }
    }
  };

  // Reference tab: compute pixels/meter from a known length
  const computeFromReference = () => {
    const meters = parseFloat(referenceLength);
    const pixels = parseFloat(referencePixels);
    if (meters > 0 && pixels > 0) {
      const ppm = pixels / meters;
      setPixelsPerMeter(ppm.toFixed(2));
      toast.success(`Calibrated: ${ppm.toFixed(2)} pixels per meter`);
    } else {
      toast.error("Enter both a known length (m) and the measured pixels");
    }
  };

  // Confirm: save scale, then go to Editor
  const handleConfirm = async () => {
    const ppm = parseFloat(pixelsPerMeter);
    if (!ppm || ppm <= 0) {
      toast.error("Please enter a valid scale");
      return;
    }

    try {
      setSaving(true);
      const { data } = await axiosInstance.put(
        `/api/project/${projectId}/scale`,
        {
          pixelsPerMeter: ppm,
          method: activeTab, // 'pixel' | 'manual' | 'reference'
          manualScale,
          referenceLength: parseFloat(referenceLength) || 0,
          referencePixels: parseFloat(referencePixels) || 0,
        },
      );

      if (data.success) {
        toast.success("Scale saved!");
        navigate(`/editor?id=${projectId}`);
      } else {
        toast.error(data.message || "Could not save scale");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-2">
              Set Drawing Scale
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              {project?.name && (
                <>
                  Project: <strong>{project.name}</strong> ·{" "}
                </>
              )}
              Calibrate your floor plan so measurements convert accurately to
              real-world dimensions.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
            {/* Left — Plan preview */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-sm font-medium">Plan Preview</span>
                </div>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  Reference for calibration
                </span>
              </div>

              <div className="bg-[hsl(var(--muted))]/30 min-h-[480px] flex items-center justify-center p-6">
                {loadingProject ? (
                  <div className="text-center text-[hsl(var(--muted-foreground))]">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
                    <p className="text-sm">Loading plan...</p>
                  </div>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Uploaded floor plan"
                    onLoad={handleImageLoad}
                    onError={() =>
                      toast.error(
                        "Could not display image. The PDF preview is not yet supported.",
                      )
                    }
                    className="max-w-full max-h-[520px] object-contain"
                  />
                ) : (
                  <div className="text-center text-[hsl(var(--muted-foreground))]">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No plan uploaded yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate("/upload")}
                    >
                      Upload a Plan
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Right — Scale settings */}
            <Card className="p-6 h-fit">
              <div className="flex items-center gap-2 mb-5">
                <Ruler className="h-5 w-5 text-[hsl(var(--accent))]" />
                <h2 className="font-semibold text-[hsl(var(--foreground))]">
                  Scale Settings
                </h2>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full bg-[hsl(var(--secondary))]/50">
                  <TabsTrigger
                    value="pixel"
                    className="data-[state=active]:bg-[hsl(var(--background))]"
                  >
                    Pixel Ratio
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="data-[state=active]:bg-[hsl(var(--background))]"
                  >
                    Manual
                  </TabsTrigger>
                  <TabsTrigger
                    value="reference"
                    className="data-[state=active]:bg-[hsl(var(--background))]"
                  >
                    Reference
                  </TabsTrigger>
                </TabsList>

                {/* Pixel-ratio tab */}
                <TabsContent value="pixel" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="ppm">Pixels per meter</Label>
                    <Input
                      id="ppm"
                      type="number"
                      step="1"
                      min="1"
                      value={pixelsPerMeter}
                      onChange={(e) => setPixelsPerMeter(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                      Equivalent: 1 pixel ={" "}
                      {(
                        1 / Math.max(parseFloat(pixelsPerMeter || "1"), 1)
                      ).toFixed(4)}{" "}
                      m
                    </p>
                  </div>
                </TabsContent>

                {/* Manual scale tab — sets a typical PPM for the chosen ratio */}
                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="scale">Drawing Scale</Label>
                    <select
                      id="scale"
                      value={manualScale}
                      onChange={(e) => {
                        const v = e.target.value;
                        setManualScale(v);
                        // Rough approximation: assume printed at 96 DPI on A4
                        const map = {
                          "1:50": 75,
                          "1:100": 38,
                          "1:200": 19,
                          "1:500": 8,
                        };
                        if (map[v]) setPixelsPerMeter(String(map[v]));
                      }}
                      className="mt-1 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                    >
                      <option value="1:50">1:50</option>
                      <option value="1:100">1:100</option>
                      <option value="1:200">1:200</option>
                      <option value="1:500">1:500</option>
                    </select>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                      Approximate ppm: {pixelsPerMeter}
                    </p>
                  </div>
                </TabsContent>

                {/* Reference tab */}
                <TabsContent value="reference" className="space-y-4 mt-4">
                  <div>
                    <Label>Known Length (meters)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={referenceLength}
                      onChange={(e) => setReferenceLength(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Measured Length (pixels)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 1000"
                      value={referencePixels}
                      onChange={(e) => setReferencePixels(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      Use a screenshot ruler tool to measure pixels.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={computeFromReference}
                  >
                    Calculate Scale
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="mt-5 p-3 rounded-lg bg-[hsl(var(--info))]/10 border border-[hsl(var(--info))]/20 flex gap-2">
                <Info className="h-4 w-4 text-[hsl(var(--info))] shrink-0 mt-0.5" />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Accurate scale calibration is essential for correct material
                  estimation.
                </p>
              </div>

              <Button
                onClick={handleConfirm}
                size="lg"
                className="w-full mt-5"
                disabled={saving || loadingProject}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Confirm &amp; Open Editor
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Scale;
