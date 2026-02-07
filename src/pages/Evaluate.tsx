import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  CloudUpload,
  FileText,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  file: File;
  type: "pdd" | "calculation";
}

export default function Evaluate() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const pddFile = files.find((f) => f.type === "pdd");
  const calculationFile = files.find((f) => f.type === "calculation");
  const canRunAudit = pddFile && calculationFile && !isProcessing;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase();
        let type: "pdd" | "calculation" | null = null;

        if (extension === "pdf") {
          type = "pdd";
        } else if (extension === "xlsx" || extension === "xls") {
          type = "calculation";
        }

        if (type) {
          setFiles((prev) => {
            const filtered = prev.filter((f) => f.type !== type);
            return [...filtered, { file, type }];
          });
        } else {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: "Please upload PDF for PDD or Excel files for calculations.",
          });
        }
      });
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: true,
  });

  const removeFile = (type: "pdd" | "calculation") => {
    setFiles((prev) => prev.filter((f) => f.type !== type));
  };

  const runAudit = async () => {
    if (!canRunAudit) return;

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to run a pre-audit and save your reports.",
      });
      navigate("/auth");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate progress for now (will be replaced with actual API call)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      // TODO: Implement actual API call to process documents
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setProgress(100);

      // Navigate to results (mock ID for now)
      setTimeout(() => {
        navigate("/results/demo");
      }, 500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "There was an error processing your documents. Please try again.",
      });
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold mb-2">Pre-Audit Your Documents</h1>
              <p className="text-muted-foreground">
                Upload your PDD and calculation spreadsheet for JCM compliance validation
              </p>
            </div>

            {/* Upload Area */}
            <Card className="shadow-soft border-border mb-6">
              <CardContent className="p-8">
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                    isDragActive
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <input {...getInputProps()} />
                  <CloudUpload
                    className={cn(
                      "mx-auto mb-4 transition-colors",
                      isDragActive ? "text-primary" : "text-muted-foreground"
                    )}
                    size={48}
                    strokeWidth={1.5}
                  />
                  <h3 className="text-lg font-medium mb-2">
                    {isDragActive ? "Drop files here" : "Upload Project Documents"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    PDD (PDF) and Calculation Spreadsheet (XLSX)
                  </p>
                </div>

                {/* File Status */}
                <div className="mt-6 space-y-3">
                  <FileStatus
                    label="Project Design Document"
                    file={pddFile?.file}
                    icon={FileText}
                    onRemove={() => removeFile("pdd")}
                  />
                  <FileStatus
                    label="Calculation Spreadsheet"
                    file={calculationFile?.file}
                    icon={FileSpreadsheet}
                    onRemove={() => removeFile("calculation")}
                  />
                </div>

                {/* Progress */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6"
                  >
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Processing documents...</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </motion.div>
                )}

                {/* Run Button */}
                <Button
                  onClick={runAudit}
                  disabled={!canRunAudit}
                  className="w-full mt-6"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Documents...
                    </>
                  ) : (
                    "Run Pre-Audit"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="shadow-soft border-border">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    PDD (PDF)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your Project Design Document containing project details and methodology
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-soft border-border">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-primary" />
                    Calculation Sheet (XLSX)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Excel file with emission calculations and monitoring data
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

interface FileStatusProps {
  label: string;
  file?: File;
  icon: React.ElementType;
  onRemove: () => void;
}

function FileStatus({ label, file, icon: Icon, onRemove }: FileStatusProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors",
        file ? "bg-accent border-primary/20" : "bg-muted/50 border-border"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className={file ? "text-primary" : "text-muted-foreground"}
        />
        <div>
          <p className="text-sm font-medium">
            {file ? file.name : label}
          </p>
          {file && (
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>
      {file ? (
        <button
          onClick={onRemove}
          className="p-1 hover:bg-background rounded transition-colors"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      ) : (
        <CheckCircle2 size={20} className="text-muted-foreground/30" />
      )}
    </div>
  );
}
