"use client";

import React, { useRef, useState } from "react";
import QRCode from "qrcode";
import {
  FaLinkedin,
  FaFacebookF,
  FaInstagram,
  FaMediumM,
  FaTwitter,
  FaQuora,
  FaGithub
} from "react-icons/fa";
import { motion } from "framer-motion";

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
    if (f) setLogoPreview(URL.createObjectURL(f));
    else setLogoPreview(null);
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
      const displaySize = 400;
      const qrSize = 800;

      canvas.width = displaySize;
      canvas.height = displaySize;

      const offCanvas = document.createElement("canvas");
      offCanvas.width = qrSize;
      offCanvas.height = qrSize;

      const opts = {
        errorCorrectionLevel: "H",
        margin: 1,
        width: qrSize,
        color: { dark: "#000000", light: "#ffffff" },
      } as any;

      await QRCode.toCanvas(offCanvas, value, opts);

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, displaySize, displaySize);
      ctx.drawImage(offCanvas, 0, 0, displaySize, displaySize);

      if (logoFile) {
        const img = await loadImageFromFile(logoFile);
        const logoScale = 0.25;
        const logoSize = displaySize * logoScale;

        const bgPadding = Math.floor(logoSize * 0.02);
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
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    link.download = `qr-with-logo-${timestamp}.png`;
    link.click();
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep Aqua-Blue Liquid Background (no white shadows) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[120%] h-[120%] -top-10 -left-10
          bg-gradient-to-r from-[#43cea2] to-[#185a9d]
          animate-spin-slow rounded-full blur-[140px] opacity-70">
        </div>
        <div className="absolute w-[120%] h-[120%] -bottom-10 -right-10
          bg-gradient-to-r from-[#43cea2] to-[#185a9d]
          animate-spin-slow-reverse rounded-full blur-[140px] opacity-70">
        </div>
      </div>

      {/* Floating Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-4 relative z-10"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          QR Code Generator — with centered PNG logo
        </h2>

        <label className="block text-sm font-bold text-gray-900">URL or Text</label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2 font-bold text-gray-900"
          placeholder="https://example.com"
        />

        <label className="block text-sm font-bold text-gray-900 mt-4">
          Upload PNG logo (transparent recommended)
        </label>

        <div className="mt-2 flex flex-col md:flex-row">
          <div className="flex gap-3 w-full md:w-[50%] mb-2 md:mb-0">
            <input
              id="logoUpload"
              type="file"
              accept="image/png"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("logoUpload")?.click()}
              className="cursor-pointer px-3 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
            >
              Upload Logo
            </button>
            {logoFile && (
              <span className="text-sm text-gray-600 self-center">
                Selected: {logoFile.name}
              </span>
            )}
          </div>
          <div className="flex gap-3 w-full md:w-[50%] mb-2 md:mb-0 md:justify-end">
            <button
              onClick={generate}
              className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate QR"}
            </button>
            <button
              onClick={downloadPNG}
              className="cursor-pointer px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download PNG
            </button>
          </div>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 "
        >
          {logoPreview && (
            <div className="col-span-1">
              <div className="text-sm mb-2 font-bold text-gray-900">Logo Preview</div>
              <div className="w-full flex items-center justify-center p-4 border rounded bg-gray-50">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="max-h-64 object-contain"
                />
              </div>
            </div>
          )}

          <div className="col-span-1">
            <div className="text-sm font-bold text-gray-900 mb-2">QR Code Preview</div>
            <div className="w-full flex items-center justify-center p-4 border rounded bg-gray-50">
              <canvas
                ref={canvasRef}
                style={{
                  width: 256,
                  height: 256,
                  imageRendering: "pixelated",
                }}
              ></canvas>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 border-t pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <div className="flex gap-3 text-gray-500 mb-2 md:mb-0">
            <a href="https://www.linkedin.com/in/toukir-ahamed-09477b28a/" target="_blank" className="hover:text-blue-600 transition-colors">
              <FaLinkedin size={18} />
            </a>
            <a href="https://github.com/ToukirAhamedPigeon" target="_blank" className="hover:text-black transition-colors">
              <FaGithub size={18} />
            </a>
            <a href="https://www.facebook.com/pigeonicsoft" target="_blank" className="hover:text-blue-700 transition-colors">
              <FaFacebookF size={18} />
            </a>
            <a href="https://www.instagram.com/toukirahamedpigeon/" target="_blank" className="hover:text-pink-500 transition-colors">
              <FaInstagram size={18} />
            </a>
            <a href="https://medium.com/@toukir.ahamed.pigeon" target="_blank" className="hover:text-black transition-colors">
              <FaMediumM size={18} />
            </a>
            <a href="https://x.com/AhamedPigeon" target="_blank" className="hover:text-blue-400 transition-colors">
              <FaTwitter size={18} />
            </a>
            <a href="https://www.quora.com/profile/Toukir-Ahamed-Pigeon" target="_blank" className="hover:text-red-600 transition-colors">
              <FaQuora size={18} />
            </a>
          </div>
          <div className="mb-2 md:mb-0">
            Developed by <a href="https://pigeonic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pigeonic</a> &copy; 2025 | Version 1.0.0
          </div>
        </div>
      </motion.div>
    </div>
  );
}
