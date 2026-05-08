import React, { useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

import {
  ZoomIn,
  ZoomOut,
  Move,
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Maximize2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const mockRooms = [
  {
    id: "r1",
    name: "Living Room",
    x: 8,
    y: 10,
    w: 38,
    h: 32,
    area: 24.5,
  },
  {
    id: "r2",
    name: "Kitchen",
    x: 48,
    y: 10,
    w: 26,
    h: 22,
    area: 12.8,
  },
  {
    id: "r3",
    name: "Bedroom 1",
    x: 8,
    y: 46,
    w: 30,
    h: 28,
    area: 18.2,
  },
  {
    id: "r4",
    name: "Bedroom 2",
    x: 40,
    y: 46,
    w: 26,
    h: 28,
    area: 15.6,
  },
  {
    id: "r5",
    name: "Bathroom",
    x: 68,
    y: 36,
    w: 18,
    h: 18,
    area: 5.4,
  },
];

const Analysis = () => {
  const navigate = useNavigate();

  const [showWalls, setShowWalls] = useState(true);
  const [showRooms, setShowRooms] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const [zoom, setZoom] = useState(1);

  const [pan, setPan] = useState({
    x: 0,
    y: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({
    x: 0,
    y: 0,
  });

  const [selectedRoom, setSelectedRoom] = useState(null);

  const previewUrl =
    typeof window !== "undefined"
      ? sessionStorage.getItem("uploadedPlanPreview")
      : null;

  const handleMouseDown = (e) => {
    setIsDragging(true);

    dragStart.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);

    setPan({
      x: 0,
      y: 0,
    });
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] px-6 md:px-16 lg:px-24 xl:px-32">

      <main className="flex-1 py-6">
        <div className="container max-auto">

          {/* Header */}
          <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">
                  Plan Analysis
                </h1>

                <Badge
                  variant="secondary"
                  className="gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  AI-Ready
                </Badge>
              </div>

              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Detected elements are highlighted. Toggle layers and inspect
                details on the right.
              </p>
            </div>

            <Button
              onClick={() => navigate("/editor")}
              size="lg"
            >
              Edit Plan

              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-4">

            {/* Viewer */}
            <Card className="overflow-hidden">

              {/* Toolbar */}
              <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--card))]">

                <div className="flex items-center gap-1">

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setZoom((z) => Math.min(z + 0.2, 3))
                    }
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setZoom((z) => Math.max(z - 0.2, 0.4))
                    }
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetView}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <Move className="h-3 w-3" />
                  Drag to pan
                </div>
              </div>

              {/* Canvas */}
              <div
                className="relative bg-[hsl(var(--muted))]/20 overflow-hidden select-none"
                style={{
                  height: "640px",
                  cursor: isDragging ? "grabbing" : "grab",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div
                  className="absolute inset-0 origin-center transition-transform"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Floor plan"
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[hsl(var(--muted-foreground))]">

                      <div className="text-center">
                        <Maximize2 className="h-10 w-10 mx-auto mb-2 opacity-40" />

                        <p className="text-sm">
                          No plan loaded — upload one to see analysis
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Overlay SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >

                    {/* Walls */}
                    {showWalls && (
                      <g
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.4"
                        fill="none"
                        opacity="0.85"
                      >
                        {mockRooms.map((r) => (
                          <rect
                            key={`w-${r.id}`}
                            x={r.x}
                            y={r.y}
                            width={r.w}
                            height={r.h}
                          />
                        ))}
                      </g>
                    )}

                    {/* Rooms */}
                    {showRooms &&
                      mockRooms.map((r) => (
                        <g
                          key={`rm-${r.id}`}
                          className="pointer-events-auto"
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          <rect
                            x={r.x}
                            y={r.y}
                            width={r.w}
                            height={r.h}
                            fill="hsl(var(--accent))"
                            opacity={
                              selectedRoom === r.id
                                ? 0.35
                                : 0.15
                            }
                            onClick={() =>
                              setSelectedRoom(r.id)
                            }
                          />

                          {showLabels && (
                            <text
                              x={r.x + r.w / 2}
                              y={r.y + r.h / 2}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="2"
                              fill="hsl(var(--foreground))"
                              fontWeight="600"
                            >
                              {r.name}
                            </text>
                          )}
                        </g>
                      ))}
                  </svg>
                </div>
              </div>
            </Card>

            {/* Sidebar */}
            <div className="space-y-4">

              {/* Layer Visibility */}
              <Card className="p-5">

                <div className="flex items-center gap-2 mb-4">
                  <Layers className="h-4 w-4 text-[hsl(var(--accent))]" />

                  <h3 className="font-semibold text-sm">
                    Layer Visibility
                  </h3>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "walls",
                      label: "Walls",
                      value: showWalls,
                      set: setShowWalls,
                    },
                    {
                      key: "rooms",
                      label: "Rooms",
                      value: showRooms,
                      set: setShowRooms,
                    },
                    {
                      key: "labels",
                      label: "Labels",
                      value: showLabels,
                      set: setShowLabels,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between"
                    >
                      <Label
                        htmlFor={item.key}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        {item.value ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 opacity-50" />
                        )}

                        {item.label}
                      </Label>

                      <Switch
                        id={item.key}
                        checked={item.value}
                        onCheckedChange={item.set}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Zoom */}
              <Card className="p-5">
                <h3 className="font-semibold text-sm mb-3">
                  Zoom Level
                </h3>

                <Slider
                  value={[zoom * 100]}
                  min={40}
                  max={300}
                  step={10}
                  onValueChange={(v) =>
                    setZoom(v[0] / 100)
                  }
                />

                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                  {Math.round(zoom * 100)}%
                </p>
              </Card>

              {/* Rooms */}
              <Card className="p-5">

                <h3 className="font-semibold text-sm mb-3">
                  Detected Rooms
                </h3>

                <div className="space-y-2 max-h-[260px] overflow-y-auto">
                  {mockRooms.map((r) => (
                    <button
                      key={r.id}
                      onClick={() =>
                        setSelectedRoom(r.id)
                      }
                      className={`w-full text-left p-2.5 rounded-lg border text-sm transition-colors ${
                        selectedRoom === r.id
                          ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10"
                          : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {r.name}
                        </span>

                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {r.area} m²
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Info */}
              <Card className="p-4 bg-[hsl(var(--info))]/5 border-[hsl(var(--info))]/20">

                <div className="flex gap-2">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--info))] shrink-0 mt-0.5" />

                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    AI detection placeholder — will be replaced
                    with real model output (YOLOv8 / OpenCV).
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>


    </div>  
    <Footer />  
    </>

  );
};

export default Analysis;