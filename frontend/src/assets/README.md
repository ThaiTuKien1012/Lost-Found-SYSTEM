# Assets Directory

This directory contains static assets for the application.

## Structure

```
assets/
├── images/      # Image files (jpg, png, svg, etc.)
├── icons/       # Icon files
└── fonts/       # Font files
```

## Usage

Import assets in your components:

```javascript
// Images
import logo from '@/assets/images/logo.png';
import background from '@/assets/images/background.jpg';

// Icons
import icon from '@/assets/icons/icon.svg';

// Usage in JSX
<img src={logo} alt="Logo" />
```

## Notes

- Use descriptive filenames
- Optimize images before adding (compress, resize)
- Prefer SVG for icons when possible
- Use WebP format for better compression (if supported)

