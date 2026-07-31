export const COLOR_OPTIONS = [
    { key: "blue", label: "Blue", bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-300", border: "border-blue-500/20 dark:border-blue-500/30", swatch: "bg-blue-500" },
    { key: "emerald", label: "Emerald", bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-300", border: "border-emerald-500/20 dark:border-emerald-500/30", swatch: "bg-emerald-500" },
    { key: "purple", label: "Purple", bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-300", border: "border-purple-500/20 dark:border-purple-500/30", swatch: "bg-purple-500" },
    { key: "amber", label: "Amber", bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-300", border: "border-amber-500/20 dark:border-amber-500/30", swatch: "bg-amber-500" },
    { key: "rose", label: "Rose", bg: "bg-rose-500/10 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-300", border: "border-rose-500/20 dark:border-rose-500/30", swatch: "bg-rose-500" },
    { key: "cyan", label: "Cyan", bg: "bg-cyan-500/10 dark:bg-cyan-500/20", text: "text-cyan-600 dark:text-cyan-300", border: "border-cyan-500/20 dark:border-cyan-500/30", swatch: "bg-cyan-500" },
    { key: "indigo", label: "Indigo", bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-300", border: "border-indigo-500/20 dark:border-indigo-500/30", swatch: "bg-indigo-500" },
    { key: "fuchsia", label: "Fuchsia", bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20", text: "text-fuchsia-600 dark:text-fuchsia-300", border: "border-fuchsia-500/20 dark:border-fuchsia-500/30", swatch: "bg-fuchsia-500" },
    { key: "teal", label: "Teal", bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-600 dark:text-teal-300", border: "border-teal-500/20 dark:border-teal-500/30", swatch: "bg-teal-500" },
    { key: "orange", label: "Orange", bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-300", border: "border-orange-500/20 dark:border-orange-500/30", swatch: "bg-orange-500" }
];

export const getStringHashIndex = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % COLOR_OPTIONS.length;
};

export const getSourceTagStyle = (sourceObjOrName, sourcesList = []) => {
    let sourceName = "";
    let sourceId = "";
    let userColor = "";

    if (typeof sourceObjOrName === "object" && sourceObjOrName !== null) {
        sourceName = sourceObjOrName.name || "";
        sourceId = sourceObjOrName._id ? String(sourceObjOrName._id) : "";
        userColor = sourceObjOrName.color || "";
    } else {
        sourceName = String(sourceObjOrName || "");
        sourceId = String(sourceObjOrName || "");
    }

    // Always check live sourcesList from Redux first (handles updated colors from settings and populated objects lacking color field)
    if (sourcesList && sourcesList.length > 0) {
        const matched = sourcesList.find(s => 
            (sourceId && String(s._id) === sourceId) || 
            (sourceName && s.name?.toLowerCase() === sourceName.toLowerCase())
        );
        if (matched && matched.color) {
            userColor = matched.color;
        }
    }

    if (userColor) {
        const found = COLOR_OPTIONS.find(c => c.key === userColor);
        if (found) return found;
    }

    const lower = sourceName.toLowerCase();
    if (lower.includes("cash") || lower.includes("wallet")) return COLOR_OPTIONS[1]; // Emerald
    if (lower.includes("card") || lower.includes("credit")) return COLOR_OPTIONS[2]; // Purple
    if (lower.includes("bank") || lower.includes("hdfc") || lower.includes("sbi") || lower.includes("icici") || lower.includes("axis")) return COLOR_OPTIONS[0]; // Blue
    if (lower.includes("upi") || lower.includes("paytm") || lower.includes("phonepe") || lower.includes("gpay")) return COLOR_OPTIONS[8]; // Teal

    return COLOR_OPTIONS[getStringHashIndex(sourceName)];
};

export const getCategoryTagStyle = (catObjOrName, categoriesList = []) => {
    let catName = "";
    let catId = "";
    let userColor = "";

    if (typeof catObjOrName === "object" && catObjOrName !== null) {
        catName = catObjOrName.name || "";
        catId = catObjOrName._id ? String(catObjOrName._id) : "";
        userColor = catObjOrName.color || "";
    } else {
        catName = String(catObjOrName || "");
        catId = String(catObjOrName || "");
    }

    // Always check live categoriesList from Redux first (handles updated colors from settings and populated objects lacking color field)
    if (categoriesList && categoriesList.length > 0) {
        const matched = categoriesList.find(c => 
            (catId && String(c._id) === catId) || 
            (catName && c.name?.toLowerCase() === catName.toLowerCase())
        );
        if (matched && matched.color) {
            userColor = matched.color;
        }
    }

    if (userColor) {
        const found = COLOR_OPTIONS.find(c => c.key === userColor);
        if (found) return found;
    }

    const lower = catName.toLowerCase();
    if (lower.includes("house") || lower.includes("home") || lower.includes("rent")) return COLOR_OPTIONS[0]; // Blue
    if (lower.includes("food") || lower.includes("dine") || lower.includes("eat") || lower.includes("grocery")) return COLOR_OPTIONS[3]; // Amber
    if (lower.includes("travel") || lower.includes("transport") || lower.includes("fuel") || lower.includes("car")) return COLOR_OPTIONS[1]; // Emerald
    if (lower.includes("bill") || lower.includes("utility") || lower.includes("electricity") || lower.includes("recharge")) return COLOR_OPTIONS[9]; // Orange
    if (lower.includes("health") || lower.includes("medical") || lower.includes("doctor")) return COLOR_OPTIONS[4]; // Rose
    if (lower.includes("game") || lower.includes("fun") || lower.includes("entertain") || lower.includes("movie")) return COLOR_OPTIONS[2]; // Purple
    if (lower.includes("shop") || lower.includes("cloth") || lower.includes("personal")) return COLOR_OPTIONS[7]; // Fuchsia
    if (lower.includes("save") || lower.includes("invest") || lower.includes("fund")) return COLOR_OPTIONS[5]; // Cyan

    return COLOR_OPTIONS[getStringHashIndex(catName)];
};
