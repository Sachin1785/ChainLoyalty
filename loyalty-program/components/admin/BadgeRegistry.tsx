"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Input, Modal } from "@/components/shared/ui";
import { Badge } from "@/lib/types";
import { fetchAllBadges, registerBadge, uploadBadgeImage, mintBadgeTest } from "@/lib/utils/api";
import { Trash2, Plus, Edit2, Award, Cpu, Globe, Lock, Unlock, Zap, Star, MoreHorizontal, ChevronRight, Upload, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BadgeRegistryProps {
  onRefresh?: () => void;
}

export function BadgeRegistry({ onRefresh }: BadgeRegistryProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    metadataUri: "",
    maxSupply: 1000,
    pointValue: 0,
    transferable: false,
    onchainId: undefined as number | undefined,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Minting State
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [mintAddress, setMintAddress] = useState("");
  const [mintingBadge, setMintingBadge] = useState<Badge | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const data = await fetchAllBadges();
      setBadges(data);
    } catch (error) {
      console.error("Failed to load badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (badge?: Badge) => {
    if (badge) {
      setEditingId(badge.id);
      setFormData({
        name: badge.name,
        description: badge.description,
        metadataUri: badge.metadataUri,
        maxSupply: badge.maxSupply || 1000,
        pointValue: badge.pointValue || 0,
        transferable: badge.transferable,
        onchainId: badge.onchainId,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        metadataUri: "",
        maxSupply: 1000,
        pointValue: 0,
        transferable: false,
        onchainId: undefined,
      });
    }
    setPreviewUrl(badge?.metadataUri || null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let finalMetadataUri = formData.metadataUri;
      
      // If a new file is selected, upload it first
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadResp = await uploadBadgeImage(selectedFile);
          finalMetadataUri = `http://localhost:8000${uploadResp.url}`;
        } finally {
          setIsUploading(false);
        }
      }

      if (editingId) {
        const updatedBadges = badges.map((b) =>
          b.id === editingId ? { ...b, ...formData, metadataUri: finalMetadataUri } : b
        );
        setBadges(updatedBadges);
      } else {
        await registerBadge({ ...formData, metadataUri: finalMetadataUri });
      }
      handleCloseModal();
      await loadBadges();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to save badge:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (badgeId: string) => {
    if (!confirm("Are you sure you want to delete this badge?")) return;
    try {
      setLoading(true);
      setBadges(badges.filter((b) => b.id !== badgeId));
    } catch (error) {
      console.error("Failed to delete badge:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMintModal = (badge: Badge) => {
    setMintingBadge(badge);
    setMintAddress("");
    setIsMintModalOpen(true);
  };

  const handleMintTestNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintingBadge || !mintAddress) return;

    try {
      setIsMinting(true);
      await mintBadgeTest({
        to_address: mintAddress,
        badge_id: Number(mintingBadge.id),
        onchain_badge_type_id: mintingBadge.onchainId,
      });
      alert(`Successfully minted ${mintingBadge.name} to ${mintAddress}`);
      setIsMintModalOpen(false);
    } catch (error) {
      console.error("Failed to mint test NFT:", error);
      alert("Failed to mint test NFT. Check the console for details.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Zap size={22} className="text-purple-600" />
           </div>
           <div>
              <h2 className="text-xl font-bold tracking-tight">The Badge Forge</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Standard Management</p>
           </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-8 py-4 rounded-[24px] font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Forge New Badge
        </button>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {badges.map((badge, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={badge.id}
            >
              <div className="bg-white rounded-[32px] border border-gray-50 shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative">
                <div className={`h-24 flex items-center justify-center relative ${idx % 2 === 0 ? 'bg-purple-100' : 'bg-pink-100'}`}>
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm relative z-10 transition-transform group-hover:scale-110">
                      <Award size={24} className={idx % 2 === 0 ? 'text-purple-600' : 'text-pink-600'} />
                   </div>
                   <div className="absolute top-4 right-4 text-gray-400">
                      {badge.transferable ? <Unlock size={14} /> : <Lock size={14} />}
                   </div>
                </div>

                <div className="p-8">
                   <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold tracking-tight">{badge.name}</h3>
                      <div className="flex flex-col items-end">
                         {badge.onchainId ? (
                            <span className="text-[8px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">ON-CHAIN ID: {badge.onchainId}</span>
                         ) : (
                            <span className="text-[8px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold italic">PENDING SYNC</span>
                         )}
                      </div>
                   </div>
                   <p className="text-xs font-medium text-gray-400 line-clamp-2 leading-relaxed min-h-[32px] mb-6">
                     {badge.description}
                   </p>

                   <div className="space-y-3 pt-6 border-t border-gray-50">
                      <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                         <span>Value</span>
                         <span className="text-purple-600">{badge.pointValue} Points</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                         <span>Supply Limit</span>
                         <span className="text-gray-900">{badge.maxSupply === 0 ? "1,000 Standard" : badge.maxSupply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                         <span>Transfer Type</span>
                         <span className={badge.transferable ? 'text-purple-600' : 'text-pink-500'}>
                            {badge.transferable ? "Open Marketplace" : "Soulbound Only"}
                         </span>
                      </div>
                   </div>

                   <div className="flex gap-3 pt-8">
                      <button
                        className="flex-1 h-12 bg-green-50 text-green-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-all transform hover:scale-105"
                        onClick={() => handleOpenMintModal(badge)}
                        disabled={!badge.onchainId}
                        title={!badge.onchainId ? "Must be synced on-chain first" : "Mint Test NFT"}
                      >
                        <Zap size={12} /> Mint Test
                      </button>
                      <button
                        className="w-12 h-12 bg-[#F8F7F3] rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center hover:bg-gray-100 transition-colors"
                        onClick={() => handleOpenModal(badge)}
                        title="Configure"
                      >
                        <Edit2 size={16} className="text-gray-600" />
                      </button>
                      <button
                        className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        onClick={() => handleDelete(badge.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {badges.length === 0 && !loading && (
        <div className="py-24 text-center rounded-[40px] border-2 border-dashed border-gray-100 bg-[#F8F7F3]/50">
          <Star className="mx-auto mb-6 text-gray-200" size={64} />
          <h3 className="text-xl font-bold tracking-tight text-gray-900">No Standards Deployed</h3>
          <p className="text-xs font-medium text-gray-400 mt-2">Forge your first ERC-1155 achievement to begin.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Update Badge" : "New Badge Standard"}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <Input
            label="Badge Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Early Adopter"
          />
          <Input
            label="Description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What is this badge for?"
          />
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Badge Artwork</label>
             <div className="relative h-48 bg-[#F8F7F4] rounded-[32px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden hover:bg-white hover:border-purple-200 transition-all group">
                {previewUrl ? (
                   <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <button 
                            type="button"
                            onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl"
                         >
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </>
                ) : (
                   <>
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 text-purple-600">
                         <Upload size={20} />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Drag & Drop Image or Click to Upload</p>
                      <input 
                         type="file" 
                         accept="image/*"
                         onChange={handleFileChange}
                         className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                   </>
                )}
             </div>
          </div>
          <Input
            label="Points / Discount Value"
            required
            type="number"
            min="0"
            value={formData.pointValue}
            onChange={(e) => setFormData({ ...formData, pointValue: parseInt(e.target.value) })}
          />
          <Input
            label="Max Supply (Default 1000)"
            required
            type="number"
            min="1"
            value={formData.maxSupply}
            onChange={(e) => setFormData({ ...formData, maxSupply: parseInt(e.target.value) })}
          />
          <div className="flex items-center gap-4 bg-[#F8F7F3] p-6 rounded-[24px] border border-gray-100">
             <input
                type="checkbox"
                id="transferable"
                checked={formData.transferable}
                onChange={(e) => setFormData({ ...formData, transferable: e.target.checked })}
                className="w-6 h-6 rounded-lg text-purple-600 focus:ring-purple-500 cursor-pointer border-gray-200"
              />
            <label htmlFor="transferable" className="text-xs font-bold text-gray-400 uppercase tracking-tight cursor-pointer select-none">
              Enable Marketplace Transfers
            </label>
          </div>
          <button type="submit" className="w-full bg-black text-white rounded-[24px] py-6 font-bold text-lg hover:opacity-90 transition-opacity" disabled={loading}>
            {loading ? "Forging..." : (editingId ? "Update Protocol" : "Forge Badge Standard")}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        title={`Mint Test NFT: ${mintingBadge?.name}`}
      >
        <form onSubmit={handleMintTestNFT} className="space-y-6 pt-4">
          <Input
            label="Recipient Wallet Address"
            required
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            placeholder="0x..."
          />
          <button 
             type="submit" 
             className="w-full bg-green-500 text-white rounded-[24px] py-6 font-bold text-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2" 
             disabled={isMinting}
          >
            {isMinting ? "Minting to Network..." : (
               <>
                  <Zap size={20} /> Deploy Test Token
               </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
