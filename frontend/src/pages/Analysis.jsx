import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Pencil,
  Loader2,
  Calculator,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Analysis = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const projectId = params.get("id");

  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showRooms, setShowRooms] = useState(true);
  const [showWalls, setShowWalls] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showImage, setShowImage] = useState(true);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in first");
      navigate("/login");
      return;
    }
    if (!projectId && !authLoading) {
      navigate("/dashboard");
    }
  }, [authLoading, user, projectId, navigate]);

  // Load project
  useEffect(() => {
    if (!user || !projectId) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/project/${projectId}`);
        if (data.success) {
          setProject(data.project);
        } else {
          toast.error(data.message || "Could not load project");
          navigate("/dashboard");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, projectId, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
            <p>Loading analysis...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!project) return null;

  const imageUrl = project.planFile?.path
    ? `${BACKEND_URL}/${project.planFile.path}`
    : null;
  const imageW = project.planFile?.width || 1200;
  const imageH = project.planFile?.height || 800;

  const totalFloorArea = (project.rooms || []).reduce(
    (s, r) => s + (r.area || 0),
    0,
  );
  const totalWallLength = (project.walls || []).reduce(
    (s, w) => s + (w.length || 0),
    0,
  );

  // Distinct color palette for room types
  const colorByType = {
    living: "rgba(56, 189, 248, 0.25)",
    bedroom: "rgba(168, 85, 247, 0.25)",
    kitchen: "rgba(251, 146, 60, 0.25)",
    bathroom: "rgba(34, 197, 94, 0.25)",
    dining: "rgba(236, 72, 153, 0.25)",
    corridor: "rgba(148, 163, 184, 0.25)",
    garage: "rgba(245, 158, 11, 0.25)",
    other: "rgba(99, 102, 241, 0.25)",
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] px-6 md:px-16 lg:px-24 xl:px-32">
        <main className="flex-1 py-8">
          <div className="container mx-auto">
            <div className="mb-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                ← Back to projects
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">
                  Plan Analysis
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                  {project.name} ·{" "}
                  <Badge variant="outline" className="ml-1">
                    {project.status}
                  </Badge>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/editor?id=${projectId}`)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Plan
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(`/dashboard?id=${projectId}`)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  View Estimate
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-6">
              {/* Plan canvas */}
              <Card className="overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm font-medium">Detected Layout</span>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {project.rooms?.length || 0} rooms ·{" "}
                    {project.walls?.length || 0} walls
                  </span>
                </div>

                <div
                  className="bg-[hsl(var(--muted))]/20"
                  style={{ minHeight: 600 }}
                >
                  <svg
                    className="w-full h-full"
                    viewBox={`0 0 ${imageW} ${imageH}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ minHeight: 600 }}
                  >
                    {/* Background plan image */}
                    {showImage && imageUrl && (
                      <image
                        href={imageUrl}
                        x={0}
                        y={0}
                        width={imageW}
                        height={imageH}
                        preserveAspectRatio="xMidYMid meet"
                        opacity="0.6"
                      />
                    )}

                    {/* Rooms */}
                    {showRooms &&
                      (project.rooms || []).map((r) => (
                        <g key={r.id}>
                          <polygon
                            points={(r.points || [])
                              .map((p) => `${p.x},${p.y}`)
                              .join(" ")}
                            fill={colorByType[r.type] || colorByType.other}
                            stroke="hsl(var(--accent))"
                            strokeWidth="2"
                          />
                          {showLabels &&
                            r.points?.length > 0 &&
                            (() => {
                              const cx =
                                r.points.reduce((s, p) => s + p.x, 0) /
                                r.points.length;
                              const cy =
                                r.points.reduce((s, p) => s + p.y, 0) /
                                r.points.length;
                              return (
                                <g>
                                  <text
                                    x={cx}
                                    y={cy - 6}
                                    textAnchor="middle"
                                    fontSize="14"
                                    fontWeight="600"
                                    fill="hsl(var(--foreground))"
                                    paintOrder="stroke"
                                    stroke="hsl(var(--background))"
                                    strokeWidth="3"
                                  >
                                    {r.name}
                                  </text>
                                  <text
                                    x={cx}
                                    y={cy + 10}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="hsl(var(--muted-foreground))"
                                    paintOrder="stroke"
                                    stroke="hsl(var(--background))"
                                    strokeWidth="3"
                                  >
                                    {Number(r.area || 0).toFixed(2)} m²
                                  </text>
                                </g>
                              );
                            })()}
                        </g>
                      ))}

                    {/* Walls */}
                    {showWalls &&
                      (project.walls || []).map((w) => (
                        <line
                          key={w.id}
                          x1={w.a?.x}
                          y1={w.a?.y}
                          x2={w.b?.x}
                          y2={w.b?.y}
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      ))}
                  </svg>
                </div>
              </Card>

              {/* Right panel */}
              <div className="space-y-4">
                {/* Stats */}
                <Card className="p-5">
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
                    Summary
                  </h3>

                  <div className="space-y-3">
                    <Stat
                      label="Total Rooms"
                      value={project.rooms?.length || 0}
                    />
                    <Stat
                      label="Total Walls"
                      value={project.walls?.length || 0}
                    />
                    <Stat
                      label="Floor Area"
                      value={`${totalFloorArea.toFixed(2)} m²`}
                    />
                    <Stat
                      label="Wall Length"
                      value={`${totalWallLength.toFixed(2)} m`}
                    />
                    <Stat
                      label="Scale"
                      value={`${(project.scale?.pixelsPerMeter || 0).toFixed(0)} px/m`}
                    />
                  </div>
                </Card>

                {/* Layer toggles */}
                <Card className="p-5">
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    Layers
                  </h3>

                  <div className="space-y-3">
                    <Toggle
                      label="Plan image"
                      checked={showImage}
                      onChange={setShowImage}
                    />
                    <Toggle
                      label="Rooms"
                      checked={showRooms}
                      onChange={setShowRooms}
                    />
                    <Toggle
                      label="Walls"
                      checked={showWalls}
                      onChange={setShowWalls}
                    />
                    <Toggle
                      label="Labels"
                      checked={showLabels}
                      onChange={setShowLabels}
                    />
                  </div>
                </Card>

                <Button
                  onClick={() => navigate(`/dashboard?id=${projectId}`)}
                  className="w-full"
                >
                  Continue to Estimate
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

// Small components
const Stat = ({ label, value }) => (
  <div className="flex items-baseline justify-between">
    <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
    <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
      {value}
    </span>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <Label className="text-sm flex items-center gap-2">
      {checked ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      {label}
    </Label>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default Analysis;
