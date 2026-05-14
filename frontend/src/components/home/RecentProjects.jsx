import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderOpen,
  Pencil,
  FileText,
  Calendar,
  ArrowRight,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../lib/axios";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

// Recent projects with quick actions
const RecentProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await axiosInstance.get("/api/project/list");
        if (data.success) {
          // Backend already returns newest first
          setProjects((data.projects || []).slice(0, 3));
        }
      } catch {
        /* silent — Home page should still render even if list fails */
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Don't render anything for guests
  if (!user) return null;

  return (
    <section className="py-16 px-6 md:px-16 lg:px-24 xl:px-32 bg-[hsl(var(--background))]">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]">
              Your Recent Projects
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Pick up where you left off, or start something new.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="text-sm font-medium text-[hsl(var(--accent))] hover:underline inline-flex items-center gap-1"
          >
            View all projects
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-card animate-pulse">
                <CardContent className="p-5">
                  <div className="h-4 bg-[hsl(var(--muted))] rounded w-2/3 mb-3" />
                  <div className="h-3 bg-[hsl(var(--muted))]/70 rounded w-1/2 mb-5" />
                  <div className="h-6 bg-[hsl(var(--muted))]/70 rounded w-3/4 mb-4" />
                  <div className="h-8 bg-[hsl(var(--muted))]/70 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-10 text-center">
              <FolderOpen className="h-14 w-14 mx-auto text-[hsl(var(--muted-foreground))] opacity-40 mb-4" />
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">
                No projects yet
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">
                Upload your first floor plan to begin estimating.
              </p>
              <Link to="/upload">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Upload First Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Project grid */}
        {!loading && projects.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Card
                key={p._id}
                className="shadow-card hover:shadow-lg transition-shadow group"
              >
                <CardContent className="p-5">
                  {/* Title + status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[hsl(var(--foreground))] truncate">
                        {p.name}
                      </h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(p.createdAt).toLocaleDateString()}
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

                  {/* Cost or pending text */}
                  {p.estimate?.totalCost > 0 ? (
                    <div className="mb-4">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Estimate
                      </p>
                      <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                        LKR {(p.estimate.totalCost / 1_000_000).toFixed(2)}M
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 italic">
                      Estimate not yet calculated
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/dashboard?id=${p._id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        Open
                      </Button>
                    </Link>
                    <Link to={`/editor?id=${p._id}`}>
                      <Button size="sm" variant="outline" title="Edit plan">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentProjects;
