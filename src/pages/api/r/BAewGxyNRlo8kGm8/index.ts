import type { NextApiRequest, NextApiResponse } from "next";
import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const htmlPath = join(process.cwd(), "src/pages/api/r/BAewGxyNRlo8kGm8/report.html");
  const html = readFileSync(htmlPath, "utf-8");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex");
  res.status(200).send(html);
}
