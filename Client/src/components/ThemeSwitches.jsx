import React, { useEffect, useState } from 'react'

const themes = ["light", "dark", "synth", "retro", "forest", "lofi", "luxury", "night", "abyss", "business", "aqua"]

function ThemeSwitcher() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

    // Apply theme on change
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const changeTheme = (selectedTheme) => {
        setTheme(selectedTheme)
    }

    return (
        <div className="dropdown dropdown-hover mr-2">
            <div tabIndex={0} role="button" className="btn m-1">Theme</div>
            <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-10 w-30 p-2 shadow-sm"
            >
                {themes.map((themeOption) => (
                    <li key={themeOption}>
                        <a
                            className={`${themeOption === theme ? 'active' : ''}`}
                            onClick={() => changeTheme(themeOption)}
                        >
                            {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ThemeSwitcher
