import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Users,
  DollarSign,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  TrendingUp,
  FolderOpen,
  PlusCircle,
  Loader2,
  Calculator,
  Trash2,
  Pencil,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const projectId = params.get("id");
  const { user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [needsCalculation, setNeedsCalculation] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in first");
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Load list of projects (when no id)
  useEffect(() => {
    if (!user || projectId) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/api/project/list");
        if (data.success) {
          setProjects(data.projects || []);
        } else {
          toast.error(data.message || "Could not load projects");
        }
      } catch (err) {
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, projectId]);

  // Load specific project + estimate
  useEffect(() => {
    if (!user || !projectId) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/estimate/${projectId}`);
        if (data.success) {
          setProject(data.project);
          setEstimate(data.estimate);
          setNeedsCalculation(false);
        } else if (data.needsCalculation) {
          setProject(data.project);
          setEstimate(null);
          setNeedsCalculation(true);
        } else {
          toast.error(data.message || "Could not load estimate");
          navigate("/dashboard");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, projectId, navigate]);

  // Run the calculation
  const handleCalculate = async () => {
    try {
      setCalculating(true);
      const { data } = await axiosInstance.post(
        `/api/estimate/${projectId}/calculate`,
      );
      if (data.success) {
        setProject(data.project);
        setEstimate(data.estimate);
        setNeedsCalculation(false);
        toast.success("Estimate calculated! 🎉");
      } else {
        toast.error(data.message || "Could not calculate");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Calculation failed");
    } finally {
      setCalculating(false);
    }
  };

  // Delete a project from the list
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete project "${name}"? This cannot be undone.`))
      return;

    try {
      setDeletingId(id);
      const { data } = await axiosInstance.delete(`/api/project/${id}`);
      if (data.success) {
        setProjects(projects.filter((p) => p._id !== id));
        toast.success("Project deleted");
      } else {
        toast.error(data.message || "Could not delete");
      }
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
            <p>Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!projectId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] px-6 md:px-16 lg:px-24 xl:px-32">
          <main className="flex-1 py-8">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">
                    My Projects
                  </h1>
                  <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    {projects.length} project{projects.length === 1 ? "" : "s"}
                  </p>
                </div>

                <Button onClick={() => navigate("/upload")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>

              {projects.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center">
                    <FolderOpen className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground))] opacity-40 mb-4" />
                    <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">
                      No projects yet
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
                      Upload your first floor plan to get started.
                    </p>
                    <Button onClick={() => navigate("/upload")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Upload Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((p) => (
                    <Card
                      key={p._id}
                      className="shadow-card hover:shadow-lg transition-shadow group"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-[hsl(var(--foreground))] truncate">
                              {p.name}
                            </h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                              {p.description ||
                                p.planFile?.originalName ||
                                "No description"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              p.status === "completed"
                                ? "default"
                                : p.status === "analyzing"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="shrink-0"
                          >
                            {p.status}
                          </Badge>
                        </div>

                        <div className="flex items-baseline gap-2 mb-4">
                          {p.estimate?.totalCost > 0 ? (
                            <>
                              <span className="text-xl font-bold text-[hsl(var(--foreground))]">
                                LKR{" "}
                                {(p.estimate.totalCost / 1_000_000).toFixed(2)}M
                              </span>
                              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                estimate
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                              No estimate yet
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
                          Created {new Date(p.createdAt).toLocaleDateString()}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dashboard?id=${p._id}`)}
                            className="flex-1"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Open
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/editor?id=${p._id}`)}
                            title="Edit geometry"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(p._id, p.name)}
                            disabled={deletingId === p._id}
                            title="Delete project"
                          >
                            {deletingId === p._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  // No estimate yet → show calculate button
  if (needsCalculation || !estimate) {
    const hasGeometry =
      (project?.rooms?.length || 0) > 0 || (project?.walls?.length || 0) > 0;

    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] px-6 md:px-16 lg:px-24 xl:px-32">
          <main className="flex-1 py-12">
            <div className="container max-w-2xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  ← Back to projects
                </button>
              </div>

              <Card className="shadow-card">
                <CardContent className="py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))] mx-auto mb-5">
                    <Calculator className="h-8 w-8" />
                  </div>

                  <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                    {project?.name}
                  </h2>

                  <p className="text-[hsl(var(--muted-foreground))] mb-6">
                    {hasGeometry ? (
                      <>
                        {project.rooms.length} room
                        {project.rooms.length === 1 ? "" : "s"} ·{" "}
                        {project.walls.length} wall
                        {project.walls.length === 1 ? "" : "s"} · Ready to
                        calculate the estimate.
                      </>
                    ) : (
                      "You need to draw some rooms or walls in the editor first."
                    )}
                  </p>

                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/editor?id=${projectId}`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Open Editor
                    </Button>

                    <Button
                      onClick={handleCalculate}
                      disabled={!hasGeometry || calculating}
                    >
                      {calculating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4 mr-2" /> Calculate
                          Estimate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  // Estimate available → show full dashboard
  const totalMaterialCost = estimate.totalMaterialCost || 0;
  const totalLabourCost = estimate.totalLabourCost || 0;
  const totalCost = estimate.totalCost || 0;
  const totalDays = estimate.estimatedDays || 0;
  const materialData = estimate.materials || [];
  const labourData = estimate.labour || [];
  const roomData = project?.rooms || [];
  const totalFloorArea = estimate.totalFloorArea || 0;
  const totalWallLength = estimate.totalWallLength || 0;

  const calcDate = estimate.calculatedAt
    ? new Date(estimate.calculatedAt).toLocaleString()
    : "";

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] px-6 md:px-16 lg:px-24 xl:px-32">
        <main className="flex-1 py-8">
          <div className="container mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                ← Back to projects
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">
                  Estimation Results
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                  {project?.name}
                  {project?.planFile?.originalName && (
                    <> · {project.planFile.originalName}</>
                  )}
                  {calcDate && <> · Calculated {calcDate}</>}
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
                  variant="outline"
                  size="sm"
                  onClick={handleCalculate}
                  disabled={calculating}
                  title="Recalculate using current settings"
                >
                  {calculating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4 mr-2" />
                  )}
                  Recalculate
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title="Coming Day 4"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title="Coming Day 4"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <SummaryCard
                icon={<DollarSign className="h-5 w-5" />}
                label="Total Estimate"
                value={`LKR ${(totalCost / 1_000_000).toFixed(2)}M`}
                accent
              />
              <SummaryCard
                icon={<Package className="h-5 w-5" />}
                label="Material Cost"
                value={`LKR ${(totalMaterialCost / 1000).toFixed(0)}K`}
                change={
                  totalCost > 0
                    ? `${((totalMaterialCost / totalCost) * 100).toFixed(0)}%`
                    : ""
                }
              />
              <SummaryCard
                icon={<Users className="h-5 w-5" />}
                label="Labour Cost"
                value={`LKR ${(totalLabourCost / 1000).toFixed(0)}K`}
                change={
                  totalCost > 0
                    ? `${((totalLabourCost / totalCost) * 100).toFixed(0)}%`
                    : ""
                }
              />
              <SummaryCard
                icon={<Clock className="h-5 w-5" />}
                label="Est. Duration"
                value={`${totalDays} Days`}
                change={`~${Math.ceil(totalDays / 7)} weeks`}
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="materials" className="space-y-6">
              <TabsList className="bg-[hsl(var(--secondary))]/50 p-1">
                <TabsTrigger
                  value="materials"
                  className="data-[state=active]:bg-[hsl(var(--background))]"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Materials
                </TabsTrigger>
                <TabsTrigger
                  value="labour"
                  className="data-[state=active]:bg-[hsl(var(--background))]"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Labour
                </TabsTrigger>
                <TabsTrigger
                  value="rooms"
                  className="data-[state=active]:bg-[hsl(var(--background))]"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Rooms
                </TabsTrigger>
              </TabsList>

              {/* Materials Tab */}
              <TabsContent value="materials" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5 text-[hsl(var(--accent))]" />
                      Material Estimation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[hsl(var(--border))]">
                            <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Item
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Quantity
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Unit
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Rate (LKR)
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Total (LKR)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {materialData.map((item, i) => (
                            <tr
                              key={i}
                              className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--secondary))]/30 transition-colors"
                            >
                              <td className="py-3 px-4 text-sm font-medium text-[hsl(var(--foreground))]">
                                {item.item}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-[hsl(var(--foreground))]">
                                {Number(item.quantity).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 3 },
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-[hsl(var(--muted-foreground))]">
                                {item.unit}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-[hsl(var(--muted-foreground))]">
                                {Number(item.rate).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-medium text-[hsl(var(--foreground))]">
                                {Number(item.total).toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[hsl(var(--secondary))]/50">
                            <td
                              colSpan={4}
                              className="py-3 px-4 text-sm font-semibold text-[hsl(var(--foreground))]"
                            >
                              Total Material Cost
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-bold text-[hsl(var(--foreground))]">
                              LKR{" "}
                              {totalMaterialCost.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Labour Tab */}
              <TabsContent value="labour" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-[hsl(var(--accent))]" />
                      Labour Estimation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[hsl(var(--border))]/50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Task
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Days
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Workers
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Rate/Day (LKR)
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                              Total (LKR)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {labourData.map((item, i) => (
                            <tr
                              key={i}
                              className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--secondary))]/30 transition-colors"
                            >
                              <td className="py-3 px-4 text-sm font-medium text-[hsl(var(--foreground))]">
                                {item.task}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-[hsl(var(--foreground))]">
                                {item.days}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-[hsl(var(--muted-foreground))]">
                                {item.workers}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-[hsl(var(--muted-foreground))]">
                                {Number(item.rate).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-medium text-[hsl(var(--foreground))]">
                                {Number(item.total).toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[hsl(var(--secondary))]/50">
                            <td
                              colSpan={4}
                              className="py-3 px-4 text-sm font-semibold text-[hsl(var(--foreground))]"
                            >
                              Total Labour Cost
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-bold text-[hsl(var(--foreground))]">
                              LKR{" "}
                              {totalLabourCost.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rooms Tab */}
              <TabsContent value="rooms" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Layers className="h-5 w-5 text-[hsl(var(--accent))]" />
                      Detected Rooms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {roomData.length === 0 ? (
                      <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                        <Layers className="h-12 w-12 mx-auto opacity-30 mb-3" />
                        <p className="text-sm">No rooms drawn yet.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => navigate(`/editor?id=${projectId}`)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Open Editor
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {roomData.map((room, i) => (
                            <div
                              key={i}
                              className="p-4 rounded-lg border border-[hsl(var(--border))]/50 bg-[hsl(var(--secondary))]/20 hover:bg-[hsl(var(--secondary))]/40 transition-colors"
                            >
                              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">
                                {room.name}
                              </h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-[hsl(var(--muted-foreground))]">
                                    Area
                                  </p>
                                  <p className="font-medium text-[hsl(var(--foreground))]">
                                    {Number(room.area).toFixed(2)} m²
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[hsl(var(--muted-foreground))]">
                                    Perimeter
                                  </p>
                                  <p className="font-medium text-[hsl(var(--foreground))]">
                                    {Number(room.perimeter).toFixed(2)} m
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 p-4 rounded-lg bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                Total Floor Area
                              </p>
                              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                                {totalFloorArea.toFixed(1)} m²
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                Total Wall Length
                              </p>
                              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                                {totalWallLength.toFixed(1)} m
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

// Small re-usable summary card
const SummaryCard = ({ icon, label, value, change, accent }) => (
  <Card
    className={`shadow-card ${accent ? "border-[hsl(var(--accent))]/40" : ""}`}
  >
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            accent
              ? "bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))]"
              : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
          }`}
        >
          {icon}
        </div>
        {change && (
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {change}
          </span>
        )}
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">
        {label}
      </p>
      <p className="text-xl font-bold text-[hsl(var(--foreground))]">{value}</p>
    </CardContent>
  </Card>
);

export default Dashboard;
