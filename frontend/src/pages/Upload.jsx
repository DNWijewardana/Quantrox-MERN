import React, { useState, useCallback, useEffect } from "react";
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
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

const Upload = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [scale, setScale] = useState("1:100");
  const [referenceDimension, setReferenceDimension] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in first");
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Drag and drop handlers
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && isValidFile(dropped)) {
      setFile(dropped);
      createPreview(dropped);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected && isValidFile(selected)) {
      setFile(selected);
      createPreview(selected);
    }
  };

  const isValidFile = (f) => {
    const valid = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!valid.includes(f.type)) {
      toast.error("Please upload a PNG, JPG, or PDF file.");
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File is too large (max 10 MB).");
      return false;
    }
    return true;
  };

  const createPreview = (f) => {
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null); // PDFs have no inline preview
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  // The real upload
  const handleAnalyze = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      // Build a multipart form so Multer on the backend can see the file.
      const fd = new FormData();
      fd.append("plan", file); // field name MUST match upload.single('plan')
      fd.append("name", projectName || file.name.replace(/\.[^.]+$/, ""));
      fd.append(
        "description",
        referenceDimension ? `Reference: ${referenceDimension}` : "",
      );

      const { data } = await axiosInstance.post("/api/project/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success("Plan uploaded! Now set the scale.");
        // Pre-load preview into sessionStorage so Scale can show it instantly
        if (preview) {
          try {
            sessionStorage.setItem("uploadedPlanPreview", preview);
          } catch {
            /* storage quota — ignore, Scale will load from backend */
          }
        }
        navigate(`/scale?id=${data.project._id}`);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      // Multer / network errors come through here
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Upload failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
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
              {/* PROJECT NAME */}
              <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-card">
                <Label htmlFor="projectName" className="font-semibold">
                  Project Name (optional)
                </Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My House, Plan v1, etc."
                  className="mt-2"
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  Leave blank to use the file name.
                </p>
              </div>

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
                      Drag &amp; Drop your plan here
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
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

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

              {/* SCALE HINT (saved to project description) */}
              <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="h-5 w-5 text-[hsl(var(--accent))]" />
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">
                    Scale Hint (optional)
                  </h3>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
                  You'll calibrate the exact scale on the next page. These are
                  just hints saved with the project.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="scale"
                      className="text-[hsl(var(--muted-foreground))]"
                    >
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
                    <Label
                      htmlFor="reference"
                      className="text-[hsl(var(--muted-foreground))]"
                    >
                      Reference Dimension (optional)
                    </Label>
                    <Input
                      id="reference"
                      type="text"
                      placeholder="e.g., 10m wall length"
                      value={referenceDimension}
                      onChange={(e) => setReferenceDimension(e.target.value)}
                      className="mt-1 bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border-[hsl(var(--input))]"
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      If known, enter a dimension from your plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">
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

              <div className="p-6 rounded-xl bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">
                  Supported Plan Types
                </h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
                  Currently optimized for single-story residential floor plans:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Living Room",
                    "Bedroom",
                    "Kitchen",
                    "Bathroom",
                    "Garage",
                  ].map((room) => (
                    <span
                      key={room}
                      className="px-3 py-1 rounded-full bg-[hsl(var(--background))] text-xs font-medium text-[hsl(var(--foreground))] border border-[hsl(var(--border))]"
                    >
                      {room}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!file || isProcessing}
                size="xl"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-[hsl(var(--primary-foreground))]/30 border-t-[hsl(var(--primary-foreground))] rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Upload &amp; Continue
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
