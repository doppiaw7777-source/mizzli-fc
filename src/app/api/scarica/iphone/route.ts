import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/public-origin";
import { getTeamData } from "@/lib/storage";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function iconBase64() {
  const candidates = [
    path.join(process.cwd(), "public", "icon-180.png"),
    path.join(process.cwd(), "public", "brand", "mizzli-crest.png"),
    path.join(process.cwd(), "public", "apple-touch-icon.png"),
  ];
  for (const file of candidates) {
    try {
      return (await readFile(file)).toString("base64");
    } catch {
      /* try next */
    }
  }
  return "";
}

export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const data = await getTeamData();
  const name = data.settings.teamName || "MIZZLI FC";
  const icon = await iconBase64();
  const fileName = `${name.replace(/[^\w.-]+/g, "-")}.mobileconfig`;

  const profile = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      <key>Icon</key>
      <data>${icon}</data>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>${xmlEscape(name)}</string>
      <key>PayloadDescription</key>
      <string>Icona Home di ${xmlEscape(name)}</string>
      <key>PayloadDisplayName</key>
      <string>${xmlEscape(name)}</string>
      <key>PayloadIdentifier</key>
      <string>com.noldi.fcunited.webclip</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>B8D5F3C2-7E40-4F9B-AD22-1A3F9C8B7E6D</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <true/>
      <key>URL</key>
      <string>${xmlEscape(origin)}/</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Installa ${xmlEscape(name)} in Home, a schermo intero.</string>
  <key>PayloadDisplayName</key>
  <string>${xmlEscape(name)}</string>
  <key>PayloadIdentifier</key>
  <string>com.noldi.fcunited.download</string>
  <key>PayloadOrganization</key>
  <string>${xmlEscape(name)}</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>A7C4E2B1-6D3F-4E8A-9C11-0F2E8B7A6D5C</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>
`;

  return new NextResponse(profile, {
    headers: {
      "Content-Type": "application/x-apple-aspen-config; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
