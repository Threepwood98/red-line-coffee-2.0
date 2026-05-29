import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const sourceDir = path.join(root, "src", "lib", "data");
const destDir = process.env.DATA_DIR || path.join(root, "data");

try {
  await fs.mkdir(destDir, { recursive: true });
  const files = await fs.readdir(sourceDir);

  let count = 0;
  for (const file of files) {
    if (file.endsWith(".json")) {
      await fs.copyFile(path.join(sourceDir, file), path.join(destDir, file));
      console.log(`  ✓ ${file}`);
      count++;
    }
  }

  if (count === 0) {
    console.warn("  ⚠ No se encontraron archivos JSON en src/lib/data/");
  } else {
    console.log(`\n  ${count} archivo(s) copiado(s) a ${destDir}`);
  }
} catch (err) {
  if (err.code === "ENOENT") {
    console.warn(
      "  ⚠ Directorio src/lib/data/ no encontrado. " +
        "Compila sin datos semilla o usa DATA_DIR manualmente.",
    );
  } else {
    console.error("  ✗ Error:", err.message);
    process.exit(1);
  }
}
