import React, { useState, useEffect } from 'react';

const SettingsPage = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light'); // Set initial theme from localStorage

  const themes = [
    "light", "dark", "cupcake", "retro", "business", "coffee",  "dracula", 
    "emerald", "forest", "fantasy", "luxury", "night", "valentine",  
    "lofi", "garden", "winter", "aqua", "black", "luxury", "cmyk", "autumn", "winter", "pastel", "vintage", 
    "night", "acid", "solar", "midnight", "black","neon"
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme); // Apply the selected theme to the entire app
    localStorage.setItem('theme', theme); // Store theme in localStorage
  }, [theme]);

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-6 py-16">
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg space-y-6">
          <h1 className="text-4xl font-semibold text-center text-white">
            Choose Your Theme
          </h1>
          <p className="text-center text-gray-400">
            Select a theme from the options below and see it applied throughout the entire app.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-8">
            {themes.map((themeName) => (
              <div
                key={themeName}
                className="cursor-pointer p-4 rounded-lg shadow-md bg-gray-700 hover:bg-opacity-80 transition-all transform hover:scale-105"
                onClick={() => handleThemeChange(themeName)}
              >
                <div
                  className={`p-4 rounded-lg bg-${themeName} hover:bg-opacity-70 transition-all border-2 border-gray-600 min-h-[120px] flex items-center justify-center`}
                >
                  <h3 className="text-center text-white font-medium text-ellipsis overflow-hidden break-words">
                    {themeName}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
