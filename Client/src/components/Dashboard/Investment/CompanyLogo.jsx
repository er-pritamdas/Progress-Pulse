import React, { useState } from "react";
import {
  getBrandLogoSource,
  getCompanyInitials,
  getCompanyColorPalette,
} from "../../../utils/companyLogos";

/**
 * CompanyLogo Component
 * Automatically renders high-definition local vector SVGs & 512px assets for
 * Indian Banks, Mutual Funds, and major stocks/platforms, with graceful
 * Google High-Res Favicon CDN and monogram initials fallback.
 */
export default function CompanyLogo({
  name,
  domain,
  type,
  size = "w-6 h-6",
  rounded = "rounded-lg",
  className = "",
  alt,
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { src: logoUrl, isLocal } = getBrandLogoSource(name, { domain, type });
  const initials = getCompanyInitials(name);
  const palette = getCompanyColorPalette(name);

  // Normalize size whether passed as numeric (e.g. 32, 24, 40) or Tailwind string (e.g. "w-8 h-8")
  const sizeClass =
    typeof size === "number"
      ? size <= 16
        ? "w-4 h-4"
        : size <= 20
        ? "w-5 h-5"
        : size <= 24
        ? "w-6 h-6"
        : size <= 32
        ? "w-8 h-8"
        : size <= 40
        ? "w-10 h-10"
        : size <= 48
        ? "w-12 h-12"
        : "w-16 h-16"
      : String(size || "w-6 h-6");

  // Fallback Monogram Badge
  if (!logoUrl || hasError) {
    return (
      <div
        className={`${sizeClass} ${rounded} shrink-0 font-black flex items-center justify-center text-[9.5px] border shadow-2xs select-none transition-transform ${palette.bg} ${className}`}
        title={name}
      >
        {initials}
      </div>
    );
  }

  const paddingClass =
    sizeClass.includes("w-4") || sizeClass.includes("w-5") ? "p-0.5" : "p-1";

  return (
    <div
      className={`${sizeClass} ${rounded} shrink-0 bg-white dark:bg-white text-slate-800 ${paddingClass} border border-base-300 dark:border-white/20 shadow-2xs overflow-hidden flex items-center justify-center relative select-none ${className}`}
      title={name}
    >
      {/* Instant placeholder only while remote CDN image is fetching */}
      {!isLoaded && !isLocal && (
        <div
          className={`absolute inset-0 font-black flex items-center justify-center text-[9px] ${palette.bg}`}
        >
          {initials}
        </div>
      )}

      <img
        src={logoUrl}
        alt={alt || name || "Brand Logo"}
        loading={isLocal ? "eager" : "lazy"}
        decoding={isLocal ? "sync" : "async"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-contain ${rounded} transition-opacity duration-150 ${
          isLoaded || isLocal ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

