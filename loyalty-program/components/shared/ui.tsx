"use client";

import React from "react";
import { Loader2, X } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({
  size = 24,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-primary ${className}`}
    />
  );
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 shadow-md",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    ghost:
      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? <LoadingSpinner size={16} /> : null}
      {children}
    </button>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </h3>
          {trend !== undefined && (
            <p
              className={`text-sm mt-2 ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? "+" : ""}{trend}% vs last period
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-gray-400 dark:text-gray-600">{icon}</div>
        )}
      </div>
    </Card>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-6"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all z-10"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {title && (
          <div className="px-10 pt-10 pb-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              {title}
            </h2>
          </div>
        )}
        <div className="px-10 py-6 pb-10">{children}</div>
      </div>
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">
          {label}
        </label>
      )}
      <input
        className={`px-6 py-4 h-14 bg-[#F8F7F3] border-none rounded-2xl font-semibold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-purple-50 transition-all shadow-inner ${
          error ? "ring-2 ring-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-red-500 ml-4 uppercase">{error}</p>}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "error";
}

export function Badge({ children, variant = "primary" }: BadgeProps) {
  const variants = {
    primary:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
