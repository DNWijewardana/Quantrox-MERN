import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MousePointer2,
  Minus,
  Square,
  Trash2,
  Tag,
  Save,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { isCvServiceAlive, detectLines } from "@/lib/cvService";
import {
  distancePx,
  isNearFirstPoint,
  computeRoomMetrics,
  wallLengthMeters,
} from "@/lib/geometry";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// SVG canvas height in CSS pixels — width is responsive.
const CANVAS_HEIGHT = 600;

// Default room types and their cycle order when toggled.
const ROOM_TYPES = [
  "other",
  "living",
  "bedroom",
  "kitchen",
  "bathroom",
  "dining",
  "corridor",
  "garage",
];

const Editor = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const projectId = params.get("id");

  const { user, loading: authLoading } = useAuth();
  const svgRef = useRef(null);

  // Project state
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);

  // Geometry
  const [walls, setWalls] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [labels, setLabels] = useState([]);

  // Tool + interaction state
  const [tool, setTool] = useState("select");
  const [drawStart, setDrawStart] = useState(null);
  const [roomDraft, setRoomDraft] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // detecting
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [cvAvailable, setCvAvailable] = useState(false);

  //  Auth + URL guard
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

  //  Fetch project
  useEffect(() => {
    if (!projectId || !user) return;

    (async () => {
      try {
        setLoadingProject(true);
        const { data } = await axiosInstance.get(`/api/project/${projectId}`);
        if (data.success) {
          setProject(data.project);
          setWalls(data.project.walls || []);
          setRooms(data.project.rooms || []);
          setLabels([]);
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

  //  Check Python OpenCV service availability
  useEffect(() => {
    (async () => {
      const alive = await isCvServiceAlive();
      setCvAvailable(alive);
    })();
  }, []);

  const ppm = project?.scale?.pixelsPerMeter || 100;

  // Convert a click event to SVG canvas coordinates.
  // Important: we use the SVG's viewBox for accurate coordinates
  // even when the SVG is scaled by CSS.
  const getSvgPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const inv = ctm.inverse();
    const transformed = pt.matrixTransform(inv);
    return { x: transformed.x, y: transformed.y };
  }, []);

  //  Click handler on the SVG canvas
  const handleCanvasClick = (e) => {
    const p = getSvgPoint(e);

    if (tool === "wall") {
      if (!drawStart) {
        setDrawStart(p);
      } else {
        const newWall = {
          id: `w${Date.now()}`,
          a: drawStart,
          b: p,
          length: 0,
          thickness: 0.2,
          height: 3.0,
        };
        newWall.length = wallLengthMeters(newWall, ppm);
        setWalls([...walls, newWall]);
        setDrawStart(null);
      }
      return;
    }

    if (tool === "room") {
      // Auto-close if user clicked near the first point (and we have ≥3 already)
      if (roomDraft.length >= 3 && isNearFirstPoint(p, roomDraft[0])) {
        finalizeRoom(roomDraft);
        setRoomDraft([]);
        return;
      }
      setRoomDraft([...roomDraft, p]);
      return;
    }

    if (tool === "label") {
      const text = prompt("Label text:", "Room");
      if (text) {
        setLabels([...labels, { id: `l${Date.now()}`, pos: p, text }]);
      }
      return;
    }

    if (tool === "select") {
      setSelectedId(null);
    }
  };

  // Finish a room polygon
  const finalizeRoom = (points) => {
    if (points.length < 3) {
      toast.warning("A room needs at least 3 points");
      return;
    }
    const name =
      prompt("Room name:", `Room ${rooms.length + 1}`) ||
      `Room ${rooms.length + 1}`;
    const { area, perimeter } = computeRoomMetrics(points, ppm);

    const newRoom = {
      id: `r${Date.now()}`,
      name,
      type: "other",
      points,
      area,
      perimeter,
    };

    setRooms([...rooms, newRoom]);
    toast.success(`Room "${name}" added (${area.toFixed(2)} m²)`);
  };

  // Press Enter while drawing a room → close polygon
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setRoomDraft([]);
        setDrawStart(null);
        return;
      }
      if (tool !== "room") return;
      if (e.key === "Enter" && roomDraft.length >= 3) {
        finalizeRoom(roomDraft);
        setRoomDraft([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, roomDraft]);

  //  Click on existing element
  const handleWallClick = (e, id) => {
    e.stopPropagation();
    if (tool === "delete") {
      setWalls(walls.filter((w) => w.id !== id));
      toast.success("Wall deleted");
    } else if (tool === "select") {
      setSelectedId(id);
    }
  };

  const handleRoomClick = (e, id) => {
    e.stopPropagation();
    if (tool === "delete") {
      setRooms(rooms.filter((r) => r.id !== id));
      toast.success("Room deleted");
    } else if (tool === "select") {
      setSelectedId(id);
    }
  };

  const handleLabelClick = (e, id) => {
    e.stopPropagation();
    if (tool === "delete") {
      setLabels(labels.filter((l) => l.id !== id));
    } else if (tool === "select") {
      setSelectedId(id);
    }
  };

  //  Drag a wall endpoint (only in select mode)
  const handlePointMove = (e) => {
    const p = getSvgPoint(e);
    setMousePos(p);

    if (!draggingPoint) return;
    setWalls(
      walls.map((w) =>
        w.id === draggingPoint.wallId
          ? {
              ...w,
              [draggingPoint.end]: p,
              length: wallLengthMeters({ ...w, [draggingPoint.end]: p }, ppm),
            }
          : w,
      ),
    );
  };

  //  Save geometry to backend
  const saveGeometry = async (showToast = true) => {
    if (!projectId) return false;
    try {
      setSaving(true);
      const { data } = await axiosInstance.put(
        `/api/project/${projectId}/geometry`,
        { walls, rooms /* labels not yet in backend schema */ },
      );
      if (data.success) {
        if (showToast) toast.success("Saved!");
        return true;
      } else {
        toast.error(data.message || "Could not save");
        return false;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  //  Save then continue to dashboard
  const handleContinue = async () => {
    const ok = await saveGeometry(false);
    if (ok) {
      toast.success("Saved! Continuing to dashboard.");
      navigate(`/dashboard?id=${projectId}`);
    }
  };

  // AI Line Detection (calls Python service)
  const handleAiDetect = async () => {
    if (!project?.planFile?.path) {
      toast.error("No plan image to analyze");
      return;
    }

    try {
      setDetecting(true);
      const imageUrl = `${BACKEND_URL}/${project.planFile.path}`;
      const detected = await detectLines(imageUrl);

      if (!detected.length) {
        toast.info("No clear lines found. Try drawing manually.");
        return;
      }

      // Convert each detected line to a wall.
      const newWalls = detected.map((ln, i) => {
        const w = {
          id: `ai-${Date.now()}-${i}`,
          a: ln.a,
          b: ln.b,
          length: 0,
          thickness: 0.2,
          height: 3.0,
        };
        w.length = wallLengthMeters(w, ppm);
        return w;
      });

      setWalls((prev) => [...prev, ...newWalls]);
      toast.success(
        `✨ ${newWalls.length} walls detected — review and edit as needed`,
      );
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Detection failed. Is the Python service running?";
      toast.error(msg);
      // Re-check availability so the button updates
      const alive = await isCvServiceAlive();
      setCvAvailable(alive);
    } finally {
      setDetecting(false);
    }
  };

  //  Tool definitions
  const tools = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "wall", icon: Minus, label: "Draw Wall" },
    { id: "room", icon: Square, label: "Draw Room" },
    { id: "label", icon: Tag, label: "Add Label" },
    { id: "delete", icon: Trash2, label: "Delete" },
  ];

  // Background image URL
  const imageUrl = project?.planFile?.path
    ? `${BACKEND_URL}/${project.planFile.path}`
    : null;

  const imageW = project?.planFile?.width || 1200;
  const imageH = project?.planFile?.height || 800;

  //  Render
  if (loadingProject) {
    return (
      <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
            <p>Loading editor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] px-6 md:px-16 lg:px-24 xl:px-32">
        <main className="flex-1 py-6">
          <div className="container mx-auto">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-1">
                  Edit Floor Plan
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {project?.name && <strong>{project.name}</strong>}
                  {ppm && <> · Scale: {ppm.toFixed(0)} px/m</>}
                  <> · Draw walls, mark rooms, label spaces.</>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* AI Detect button — only enabled when Python service is alive */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAiDetect}
                  disabled={!cvAvailable || detecting || !imageUrl}
                  title={
                    cvAvailable
                      ? "Auto-detect walls using OpenCV"
                      : "Python OpenCV service is not running on port 5000"
                  }
                >
                  {detecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      AI Detect
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveGeometry(true)}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>

                <Button size="sm" onClick={handleContinue} disabled={saving}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[220px_1fr] gap-4">
              {/* Tool palette */}
              <Card className="p-3 h-fit space-y-1">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase px-2 mb-2">
                  Tools
                </p>

                {tools.map((t) => {
                  const Icon = t.icon;
                  const active = tool === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTool(t.id);
                        setDrawStart(null);
                        setRoomDraft([]);
                        setSelectedId(null);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "hover:bg-[hsl(var(--muted))]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}

                <div className="pt-3 mt-3 border-t border-[hsl(var(--border))]">
                  <div className="flex items-start gap-2 px-2 py-2 rounded-lg bg-[hsl(var(--info))]/5">
                    <HelpCircle className="h-3.5 w-3.5 text-[hsl(var(--info))] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {tool === "wall" && "Click two points to draw a wall."}
                      {tool === "room" &&
                        "Click points around a room. Click first point or press Enter to close."}
                      {tool === "select" &&
                        "Click an element. Drag wall endpoints to move."}
                      {tool === "delete" && "Click any element to remove it."}
                      {tool === "label" &&
                        "Click anywhere to add a text label."}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="mt-3 px-2 text-xs text-[hsl(var(--muted-foreground))] space-y-1">
                    <div>{walls.length} walls</div>
                    <div>{rooms.length} rooms</div>
                    <div>{labels.length} labels</div>
                  </div>

                  {/* CV status pill */}
                  <div className="mt-3 px-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        cvAvailable
                          ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
                          : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${cvAvailable ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--muted-foreground))]"}`}
                      />
                      AI {cvAvailable ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Canvas */}
              <Card className="overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--card))]">
                  <Badge variant="secondary" className="capitalize">
                    {tool} mode
                  </Badge>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {tool === "room" &&
                      roomDraft.length > 0 &&
                      `Drawing room: ${roomDraft.length} points · `}
                    {tool === "wall" && drawStart && "Click second point · "}
                    {imageW}×{imageH} px
                  </span>
                </div>

                <div
                  className="bg-[hsl(var(--muted))]/20"
                  style={{ height: `${CANVAS_HEIGHT}px` }}
                >
                  <svg
                    ref={svgRef}
                    className="w-full h-full"
                    viewBox={`0 0 ${imageW} ${imageH}`}
                    preserveAspectRatio="xMidYMid meet"
                    onClick={handleCanvasClick}
                    onMouseMove={handlePointMove}
                    onMouseUp={() => setDraggingPoint(null)}
                    style={{
                      cursor:
                        tool === "wall" || tool === "room"
                          ? "crosshair"
                          : "default",
                    }}
                  >
                    {/* Background plan image */}
                    {imageUrl && (
                      <image
                        href={imageUrl}
                        x={0}
                        y={0}
                        width={imageW}
                        height={imageH}
                        preserveAspectRatio="xMidYMid meet"
                        opacity="0.7"
                        style={{ pointerEvents: "none" }}
                      />
                    )}

                    {/* Light grid overlay */}
                    <defs>
                      <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="hsl(var(--border))"
                          strokeWidth="0.6"
                          opacity="0.3"
                        />
                      </pattern>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="url(#grid)"
                      pointerEvents="none"
                    />

                    {/* Rooms (draw first so walls appear on top) */}
                    {rooms.map((r) => (
                      <g
                        key={r.id}
                        onClick={(e) => handleRoomClick(e, r.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <polygon
                          points={r.points
                            .map((p) => `${p.x},${p.y}`)
                            .join(" ")}
                          fill="hsl(var(--accent))"
                          fillOpacity={selectedId === r.id ? 0.35 : 0.18}
                          stroke="hsl(var(--accent))"
                          strokeWidth="2"
                        />
                        {/* Room name at centroid */}
                        {r.points.length > 0 &&
                          (() => {
                            const cx =
                              r.points.reduce((s, p) => s + p.x, 0) /
                              r.points.length;
                            const cy =
                              r.points.reduce((s, p) => s + p.y, 0) /
                              r.points.length;
                            return (
                              <g style={{ pointerEvents: "none" }}>
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
                                  {r.area.toFixed(2)} m²
                                </text>
                              </g>
                            );
                          })()}
                      </g>
                    ))}

                    {/* Room being drawn (preview) */}
                    {tool === "room" && roomDraft.length > 0 && (
                      <g>
                        <polyline
                          points={roomDraft
                            .map((p) => `${p.x},${p.y}`)
                            .join(" ")}
                          fill="none"
                          stroke="hsl(var(--accent))"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                        />
                        {/* Line from last point to mouse */}
                        {roomDraft.length > 0 && (
                          <line
                            x1={roomDraft[roomDraft.length - 1].x}
                            y1={roomDraft[roomDraft.length - 1].y}
                            x2={mousePos.x}
                            y2={mousePos.y}
                            stroke="hsl(var(--accent))"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            opacity="0.6"
                          />
                        )}
                        {/* Vertices */}
                        {roomDraft.map((p, i) => (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r={5}
                            fill={
                              i === 0
                                ? "hsl(var(--success))"
                                : "hsl(var(--accent))"
                            }
                            stroke="white"
                            strokeWidth="1.5"
                          />
                        ))}
                      </g>
                    )}

                    {/* Walls */}
                    {walls.map((w) => (
                      <g key={w.id}>
                        <line
                          x1={w.a.x}
                          y1={w.a.y}
                          x2={w.b.x}
                          y2={w.b.y}
                          stroke={
                            selectedId === w.id
                              ? "hsl(var(--accent))"
                              : "hsl(var(--primary))"
                          }
                          strokeWidth={selectedId === w.id ? 5 : 4}
                          strokeLinecap="round"
                          onClick={(e) => handleWallClick(e, w.id)}
                          style={{
                            cursor:
                              tool === "delete" ? "not-allowed" : "pointer",
                          }}
                        />
                        {/* Endpoint handles in select mode */}
                        {tool === "select" &&
                          selectedId === w.id &&
                          ["a", "b"].map((end) => (
                            <circle
                              key={end}
                              cx={w[end].x}
                              cy={w[end].y}
                              r={6}
                              fill="hsl(var(--background))"
                              stroke="hsl(var(--accent))"
                              strokeWidth={2}
                              style={{ cursor: "grab" }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggingPoint({ wallId: w.id, end });
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ))}
                      </g>
                    ))}

                    {/* Wall draw preview */}
                    {drawStart && tool === "wall" && (
                      <>
                        <circle
                          cx={drawStart.x}
                          cy={drawStart.y}
                          r={4}
                          fill="hsl(var(--accent))"
                        />
                        <line
                          x1={drawStart.x}
                          y1={drawStart.y}
                          x2={mousePos.x}
                          y2={mousePos.y}
                          stroke="hsl(var(--accent))"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                          opacity="0.6"
                        />
                      </>
                    )}

                    {/* Labels */}
                    {labels.map((l) => (
                      <g
                        key={l.id}
                        onClick={(e) => handleLabelClick(e, l.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <rect
                          x={l.pos.x - 50}
                          y={l.pos.y - 12}
                          width={100}
                          height={24}
                          rx={4}
                          fill={
                            selectedId === l.id
                              ? "hsl(var(--accent))"
                              : "hsl(var(--card))"
                          }
                          stroke="hsl(var(--border))"
                        />
                        <text
                          x={l.pos.x}
                          y={l.pos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="13"
                          fill="hsl(var(--foreground))"
                          fontWeight="500"
                        >
                          {l.text}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Editor;
