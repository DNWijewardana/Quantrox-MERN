import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Ruler,
  ArrowRight,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";

const Scale = () => {
  const [pixelsPerMeter, setPixelsPerMeter] = useState("100");
  const [manualScale, setManualScale] = useState("1:100");
  const [referenceLength, setReferenceLength] = useState("");
  const [referencePixels, setReferencePixels] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  const previewUrl =
    typeof window !== "undefined"
      ? sessionStorage.getItem("uploadedPlanPreview")
      : null;

  const handleConfirm = () => {
    const metersPerPixel = 1 / parseFloat(pixelsPerMeter || "100");

    sessionStorage.setItem(
      "planScale",
      JSON.stringify({
        metersPerPixel,
        manualScale,
      })
    );

    toast({
      title: "Scale confirmed",
      description: `1 pixel = ${metersPerPixel.toFixed(4)} meters`,
    });

    navigate("/analysis");
  };

  const computeFromReference = () => {
    const meters = parseFloat(referenceLength);
    const pixels = parseFloat(referencePixels);

    if (meters > 0 && pixels > 0) {
      setPixelsPerMeter((pixels / meters).toFixed(2));

      toast({
        title: "Calibrated",
        description: `${(pixels / meters).toFixed(
          2
        )} pixels per meter`,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container max-w-7xl mx-auto px-4">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-2">
              Set Drawing Scale
            </h1>

            <p className="text-[hsl(var(--muted-foreground))]">
              Calibrate your floor plan so measurements convert
              accurately to real-world dimensions.
            </p>
          </div>

          {/* Main Layout */}
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
            
            {/* Left Side - Preview */}
            <Card className="overflow-hidden">
              
              {/* Card Header */}
              <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />

                  <span className="text-sm font-medium">
                    Plan Preview
                  </span>
                </div>

                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  Reference for calibration
                </span>
              </div>

              {/* Preview Area */}
              <div className="bg-[hsl(var(--muted))]/30 min-h-[480px] flex items-center justify-center p-6">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Uploaded floor plan"
                    className="max-w-full max-h-[520px] object-contain"
                  />
                ) : (
                  <div className="text-center text-[hsl(var(--muted-foreground))]">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />

                    <p className="text-sm">
                      No plan uploaded yet
                    </p>

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

            {/* Right Side - Scale Settings */}
            <Card className="p-6 h-fit">
              
              {/* Title */}
              <div className="flex items-center gap-2 mb-5">
                <Ruler className="h-5 w-5 text-[hsl(var(--accent))]" />

                <h2 className="font-semibold text-[hsl(var(--foreground))]">
                  Scale Settings
                </h2>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="pixel" className="w-full">
                
                {/* Tab Buttons */}
                <TabsList className="grid grid-cols-3 w-full bg-[hsl(var(--secondary))]/50">
                  <TabsTrigger value="pixel" className="data-[state=active]:bg-[hsl(var(--background))]">
                    Pixel Ratio
                  </TabsTrigger>

                  <TabsTrigger value="manual" className="data-[state=active]:bg-[hsl(var(--background))]">
                    Manual
                  </TabsTrigger>

                  <TabsTrigger value="reference" className="data-[state=active]:bg-[hsl(var(--background))]">
                    Reference
                  </TabsTrigger>
                </TabsList>

                {/* Pixel Ratio Tab */}
                <TabsContent
                  value="pixel"
                  className="space-y-4 mt-4"
                >
                  <div>
                    <Label htmlFor="ppm">
                      1 pixel = ? meters
                    </Label>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">
                        1 px =
                      </span>

                      <Input
                        id="ppm"
                        type="number"
                        step="0.001"
                        value={(
                          1 /
                          parseFloat(pixelsPerMeter || "1")
                        ).toFixed(4)}
                        onChange={(e) => {
                          const meters = parseFloat(
                            e.target.value
                          );

                          if (meters > 0) {
                            setPixelsPerMeter(
                              (1 / meters).toFixed(2)
                            );
                          }
                        }}
                      />

                      <span className="text-sm text-[hsl(var(--muted-foreground))]">
                        m
                      </span>
                    </div>

                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                      Equivalent: {pixelsPerMeter} pixels per
                      meter
                    </p>
                  </div>
                </TabsContent>

                {/* Manual Scale Tab */}
                <TabsContent
                  value="manual"
                  className="space-y-4 mt-4"
                >
                  <div>
                    <Label htmlFor="scale">
                      Drawing Scale
                    </Label>

                    <select
                      id="scale"
                      value={manualScale}
                      onChange={(e) =>
                        setManualScale(e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                    >
                      <option value="1:50">1:50</option>
                      <option value="1:100">1:100</option>
                      <option value="1:200">1:200</option>
                      <option value="1:500">1:500</option>
                    </select>
                  </div>
                </TabsContent>

                {/* Reference Tab */}
                <TabsContent
                  value="reference"
                  className="space-y-4 mt-4"
                >
                  <div>
                    <Label>
                      Known Length (meters)
                    </Label>

                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={referenceLength}
                      onChange={(e) =>
                        setReferenceLength(
                          e.target.value
                        )
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>
                      Measured Length (pixels)
                    </Label>

                    <Input
                      type="number"
                      placeholder="e.g., 1000"
                      value={referencePixels}
                      onChange={(e) =>
                        setReferencePixels(
                          e.target.value
                        )
                      }
                      className="mt-1"
                    />
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

              {/* Info Box */}
              <div className="mt-5 p-3 rounded-lg bg-[hsl(var(--info))]/10 border border-[hsl(var(--info))]/20 flex gap-2">
                <Info className="h-4 w-4 text-[hsl(var(--info))] shrink-0 mt-0.5" />

                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Accurate scale calibration is essential for
                  correct material estimation.
                </p>
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleConfirm}
                size="lg"
                className="w-full mt-5"
              >
                Confirm Scale

                <ArrowRight className="h-4 w-4 ml-2" />
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
