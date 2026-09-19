import React, { useRef, useEffect } from "react";

/**
 * ScrollableChartWrapper
 * 
 * Provides smooth horizontal touch-scrolling on Phone view (< 768px)
 * while keeping the Y-axis intact, opaque, and pinned on the left.
 * 
 * On Desktop (>= 768px), it guarantees 100% desktop immunity:
 * the chart takes 100% container width with zero horizontal scrolling.
 */
const ScrollableChartWrapper = ({
  children,
  minWidth = "100%",
  showScrollHint = false,
  hintText = "↔ Scroll sideways to view all days",
  className = "",
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const updateStickyYAxis = () => {
      // On Tablet/Desktop (>= 768px), keep standard positioning and clean up
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        const yAxes = container.querySelectorAll(".apexcharts-yaxis");
        yAxes.forEach((yAxis) => {
          const baseX = yAxis.getAttribute("data-base-x");
          if (baseX !== null) {
            yAxis.setAttribute("transform", `translate(${baseX}, 0)`);
          }
          const bgRect = yAxis.querySelector(".sticky-yaxis-bg");
          if (bgRect) bgRect.style.display = "none";
        });
        return;
      }

      const scrollLeft = container.scrollLeft;
      const svg = container.querySelector(".apexcharts-svg");
      if (!svg) return;

      const yAxes = container.querySelectorAll(".apexcharts-yaxis");
      if (!yAxes.length) return;

      // Theme colors using CSS variables
      const themeBg = "var(--color-base-100, var(--fallback-b1, #1d232a))";
      const themeBorder = "var(--color-base-300, rgba(255, 255, 255, 0.12))";

      const svgHeight = (svg.clientHeight || 520) + 60;

      yAxes.forEach((yAxis) => {
        // 1. Move yAxis to the end of its parent so it renders ON TOP of the chart bars & grid
        if (yAxis.parentNode && yAxis.parentNode.lastChild !== yAxis) {
          yAxis.parentNode.appendChild(yAxis);
        }

        // 2. Find or store the initial translation of this Y-axis
        let baseX = yAxis.getAttribute("data-base-x");
        if (baseX === null) {
          const transformAttr = yAxis.getAttribute("transform") || "";
          const match = transformAttr.match(/translate\(\s*([-\d.]+)/);
          baseX = match ? match[1] : "0";
          yAxis.setAttribute("data-base-x", baseX);
        }

        const numericBaseX = parseFloat(baseX) || 0;
        const newX = numericBaseX + scrollLeft;
        yAxis.setAttribute("transform", `translate(${newX}, 0)`);

        // 3. Create or update the 100% solid, opaque backdrop rectangle matching theme
        let bgRect = yAxis.querySelector(".sticky-yaxis-bg");
        const rectX = -numericBaseX - 25;
        const rectWidth = numericBaseX + 45;

        if (!bgRect) {
          bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          bgRect.setAttribute("class", "sticky-yaxis-bg");
          bgRect.setAttribute("x", String(rectX));
          bgRect.setAttribute("y", "-30");
          bgRect.setAttribute("width", String(Math.max(80, rectWidth)));
          bgRect.setAttribute("height", String(svgHeight));
          bgRect.style.fill = themeBg;
          bgRect.style.fillOpacity = "1";
          bgRect.style.opacity = "1";
          bgRect.style.pointerEvents = "none";
          bgRect.style.stroke = themeBorder;
          bgRect.style.strokeWidth = "1px";
          // Insert as first child of yAxis so it sits right behind the text labels
          yAxis.insertBefore(bgRect, yAxis.firstChild);
        } else {
          bgRect.setAttribute("x", String(rectX));
          bgRect.setAttribute("y", "-30");
          bgRect.setAttribute("width", String(Math.max(80, rectWidth)));
          bgRect.setAttribute("height", String(svgHeight));
          bgRect.style.fill = themeBg;
          bgRect.style.stroke = themeBorder;
          bgRect.style.display = scrollLeft > 2 ? "block" : "none";
        }
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateStickyYAxis);
        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    // Observe in case ApexCharts updates its DOM on data/filter change
    const observer = new MutationObserver(() => {
      updateStickyYAxis();
    });
    observer.observe(container, { childList: true, subtree: true });

    // Initial check
    const timer = setTimeout(updateStickyYAxis, 100);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {showScrollHint && (
        <div className="flex md:hidden items-center justify-end gap-1.5 text-[11px] text-base-content/70 mb-1 px-1 font-medium">
          <span className="text-primary font-bold">↔</span>
          <span>{hintText}</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="phone-chart-scroll-wrapper custom-scrollbar-thin pb-2 md:pb-0 relative"
      >
        <div
          className="phone-chart-inner min-w-full md:!w-full md:!min-w-full"
          style={{ minWidth }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ScrollableChartWrapper;
