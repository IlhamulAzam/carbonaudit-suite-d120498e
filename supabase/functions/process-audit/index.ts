import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// JCM_PH_AM004 Methodology Rules (Metric File)
const JCM_RULES = `
METRIC FILE: JCM_PH_AM004 — Methane Emission Reduction through Alternate Wetting and Drying (AWD) in Rice Paddies

RULE 1: Project Eligibility — Water Management Change
The project must document a change from continuous flooding to alternate wetting and drying (AWD) or single/multiple drainage practices in rice cultivation.

RULE 2: Baseline Emission Formula
Baseline CH₄ emissions must be calculated using the formula:
RECH4,s = Σ(EFCH4,R,s,st × As,st × 10⁻³ × GWP_CH4)
where EFCH4,R,s,st is the emission factor, As,st is the area, and GWP_CH4 is the global warming potential of methane.

RULE 3: GWP Values
The project must use GWP_CH4 = 28 (IPCC AR5) for methane and GWP_N2O = 265 for nitrous oxide. Any other GWP values are non-compliant.

RULE 4: Scaling Factor Documentation (SFp)
The pre-season water regime scaling factor (SFp) must be documented based on Table 2 of the methodology. Values must correspond to actual pre-season water management practices.

RULE 5: Scaling Factor Documentation (SFw)
The cultivation water regime scaling factor (SFw) must be documented. For AWD projects, SFw values must reflect the specific drainage regime implemented.

RULE 6: Emission Factor Values
Default emission factors must align with IPCC guidelines:
- Dry season: 1.46 kgCH₄/ha/day
- Wet season: 2.95 kgCH₄/ha/day
Sources must be properly cited (IPCC 2019 Refinement to the 2006 IPCC Guidelines, Volume 4, Chapter 5).

RULE 7: Organic Amendment Conversion Factor (CFOA)
If organic amendments are applied, the conversion factor CFOA must be documented with values from Table 3 of the methodology.

RULE 8: Drainage Depth Requirements
Drainage depth must reach at least -15cm below soil surface during drainage events. Measurement evidence must be provided.

RULE 9: Monitoring Frequency
Water level/drainage depth measurements must be taken at least weekly during the cultivation period. Monthly measurements alone are insufficient.

RULE 10: Uncertainty Deduction
An uncertainty deduction factor between 0.05 and 0.15 must be applied to emission reduction calculations. The chosen value must be justified.

RULE 11: Stratum Classification
Project areas must be classified into strata based on rice variety, water management practice, soil type, and season. Each stratum must be clearly defined.

RULE 12: N₂O Emission Calculations
If AWD increases N₂O emissions, these must be calculated and subtracted from emission reductions:
REN2O = Σ(EFN2O × As,st × 10⁻³ × GWP_N2O)

RULE 13: Monitoring Plan Completeness
The monitoring plan must include: measurement parameters, frequency, responsible party, QA/QC procedures, and data management protocols.

RULE 14: Project Boundary Definition
The project boundary must clearly define the geographic area, rice paddies included, and any exclusions with justification.

RULE 15: Crediting Period
The crediting period must be clearly stated and must not exceed the maximum allowed under JCM guidelines (typically 10 years, renewable).

RULE 16: Data Cross-Consistency
Values reported in the PDD text must match those in the calculation spreadsheet. Any discrepancies in emission totals, areas, or parameters constitute non-compliance.

RULE 17: Additionality Demonstration
The project must demonstrate additionality — that the emission reductions would not have occurred without the project intervention.
`;

async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  // Simple PDF text extraction - extract readable text content
  const bytes = new Uint8Array(fileBuffer);
  const text = new TextDecoder("latin1").decode(bytes);
  
  // Extract text between stream/endstream markers and other readable content
  const extractedParts: string[] = [];
  
  // Try to find text in PDF streams
  const streamRegex = /stream\s*\n([\s\S]*?)endstream/g;
  let match;
  while ((match = streamRegex.exec(text)) !== null) {
    const content = match[1];
    // Extract readable ASCII text
    const readable = content.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    if (readable.length > 20) {
      extractedParts.push(readable);
    }
  }
  
  // Also try to extract text from Tj/TJ operators
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  while ((match = tjRegex.exec(text)) !== null) {
    extractedParts.push(match[1]);
  }
  
  // Extract text from TJ arrays
  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(text)) !== null) {
    const items = match[1];
    const textParts = items.match(/\(([^)]*)\)/g);
    if (textParts) {
      extractedParts.push(textParts.map(p => p.slice(1, -1)).join(""));
    }
  }

  // Also grab any plain readable text segments
  const plainTextRegex = /[A-Za-z][A-Za-z0-9\s.,;:!?'"()\-/%=+]{30,}/g;
  while ((match = plainTextRegex.exec(text)) !== null) {
    if (!extractedParts.includes(match[0])) {
      extractedParts.push(match[0]);
    }
  }

  const result = extractedParts.join("\n\n");
  return result || "Unable to extract text from PDF. The document may be image-based or encrypted.";
}

function extractTextFromExcel(fileBuffer: ArrayBuffer): string {
  // XLSX files are ZIP archives. Extract shared strings and sheet data.
  const bytes = new Uint8Array(fileBuffer);
  const text = new TextDecoder("latin1").decode(bytes);
  
  const extractedParts: string[] = [];
  
  // Extract readable strings from the XLSX binary
  const readableRegex = /[A-Za-z0-9][A-Za-z0-9\s.,;:!?'"()\-/%=+<>]{5,}/g;
  let match;
  while ((match = readableRegex.exec(text)) !== null) {
    const cleaned = match[0].trim();
    if (cleaned.length > 5) {
      extractedParts.push(cleaned);
    }
  }
  
  // Try to find XML content within the XLSX
  const xmlRegex = /<[a-z][^>]*>([^<]+)</gi;
  while ((match = xmlRegex.exec(text)) !== null) {
    const content = match[1].trim();
    if (content.length > 2 && !/^\d+$/.test(content)) {
      extractedParts.push(content);
    }
  }

  // Deduplicate
  const unique = [...new Set(extractedParts)];
  const result = unique.join("\n");
  return result || "Unable to extract data from spreadsheet.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables not configured");
    }

    const formData = await req.formData();
    const pddFile = formData.get("pdd") as File | null;
    const calculationFile = formData.get("calculation") as File | null;

    if (!pddFile) {
      throw new Error("PDD file is required");
    }

    console.log(`Processing PDD: ${pddFile.name} (${pddFile.size} bytes)`);
    if (calculationFile) {
      console.log(`Processing Calculation: ${calculationFile.name} (${calculationFile.size} bytes)`);
    }

    // Extract text from documents
    const pddBuffer = await pddFile.arrayBuffer();
    const pddText = await extractTextFromPDF(pddBuffer);
    console.log(`Extracted PDD text length: ${pddText.length} chars`);

    let calculationText = "";
    if (calculationFile) {
      const calcBuffer = await calculationFile.arrayBuffer();
      calculationText = extractTextFromExcel(calcBuffer);
      console.log(`Extracted calculation text length: ${calculationText.length} chars`);
    }

    // Truncate to fit context window
    const maxPddChars = 25000;
    const maxCalcChars = 10000;
    const truncatedPdd = pddText.length > maxPddChars ? pddText.substring(0, maxPddChars) + "\n[...TRUNCATED]" : pddText;
    const truncatedCalc = calculationText.length > maxCalcChars ? calculationText.substring(0, maxCalcChars) + "\n[...TRUNCATED]" : calculationText;

    // Build the LLM prompt
    const systemPrompt = `You are a STRICT rule-based document compliance checker for JCM carbon credit methodology.

Your job is to compare an UPLOADED DOCUMENT against a METRIC FILE that contains rules/requirements.

You MUST behave like a deterministic validator, NOT a general chatbot.

MANDATORY BEHAVIOR RULES:
1. Use ONLY the provided METRIC FILE (the JCM rules below).
2. DO NOT use outside knowledge.
3. DO NOT guess or assume missing rules.
4. DO NOT generate generic or default answers.
5. Your output MUST change depending on the uploaded document content.
6. Every conclusion MUST be supported by quoting evidence from the document or stating "NOT FOUND".
7. If you cannot find supporting text, explicitly say "NOT FOUND".
8. NEVER give the same fixed/template response for different inputs.
9. If you produce an answer without referencing the provided context, the answer is INVALID.

You must return a JSON response with this exact structure:
{
  "projectName": "extracted project name or 'Unknown Project'",
  "issues": [
    {
      "severity": "major" or "minor",
      "category": "calculation" or "parameters" or "eligibility" or "monitoring" or "documentation",
      "title": "concise issue title",
      "section": "section/location reference from document or 'General'",
      "description": "what is wrong, with EXACT QUOTES from the document as evidence",
      "suggestedFix": "actionable fix recommendation",
      "status": "FAIL" or "NOT FOUND"
    }
  ],
  "compliantRules": [
    {
      "ruleNumber": 1,
      "title": "rule name",
      "evidence": "exact quote from document proving compliance"
    }
  ],
  "summary": "brief summary based ONLY on findings above"
}

Severity classification:
- "major": Rule FAIL with evidence of wrong values, missing critical calculations, or formula errors
- "minor": Rule NOT FOUND (missing documentation) or minor discrepancies

CRITICAL: You must evaluate EVERY rule. Different documents MUST produce different results.
Return ONLY valid JSON, no markdown or other formatting.`;

    const userPrompt = `METRIC FILE:
${JCM_RULES}

UPLOADED PDD DOCUMENT:
${truncatedPdd}

${truncatedCalc ? `UPLOADED CALCULATION SPREADSHEET:
${truncatedCalc}` : "NO CALCULATION SPREADSHEET PROVIDED - mark Rule 16 (Data Cross-Consistency) as NOT FOUND."}

Now evaluate this document against ALL 17 rules. Return the JSON compliance report.`;

    console.log("Calling AI gateway for evaluation...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 8000,
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text();
      throw new Error(`AI gateway call failed [${aiResponse.status}]: ${errBody}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Empty response from AI gateway");
    }

    console.log("AI response received, parsing...");

    // Extract JSON from response (handle potential markdown wrapping)
    let jsonStr = rawContent;
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    // Also try to find raw JSON
    const jsonStart = jsonStr.indexOf("{");
    const jsonEnd = jsonStr.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    }

    let report;
    try {
      report = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", rawContent.substring(0, 500));
      throw new Error("Failed to parse AI evaluation response");
    }

    // Get auth token if provided
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Save to database if user is authenticated
    let reportId: string | null = null;
    if (userId) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const majorCount = report.issues?.filter((i: any) => i.severity === "major").length || 0;
      const minorCount = report.issues?.filter((i: any) => i.severity === "minor").length || 0;
      const compliantCount = report.compliantRules?.length || 0;

      const { data: reportData, error: reportError } = await supabase
        .from("audit_reports")
        .insert({
          user_id: userId,
          project_name: report.projectName || "Unknown Project",
          major_issues_count: majorCount,
          minor_issues_count: minorCount,
          compliant_count: compliantCount,
          status: "completed",
        })
        .select("id")
        .single();

      if (reportError) {
        console.error("Error saving report:", reportError);
      } else if (reportData) {
        reportId = reportData.id;
        
        // Save issues
        const issues = (report.issues || []).map((issue: any) => ({
          report_id: reportData.id,
          severity: issue.severity,
          category: issue.category || "general",
          title: issue.title,
          section: issue.section || null,
          description: issue.description,
          suggested_fix: issue.suggestedFix || null,
        }));

        if (issues.length > 0) {
          const { error: issuesError } = await supabase.from("audit_issues").insert(issues);
          if (issuesError) {
            console.error("Error saving issues:", issuesError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reportId,
        report: {
          projectName: report.projectName || "Unknown Project",
          summary: {
            major: report.issues?.filter((i: any) => i.severity === "major").length || 0,
            minor: report.issues?.filter((i: any) => i.severity === "minor").length || 0,
            compliant: report.compliantRules?.length || 0,
          },
          issues: report.issues || [],
          compliantRules: report.compliantRules || [],
          overallSummary: report.summary || "",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing audit:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
