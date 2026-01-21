"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { AmiiboListItem } from "@/lib/types";
import { BACK_DESIGNS, generateBackDesignImage } from "@/lib/back-designs";
import {
  TemplateConfig,
  getTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  exportTemplates,
  exportTemplate,
  importTemplates,
} from "@/lib/template-storage";

// Page sizes in mm - converted to pixels at 300 DPI for print quality
const DPI = 300;
const MM_TO_INCH = 1 / 25.4;
const mmToPx = (mm: number) => Math.round(mm * MM_TO_INCH * DPI);

const PAGE_SIZES = {
  A4: { width: 210, height: 297, name: "A4 (210 x 297 mm)" },
  Letter: { width: 215.9, height: 279.4, name: "US Letter (8.5 x 11 in)" },
  A3: { width: 297, height: 420, name: "A3 (297 x 420 mm)" },
  Legal: { width: 215.9, height: 355.6, name: "US Legal (8.5 x 14 in)" },
};

type PageSizeKey = keyof typeof PAGE_SIZES;
type TemplateType = "coin" | "card";
type Step = "config" | "adjust" | "preview";

interface ImageAdjustment {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

interface TemplateGeneratorProps {
  items: AmiiboListItem[];
  listName: string;
  onClose: () => void;
  initialConfig?: TemplateConfig;
}

// Load image and return as HTMLImageElement
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export default function TemplateGenerator({ items, listName, onClose, initialConfig }: TemplateGeneratorProps) {
  const [mounted, setMounted] = useState(false);
  // If we have initialConfig, skip directly to adjust step
  const [step, setStep] = useState<Step>(initialConfig ? "adjust" : "config");
  const [templateType, setTemplateType] = useState<TemplateType>(initialConfig?.templateType || "coin");
  const [pageSize, setPageSize] = useState<PageSizeKey>((initialConfig?.pageSize as PageSizeKey) || "A4");
  const [diameter, setDiameter] = useState(initialConfig?.diameter || 30);
  const [cardWidth, setCardWidth] = useState(initialConfig?.cardWidth || 54);
  const [cardHeight, setCardHeight] = useState(initialConfig?.cardHeight || 85);
  const [margin, setMargin] = useState(initialConfig?.margin || 5);
  const [spacing, setSpacing] = useState(initialConfig?.spacing || 5);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // Image adjustments per item (by key) - initialize from initialConfig if available
  const [imageAdjustments, setImageAdjustments] = useState<Map<string, ImageAdjustment>>(() => {
    if (initialConfig?.imageAdjustments) {
      return new Map(Object.entries(initialConfig.imageAdjustments));
    }
    return new Map();
  });
  // Currently editing item
  const [editingItem, setEditingItem] = useState<AmiiboListItem | null>(null);
  const [editingType, setEditingType] = useState<"front" | "back">("front");

  // Back design selection per series (Map<seriesName, designId>) - initialize from initialConfig if available
  const [seriesBackDesigns, setSeriesBackDesigns] = useState<Map<string, string>>(() => {
    if (initialConfig?.seriesBackDesigns) {
      return new Map(Object.entries(initialConfig.seriesBackDesigns));
    }
    return new Map();
  });
  // Custom back images per series (Map<seriesName, dataUrl>)
  const [customBackImages, setCustomBackImages] = useState<Map<string, string>>(new Map());
  // Generated back images for Canvas-based designs per series
  const [generatedBackImages, setGeneratedBackImages] = useState<Map<string, string>>(new Map());
  // Preview images for design selection
  const [backDesignPreviews, setBackDesignPreviews] = useState<Map<string, string>>(new Map());
  // Currently editing series (for back design selection)
  const [editingSeriesBack, setEditingSeriesBack] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateImportRef = useRef<HTMLInputElement>(null);

  // Saved templates
  const [savedTemplates, setSavedTemplates] = useState<TemplateConfig[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateToast, setTemplateToast] = useState<string | null>(null);

  // Get unique series from items (memoized to prevent infinite loops)
  const uniqueSeries = useMemo(() => [...new Set(items.map(i => i.amiiboSeries))], [items]);

  // Preloaded images
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());


  // Drag state for position adjustment
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    // Load saved templates
    setSavedTemplates(getTemplates());

    // If we have initialConfig, auto-load images to go straight to adjust step
    if (initialConfig) {
      loadAllImages();
    }

    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Refresh templates list
  const refreshTemplates = () => {
    setSavedTemplates(getTemplates());
  };

  // Auto-save current adjustments to the template (if editing an existing template)
  // This effect runs whenever imageAdjustments or seriesBackDesigns change
  useEffect(() => {
    if (!initialConfig?.id || !mounted) return;

    const seriesBackDesignsObj: Record<string, string> = {};
    seriesBackDesigns.forEach((value, key) => {
      seriesBackDesignsObj[key] = value;
    });

    const imageAdjustmentsObj: Record<string, { zoom: number; offsetX: number; offsetY: number }> = {};
    imageAdjustments.forEach((value, key) => {
      imageAdjustmentsObj[key] = value;
    });

    updateTemplate(initialConfig.id, {
      templateType,
      pageSize,
      diameter,
      cardWidth,
      cardHeight,
      margin,
      spacing,
      seriesBackDesigns: seriesBackDesignsObj,
      imageAdjustments: imageAdjustmentsObj,
      items: items,
      listName: listName,
    });
  }, [initialConfig?.id, mounted, templateType, pageSize, diameter, cardWidth, cardHeight, margin, spacing, seriesBackDesigns, imageAdjustments, items, listName]);

  // Save current config as template
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return;

    const seriesBackDesignsObj: Record<string, string> = {};
    seriesBackDesigns.forEach((value, key) => {
      seriesBackDesignsObj[key] = value;
    });

    const imageAdjustmentsObj: Record<string, { zoom: number; offsetX: number; offsetY: number }> = {};
    imageAdjustments.forEach((value, key) => {
      imageAdjustmentsObj[key] = value;
    });

    saveTemplate(newTemplateName.trim(), {
      templateType,
      pageSize,
      diameter,
      cardWidth,
      cardHeight,
      margin,
      spacing,
      seriesBackDesigns: seriesBackDesignsObj,
      imageAdjustments: imageAdjustmentsObj,
      items: items,
      listName: listName,
    });

    refreshTemplates();
    setShowSaveModal(false);
    setNewTemplateName("");
    setTemplateToast(`Template "${newTemplateName.trim()}" saved!`);
    setTimeout(() => setTemplateToast(null), 3000);
  };

  // Load a template
  const handleLoadTemplate = (template: TemplateConfig) => {
    setTemplateType(template.templateType);
    setPageSize(template.pageSize as PageSizeKey);
    setDiameter(template.diameter);
    setCardWidth(template.cardWidth);
    setCardHeight(template.cardHeight);
    setMargin(template.margin);
    setSpacing(template.spacing);

    // Convert back to Maps
    const newSeriesBackDesigns = new Map<string, string>();
    Object.entries(template.seriesBackDesigns).forEach(([key, value]) => {
      newSeriesBackDesigns.set(key, value);
    });
    setSeriesBackDesigns(newSeriesBackDesigns);

    const newImageAdjustments = new Map<string, ImageAdjustment>();
    Object.entries(template.imageAdjustments).forEach(([key, value]) => {
      newImageAdjustments.set(key, value);
    });
    setImageAdjustments(newImageAdjustments);

    setTemplateToast(`Template "${template.name}" loaded!`);
    setTimeout(() => setTemplateToast(null), 3000);
  };

  // Delete a template
  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Delete template "${name}"?`)) {
      deleteTemplate(id);
      refreshTemplates();
      setTemplateToast(`Template "${name}" deleted`);
      setTimeout(() => setTemplateToast(null), 3000);
    }
  };

  // Export all templates
  const handleExportAllTemplates = () => {
    const json = exportTemplates();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amiibo-templates-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export single template
  const handleExportTemplate = (id: string, name: string) => {
    const json = exportTemplate(id);
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import templates
  const handleImportTemplates = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importTemplates(content);
      refreshTemplates();
      if (result.imported > 0) {
        setTemplateToast(`Imported ${result.imported} template${result.imported !== 1 ? "s" : ""}`);
      } else {
        setTemplateToast("No valid templates found in file");
      }
      setTimeout(() => setTemplateToast(null), 3000);
    };
    reader.onerror = () => {
      setTemplateToast("Failed to read file");
      setTimeout(() => setTemplateToast(null), 3000);
    };
    reader.readAsText(file);
    if (templateImportRef.current) {
      templateImportRef.current.value = "";
    }
  };

  // Calculate layout
  const calculateLayout = () => {
    const page = PAGE_SIZES[pageSize];
    const usableWidth = page.width - margin * 2;
    const usableHeight = page.height - margin * 2;

    if (templateType === "coin") {
      const itemSize = diameter + spacing;
      const itemsPerRow = Math.floor((usableWidth + spacing) / itemSize);
      const rowsPerPage = Math.floor((usableHeight + spacing) / itemSize);
      return { itemsPerRow, rowsPerPage, itemsPerPage: itemsPerRow * rowsPerPage };
    } else {
      const itemWidth = cardWidth + spacing;
      const itemHeight = cardHeight + spacing;
      const itemsPerRow = Math.floor((usableWidth + spacing) / itemWidth);
      const rowsPerPage = Math.floor((usableHeight + spacing) / itemHeight);
      return { itemsPerRow, rowsPerPage, itemsPerPage: itemsPerRow * rowsPerPage };
    }
  };

  const layout = calculateLayout();
  const totalSlots = items.length * 2;
  const pagesNeeded = Math.ceil(totalSlots / layout.itemsPerPage);

  // Get item key
  const getItemKey = (item: AmiiboListItem) => `${item.head}-${item.tail}`;

  // Get adjustment for item
  const getAdjustment = useCallback((item: AmiiboListItem, type: "front" | "back"): ImageAdjustment => {
    const key = type === "front" ? getItemKey(item) : `back-${item.amiiboSeries}`;
    return imageAdjustments.get(key) || { zoom: 1.2, offsetX: 0, offsetY: 0 };
  }, [imageAdjustments]);

  // Set adjustment for item
  const setAdjustment = useCallback((item: AmiiboListItem, type: "front" | "back", adjustment: ImageAdjustment) => {
    const key = type === "front" ? getItemKey(item) : `back-${item.amiiboSeries}`;
    setImageAdjustments(prev => new Map(prev).set(key, adjustment));
  }, []);

  // Get back design ID for a series
  const getSeriesBackDesign = useCallback((series: string): string => {
    return seriesBackDesigns.get(series) || "amiibo-logo";
  }, [seriesBackDesigns]);

  // Set back design for a series
  const setSeriesBackDesign = useCallback((series: string, designId: string) => {
    setSeriesBackDesigns(prev => new Map(prev).set(series, designId));
  }, []);

  // Get back image URL for a series
  const getBackImageUrl = useCallback((series: string): string | null => {
    const designId = getSeriesBackDesign(series);

    if (designId === "custom") {
      return customBackImages.get(series) || null;
    }

    // Check if it's an image-based design
    const design = BACK_DESIGNS.find(d => d.id === designId);
    if (design?.imageUrl) {
      return design.imageUrl;
    }

    // Otherwise use generated image
    return generatedBackImages.get(series) || null;
  }, [getSeriesBackDesign, customBackImages, generatedBackImages]);

  // Calculate zoom needed to cover container (no empty space)
  // For a square container: if image is tall (aspect < 1), zoom = 1/aspect
  // If image is wide (aspect > 1), zoom = 1 (it already fills width)
  const calculateCoverZoom = useCallback((imgWidth: number, imgHeight: number): number => {
    const imgAspect = imgWidth / imgHeight;
    // Container is square (1:1 aspect ratio)
    // With object-fit: contain, image fits inside maintaining aspect ratio
    // To cover (fill entire container), we need to scale up the smaller dimension
    if (imgAspect > 1) {
      // Wide image: height is the limiting factor, zoom to fill height
      return imgAspect;
    } else {
      // Tall image: width is the limiting factor, zoom to fill width
      return 1 / imgAspect;
    }
  }, []);

  // Apply cover zoom to a single image
  const applyCoverZoom = useCallback(async (item: AmiiboListItem, type: "front" | "back") => {
    const imgUrl = type === "front" ? item.image : getBackImageUrl(item.amiiboSeries);
    if (!imgUrl) return;

    try {
      const img = await loadImage(imgUrl);
      const coverZoom = calculateCoverZoom(img.naturalWidth, img.naturalHeight);
      // Cap at max zoom of 2 (200%)
      const finalZoom = Math.min(coverZoom, 2);
      setAdjustment(item, type, { zoom: finalZoom, offsetX: 0, offsetY: 0 });
    } catch (e) {
      console.error("Failed to load image for cover zoom:", e);
    }
  }, [calculateCoverZoom, setAdjustment, getBackImageUrl]);

  // Apply cover zoom to all front images
  const applyCoverZoomToAllFronts = useCallback(async () => {
    for (const item of items) {
      await applyCoverZoom(item, "front");
    }
  }, [items, applyCoverZoom]);

  // Apply cover zoom to all back images (one per series)
  const applyCoverZoomToAllBacks = useCallback(async () => {
    for (const series of uniqueSeries) {
      const firstItem = items.find(i => i.amiiboSeries === series);
      if (firstItem) {
        await applyCoverZoom(firstItem, "back");
      }
    }
  }, [uniqueSeries, items, applyCoverZoom]);

  // Generate back design previews when mounted and when templateType changes
  // Only for designs that don't have image URLs
  useEffect(() => {
    if (!mounted) return;

    // Generate previews only for Canvas-based designs
    const previews = new Map<string, string>();
    const isCircle = templateType === "coin";

    for (const design of BACK_DESIGNS) {
      if (!design.imageUrl) {
        // Generate using Canvas
        previews.set(design.id, generateBackDesignImage(design, 100, isCircle));
      }
      // Image-based designs use their imageUrl directly
    }
    setBackDesignPreviews(previews);
  }, [mounted, templateType]);

  // Generate high-res back designs for all series when needed
  useEffect(() => {
    if (!mounted) return;

    const newGenerated = new Map<string, string>();
    const isCircle = templateType === "coin";

    for (const series of uniqueSeries) {
      const designId = getSeriesBackDesign(series);
      if (designId !== "custom") {
        const design = BACK_DESIGNS.find(d => d.id === designId);
        if (design && !design.imageUrl) {
          // Generate for Canvas-based designs
          const dataUrl = generateBackDesignImage(design, 400, isCircle);
          newGenerated.set(series, dataUrl);
        }
      }
    }
    setGeneratedBackImages(newGenerated);
  }, [mounted, templateType, seriesBackDesigns, uniqueSeries, getSeriesBackDesign]);

  // Handle custom image upload for a specific series
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>, series: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCustomBackImages(prev => new Map(prev).set(series, dataUrl));
        setSeriesBackDesign(series, "custom");
        setEditingSeriesBack(null);
      };
      reader.onerror = () => {
        setTemplateToast("Failed to load image");
        setTimeout(() => setTemplateToast(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load images for generation
  const loadAllImages = async () => {
    setGenerating(true);
    setProgress(0);
    setProgressText("Loading amiibo images...");

    const imageCache = new Map<string, HTMLImageElement>();

    // Load all amiibo images
    let loadedCount = 0;
    for (const item of items) {
      try {
        const img = await loadImage(item.image);
        imageCache.set(item.image, img);
      } catch (e) {
        console.error("Failed to load image:", item.image, e);
      }
      loadedCount++;
      setProgress(Math.round((loadedCount / items.length) * 60));
    }

    // Load back design images for all series
    setProgressText("Loading back designs...");
    for (let i = 0; i < uniqueSeries.length; i++) {
      const series = uniqueSeries[i];
      const backUrl = getBackImageUrl(series);
      if (backUrl && !imageCache.has(backUrl)) {
        try {
          const img = await loadImage(backUrl);
          imageCache.set(backUrl, img);
        } catch (e) {
          console.error("Failed to load back design:", e);
        }
      }
      setProgress(60 + Math.round(((i + 1) / uniqueSeries.length) * 30));
    }

    setLoadedImages(imageCache);
    setProgress(100);
    setProgressText("Done!");
    setGenerating(false);
    setStep("adjust");
  };

  // Generate final images
  const generateImages = async () => {
    setGenerating(true);
    setProgress(0);
    setProgressText("Generating pages...");
    setGeneratedImages([]);

    try {
      const page = PAGE_SIZES[pageSize];
      const canvasWidth = mmToPx(page.width);
      const canvasHeight = mmToPx(page.height);
      const marginPx = mmToPx(margin);
      const spacingPx = mmToPx(spacing);
      const itemWidthPx = templateType === "coin" ? mmToPx(diameter) : mmToPx(cardWidth);
      const itemHeightPx = templateType === "coin" ? mmToPx(diameter) : mmToPx(cardHeight);

      // Create pairs of front/back
      const allSlots: { item: AmiiboListItem; isFront: boolean }[] = [];
      for (const item of items) {
        allSlots.push({ item, isFront: true });
        allSlots.push({ item, isFront: false });
      }

      // Generate pages
      const pages: string[] = [];
      let slotIndex = 0;

      for (let pageNum = 0; pageNum < pagesNeeded; pageNum++) {
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        let currentRow = 0;
        let currentCol = 0;

        while (slotIndex < allSlots.length && currentRow < layout.rowsPerPage) {
          const { item, isFront } = allSlots[slotIndex];
          const x = marginPx + currentCol * (itemWidthPx + spacingPx);
          const y = marginPx + currentRow * (itemHeightPx + spacingPx);

          // Get image and adjustment
          const imgUrl = isFront ? item.image : getBackImageUrl(item.amiiboSeries);
          const img = imgUrl ? loadedImages.get(imgUrl) : null;
          const adjustment = getAdjustment(item, isFront ? "front" : "back");

          if (templateType === "coin") {
            const centerX = x + itemWidthPx / 2;
            const centerY = y + itemHeightPx / 2;
            const radius = itemWidthPx / 2;

            // Circle outline
            ctx.strokeStyle = "#cccccc";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
            ctx.stroke();

            if (img) {
              // Draw image with zoom and offset, clipped to circle
              ctx.save();
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
              ctx.clip();

              const scale = adjustment.zoom;

              // Keep image aspect ratio, scale relative to container size
              const imgAspect = img.naturalWidth / img.naturalHeight;
              let drawWidth: number, drawHeight: number;

              // Base size: fit image to container (like CSS auto width/height)
              if (imgAspect > 1) {
                // Wide image: width = container, height scales
                drawWidth = itemWidthPx * scale;
                drawHeight = drawWidth / imgAspect;
              } else {
                // Tall image: height = container, width scales
                drawHeight = itemHeightPx * scale;
                drawWidth = drawHeight * imgAspect;
              }

              // Center position + user offset (offset is % of container)
              const imgX = centerX - drawWidth / 2 + (adjustment.offsetX / 100) * itemWidthPx;
              const imgY = centerY - drawHeight / 2 + (adjustment.offsetY / 100) * itemHeightPx;

              ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
              ctx.restore();
            }

            // Name banner (only on front) - pill shape with color from bottom center of image
            if (isFront && img) {
              // Extract color from bottom center of the image
              const sampleCanvas = document.createElement("canvas");
              sampleCanvas.width = img.naturalWidth;
              sampleCanvas.height = img.naturalHeight;
              const sampleCtx = sampleCanvas.getContext("2d");
              let bannerColor = "#3b82f6"; // fallback blue

              if (sampleCtx) {
                sampleCtx.drawImage(img, 0, 0);
                // Sample from bottom center area (middle 20% width, bottom 10% height)
                const sampleX = Math.floor(img.naturalWidth * 0.4);
                const sampleY = Math.floor(img.naturalHeight * 0.9);
                const sampleWidth = Math.floor(img.naturalWidth * 0.2);
                const sampleHeight = Math.floor(img.naturalHeight * 0.1);

                try {
                  const imageData = sampleCtx.getImageData(sampleX, sampleY, sampleWidth, sampleHeight);
                  const data = imageData.data;
                  let r = 0, g = 0, b = 0, count = 0;

                  // Average the colors, skipping transparent pixels
                  for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 128) { // Only count non-transparent pixels
                      r += data[i];
                      g += data[i + 1];
                      b += data[i + 2];
                      count++;
                    }
                  }

                  if (count > 0) {
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    bannerColor = `rgb(${r},${g},${b})`;
                  }
                } catch (e) {
                  // CORS or other error, use fallback
                }
              }

              // Calculate banner dimensions - must fit entirely inside the coin
              const bannerHeight = radius * 0.28;
              const bannerWidth = radius * 1.5; // Width of the pill
              const bannerY = centerY + radius * 0.55; // Position near bottom but inside
              const bannerMargin = 4; // Margin from coin edge in pixels

              // Draw pill-shaped banner (100% border radius = half of height)
              ctx.save();
              // Clip to circle first so banner doesn't exceed coin boundary
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius - bannerMargin, 0, Math.PI * 2);
              ctx.clip();

              // Draw the pill shape
              ctx.fillStyle = bannerColor;
              ctx.beginPath();
              const pillRadius = bannerHeight / 2;
              ctx.roundRect(
                centerX - bannerWidth / 2,
                bannerY - bannerHeight / 2,
                bannerWidth,
                bannerHeight,
                pillRadius
              );
              ctx.fill();

              // Add white border
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 4;
              ctx.stroke();

              // Draw text - white with shadow for contrast
              ctx.fillStyle = "#ffffff";
              ctx.font = `bold ${Math.round(bannerHeight * 0.55)}px Arial, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              // Text shadow for better readability
              ctx.shadowColor = "rgba(0,0,0,0.5)";
              ctx.shadowBlur = 2;
              ctx.shadowOffsetX = 1;
              ctx.shadowOffsetY = 1;

              ctx.fillText(item.name.substring(0, 12), centerX, bannerY, bannerWidth * 0.85);
              ctx.restore();
            }
          } else {
            // Card
            const cornerRadius = mmToPx(3);

            ctx.strokeStyle = "#cccccc";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, itemWidthPx - 2, itemHeightPx - 2, cornerRadius);
            ctx.stroke();

            if (img) {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(x + 2, y + 2, itemWidthPx - 4, itemHeightPx - 4, cornerRadius);
              ctx.clip();

              const scale = adjustment.zoom;

              // Keep image aspect ratio, scale relative to container size
              const imgAspect = img.naturalWidth / img.naturalHeight;
              let drawWidth: number, drawHeight: number;

              if (imgAspect > 1) {
                drawWidth = itemWidthPx * scale;
                drawHeight = drawWidth / imgAspect;
              } else {
                drawHeight = itemHeightPx * scale;
                drawWidth = drawHeight * imgAspect;
              }

              // Center position + user offset
              const cardCenterX = x + itemWidthPx / 2;
              const cardCenterY = y + itemHeightPx / 2;
              const imgX = cardCenterX - drawWidth / 2 + (adjustment.offsetX / 100) * itemWidthPx;
              const imgY = cardCenterY - drawHeight / 2 + (adjustment.offsetY / 100) * itemHeightPx;

              ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
              ctx.restore();
            }

            // Name banner (only on front) - pill shape with color from bottom center of image
            if (isFront && img) {
              // Extract color from bottom center of the image
              const sampleCanvas = document.createElement("canvas");
              sampleCanvas.width = img.naturalWidth;
              sampleCanvas.height = img.naturalHeight;
              const sampleCtx = sampleCanvas.getContext("2d");
              let bannerColor = "#3b82f6"; // fallback blue

              if (sampleCtx) {
                sampleCtx.drawImage(img, 0, 0);
                const sampleX = Math.floor(img.naturalWidth * 0.4);
                const sampleY = Math.floor(img.naturalHeight * 0.9);
                const sampleWidth = Math.floor(img.naturalWidth * 0.2);
                const sampleHeight = Math.floor(img.naturalHeight * 0.1);

                try {
                  const imageData = sampleCtx.getImageData(sampleX, sampleY, sampleWidth, sampleHeight);
                  const data = imageData.data;
                  let r = 0, g = 0, b = 0, count = 0;

                  for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 128) {
                      r += data[i];
                      g += data[i + 1];
                      b += data[i + 2];
                      count++;
                    }
                  }

                  if (count > 0) {
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    bannerColor = `rgb(${r},${g},${b})`;
                  }
                } catch (e) {
                  // CORS or other error, use fallback
                }
              }

              // Pill-shaped banner at the bottom of the card
              const bannerHeight = itemHeightPx * 0.12;
              const bannerWidth = itemWidthPx * 0.85;
              const bannerY = y + itemHeightPx - bannerHeight * 1.3;
              const cardCenterX = x + itemWidthPx / 2;
              const cardBannerMargin = 4; // Margin from card edge in pixels

              ctx.save();
              // Clip to card shape with margin
              ctx.beginPath();
              ctx.roundRect(x + cardBannerMargin, y + cardBannerMargin, itemWidthPx - cardBannerMargin * 2, itemHeightPx - cardBannerMargin * 2, cornerRadius);
              ctx.clip();

              // Draw pill shape
              ctx.fillStyle = bannerColor;
              ctx.beginPath();
              const pillRadius = bannerHeight / 2;
              ctx.roundRect(
                cardCenterX - bannerWidth / 2,
                bannerY,
                bannerWidth,
                bannerHeight,
                pillRadius
              );
              ctx.fill();

              // Add white border
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 4;
              ctx.stroke();

              // Text
              ctx.fillStyle = "#ffffff";
              ctx.font = `bold ${Math.round(bannerHeight * 0.6)}px Arial, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.shadowColor = "rgba(0,0,0,0.5)";
              ctx.shadowBlur = 2;
              ctx.shadowOffsetX = 1;
              ctx.shadowOffsetY = 1;

              ctx.fillText(item.name.substring(0, 18), cardCenterX, bannerY + bannerHeight / 2, bannerWidth * 0.9);
              ctx.restore();
            }
          }

          currentCol++;
          if (currentCol >= layout.itemsPerRow) {
            currentCol = 0;
            currentRow++;
          }
          slotIndex++;
        }

        const dataUrl = canvas.toDataURL("image/png");
        pages.push(dataUrl);
        setProgress(Math.round(((pageNum + 1) / pagesNeeded) * 100));
      }

      setGeneratedImages(pages);
      setStep("preview");
    } catch (error) {
      console.error("Failed to generate images:", error);
      alert("Failed to generate images. Please try again.");
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const downloadImage = (dataUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${listName}-${templateType}-page${index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    generatedImages.forEach((img, i) => {
      setTimeout(() => downloadImage(img, i), i * 200);
    });
  };

  // Download all pages as a merged PDF
  const downloadAsPDF = async () => {
    setGenerating(true);
    setProgressText("Creating PDF...");
    setProgress(0);

    try {
      // Dynamically import jspdf
      const { jsPDF } = await import("jspdf");

      const page = PAGE_SIZES[pageSize];
      // Create PDF with correct page size in mm
      const pdf = new jsPDF({
        orientation: page.width > page.height ? "landscape" : "portrait",
        unit: "mm",
        format: [page.width, page.height],
      });

      for (let i = 0; i < generatedImages.length; i++) {
        if (i > 0) {
          pdf.addPage([page.width, page.height]);
        }

        // Add image to PDF (full page)
        pdf.addImage(
          generatedImages[i],
          "PNG",
          0,
          0,
          page.width,
          page.height,
          undefined,
          "FAST"
        );

        setProgress(Math.round(((i + 1) / generatedImages.length) * 100));
      }

      // Download the PDF
      pdf.save(`${listName}-${templateType}-${generatedImages.length}pages.pdf`);
      setProgressText("PDF saved!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try downloading images individually.");
    } finally {
      setGenerating(false);
      setProgress(0);
      setProgressText("");
    }
  };

  // Drag handlers for position adjustment - must be defined before early return
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !editingItem) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    // Simple: drag right = image moves right = offsetX increases
    // Preview is 176px, offset range is -50 to 50 (100% of container)
    // So 176px movement = 100% offset, 1px = 0.57%
    const sensitivity = 0.6;
    const newOffsetX = Math.max(-100, Math.min(100, dragStartRef.current.offsetX + deltaX * sensitivity));
    const newOffsetY = Math.max(-100, Math.min(100, dragStartRef.current.offsetY + deltaY * sensitivity));

    const adjustment = getAdjustment(editingItem, editingType);
    setAdjustment(editingItem, editingType, {
      ...adjustment,
      offsetX: Math.round(newOffsetX),
      offsetY: Math.round(newOffsetY),
    });
  }, [isDragging, editingItem, editingType, getAdjustment, setAdjustment]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Add/remove global mouse/touch listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!editingItem) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const adjustment = getAdjustment(editingItem, editingType);

    dragStartRef.current = {
      x: clientX,
      y: clientY,
      offsetX: adjustment.offsetX,
      offsetY: adjustment.offsetY,
    };
    setIsDragging(true);
  };

  if (!mounted) return null;

  // Image adjustment editor component

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      /* Modal should not close on backdrop click */
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">{initialConfig ? "Generate from Template" : "Generate Template"}</h2>
          <p className="text-white/80 text-sm mt-1">
            {step === "config" && `Configure template for ${items.length} amiibo${items.length !== 1 ? "s" : ""}`}
            {step === "adjust" && (initialConfig ? "Adjust images if needed (click to edit)" : "Adjust images (click to edit)")}
            {step === "preview" && "Download your templates"}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Step 1: Configuration */}
          {step === "config" && (
            <div className="space-y-5">
              {/* Template Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Template Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTemplateType("coin")}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      templateType === "coin" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-current flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Coin</p>
                      <p className="text-xs text-gray-500">Circular</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setTemplateType("card")}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      templateType === "card" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-6 h-8 rounded border-2 border-current flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Card</p>
                      <p className="text-xs text-gray-500">Rectangular</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dimensions (mm)</label>
                {templateType === "coin" ? (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Diameter</label>
                    <input
                      type="number"
                      value={diameter}
                      onChange={(e) => setDiameter(e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0)}
                      min={10}
                      max={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Common sizes: 25mm, 30mm</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Width</label>
                      <input
                        type="number"
                        value={cardWidth}
                        onChange={(e) => setCardWidth(e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0)}
                        min={20}
                        max={150}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Height</label>
                      <input
                        type="number"
                        value={cardHeight}
                        onChange={(e) => setCardHeight(e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0)}
                        min={20}
                        max={150}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <p className="col-span-2 text-xs text-gray-400">Credit card: 54x85mm, Mini: 40x60mm</p>
                  </div>
                )}
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSizeKey)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {Object.entries(PAGE_SIZES).map(([key, { name }]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Spacing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Page Margin (mm)</label>
                  <input
                    type="number"
                    value={margin}
                    onChange={(e) => setMargin(e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0)}
                    min={0}
                    max={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Item Spacing (mm)</label>
                  <input
                    type="number"
                    value={spacing}
                    onChange={(e) => setSpacing(e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0)}
                    min={0}
                    max={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Back Design Selection Per Series */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Back Designs by Series</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueSeries.map((series) => {
                    const designId = getSeriesBackDesign(series);
                    const design = BACK_DESIGNS.find(d => d.id === designId);
                    const previewUrl = designId === "custom"
                      ? customBackImages.get(series)
                      : (design?.imageUrl || backDesignPreviews.get(designId));
                    const itemCount = items.filter(i => i.amiiboSeries === series).length;

                    return (
                      <div key={series} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        {/* Current back preview */}
                        <button
                          onClick={() => setEditingSeriesBack(series)}
                          className={`w-12 h-12 ${templateType === "coin" ? "rounded-full" : "rounded-lg"} overflow-hidden border-2 border-gray-300 hover:border-red-500 transition-colors flex-shrink-0 bg-white`}
                          title="Change back design"
                        >
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={design?.name || "Custom"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full" style={{ backgroundColor: design?.color || "#e60012" }} />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{series}</p>
                          <p className="text-xs text-gray-500">
                            {itemCount} item{itemCount !== 1 ? "s" : ""} • {designId === "custom" ? "Custom" : design?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingSeriesBack(series)}
                          className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* My Templates Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">My Templates</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => templateImportRef.current?.click()}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      title="Import templates"
                    >
                      Import
                    </button>
                    {savedTemplates.length > 0 && (
                      <button
                        onClick={handleExportAllTemplates}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        title="Export all templates"
                      >
                        Export All
                      </button>
                    )}
                    <input
                      ref={templateImportRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportTemplates}
                      className="hidden"
                    />
                  </div>
                </div>

                {savedTemplates.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No saved templates yet</p>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {savedTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group"
                      >
                        <div className="flex-shrink-0">
                          {template.templateType === "coin" ? (
                            <div className="w-6 h-6 rounded-full border-2 border-gray-400" />
                          ) : (
                            <div className="w-5 h-6 rounded border-2 border-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{template.name}</p>
                          <p className="text-xs text-gray-500">
                            {template.templateType === "coin" ? `${template.diameter}mm` : `${template.cardWidth}x${template.cardHeight}mm`} • {template.pageSize}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleLoadTemplate(template)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Load template"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleExportTemplate(template.id, template.name)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Export template"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete template"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Save Current Config Button */}
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full mt-3 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  Save Current Config
                </button>
              </div>

              {/* Preview Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{layout.itemsPerRow} x {layout.rowsPerPage} = {layout.itemsPerPage} slots per page</p>
                  <p>{Math.floor(layout.itemsPerPage / 2)} amiibos per page (front + back)</p>
                  <p className="font-medium text-red-600">{pagesNeeded} page{pagesNeeded !== 1 ? "s" : ""} for {items.length} amiibos</p>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={loadAllImages}
                disabled={generating}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {progressText} {progress}%
                  </span>
                ) : (
                  "Next: Adjust Images"
                )}
              </button>
            </div>
          )}

          {/* Step 2: Adjust Images */}
          {step === "adjust" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Click any image to adjust position and zoom.</p>

              {/* Back Designs Per Series */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Back Designs</p>
                  <button
                    onClick={applyCoverZoomToAllBacks}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    title="Apply cover fit to all back images"
                  >
                    Cover Fit All
                  </button>
                </div>
                {uniqueSeries.map((series) => {
                  const firstItem = items.find(i => i.amiiboSeries === series);
                  if (!firstItem) return null;
                  const backUrl = getBackImageUrl(series);
                  const backAdj = getAdjustment(firstItem, "back");
                  const designId = getSeriesBackDesign(series);
                  const design = BACK_DESIGNS.find(d => d.id === designId);

                  return (
                    <div key={series} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => { setEditingItem(firstItem); setEditingType("back"); }}
                        className={`w-12 h-12 ${templateType === "coin" ? "rounded-full" : "rounded-lg"} overflow-hidden border-2 border-gray-300 hover:border-red-500 transition-colors flex-shrink-0 bg-white relative`}
                        title="Adjust back image"
                      >
                        {backUrl ? (
                          <img
                            src={backUrl}
                            alt="Back"
                            className="absolute w-full h-full object-contain"
                            style={{
                              left: `${backAdj.offsetX}%`,
                              top: `${backAdj.offsetY}%`,
                              transform: `scale(${backAdj.zoom})`,
                              transformOrigin: "center center",
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{series}</p>
                        <p className="text-xs text-gray-500">{designId === "custom" ? "Custom" : design?.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Front Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Front Images</p>
                  <button
                    onClick={applyCoverZoomToAllFronts}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    title="Apply cover fit to all front images"
                  >
                    Cover Fit All
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {items.map((item) => {
                  const frontAdj = getAdjustment(item, "front");

                  return (
                    <div key={getItemKey(item)} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => { setEditingItem(item); setEditingType("front"); }}
                        className={`w-12 h-12 ${templateType === "coin" ? "rounded-full" : "rounded-lg"} overflow-hidden border-2 border-gray-300 hover:border-red-500 transition-colors flex-shrink-0 bg-white relative`}
                        title="Edit front image"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute w-full h-full object-contain"
                          style={{
                            left: `${frontAdj.offsetX}%`,
                            top: `${frontAdj.offsetY}%`,
                            transform: `scale(${frontAdj.zoom})`,
                            transformOrigin: "center center",
                          }}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 truncate">{item.amiiboSeries}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                {!initialConfig && (
                  <button
                    onClick={() => setStep("config")}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-semibold"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={generateImages}
                  disabled={generating}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {generating ? `Generating... ${progress}%` : "Generate Templates"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Download */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Generated Pages</h3>
                <button
                  onClick={() => setStep("adjust")}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to adjust
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {generatedImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt={`Page ${i + 1}`} className="w-full border border-gray-200 rounded-lg" />
                    <button
                      onClick={() => downloadImage(img, i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white font-semibold"
                    >
                      Download Page {i + 1}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={downloadAsPDF}
                  disabled={generating}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {progressText || `${progress}%`}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={downloadAll}
                  disabled={generating}
                  className="px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                  title="Download individual PNG files"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-center text-gray-500">
                {generatedImages.length} page{generatedImages.length !== 1 ? "s" : ""} ready to download
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image adjustment modal */}
      {editingItem && (() => {
        const imgUrl = editingType === "front"
          ? editingItem.image
          : getBackImageUrl(editingItem.amiiboSeries);
        const adjustment = getAdjustment(editingItem, editingType);

        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  Adjust {editingType === "front" ? "Front" : "Back"} Image
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Draggable Preview Area */}
              <div className="relative w-56 h-56 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                <div
                  ref={previewRef}
                  className={`w-44 h-44 ${templateType === "coin" ? "rounded-full" : "rounded-lg"} overflow-hidden border-2 border-gray-300 bg-white cursor-grab active:cursor-grabbing select-none relative`}
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                >
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt="Preview"
                      className="pointer-events-none absolute"
                      style={{
                        // Match canvas logic: image fits container (object-fit contain), then scaled and offset
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        left: `${adjustment.offsetX}%`,
                        top: `${adjustment.offsetY}%`,
                        transform: `scale(${adjustment.zoom})`,
                        transformOrigin: "center center",
                      }}
                    />
                  )}
                </div>
                <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-gray-400 pointer-events-none">
                  Drag to position
                </div>
              </div>

              {/* Position indicator */}
              <div className="flex justify-center gap-4 mb-4 text-xs text-gray-500">
                <span>X: {adjustment.offsetX}%</span>
                <span>Y: {adjustment.offsetY}%</span>
              </div>

              {/* Zoom Control */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom: {Math.round(adjustment.zoom * 100)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={adjustment.zoom}
                  onChange={(e) => setAdjustment(editingItem, editingType, {
                    ...adjustment,
                    zoom: parseFloat(e.target.value),
                  })}
                  className="w-full accent-red-500"
                />
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setAdjustment(editingItem, editingType, { zoom: 1.2, offsetX: 0, offsetY: 0 })}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={() => applyCoverZoom(editingItem, editingType)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-amber-100 rounded-lg hover:bg-amber-200 text-sm"
                  title="Auto-zoom to fill container without empty space"
                >
                  Cover Fit
                </button>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="w-full px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Done
              </button>
            </div>
          </div>
        );
      })()}

      {/* Series back design selector modal */}
      {editingSeriesBack && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Select Back Design</h3>
                <p className="text-sm text-gray-500">{editingSeriesBack}</p>
              </div>
              <button
                onClick={() => setEditingSeriesBack(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {BACK_DESIGNS.map((design) => {
                const previewUrl = design.imageUrl || backDesignPreviews.get(design.id);
                const isSelected = getSeriesBackDesign(editingSeriesBack) === design.id;

                return (
                  <button
                    key={design.id}
                    onClick={() => {
                      setSeriesBackDesign(editingSeriesBack, design.id);
                      setEditingSeriesBack(null);
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-red-500 ring-2 ring-red-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    title={design.name}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={design.name}
                        className={`w-full h-full object-cover ${templateType === "coin" ? "rounded-full" : ""}`}
                      />
                    ) : (
                      <div
                        className={`w-full h-full ${templateType === "coin" ? "rounded-full" : ""}`}
                        style={{ backgroundColor: design.color }}
                      />
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate text-center">
                      {design.name}
                    </div>
                  </button>
                );
              })}
              {/* Custom upload option */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 border-dashed transition-all ${
                  getSeriesBackDesign(editingSeriesBack) === "custom"
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300 hover:border-gray-400"
                } flex flex-col items-center justify-center bg-gray-50`}
                title="Upload custom image"
              >
                {customBackImages.get(editingSeriesBack) ? (
                  <>
                    <img
                      src={customBackImages.get(editingSeriesBack)}
                      alt="Custom"
                      className={`w-full h-full object-cover ${templateType === "coin" ? "rounded-full" : ""}`}
                    />
                    {getSeriesBackDesign(editingSeriesBack) === "custom" && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-400 mt-1">Upload</span>
                  </>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => editingSeriesBack && handleCustomImageUpload(e, editingSeriesBack)}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-4">Save Template</h3>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Template name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTemplateName.trim()) {
                  handleSaveTemplate();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setNewTemplateName("");
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}
                className="flex-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Toast */}
      {templateToast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          {templateToast}
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
