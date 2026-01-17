# Updated UI Reference

This folder contains the **reference UI components** that were provided for the new ADAPT interface design. 

## ⚠️ Important Notes

- **This folder is NOT part of the routing system** - it's blocked via `next.config.ts` redirects
- **These are reference files only** - the actual implementation is in `/components`
- **Do not import from this folder** - all components have been properly integrated into the main app

## Implemented Components

The following components from this folder have been integrated into the main app:

- ✅ `SimpleHomeScreen` → `/components/SimpleHomeScreen.tsx`
- ✅ `SmartDashboard` → `/components/SmartDashboard.tsx`
- ✅ `SendMoneyOptions` → `/components/SendMoneyOptions.tsx`
- ✅ `VoiceCommandScreen` → `/components/VoiceCommandScreen.tsx`
- ✅ `InsightsScreen` → `/components/InsightsScreen.tsx`
- ✅ `HelpOverlay` → `/components/HelpOverlay.tsx`
- ✅ `LanguageSelector` → `/components/LanguageSelector.tsx`

All components have been:
- Adapted for the ADAPT project structure
- Made responsive for both mobile and desktop views
- Integrated with existing authentication and features
- Enhanced with proper TypeScript types
- Styled with the project's Tailwind configuration

## How to Use the New UI

Visit the home page and click the **"Fluid UI"** button in the top navigation to toggle between the classic and new interface.

## Development

If you need to reference the original design patterns, you can view these files, but remember to always work with the components in `/components` for actual development.
