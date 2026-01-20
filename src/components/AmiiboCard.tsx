"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Amiibo, GameUsage } from "@/lib/types";
import { getAmiiboWithGames } from "@/lib/amiibo-api";
import { getLists, createList, addAmiiboToList, getLatestList } from "@/lib/lists-storage";

interface AmiiboCardProps {
  amiibo: Amiibo;
}

// Extract dominant color from image using canvas
function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("#6b7280"); // fallback gray
        return;
      }

      // Small sample size for performance
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size).data;
      const colorCounts: Record<string, number> = {};

      // Sample pixels and count colors (skip transparent/white/near-white)
      for (let i = 0; i < imageData.length; i += 16) { // sample every 4th pixel
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        // Skip transparent or near-white pixels
        if (a < 128 || (r > 240 && g > 240 && b > 240)) continue;

        // Quantize to reduce color variations
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        const key = `${qr},${qg},${qb}`;

        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }

      // Find most common color
      let maxCount = 0;
      let dominantColor = "107,114,128"; // fallback gray
      for (const [color, count] of Object.entries(colorCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantColor = color;
        }
      }

      const [r, g, b] = dominantColor.split(",").map(Number);
      resolve(`rgb(${r},${g},${b})`);
    };
    img.onerror = () => resolve("#6b7280");
    img.src = imageUrl;
  });
}

// Games Modal Component
function GamesModal({
  amiibo,
  gamesData,
  dominantColor,
  onClose,
}: {
  amiibo: Amiibo;
  gamesData: {
    games3DS?: GameUsage[];
    gamesSwitch?: GameUsage[];
    gamesWiiU?: GameUsage[];
  };
  dominantColor: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const color = dominantColor !== "transparent" ? dominantColor : "#6b7280";

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderGameSection = (title: string, games: GameUsage[] | undefined) => {
    if (!games || games.length === 0) return null;
    return (
      <div className="mb-3">
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          {title}
        </h4>
        <div className="space-y-2">
          {games.map((game, i) => (
            <div key={i} className="bg-neutral-800 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-white mb-1.5">{game.gameName}</p>
              {game.amiiboUsage && game.amiiboUsage.length > 0 && (
                <div className="space-y-1">
                  {game.amiiboUsage.map((usage, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                          usage.write ? "bg-amber-600 text-white" : "bg-neutral-600 text-neutral-200"
                        }`}
                      >
                        {usage.write ? "R/W" : "Read"}
                      </span>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">{usage.Usage}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ backgroundColor: "#1a1a1a" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Left Side - Image */}
        <div
          className="w-full md:w-2/5 p-4 flex flex-col items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <div className="relative w-36 h-36 md:w-48 md:h-48">
            <Image
              src={amiibo.image}
              alt={amiibo.name}
              fill
              className="object-contain drop-shadow-lg"
              unoptimized
            />
          </div>
          <h3 className="text-base font-bold text-white mt-3 text-center" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
            {amiibo.name}
          </h3>
          <p className="text-xs text-white/90 text-center" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{amiibo.amiiboSeries}</p>
        </div>

        {/* Right Side - Games */}
        <div
          className="flex-1 p-4 overflow-y-auto bg-neutral-900"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: `rgba(255,255,255,0.2) transparent`,
          }}
        >
          <h3 className="text-sm font-bold text-white mb-3">Compatible Games</h3>

          {renderGameSection("Nintendo Switch", gamesData.gamesSwitch)}
          {renderGameSection("Wii U", gamesData.gamesWiiU)}
          {renderGameSection("Nintendo 3DS", gamesData.games3DS)}

          {!gamesData.gamesSwitch?.length && !gamesData.gamesWiiU?.length && !gamesData.games3DS?.length && (
            <p className="text-white/50 text-center py-6 text-sm">No compatible games found</p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Add to List Modal Component
function AddToListModal({
  amiibo,
  onClose,
  onAdded,
}: {
  amiibo: Amiibo;
  onClose: () => void;
  onAdded: (listName: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [lists] = useState(getLists());
  const [newListName, setNewListName] = useState("");
  const [showNewListInput, setShowNewListInput] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToList = (listId: string, listName: string) => {
    addAmiiboToList(listId, amiibo);
    onAdded(listName);
    onClose();
  };

  const handleCreateAndAdd = () => {
    if (!newListName.trim()) return;
    const newList = createList(newListName.trim());
    addAmiiboToList(newList.id, amiibo);
    onAdded(newList.name);
    onClose();
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-sm rounded-xl shadow-2xl overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold text-sm">Add to List</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">
            Adding: <span className="font-semibold text-gray-700">{amiibo.name}</span>
          </p>

          {/* Existing Lists */}
          {lists.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Lists</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleAddToList(list.id, list.name)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <span className="font-medium text-gray-700">{list.name}</span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-600">
                      {list.items.length} item{list.items.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create New List */}
          {showNewListInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateAndAdd}
                  disabled={!newListName.trim()}
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Create & Add
                </button>
                <button
                  onClick={() => {
                    setShowNewListInput(false);
                    setNewListName("");
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewListInput(true)}
              className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New List
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default function AmiiboCard({ amiibo }: AmiiboCardProps) {
  const [dominantColor, setDominantColor] = useState<string>("transparent");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [gamesData, setGamesData] = useState<{
    games3DS?: GameUsage[];
    gamesSwitch?: GameUsage[];
    gamesWiiU?: GameUsage[];
  } | null>(null);
  const [loadingGames, setLoadingGames] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    extractDominantColor(amiibo.image).then(setDominantColor);
  }, [amiibo.image]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleOpenListModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowListModal(true);
  };

  const handleAddedToList = (listName: string) => {
    setAddedToast(listName);
    setTimeout(() => setAddedToast(null), 2000);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const latestList = getLatestList();
    if (latestList) {
      addAmiiboToList(latestList.id, amiibo);
      handleAddedToList(latestList.name);
    } else {
      // No lists exist, open the modal to create one
      setShowListModal(true);
    }
  };

  const handleOpenModal = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    if (gamesData) {
      setShowModal(true);
      return;
    }
    setLoadingGames(true);
    try {
      const response = await getAmiiboWithGames(amiibo.head, amiibo.tail);
      const amiiboData = (response as { amiibo: Amiibo | Amiibo[] }).amiibo;
      const data = Array.isArray(amiiboData) ? amiiboData[0] : amiiboData;
      setGamesData({
        games3DS: data.games3DS,
        gamesSwitch: data.gamesSwitch,
        gamesWiiU: data.gamesWiiU,
      });
      setShowModal(true);
    } catch (error) {
      console.error("Failed to load games:", error);
    } finally {
      setLoadingGames(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "figure":
        return "bg-blue-500";
      case "card":
        return "bg-green-500";
      case "yarn":
        return "bg-pink-500";
      case "band":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const threshold = rect.height * 0.66; // Upper two-thirds
    setIsHovered(y < threshold);
  };

  return (
    <>
      <div
        className="h-96 cursor-pointer group"
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative w-full h-full transition-transform"
          style={{
            transformStyle: "preserve-3d",
            transitionDuration: isFlipped || !isHovered ? "500ms" : "200ms",
            transform: isFlipped
              ? "rotateY(180deg)"
              : isHovered
                ? "rotateY(12deg)"
                : "rotateY(0deg)",
          }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 rounded-xl shadow-lg overflow-hidden bg-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={amiibo.image}
                alt={amiibo.name}
                fill
                className="object-contain p-4"
                unoptimized
              />
            </div>

            {/* Gradient Overlay with dominant color */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: dominantColor !== "transparent"
                  ? `linear-gradient(to top, ${dominantColor.replace("rgb", "rgba").replace(")", ",0.9)")} 0%, ${dominantColor.replace("rgb", "rgba").replace(")", ",0.4)")} 35%, transparent 65%)`
                  : "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 35%, transparent 65%)",
              }}
            />

            {/* Type Badge */}
            <span
              className={`absolute top-3 right-3 ${getTypeColor(amiibo.type)} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md`}
            >
              {amiibo.type}
            </span>

            {/* Series Badge - Top Left */}
            <span
              className="absolute top-3 left-3 inline-block text-xs font-bold uppercase tracking-wide text-white px-2 py-1 rounded shadow-md transition-colors duration-500"
              style={{ backgroundColor: dominantColor !== "transparent" ? dominantColor : "#6b7280" }}
            >
              {amiibo.amiiboSeries}
            </span>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3
                className="text-lg font-extrabold text-white"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.9)" }}
              >
                {amiibo.name}
              </h3>
              <p
                className="text-sm font-semibold text-white/90"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9)" }}
              >
                {amiibo.character} • {amiibo.gameSeries}
              </p>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
              title="Quick add to latest list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700 hover:text-red-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>

          </div>

          {/* Back Side */}
          <div
            className="absolute inset-0 rounded-xl shadow-lg overflow-hidden p-4 flex flex-col transition-colors duration-500"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              backgroundColor: dominantColor !== "transparent" ? dominantColor : "#6b7280",
            }}
          >
            {/* Header */}
            <div className="text-center mb-3">
              <h3
                className="text-lg font-extrabold text-white"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
              >
                {amiibo.name}
              </h3>
              <p
                className="text-xs font-semibold text-white/80"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
              >
                {amiibo.amiiboSeries}
              </p>
            </div>

            {/* Details */}
            <div className="flex-1 bg-black/20 rounded-lg p-3 space-y-2 overflow-y-auto">
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-wide">Character</p>
                <p className="text-sm font-semibold text-white">{amiibo.character}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-wide">Game Series</p>
                <p className="text-sm font-semibold text-white">{amiibo.gameSeries}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-wide">Type</p>
                <p className="text-sm font-semibold text-white">{amiibo.type}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-wide">Release Dates</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-white/90">
                  <span>NA: {formatDate(amiibo.release.na)}</span>
                  <span>EU: {formatDate(amiibo.release.eu)}</span>
                  <span>JP: {formatDate(amiibo.release.jp)}</span>
                  <span>AU: {formatDate(amiibo.release.au)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleOpenModal}
                disabled={loadingGames}
                className="flex-1 bg-white/20 hover:bg-white/40 active:bg-white/50 text-white text-xs font-bold py-2.5 px-3 rounded-lg transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm hover:shadow-md"
              >
                {loadingGames ? "Loading..." : "Games"}
              </button>
              <button
                onClick={handleOpenListModal}
                className="flex-1 bg-white/20 hover:bg-white/40 active:bg-white/50 text-white text-xs font-bold py-2.5 px-3 rounded-lg transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-1 shadow-sm hover:shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                List
              </button>
            </div>

            {/* Footer hint */}
            <p className="text-xs text-white/50 text-center mt-2">Click to flip back</p>
          </div>
        </div>
      </div>

      {/* Games Modal */}
      {showModal && gamesData && (
        <GamesModal
          amiibo={amiibo}
          gamesData={gamesData}
          dominantColor={dominantColor}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Add to List Modal */}
      {showListModal && (
        <AddToListModal
          amiibo={amiibo}
          onClose={() => setShowListModal(false)}
          onAdded={handleAddedToList}
        />
      )}

      {/* Toast notification */}
      {addedToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          Added to "{addedToast}"
        </div>
      )}
    </>
  );
}
