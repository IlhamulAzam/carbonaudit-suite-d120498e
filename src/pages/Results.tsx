import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Download,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditIssue {
  id?: string;
  severity: "major" | "minor";
  category: string;
  title: string;
  section: string | null;
  description: string;
  suggestedFix?: string;
  suggested_fix?: string;
  status?: string;
}

interface AuditReport {
  projectName: string;
  summary: {
    major: number;
    minor: number;
    compliant: number;
  };
  issues: AuditIssue[];
  compliantRules?: { ruleNumber: number; title: string; evidence: string }[];
  overallSummary?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  calculation: "Calculation Accuracy",
  parameters: "Parameter Compliance",
  eligibility: "Eligibility Criteria",
  monitoring: "Monitoring Requirements",
  documentation: "Documentation Completeness",
  general: "General",
};

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    // First try sessionStorage (for just-completed audits)
    const cached = sessionStorage.getItem("auditResult");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setReport(parsed);
        // Expand all categories by default
        const cats = [...new Set((parsed.issues || []).map((i: AuditIssue) => i.category))];
        setExpandedCategories(cats as string[]);
        setLoading(false);
        sessionStorage.removeItem("auditResult");
        return;
      } catch {}
    }

    // Then try database
    if (id && id !== "local") {
      try {
        const { data: reportData } = await supabase
          .from("audit_reports")
          .select("*")
          .eq("id", id)
          .single();

        if (reportData) {
          const { data: issuesData } = await supabase
            .from("audit_issues")
            .select("*")
            .eq("report_id", id);

          const auditReport: AuditReport = {
            projectName: reportData.project_name,
            summary: {
              major: reportData.major_issues_count,
              minor: reportData.minor_issues_count,
              compliant: reportData.compliant_count,
            },
            issues: (issuesData || []).map((issue) => ({
              id: issue.id,
              severity: issue.severity as "major" | "minor",
              category: issue.category,
              title: issue.title,
              section: issue.section,
              description: issue.description,
              suggestedFix: issue.suggested_fix || undefined,
            })),
          };

          setReport(auditReport);
          const cats = [...new Set((auditReport.issues || []).map((i) => i.category))];
          setExpandedCategories(cats);
        }
      } catch (err) {
        console.error("Error loading report:", err);
      }
    }

    setLoading(false);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-4xl flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-4xl text-center py-20">
            <h1 className="text-2xl font-semibold mb-2">Report not found</h1>
            <p className="text-muted-foreground mb-6">
              This report may have been deleted or you may not have access to it.
            </p>
            <Button asChild>
              <Link to="/evaluate">Run New Audit</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Group issues by category
  const issuesByCategory = (report.issues || []).reduce<Record<string, AuditIssue[]>>(
    (acc, issue) => {
      const cat = issue.category || "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(issue);
      return acc;
    },
    {}
  );

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
                <Link
                  to="/evaluate"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  New Audit
                </Link>
                <h1 className="text-3xl font-semibold">Pre-Audit Report</h1>
                <p className="text-muted-foreground mt-1">
                  {report.projectName}
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <SummaryCard
                label="Major Issues"
                count={report.summary.major}
                variant="destructive"
                icon={AlertCircle}
              />
              <SummaryCard
                label="Minor Issues"
                count={report.summary.minor}
                variant="warning"
                icon={AlertTriangle}
              />
              <SummaryCard
                label="Compliant"
                count={report.summary.compliant}
                variant="success"
                icon={CheckCircle2}
              />
            </div>

            {/* Overall Summary */}
            {report.overallSummary && (
              <Card className="shadow-soft border-border mb-6">
                <CardContent className="p-6">
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">{report.overallSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Issues by Category */}
            <div className="space-y-4">
              {Object.entries(issuesByCategory).map(([category, issues]) => (
                <Card key={category} className="shadow-soft border-border overflow-hidden">
                  <Collapsible
                    open={expandedCategories.includes(category)}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <CardTitle className="text-lg">
                                {CATEGORY_LABELS[category] || category}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {issues.length} issue{issues.length !== 1 && "s"} found
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            size={20}
                            className={cn(
                              "text-muted-foreground transition-transform",
                              expandedCategories.includes(category) && "rotate-180"
                            )}
                          />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        {issues.map((issue, idx) => (
                          <IssueCard key={issue.id || idx} issue={issue} />
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>

            {/* Compliant Rules */}
            {report.compliantRules && report.compliantRules.length > 0 && (
              <Card className="shadow-soft border-border mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-success" />
                    Compliant Rules ({report.compliantRules.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {report.compliantRules.map((rule) => (
                    <div
                      key={rule.ruleNumber}
                      className="p-3 rounded-lg bg-success/5 border border-success/20"
                    >
                      <p className="text-sm font-medium">
                        Rule {rule.ruleNumber}: {rule.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Evidence: {rule.evidence}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  count: number;
  variant: "destructive" | "warning" | "success";
  icon: React.ElementType;
}

function SummaryCard({ label, count, variant, icon: Icon }: SummaryCardProps) {
  const variantStyles = {
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning-foreground border-warning/20",
    success: "bg-success/10 text-success border-success/20",
  };

  return (
    <Card className={cn("border", variantStyles[variant])}>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon size={24} />
        <div>
          <p className="text-2xl font-semibold">{count}</p>
          <p className="text-sm opacity-80">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function IssueCard({ issue }: { issue: AuditIssue }) {
  const fix = issue.suggestedFix || issue.suggested_fix;
  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        issue.severity === "major"
          ? "bg-destructive/5 border-destructive/20"
          : "bg-warning/5 border-warning/20"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={issue.severity === "major" ? "destructive" : "secondary"}
            className={issue.severity === "minor" ? "bg-warning text-warning-foreground" : ""}
          >
            {issue.severity === "major" ? "Major" : "Minor"}
          </Badge>
          {issue.status && (
            <Badge variant="outline" className="text-xs">
              {issue.status}
            </Badge>
          )}
          <h4 className="font-medium">{issue.title}</h4>
        </div>
      </div>
      {issue.section && (
        <p className="text-sm text-muted-foreground mb-2">{issue.section}</p>
      )}
      <p className="text-sm mb-3">{issue.description}</p>
      {fix && (
        <div className="bg-background/50 p-3 rounded-md border border-border">
          <p className="text-sm">
            <span className="font-medium text-primary">Suggested fix: </span>
            {fix}
          </p>
        </div>
      )}
    </div>
  );
}
