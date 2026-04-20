import jsPDF from "jspdf";

export interface LabelData {
  orderNumber: string;
  city: string;
  storeName: string;
  clientName: string;
  phone: string;
  address: string;
}

// A5 at 200 DPI — renders crisp barcodes and text at print resolution
const DPI = 200;
const PX = DPI / 25.4; // pixels per mm

function mm(val: number) { return Math.round(val * PX); }

// ── Canvas helpers ────────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number, fill: string
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

// pt → canvas px (matches jsPDF point sizes at our DPI)
function pt(points: number) { return Math.round(points * DPI / 72); }

// ── Asset loaders (cached) ────────────────────────────────────────────────────

let logoCache: HTMLImageElement | null = null;

async function loadLogo(): Promise<HTMLImageElement | null> {
  if (logoCache) return logoCache;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { logoCache = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = "/whiteexpresslogo.png";
  });
}

async function buildBarcode(text: string): Promise<HTMLCanvasElement | null> {
  try {
    // @ts-ignore
    const bwipjs = (await import("bwip-js")).default;
    const canvas = document.createElement("canvas");
    bwipjs.toCanvas(canvas, {
      bcid: "code128",
      text,
      scale: 5,
      height: 36,
      includetext: true,
      textxalign: "center",
      textsize: 14,
      textgaps: 2,
    });
    return canvas;
  } catch {
    return null;
  }
}

// ── Label canvas renderer ─────────────────────────────────────────────────────

async function renderLabelCanvas(data: LabelData): Promise<HTMLCanvasElement> {
  const W = mm(148);
  const H = mm(210);
  const MAR = mm(7);
  const CW = W - 2 * MAR;
  const FONT = '"Inter", "Segoe UI", Arial, sans-serif';

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Background ─────────────────────────────────────────────────────────────
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, mm(5), mm(5), W - mm(10), H - mm(10), mm(4), "#FFFFFF");

  // ── Logo ───────────────────────────────────────────────────────────────────
  const logo = await loadLogo();
  let sectionBottomY = MAR;

  if (logo) {
    const MAX_W = W - mm(4);
    const MAX_H = mm(26);
    const ar = logo.naturalWidth / logo.naturalHeight;
    let lw = MAX_W, lh = lw / ar;
    if (lh > MAX_H) { lh = MAX_H; lw = lh * ar; }
    const lx = (W - lw) / 2;
    const ly = MAR;
    ctx.drawImage(logo, lx, ly, lw, lh);
    sectionBottomY = ly + lh + mm(2);
  } else {
    roundRect(ctx, MAR, MAR, CW, mm(14), mm(3), "#3B5BDB");
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${pt(16)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("WHITE EXPRESS", W / 2, MAR + mm(7));
    sectionBottomY = MAR + mm(18);
  }

  // ── Barcode (~2× previous size) ────────────────────────────────────────────
  const barcodeCanvas = await buildBarcode(data.orderNumber);
  const barcodeY = sectionBottomY + mm(1);
  const BC_MAX_W = CW;
  const BC_MAX_H = mm(36);

  if (barcodeCanvas) {
    const ar = barcodeCanvas.width / barcodeCanvas.height;
    let bw = BC_MAX_W, bh = bw / ar;
    if (bh > BC_MAX_H) { bh = BC_MAX_H; bw = bh * ar; }
    ctx.drawImage(barcodeCanvas, (W - bw) / 2, barcodeY, bw, bh);
    sectionBottomY = barcodeY + bh + mm(2);
  } else {
    ctx.fillStyle = "#0F172A";
    ctx.font = `bold ${pt(18)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(data.orderNumber, W / 2, barcodeY + mm(12));
    sectionBottomY = barcodeY + mm(16);
  }

  // ── Divider ────────────────────────────────────────────────────────────────
  const divY = sectionBottomY + mm(1);
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = mm(0.4);
  ctx.beginPath();
  ctx.moveTo(MAR, divY);
  ctx.lineTo(W - MAR, divY);
  ctx.stroke();

  // ── Order badge ────────────────────────────────────────────────────────────
  const badgeY = divY + mm(2);
  const BADGE_H = mm(12);
  roundRect(ctx, MAR, badgeY, CW, BADGE_H, mm(2), "#F1F5F9");

  ctx.textBaseline = "middle";
  const badgeMid = badgeY + BADGE_H / 2;

  ctx.fillStyle = "#64748B";
  ctx.font = `bold ${pt(10)}px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("ЗАКАЗ", MAR + mm(4), badgeMid);

  ctx.fillStyle = "#1E293B";
  ctx.font = `bold ${pt(10)}px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillText(`#${data.orderNumber}`, W - MAR - mm(4), badgeMid);

  // ── Info rows ──────────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const fields = [
    { label: "ДАТА",     value: today },
    { label: "ГОРОД",    value: data.city },
    { label: "МАГАЗИН",  value: data.storeName },
    { label: "КЛИЕНТ",   value: data.clientName },
    { label: "ТЕЛЕФОН",  value: data.phone },
    { label: "АДРЕС",    value: data.address },
  ];

  const LABEL_COL   = mm(30);
  const VALUE_MAX_W = CW - LABEL_COL - mm(3);
  const ROW_FONT_PX = pt(13);
  const LABEL_FONT_PX = pt(9);
  const LINE_H  = mm(9);
  const ROW_PAD = mm(4);

  let curY = badgeY + BADGE_H + mm(4);
  ctx.textBaseline = "alphabetic";

  fields.forEach(({ label, value }, idx) => {
    // Word-wrap the value
    ctx.font = `${ROW_FONT_PX}px ${FONT}`;
    const words = (value || "—").split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > VALUE_MAX_W && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);

    const rowH = Math.max(lines.length * LINE_H, mm(14));

    // Zebra stripe
    if (idx % 2 === 0) {
      ctx.fillStyle = "#F8FAFC";
      ctx.fillRect(MAR, curY - mm(2), CW, rowH + mm(4));
    }

    // Label column
    ctx.fillStyle = "#94A3B8";
    ctx.font = `bold ${LABEL_FONT_PX}px ${FONT}`;
    ctx.textAlign = "left";
    ctx.fillText(label, MAR + mm(2), curY + mm(4));

    // Value column — city is bold, all others normal
    ctx.fillStyle = "#0F172A";
    const isCity = label === "ГОРОД";
    ctx.font = isCity
      ? `bold ${ROW_FONT_PX}px ${FONT}`
      : `${ROW_FONT_PX}px ${FONT}`;
    lines.forEach((l, li) => {
      ctx.fillText(l, MAR + LABEL_COL, curY + mm(4) + li * LINE_H);
    });

    curY += rowH + ROW_PAD;

    // Row divider
    if (idx < fields.length - 1) {
      ctx.strokeStyle = "#F1F5F9";
      ctx.lineWidth = mm(0.2);
      ctx.beginPath();
      ctx.moveTo(MAR, curY - mm(1));
      ctx.lineTo(W - MAR, curY - mm(1));
      ctx.stroke();
    }
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = "#CBD5E1";
  ctx.font = `${pt(8)}px ${FONT}`;    // was pt(6)
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("WHITE EXPRESS © 2025  |  whiteexpress.kz", W / 2, H - mm(8));

  ctx.strokeStyle = "#3B5BDB";
  ctx.lineWidth = mm(1.5);
  ctx.beginPath();
  ctx.moveTo(MAR, H - mm(5));
  ctx.lineTo(W - MAR, H - mm(5));
  ctx.stroke();

  return canvas;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateLabelPDF(data: LabelData): Promise<string> {
  const canvas = await renderLabelCanvas(data);
  const imgData = canvas.toDataURL("image/jpeg", 0.96);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  doc.addImage(imgData, "JPEG", 0, 0, 148, 210);
  return doc.output("datauristring");
}

export function downloadPDF(dataUri: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUri;
  a.download = filename;
  a.click();
}
