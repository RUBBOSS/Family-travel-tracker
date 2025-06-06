'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface WorldMapSvgProps {
  visitedCountries?: string[];
  userColor?: string;
  onLoad?: () => void;
}

// Country name mapping for tooltips - expanded with additional patterns
const COUNTRY_NAMES: { [key: string]: string } = {
  // Major countries by ID
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
  KP: 'North Korea',
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
  EH: 'Western Sahara',
  MR: 'Mauritania',
  TN: 'Tunisia',
  GM: 'The Gambia',
  GW: 'Guinea-Bissau',
  GN: 'Guinea',
  SL: 'Sierra Leone',
  LR: 'Liberia',
  TG: 'Togo',
  BJ: 'Benin',
  ER: 'Eritrea',
  DJ: 'Djibouti',
  SO: 'Somalia',
  SS: 'South Sudan',
  RW: 'Rwanda',
  LS: 'Lesotho',
  SZ: 'Eswatini',
  // Countries by class name (as they appear in the SVG)
  ANGOLA: 'Angola',
  ARGENTINA: 'Argentina',
  AUSTRALIA: 'Australia',
  'UNITED STATES': 'United States',
  CANADA: 'Canada',
  BRAZIL: 'Brazil',
  RUSSIA: 'Russia',
  'RUSSIAN FEDERATION': 'Russia',
  CHINA: 'China',
  INDIA: 'India',
  KAZAKHSTAN: 'Kazakhstan',
  ALGERIA: 'Algeria',
  'DEMOCRATIC REPUBLIC OF THE CONGO': 'Democratic Republic of the Congo',
  'SAUDI ARABIA': 'Saudi Arabia',
  MEXICO: 'Mexico',
  INDONESIA: 'Indonesia',
  SUDAN: 'Sudan',
  LIBYA: 'Libya',
  IRAN: 'Iran',
  MONGOLIA: 'Mongolia',
  PERU: 'Peru',
  CHAD: 'Chad',
  NIGER: 'Niger',
  MALI: 'Mali',
  'SOUTH AFRICA': 'South Africa',
  COLOMBIA: 'Colombia',
  ETHIOPIA: 'Ethiopia',
  BOLIVIA: 'Bolivia',
  MAURITANIA: 'Mauritania',
  EGYPT: 'Egypt',
  TANZANIA: 'Tanzania',
  NIGERIA: 'Nigeria',
  VENEZUELA: 'Venezuela',
  NAMIBIA: 'Namibia',
  MOZAMBIQUE: 'Mozambique',
  PAKISTAN: 'Pakistan',
  TURKEY: 'Turkey',
  CHILE: 'Chile',
  ZAMBIA: 'Zambia',
  MYANMAR: 'Myanmar',
  AFGHANISTAN: 'Afghanistan',
  SOMALIA: 'Somalia',
  'CENTRAL AFRICAN REPUBLIC': 'Central African Republic',
  'SOUTH SUDAN': 'South Sudan',
  UKRAINE: 'Ukraine',
  BOTSWANA: 'Botswana',
  MADAGASCAR: 'Madagascar',
  KENYA: 'Kenya',
  FRANCE: 'France',
  YEMEN: 'Yemen',
  THAILAND: 'Thailand',
  SPAIN: 'Spain',
  TURKMENISTAN: 'Turkmenistan',
  CAMEROON: 'Cameroon',
  'PAPUA NEW GUINEA': 'Papua New Guinea',
  SWEDEN: 'Sweden',
  UZBEKISTAN: 'Uzbekistan',
  MOROCCO: 'Morocco',
  IRAQ: 'Iraq',
  PARAGUAY: 'Paraguay',
  ZIMBABWE: 'Zimbabwe',
  NORWAY: 'Norway',
  JAPAN: 'Japan',
  GERMANY: 'Germany',
  'REPUBLIC OF THE CONGO': 'Republic of the Congo',
  FINLAND: 'Finland',
  VIETNAM: 'Vietnam',
  MALAYSIA: 'Malaysia',
  'IVORY COAST': 'Ivory Coast',
  POLAND: 'Poland',
  OMAN: 'Oman',
  ITALY: 'Italy',
  PHILIPPINES: 'Philippines',
  'BURKINA FASO': 'Burkina Faso',
  'NEW ZEALAND': 'New Zealand',
  GABON: 'Gabon',
  GUINEA: 'Guinea',
  'UNITED KINGDOM': 'United Kingdom',
  UGANDA: 'Uganda',
  GHANA: 'Ghana',
  ROMANIA: 'Romania',
  LAOS: 'Laos',
  GUYANA: 'Guyana',
  BELARUS: 'Belarus',
  KYRGYZSTAN: 'Kyrgyzstan',
  SENEGAL: 'Senegal',
  SYRIA: 'Syria',
  CAMBODIA: 'Cambodia',
  URUGUAY: 'Uruguay',
  SURINAME: 'Suriname',
  TUNISIA: 'Tunisia',
  BANGLADESH: 'Bangladesh',
  NEPAL: 'Nepal',
  TAJIKISTAN: 'Tajikistan',
  GREECE: 'Greece',
  NICARAGUA: 'Nicaragua',
  'NORTH KOREA': 'North Korea',
  MALAWI: 'Malawi',
  ERITREA: 'Eritrea',
  BENIN: 'Benin',
  HONDURAS: 'Honduras',
  LIBERIA: 'Liberia',
  BULGARIA: 'Bulgaria',
  'SIERRA LEONE': 'Sierra Leone',
  SERBIA: 'Serbia',
  TOGO: 'Togo',
  'SOUTH KOREA': 'South Korea',
  ICELAND: 'Iceland',
  HUNGARY: 'Hungary',
  JORDAN: 'Jordan',
  PORTUGAL: 'Portugal',
  AZERBAIJAN: 'Azerbaijan',
  AUSTRIA: 'Austria',
  'UNITED ARAB EMIRATES': 'United Arab Emirates',
  'CZECH REPUBLIC': 'Czech Republic',
  PANAMA: 'Panama',
  IRELAND: 'Ireland',
  GEORGIA: 'Georgia',
  'SRI LANKA': 'Sri Lanka',
  LITHUANIA: 'Lithuania',
  LATVIA: 'Latvia',
  CROATIA: 'Croatia',
  'COSTA RICA': 'Costa Rica',
  SLOVAKIA: 'Slovakia',
  'DOMINICAN REPUBLIC': 'Dominican Republic',
  BHUTAN: 'Bhutan',
  ESTONIA: 'Estonia',
  DENMARK: 'Denmark',
  NETHERLANDS: 'Netherlands',
  SWITZERLAND: 'Switzerland',
  'GUINEA-BISSAU': 'Guinea-Bissau',
  MOLDOVA: 'Moldova',
  BELGIUM: 'Belgium',
  LESOTHO: 'Lesotho',
  ARMENIA: 'Armenia',
  ALBANIA: 'Albania',
  'SOLOMON ISLANDS': 'Solomon Islands',
  'EQUATORIAL GUINEA': 'Equatorial Guinea',
  BURUNDI: 'Burundi',
  HAITI: 'Haiti',
  RWANDA: 'Rwanda',
  MACEDONIA: 'North Macedonia',
  DJIBOUTI: 'Djibouti',
  BELIZE: 'Belize',
  'EL SALVADOR': 'El Salvador',
  ISRAEL: 'Israel',
  SLOVENIA: 'Slovenia',
  'NEW CALEDONIA': 'New Caledonia',
  FIJI: 'Fiji',
  KUWAIT: 'Kuwait',
  SWAZILAND: 'Eswatini',
  'TIMOR-LESTE': 'East Timor',
  VANUATU: 'Vanuatu',
  WALES: 'Wales',
  BAHRAIN: 'Bahrain',
  'TRINIDAD AND TOBAGO': 'Trinidad and Tobago',
  CYPRUS: 'Cyprus',
  LEBANON: 'Lebanon',
  JAMAICA: 'Jamaica',
  GAMBIA: 'Gambia',
  QATAR: 'Qatar',
  'FALKLAND ISLANDS': 'Falkland Islands',
  BRUNEI: 'Brunei',
  PALESTINE: 'Palestine',
  MONTENEGRO: 'Montenegro',
  'BOSNIA AND HERZEGOVINA': 'Bosnia and Herzegovina',
  KOSOVO: 'Kosovo',
  LUXEMBOURG: 'Luxembourg',
  MALTA: 'Malta',
  MALDIVES: 'Maldives',
  BARBADOS: 'Barbados',
  'NORTHERN CYPRUS': 'Northern Cyprus',
  'FRENCH SOUTHERN AND ANTARCTIC LANDS': 'French Southern and Antarctic Lands',
  'CAPE VERDE': 'Cape Verde',
  SAMOA: 'Samoa',
  'SAINT LUCIA': 'Saint Lucia',
  'SAO TOME AND PRINCIPE': 'São Tomé and Príncipe',
  COMOROS: 'Comoros',
  MICRONESIA: 'Micronesia',
  TONGA: 'Tonga',
  KIRIBATI: 'Kiribati',
  BAHAMAS: 'Bahamas',
  DOMINICA: 'Dominica',
  'MARSHALL ISLANDS': 'Marshall Islands',
  PALAU: 'Palau',
  SEYCHELLES: 'Seychelles',
  'ANTIGUA AND BARBUDA': 'Antigua and Barbuda',
  'SAINT VINCENT AND THE GRENADINES': 'Saint Vincent and the Grenadines',
  GRENADA: 'Grenada',
  'SAINT KITTS AND NEVIS': 'Saint Kitts and Nevis',
  TUVALU: 'Tuvalu',
  NAURU: 'Nauru',
  SINGAPORE: 'Singapore',
  'FEDERATED STATES OF MICRONESIA': 'Micronesia',
  'UNITED STATES VIRGIN ISLANDS': 'U.S. Virgin Islands',
};

const WorldMapSvg: React.FC<WorldMapSvgProps> = ({
  visitedCountries = [],
  userColor = '#3b82f6',
  onLoad,
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
    showAbove: false,
    showLeft: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredCountryRef = useRef<string | null>(null);
  const hoveredElementRef = useRef<SVGPathElement | null>(null);
  const lastTooltipPositionRef = useRef({
    x: 0,
    y: 0,
    showAbove: false,
    showLeft: false,
  });
  const hoverDebounceRef = useRef<NodeJS.Timeout | null>(null); // Fetch the SVG markup once on client and highlight visited countries
  useEffect(() => {
    fetch('/world.svg')
      .then((res) => res.text())
      .then((text) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(text, 'image/svg+xml');
        const paths = svgDoc.querySelectorAll('path');
        paths.forEach((path) => {
          const countryId = path.id;
          const countryClass = path.getAttribute('class');
          const countryCode =
            countryId?.toUpperCase() || countryClass?.toUpperCase();

          // Enhanced visited check logic
          let isVisited = false;
          // Check by ID first (like "AM", "US", etc.)
          if (countryId && visitedCountries.includes(countryId)) {
            isVisited = true;
          } // Check by class name to country code mapping
          else if (countryClass) {
            // Direct class name to country code mappings for countries that use class names in SVG
            if (countryClass === 'Canada' && visitedCountries.includes('CA')) {
              isVisited = true;
            } else if (
              countryClass === 'Australia' &&
              visitedCountries.includes('AU')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'United States' &&
              visitedCountries.includes('US')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Russian Federation' &&
              visitedCountries.includes('RU')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'United Kingdom' &&
              visitedCountries.includes('GB')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Argentina' &&
              visitedCountries.includes('AR')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Angola' &&
              visitedCountries.includes('AO')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Azerbaijan' &&
              visitedCountries.includes('AZ')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Bahamas' &&
              visitedCountries.includes('BS')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Chile' &&
              visitedCountries.includes('CL')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'China' &&
              visitedCountries.includes('CN')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Comoros' &&
              visitedCountries.includes('KM')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Cyprus' &&
              visitedCountries.includes('CY')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Denmark' &&
              visitedCountries.includes('DK')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Falkland Islands' &&
              visitedCountries.includes('FK')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Federated States of Micronesia' &&
              visitedCountries.includes('FM')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Fiji' &&
              visitedCountries.includes('FJ')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'France' &&
              visitedCountries.includes('FR')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Greece' &&
              visitedCountries.includes('GR')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Indonesia' &&
              visitedCountries.includes('ID')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Italy' &&
              visitedCountries.includes('IT')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Japan' &&
              visitedCountries.includes('JP')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Malaysia' &&
              visitedCountries.includes('MY')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Malta' &&
              visitedCountries.includes('MT')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Mauritius' &&
              visitedCountries.includes('MU')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'New Zealand' &&
              visitedCountries.includes('NZ')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Norway' &&
              visitedCountries.includes('NO')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Oman' &&
              visitedCountries.includes('OM')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Papua New Guinea' &&
              visitedCountries.includes('PG')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Philippines' &&
              visitedCountries.includes('PH')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Samoa' &&
              visitedCountries.includes('WS')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'São Tomé and Principe' &&
              visitedCountries.includes('ST')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Seychelles' &&
              visitedCountries.includes('SC')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Solomon Islands' &&
              visitedCountries.includes('SB')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Tonga' &&
              visitedCountries.includes('TO')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Trinidad and Tobago' &&
              visitedCountries.includes('TT')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Turkey' &&
              visitedCountries.includes('TR')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Vanuatu' &&
              visitedCountries.includes('VU')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Cape Verde' &&
              visitedCountries.includes('CV')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Antigua and Barbuda' &&
              visitedCountries.includes('AG')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Saint Kitts and Nevis' &&
              visitedCountries.includes('KN')
            ) {
              isVisited = true;
            }
            // Add more class-to-code mappings as needed
            else {
              // Try to find the country code by looking up the class name in our COUNTRY_NAMES mapping
              const classUpper = countryClass.toUpperCase();

              // First, try direct match with class name as key
              for (const [key, name] of Object.entries(COUNTRY_NAMES)) {
                if (key === classUpper && visitedCountries.includes(key)) {
                  isVisited = true;
                  break;
                }
              }

              // If not found, try matching by the mapped country name
              if (!isVisited) {
                for (const [code, name] of Object.entries(COUNTRY_NAMES)) {
                  if (
                    name.toUpperCase() === classUpper &&
                    visitedCountries.includes(code)
                  ) {
                    isVisited = true;
                    break;
                  }
                }
              }
            }
          }

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

          // Improved country name resolution logic
          let countryName = 'Unknown Country';

          // Try ID first (like "US", "AF", etc.)
          if (countryId && COUNTRY_NAMES[countryId]) {
            countryName = COUNTRY_NAMES[countryId];
          }
          // Try class name (like "Canada", "United States")
          else if (countryClass && COUNTRY_NAMES[countryClass.toUpperCase()]) {
            countryName = COUNTRY_NAMES[countryClass.toUpperCase()];
          }
          // Try with different case variations
          else if (countryId && COUNTRY_NAMES[countryId.toUpperCase()]) {
            countryName = COUNTRY_NAMES[countryId.toUpperCase()];
          }
          // Try with original class name (without case conversion)
          else if (countryClass && COUNTRY_NAMES[countryClass]) {
            countryName = COUNTRY_NAMES[countryClass];
          }

          // Set the data attribute for quick lookup during hover
          path.setAttribute('data-country-name', countryName);
        });

        setSvgContent(new XMLSerializer().serializeToString(svgDoc));
      })
      .finally(() => onLoad && onLoad());
  }, [onLoad, visitedCountries, userColor]); // Add event listeners using event delegation after SVG content is rendered
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const container = containerRef.current; // Helper function to reset element style based on visited status
    const resetElementStyle = (element: SVGPathElement) => {
      const countryId = element.id;
      const countryClass = element.getAttribute('class');

      let isVisited = false;
      if (countryId && visitedCountries.includes(countryId)) {
        isVisited = true;
      } else if (countryClass) {
        // Use the same mapping logic as the main highlighting
        if (countryClass === 'Canada' && visitedCountries.includes('CA')) {
          isVisited = true;
        } else if (
          countryClass === 'Australia' &&
          visitedCountries.includes('AU')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'United States' &&
          visitedCountries.includes('US')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Russian Federation' &&
          visitedCountries.includes('RU')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'United Kingdom' &&
          visitedCountries.includes('GB')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Argentina' &&
          visitedCountries.includes('AR')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Angola' &&
          visitedCountries.includes('AO')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Azerbaijan' &&
          visitedCountries.includes('AZ')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Bahamas' &&
          visitedCountries.includes('BS')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Chile' &&
          visitedCountries.includes('CL')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'China' &&
          visitedCountries.includes('CN')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Comoros' &&
          visitedCountries.includes('KM')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Cyprus' &&
          visitedCountries.includes('CY')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Denmark' &&
          visitedCountries.includes('DK')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Falkland Islands' &&
          visitedCountries.includes('FK')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Federated States of Micronesia' &&
          visitedCountries.includes('FM')
        ) {
          isVisited = true;
        } else if (countryClass === 'Fiji' && visitedCountries.includes('FJ')) {
          isVisited = true;
        } else if (
          countryClass === 'France' &&
          visitedCountries.includes('FR')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Greece' &&
          visitedCountries.includes('GR')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Indonesia' &&
          visitedCountries.includes('ID')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Italy' &&
          visitedCountries.includes('IT')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Japan' &&
          visitedCountries.includes('JP')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Malaysia' &&
          visitedCountries.includes('MY')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Malta' &&
          visitedCountries.includes('MT')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Mauritius' &&
          visitedCountries.includes('MU')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'New Zealand' &&
          visitedCountries.includes('NZ')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Norway' &&
          visitedCountries.includes('NO')
        ) {
          isVisited = true;
        } else if (countryClass === 'Oman' && visitedCountries.includes('OM')) {
          isVisited = true;
        } else if (
          countryClass === 'Papua New Guinea' &&
          visitedCountries.includes('PG')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Philippines' &&
          visitedCountries.includes('PH')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Samoa' &&
          visitedCountries.includes('WS')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'São Tomé and Principe' &&
          visitedCountries.includes('ST')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Seychelles' &&
          visitedCountries.includes('SC')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Solomon Islands' &&
          visitedCountries.includes('SB')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Tonga' &&
          visitedCountries.includes('TO')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Trinidad and Tobago' &&
          visitedCountries.includes('TT')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Turkey' &&
          visitedCountries.includes('TR')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Vanuatu' &&
          visitedCountries.includes('VU')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Cape Verde' &&
          visitedCountries.includes('CV')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Antigua and Barbuda' &&
          visitedCountries.includes('AG')
        ) {
          isVisited = true;
        } else if (
          countryClass === 'Saint Kitts and Nevis' &&
          visitedCountries.includes('KN')
        ) {
          isVisited = true;
        } else {
          const classUpper = countryClass.toUpperCase();

          // First, try direct match with class name as key
          for (const [key, name] of Object.entries(COUNTRY_NAMES)) {
            if (key === classUpper && visitedCountries.includes(key)) {
              isVisited = true;
              break;
            }
          }

          // If not found, try matching by the mapped country name
          if (!isVisited) {
            for (const [code, name] of Object.entries(COUNTRY_NAMES)) {
              if (
                name.toUpperCase() === classUpper &&
                visitedCountries.includes(code)
              ) {
                isVisited = true;
                break;
              }
            }
          }
        }
      }

      // Find and reset ALL parts of the same country (same logic as handleMouseOver)
      const allCountryParts: SVGPathElement[] = [];

      if (countryId) {
        // For countries with IDs, find all paths with the same ID
        const sameCountryPart = container.querySelector(
          `path[id="${countryId}"]`
        ) as SVGPathElement;
        if (sameCountryPart) allCountryParts.push(sameCountryPart);
      } else if (countryClass) {
        // For countries with classes, find all paths with the same class
        const sameCountryParts = container.querySelectorAll(
          `path[class="${countryClass}"]`
        ) as NodeListOf<SVGPathElement>;
        allCountryParts.push(...Array.from(sameCountryParts));
      }

      // Apply reset styles to all parts of the country
      allCountryParts.forEach((part) => {
        if (!isVisited) {
          part.style.fill = '#475569'; // Default slate-600 color
          part.style.stroke = '#1e293b'; // Default stroke color (slate-800)
          part.style.strokeWidth = '0.5'; // Default stroke width
          part.style.filter = 'none'; // Remove any filters
        } else {
          part.style.fill = userColor; // Restore visited country color
          part.style.stroke = '#1e293b'; // Default stroke color (slate-800)
          part.style.strokeWidth = '0.5'; // Default stroke width
          part.style.filter = 'none'; // Remove hover effects
        }
      });
    }; // Clear tooltip and reset element
    const clearTooltip = () => {
      // Clear any pending debounce timer
      if (hoverDebounceRef.current) {
        clearTimeout(hoverDebounceRef.current);
        hoverDebounceRef.current = null;
      }

      if (hoveredElementRef.current) {
        resetElementStyle(hoveredElementRef.current);
        hoveredElementRef.current = null;
      }
      hoveredCountryRef.current = null;
      setHoveredCountry(null);
    };
    const handleMouseOver = (e: Event) => {
      const target = e.target as SVGPathElement;
      if (target.tagName === 'path') {
        // Clear any pending debounce timer if mouse is over a path
        if (hoverDebounceRef.current) {
          clearTimeout(hoverDebounceRef.current);
          hoverDebounceRef.current = null;
        }

        const countryName =
          target.getAttribute('data-country-name') || 'Unknown Country';

        // Only update tooltip state and styling if we're hovering over a different element
        if (hoveredElementRef.current !== target) {
          // Set tooltip state for the new country
          setHoveredCountry(countryName);
          hoveredCountryRef.current = countryName;

          // Reset last position reference for new country to ensure immediate position update
          lastTooltipPositionRef.current = {
            x: 0,
            y: 0,
            showAbove: false,
            showLeft: false,
          };

          // Reset previous element if it exists
          if (hoveredElementRef.current) {
            resetElementStyle(hoveredElementRef.current);
          }

          hoveredElementRef.current = target;

          // Check if this country is visited
          const countryId = target.id;
          const countryClass = target.getAttribute('class');

          let isVisited = false;
          if (countryId && visitedCountries.includes(countryId)) {
            isVisited = true;
          } else if (countryClass) {
            // Use the same mapping logic as the main highlighting and resetElementStyle
            if (countryClass === 'Canada' && visitedCountries.includes('CA')) {
              isVisited = true;
            } else if (
              countryClass === 'Australia' &&
              visitedCountries.includes('AU')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'United States' &&
              visitedCountries.includes('US')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Russian Federation' &&
              visitedCountries.includes('RU')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'United Kingdom' &&
              visitedCountries.includes('GB')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Argentina' &&
              visitedCountries.includes('AR')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Angola' &&
              visitedCountries.includes('AO')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Azerbaijan' &&
              visitedCountries.includes('AZ')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Bahamas' &&
              visitedCountries.includes('BS')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Chile' &&
              visitedCountries.includes('CL')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'China' &&
              visitedCountries.includes('CN')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Comoros' &&
              visitedCountries.includes('KM')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Cyprus' &&
              visitedCountries.includes('CY')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Denmark' &&
              visitedCountries.includes('DK')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Falkland Islands' &&
              visitedCountries.includes('FK')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Federated States of Micronesia' &&
              visitedCountries.includes('FM')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Fiji' &&
              visitedCountries.includes('FJ')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'France' &&
              visitedCountries.includes('FR')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Greece' &&
              visitedCountries.includes('GR')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Indonesia' &&
              visitedCountries.includes('ID')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Italy' &&
              visitedCountries.includes('IT')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Japan' &&
              visitedCountries.includes('JP')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Malaysia' &&
              visitedCountries.includes('MY')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Malta' &&
              visitedCountries.includes('MT')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Mauritius' &&
              visitedCountries.includes('MU')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'New Zealand' &&
              visitedCountries.includes('NZ')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Norway' &&
              visitedCountries.includes('NO')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Oman' &&
              visitedCountries.includes('OM')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Papua New Guinea' &&
              visitedCountries.includes('PG')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Philippines' &&
              visitedCountries.includes('PH')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Samoa' &&
              visitedCountries.includes('WS')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'São Tomé and Principe' &&
              visitedCountries.includes('ST')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Seychelles' &&
              visitedCountries.includes('SC')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Solomon Islands' &&
              visitedCountries.includes('SB')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Tonga' &&
              visitedCountries.includes('TO')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Trinidad and Tobago' &&
              visitedCountries.includes('TT')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Turkey' &&
              visitedCountries.includes('TR')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Vanuatu' &&
              visitedCountries.includes('VU')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Cape Verde' &&
              visitedCountries.includes('CV')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Antigua and Barbuda' &&
              visitedCountries.includes('AG')
            ) {
              isVisited = true;
            } else if (
              countryClass === 'Saint Kitts and Nevis' &&
              visitedCountries.includes('KN')
            ) {
              isVisited = true;
            } else {
              const classUpper = countryClass.toUpperCase();

              // First, try direct match with class name as key
              for (const [key, name] of Object.entries(COUNTRY_NAMES)) {
                if (key === classUpper && visitedCountries.includes(key)) {
                  isVisited = true;
                  break;
                }
              }

              // If not found, try matching by the mapped country name
              if (!isVisited) {
                for (const [code, name] of Object.entries(COUNTRY_NAMES)) {
                  if (
                    name.toUpperCase() === classUpper &&
                    visitedCountries.includes(code)
                  ) {
                    isVisited = true;
                    break;
                  }
                }
              }
            }
          }

          // Find and highlight ALL parts of the same country
          const allCountryParts: SVGPathElement[] = [];

          if (countryId) {
            // For countries with IDs, find all paths with the same ID
            const sameCountryPart = container.querySelector(
              `path[id="${countryId}"]`
            ) as SVGPathElement;
            if (sameCountryPart) allCountryParts.push(sameCountryPart);
          } else if (countryClass) {
            // For countries with classes, find all paths with the same class
            const sameCountryParts = container.querySelectorAll(
              `path[class="${countryClass}"]`
            ) as NodeListOf<SVGPathElement>;
            allCountryParts.push(...Array.from(sameCountryParts));
          }

          // Apply hover styles to all parts of the country
          allCountryParts.forEach((part) => {
            if (isVisited) {
              // Enhanced style for visited countries
              part.style.filter =
                'brightness(1.2) drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))';
              part.style.stroke = '#ffffff'; // White stroke for visited countries
              part.style.strokeWidth = '2';
            } else {
              // Style for non-visited countries
              part.style.fill = '#64748b'; // Lighter gray for non-visited countries
              part.style.stroke = '#3b82f6'; // Blue stroke for highlight
              part.style.strokeWidth = '1.5';
              part.style.filter =
                'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))';
            }
          });
        }
      } else {
        // Mouse is not over a country path, clear tooltip immediately
        clearTooltip();
      }
    };
    const handleMouseOut = (e: Event) => {
      const target = e.target as SVGPathElement;
      if (target.tagName === 'path' && hoveredElementRef.current === target) {
        // Clear any existing debounce timer
        if (hoverDebounceRef.current) {
          clearTimeout(hoverDebounceRef.current);
        }

        // Add a small debounce to prevent rapid clearing during mouse movement within the same country
        hoverDebounceRef.current = setTimeout(() => {
          clearTooltip();
        }, 50);
      }
    };

    // Clear tooltip when mouse leaves the container entirely
    const handleContainerMouseLeave = () => {
      clearTooltip();
    }; // Add event listeners to the container (event delegation)
    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);
    container.addEventListener('mouseleave', handleContainerMouseLeave); // Cleanup function
    return () => {
      // Clear any pending debounce timer
      if (hoverDebounceRef.current) {
        clearTimeout(hoverDebounceRef.current);
      }

      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
      container.removeEventListener('mouseleave', handleContainerMouseLeave);
    };
  }, [svgContent, visitedCountries, userColor]);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hoveredCountry) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Tooltip dimensions
      const tooltipWidth = 120;
      const tooltipHeight = 40;
      const offset = 10;

      // Check viewport position instead of just container position
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const absoluteMouseX = e.clientX;
      const absoluteMouseY = e.clientY;

      let newPosition = {
        x: mouseX,
        y: mouseY,
        showAbove: false,
        showLeft: false,
      };

      // Determine vertical position based on viewport space
      const spaceBelow = viewportHeight - absoluteMouseY;
      const spaceAbove = absoluteMouseY;

      if (spaceBelow < tooltipHeight + offset + 20) {
        // Not enough space below
        newPosition.showAbove = true;
        newPosition.y = mouseY - offset;
      } else {
        newPosition.y = mouseY + offset;
      }

      // Determine horizontal position
      const spaceRight = viewportWidth - absoluteMouseX;
      const spaceLeft = absoluteMouseX;

      if (spaceRight < tooltipWidth + offset + 20) {
        // Not enough space to the right
        newPosition.showLeft = true;
        newPosition.x = mouseX - offset;
      } else {
        newPosition.x = mouseX + offset;
      }

      // Final boundary checks within container
      const minX = 5;
      const maxX = rect.width - tooltipWidth - 5;
      const minY = 5;
      const maxY = rect.height - tooltipHeight - 5;

      if (newPosition.showLeft) {
        newPosition.x = Math.max(minX, Math.min(newPosition.x, maxX));
      } else {
        newPosition.x = Math.max(minX, Math.min(newPosition.x, maxX));
      }

      if (newPosition.showAbove) {
        newPosition.y = Math.max(minY, newPosition.y);
      } else {
        newPosition.y = Math.min(maxY, newPosition.y);
      }

      // Only update tooltip position if there's a significant change
      const threshold = 5; // 5 pixels threshold
      const lastPos = lastTooltipPositionRef.current;
      const positionChanged =
        Math.abs(newPosition.x - lastPos.x) > threshold ||
        Math.abs(newPosition.y - lastPos.y) > threshold ||
        newPosition.showAbove !== lastPos.showAbove ||
        newPosition.showLeft !== lastPos.showLeft;

      if (positionChanged) {
        setTooltipPosition(newPosition);
        lastTooltipPositionRef.current = newPosition;
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[2000/857] w-full max-w-4xl overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {hoveredCountry && (
        <motion.div
          className="pointer-events-none absolute z-50 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform:
              `${tooltipPosition.showLeft ? 'translateX(-100%)' : ''} ${tooltipPosition.showAbove ? 'translateY(-100%)' : ''}`.trim(),
            maxWidth: '120px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {hoveredCountry}
        </motion.div>
      )}

      {/* Inline world.svg content, scaled responsively */}
      {svgContent && (
        <div
          className="h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
};

export default WorldMapSvg;
