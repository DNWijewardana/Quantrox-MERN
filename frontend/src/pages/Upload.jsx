import React, { useState, useCallback } from "react";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload as UploadIcon,
  FileImage,
  X,
  Ruler,
  ArrowRight,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import Navbar from "@/components/layout/Navbar";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scale, setScale] = useState("1:100");
  const [referenceDimension, setReferenceDimension] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
      createPreview(droppedFile);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
      createPreview(selectedFile);
    }
  };

  const isValidFile = (file) => {
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, or PDF file.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const createPreview = (file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Analysis Complete",
      description: "Your floor plan has been analyzed successfully.",
    });

    setIsProcessing(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* HEADER */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              Upload Your Floor Plan
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Upload a clear image or PDF of your residential floor plan. For
              best results, ensure the plan includes dimensions or a scale
              reference.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* LEFT SIDE */}
            <div className="space-y-6">
              {/* UPLOAD BOX */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                  file
                    ? "border-success bg-[hsl(var(--success))]/5"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/5"
                }`}
              >
                {!file ? (
                  <div className="text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--secondary))] mx-auto mb-4">
                      <UploadIcon className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                    </div>

                    <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">
                      Drag & Drop your plan here
                    </h3>

                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                      or click to browse files
                    </p>

                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div className="flex items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <FileImage className="h-4 w-4" />
                      <span>PNG, JPG, PDF up to 10MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* FILE INFO */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--success))]/20">
                          <FileImage className="h-5 w-5 text-[hsl(var(--success))]" />
                        </div>

                        <div>
                          <p className="font-medium text-[hsl(var(--foreground))] text-sm truncate max-w-[200px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={removeFile}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* PREVIEW */}
                    {preview && (
                      <div className="relative rounded-lg overflow-hidden border border-[hsl(var(--border))]">
                        <img
                          src={preview}
                          alt="Floor plan preview"
                          className="w-full h-48 object-contain bg-[hsl(var(--muted))]/30"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SCALE */}
              <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="h-5 w-5 text-[hsl(var(--accent))]" />
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">
                    Scale Calibration
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scale" className="text-[hsl(var(--muted-foreground))]">
                      Drawing Scale
                    </Label>

                    <select
                      id="scale"
                      value={scale}
                      onChange={(e) => setScale(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    >
                      <option value="1:50">1:50</option>
                      <option value="1:100">1:100</option>
                      <option value="1:200">1:200</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="reference" className="text-[hsl(var(--muted-foreground))]">
                      Reference Dimension (optional)
                    </Label>

                    <Input
                      id="reference"
                      type="text"
                      placeholder="e.g., 10m wall length"
                      value={referenceDimension}
                      onChange={(e) =>
                        setReferenceDimension(e.target.value)
                      }
                      className="mt-1 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border-[hsl(var(--input))]"
                    />

                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      If known, enter a dimension from your plan for better
                      accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">
              {/* TIPS */}
              <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-[hsl(var(--info))]" />
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">
                    Tips for Best Results
                  </h3>
                </div>

                <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                  {[
                    "Use high-resolution images (300 DPI recommended)",
                    "Ensure the floor plan is properly oriented (not rotated)",
                    "Include dimension annotations if available",
                    "Walls and room boundaries should be clearly visible",
                    "Avoid plans with heavy annotations or colors",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs font-medium">
                        {i + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PLAN TYPES */}
              <div className="p-6 rounded-xl bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">
                  Supported Plan Types
                </h4>

                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
                  Currently optimized for single-story residential floor plans:
                </p>

                <div className="flex flex-wrap gap-2">
                  {["Living Room", "Bedroom", "Kitchen", "Bathroom", "Garage"].map(
                    (room) => (
                      <span
                        key={room}
                        className="px-3 py-1 rounded-full bg-[hsl(var(--background))] text-xs font-medium text-[hsl(var(--foreground))] border border-[hsl(var(--border))]"
                      >
                        {room}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* BUTTON */}
              <Button
                onClick={handleAnalyze}
                disabled={!file || isProcessing}
                size="xl"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-[hsl(var(--primary-foreground))]/30 border-t-[hsl(var(--primary-foreground))] rounded-full animate-spin" />
                    Analyzing Plan...
                  </>
                ) : (
                  <>
                    Analyze Floor Plan
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Upload;