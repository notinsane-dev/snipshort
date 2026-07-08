"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  className?: string;
  id?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  className,
  id,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });

  const selected = options.find((o) => o.value === value);

  useEffect(() => setMounted(true), []);

  function updatePosition() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  }

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectOption(next: string) {
    onChange(next);
    setOpen(false);
    setHighlighted(null);
  }

  const menu =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "fixed",
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
            className="z-[200] rounded-xl border border-white/[0.14] bg-[#f2e6cd] p-1.5 shadow-[0_12px_40px_rgba(46,32,21,0.18)]"
            role="listbox"
            aria-label="Select option"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              const isHighlighted = highlighted === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(option.value)}
                  onMouseLeave={() => setHighlighted(null)}
                  onClick={() => selectOption(option.value)}
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150",
                    isHighlighted || isSelected
                      ? "bg-brand text-brand-foreground"
                      : "text-white/75 hover:bg-brand/10 hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white transition-all duration-200",
          "hover:border-white/[0.14] focus-visible:border-brand/50 focus-visible:outline-none",
          open && "border-brand/50 bg-white/[0.06]"
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-white/35 transition-transform duration-200",
            open && "rotate-180 text-brand"
          )}
        />
      </button>
      {menu}
    </div>
  );
}
