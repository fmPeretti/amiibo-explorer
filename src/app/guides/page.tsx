"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

type Section = "getting-started" | "use-cases" | "resources";

export default function GuidesPage() {
  const [activeSection, setActiveSection] = useState<Section>("getting-started");

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guides & Resources</h1>
          <p className="text-gray-600 mt-2">
            Learn how to use Amiibo Explorer and discover creative ways to make your own amiibo coins and cards.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveSection("getting-started")}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeSection === "getting-started"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Getting Started
          </button>
          <button
            onClick={() => setActiveSection("use-cases")}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeSection === "use-cases"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Use Cases
          </button>
          <button
            onClick={() => setActiveSection("resources")}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeSection === "resources"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Resources & Links
          </button>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Getting Started Section */}
          {activeSection === "getting-started" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
                <p className="text-gray-600 mb-6">
                  Welcome to Amiibo Explorer! This guide will walk you through the process of creating
                  printable amiibo templates for coins and cards.
                </p>
              </div>

              {/* Step 1 */}
              <div className="border-l-4 border-red-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                    1
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">Explore the Amiibo Database</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Start by browsing the complete amiibo database. You can filter by game series, amiibo series,
                  or search for specific characters.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                  </svg>
                  Go to Explore
                </Link>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-orange-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    2
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">Create a List</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Add the amiibos you want to print to a list. You can create multiple lists for different
                  projects or game collections. Click the <strong>+</strong> button on any amiibo card to add it to a list.
                </p>
                <Link
                  href="/lists"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Go to My Lists
                </Link>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-yellow-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                    3
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">Generate a Template</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  From your list, click <strong>"Create Template"</strong> to open the template generator.
                  Choose between coin (circular) or card (rectangular) format, set your dimensions, and select
                  back designs for each series.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-2">Template Options:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Coin:</strong> 25mm, 30mm, or custom diameter</li>
                    <li><strong>Card:</strong> Credit card size (54x85mm) or custom</li>
                    <li><strong>Page sizes:</strong> A4, US Letter, A3, US Legal</li>
                    <li><strong>Back designs:</strong> Multiple built-in options or upload your own</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-green-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                    4
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">Adjust Images</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Fine-tune each image by clicking on it. You can adjust zoom and position to get the perfect
                  framing. Use <strong>"Cover Fit All"</strong> to automatically zoom images to fill the space.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Pro tip:</p>
                  <p>Your adjustments are auto-saved, so you can close the window and come back later to continue!</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="border-l-4 border-purple-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                    5
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">Download & Print</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Generate your template pages and download them as a <strong>PDF</strong> (recommended) or
                  individual PNG images. Print at 100% scale on quality paper or sticker sheets.
                </p>
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  View My Templates
                </Link>
              </div>
            </div>
          )}

          {/* Use Cases Section */}
          {activeSection === "use-cases" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Use Cases & Applications</h2>
                <p className="text-gray-600 mb-6">
                  Discover the different ways you can use Amiibo Explorer to create custom amiibo products.
                </p>
              </div>

              {/* NFC Coins */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">NFC Amiibo Coins</h3>
                    <p className="text-gray-600 mb-4">
                      Create compact, portable amiibo coins using NFC stickers. These are perfect for
                      carrying multiple amiibos without the bulk of physical figures.
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>What you need:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>NTAG215 NFC stickers (required for amiibo compatibility)</li>
                        <li>Printable sticker paper or regular paper + glue</li>
                        <li>25mm or 30mm coin capsules or plastic chips</li>
                        <li>A way to write amiibo data (Android phone with TagMo, Flipper Zero, etc.)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* NFC Cards */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">NFC Amiibo Cards</h3>
                    <p className="text-gray-600 mb-4">
                      Make credit card-sized amiibo cards that look professional and are easy to store
                      in a wallet or card binder.
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>What you need:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>NTAG215 NFC cards or coin stickers + blank cards</li>
                        <li>Printable sticker paper for cards</li>
                        <li>Laminating pouches (optional, for durability)</li>
                        <li>Card sleeves for protection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Prints */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Decorative Prints & Stickers</h3>
                    <p className="text-gray-600 mb-4">
                      Even without NFC functionality, you can create beautiful amiibo stickers for
                      decoration, labeling, or collecting.
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Ideas:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Laptop and phone case stickers</li>
                        <li>Game case labels for your collection</li>
                        <li>Scrapbooking and crafts</li>
                        <li>Party decorations for Nintendo-themed events</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collection Management */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Collection Tracking</h3>
                    <p className="text-gray-600 mb-4">
                      Use lists to track your amiibo collection, wishlist, or plan your next purchases.
                      Export lists to share with friends or for reference when shopping.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resources Section */}
          {activeSection === "resources" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Resources & Links</h2>
                <p className="text-gray-600 mb-6">
                  Helpful links to purchase materials and learn more about creating custom amiibo products.
                </p>
              </div>

              {/* NFC Supplies */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  NFC Supplies (Amazon)
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <a
                    href="https://www.amazon.com/s?k=ntag215+nfc+stickers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏷️</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">NTAG215 NFC Stickers</p>
                      <p className="text-sm text-gray-500">Required chip type for amiibo compatibility</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>

                  <a
                    href="https://www.amazon.com/s?k=ntag215+nfc+cards"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">NTAG215 NFC Cards</p>
                      <p className="text-sm text-gray-500">Blank cards ready for printing</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>

                  <a
                    href="https://www.amazon.com/s?k=25mm+coin+capsules"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🪙</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">Coin Capsules (25mm/30mm)</p>
                      <p className="text-sm text-gray-500">Protective cases for your coins</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>

                  <a
                    href="https://www.amazon.com/s?k=printable+sticker+paper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">Printable Sticker Paper</p>
                      <p className="text-sm text-gray-500">For inkjet or laser printers</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Tools & Software */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Tools & Software
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <a
                    href="https://github.com/HiddenRamblings/TagMo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">TagMo (Android)</p>
                      <p className="text-sm text-gray-500">Write amiibo data to NFC tags</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>

                  <a
                    href="https://flipperzero.one/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🐬</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">Flipper Zero</p>
                      <p className="text-sm text-gray-500">Multi-tool for NFC and more</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Video Tutorials */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Video Tutorials (YouTube)
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <a
                    href="https://www.youtube.com/results?search_query=how+to+make+amiibo+coins"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">How to Make Amiibo Coins</p>
                      <p className="text-sm text-gray-500">Step-by-step tutorials</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>

                  <a
                    href="https://www.youtube.com/results?search_query=tagmo+tutorial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-red-500 transition-colors">TagMo Tutorials</p>
                      <p className="text-sm text-gray-500">Learn to use TagMo app</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-yellow-800 mb-2">Disclaimer</p>
                <p className="text-yellow-700">
                  This tool is for personal use only. Amiibo and Nintendo are trademarks of Nintendo.
                  We are not affiliated with Nintendo. Creating NFC copies of amiibo for personal use
                  is generally acceptable, but selling or distributing them may infringe on Nintendo's
                  intellectual property rights.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
