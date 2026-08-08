"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "@/components/ui/Icon";

export default function Modal({ open, onClose, title, children, size="md" }) {
  useEffect(()=>{
    if (!open) return;
    document.body.style.overflow="hidden";
    const handler = (e)=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return ()=>{ document.body.style.overflow=""; window.removeEventListener("keydown",handler); };
  },[open, onClose]);

  if (!open || typeof window==="undefined") return null;

  const widths = { sm:"max-w-sm", md:"max-w-lg", lg:"max-w-2xl", xl:"max-w-4xl" };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4">
      <div className="fixed inset-0 bg-zinc-950/30 backdrop-blur-sm z-0" onClick={onClose} />
      <div className={`relative z-10 w-full ${widths[size]} bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="btn-icon" aria-label="Bağla"><Icon name="close" size={18} /></button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
