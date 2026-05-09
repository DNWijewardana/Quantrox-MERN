import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

// Mock data for demonstration
const materialData = [
  { item: "Cement (50kg bags)", quantity: 245, unit: "bags", rate: 1200, total: 294000 },
  { item: "River Sand", quantity: 18, unit: "m³", rate: 8500, total: 153000 },
  { item: "Metal Aggregate (20mm)", quantity: 22, unit: "m³", rate: 7200, total: 158400 },
  { item: "Cement Blocks (6\")", quantity: 1850, unit: "nos", rate: 85, total: 157250 },
  { item: "Steel Reinforcement", quantity: 2.4, unit: "tons", rate: 180000, total: 432000 },
  { item: "Wall Plaster", quantity: 320, unit: "m²", rate: 450, total: 144000 },
  { item: "Paint (Emulsion)", quantity: 45, unit: "liters", rate: 650, total: 29250 },
];

const labourData = [
  { task: "Foundation Work", days: 12, workers: 6, rate: 2500, total: 180000 },
  { task: "Wall Construction", days: 18, workers: 5, rate: 2200, total: 198000 },
  { task: "Plastering", days: 8, workers: 4, rate: 2000, total: 64000 },
  { task: "Painting", days: 5, workers: 3, rate: 1800, total: 27000 },
];

const roomData = [
  { name: "Living Room", area: 28.5, perimeter: 21.4 },
  { name: "Master Bedroom", area: 18.2, perimeter: 17.2 },
  { name: "Bedroom 2", area: 14.8, perimeter: 15.6 },
  { name: "Kitchen", area: 12.4, perimeter: 14.2 },
  { name: "Bathroom 1", area: 6.2, perimeter: 10.0 },
  { name: "Bathroom 2", area: 4.8, perimeter: 8.8 },
];

const Dashboard = () => {
  const totalMaterialCost = materialData.reduce((sum, item) => sum + item.total, 0);
  const totalLabourCost = labourData.reduce((sum, item) => sum + item.total, 0);
  const totalCost = totalMaterialCost + totalLabourCost;
  const totalDays = labourData.reduce((sum, item) => sum + item.days, 0);

  return (
    <>
    <Navbar />
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] px-6 md:px-16 lg:px-24 xl:px-32">
      <main className="flex-1 py-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">
                Estimation Results
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] mt-1">
                Floor Plan: residential_plan_v2.jpg • Analyzed on May 15, 2026
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download BOQ
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              icon={<DollarSign className="h-5 w-5" />}
              label="Total Estimate"
              value={`LKR ${(totalCost / 1000000).toFixed(2)}M`}
              change="+2.3%"
              positive
            />
            <SummaryCard
              icon={<Package className="h-5 w-5" />}
              label="Material Cost"
              value={`LKR ${(totalMaterialCost / 1000).toFixed(0)}K`}
              change={`${((totalMaterialCost / totalCost) * 100).toFixed(0)}%`}
            />
            <SummaryCard
              icon={<Users className="h-5 w-5" />}
              label="Labour Cost"
              value={`LKR ${(totalLabourCost / 1000).toFixed(0)}K`}
              change={`${((totalLabourCost / totalCost) * 100).toFixed(0)}%`}
            />
            <SummaryCard
              icon={<Clock className="h-5 w-5" />}
              label="Est. Duration"
              value={`${totalDays} Days`}
              change="~6 weeks"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="materials" className="space-y-6">
            <TabsList className="bg-[hsl(var(--secondary))]/50 p-1">
              <TabsTrigger value="materials" className="data-[state=active]:bg-[hsl(var(--background))]">
                <Package className="h-4 w-4 mr-2" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="labour" className="data-[state=active]:bg-[hsl(var(--background))]">
                <Users className="h-4 w-4 mr-2" />
                Labour
              </TabsTrigger>
              <TabsTrigger value="rooms" className="data-[state=active]:bg-[hsl(var(--background))]">
                <Layers className="h-4 w-4 mr-2" />
                Rooms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materials" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-[hsl(var(--accent))]" />
                    Material Quantities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))]">
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Item</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Quantity</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Unit</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Rate (LKR)</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Total (LKR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materialData.map((item, index) => (
                          <tr key={index} className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--secondary))]/30 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium text-[hsl(var(--foreground))]">{item.item}</td>
                            <td className="py-3 px-4 text-sm text-right text-[hsl(var(--foreground))]">{item.quantity}</td>
                            <td className="py-3 px-4 text-sm text-right text-[hsl(var(--muted-foreground))]">{item.unit}</td>
                            <td className="py-3 px-4 text-sm text-right text-[hsl(var(--muted-foreground))]">{item.rate.toLocaleString()}</td>
                            <td className="py-3 px-4 text-sm text-right font-medium text-[hsl(var(--foreground))]">{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[hsl(var(--secondary))]/50">
                          <td colSpan={4} className="py-3 px-4 text-sm font-semibold text-[hsl(var(--foreground))]">Total Material Cost</td>
                          <td className="py-3 px-4 text-sm text-right font-bold text-[hsl(var(--foreground))]">LKR {totalMaterialCost.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                          <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Task</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Days</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Workers</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Rate/Day (LKR)</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Total (LKR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labourData.map((item, index) => (
                          <tr key={index} className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--secondary))]/30 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium text-[hsl(var(--foreground))]">{item.task}</td>
                            <td className="py-3 px-4 text-sm text-right text-[hsl(var(--foreground))]">{item.days}</td>
                            <td className="py-3 px-4 text-sm text-right text-[hsl(var(--muted-foreground))]">{item.workers}</td>
                            <td className="py-3 px-4 text-sm text-right text-[hsl(var(--muted-foreground))]">{item.rate.toLocaleString()}</td>
                            <td className="py-3 px-4 text-sm text-right font-medium text-[hsl(var(--foreground))]">{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[hsl(var(--secondary))]/50">
                          <td colSpan={4} className="py-3 px-4 text-sm font-semibold text-[hsl(var(--foreground))]">Total Labour Cost</td>
                          <td className="py-3 px-4 text-sm text-right font-bold text-[hsl(var(--foreground))]">LKR {totalLabourCost.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rooms" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="h-5 w-5 text-[hsl(var(--accent))]" />
                    Detected Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roomData.map((room, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-[hsl(var(--border))]/50 bg-[hsl(var(--secondary))]/20 hover:bg-[hsl(var(--secondary))]/40 transition-colors"
                      >
                        <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">{room.name}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-[hsl(var(--muted-foreground))]">Area</p>
                            <p className="font-medium text-[hsl(var(--foreground))]">{room.area} m²</p>
                          </div>
                          <div>
                            <p className="text-[hsl(var(--muted-foreground))]">Perimeter</p>
                            <p className="font-medium text-[hsl(var(--foreground))]">{room.perimeter} m</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Floor Area</p>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                          {roomData.reduce((sum, room) => sum + room.area, 0).toFixed(1)} m²
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Wall Length</p>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                          {(roomData.reduce((sum, room) => sum + room.perimeter, 0) / 2).toFixed(1)} m
                        </p>
                      </div>
                    </div>
                  </div>
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

function SummaryCard({ icon, label, value, change, positive }) {
  return (
    <Card className="shadow-card hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
            {icon}
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              positive ? "text-[hsl(var(--success))]" : "text-[hsl(var(--muted-foreground))]"
            }`}
          >
            {positive && <TrendingUp className="h-3 w-3" />}
            {change}
          </div>

        </div>

        <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
        <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

export default Dashboard;
