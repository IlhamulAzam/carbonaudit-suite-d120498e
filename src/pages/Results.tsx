import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Navbar } from "@/components/Navbar";
import {
  ArrowLeft,
  Download,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Settings2,
  Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for demo
const mockReport = {
  id: "demo",
  projectName: "Rice Paddy Emission Reduction Project - Luzon",
  createdAt: new Date().toISOString(),
  summary: {
    major: 2,
    minor: 3,
    compliant: 12,
  },
  categories: [
    {
      id: "calculation",
      name: "Calculation Accuracy",
      icon: Calculator,
      issues: [
        {
          id: "1",
          severity: "major" as const,
          title: "CH₄ emission calculation mismatch",
          section: "Section 5.2 - Emission Calculations",
          description:
            "The CH₄ emission total in the PDD (12,450 tCO₂e) does not match the calculation spreadsheet (11,890 tCO₂e). This represents a 4.7% discrepancy.",
          suggestedFix:
            "Recalculate CH₄ emissions using the formula RECH4,s = Σ(EFCH4,R,s,st × As,st × 10⁻³ × GWP_CH4) and ensure both documents use consistent input values.",
        },
        {
          id: "2",
          severity: "minor" as const,
          title: "GWP value rounding",
          section: "Section 5.1 - Methodology Parameters",
          description:
            "GWP for CH₄ is listed as 25 in one section but 28 in the calculations. The JCM methodology requires GWP_CH4 = 28.",
          suggestedFix:
            "Update all references to use GWP_CH4 = 28 as per IPCC AR5 values specified in the methodology.",
        },
      ],
    },
    {
      id: "parameters",
      name: "Parameter Compliance",
      icon: Settings2,
      issues: [
        {
          id: "3",
          severity: "major" as const,
          title: "Missing scaling factor documentation",
          section: "Annex B - Monitoring Parameters",
          description:
            "The pre-season water regime scaling factor (SFp) is not documented. This is required for baseline emission calculations.",
          suggestedFix:
            "Document the SFp value based on the actual pre-season water management practice. Use the values from Table 2 of the methodology.",
        },
        {
          id: "4",
          severity: "minor" as const,
          title: "Emission factor source not cited",
          section: "Section 4.3 - Default Values",
          description:
            "The emission factor for dry season (1.46 kgCH₄/ha/day) is used but the IPCC source is not properly cited.",
          suggestedFix:
            "Add citation: IPCC 2019 Refinement to the 2006 IPCC Guidelines, Volume 4, Chapter 5, Table 5.11.",
        },
      ],
    },
    {
      id: "eligibility",
      name: "Eligibility Criteria",
      icon: Droplets,
      issues: [
        {
          id: "5",
          severity: "minor" as const,
          title: "Drainage depth measurement frequency",
          section: "Section 6.2 - Monitoring Plan",
          description:
            "The monitoring plan specifies monthly drainage depth measurements, but weekly measurements are required during the cultivation period.",
          suggestedFix:
            "Update monitoring frequency to weekly measurements during cultivation and maintain the -15cm threshold verification.",
        },
      ],
    },
  ],
};

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    mockReport.categories.map((c) => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const totalIssues = mockReport.summary.major + mockReport.summary.minor;

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
                  to="/reports"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to Reports
                </Link>
                <h1 className="text-3xl font-semibold">Pre-Audit Report</h1>
                <p className="text-muted-foreground mt-1">
                  {mockReport.projectName}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generated on {new Date(mockReport.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Export PDF
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <SummaryCard
                label="Major Issues"
                count={mockReport.summary.major}
                variant="destructive"
                icon={AlertCircle}
              />
              <SummaryCard
                label="Minor Issues"
                count={mockReport.summary.minor}
                variant="warning"
                icon={AlertTriangle}
              />
              <SummaryCard
                label="Compliant"
                count={mockReport.summary.compliant}
                variant="success"
                icon={CheckCircle2}
              />
            </div>

            {/* Issues by Category */}
            <div className="space-y-4">
              {mockReport.categories.map((category) => (
                <Card key={category.id} className="shadow-soft border-border overflow-hidden">
                  <Collapsible
                    open={expandedCategories.includes(category.id)}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                              <category.icon size={20} className="text-accent-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {category.issues.length} issue{category.issues.length !== 1 && "s"} found
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            size={20}
                            className={cn(
                              "text-muted-foreground transition-transform",
                              expandedCategories.includes(category.id) && "rotate-180"
                            )}
                          />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        {category.issues.map((issue) => (
                          <IssueCard key={issue.id} issue={issue} />
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
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

interface Issue {
  id: string;
  severity: "major" | "minor";
  title: string;
  section: string;
  description: string;
  suggestedFix: string;
}

function IssueCard({ issue }: { issue: Issue }) {
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
          <h4 className="font-medium">{issue.title}</h4>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{issue.section}</p>
      <p className="text-sm mb-3">{issue.description}</p>
      <div className="bg-background/50 p-3 rounded-md border border-border">
        <p className="text-sm">
          <span className="font-medium text-primary">Suggested fix: </span>
          {issue.suggestedFix}
        </p>
      </div>
    </div>
  );
}
