"use client";

import React, { useRef, useState } from "react";
import QRCode from "qrcode";

export default function QRWithLogo() {
  const [value, setValue] = useState("https://example.com");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (f && !f.type.includes("png")) {
      setError("Please upload a PNG image (transparent PNG recommended).");
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    setLogoFile(f);
    if (f) {
      setLogoPreview(URL.createObjectURL(f));
    } else {
      setLogoPreview(null);
    }
  };

  async function generate() {
    setError(null);
    if (!value) {
      setError("Please enter a URL or text to encode.");
      return;
    }
    setGenerating(true);
    try {
      const canvas = canvasRef.current!;
      const displaySize = 400; // preview size
      const qrSize = 800; // internal generation size for quality

      // Set canvas to preview size
      canvas.width = displaySize;
      canvas.height = displaySize;

      // Create temporary offscreen canvas for high-res generation
      const offCanvas = document.createElement("canvas");
      offCanvas.width = qrSize;
      offCanvas.height = qrSize;

      const opts = {
        errorCorrectionLevel: "H",
        margin: 1,
        width: qrSize,
        color: { dark: "#000000", light: "#ffffff" },
      } as any;

      // Draw high-res QR on offscreen canvas
      await QRCode.toCanvas(offCanvas, value, opts);

      const ctx = canvas.getContext("2d")!;
      // Scale down high-res QR onto preview canvas
      ctx.clearRect(0, 0, displaySize, displaySize);
      ctx.drawImage(offCanvas, 0, 0, displaySize, displaySize);

      if (logoFile) {
        const img = await loadImageFromFile(logoFile);
        const logoScale = 0.2;
        const logoSize = displaySize * logoScale;

        const bgPadding = Math.floor(logoSize * 0.15);
        const bgSize = logoSize + bgPadding * 2;
        const bgX = Math.floor((displaySize - bgSize) / 2);
        const bgY = Math.floor((displaySize - bgSize) / 2);
        const radius = Math.floor(bgSize * 0.15);

        roundRect(ctx, bgX, bgY, bgSize, bgSize, radius, "#ffffff");

        const aspect = img.width / img.height;
        let dw = logoSize;
        let dh = logoSize;
        if (aspect > 1) dh = Math.round(logoSize / aspect);
        else dw = Math.round(logoSize * aspect);
        const dx = Math.floor((displaySize - dw) / 2);
        const dy = Math.floor((displaySize - dh) / 2);
        ctx.drawImage(img, dx, dy, dw, dh);
      }
    } catch (err: any) {
      console.error(err);
      setError((err && err.message) || String(err));
    } finally {
      setGenerating(false);
    }
  }


  function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    });
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fillStyle: string
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.restore();
  }

  function downloadPNG() {
    const canvas = canvasRef.current!;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qr-with-logo.png";
    link.click();
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-6 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          QR Code Generator — with centered PNG logo
        </h2>

        <label className="block text-sm font-medium text-gray-700">
          URL or Text
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
          placeholder="https://example.com"
        />

       <label className="block text-sm font-medium text-gray-700 mt-4">
          Upload PNG logo (transparent recommended)
       </label>

       <div className="mt-2 flex items-center gap-3">
          {/* Hidden file input */}
          <input
            id="logoUpload"
            type="file"
            accept="image/png"
            onChange={handleFile}
            className="hidden"
          />

          {/* Full button for file upload */}
          <button
            type="button"
            onClick={() => document.getElementById("logoUpload")?.click()}
            className="cursor-pointer px-2 py-1 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            Upload Logo
          </button>

          {/* Show filename if selected */}
          {logoFile && (
            <span className="text-sm text-gray-600">Selected: {logoFile.name}</span>
          )}
        </div>


        <div className="flex gap-2 mt-6">
          <button
            onClick={generate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate QR"}
          </button>
          <button
            onClick={downloadPNG}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download PNG
          </button>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Preview */}
          {logoPreview && (
            <div className="col-span-1">
              <div className="text-sm mb-2">Logo Preview (larger)</div>
              <div className="w-full flex items-center justify-center p-4 border rounded bg-gray-50">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="max-h-64 object-contain"
                />
              </div>
            </div>
          )}

          {/* QR Preview */}
          <div className="col-span-1">
            <div className="text-sm mb-2">QR Code Preview (smaller)</div>
            <div className="w-full flex items-center justify-center p-4 border rounded bg-gray-50">
              <canvas
                ref={canvasRef}
                style={{ width: 200, height: 200, imageRendering: "pixelated" }}
              ></canvas>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Note: This component uses the <code>qrcode</code> npm package on the
          client to draw a QR onto a canvas, then overlays a centered PNG. Add{" "}
          <code>npm install qrcode</code> to your project and ensure this
          component runs client-side.
        </div>
      </div>
    </div>
  );
}
