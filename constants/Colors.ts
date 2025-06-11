// ConnectCare AI Color Palette - Swiggy Inspired
export const Colors = {
  // Primary Colors (Orange)
  primary: '#FF5722',        // Deep Orange - Primary buttons, active tabs, key highlights
  primaryLight: '#FF8A65',   // Light Orange - Hover states, lighter accents
  primaryDark: '#E64A19',    // Dark Orange - Pressed states, darker accents
  
  // Secondary Colors (Orange variants)
  secondary: '#FF9800',      // Amber - Secondary actions, less critical highlights
  secondaryLight: '#FFB74D', // Light Amber - Subtle highlights
  secondaryDark: '#F57C00',  // Dark Amber - Pressed secondary states
  
  // Accent Colors (Blue)
  accent: '#2196F3',         // Blue - Informational icons, links, complements
  accentLight: '#64B5F6',    // Light Blue - Subtle informational elements
  accentDark: '#1976D2',     // Dark Blue - Important informational elements
  
  // Neutral Colors
  textPrimary: '#212121',    // Almost Black - Primary text
  textSecondary: '#757575',  // Medium Gray - Secondary/less important text
  textTertiary: '#9E9E9E',   // Light Gray - Tertiary text, placeholders
  
  // Background Colors
  background: '#F5F5F5',     // Light Gray - Screen backgrounds
  surface: '#FFFFFF',        // White - Card backgrounds, surfaces
  surfaceElevated: '#FAFAFA', // Very Light Gray - Elevated surfaces
  
  // Status Colors
  success: '#4CAF50',        // Muted Green - Success states
  warning: '#FF9800',        // Amber (from primary) - Warning states
  error: '#D32F2F',          // Deep Red - Error/critical states
  info: '#2196F3',           // Blue (accent) - Informational states
  
  // Health-specific Colors
  heartRate: '#E91E63',      // Pink Red - Heart rate indicators
  bloodPressure: '#3F51B5',  // Indigo - Blood pressure
  temperature: '#FF9800',    // Amber - Temperature
  oxygen: '#00BCD4',         // Cyan - Oxygen levels
  
  // Priority Colors
  critical: '#D32F2F',       // Deep Red - Critical priority
  moderate: '#FF9800',       // Amber - Moderate priority
  stable: '#4CAF50',         // Green - Stable/low priority
  
  // Dark Mode Colors (for future implementation)
  dark: {
    primary: '#FF5722',
    accent: '#90A4AE',       // Grayer blue for dark mode
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    background: '#121212',
    surface: '#1E1E1E',
  },
  
  // Opacity variants
  opacity: {
    light: '15',             // 15% opacity - Very subtle backgrounds
    medium: '30',            // 30% opacity - Subtle backgrounds
    heavy: '60',             // 60% opacity - More prominent backgrounds
  },
};

// Helper function to get color with opacity
export const getColorWithOpacity = (color: string, opacity: keyof typeof Colors.opacity): string => {
  return `${color}${Colors.opacity[opacity]}`;
};

// Semantic color mappings for easier usage
export const SemanticColors = {
  // Button colors
  primaryButton: Colors.primary,
  secondaryButton: Colors.secondary,
  dangerButton: Colors.error,
  
  // Text colors
  heading: Colors.textPrimary,
  body: Colors.textSecondary,
  caption: Colors.textTertiary,
  
  // Status indicators
  online: Colors.success,
  offline: Colors.textTertiary,
  pending: Colors.warning,
  
  // Medical priorities
  criticalPatient: Colors.critical,
  moderatePatient: Colors.moderate,
  stablePatient: Colors.stable,
};