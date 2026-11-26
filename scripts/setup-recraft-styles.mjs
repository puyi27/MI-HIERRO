import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const shouldUpload = process.argv.includes("--upload");
const rawDir = path.resolve("scripts/recraft-refs");
const cleanDir = path.resolve("scripts/recraft-refs-clean");
const styles = ["tradicional", "monograma", "geometrico", "heraldico"];
const validExt = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function normalizeFolder(styleName) {
    const inputFolder = path.join(rawDir, styleName);
    const outputFolder = path.join(cleanDir, styleName);
    fs.mkdirSync(outputFolder, { recursive: true });

    const files = fs
        .readdirSync(inputFolder)
        .filter((f) => validExt.has(path.extname(f).toLowerCase()))
        .slice(0, 10);

    if (files.length === 0) {
        throw new Error(`No images found in ${inputFolder}`);
    }

    const outputPaths = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const inputPath = path.join(inputFolder, file);
        const meta = await sharp(inputPath).metadata();

        if ((meta.width ?? 0) < 200 || (meta.height ?? 0) < 200) {
            console.warn(`[WARN] ${styleName}/${file} es muy pequena (${meta.width}x${meta.height})`);
        }

        const trimmed = await sharp(inputPath)
            .flatten({ background: "#ffffff" })
            .grayscale()
            .threshold(175)
            .trim({ background: "#ffffff", threshold: 20 })
            .resize(680, 680, { fit: "inside", background: "#ffffff" })
            .png()
            .toBuffer();

        const finalBuffer = await sharp({
            create: {
                width: 1024,
                height: 1024,
                channels: 3,
                background: { r: 255, g: 255, b: 255 },
            },
        })
            .composite([{ input: trimmed, gravity: "center" }])
            .png()
            .toBuffer();

        const outPath = path.join(outputFolder, `${styleName}-${i + 1}.png`);
        fs.writeFileSync(outPath, finalBuffer);
        outputPaths.push(outPath);
    }

    return outputPaths;
}

async function uploadStyle(styleName, filePaths) {
    const apiKey = process.env.RECRAFT_API_KEY;
    if (!apiKey) {
        throw new Error("Falta la variable RECRAFT_API_KEY");
    }

    const form = new FormData();
    form.append("model", "recraftv4_styles");

    filePaths.forEach((filePath, idx) => {
        const buffer = fs.readFileSync(filePath);
        form.append(`file${idx + 1}`, new Blob([buffer], { type: "image/png" }), path.basename(filePath));
    });

    const res = await fetch("https://external.api.recraft.ai/v1/styles", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
    });

    if (!res.ok) {
        throw new Error(`${styleName}: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return data.id;
}

for (const styleName of styles) {
    const cleanFiles = await normalizeFolder(styleName);
    console.log(`[OK] ${styleName}: ${cleanFiles.length} imagenes limpias en scripts/recraft-refs-clean/${styleName}`);

    if (shouldUpload) {
        const styleId = await uploadStyle(styleName, cleanFiles);
        console.log(`RECRAFT_STYLE_${styleName.toUpperCase()}=${styleId}`);
    }
}

if (!shouldUpload) {
    console.log("Revisa visualmente scripts/recraft-refs-clean/ y luego ejecuta con --upload");
}