import React, { useEffect, useState } from 'react';

const themes = [
  { name: "light", emoji: "🌞" },
  { name: "dark", emoji: "🌙" },
  { name: "cupcake", emoji: "🧁" },
  { name: "bumblebee", emoji: "🐝" },
  { name: "emerald", emoji: "💚" },
  { name: "corporate", emoji: "👔" },
  { name: "synthwave", emoji: "🌈" },
  { name: "retro", emoji: "📼" },
  { name: "cyberpunk", emoji: "🤖" },
  { name: "valentine", emoji: "💖" },
  { name: "halloween", emoji: "🎃" },
  { name: "garden", emoji: "🌸" },
  { name: "forest", emoji: "🌲" },
  { name: "aqua", emoji: "💧" },
  { name: "lofi", emoji: "🎧" },
  { name: "pastel", emoji: "🌈" },
  { name: "fantasy", emoji: "🧚" },
  { name: "wireframe", emoji: "🪶" },
  { name: "black", emoji: "⚫" },
  { name: "luxury", emoji: "💎" },
  { name: "dracula", emoji: "🧛" },
  { name: "cmyk", emoji: "🖨️" },
  { name: "autumn", emoji: "🍂" },
  { name: "business", emoji: "💼" },
  { name: "acid", emoji: "⚡" },
  { name: "lemonade", emoji: "🍋" },
  { name: "night", emoji: "🌃" },
  { name: "coffee", emoji: "☕" },
  { name: "winter", emoji: "❄️" },
  { name: "dim", emoji: "🌒" },
  { name: "nord", emoji: "🧊" },
  { name: "sunset", emoji: "🌅" },
  { name: "abyss", emoji: "🌊" },
];

function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const changeTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    document.documentElement.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('theme', selectedTheme);
  };

  const current = themes.find((t) => t.name === theme);

  return (
    <div className="dropdown dropdown-hover mr-2">
      <div tabIndex={0} role="button" className="btn m-1">
        {current ? `${current.emoji} ${current.name.charAt(0).toUpperCase() + current.name.slice(1)}` : 'Theme'}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content flex flex-col bg-base-100 rounded-box z-10 w-48 p-2 shadow max-h-60 overflow-y-auto"
      >
        {themes.map(({ name, emoji }) => (
          <li key={name}>
            <button
              onClick={() => changeTheme(name)}
              className={`text-left w-full px-2 py-1 rounded hover:bg-base-200 transition-colors duration-150 cursor-pointer ${
                name === theme ? 'bg-base-300 font-bold' : ''
              }`}
            >
              {emoji} {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ThemeSwitcher;
