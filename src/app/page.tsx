'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import LoginForm from '@/components/LoginForm';
import GeneratorForm from '@/components/GeneratorForm';
import PreviewPanel from '@/components/PreviewPanel';
import ThumbnailGallery from '@/components/ThumbnailGallery';
import Loader from '@/components/kokonutui/loader';
import ShimmerText from '@/components/kokonutui/shimmer-text';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C4D0CD] to-[#E3DEC8]">
        <Loader
          title="Loading..."
          subtitle="Preparing the infographic generator"
          size="md"
        />
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
          <div className="flex items-center gap-6">
            <Image
              src="/logo.svg"
              alt="Portable Spas New Zealand"
              width={180}
              height={35}
              className="brightness-0 invert opacity-90"
              priority
            />
            <div className="hidden sm:block h-8 w-px bg-[#E3DEC8]/30"></div>
            <h1 className="hidden sm:block font-heading text-xl font-semibold text-[#E3DEC8]">
              Infographic Generator
            </h1>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="font-heading text-lg font-semibold text-[#4B5E5A] mb-4">
              Create New Infographic
            </h2>
            <GeneratorForm
              onGenerate={handleGenerate}
              onGenerating={setIsGenerating}
            />
          </motion.div>

          {/* Right Column - Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <PreviewPanel
              imageUrl={currentImageUrl}
              isGenerating={isGenerating}
              selectedRecord={selectedRecord}
            />
          </motion.div>
        </div>

        {/* Gallery Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-6"
        >
          <ThumbnailGallery
            onSelect={handleSelectFromGallery}
            selectedId={selectedRecord?.id || null}
            refreshTrigger={refreshTrigger}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-sm text-[#4B5E5A]">
        <p className="font-body">Powered by Gemini 3 Pro Image + Pinecone RAG</p>
      </footer>
    </div>
  );
}
