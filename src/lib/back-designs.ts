// Back design presets for coin/card templates
// Some use actual image files, others are generated using Canvas

export interface BackDesign {
  id: string;
  name: string;
  color: string;
  textColor: string;
  imageUrl?: string; // URL to an image file in /public
  subtitle?: string;
}

// Preset back designs - image-based designs first, then generated ones
export const BACK_DESIGNS: BackDesign[] = [
  // Image-based designs (from /public folder)
  {
    id: "amiibo-logo",
    name: "amiibo Logo",
    color: "#e60012",
    textColor: "#ffffff",
    imageUrl: "/AMIIBO_ART.png",
  },
  {
    id: "mario",
    name: "Super Mario",
    color: "#e60012",
    textColor: "#ffffff",
    imageUrl: "/MARIO_CAPY_ART.png",
  },
  {
    id: "animal-crossing",
    name: "Animal Crossing",
    color: "#7bc67b",
    textColor: "#ffffff",
    imageUrl: "/ACNH_ART.png",
  },
  {
    id: "kirby",
    name: "Kirby",
    color: "#ff69b4",
    textColor: "#ffffff",
    imageUrl: "/KIRBY_ART.png",
  },
  // Generated designs (Canvas-based)
  {
    id: "amiibo-explorer",
    name: "Amiibo Explorer",
    color: "#1a1a1a",
    textColor: "#ffffff",
    subtitle: "Collection",
  },
  {
    id: "smash-bros",
    name: "Super Smash Bros.",
    color: "#ff6b00",
    textColor: "#ffffff",
    subtitle: "Ultimate",
  },
  {
    id: "zelda",
    name: "The Legend of Zelda",
    color: "#006400",
    textColor: "#ffd700",
    subtitle: "Series",
  },
  {
    id: "pokemon",
    name: "Pokemon",
    color: "#ffcb05",
    textColor: "#3d7dca",
    subtitle: "Series",
  },
  {
    id: "splatoon",
    name: "Splatoon",
    color: "#ff5722",
    textColor: "#00e5ff",
    subtitle: "Series",
  },
];

// Generate a back design image as a data URL
export function generateBackDesignImage(
  design: BackDesign,
  size: number,
  isCircle: boolean
): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  ctx.fillStyle = design.color;
  if (isCircle) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, size);
  }

  // Add subtle gradient overlay
  const gradient = ctx.createRadialGradient(
    size * 0.3,
    size * 0.3,
    0,
    size / 2,
    size / 2,
    size * 0.7
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.15)");
  gradient.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = gradient;
  if (isCircle) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, size);
  }

  // Draw decorative ring/border
  ctx.strokeStyle = design.textColor;
  ctx.lineWidth = size * 0.02;
  ctx.globalAlpha = 0.3;
  if (isCircle) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const padding = size * 0.08;
    ctx.strokeRect(padding, padding, size - padding * 2, size - padding * 2);
  }
  ctx.globalAlpha = 1;

  // Main text (series name)
  ctx.fillStyle = design.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Calculate font size based on text length
  const maxWidth = size * 0.75;
  let fontSize = size * 0.12;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;

  // Reduce font size if text is too wide
  while (ctx.measureText(design.name).width > maxWidth && fontSize > size * 0.06) {
    fontSize -= 1;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  }

  // Draw main text
  const centerY = design.subtitle ? size * 0.45 : size * 0.5;
  ctx.fillText(design.name, size / 2, centerY, maxWidth);

  // Subtitle
  if (design.subtitle) {
    ctx.font = `${size * 0.06}px Arial, sans-serif`;
    ctx.globalAlpha = 0.8;
    ctx.fillText(design.subtitle, size / 2, size * 0.58, maxWidth);
    ctx.globalAlpha = 1;
  }

  // Add small NFC icon at bottom
  ctx.font = `${size * 0.05}px Arial, sans-serif`;
  ctx.globalAlpha = 0.5;
  ctx.fillText("NFC", size / 2, size * 0.85);
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}

// Generate a preview thumbnail (smaller, for UI display)
export function generateBackDesignPreview(
  design: BackDesign,
  isCircle: boolean
): string {
  return generateBackDesignImage(design, 200, isCircle);
}

// Generate high-res version for printing
export function generateBackDesignPrint(
  design: BackDesign,
  size: number,
  isCircle: boolean
): string {
  return generateBackDesignImage(design, size, isCircle);
}

// Get design by ID
export function getBackDesignById(id: string): BackDesign | undefined {
  return BACK_DESIGNS.find((d) => d.id === id);
}
