import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * MobileDrawer - Instagram / iOS-style pull-down mobile drawer / bottom sheet.
 *
 * Designed exclusively for phone view (desktop view is completely untouched):
 * - Slides up smoothly from the bottom with spring physics like Instagram comments.
 * - Interactive swipe down to close:
 *   1. Pull down from top grab handle or header.
 *   2. When scrollbar inside the drawer content is at the top (scrollTop === 0), pulling down smoothly slides the drawer down to close.
 * - Tap backdrop outside to dismiss with slide-down exit animation.
 * - Proportional backdrop dimming during drag.
 * - Rubber-band resistance on upward over-pull.
 * - Safe area padding for home indicator bar on modern phones.
 */
export default function MobileDrawer({
  isOpen = true,
  onClose,
  children,
  title,
  subtitle,
  icon,
  rightAction,
  customHeader,
  footer,
  maxHeight = "max-h-[88vh]",
  className = "",
  bodyClassName = "",
  showHandle = true,
  showCloseButton = true,
  zIndex = "z-[99999]",
}) {
  const drawerRef = useRef(null);
  const contentRef = useRef(null);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Gesture tracking refs
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const dragActive = useRef(false);

  // Mount entrance animation trigger
  useEffect(() => {
    if (isOpen) {
      const timer = requestAnimationFrame(() => {
        setIsMounted(true);
      });
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        cancelAnimationFrame(timer);
        document.body.style.overflow = prevOverflow;
      };
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isClosing) {
        handleRequestClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClosing]);

  // Smooth slide-down exit animation
  const handleRequestClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
      setDragY(0);
      setIsDragging(false);
    }, 240);
  };

  // ----------------------------------------------------------------------
  // Touch Handlers for Drag-to-Dismiss Gesture
  // ----------------------------------------------------------------------
  const handleTouchStart = (e) => {
    if (isClosing || !e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    touchStartX.current = touch.clientX;
    touchStartTime.current = Date.now();
    dragActive.current = false;

    const contentEl = contentRef.current;
    if (!contentEl || !contentEl.contains(e.target)) {
      // Started on grab pill or header outside scrollable body
      dragActive.current = true;
      setIsDragging(true);
    }
  };

  // Helper to detect if target or any scrollable container up to contentRef is scrolled
  const getEffectiveScrollTop = (targetEl) => {
    const contentEl = contentRef.current;
    if (!contentEl) return 0;
    let curr = targetEl;
    let maxScroll = contentEl.scrollTop || 0;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (curr.scrollHeight > curr.clientHeight) {
        try {
          const style = window.getComputedStyle(curr);
          if (style.overflowY === "auto" || style.overflowY === "scroll") {
            maxScroll = Math.max(maxScroll, curr.scrollTop || 0);
          }
        } catch (_) {}
      }
      if (curr === contentEl) break;
      curr = curr.parentElement;
    }
    return maxScroll;
  };

  const handleTouchMove = (e) => {
    if (isClosing || !e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const contentEl = contentRef.current;

    if (contentEl && contentEl.contains(e.target)) {
      const effectiveScrollTop = getEffectiveScrollTop(e.target);
      // If content is scrolled down, keep touchStartY updated so pulling at top starts smoothly
      if (effectiveScrollTop > 0) {
        touchStartY.current = touch.clientY;
        if (dragActive.current) {
          dragActive.current = false;
          setIsDragging(false);
          setDragY(0);
        }
        return;
      }

      // If at top of scrollable content (scrollTop <= 0)
      const deltaY = touch.clientY - touchStartY.current;
      const deltaX = touch.clientX - touchStartX.current;

      // Ignore predominantly horizontal gestures
      if (!dragActive.current && Math.abs(deltaX) > Math.abs(deltaY) + 6) {
        return;
      }

      if (deltaY > 0) {
        // User is pulling down when scrollbar is at the top
        if (!dragActive.current) {
          dragActive.current = true;
          setIsDragging(true);
        }
        if (e.cancelable) e.preventDefault();
        setDragY(deltaY);
        return;
      } else {
        // User is scrolling down into content
        touchStartY.current = touch.clientY;
        if (dragActive.current) {
          dragActive.current = false;
          setIsDragging(false);
          setDragY(0);
        }
        return;
      }
    }

    // Touch started on header or grab handle
    const deltaY = touch.clientY - touchStartY.current;
    if (dragActive.current) {
      if (e.cancelable) e.preventDefault();
      if (deltaY > 0) {
        setDragY(deltaY);
      } else {
        // Elastic rubber-band resistance when pulling upward
        setDragY(deltaY * 0.22);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isClosing) return;
    if (dragActive.current) {
      const elapsed = Date.now() - touchStartTime.current;
      const isQuickFlick = elapsed < 320 && dragY > 40;
      const isDraggedFar = dragY > 85;

      if (isQuickFlick || isDraggedFar) {
        handleRequestClose();
      } else {
        // Snap back to open position
        setDragY(0);
      }
    }
    dragActive.current = false;
    setIsDragging(false);
  };

  const handleTouchCancel = () => {
    dragActive.current = false;
    setIsDragging(false);
    setDragY(0);
  };

  // Mouse drag support for handle (for devtools responsive testing)
  const handleHandleMouseDown = (e) => {
    if (isClosing) return;
    touchStartY.current = e.clientY;
    touchStartTime.current = Date.now();
    dragActive.current = true;
    setIsDragging(true);

    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - touchStartY.current;
      if (deltaY > 0) {
        setDragY(deltaY);
      } else {
        setDragY(deltaY * 0.22);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      handleTouchEnd();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  if (!isOpen && !isClosing) return null;

  // Backdrop opacity calculation
  const backdropOpacity = isClosing
    ? 0
    : isDragging && dragY > 0
    ? Math.max(0.1, 1 - dragY / 450)
    : isMounted
    ? 1
    : 0;

  // Drawer transform & transition
  const drawerTransform = isClosing
    ? "translateY(100%)"
    : isDragging || dragY !== 0
    ? `translateY(${Math.max(0, dragY)}px)`
    : isMounted
    ? "translateY(0)"
    : "translateY(100%)";

  const drawerTransition = isDragging
    ? "none"
    : isClosing
    ? "transform 0.24s cubic-bezier(0.32, 0, 0.67, 0)"
    : "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)";

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndex} flex flex-col justify-end select-none md:hidden overflow-hidden`}
      style={{ touchAction: "none" }}
    >
      {/* 1. Backdrop (Click outside to dismiss) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-240"
        style={{ opacity: backdropOpacity }}
        onClick={handleRequestClose}
      />

      {/* 2. Drawer Panel (Instagram Comment Section Style) */}
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        style={{
          transform: drawerTransform,
          transition: drawerTransition,
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
        className={`relative z-10 w-full bg-base-100 rounded-t-[28px] border-t border-base-content/10 dark:border-base-content/10 shadow-2xl flex flex-col overflow-hidden will-change-transform ${maxHeight} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Grab Handle Pill */}
        {showHandle && (
          <div
            onMouseDown={handleHandleMouseDown}
            className="pt-2.5 pb-1 px-4 flex justify-center items-center shrink-0 cursor-grab active:cursor-grabbing touch-none"
          >
            <div
              className={`h-1.5 rounded-full transition-all duration-150 ${
                isDragging
                  ? "w-16 bg-primary"
                  : "w-11 bg-base-content/25 hover:bg-base-content/40"
              }`}
            />
          </div>
        )}

        {/* Optional Custom Header or Default Header */}
        {customHeader ? (
          <div className="shrink-0">{customHeader}</div>
        ) : (title || subtitle || icon || rightAction || showCloseButton) ? (
          <div className="px-4 py-2 border-b border-base-200/80 flex items-center justify-between gap-2.5 shrink-0 bg-base-200/30">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {icon && <div className="shrink-0">{icon}</div>}
              {(title || subtitle) && (
                <div className="min-w-0 flex-1">
                  {title && (
                    <div className="font-extrabold text-sm text-base-content leading-snug truncate">
                      {title}
                    </div>
                  )}
                  {subtitle && (
                    <div className="text-[10.5px] text-base-content/55 font-medium truncate mt-0.5">
                      {subtitle}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {rightAction}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="btn btn-xs btn-ghost btn-circle rounded-full text-base-content/60 hover:text-base-content cursor-pointer"
                  title="Close"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* 3. Scrollable Body Content (Pull down when scrollTop === 0 closes drawer) */}
        <div
          ref={contentRef}
          className={`flex-1 overflow-y-auto overscroll-contain min-h-0 ${bodyClassName}`}
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
          }}
        >
          {children}
        </div>

        {/* 4. Optional Fixed Footer */}
        {footer && <div className="shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
