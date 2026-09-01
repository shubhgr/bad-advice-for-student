import { NextRequest, NextResponse } from "next/server";
import {
  appendDownloadClickRow,
  isGoogleSheetsConfigured,
} from "@/lib/google-sheets";
import { parseTrackingFromUrl } from "@/lib/utm";

export const dynamic = "force-dynamic";

type DownloadClickBody = {
  location?: string;
  button?: string;
  name?: string;
  href?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
};

export async function POST(request: NextRequest) {
  let body: DownloadClickBody;

  try {
    body = (await request.json()) as DownloadClickBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Google Sheets tracking is not configured" },
      { status: 202 },
    );
  }

  try {
    const href = body.href?.trim() || "";
    const fromHref = parseTrackingFromUrl(href);
    const utmSource = body.utm_source?.trim() || fromHref.utm_source || "";
    const utmMedium = body.utm_medium?.trim() || fromHref.utm_medium || "";
    const utmCampaign = body.utm_campaign?.trim() || fromHref.utm_campaign || "";
    const utmTerm = body.utm_term?.trim() || fromHref.utm_term || "";
    const utmContent = body.utm_content?.trim() || fromHref.utm_content || "";
    const hasAnyUtm = Boolean(
      utmSource || utmMedium || utmCampaign || utmTerm || utmContent,
    );
    // Direct visits: mark clearly in the sheet without changing the download URL
    const noUtmLabel = "no_utm";

    await appendDownloadClickRow({
      timestamp: new Date().toISOString(),
      page: body.location?.trim() || "bridge",
      button: body.button?.trim() || "Download the App now!",
      name: body.name?.trim() || "",
      utmSource: hasAnyUtm ? utmSource : noUtmLabel,
      utmMedium: hasAnyUtm ? utmMedium : noUtmLabel,
      utmCampaign: hasAnyUtm ? utmCampaign : noUtmLabel,
      utmTerm: hasAnyUtm ? utmTerm : "",
      utmContent: hasAnyUtm ? utmContent : "",
      downloadUrl: href,
      userAgent: request.headers.get("user-agent") || "",
      referrer: body.referrer?.trim() || request.headers.get("referer") || "",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to log download click to Google Sheets:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to save click" },
      { status: 500 },
    );
  }
}
