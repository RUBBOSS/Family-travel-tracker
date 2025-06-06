'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface WorldMapSvgProps {
  visitedCountries?: string[];
  userColor?: string;
  onLoad?: () => void;
}

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

// Country name mapping for tooltips
const COUNTRY_NAMES: { [key: string]: string } = {
  // Major countries
  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',
  BR: 'Brazil',
  AR: 'Argentina',
  GB: 'United Kingdom',
  FR: 'France',
  DE: 'Germany',
  IT: 'Italy',
  ES: 'Spain',
  PT: 'Portugal',
  RU: 'Russia',
  CN: 'China',
  IN: 'India',
  JP: 'Japan',
  KR: 'South Korea',
  AU: 'Australia',
  NZ: 'New Zealand',
  ZA: 'South Africa',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  MA: 'Morocco',
  DZ: 'Algeria',
  LY: 'Libya',
  SD: 'Sudan',
  ET: 'Ethiopia',
  TZ: 'Tanzania',
  UG: 'Uganda',
  GH: 'Ghana',
  CI: 'Ivory Coast',
  SN: 'Senegal',
  ML: 'Mali',
  BF: 'Burkina Faso',
  NE: 'Niger',
  TD: 'Chad',
  CF: 'Central African Republic',
  CM: 'Cameroon',
  GQ: 'Equatorial Guinea',
  GA: 'Gabon',
  CG: 'Republic of the Congo',
  CD: 'Democratic Republic of the Congo',
  AO: 'Angola',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
  BW: 'Botswana',
  NA: 'Namibia',
  MW: 'Malawi',
  MZ: 'Mozambique',
  MG: 'Madagascar',
  NO: 'Norway',
  SE: 'Sweden',
  FI: 'Finland',
  DK: 'Denmark',
  NL: 'Netherlands',
  BE: 'Belgium',
  LU: 'Luxembourg',
  CH: 'Switzerland',
  AT: 'Austria',
  CZ: 'Czech Republic',
  SK: 'Slovakia',
  PL: 'Poland',
  HU: 'Hungary',
  RO: 'Romania',
  BG: 'Bulgaria',
  GR: 'Greece',
  TR: 'Turkey',
  CY: 'Cyprus',
  MT: 'Malta',
  HR: 'Croatia',
  SI: 'Slovenia',
  BA: 'Bosnia and Herzegovina',
  ME: 'Montenegro',
  RS: 'Serbia',
  MK: 'North Macedonia',
  AL: 'Albania',
  XK: 'Kosovo',
  MD: 'Moldova',
  UA: 'Ukraine',
  BY: 'Belarus',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  IE: 'Ireland',
  IS: 'Iceland',
  GL: 'Greenland',
  FO: 'Faroe Islands',
  SJ: 'Svalbard',
  IR: 'Iran',
  IQ: 'Iraq',
  SY: 'Syria',
  LB: 'Lebanon',
  IL: 'Israel',
  PS: 'Palestine',
  JO: 'Jordan',
  SA: 'Saudi Arabia',
  YE: 'Yemen',
  OM: 'Oman',
  AE: 'United Arab Emirates',
  QA: 'Qatar',
  BH: 'Bahrain',
  KW: 'Kuwait',
  AF: 'Afghanistan',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  LK: 'Sri Lanka',
  MV: 'Maldives',
  NP: 'Nepal',
  BT: 'Bhutan',
  MM: 'Myanmar',
  TH: 'Thailand',
  LA: 'Laos',
  VN: 'Vietnam',
  KH: 'Cambodia',
  MY: 'Malaysia',
  SG: 'Singapore',
  BN: 'Brunei',
  ID: 'Indonesia',
  TL: 'East Timor',
  PH: 'Philippines',
  TW: 'Taiwan',
  MN: 'Mongolia',
  KZ: 'Kazakhstan',
  KG: 'Kyrgyzstan',
  TJ: 'Tajikistan',
  UZ: 'Uzbekistan',
  TM: 'Turkmenistan',
  GE: 'Georgia',
  AM: 'Armenia',
  AZ: 'Azerbaijan',
  PG: 'Papua New Guinea',
  FJ: 'Fiji',
  SB: 'Solomon Islands',
  VU: 'Vanuatu',
  NC: 'New Caledonia',
  TO: 'Tonga',
  WS: 'Samoa',
  KI: 'Kiribati',
  TV: 'Tuvalu',
  FM: 'Micronesia',
  MH: 'Marshall Islands',
  PW: 'Palau',
  NR: 'Nauru',
  CL: 'Chile',
  PE: 'Peru',
  EC: 'Ecuador',
  CO: 'Colombia',
  VE: 'Venezuela',
  GY: 'Guyana',
  SR: 'Suriname',
  GF: 'French Guiana',
  UY: 'Uruguay',
  PY: 'Paraguay',
  BO: 'Bolivia',
  BZ: 'Belize',
  GT: 'Guatemala',
  HN: 'Honduras',
  SV: 'El Salvador',
  NI: 'Nicaragua',
  CR: 'Costa Rica',
  PA: 'Panama',
  CU: 'Cuba',
  JM: 'Jamaica',
  HT: 'Haiti',
  DO: 'Dominican Republic',
  PR: 'Puerto Rico',
  TT: 'Trinidad and Tobago',
  BB: 'Barbados',
  GD: 'Grenada',
  VC: 'Saint Vincent and the Grenadines',
  LC: 'Saint Lucia',
  DM: 'Dominica',
  AG: 'Antigua and Barbuda',
  KN: 'Saint Kitts and Nevis',
  BS: 'Bahamas',
  VI: 'US Virgin Islands',
  VG: 'British Virgin Islands',
  AI: 'Anguilla',
  MS: 'Montserrat',
  GP: 'Guadeloupe',
  MQ: 'Martinique',
  AW: 'Aruba',
  CW: 'Curaçao',
  BQ: 'Caribbean Netherlands',
  SX: 'Sint Maarten',
  MF: 'Saint Martin',
  BL: 'Saint Barthélemy',
  PM: 'Saint Pierre and Miquelon',
  FK: 'Falkland Islands',
  GS: 'South Georgia',
  AD: 'Andorra',
  AQ: 'Antarctica',
  AS: 'American Samoa',
  BI: 'Burundi',
  BJ: 'Benin',
  BM: 'Bermuda',
  BV: 'Bouvet Island',
  CC: 'Cocos Islands',
  CK: 'Cook Islands',
  CV: 'Cape Verde',
  CX: 'Christmas Island',
  DJ: 'Djibouti',
  EH: 'Western Sahara',
  ER: 'Eritrea',
  GI: 'Gibraltar',
  GM: 'Gambia',
  GN: 'Guinea',
  GU: 'Guam',
  GW: 'Guinea-Bissau',
  HK: 'Hong Kong',
  HM: 'Heard Island',
  IM: 'Isle of Man',
  IO: 'British Indian Ocean Territory',
  JE: 'Jersey',
  KM: 'Comoros',
  KP: 'North Korea',
  KY: 'Cayman Islands',
  LI: 'Liechtenstein',
  LR: 'Liberia',
  LS: 'Lesotho',
  MC: 'Monaco',
  MO: 'Macau',
  MP: 'Northern Mariana Islands',
  MR: 'Mauritania',
  MU: 'Mauritius',
  NF: 'Norfolk Island',
  NU: 'Niue',
  PF: 'French Polynesia',
  PN: 'Pitcairn Islands',
  RE: 'Réunion',
  RW: 'Rwanda',
  SC: 'Seychelles',
  SH: 'Saint Helena',
  SL: 'Sierra Leone',
  SM: 'San Marino',
  SO: 'Somalia',
  SS: 'South Sudan',
  ST: 'São Tomé and Príncipe',
  SZ: 'Eswatini',
  TC: 'Turks and Caicos Islands',
  TF: 'French Southern Territories',
  TG: 'Togo',
  TK: 'Tokelau',
  UM: 'U.S. Minor Outlying Islands',
  VA: 'Vatican City',
  WF: 'Wallis and Futuna',
  YT: 'Mayotte',
};

const WorldMapSvg: React.FC<WorldMapSvgProps> = ({
  visitedCountries = [],
  userColor = '#4A90E2',
  onLoad,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  });

  useEffect(() => {
    setIsLoading(true);
    fetch('/world.svg')
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch SVG: ${res.status} ${res.statusText}`
          );
        }
        return res.text();
      })
      .then((text) => {
        if (!text) {
          throw new Error('Fetched SVG text is empty.');
        }
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(text, 'image/svg+xml');

        const parserError = svgDoc.querySelector('parsererror');
        if (parserError) {
          console.error('SVG parsing error:', parserError.textContent);
          throw new Error('Failed to parse SVG.');
        }

        const paths = svgDoc.querySelectorAll('path');
        if (paths.length === 0) {
          console.warn(
            'No <path> elements found in the SVG document. Tooltips may not work as expected.'
          );
        }

        paths.forEach((path) => {
          const countryId = path.id;
          const countryClass = path.getAttribute('class');
          const isVisited =
            visitedCountries.includes(countryId) ||
            (visitedCountries.includes('AU') && countryClass === 'Australia');

          if (isVisited) {
            path.style.fill = userColor;
            path.style.stroke = '#1e293b';
            path.style.strokeWidth = '0.5';
          } else {
            path.style.fill = '#475569';
            path.style.stroke = '#1e293b';
            path.style.strokeWidth = '0.5';
          }
          path.style.cursor = 'pointer';
          path.style.transition = 'all 0.2s ease';
        });

        setSvgContent(new XMLSerializer().serializeToString(svgDoc));
      })
      .catch((error) => {
        console.error('Error fetching or processing SVG:', error);
        setSvgContent(null); // Ensure svgContent is null on error
      })
      .finally(() => {
        setIsLoading(false); // Always set loading to false
        if (onLoad) {
          onLoad();
        }
      });
  }, [onLoad, visitedCountries, userColor]); // Add event listeners after SVG content is rendered
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) {
      console.log('SVG content or container not ready', {
        svgContent: !!svgContent,
        container: !!svgContainerRef.current,
      });
      return;
    }

    // Add a small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      const container = svgContainerRef.current;
      if (!container) return;

      // Attempt to find the SVG element rendered by dangerouslySetInnerHTML
      const svgElement = container.querySelector('svg');
      console.log('SVG element found:', !!svgElement);
      if (!svgElement) {
        console.warn(
          'SVG element not found within the container after content set. Tooltips may not work.'
        );
        return;
      }

      const paths = svgElement.querySelectorAll('path');
      console.log('Number of paths found:', paths.length);
      if (paths.length === 0) {
        console.warn(
          'No <path> elements found within the rendered SVG. Tooltips may not work.'
        );
        return;
      }

      const handleMouseEnter = (e: Event) => {
        const target = e.target as SVGPathElement;
        const countryId =
          target.id ||
          target.getAttribute('data-id') ||
          target.getAttribute('class');
        let countryName = 'Unknown Country';

        if (countryId) {
          const upperCaseCountryId = countryId.toUpperCase();
          countryName =
            COUNTRY_NAMES[upperCaseCountryId] ||
            upperCaseCountryId
              .replace(/[_-]/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());
        }

        console.log('Mouse enter on country:', countryName, 'ID:', countryId);

        // Get mouse position relative to the container
        const containerRect = container.getBoundingClientRect();
        const clientX = (e as MouseEvent).clientX;
        const clientY = (e as MouseEvent).clientY;

        setTooltip({
          visible: true,
          content: countryName,
          x: clientX - containerRect.left + 10, // Offset by 10px to avoid cursor overlap
          y: clientY - containerRect.top - 20, // Offset by 20px to show above cursor
        });

        // Add hover styling
        const isVisited =
          visitedCountries.includes(target.id) ||
          (visitedCountries.includes('AU') &&
            target.getAttribute('class') === 'Australia');
        if (!isVisited) {
          target.style.fill = '#64748b'; // Lighter shade on hover
        } else {
          target.style.filter = 'brightness(1.1)'; // Brighten visited countries
        }
      };

      const handleMouseLeave = (e: Event) => {
        const target = e.target as SVGPathElement;
        console.log('Mouse leave');
        setTooltip({ visible: false, content: '', x: 0, y: 0 });

        // Check if country is visited for proper reset
        const isVisited =
          visitedCountries.includes(target.id) ||
          (visitedCountries.includes('AU') &&
            target.getAttribute('class') === 'Australia');

        // Reset styling
        if (!isVisited) {
          target.style.fill = '#475569';
        } else {
          target.style.filter = 'none';
        }
      }; // Add event listeners to all paths
      console.log('Adding event listeners to', paths.length, 'paths');
      paths.forEach((path, index) => {
        // Test if the first few paths are receiving events
        if (index < 5) {
          console.log(
            'Adding listeners to path:',
            path.id || path.getAttribute('class'),
            path
          );
        }
        path.addEventListener('mouseenter', handleMouseEnter, {
          passive: false,
        });
        path.addEventListener('mouseleave', handleMouseLeave, {
          passive: false,
        });
        path.addEventListener('mouseover', handleMouseEnter, {
          passive: false,
        });
        path.addEventListener(
          'click',
          () =>
            console.log('Path clicked:', path.id || path.getAttribute('class')),
          { passive: false }
        );

        // Also try setting the event handlers directly
        path.onmouseenter = handleMouseEnter;
        path.onmouseleave = handleMouseLeave;
      });
    }, 100); // 100ms delay

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [svgContent, visitedCountries, userColor]); // COUNTRY_NAMES removed from dependencies as it's a constant
  return (
    <div
      ref={svgContainerRef}
      className="relative mx-auto aspect-[2000/857] w-full max-w-4xl"
      onMouseMove={(e) => {
        // Test if mouse events work on the container
        const target = e.target as Element;
        if (target.tagName === 'path') {
          const countryId =
            (target as SVGPathElement).id || target.getAttribute('class');
          const countryName = countryId
            ? COUNTRY_NAMES[countryId.toUpperCase()] || countryId
            : 'Unknown';
          console.log('Container mouse move over:', countryName);

          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Intelligent tooltip positioning
          let tooltipX = mouseX + 10;
          let tooltipY = mouseY - 30;

          // If tooltip would go above the map, position it below the cursor instead
          if (tooltipY < 0) {
            tooltipY = mouseY + 20;
          }

          // If tooltip would go beyond right edge, position it to the left of cursor
          if (tooltipX + 120 > rect.width) {
            tooltipX = mouseX - 130;
          }

          // Ensure tooltip doesn't go beyond left edge
          if (tooltipX < 0) {
            tooltipX = 10;
          }

          // If tooltip would go below the bottom, position it above the cursor
          if (tooltipY > rect.height - 40) {
            // 40px estimated tooltip height with padding
            tooltipY = mouseY - 40;
          }

          setTooltip({
            visible: true,
            content: countryName,
            x: tooltipX,
            y: tooltipY,
          });
        } else {
          setTooltip({ visible: false, content: '', x: 0, y: 0 });
        }
      }}
    >
      {isLoading && !svgContent && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          Loading Map...
        </div>
      )}{' '}
      {/* Inline world.svg content, scaled responsively */}
      {svgContent && (
        <div
          className="h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
          style={{ pointerEvents: 'auto' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y,
            left: tooltip.x,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none', // Make sure tooltip doesn't interfere with mouse events on SVG
            zIndex: 1000, // Ensure tooltip is on top
            transform: 'translateY(-100%)', // Adjust to show above cursor consistently
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default WorldMapSvg;
