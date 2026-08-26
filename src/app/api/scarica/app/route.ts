import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const ZIP_REL = ["public", "downloads", "MIZZLI-FC-app.zip"] as const;
const FILE_NAME = "MIZZLI-FC-app.zip";

function zipPath() {
  return path.join(process.cwd(), ...ZIP_REL);
}

async function fileReady(file: string) {
  try {
    const st = await fs.stat(file);
    return st.isFile() && st.size > 1000;
  } catch {
    return false;
  }
}

function packApp() {
  const script = path.join(process.cwd(), "scripts", "pack-app.sh");
  return new Promise<void>((resolve, reject) => {
    const child = spawn("bash", [script], { cwd: process.cwd() });
    let err = "";
    child.stderr.on("data", (chunk) => {
      err += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err || `pack-app exited ${code}`));
    });
  });
}

export async function GET() {
  const file = zipPath();
  if (!(await fileReady(file))) {
    try {
      await packApp();
    } catch {
      return NextResponse.json(
        { error: "File dell'app non disponibile" },
        { status: 500 }
      );
    }
  }
  if (!(await fileReady(file))) {
    return NextResponse.json(
      { error: "File dell'app non disponibile" },
      { status: 500 }
    );
  }

  const data = await fs.readFile(file);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${FILE_NAME}"`,
      "Cache-Control": "no-store",
      "Content-Length": String(data.byteLength),
    },
  });
}
