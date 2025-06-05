'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface WorldMapSvgProps {
  visitedCountries?: string[];
  userColor?: string;
  onLoad?: () => void;
}

// Country name mapping for tooltips
const COUNTRY_NAMES: { [key: string]: string } = {
  // Major countries
  'US': 'United States',
  'CA': 'Canada',
  'MX': 'Mexico',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'GB': 'United Kingdom',
  'FR': 'France',
  'DE': 'Germany',
  'IT': 'Italy',
  'ES': 'Spain',
  'PT': 'Portugal',
  'RU': 'Russia',
  'CN': 'China',
  'IN': 'India',
  'JP': 'Japan',
  'KR': 'South Korea',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'MA': 'Morocco',
  'DZ': 'Algeria',
  'LY': 'Libya',
  'SD': 'Sudan',
  'ET': 'Ethiopia',
  'TZ': 'Tanzania',
  'UG': 'Uganda',
  'GH': 'Ghana',
  'CI': 'Ivory Coast',
  'SN': 'Senegal',
  'ML': 'Mali',
  'BF': 'Burkina Faso',
  'NE': 'Niger',
  'TD': 'Chad',
  'CF': 'Central African Republic',
  'CM': 'Cameroon',
  'GQ': 'Equatorial Guinea',
  'GA': 'Gabon',
  'CG': 'Republic of the Congo',
  'CD': 'Democratic Republic of the Congo',
  'AO': 'Angola',
  'ZM': 'Zambia',
  'ZW': 'Zimbabwe',
  'BW': 'Botswana',
  'NA': 'Namibia',
  'MW': 'Malawi',
  'MZ': 'Mozambique',
  'MG': 'Madagascar',
  'NO': 'Norway',
  'SE': 'Sweden',
  'FI': 'Finland',
  'DK': 'Denmark',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'LU': 'Luxembourg',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'CZ': 'Czech Republic',
  'SK': 'Slovakia',
  'PL': 'Poland',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'GR': 'Greece',
  'TR': 'Turkey',
  'CY': 'Cyprus',
  'MT': 'Malta',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'BA': 'Bosnia and Herzegovina',
  'ME': 'Montenegro',
  'RS': 'Serbia',
  'MK': 'North Macedonia',
  'AL': 'Albania',
  'XK': 'Kosovo',
  'MD': 'Moldova',
  'UA': 'Ukraine',
  'BY': 'Belarus',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'IE': 'Ireland',
  'IS': 'Iceland',
  'GL': 'Greenland',
  'FO': 'Faroe Islands',
  'SJ': 'Svalbard',
  'IR': 'Iran',
  'IQ': 'Iraq',
  'SY': 'Syria',
  'LB': 'Lebanon',
  'IL': 'Israel',
  'PS': 'Palestine',
  'JO': 'Jordan',
  'SA': 'Saudi Arabia',
  'YE': 'Yemen',
  'OM': 'Oman',
  'AE': 'United Arab Emirates',
  'QA': 'Qatar',
  'BH': 'Bahrain',
  'KW': 'Kuwait',
  'AF': 'Afghanistan',
  'PK': 'Pakistan',
  'BD': 'Bangladesh',
  'LK': 'Sri Lanka',
  'MV': 'Maldives',
  'NP': 'Nepal',
  'BT': 'Bhutan',
  'MM': 'Myanmar',
  'TH': 'Thailand',
  'LA': 'Laos',
  'VN': 'Vietnam',
  'KH': 'Cambodia',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'BN': 'Brunei',
  'ID': 'Indonesia',
  'TL': 'East Timor',
  'PH': 'Philippines',
  'TW': 'Taiwan',
  'MN': 'Mongolia',
  'KZ': 'Kazakhstan',
  'KG': 'Kyrgyzstan',
  'TJ': 'Tajikistan',
  'UZ': 'Uzbekistan',
  'TM': 'Turkmenistan',
  'GE': 'Georgia',
  'AM': 'Armenia',
  'AZ': 'Azerbaijan',
  'PG': 'Papua New Guinea',
  'FJ': 'Fiji',
  'SB': 'Solomon Islands',
  'VU': 'Vanuatu',
  'NC': 'New Caledonia',
  'TO': 'Tonga',
  'WS': 'Samoa',
  'KI': 'Kiribati',
  'TV': 'Tuvalu',
  'FM': 'Micronesia',
  'MH': 'Marshall Islands',
  'PW': 'Palau',
  'NR': 'Nauru',
  'CL': 'Chile',
  'PE': 'Peru',
  'EC': 'Ecuador',
  'CO': 'Colombia',
  'VE': 'Venezuela',
  'GY': 'Guyana',
  'SR': 'Suriname',
  'GF': 'French Guiana',
  'UY': 'Uruguay',
  'PY': 'Paraguay',
  'BO': 'Bolivia',
  'BZ': 'Belize',
  'GT': 'Guatemala',
  'HN': 'Honduras',
  'SV': 'El Salvador',
  'NI': 'Nicaragua',
  'CR': 'Costa Rica',
  'PA': 'Panama',
  'CU': 'Cuba',
  'JM': 'Jamaica',
  'HT': 'Haiti',
  'DO': 'Dominican Republic',
  'PR': 'Puerto Rico',
  'TT': 'Trinidad and Tobago',
  'BB': 'Barbados',
  'GD': 'Grenada',
  'VC': 'Saint Vincent and the Grenadines',
  'LC': 'Saint Lucia',
  'DM': 'Dominica',
  'AG': 'Antigua and Barbuda',
  'KN': 'Saint Kitts and Nevis',
  'BS': 'Bahamas',
  'VI': 'US Virgin Islands',
  'VG': 'British Virgin Islands',
  'AI': 'Anguilla',
  'MS': 'Montserrat',
  'GP': 'Guadeloupe',
  'MQ': 'Martinique',
  'AW': 'Aruba',
  'CW': 'Curaçao',
  'BQ': 'Caribbean Netherlands',
  'SX': 'Sint Maarten',
  'MF': 'Saint Martin',
  'BL': 'Saint Barthélemy',
  'PM': 'Saint Pierre and Miquelon',
  'FK': 'Falkland Islands',
  'GS': 'South Georgia'
};

const WorldMapSvg: React.FC<WorldMapSvgProps> = ({ visitedCountries = [], userColor = '#3b82f6', onLoad }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);  // Fetch the SVG markup once on client and highlight visited countries
  useEffect(() => {
    fetch('/world.svg')
      .then((res) => res.text())
      .then((text) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(text, 'image/svg+xml');
        const paths = svgDoc.querySelectorAll('path');

        paths.forEach(path => {
          const countryId = path.id;
          const countryClass = path.getAttribute('class');
          // Check if the country is in the visited list by ID or if it's Australia (class="Australia") and AU is visited
          const isVisited = visitedCountries.includes(countryId) || (visitedCountries.includes('AU') && countryClass === 'Australia');

          if (isVisited) {
            path.style.fill = userColor;
            path.style.stroke = '#1e293b'; // Add a stroke for better visibility
            path.style.strokeWidth = '0.5';
          } else {
            // Ensure non-visited countries have a default fill
            path.style.fill = '#475569'; // Default fill color for not visited countries (slate-600)
            path.style.stroke = '#1e293b'; // Default stroke color (slate-800)
            path.style.strokeWidth = '0.5';
          }

          // Add hover effects and tooltip functionality
          path.style.cursor = 'pointer';
          path.style.transition = 'all 0.2s ease';
        });

        setSvgContent(new XMLSerializer().serializeToString(svgDoc));
      })
      .finally(() => onLoad && onLoad());
  }, [onLoad, visitedCountries, userColor]);

  // Add event listeners after SVG content is rendered
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const container = containerRef.current;
    const paths = container.querySelectorAll('path');

    const handleMouseEnter = (e: Event) => {
      const target = e.target as SVGPathElement;
      const countryCode = target.id?.toUpperCase() || target.getAttribute('class')?.toUpperCase();
      
      // Check if country is visited
      const isVisited = visitedCountries.includes(target.id) || 
                       (visitedCountries.includes('AU') && target.getAttribute('class') === 'Australia');
      
      // Get country name from mapping or fallback to ID
      let countryName = 'Unknown Country';
      if (countryCode) {
        // Check direct mapping first
        if (COUNTRY_NAMES[countryCode]) {
          countryName = COUNTRY_NAMES[countryCode];
        } else if (countryCode === 'AUSTRALIA' && COUNTRY_NAMES['AU']) {
          countryName = COUNTRY_NAMES['AU'];
        } else {
          // Fallback to formatted ID
          countryName = countryCode.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      }

      setHoveredCountry(countryName);
      
      // Add hover styling
      if (!isVisited) {
        target.style.fill = '#64748b'; // Lighter shade on hover
      } else {
        target.style.filter = 'brightness(1.1)'; // Brighten visited countries
      }
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target as SVGPathElement;
      setHoveredCountry(null);
      
      // Check if country is visited for proper reset
      const isVisited = visitedCountries.includes(target.id) || 
                       (visitedCountries.includes('AU') && target.getAttribute('class') === 'Australia');
      
      // Reset styling
      if (!isVisited) {
        target.style.fill = '#475569';
      } else {
        target.style.filter = 'none';
      }
    };

    // Add event listeners to all paths
    paths.forEach(path => {
      path.addEventListener('mouseenter', handleMouseEnter);
      path.addEventListener('mouseleave', handleMouseLeave);
    });

    // Cleanup function
    return () => {
      paths.forEach(path => {
        path.removeEventListener('mouseenter', handleMouseEnter);
        path.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [svgContent, visitedCountries, userColor]);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredCountry && tooltipRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({ 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      });
    }
  };
  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto aspect-[2000/857]"
      onMouseMove={handleMouseMove}
    >
      {hoveredCountry && (
        <motion.div
          ref={tooltipRef}
          className="absolute z-50 bg-slate-800 text-white px-3 py-1.5 rounded-md text-sm shadow-lg border border-slate-700 pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translateY(-100%)',
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
