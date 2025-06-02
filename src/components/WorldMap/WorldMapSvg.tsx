'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface WorldMapSvgProps {
  visitedCountries?: string[];
  userColor?: string;
  onLoad?: () => void;
}

const WorldMapSvg: React.FC<WorldMapSvgProps> = ({ onLoad }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Fetch the SVG markup once on client
  useEffect(() => {
    fetch('/world.svg')
      .then((res) => res.text())
      .then((text) => setSvgContent(text))
      .finally(() => onLoad && onLoad());
  }, [onLoad]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltipRef.current) {
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
    }
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto aspect-[2000/857]"
      onMouseMove={handleMouseMove}
    >
      {hoveredCountry && (
        <motion.div
          ref={tooltipRef}
          className="absolute z-50 bg-slate-800 text-white px-3 py-1.5 rounded-md text-sm shadow-lg border border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {hoveredCountry}
        </motion.div>
      )}

      {/* Inline world.svg content, scaled responsively */}
      {svgContent && (
        <div
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
};

export default WorldMapSvg;
