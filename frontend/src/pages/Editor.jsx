import Navbar from "@/components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import {
  MousePointer2,
  Minus,
  Trash2,
  Tag,
  Save,
  Undo2,
  Redo2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Editor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const svgRef = useRef(null);

  const [tool, setTool] = useState("select");

  const [walls, setWalls] = useState([
    { id: "w1", a: { x: 100, y: 100 }, b: { x: 400, y: 100 } },
    { id: "w2", a: { x: 400, y: 100 }, b: { x: 400, y: 300 } },
    { id: "w3", a: { x: 400, y: 300 }, b: { x: 100, y: 300 } },
    { id: "w4", a: { x: 100, y: 300 }, b: { x: 100, y: 100 } },
  ]);

  const [labels, setLabels] = useState([
    { id: "l1", pos: { x: 250, y: 200 }, text: "Living Room" },
  ]);

  const [drawStart, setDrawStart] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [draggingPoint, setDraggingPoint] = useState(null);

  const getSvgPoint = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleCanvasClick = (e) => {
    const p = getSvgPoint(e);

    if (tool === "wall") {
      if (!drawStart) {
        setDrawStart(p);
      } else {
        setWalls([
          ...walls,
          { id: `w${Date.now()}`, a: drawStart, b: p },
        ]);
        setDrawStart(null);
      }
    } else if (tool === "label") {
      const text = prompt("Room label:", "Room");
      if (text) {
        setLabels([
          ...labels,
          { id: `l${Date.now()}`, pos: p, text },
        ]);
      }
    } else if (tool === "select") {
      setSelectedId(null);
    }
  };

  const handleWallClick = (e, id) => {
    e.stopPropagation();

    if (tool === "delete") {
      setWalls(walls.filter((w) => w.id !== id));
      toast({ title: "Wall deleted" });
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

  const handlePointMove = (e) => {
    if (!draggingPoint) return;

    const p = getSvgPoint(e);

    setWalls(
      walls.map((w) =>
        w.id === draggingPoint.wallId
          ? { ...w, [draggingPoint.end]: p }
          : w
      )
    );
  };

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "wall", icon: Minus, label: "Draw Wall" },
    { id: "label", icon: Tag, label: "Add Label" },
    { id: "delete", icon: Trash2, label: "Delete" },
  ];

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
                Draw walls, drag points to adjust, label rooms. Designed for non-technical users.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Undo2 className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm">
                <Redo2 className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toast({ title: "Saved" })}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>

              <Button size="sm" onClick={() => navigate("/dashboard")}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[200px_1fr] gap-4">

            {/* Tools */}
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
                    {tool === "select" && "Click an element, drag endpoints to move."}
                    {tool === "delete" && "Click any element to remove it."}
                    {tool === "label" && "Click anywhere to add a room label."}
                  </p>
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
                  {walls.length} walls · {labels.length} labels
                </span>
              </div>

              <div className="bg-[hsl(var(--muted))]/20" style={{ height: "600px" }}>
                <svg
                  ref={svgRef}
                  className="w-full h-full"
                  onClick={handleCanvasClick}
                  onMouseMove={handlePointMove}
                  onMouseUp={() => setDraggingPoint(null)}
                  style={{
                    cursor: tool === "wall" ? "crosshair" : "default",
                  }}
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="0.5"
                        opacity="0.5"
                      />
                    </pattern>
                  </defs>

                  <rect width="100%" height="100%" fill="url(#grid)" />

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
                            tool === "delete"
                              ? "not-allowed"
                              : "pointer",
                        }}
                      />

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
                              setDraggingPoint({
                                wallId: w.id,
                                end,
                              });
                            }}
                          />
                        ))}
                    </g>
                  ))}

                  {drawStart && tool === "wall" && (
                    <circle
                      cx={drawStart.x}
                      cy={drawStart.y}
                      r={4}
                      fill="hsl(var(--accent))"
                    />
                  )}

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