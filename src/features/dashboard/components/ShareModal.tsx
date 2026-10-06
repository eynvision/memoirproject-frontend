/**
 * @file ShareModal.tsx
 * @description Modal allowing the owner to set a contributor password and copy the secure link.
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Copy, Check, KeyRound} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  onSaveAndCopy: (password: string) => Promise<void>;
  isLinkCopied: boolean;
}

export function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  onSaveAndCopy,
  isLinkCopied,
}: ShareModalProps) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      await onSaveAndCopy(password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white border border-stone-300 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-stone-400 hover:text-stone-700 transition cursor-pointer p-1 rounded-full hover:bg-stone-100"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-memory-bg border border-stone-200 flex items-center justify-center text-memory-primary">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-sans">
                Share Archive Access
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Secure your memoir link for family and friends.
              </p>
            </div>
          </div>

          <div className="space-y-5 my-6">
            {/* Password Input Section */}
            <div>
              <label 
                htmlFor="share-password"
                className="block text-xs uppercase tracking-widest font-bold text-stone-600 mb-2"
              >
                Contributor Access Password <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="share-password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. family2026 (Leave blank for public)"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-800 outline-none focus:border-memory-primary transition-all font-sans"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                If set, contributors must enter this password along with their name before viewing or adding memories.
              </p>
            </div>

            {/* Generated Link Box */}
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-600 mb-2">
                Secure Link
              </label>
              <div className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-600 font-mono truncate select-all">
                {shareUrl || "Generating link..."}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer font-sans"
            >
              Cancel
            </button>
            <motion.button
              type="button"
              onClick={handleAction}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-memory-primary text-white rounded-xl text-xs font-semibold shadow-md hover:bg-memory-maroon transition-all cursor-pointer flex items-center gap-2 font-sans"
            >
              {isLinkCopied ? (
                <>
                  <Check size={14} /> Link Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Save & Copy Link
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}