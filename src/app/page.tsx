'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import GeneratorForm from '@/components/GeneratorForm';
import PreviewPanel from '@/components/PreviewPanel';
import ThumbnailGallery from '@/components/ThumbnailGallery';
import type { InfographicRecord } from '@/types';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<InfographicRecord | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleGenerate = (imageUrl: string, id: string) => {
    setCurrentImageUrl(imageUrl);
    setSelectedRecord({
      id,
      url: imageUrl,
      thumbnailUrl: imageUrl,
      prompt: '',
      aspectRatio: '',
      resolution: '',
      createdAt: new Date().toISOString(),
    });
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectFromGallery = (record: InfographicRecord) => {
    setCurrentImageUrl(record.url);
    setSelectedRecord(record);
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D0CD] to-[#E3DEC8]">
      {/* Header */}
      <header className="bg-[#4B5E5A] shadow-sm border-b border-[#3d4e4a]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-xl font-bold text-[#E3DEC8]">
              PORTABLE SPAS
            </h1>
            <p className="font-accent text-sm text-[#C4D0CD]">New Zealand</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-[#E3DEC8] hover:text-white hover:bg-[#3d4e4a] rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-heading text-lg font-semibold text-[#4B5E5A] mb-4">
              Create New Infographic
            </h2>
            <GeneratorForm
              onGenerate={handleGenerate}
              onGenerating={setIsGenerating}
            />
          </div>

          {/* Right Column - Preview */}
          <div>
            <PreviewPanel
              imageUrl={currentImageUrl}
              isGenerating={isGenerating}
              selectedRecord={selectedRecord}
            />
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mt-6">
          <ThumbnailGallery
            onSelect={handleSelectFromGallery}
            selectedId={selectedRecord?.id || null}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-sm text-[#4B5E5A]">
        <p className="font-body">Powered by Gemini 3 Pro Image + Pinecone RAG</p>
      </footer>
    </div>
  );
}
