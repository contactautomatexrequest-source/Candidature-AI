import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { CvPdfDocument } from "@/lib/pdf/CvPdfDocument";

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const { cvData, type = "cv" } = body;

    if (!cvData) {
      return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
    }

    // Vérifier le statut d'abonnement pour le watermark
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const hasWatermark = profile?.subscription_status !== "active";

    let pdfBuffer: Buffer;
    if (type === "cv" && cvData.cv) {
      pdfBuffer = await renderToBuffer(
        React.createElement(CvPdfDocument, { cvData: cvData.cv, hasWatermark }) as any
      );
    } else {
      // Pour la lettre et le message, on peut créer un PDF simple
      return NextResponse.json({ error: "NOT_IMPLEMENTED" }, { status: 501 });
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cv-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "PDF_GENERATION_FAILED" }, { status: 500 });
  }
}

