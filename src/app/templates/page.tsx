"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TemplateConfig,
  getTemplates,
  deleteTemplate,
  exportTemplates,
  exportTemplate,
  importTemplates,
  renameTemplate,
} from "@/lib/template-storage";
import {
  CommunityTemplate,
  getAllCommunityTemplates,
  communityTemplateToConfig,
} from "@/lib/community-templates";
import TemplateGenerator from "@/components/TemplateGenerator";
import Header from "@/components/Header";

function TemplateCard({
  template,
  onDelete,
  onRename,
  onGenerate,
  onExport,
}: {
  template: TemplateConfig;
  onDelete: () => void;
  onRename: (name: string) => void;
  onGenerate: () => void;
  onExport: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(template.name);

  const handleSave = () => {
    if (editName.trim()) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4">
      <div className="flex items-start justify-between mb-3">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="text-lg font-bold bg-transparent border-b-2 border-red-500 outline-none w-full"
            autoFocus
          />
        ) : (
          <h3 className="text-lg font-bold text-gray-900 truncate">{template.name}</h3>
        )}
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            title="Rename"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this template?")) onDelete();
            }}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Template info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">
          {template.templateType === "coin" ? (
            <div className="w-10 h-10 rounded-full border-2 border-red-400 bg-red-50 flex items-center justify-center">
              <span className="text-xs text-red-500 font-semibold">{template.diameter}mm</span>
            </div>
          ) : (
            <div className="w-8 h-10 rounded border-2 border-blue-400 bg-blue-50 flex items-center justify-center">
              <span className="text-[8px] text-blue-500 font-semibold leading-tight text-center">
                {template.cardWidth}x{template.cardHeight}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600">
            {template.templateType === "coin" ? "Coin" : "Card"} • {template.pageSize}
          </p>
          <p className="text-xs text-gray-400">
            {template.items?.length || 0} amiibo{(template.items?.length || 0) !== 1 ? "s" : ""}
            {template.listName && ` • from "${template.listName}"`}
          </p>
        </div>
      </div>

      {/* Preview images */}
      {template.items && template.items.length > 0 && (
        <div className="flex -space-x-2 mb-4">
          {template.items.slice(0, 6).map((item, i) => (
            <div
              key={`${item.head}-${item.tail}-${i}`}
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
          {template.items.length > 6 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              +{template.items.length - 6}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onGenerate}
          disabled={!template.items || template.items.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Generate
        </button>
        <button
          onClick={onExport}
          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          title="Export template"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Date */}
      <p className="text-xs text-gray-400 mt-3">
        Created {new Date(template.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

function CommunityTemplateCard({
  template,
  onGenerate,
}: {
  template: CommunityTemplate;
  onGenerate: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 border-2 border-dashed border-purple-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 truncate">{template.name}</h3>
          {template.author && (
            <p className="text-xs text-purple-500 font-medium">by {template.author}</p>
          )}
        </div>
        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full shrink-0 ml-2">
          Community
        </span>
      </div>

      {/* Description */}
      {template.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
      )}

      {/* Template info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">
          {template.templateType === "coin" ? (
            <div className="w-10 h-10 rounded-full border-2 border-purple-400 bg-purple-50 flex items-center justify-center">
              <span className="text-xs text-purple-500 font-semibold">{template.diameter}mm</span>
            </div>
          ) : (
            <div className="w-8 h-10 rounded border-2 border-purple-400 bg-purple-50 flex items-center justify-center">
              <span className="text-[8px] text-purple-500 font-semibold leading-tight text-center">
                {template.cardWidth}x{template.cardHeight}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600">
            {template.templateType === "coin" ? "Coin" : "Card"} • {template.pageSize}
          </p>
          <p className="text-xs text-gray-400">
            {template.items?.length || 0} amiibo{(template.items?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Preview images */}
      {template.items && template.items.length > 0 && (
        <div className="flex -space-x-2 mb-4">
          {template.items.slice(0, 6).map((item, i) => (
            <div
              key={`${item.head}-${item.tail}-${i}`}
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
          {template.items.length > 6 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              +{template.items.length - 6}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <button
        onClick={onGenerate}
        disabled={!template.items || template.items.length === 0}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
        </svg>
        Use This Template
      </button>
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [communityTemplates, setCommunityTemplates] = useState<CommunityTemplate[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [importToast, setImportToast] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTemplates(getTemplates());

    // Load community templates
    getAllCommunityTemplates()
      .then(setCommunityTemplates)
      .catch(console.error)
      .finally(() => setLoadingCommunity(false));
  }, []);

  const refreshTemplates = () => {
    setTemplates(getTemplates());
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    refreshTemplates();
  };

  const handleRenameTemplate = (id: string, name: string) => {
    renameTemplate(id, name);
    refreshTemplates();
  };

  const handleExportAll = () => {
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

  const handleExportTemplate = (id: string, name: string) => {
    const json = exportTemplate(id);
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`;
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
      const result = importTemplates(content);
      refreshTemplates();
      if (result.imported > 0) {
        setImportToast(`Imported ${result.imported} template${result.imported !== 1 ? "s" : ""}`);
        setTimeout(() => setImportToast(null), 3000);
      } else {
        setImportToast("No valid templates found in file");
        setTimeout(() => setImportToast(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Templates</h1>
            <p className="text-sm text-gray-500 mt-1">
              Saved template configurations for generating printable amiibo sheets
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Import templates from JSON"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Import
            </button>
            {templates.length > 0 && (
              <button
                onClick={handleExportAll}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Export all templates"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export All
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* My Templates Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Templates</h2>
          {templates.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No templates yet</h3>
              <p className="text-sm text-gray-500 mb-3 max-w-md mx-auto">
                Create a template from a list or try a community template below.
              </p>
              <div className="flex justify-center gap-2">
                <Link
                  href="/lists"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Go to My Lists
                </Link>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onDelete={() => handleDeleteTemplate(template.id)}
                  onRename={(name) => handleRenameTemplate(template.id, name)}
                  onGenerate={() => setSelectedTemplate(template)}
                  onExport={() => handleExportTemplate(template.id, template.name)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Community Templates Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Community Templates</h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
              Ready to use
            </span>
          </div>
          {loadingCommunity ? (
            <div className="text-center py-8 bg-white rounded-xl">
              <div className="w-8 h-8 mx-auto mb-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading community templates...</p>
            </div>
          ) : communityTemplates.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl">
              <p className="text-sm text-gray-500">No community templates available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityTemplates.map((template) => (
                <CommunityTemplateCard
                  key={template.id}
                  template={template}
                  onGenerate={() => setSelectedTemplate(communityTemplateToConfig(template))}
                />
              ))}
            </div>
          )}
        </section>

        {/* Info section */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">How Templates Work</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Save your setup:</strong> Templates store all settings including dimensions, back designs, and image adjustments.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Regenerate anytime:</strong> Click "Generate" to recreate your printable sheets with the exact same settings.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Share with others:</strong> Export templates as JSON files to share with colleagues. They can import and generate without any setup.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><strong>Download as PDF:</strong> Generated templates can be merged into a single PDF for easy printing.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Import Toast */}
      {importToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          {importToast}
        </div>
      )}

      {/* Template Generator Modal - for regenerating from saved template */}
      {selectedTemplate && selectedTemplate.items && (
        <TemplateGenerator
          items={selectedTemplate.items}
          listName={selectedTemplate.name}
          onClose={() => {
            setSelectedTemplate(null);
            refreshTemplates();
          }}
          initialConfig={selectedTemplate}
        />
      )}
    </div>
  );
}
