// utils/DaisyColors.js

const getCSSVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const DaisyColors = {
  // Brand Colors
  primary: getCSSVar('--color-primary'),
  primaryContent: getCSSVar('--color-primary-content'),

  secondary: getCSSVar('--color-secondary'),
  secondaryContent: getCSSVar('--color-secondary-content'),

  accent: getCSSVar('--color-accent'),
  accentContent: getCSSVar('--color-accent-content'),

  // Neutrals & Base
  neutral: getCSSVar('--color-neutral'),
  neutralContent: getCSSVar('--color-neutral-content'),

  base100: getCSSVar('--color-base-100'),
  base200: getCSSVar('--color-base-200'),
  base300: getCSSVar('--color-base-300'),
  baseContent: getCSSVar('--color-base-content'),

  // Status Colors
  info: getCSSVar('--color-info'),
  infoContent: getCSSVar('--color-info-content'),

  success: getCSSVar('--color-success'),
  successContent: getCSSVar('--color-success-content'),

  warning: getCSSVar('--color-warning'),
  warningContent: getCSSVar('--color-warning-content'),

  error: getCSSVar('--color-error'),
  errorContent: getCSSVar('--color-error-content')
};

export default DaisyColors;
