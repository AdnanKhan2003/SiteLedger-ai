'use client';
import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    loading?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-scale-in">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        {variant === 'danger' && (
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                        )}
                        {variant === 'success' && (
                            <div className="p-2 bg-green-100 rounded-full">
                                <CheckCircle className="text-green-600" size={24} />
                            </div>
                        )}
                        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-secondary text-sm leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-border bg-gray-50">
                    {cancelText && (
                        <button
                            onClick={onClose}
                            className="btn btn-outline"
                            disabled={loading}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`btn ${variant === 'danger'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : variant === 'success'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'btn-primary'
                            }`}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
