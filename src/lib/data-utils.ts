import * as fs from "fs/promises";
import * as path from "path";

export function getDataDir(): string {
  return process.env.DATA_DIR ?? path.join(process.cwd(), "data");
}

export async function readJSON<T>(filename: string): Promise<T[]> {
  const filePath = path.join(getDataDir(), filename);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export async function writeJSON<T>(filename: string, data: T[]): Promise<void> {
  const dir = getDataDir();
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
