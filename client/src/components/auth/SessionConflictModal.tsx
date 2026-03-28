import React from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';

interface SessionConflictModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SessionConflictModal: React.FC<SessionConflictModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
              <AlertTriangle size={32} />
            </div>
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Active Session Detected</h3>
          <p className="text-slate-500 leading-relaxed mb-8">
            You are already logged in on another device. For security reasons, we recommend only having one active session. Do you want to log out from all other devices and continue?
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              <LogOut size={18} />
              <span>YES, CONTINUE & LOGOUT OTHERS</span>
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-bold transition-all active:scale-[0.98]"
            >
              NO, CANCEL LOGIN
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            Industrial Grade Session Management
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionConflictModal;
