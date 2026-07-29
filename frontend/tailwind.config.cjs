/**
 * Tailwind CSS Configuration
 *
 * This config enables dark mode using the `class` strategy, sets up the content
 * paths for purge, and defines a placeholder color palette that you can replace
 * with the Skyline Education brand colors.
 */
module.exports = {
  darkMode: 'class', // or 'media'
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 60%, 50%)',   // replace with brand primary
        secondary: 'hsl(190, 55%, 45%)', // replace with brand secondary
        accent: 'hsl(340, 70%, 55%)',    // replace with brand accent
      },
    },
  },
  plugins: [],
};
