import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  DollarSign,
  Package,
  Users,
  Percent,
  Save,
  RotateCcw,
  MapPin,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

const defaultMaterialRates = {
  cement: 1200,
  sand: 8500,
  aggregate: 7200,
  blocks: 85,
  steel: 180000,
  plaster: 450,
  paint: 650,
};
const defaultLabourRates = {
  mason: 2500,
  helper: 1500,
  carpenter: 2200,
  painter: 1800,
  plumber: 2000,
};
const defaultWastageFactors = {
  cement: 5,
  sand: 10,
  aggregate: 8,
  blocks: 3,
  steel: 5,
  paint: 10,
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [materialRates, setMaterialRates] = useState(defaultMaterialRates);
  const [labourRates, setLabourRates] = useState(defaultLabourRates);
  const [wastageFactors, setWastageFactors] = useState(defaultWastageFactors);
  const [includeWastage, setIncludeWastage] = useState(true);
  const [region, setRegion] = useState("western");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please sign in first");
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Fetch settings from backend
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/api/settings");
        if (data.success && data.settings) {
          if (data.settings.materialRates)
            setMaterialRates(data.settings.materialRates);
          if (data.settings.labourRates)
            setLabourRates(data.settings.labourRates);
          if (data.settings.wastageFactors)
            setWastageFactors(data.settings.wastageFactors);
          if (typeof data.settings.includeWastage === "boolean") {
            setIncludeWastage(data.settings.includeWastage);
          }
          if (data.settings.region) setRegion(data.settings.region);
        }
      } catch (err) {
        toast.error("Could not load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Save
  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await axiosInstance.post("/api/settings", {
        materialRates,
        labourRates,
        wastageFactors,
        includeWastage,
        region,
      });
      if (data.success) {
        toast.success("Settings saved!");
      } else {
        toast.error(data.message || "Could not save");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults (server-side)
  const handleReset = async () => {
    if (!window.confirm("Reset all values to default rates?")) return;

    try {
      setResetting(true);
      const { data } = await axiosInstance.post("/api/settings/reset");
      if (data.success && data.settings) {
        setMaterialRates(data.settings.materialRates || defaultMaterialRates);
        setLabourRates(data.settings.labourRates || defaultLabourRates);
        setWastageFactors(
          data.settings.wastageFactors || defaultWastageFactors,
        );
        setIncludeWastage(data.settings.includeWastage !== false);
        setRegion(data.settings.region || "western");
        toast.success("Settings reset to defaults");
      } else {
        toast.error(data.message || "Could not reset");
      }
    } catch (err) {
      toast.error("Reset failed");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
            <p>Loading your settings...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">
              Estimation Settings
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Customize material rates, labour costs, and wastage factors for
              your region.
            </p>
          </div>

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
                value="wastage"
                className="data-[state=active]:bg-[hsl(var(--background))]"
              >
                <Percent className="h-4 w-4 mr-2" />
                Wastage
              </TabsTrigger>
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-[hsl(var(--background))]"
              >
                <MapPin className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
            </TabsList>

            {/* Materials */}
            <TabsContent value="materials">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[hsl(var(--accent))]" />
                    Material Unit Rates
                  </CardTitle>
                  <CardDescription>
                    Set the current market prices for construction materials
                    (LKR).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { id: "cement", label: "Cement (per 50kg bag)" },
                      { id: "sand", label: "River Sand (per m³)" },
                      { id: "aggregate", label: "Metal Aggregate (per m³)" },
                      { id: "blocks", label: 'Cement Blocks 6" (per unit)' },
                      { id: "steel", label: "Steel Reinforcement (per ton)" },
                      { id: "plaster", label: "Wall Plaster (per m²)" },
                      { id: "paint", label: "Paint Emulsion (per liter)" },
                    ].map((item) => (
                      <div key={item.id}>
                        <Label htmlFor={`mat-${item.id}`}>{item.label}</Label>
                        <Input
                          id={`mat-${item.id}`}
                          type="number"
                          min="0"
                          value={materialRates[item.id] ?? 0}
                          onChange={(e) =>
                            setMaterialRates({
                              ...materialRates,
                              [item.id]: Number(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Labour */}
            <TabsContent value="labour">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[hsl(var(--accent))]" />
                    Labour Daily Rates
                  </CardTitle>
                  <CardDescription>
                    Set the daily wage rates for different worker categories
                    (LKR per day).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { id: "mason", label: "Mason / Skilled Worker" },
                      { id: "helper", label: "Helper / Unskilled Worker" },
                      { id: "carpenter", label: "Carpenter" },
                      { id: "painter", label: "Painter" },
                      { id: "plumber", label: "Plumber" },
                    ].map((item) => (
                      <div key={item.id}>
                        <Label htmlFor={`lab-${item.id}`}>{item.label}</Label>
                        <Input
                          id={`lab-${item.id}`}
                          type="number"
                          min="0"
                          value={labourRates[item.id] ?? 0}
                          onChange={(e) =>
                            setLabourRates({
                              ...labourRates,
                              [item.id]: Number(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wastage */}
            <TabsContent value="wastage">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-[hsl(var(--accent))]" />
                    Wastage Factors
                  </CardTitle>
                  <CardDescription>
                    Set the expected wastage percentage for each material type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[hsl(var(--secondary))]/50 mb-4">
                    <div>
                      <Label className="text-base font-medium">
                        Include Wastage in Calculations
                      </Label>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Add wastage percentages to material quantities
                      </p>
                    </div>
                    <Switch
                      checked={includeWastage}
                      onCheckedChange={setIncludeWastage}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { id: "cement", label: "Cement Wastage (%)" },
                      { id: "sand", label: "Sand Wastage (%)" },
                      { id: "aggregate", label: "Aggregate Wastage (%)" },
                      { id: "blocks", label: "Block Wastage (%)" },
                      { id: "steel", label: "Steel Wastage (%)" },
                      { id: "paint", label: "Paint Wastage (%)" },
                    ].map((item) => (
                      <div key={item.id}>
                        <Label htmlFor={`was-${item.id}`}>{item.label}</Label>
                        <Input
                          id={`was-${item.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={wastageFactors[item.id] ?? 0}
                          onChange={(e) =>
                            setWastageFactors({
                              ...wastageFactors,
                              [item.id]: Number(e.target.value),
                            })
                          }
                          className="mt-1"
                          disabled={!includeWastage}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* General */}
            <TabsContent value="general">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[hsl(var(--accent))]" />
                    Regional Settings
                  </CardTitle>
                  <CardDescription>
                    Configure settings based on your project location.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="region">Region / Province</Label>
                    <select
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                    >
                      <option value="western">Western Province</option>
                      <option value="central">Central Province</option>
                      <option value="southern">Southern Province</option>
                      <option value="northern">Northern Province</option>
                      <option value="eastern">Eastern Province</option>
                      <option value="northwestern">
                        North Western Province
                      </option>
                      <option value="northcentral">
                        North Central Province
                      </option>
                      <option value="uva">Uva Province</option>
                      <option value="sabaragamuwa">
                        Sabaragamuwa Province
                      </option>
                    </select>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      Transport costs and material availability may vary by
                      region.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetting || saving}
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Reset to Defaults
            </Button>

            <Button onClick={handleSave} disabled={saving || resetting}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
