"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AmiiboCard from "@/components/AmiiboCard";
import Header from "@/components/Header";
import { Amiibo, AmiiboResponse, TypeResponse, AmiiboSeriesResponse } from "@/lib/types";
import { getAmiibos, getTypes, getAmiiboSeries } from "@/lib/amiibo-api";
import { useApiStatus } from "@/contexts/ApiStatusContext";

export default function ExplorePage() {
  const { status: apiStatus, message: apiMessage, checkStatus } = useApiStatus();
  const [amiibos, setAmiibos] = useState<Amiibo[]>([]);
  const [types, setTypes] = useState<{ key: string; name: string }[]>([]);
  const [amiiboSeries, setAmiiboSeries] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [amiiboSeriesFilter, setAmiiboSeriesFilter] = useState("");

  useEffect(() => {
    async function loadFilters() {
      try {
        const [typesRes, amiiboSeries] = await Promise.all([
          getTypes() as Promise<TypeResponse>,
          getAmiiboSeries() as Promise<AmiiboSeriesResponse>,
        ]);
        setTypes(typesRes.amiibo);
        setAmiiboSeries(amiiboSeries.amiibo);
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    }
    loadFilters();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const filters: Record<string, string | boolean> = {};
      if (nameFilter) filters.name = nameFilter;
      if (typeFilter) filters.type = typeFilter;
      if (amiiboSeriesFilter) filters.amiiboSeries = amiiboSeriesFilter;

      const response = (await getAmiibos(filters)) as AmiiboResponse;
      const amiiboData = Array.isArray(response.amiibo)
        ? response.amiibo
        : [response.amiibo];
      setAmiibos(amiiboData);
    } catch (error) {
      console.error("Search failed:", error);
      setAmiibos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNameFilter("");
    setTypeFilter("");
    setAmiiboSeriesFilter("");
    setAmiibos([]);
    setSearched(false);
  };

  const handleSuggestionClick = async (seriesName: string) => {
    setAmiiboSeriesFilter(seriesName);
    setNameFilter("");
    setTypeFilter("");
    setLoading(true);
    setSearched(true);
    try {
      const response = (await getAmiibos({ amiiboSeries: seriesName })) as AmiiboResponse;
      const amiiboData = Array.isArray(response.amiibo)
        ? response.amiibo
        : [response.amiibo];
      setAmiibos(amiiboData);
    } catch (error) {
      console.error("Search failed:", error);
      setAmiibos([]);
    } finally {
      setLoading(false);
    }
  };

  // Popular series suggestions
  const suggestions = [
    { name: "Super Smash Bros.", emoji: "🎮" },
    { name: "Animal Crossing", emoji: "🍃" },
    { name: "Super Mario Bros.", emoji: "🍄" },
    { name: "Legend Of Zelda", emoji: "🗡️" },
    { name: "Kirby", emoji: "⭐" },
    { name: "Splatoon", emoji: "🦑" },
    { name: "Pokemon", emoji: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* API Status Banner */}
      {apiStatus === "offline" && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-amber-800 font-medium text-sm">AmiiboAPI is currently unavailable</p>
              <p className="text-amber-700 text-xs">
                We use the free <a href="https://www.amiiboapi.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">AmiiboAPI</a> service to fetch amiibo data.
                The service appears to be down at the moment. Please check back later!
              </p>
            </div>
            <button
              onClick={checkStatus}
              className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-lg hover:bg-amber-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {apiStatus === "degraded" && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-yellow-800 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>AmiiboAPI may be experiencing issues. Some features might not work correctly.</span>
          </div>
        </div>
      )}

      <div className="flex relative">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Filters */}
        <aside className={`
          fixed md:sticky top-[52px] left-0 z-40 md:z-auto
          w-72 md:w-64 shrink-0 bg-white border-r border-gray-200
          min-h-[calc(100vh-52px)] md:min-h-[calc(100vh-52px)]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          md:self-start
        `}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Filters</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {types.map((type) => (
                    <option key={type.key} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amiibo Series
                </label>
                <select
                  value={amiiboSeriesFilter}
                  onChange={(e) => setAmiiboSeriesFilter(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Amiibo Series</option>
                  {amiiboSeries.map((series) => (
                    <option key={series.key} value={series.name}>
                      {series.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    handleSearch();
                    setSidebarOpen(false);
                  }}
                  disabled={loading}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
                <button
                  onClick={() => {
                    handleClear();
                    setSidebarOpen(false);
                  }}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading amiibos...</p>
            </div>
          )}

          {!loading && searched && amiibos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No amiibos found matching your criteria.</p>
            </div>
          )}

          {!loading && amiibos.length > 0 && (
            <>
              <p className="text-gray-600 mb-4 text-sm">Found {amiibos.length} amiibo(s)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {amiibos.map((amiibo) => (
                  <AmiiboCard key={`${amiibo.head}-${amiibo.tail}`} amiibo={amiibo} />
                ))}
              </div>
            </>
          )}

          {!searched && apiStatus === "offline" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="max-w-md text-center px-4">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Explore is temporarily unavailable</h2>
                <p className="text-gray-600 mb-4">
                  We rely on the free <a href="https://www.amiiboapi.com/" target="_blank" rel="noopener noreferrer" className="text-red-500 underline hover:text-red-600">AmiiboAPI</a> service
                  to provide amiibo data. The service appears to be down at the moment.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  AmiiboAPI is an amazing free community resource and we're grateful for their service.
                  Please check back later or visit their site for status updates.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={checkStatus}
                    className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Check again
                  </button>
                  <Link
                    href="/lists"
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Go to My Lists
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!searched && apiStatus !== "offline" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <p className="text-gray-400 text-xl mb-8 text-center px-4">
                Tap the menu or pick a series below to explore amiibos
              </p>
              <div className="max-w-3xl mx-auto">
                <p className="text-base font-bold text-gray-500 uppercase tracking-wide mb-5 text-center">
                  Popular Series
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.name}
                      onClick={() => handleSuggestionClick(suggestion.name)}
                      disabled={apiStatus === "checking"}
                      className="px-6 py-3 bg-white rounded-full text-base font-semibold text-gray-700 hover:bg-red-500 hover:text-white transition-all shadow-md border-2 border-gray-200 hover:border-red-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mr-2 text-xl">{suggestion.emoji}</span>
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
