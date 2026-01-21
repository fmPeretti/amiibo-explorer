"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AmiiboList, AmiiboListItem, GameUsage, Amiibo } from "@/lib/types";
import {
  getLists,
  createList,
  deleteList,
  updateListName,
  removeAmiiboFromList,
  reorderListItems,
  exportLists,
  exportList,
  importLists,
} from "@/lib/lists-storage";
import { getAmiiboWithGames } from "@/lib/amiibo-api";
import TemplateGenerator from "@/components/TemplateGenerator";
import Header from "@/components/Header";

function ListCard({
  list,
  onDelete,
  onRename,
  onSelect,
  isSelected,
}: {
  list: AmiiboList;
  onDelete: () => void;
  onRename: (name: string) => void;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);

  const handleSave = () => {
    if (editName.trim()) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "bg-red-500 text-white shadow-lg"
          : "bg-white hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            onClick={(e) => e.stopPropagation()}
            className="text-lg font-bold bg-transparent border-b-2 border-current outline-none w-full"
            autoFocus
          />
        ) : (
          <h3 className={`text-lg font-bold truncate ${isSelected ? "text-white" : "text-black"}`}>{list.name}</h3>
        )}
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className={`p-1 rounded hover:bg-black/10 ${isSelected ? "text-white" : "text-gray-500"}`}
            title="Rename"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this list?")) onDelete();
            }}
            className={`p-1 rounded hover:bg-black/10 ${isSelected ? "text-white" : "text-gray-500"}`}
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <p className={`text-sm ${isSelected ? "text-white/80" : "text-gray-500"}`}>
        {list.items.length} amiibo{list.items.length !== 1 ? "s" : ""}
      </p>
      {/* Preview images */}
      {list.items.length > 0 && (
        <div className="flex -space-x-2 mt-3">
          {list.items.slice(0, 5).map((item) => (
            <div
              key={`${item.head}-${item.tail}`}
              className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white overflow-hidden"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={32}
                height={32}
                className="object-contain"
                unoptimized
              />
            </div>
          ))}
          {list.items.length > 5 && (
            <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}>
              +{list.items.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Details Modal Component
function DetailsModal({
  item,
  onClose,
}: {
  item: AmiiboListItem;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gamesData, setGamesData] = useState<{
    games3DS?: GameUsage[];
    gamesSwitch?: GameUsage[];
    gamesWiiU?: GameUsage[];
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleLoadGames = async () => {
    setLoading(true);
    try {
      const response = await getAmiiboWithGames(item.head, item.tail);
      const amiiboData = (response as { amiibo: Amiibo | Amiibo[] }).amiibo;
      const data = Array.isArray(amiiboData) ? amiiboData[0] : amiiboData;
      setGamesData({
        games3DS: data.games3DS,
        gamesSwitch: data.gamesSwitch,
        gamesWiiU: data.gamesWiiU,
      });
    } catch (error) {
      console.error("Failed to load games:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
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

  const hasGames = gamesData?.gamesSwitch?.length || gamesData?.gamesWiiU?.length || gamesData?.games3DS?.length;

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
        <div className="w-full md:w-2/5 p-4 flex flex-col items-center justify-center bg-gradient-to-b from-gray-700 to-gray-800">
          <div className="relative w-36 h-36 md:w-48 md:h-48">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-contain drop-shadow-lg"
              unoptimized
            />
          </div>
          <h3 className="text-base font-bold text-white mt-3 text-center" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
            {item.name}
          </h3>
          <p className="text-xs text-white/90 text-center" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{item.amiiboSeries}</p>

          {/* Basic Info */}
          <div className="mt-4 w-full px-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Character</span>
              <span className="text-white font-medium">{item.character}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Game Series</span>
              <span className="text-white font-medium">{item.gameSeries}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Type</span>
              <span className="text-white font-medium">{item.type}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Games */}
        <div
          className="flex-1 p-4 overflow-y-auto bg-neutral-900"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.2) transparent",
          }}
        >
          <h3 className="text-sm font-bold text-white mb-3">Compatible Games</h3>

          {!gamesData && !loading && (
            <button
              onClick={handleLoadGames}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
            >
              Load Compatible Games
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
          )}

          {gamesData && (
            <>
              {renderGameSection("Nintendo Switch", gamesData.gamesSwitch)}
              {renderGameSection("Wii U", gamesData.gamesWiiU)}
              {renderGameSection("Nintendo 3DS", gamesData.games3DS)}

              {!hasGames && (
                <p className="text-white/50 text-center py-6 text-sm">No compatible games found</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function AmiiboListItemCard({
  item,
  index,
  onRemove,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
}: {
  item: AmiiboListItem;
  index: number;
  onRemove: () => void;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  const position = index + 1;
  const isTopThree = index < 3;

  // Different styles for positions 1, 2, 3 - using right confetti colors (orange, emerald, cyan)
  const getPositionStyles = () => {
    if (index === 0) return "bg-gradient-to-r from-orange-500 to-orange-400 text-white ring-2 ring-orange-300 ring-offset-2";
    if (index === 1) return "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white ring-2 ring-emerald-300 ring-offset-2";
    if (index === 2) return "bg-gradient-to-r from-cyan-500 to-cyan-400 text-white ring-2 ring-cyan-300 ring-offset-2";
    return "bg-white";
  };

  const getPositionBadgeStyles = () => {
    if (index === 0) return "bg-orange-600 text-white";
    if (index === 1) return "bg-emerald-600 text-white";
    if (index === 2) return "bg-cyan-600 text-white";
    return "bg-gray-200 text-gray-600";
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`rounded-xl p-4 flex items-center gap-3 group cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${getPositionStyles()} ${isDragging ? "opacity-50 scale-95" : ""} ${isDragOver ? "ring-2 ring-blue-400 ring-offset-2" : ""}`}
      onClick={onClick}
    >
      {/* Position number */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${getPositionBadgeStyles()}`}>
        {position}
      </div>

      {/* Drag handle */}
      <div className={`flex flex-col gap-0.5 ${isTopThree ? "text-white/50" : "text-gray-300"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </div>

      <div className="w-20 h-24 shrink-0 relative">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-bold truncate ${isTopThree ? "text-white" : "text-gray-900"}`}>{item.name}</h4>
          {index === 0 && (
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-semibold uppercase shrink-0">
              1st
            </span>
          )}
          {index === 1 && (
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-semibold uppercase shrink-0">
              2nd
            </span>
          )}
          {index === 2 && (
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-semibold uppercase shrink-0">
              3rd
            </span>
          )}
        </div>
        <p className={`text-xs truncate ${isTopThree ? "text-white/80" : "text-gray-500"}`}>{item.character} • {item.gameSeries}</p>
        <p className={`text-xs ${isTopThree ? "text-white/60" : "text-gray-400"}`}>{item.amiiboSeries}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={`p-2 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
          isTopThree
            ? "text-white/70 hover:text-white hover:bg-white/20"
            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
        }`}
        title="Remove from list"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export default function ListsPage() {
  const [lists, setLists] = useState<AmiiboList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AmiiboListItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [importToast, setImportToast] = useState<string | null>(null);
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLists(getLists());
  }, []);

  const selectedList = lists.find((l) => l.id === selectedListId);

  const refreshLists = () => {
    setLists(getLists());
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newList = createList(newListName.trim());
    refreshLists();
    setSelectedListId(newList.id);
    setNewListName("");
    setShowNewListInput(false);
  };

  const handleDeleteList = (id: string) => {
    deleteList(id);
    if (selectedListId === id) {
      setSelectedListId(null);
    }
    refreshLists();
  };

  const handleRenameList = (id: string, name: string) => {
    updateListName(id, name);
    refreshLists();
  };

  const handleRemoveFromList = (listId: string, head: string, tail: string) => {
    removeAmiiboFromList(listId, head, tail);
    refreshLists();
  };

  const handleMoveItem = (listId: string, fromIndex: number, toIndex: number) => {
    reorderListItems(listId, fromIndex, toIndex);
    refreshLists();
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && selectedListId && draggedIndex !== toIndex) {
      handleMoveItem(selectedListId, draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleExportAll = () => {
    const json = exportLists();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amiibo-lists-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSelected = () => {
    if (!selectedListId) return;
    const json = exportList(selectedListId);
    if (!json) return;
    const list = lists.find((l) => l.id === selectedListId);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list?.name || "amiibo-list"}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importLists(content);
      refreshLists();
      if (result.imported > 0) {
        setImportToast(`Imported ${result.imported} list${result.imported !== 1 ? "s" : ""}`);
        setTimeout(() => setImportToast(null), 3000);
      } else {
        setImportToast("No valid lists found in file");
        setTimeout(() => setImportToast(null), 3000);
      }
    };
    reader.onerror = () => {
      setImportToast("Failed to read file");
      setTimeout(() => setImportToast(null), 3000);
    };
    reader.readAsText(file);
    // Reset input so same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex relative">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Lists */}
        <aside className={`
          fixed md:sticky top-[52px] left-0 z-40 md:z-auto
          w-72 shrink-0 bg-gray-50 border-r border-gray-200
          min-h-[calc(100vh-52px)]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          md:self-start p-4
        `}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">My Lists</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowNewListInput(true)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="Create new list"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Import/Export buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleExportAll}
              disabled={lists.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export all lists"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Import lists from JSON"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {/* New List Input */}
          {showNewListInput && (
            <div className="mb-4 p-3 bg-white rounded-xl shadow-sm">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateList}
                  disabled={!newListName.trim()}
                  className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewListInput(false);
                    setNewListName("");
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Lists */}
          <div className="space-y-2">
            {lists.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No lists yet. Create one to get started!
              </p>
            ) : (
              lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  isSelected={selectedListId === list.id}
                  onSelect={() => {
                    setSelectedListId(list.id);
                    setSidebarOpen(false);
                  }}
                  onDelete={() => handleDeleteList(list.id)}
                  onRename={(name) => handleRenameList(list.id, name)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Main Content - List Items */}
        <main className="flex-1 p-4 md:p-6">
          {selectedList ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedList.name}</h1>
                  <p className="text-sm text-gray-500">
                    {selectedList.items.length} amiibo{selectedList.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTemplateGenerator(true)}
                    disabled={selectedList.items.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate printable template"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    Create Template
                  </button>
                  <button
                    onClick={handleExportSelected}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Export this list"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>

              {selectedList.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">This list is empty.</p>
                  <Link
                    href="/explore"
                    className="inline-block bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Explore Amiibos
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedList.items.map((item, index) => (
                    <AmiiboListItemCard
                      key={`${item.head}-${item.tail}`}
                      item={item}
                      index={index}
                      onRemove={() => handleRemoveFromList(selectedList.id, item.head, item.tail)}
                      onClick={() => setSelectedItem(item)}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedIndex === index}
                      isDragOver={dragOverIndex === index && draggedIndex !== index}
                    />
                  ))}
                </div>
              )}

              {/* Details Modal */}
              {selectedItem && (
                <DetailsModal
                  item={selectedItem}
                  onClose={() => setSelectedItem(null)}
                />
              )}
            </>
          ) : (
            <div className="py-6">
              {lists.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    Create a list to start collecting amiibos!
                  </p>
                  <button
                    onClick={() => {
                      setSidebarOpen(true);
                      setShowNewListInput(true);
                    }}
                    className="inline-block bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Create Your First List
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Select a List</h2>
                    <button
                      onClick={() => {
                        setSidebarOpen(true);
                        setShowNewListInput(true);
                      }}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      + New List
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lists.map((list) => (
                      <ListCard
                        key={list.id}
                        list={list}
                        isSelected={false}
                        onSelect={() => setSelectedListId(list.id)}
                        onDelete={() => handleDeleteList(list.id)}
                        onRename={(name) => handleRenameList(list.id, name)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Import Toast */}
      {importToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          {importToast}
        </div>
      )}

      {/* Template Generator Modal */}
      {showTemplateGenerator && selectedList && (
        <TemplateGenerator
          items={selectedList.items}
          listName={selectedList.name}
          onClose={() => setShowTemplateGenerator(false)}
        />
      )}
    </div>
  );
}
