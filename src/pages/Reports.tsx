import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  FileText,
  Calendar,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for demo
const mockReports = [
  {
    id: "1",
    projectName: "Rice Paddy Emission Reduction Project - Luzon",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    majorIssues: 2,
    minorIssues: 3,
    status: "completed",
  },
  {
    id: "2",
    projectName: "Sustainable Rice Farming Initiative - Visayas",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    majorIssues: 0,
    minorIssues: 1,
    status: "completed",
  },
  {
    id: "3",
    projectName: "Climate Smart Agriculture Project - Mindanao",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    majorIssues: 1,
    minorIssues: 4,
    status: "completed",
  },
];

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const filteredReports = mockReports.filter((report) =>
    report.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-12 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-md text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-semibold mb-2">Sign in to view reports</h1>
              <p className="text-muted-foreground mb-6">
                Create an account or sign in to access your pre-audit reports.
              </p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold">Audit Reports</h1>
                <p className="text-muted-foreground mt-1">
                  View and manage your pre-audit reports
                </p>
              </div>
              <Button asChild>
                <Link to="/evaluate">
                  <Plus size={16} className="mr-2" />
                  New Audit
                </Link>
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
              <Card className="shadow-soft border-border">
                <CardContent className="p-12 text-center">
                  <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reports found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try a different search term"
                      : "Run your first pre-audit to get started"}
                  </p>
                  {!searchQuery && (
                    <Button asChild>
                      <Link to="/evaluate">Start Pre-Audit</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className="shadow-soft border-border hover:shadow-medium transition-shadow cursor-pointer"
                      onClick={() => navigate(`/results/${report.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{report.projectName}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(report.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <div className="flex items-center gap-2">
                                {report.majorIssues > 0 && (
                                  <Badge variant="destructive" className="gap-1">
                                    <AlertCircle size={12} />
                                    {report.majorIssues} Major
                                  </Badge>
                                )}
                                {report.minorIssues > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1 bg-warning text-warning-foreground"
                                  >
                                    <AlertTriangle size={12} />
                                    {report.minorIssues} Minor
                                  </Badge>
                                )}
                                {report.majorIssues === 0 && report.minorIssues === 0 && (
                                  <Badge variant="secondary" className="gap-1 bg-success text-success-foreground">
                                    All Clear
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-muted-foreground ml-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
