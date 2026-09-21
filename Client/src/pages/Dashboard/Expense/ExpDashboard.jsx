import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchRangeData } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import { TitleChanger } from "../../../utils/TitleChanger";
import { getCategoryTagStyle } from "../../../utils/expenseTheme";
import Chart from "react-apexcharts";
import {
  ResponsiveContainer,
  BarChart,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  LabelList,
  Cell
} from "recharts";
import {
  Banknote,
  Wallet,
  Folder,
  Sparkles,
  Layers,
  Calendar,
  TrendingUp,
  BarChart3,
  TableProperties,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  PieChart,
  Eye,
  EyeOff,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Filter,
  X,
  TrendingDown,
  Award
} from "lucide-react";

const monthNamesList = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" }
];

const CATEGORY_THEMES = [
  {
    color: "text-cyan-500",
    activeBorder: "border-cyan-500/50 dark:border-cyan-500/40",
    activeBg: "bg-cyan-500/[0.05] dark:bg-cyan-500/[0.08]",
    activeDot: "bg-cyan-500",
    badgeClass: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  {
    color: "text-amber-500",
    activeBorder: "border-amber-500/50 dark:border-amber-500/40",
    activeBg: "bg-amber-500/[0.05] dark:bg-amber-500/[0.08]",
    activeDot: "bg-amber-500",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    color: "text-violet-500",
    activeBorder: "border-violet-500/50 dark:border-violet-500/40",
    activeBg: "bg-violet-500/[0.05] dark:bg-violet-500/[0.08]",
    activeDot: "bg-violet-500",
    badgeClass: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    color: "text-sky-500",
    activeBorder: "border-sky-500/50 dark:border-sky-500/40",
    activeBg: "bg-sky-500/[0.05] dark:bg-sky-500/[0.08]",
    activeDot: "bg-sky-500",
    badgeClass: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    color: "text-fuchsia-500",
    activeBorder: "border-fuchsia-500/50 dark:border-fuchsia-500/40",
    activeBg: "bg-fuchsia-500/[0.05] dark:bg-fuchsia-500/[0.08]",
    activeDot: "bg-fuchsia-500",
    badgeClass: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    color: "text-emerald-500",
    activeBorder: "border-emerald-500/50 dark:border-emerald-500/40",
    activeBg: "bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08]",
    activeDot: "bg-emerald-500",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    color: "text-pink-500",
    activeBorder: "border-pink-500/50 dark:border-pink-500/40",
    activeBg: "bg-pink-500/[0.05] dark:bg-pink-500/[0.08]",
    activeDot: "bg-pink-500",
    badgeClass: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  },
  {
    color: "text-blue-500",
    activeBorder: "border-blue-500/50 dark:border-blue-500/40",
    activeBg: "bg-blue-500/[0.05] dark:bg-blue-500/[0.08]",
    activeDot: "bg-blue-500",
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    color: "text-orange-500",
    activeBorder: "border-orange-500/50 dark:border-orange-500/40",
    activeBg: "bg-orange-500/[0.05] dark:bg-orange-500/[0.08]",
    activeDot: "bg-orange-500",
    badgeClass: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  {
    color: "text-teal-500",
    activeBorder: "border-teal-500/50 dark:border-teal-500/40",
    activeBg: "bg-teal-500/[0.05] dark:bg-teal-500/[0.08]",
    activeDot: "bg-teal-500",
    badgeClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
];

// Color coding rule for percentage progress bars & badges:
// 0 to 25%: Blue
// 26 to 50%: Green (Emerald)
// 51 to 75%: Yellow
// 76 to 100%: Orange
// > 100%: Red
const getUsedPercentageStyle = (pct) => {
  if (pct > 100) {
    return {
      text: "text-red-500 font-extrabold",
      barBg: "bg-red-500",
      badgeBg: "bg-red-500 text-white border-red-500 font-extrabold"
    };
  }
  if (pct > 75) {
    return {
      text: "text-orange-500 font-extrabold",
      barBg: "bg-orange-500",
      badgeBg: "bg-orange-500 text-white border-orange-500 font-extrabold"
    };
  }
  if (pct > 50) {
    return {
      text: "text-yellow-500 font-extrabold",
      barBg: "bg-yellow-500",
      badgeBg: "bg-yellow-500 text-black border-yellow-500 font-extrabold"
    };
  }
  if (pct > 25) {
    return {
      text: "text-emerald-500 font-extrabold",
      barBg: "bg-emerald-500",
      badgeBg: "bg-emerald-500 text-white border-emerald-500 font-extrabold"
    };
  }
  return {
    text: "text-blue-500 font-extrabold",
    barBg: "bg-blue-500",
    badgeBg: "bg-blue-500 text-white border-blue-500 font-extrabold"
  };
};

const formatCurrency2Dec = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ExpDashboard = () => {
  const dispatch = useDispatch();
  const { categories = [], sources = [], transactions = [], salary, salariesByMonth, loading } = useSelector((state) => state.expense);
  const { user } = useAuth();

  // Default Selection: Current Year January to December
  const currentYearStr = dayjs().format("YYYY");

  const [fromYear, setFromYear] = useState(currentYearStr);
  const [fromMonth, setFromMonth] = useState("01"); // January

  const [toYear, setToYear] = useState(currentYearStr);
  const [toMonth, setToMonth] = useState("12"); // December

  // Ensure default is always current year Jan to Dec on mount
  useEffect(() => {
    const currentY = dayjs().format("YYYY");
    setFromYear(currentY);
    setFromMonth("01");
    setToYear(currentY);
    setToMonth("12");
  }, []);

  // Selected Category ID, "SALARY", or "CREDIT_CARDS"
  const [selectedCatId, setSelectedCatId] = useState("");

  const isSalaryMode = selectedCatId === "SALARY";
  const isCreditCardMode = selectedCatId === "CREDIT_CARDS";

  TitleChanger(
    isCreditCardMode
      ? "Progress Pulse | Credit Cards Expenses"
      : isSalaryMode
      ? "Progress Pulse | Salary Analysis"
      : "Progress Pulse | Detailed Category Analysis"
  );

  // Current month string – defined early so it can be used as initial state values
  const currentMonthStr = dayjs().format("YYYY-MM");

  // Selected Month filter for Option 2 visualization (currentMonthStr or "all")
  const [mobileSubCatSelectedMonth, setMobileSubCatSelectedMonth] = useState(currentMonthStr);
  const [mobileCardSelectedMonth, setMobileCardSelectedMonth] = useState(currentMonthStr);

  // Reset selected month filter to current month when category changes
  useEffect(() => {
    setMobileSubCatSelectedMonth(currentMonthStr);
    setMobileCardSelectedMonth(currentMonthStr);
  }, [selectedCatId]);

  // Credit Card Section View Tab for Desktop ("graph" | "table")
  const [cardViewTab, setCardViewTab] = useState("graph");
  const [expandedCardMonths, setExpandedCardMonths] = useState(new Set());

  const toggleExpandCardMonth = (rawMonth) => {
    setExpandedCardMonths((prev) => {
      const next = new Set(prev);
      if (next.has(rawMonth)) {
        next.delete(rawMonth);
      } else {
        next.add(rawMonth);
      }
      return next;
    });
  };

  const expandAllCardMonths = () => {
    setExpandedCardMonths(new Set(rangeMonths));
  };

  const collapseAllCardMonths = () => {
    setExpandedCardMonths(new Set());
  };

  // Category Section View Tab for Desktop ("graph" | "table")
  const [mainCategoryTab, setMainCategoryTab] = useState("graph");

  // Sub-Category View Tab for Desktop ("graph" | "table")
  const [subCategoryTab, setSubCategoryTab] = useState("graph");

  // Expanded Month Rows in Sub-Category Table View for Desktop
  const [expandedSubMonths, setExpandedSubMonths] = useState(new Set());

  const toggleExpandSubMonth = (rawMonth) => {
    setExpandedSubMonths((prev) => {
      const next = new Set(prev);
      if (next.has(rawMonth)) {
        next.delete(rawMonth);
      } else {
        next.add(rawMonth);
      }
      return next;
    });
  };

  const expandAllSubMonths = () => {
    setExpandedSubMonths(new Set(rangeMonths));
  };

  const collapseAllSubMonths = () => {
    setExpandedSubMonths(new Set());
  };

  // Mobile scrubber auto-scroll refs
  const mobileCatScrubberRef = useRef(null);
  const mobileCardScrubberRef = useRef(null);
  const monthPillRefs = useRef({});
  const cardMonthPillRefs = useRef({});

  useEffect(() => {
    const targetMonth = mobileSubCatSelectedMonth !== "all" ? mobileSubCatSelectedMonth : currentMonthStr;
    const targetEl = monthPillRefs.current[targetMonth];
    if (targetEl && mobileCatScrubberRef.current) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedCatId, mobileSubCatSelectedMonth]);

  useEffect(() => {
    const targetMonth = mobileCardSelectedMonth !== "all" ? mobileCardSelectedMonth : currentMonthStr;
    const targetEl = cardMonthPillRefs.current[targetMonth];
    if (targetEl && mobileCardScrubberRef.current) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedCatId, mobileCardSelectedMonth]);

  // Privacy Mode State (Synced with localStorage expense_hide_numbers)
  const [hideNumbers, setHideNumbers] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_hide_numbers");
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("expense_hide_numbers");
        setHideNumbers(saved ? JSON.parse(saved) : false);
      } catch (e) {}
    };
    window.addEventListener("expense_hide_numbers_updated", handleSync);
    return () => window.removeEventListener("expense_hide_numbers_updated", handleSync);
  }, []);

  const toggleHideNumbers = () => {
    const nextVal = !hideNumbers;
    setHideNumbers(nextVal);
    localStorage.setItem("expense_hide_numbers", JSON.stringify(nextVal));
    window.dispatchEvent(new Event("expense_hide_numbers_updated"));
  };

  // Hidden sub-categories state for interactive Tab 1 filtering
  const [hiddenSubCats, setHiddenSubCats] = useState([]);

  const toggleSubCatVisibility = (subName) => {
    setHiddenSubCats((prev) =>
      prev.includes(subName)
        ? prev.filter((name) => name !== subName)
        : [...prev, subName]
    );
  };

  const showAllSubCats = () => setHiddenSubCats([]);
  const hideAllSubCats = () => setHiddenSubCats([...subCategoryNames]);

  // Year options list (past 5 years to next 2 years)
  const yearOptions = useMemo(() => {
    const currentY = dayjs().year();
    const years = [];
    for (let y = currentY - 5; y <= currentY + 2; y++) {
      years.push(String(y));
    }
    return years;
  }, []);

  // Format strings YYYY-MM
  const fromMonthStr = `${fromYear}-${fromMonth}`;
  const toMonthStr = `${toYear}-${toMonth}`;

  // Fetch Range Data when date range changes
  useEffect(() => {
    if (fromMonthStr <= toMonthStr) {
      dispatch(fetchRangeData({ fromMonth: fromMonthStr, toMonth: toMonthStr }));
    }
  }, [fromMonthStr, toMonthStr, user, dispatch]);

  // Construct list of months in current selected range
  const rangeMonths = useMemo(() => {
    const list = [];
    if (fromMonthStr > toMonthStr) return list;
    let curr = dayjs(`${fromMonthStr}-01`);
    const end = dayjs(`${toMonthStr}-01`);
    while (curr.isBefore(end) || curr.isSame(end, "month")) {
      list.push(curr.format("YYYY-MM"));
      curr = curr.add(1, "month");
    }
    return list;
  }, [fromMonthStr, toMonthStr]);

  // Extract unique categories present by name
  const availableCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const map = new Map();
    categories.forEach((cat) => {
      if (cat.name && !map.has(cat.name)) {
        map.set(cat.name, { ...cat, _id: String(cat._id) });
      }
    });
    return Array.from(map.values());
  }, [categories]);

  // Set default selected category once categories load
  useEffect(() => {
    if (availableCategories.length > 0) {
      if (!selectedCatId || (!isSalaryMode && !isCreditCardMode && !availableCategories.some((c) => String(c._id) === String(selectedCatId)))) {
        setSelectedCatId(String(availableCategories[0]._id));
      }
    }
  }, [availableCategories, selectedCatId, isSalaryMode, isCreditCardMode]);

  // Selected Category object
  const selectedCategory = useMemo(() => {
    if (isSalaryMode) return { _id: "SALARY", name: "Salary" };
    if (isCreditCardMode) return { _id: "CREDIT_CARDS", name: "Credit Cards Expenses" };
    return availableCategories.find((c) => String(c._id) === String(selectedCatId)) || availableCategories[0];
  }, [availableCategories, selectedCatId, isSalaryMode, isCreditCardMode]);

  // Clean name for selected category
  const categoryCleanName = isSalaryMode ? "Salary" : isCreditCardMode ? "Credit Cards Expenses" : (selectedCategory ? selectedCategory.name : "Category");

  // Mobile & Sticky Category Carousel Tabs
  const mobileTabs = useMemo(() => {
    return [
      {
        id: "SALARY",
        label: "Salary / Income",
        icon: Banknote,
        color: "text-emerald-500",
        activeBorder: "border-emerald-500/50 dark:border-emerald-500/40",
        activeBg: "bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08]",
        activeDot: "bg-emerald-500",
        badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      },
      {
        id: "CREDIT_CARDS",
        label: "Credit Cards",
        icon: CreditCard,
        color: "text-rose-500",
        activeBorder: "border-rose-500/50 dark:border-rose-500/40",
        activeBg: "bg-rose-500/[0.05] dark:bg-rose-500/[0.08]",
        activeDot: "bg-rose-500",
        badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      },
      ...availableCategories.map((cat, idx) => {
        const theme = CATEGORY_THEMES[idx % CATEGORY_THEMES.length];
        return {
          id: String(cat._id),
          label: cat.name,
          icon: Folder,
          color: theme.color,
          activeBorder: theme.activeBorder,
          activeBg: theme.activeBg,
          activeDot: theme.activeDot,
          badgeClass: theme.badgeClass,
        };
      }),
    ];
  }, [availableCategories]);

  const activeMobileTabObj = useMemo(() => {
    return mobileTabs.find((t) => t.id === selectedCatId) || mobileTabs[0];
  }, [mobileTabs, selectedCatId]);

  const ActiveMobileIcon = activeMobileTabObj.icon;

  // Mobile Date Filter Modal State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [tempFromYear, setTempFromYear] = useState(fromYear);
  const [tempFromMonth, setTempFromMonth] = useState(fromMonth);
  const [tempToYear, setTempToYear] = useState(toYear);
  const [tempToMonth, setTempToMonth] = useState(toMonth);

  const openMobileFilter = () => {
    setTempFromYear(fromYear);
    setTempFromMonth(fromMonth);
    setTempToYear(toYear);
    setTempToMonth(toMonth);
    setIsMobileFilterOpen(true);
  };

  const applyMobileFilter = () => {
    setFromYear(tempFromYear);
    setFromMonth(tempFromMonth);
    setToYear(tempToYear);
    setToMonth(tempToMonth);
    setIsMobileFilterOpen(false);
  };

  const resetMobileFilter = () => {
    const curY = dayjs().format("YYYY");
    setTempFromYear(curY);
    setTempFromMonth("01");
    setTempToYear(curY);
    setTempToMonth("12");
  };

  const applyMobilePreset = (startY, startM, endY, endM) => {
    setTempFromYear(String(startY));
    setTempFromMonth(String(startM).padStart(2, "0"));
    setTempToYear(String(endY));
    setTempToMonth(String(endM).padStart(2, "0"));
  };

  const datePresets = useMemo(() => {
    const now = dayjs();
    const curY = now.format("YYYY");
    const curM = now.format("MM");

    const prevMonthDate = now.subtract(1, "month");
    const prevM_Y = prevMonthDate.format("YYYY");
    const prevM_M = prevMonthDate.format("MM");

    const last3Date = now.subtract(2, "month");
    const last3_Y = last3Date.format("YYYY");
    const last3_M = last3Date.format("MM");

    const last6Date = now.subtract(5, "month");
    const last6_Y = last6Date.format("YYYY");
    const last6_M = last6Date.format("MM");

    const prevYearStr = now.subtract(1, "year").format("YYYY");

    return [
      {
        label: "This Month",
        startY: curY,
        startM: curM,
        endY: curY,
        endM: curM,
      },
      {
        label: "Last Month",
        startY: prevM_Y,
        startM: prevM_M,
        endY: prevM_Y,
        endM: prevM_M,
      },
      {
        label: "Last 3 Months",
        startY: last3_Y,
        startM: last3_M,
        endY: curY,
        endM: curM,
      },
      {
        label: "Last 6 Months",
        startY: last6_Y,
        startM: last6_M,
        endY: curY,
        endM: curM,
      },
      {
        label: "Year to Date",
        startY: curY,
        startM: "01",
        endY: curY,
        endM: curM,
      },
      {
        label: "Full Year",
        startY: curY,
        startM: "01",
        endY: curY,
        endM: "12",
      },
      {
        label: "Previous Year",
        startY: prevYearStr,
        startM: "01",
        endY: prevYearStr,
        endM: "12",
      },
    ];
  }, []);

  // Helper to resolve salary entered in Table View for month m (strictly 0 if not entered)
  const getSalaryForMonth = (m) => {
    if (salariesByMonth && salariesByMonth[m] !== undefined) {
      return Number(salariesByMonth[m]) || 0;
    }
    return 0;
  };

  // Build Main Category / Salary Plot Data for each month in date range
  const monthlyPlotData = useMemo(() => {
    if (rangeMonths.length === 0 || isCreditCardMode) return [];
    if (!isSalaryMode && !selectedCategory) return [];

    if (isSalaryMode) {
      return rangeMonths.map((m) => {
        const monthLabel = dayjs(`${m}-01`).format("MMM YYYY");

        // Exact salary entered for month m from Table View (strictly 0 if not entered)
        const allotted = getSalaryForMonth(m);

        // Total spent across all categories in month m (exact match to Table View logic)
        const used = transactions
          .filter((t) => {
            if (t.type === "Credit" || t.type === "Transfer" || t.type !== "Debit") return false;
            const tMonth = dayjs(t.date).format("YYYY-MM");
            if (tMonth !== m) return false;
            return Boolean(t.categoryId?._id || t.categoryId);
          })
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const left = Math.max(0, allotted - used);
        const percentage = allotted > 0 ? Number(((used / allotted) * 100).toFixed(2)) : (used > 0 ? 100 : 0);

        return {
          monthLabel,
          rawMonth: m,
          allotted,
          left,
          used,
          percentage
        };
      });
    }

    // Normal Category mode
    const matchingCats = categories.filter((c) => c.name === selectedCategory.name);
    const matchingCatIds = new Set(matchingCats.map((c) => String(c._id)));

    return rangeMonths.map((m) => {
      const monthLabel = dayjs(`${m}-01`).format("MMM YYYY");

      let allotted = 0;
      matchingCats.forEach((c) => {
        const subCats = c.subCategories || [];
        allotted += subCats
          .filter((sub) => !sub.month || sub.month === m)
          .reduce((sum, sub) => sum + (Number(sub.budget) || 0), 0);
      });

      const used = transactions
        .filter((t) => {
          if (t.type === "Credit" || t.type === "Transfer") return false;
          const tMonth = dayjs(t.date).format("YYYY-MM");
          if (tMonth !== m) return false;
          const catId = String(t.categoryId?._id || t.categoryId);
          return matchingCatIds.has(catId);
        })
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const left = Math.max(0, allotted - used);
      const percentage = allotted > 0 ? Number(((used / allotted) * 100).toFixed(2)) : 0;

      return {
        monthLabel,
        rawMonth: m,
        allotted,
        left,
        used,
        percentage
      };
    });
  }, [isSalaryMode, selectedCategory, rangeMonths, categories, transactions, salary, salariesByMonth]);

  // Total range aggregates for selected category / salary
  const rangeTotals = useMemo(() => {
    const totalAllotted = monthlyPlotData.reduce((sum, d) => sum + d.allotted, 0);
    const totalUsed = monthlyPlotData.reduce((sum, d) => sum + d.used, 0);
    const totalLeft = monthlyPlotData.reduce((sum, d) => sum + d.left, 0);
    const overallPct = totalAllotted > 0 ? Number(((totalUsed / totalAllotted) * 100).toFixed(2)) : 0;
    return { totalAllotted, totalUsed, totalLeft, overallPct };
  }, [monthlyPlotData]);

  // Month-over-Month (MoM) delta for category / salary monthly trend and velocity scrubber
  const monthlyPlotDataWithMoM = useMemo(() => {
    return monthlyPlotData.map((d, index) => {
      let momDeltaPct = null;
      let momDeltaType = "neutral";
      if (index > 0) {
        const prevUsed = monthlyPlotData[index - 1].used || 0;
        const currUsed = d.used || 0;
        if (prevUsed > 0) {
          const delta = ((currUsed - prevUsed) / prevUsed) * 100;
          momDeltaPct = Number(delta.toFixed(1));
          if (momDeltaPct > 0) momDeltaType = "increase";
          else if (momDeltaPct < 0) momDeltaType = "decrease";
          else momDeltaType = "neutral";
        } else if (currUsed > 0) {
          momDeltaPct = 100;
          momDeltaType = "increase";
        } else {
          momDeltaPct = 0;
          momDeltaType = "neutral";
        }
      }
      return {
        ...d,
        momDeltaPct,
        momDeltaType,
      };
    });
  }, [monthlyPlotData]);

  // --- Credit Cards Data Structures & Calculations ---
  const creditCards = useMemo(() => {
    const map = new Map();
    (sources || []).filter((s) => s.type === "Card").forEach((s) => {
      map.set(String(s._id), {
        _id: String(s._id),
        name: s.name,
        balance: Number(s.balance) || 0,
        currentBalance: Number(s.currentBalance !== undefined ? s.currentBalance : s.balance) || 0,
        closingBalance: Number(s.closingBalance !== undefined ? s.closingBalance : s.balance) || 0,
        cardDue: Number(s.cardDue) || (Number(s.balance) < 0 ? Math.abs(Number(s.balance)) : 0),
        limit: Number(s.limit) || 0,
        color: s.color || ""
      });
    });

    (transactions || []).forEach((t) => {
      const src = t.sourceId;
      if (src && typeof src === "object" && src.type === "Card" && src._id && !map.has(String(src._id))) {
        map.set(String(src._id), {
          _id: String(src._id),
          name: src.name || "Credit Card",
          balance: Number(src.balance) || 0,
          currentBalance: Number(src.balance) || 0,
          closingBalance: Number(src.balance) || 0,
          cardDue: Number(src.balance) < 0 ? Math.abs(Number(src.balance)) : 0,
          limit: Number(src.limit) || 0,
          color: src.color || ""
        });
      }
      const trg = t.targetSourceId;
      if (trg && typeof trg === "object" && trg.type === "Card" && trg._id && !map.has(String(trg._id))) {
        map.set(String(trg._id), {
          _id: String(trg._id),
          name: trg.name || "Credit Card",
          balance: Number(trg.balance) || 0,
          currentBalance: Number(trg.balance) || 0,
          closingBalance: Number(trg.balance) || 0,
          cardDue: Number(trg.balance) < 0 ? Math.abs(Number(trg.balance)) : 0,
          limit: Number(trg.limit) || 0,
          color: trg.color || ""
        });
      }
    });

    return Array.from(map.values());
  }, [sources, transactions]);

  const cardColorPalette = useMemo(() => [
    "#818cf8", // Soft Indigo
    "#38bdf8", // Soft Sky Blue
    "#2dd4bf", // Soft Teal
    "#fbbf24", // Soft Amber
    "#f472b6", // Soft Rose/Pink
    "#a78bfa", // Soft Violet/Purple
    "#34d399", // Soft Emerald
    "#fb923c", // Soft Orange
    "#60a5fa", // Soft Cobalt
    "#f87171", // Soft Coral
  ], []);

  const cardColorMap = useMemo(() => {
    const map = {};
    creditCards.forEach((c, idx) => {
      map[c.name] = c.color && c.color.startsWith("#") ? c.color : cardColorPalette[idx % cardColorPalette.length];
    });
    return map;
  }, [creditCards, cardColorPalette]);

  // Month-by-month Credit Card Spends Data (Expenses Only)
  const creditCardMonthlyData = useMemo(() => {
    if (rangeMonths.length === 0) return [];

    const cardIdSet = new Set(creditCards.map((c) => String(c._id)));

    return rangeMonths.map((m) => {
      const monthLabel = dayjs(`${m}-01`).format("MMM YYYY");
      const row = {
        monthLabel,
        rawMonth: m,
        totalCardSpend: 0,
        cardSpends: {},
        transactions: []
      };

      const monthCardTxs = (transactions || []).filter((t) => {
        if (t.type !== "Debit") return false;
        const tMonth = dayjs(t.date).format("YYYY-MM");
        if (tMonth !== m) return false;

        const srcId = String(t.sourceId?._id || t.sourceId || "");
        return cardIdSet.has(srcId);
      });

      row.transactions = [...monthCardTxs].sort((a, b) => new Date(b.date) - new Date(a.date));

      creditCards.forEach((c) => {
        const cId = String(c._id);
        const cName = c.name;

        // Debits on this card
        const spend = monthCardTxs
          .filter((t) => String(t.sourceId?._id || t.sourceId) === cId)
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        row[cName] = spend;
        row.cardSpends[cName] = spend;
        row.totalCardSpend += spend;
      });

      return row;
    });
  }, [rangeMonths, creditCards, transactions]);

  // Overall Range Aggregates for Credit Cards (Spends Only)
  const creditCardRangeTotals = useMemo(() => {
    let totalSpend = 0;
    let highestMonth = { monthLabel: "-", amount: 0 };

    creditCardMonthlyData.forEach((d) => {
      totalSpend += d.totalCardSpend;
      if (d.totalCardSpend > highestMonth.amount) {
        highestMonth = { monthLabel: d.monthLabel, amount: d.totalCardSpend };
      }
    });

    const totalDue = creditCards.reduce((sum, c) => sum + (Number(c.cardDue) || 0), 0);
    const totalLimit = creditCards.reduce((sum, c) => sum + (Number(c.limit) || 0), 0);
    const overallUtilization = totalLimit > 0 ? Number(((totalDue / totalLimit) * 100).toFixed(2)) : 0;
    const avgMonthlySpend = rangeMonths.length > 0 ? totalSpend / rangeMonths.length : 0;
    const totalTxCount = creditCardMonthlyData.reduce((sum, d) => sum + d.transactions.length, 0);

    return {
      totalSpend,
      totalDue,
      totalLimit,
      overallUtilization,
      avgMonthlySpend,
      highestMonth,
      totalTxCount
    };
  }, [creditCardMonthlyData, creditCards, rangeMonths]);

  // Month-over-Month (MoM) delta for credit card monthly trend and velocity scrubber
  const creditCardMonthlyDataWithMoM = useMemo(() => {
    return creditCardMonthlyData.map((d, index) => {
      let momDeltaPct = null;
      let momDeltaType = "neutral";
      if (index > 0) {
        const prevUsed = creditCardMonthlyData[index - 1].totalCardSpend || 0;
        const currUsed = d.totalCardSpend || 0;
        if (prevUsed > 0) {
          const delta = ((currUsed - prevUsed) / prevUsed) * 100;
          momDeltaPct = Number(delta.toFixed(1));
          if (momDeltaPct > 0) momDeltaType = "increase";
          else if (momDeltaPct < 0) momDeltaType = "decrease";
          else momDeltaType = "neutral";
        } else if (currUsed > 0) {
          momDeltaPct = 100;
          momDeltaType = "increase";
        } else {
          momDeltaPct = 0;
          momDeltaType = "neutral";
        }
      }
      return {
        ...d,
        momDeltaPct,
        momDeltaType,
      };
    });
  }, [creditCardMonthlyData]);

  // Credit Card ApexChart Series (Stacked bars per card + Total Card Spend Line)
  const creditCardApexSeries = useMemo(() => {
    if (!creditCardMonthlyData.length || !creditCards.length) return [];

    const series = creditCards.map((c) => ({
      name: c.name,
      type: "bar",
      data: creditCardMonthlyData.map((m) => m[c.name] || 0),
    }));

    series.push({
      name: "Total Card Spend",
      type: "line",
      data: creditCardMonthlyData.map((m) => m.totalCardSpend || 0),
    });

    return series;
  }, [creditCardMonthlyData, creditCards]);

  // Credit Card ApexChart Options mirroring Sub-Category ApexChart
  const creditCardApexOptions = useMemo(() => {
    const numCards = creditCards.length;
    const colors = [
      ...creditCards.map((c, i) => cardColorMap[c.name] || cardColorPalette[i % cardColorPalette.length]),
      "#38bdf8", // Total Card Spend line color (Sky Blue)
    ];

    const totalSeriesCount = numCards + 1;

    return {
      chart: {
        type: "line",
        stacked: true,
        background: "transparent",
        toolbar: {
          show: false,
        },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 600,
        },
      },
      stroke: {
        width: [
          ...creditCards.map(() => 0),
          2.5, // Total Card Spend line width
        ],
        curve: "smooth",
        dashArray: [
          ...creditCards.map(() => 0),
          0,
        ],
      },
      fill: {
        opacity: [
          ...creditCards.map(() => 0.7),
          1,
        ],
      },
      colors: colors,
      plotOptions: {
        bar: {
          columnWidth: "65%",
          borderRadius: 3,
          dataLabels: { position: "top" },
          distributed: false,
        },
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [...Array(totalSeriesCount).keys()],
        formatter: (val) =>
          val > 0
            ? `₹${formatCurrency2Dec(val)}`
            : "",
        style: {
          fontSize: "10px",
          fontWeight: "700",
          colors: ["#ffffffdd"],
        },
        background: {
          enabled: false,
        },
        offsetY: -2,
      },
      markers: {
        size: [
          ...creditCards.map(() => 0),
          4.5, // Total Card Spend point size
        ],
        strokeColor: "#1e293b",
        strokeWidth: 2,
        hover: { size: 6.5 },
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#FFFFFF" },
        markers: {
          fillColors: colors,
        },
        itemMargin: { horizontal: 10, vertical: 5 },
        onItemClick: {
          toggleDataSeries: true,
        },
        onItemHover: {
          highlightDataSeries: true,
        },
      },
      xaxis: {
        categories: creditCardMonthlyData.map((m) => m.monthLabel),
        labels: {
          style: { colors: "#FFFFFF", fontSize: "11px", fontWeight: "600" },
          rotate: -45,
        },
        axisBorder: { color: "#888" },
        axisTicks: { color: "#888" },
        title: {
          text: "Months",
          style: { color: "#FFFFFF", fontSize: "11px" },
        },
      },
      yaxis: [
        {
          title: {
            text: "Amount (₹)",
            style: { color: "#FFFFFF", fontSize: "11px" },
          },
          labels: {
            style: { colors: "#FFFFFF", fontSize: "11px" },
            formatter: (v) => `₹${formatCurrency2Dec(v)}`,
          },
        },
      ],
      tooltip: {
        theme: "dark",
        shared: true,
        intersect: false,
        custom: function({ dataPointIndex }) {
          const monthLabel = creditCardMonthlyData[dataPointIndex]?.monthLabel || "";
          const dataItem = creditCardMonthlyData[dataPointIndex] || {};
          const totalCardSpend = dataItem.totalCardSpend || 0;

          const rowsHtml = creditCards.map((c, idx) => {
            const color = cardColorMap[c.name] || cardColorPalette[idx % cardColorPalette.length];
            const amount = dataItem[c.name] || 0;
            return `
              <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                <span class="text-base-content/70 flex items-center gap-1.5 truncate" style="display: flex; align-items: center; gap: 6px; font-size: 11px; opacity: 0.85;">
                  <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; display: inline-block; flex-shrink: 0;"></span>
                  <span class="truncate">${c.name}:</span>
                </span>
                <span class="font-mono font-bold" style="font-family: monospace; font-weight: 700; color: ${color}; font-size: 11px; white-space: nowrap;">₹${formatCurrency2Dec(amount)}</span>
              </div>
            `;
          }).join("");

          return `
            <div class="bg-base-100/90 backdrop-blur-md border border-base-300 p-4 rounded-2xl shadow-xl space-y-3 min-w-[240px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.15); padding: 14px 16px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5); min-width: 240px; font-size: 12px; font-family: inherit;">
              <p class="font-extrabold text-sm border-b border-base-200 pb-1.5 flex justify-between items-center" style="font-weight: 800; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span>${monthLabel}</span>
                <span class="text-[11px] opacity-60 font-mono" style="font-size: 10px; opacity: 0.6; font-family: monospace;">Credit Cards</span>
              </p>
              <div class="space-y-1.5 font-medium" style="display: flex; flex-direction: column; gap: 6px; font-weight: 500;">
                ${rowsHtml}
                <div class="flex justify-between items-center gap-4 pt-1.5 border-t border-base-200" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 8px; margin-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-weight: 800;">
                  <span class="text-base-content/80 flex items-center gap-1.5" style="display: flex; align-items: center; gap: 6px; color: #38bdf8; font-size: 11px;">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #38bdf8; display: inline-block; flex-shrink: 0;"></span>
                    Total Card Spend:
                  </span>
                  <span class="font-mono font-bold" style="font-family: monospace; color: #38bdf8; font-size: 12px; font-weight: 800;">₹${formatCurrency2Dec(totalCardSpend)}</span>
                </div>
              </div>
            </div>
          `;
        },
      },
      grid: {
        show: true,
        borderColor: "#444",
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 320 },
            legend: { position: "bottom" },
          },
        },
      ],
    };
  }, [creditCards, creditCardMonthlyData, cardColorMap, cardColorPalette]);

  // Helper to resolve the subcategory name of a transaction within matching categories
  const getTxSubcategoryName = (tx, matchingCats, hasConfiguredSubCats) => {
    if (tx.subCategoryId && typeof tx.subCategoryId === "object" && tx.subCategoryId.name) {
      return tx.subCategoryId.name;
    }
    const rawSubId = tx.subCategoryId && typeof tx.subCategoryId === "object" ? tx.subCategoryId._id : tx.subCategoryId;
    if (rawSubId) {
      const subIdStr = String(rawSubId);
      for (const cat of matchingCats) {
        for (const sub of cat.subCategories || []) {
          if (String(sub._id) === subIdStr && sub.name) {
            return sub.name;
          }
        }
      }
      if (typeof rawSubId === "string" && rawSubId.length > 0 && !rawSubId.match(/^[0-9a-fA-F]{24}$/)) {
        return rawSubId;
      }
    }
    if (tx.subCategory && typeof tx.subCategory === "string" && tx.subCategory.trim()) {
      return tx.subCategory.trim();
    }
    return hasConfiguredSubCats ? "General / Direct" : "Direct Spend";
  };

  // --- Sub-Category or Category Breakdown Names ---
  const subCategoryNames = useMemo(() => {
    if (isCreditCardMode) return [];
    if (isSalaryMode) {
      return availableCategories.map((c) => c.name);
    }
    if (!selectedCategory) return [];
    const matchingCats = categories.filter((c) => c.name === selectedCategory.name);
    const namesSet = new Set();
    matchingCats.forEach((c) => {
      (c.subCategories || []).forEach((sub) => {
        if (sub.name) namesSet.add(sub.name);
      });
    });

    const hasConfiguredSubCats = namesSet.size > 0;
    const matchingCatIds = new Set(matchingCats.map((c) => String(c._id)));

    // Also collect subcategory names from actual transactions in this category
    transactions.forEach((t) => {
      if (t.type === "Credit" || t.type === "Transfer") return;
      const catId = String(t.categoryId?._id || t.categoryId || "");
      if (matchingCatIds.has(catId)) {
        const subName = getTxSubcategoryName(t, matchingCats, hasConfiguredSubCats);
        namesSet.add(subName);
      }
    });

    if (namesSet.size === 0) {
      return ["Direct Spend"];
    }

    return Array.from(namesSet);
  }, [isSalaryMode, isCreditCardMode, availableCategories, selectedCategory, categories, transactions]);

  // Color Palettes for Dual Stacked Bars (Stack 1 = Allotted, Stack 2 = Actual Spent)
  const subCatAllottedPalette = useMemo(() => [
    "#3b82f6", "#10b981", "#8b5cf6", "#06b6d4", "#14b8a6", 
    "#6366f1", "#f59e0b", "#84cc16", "#0284c7", "#10b981"
  ], []);

  const subCatSpentPalette = useMemo(() => [
    "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", 
    "#06b6d4", "#f97316", "#84cc16", "#14b8a6", "#6366f1"
  ], []);

  // Sub-Category / Category Split Dual Stacked Plot Data per month
  const subCatDualStackedPlotData = useMemo(() => {
    if (rangeMonths.length === 0 || isCreditCardMode || subCategoryNames.length === 0) return [];
    if (!isSalaryMode && !selectedCategory) return [];

    if (isSalaryMode) {
      // Category Split Mode: Breakdown of all categories
      return rangeMonths.map((m) => {
        const monthLabel = dayjs(`${m}-01`).format("MMM YYYY");
        const row = { monthLabel, rawMonth: m, totalAllotted: 0, totalSpent: 0 };

        availableCategories.forEach((cat) => {
          const catName = cat.name;
          const matchingCats = categories.filter((c) => c.name === catName);
          const matchingCatIds = new Set(matchingCats.map((c) => String(c._id)));

          let catBudget = 0;
          matchingCats.forEach((c) => {
            (c.subCategories || []).forEach((sub) => {
              if (!sub.month || sub.month === m) {
                catBudget += Number(sub.budget) || 0;
              }
            });
          });
          row[`${catName}_allotted`] = catBudget;
          row.totalAllotted += catBudget;

          const catSpent = transactions
            .filter((t) => {
              if (t.type === "Credit" || t.type === "Transfer") return false;
              const tMonth = dayjs(t.date).format("YYYY-MM");
              if (tMonth !== m) return false;
              const catId = String(t.categoryId?._id || t.categoryId);
              return matchingCatIds.has(catId);
            })
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

          row[`${catName}_spent`] = catSpent;
          row.totalSpent += catSpent;
        });

        // Exact Total Salary for month m from Table View
        row.totalSalary = getSalaryForMonth(m, row.totalAllotted);

        return row;
      });
    }

    // Normal Category Mode: Sub-Category breakdown
    const matchingCats = categories.filter((c) => c.name === selectedCategory.name);
    const matchingCatIds = new Set(matchingCats.map((c) => String(c._id)));
    const hasConfiguredSubCats = matchingCats.some((c) => (c.subCategories || []).some((s) => s.name));

    return rangeMonths.map((m) => {
      const monthLabel = dayjs(`${m}-01`).format("MMM YYYY");
      const row = { monthLabel, rawMonth: m, totalAllotted: 0, totalSpent: 0 };

      subCategoryNames.forEach((subName) => {
        let subBudget = 0;
        matchingCats.forEach((c) => {
          (c.subCategories || []).forEach((sub) => {
            if (sub.name === subName && (!sub.month || sub.month === m)) {
              subBudget += Number(sub.budget) || 0;
            }
          });
        });
        row[`${subName}_allotted`] = subBudget;
        row.totalAllotted += subBudget;

        const subSpent = transactions
          .filter((t) => {
            if (t.type === "Credit" || t.type === "Transfer") return false;
            const tMonth = dayjs(t.date).format("YYYY-MM");
            if (tMonth !== m) return false;

            const catId = String(t.categoryId?._id || t.categoryId);
            if (!matchingCatIds.has(catId)) return false;

            const tSubName = getTxSubcategoryName(t, matchingCats, hasConfiguredSubCats);
            return tSubName === subName;
          })
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        row[`${subName}_spent`] = subSpent;
        row.totalSpent += subSpent;
      });

      return row;
    });
  }, [isSalaryMode, availableCategories, selectedCategory, rangeMonths, subCategoryNames, categories, transactions, salary, salariesByMonth]);

  // Sub-Category / Category Split ApexChart Series (Stacked bars per sub-category + Total Used Line + Total Salary Line in Salary Mode)
  const subCatApexSeries = useMemo(() => {
    if (!subCatDualStackedPlotData.length || !subCategoryNames.length) return [];

    const series = subCategoryNames.map((subName) => ({
      name: subName,
      type: "bar",
      data: subCatDualStackedPlotData.map((m) => m[`${subName}_spent`] || 0),
    }));

    series.push({
      name: "Total Used",
      type: "line",
      data: subCatDualStackedPlotData.map((m) => m.totalSpent || 0),
    });

    if (isSalaryMode) {
      series.push({
        name: "Total Salary",
        type: "line",
        data: subCatDualStackedPlotData.map((m) => m.totalSalary || 0),
      });
    }

    return series;
  }, [subCatDualStackedPlotData, subCategoryNames, isSalaryMode]);

  // Sub-Category / Category Split ApexChart Options mirroring Habit Dashboard Calorie chart
  const subCatApexOptions = useMemo(() => {
    const numSubs = subCategoryNames.length;
    const colors = [
      ...subCategoryNames.map((_, i) => subCatSpentPalette[i % subCatSpentPalette.length]),
      "#38bdf8", // Total Used line color (Sky Blue)
      ...(isSalaryMode ? ["#10b981"] : []), // Total Salary line color (Emerald Green)
    ];

    const totalSeriesCount = numSubs + (isSalaryMode ? 2 : 1);

    return {
      chart: {
        type: "line",
        stacked: true,
        background: "transparent",
        toolbar: {
          show: false,
        },
        zoom: { enabled: false },
      },
      stroke: {
        width: [
          ...subCategoryNames.map(() => 0), 
          2, // Total Used line width
          ...(isSalaryMode ? [2.5] : []) // Total Salary line width
        ],
        curve: "smooth",
        dashArray: [
          ...subCategoryNames.map(() => 0), 
          0,
          ...(isSalaryMode ? [0] : [])
        ],
      },
      fill: {
        opacity: [
          ...subCategoryNames.map(() => 0.65), 
          1,
          ...(isSalaryMode ? [1] : [])
        ],
      },
      colors: colors,
      plotOptions: {
        bar: {
          columnWidth: "72%",
          borderRadius: 3,
          dataLabels: { position: "top" },
          distributed: false,
        },
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [...Array(totalSeriesCount).keys()],
        formatter: (val) =>
          val > 0
            ? `₹${formatCurrency2Dec(val)}`
            : "",
        style: {
          fontSize: "10px",
          fontWeight: "700",
          colors: ["#ffffffdd"],
        },
        background: {
          enabled: false,
        },
        offsetY: -2,
      },
      markers: {
        size: [
          ...subCategoryNames.map(() => 0), 
          4, // Total Used point size
          ...(isSalaryMode ? [4.5] : []) // Total Salary point size
        ],
        strokeColor: "#1e293b",
        strokeWidth: 2,
        hover: { size: 6.5 },
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#FFFFFF" },
        markers: {
          fillColors: colors,
        },
        itemMargin: { horizontal: 10, vertical: 5 },
        onItemClick: {
          toggleDataSeries: true,
        },
        onItemHover: {
          highlightDataSeries: true,
        },
      },
      xaxis: {
        categories: subCatDualStackedPlotData.map((m) => m.monthLabel),
        labels: {
          style: { colors: "#FFFFFF", fontSize: "11px", fontWeight: "600" },
          rotate: -45,
        },
        axisBorder: { color: "#888" },
        axisTicks: { color: "#888" },
        title: {
          text: "Months",
          style: { color: "#FFFFFF", fontSize: "11px" },
        },
      },
      yaxis: [
        {
          title: {
            text: "Amount (₹)",
            style: { color: "#FFFFFF", fontSize: "11px" },
          },
          labels: {
            style: { colors: "#FFFFFF", fontSize: "11px" },
            formatter: (v) => `₹${formatCurrency2Dec(v)}`,
          },
        },
      ],
      tooltip: {
        theme: "dark",
        shared: true,
        intersect: false,
        custom: function({ dataPointIndex }) {
          const monthLabel = subCatDualStackedPlotData[dataPointIndex]?.monthLabel || "";
          const dataItem = subCatDualStackedPlotData[dataPointIndex] || {};
          const totalSpent = dataItem.totalSpent || 0;
          const totalSalary = dataItem.totalSalary || 0;
          const netSavings = totalSalary - totalSpent;

          const rowsHtml = subCategoryNames.map((name, idx) => {
            const color = subCatSpentPalette[idx % subCatSpentPalette.length];
            const amount = dataItem[`${name}_spent`] || 0;
            return `
              <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                <span class="text-base-content/70 flex items-center gap-1.5 truncate" style="display: flex; align-items: center; gap: 6px; font-size: 11px; opacity: 0.85;">
                  <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; display: inline-block; flex-shrink: 0;"></span>
                  <span class="truncate">${name}:</span>
                </span>
                <span class="font-mono font-bold" style="font-family: monospace; font-weight: 700; color: ${color}; font-size: 11px; white-space: nowrap;">₹${formatCurrency2Dec(amount)}</span>
              </div>
            `;
          }).join("");

          return `
            <div class="bg-base-100/90 backdrop-blur-md border border-base-300 p-4 rounded-2xl shadow-xl space-y-3 min-w-[240px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.15); padding: 14px 16px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5); min-width: 240px; font-size: 12px; font-family: inherit;">
              <p class="font-extrabold text-sm border-b border-base-200 pb-1.5 flex justify-between items-center" style="font-weight: 800; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span>${monthLabel}</span>
                <span class="text-[11px] opacity-60 font-mono" style="font-size: 10px; opacity: 0.6; font-family: monospace;">${isSalaryMode ? "Category Split" : categoryCleanName}</span>
              </p>
              <div class="space-y-1.5 font-medium" style="display: flex; flex-direction: column; gap: 6px; font-weight: 500;">
                ${rowsHtml}
                <div class="flex justify-between items-center gap-4 pt-1.5 border-t border-base-200" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-top: 8px; margin-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-weight: 800;">
                  <span class="text-base-content/80 flex items-center gap-1.5" style="display: flex; align-items: center; gap: 6px; color: #38bdf8; font-size: 11px;">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #38bdf8; display: inline-block; flex-shrink: 0;"></span>
                    Total Used:
                  </span>
                  <span class="font-mono font-bold" style="font-family: monospace; color: #38bdf8; font-size: 12px; font-weight: 800;">₹${formatCurrency2Dec(totalSpent)}</span>
                </div>
                ${isSalaryMode ? `
                <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; font-weight: 800;">
                  <span class="text-base-content/80 flex items-center gap-1.5" style="display: flex; align-items: center; gap: 6px; color: #10b981; font-size: 11px;">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #10b981; display: inline-block; flex-shrink: 0;"></span>
                    Total Salary:
                  </span>
                  <span class="font-mono font-bold" style="font-family: monospace; color: #10b981; font-size: 12px; font-weight: 800;">₹${formatCurrency2Dec(totalSalary)}</span>
                </div>
                <div class="flex justify-between items-center gap-4 pt-1 border-t border-dashed border-base-200/50" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; font-weight: 800; border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 4px;">
                  <span class="text-base-content/60 flex items-center gap-1.5" style="font-size: 10.5px; opacity: 0.75;">
                    Net Savings:
                  </span>
                  <span class="font-mono font-bold" style="font-family: monospace; font-size: 11px; color: ${netSavings >= 0 ? '#34d399' : '#f87171'};">
                    ${netSavings >= 0 ? '+' : '-'}₹${formatCurrency2Dec(Math.abs(netSavings))}
                  </span>
                </div>
                ` : ''}
              </div>
            </div>
          `;
        },
      },
      grid: {
        show: true,
        borderColor: "#444",
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 320 },
            legend: { position: "bottom" },
          },
        },
      ],
    };
  }, [subCategoryNames, subCatDualStackedPlotData, subCatSpentPalette, isSalaryMode, categoryCleanName]);

  // Aliases for Vite HMR backward compatibility
  const subCatAllotmentPlotData = subCatDualStackedPlotData;
  const subCatUsagePlotData = { list: [], avgUsage: 0 };
  const subCatMonthlyComparisonData = { list: [], totals: { allotted: 0, spent: 0, remaining: 0, pct: 0 } };

  // Detailed Sub-Category / Category Monthly Table Data with expandable sub-rows
  const subCatMonthlyTableData = useMemo(() => {
    if (rangeMonths.length === 0 || isCreditCardMode || subCategoryNames.length === 0) return [];
    if (!isSalaryMode && !selectedCategory) return [];

    if (isSalaryMode) {
      // Category Split Table in Salary Mode
      return rangeMonths.map((m) => {
        const monthLabel = dayjs(`${m}-01`).format("MMM YYYY");
        let monthTotalAllotted = 0;
        let monthTotalUsed = 0;

        const subRows = availableCategories.map((cat) => {
          const catName = cat.name;
          const matchingCats = categories.filter((c) => c.name === catName);
          const matchingCatIds = new Set(matchingCats.map((c) => String(c._id)));

          let catBudget = 0;
          matchingCats.forEach((c) => {
            (c.subCategories || []).forEach((sub) => {
              if (!sub.month || sub.month === m) {
                catBudget += Number(sub.budget) || 0;
              }
            });
          });

          const catSpent = transactions
            .filter((t) => {
              if (t.type === "Credit" || t.type === "Transfer") return false;
              const tMonth = dayjs(t.date).format("YYYY-MM");
              if (tMonth !== m) return false;
              const catId = String(t.categoryId?._id || t.categoryId);
              return matchingCatIds.has(catId);
            })
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

          const catRemaining = Math.max(0, catBudget - catSpent);
          const catPct = catBudget > 0 ? Number(((catSpent / catBudget) * 100).toFixed(2)) : (catSpent > 0 ? 100 : 0);

          monthTotalAllotted += catBudget;
          monthTotalUsed += catSpent;

          return {
            subName: catName,
            allotted: catBudget,
            used: catSpent,
            remaining: catRemaining,
            pct: catPct
          };
        });

        const salaryForMonth = getSalaryForMonth(m, monthTotalAllotted);

        const monthRemaining = Math.max(0, salaryForMonth - monthTotalUsed);
        const monthPct = salaryForMonth > 0 ? Number(((monthTotalUsed / salaryForMonth) * 100).toFixed(2)) : (monthTotalUsed > 0 ? 100 : 0);

        return {
          monthLabel,
          rawMonth: m,
          totalAllotted: salaryForMonth,
          totalUsed: monthTotalUsed,
          totalRemaining: monthRemaining,
          overallPct: monthPct,
          subRows
        };
      });
    }

    // Normal Category Mode
    const matchingCats = categories.filter((c) => c.name === selectedCategory.name);
    const matchingCatIds = new Set(matchingCats.map((c) => String(c._id)));
    const hasConfiguredSubCats = matchingCats.some((c) => (c.subCategories || []).some((s) => s.name));

    return rangeMonths.map((m) => {
      const monthLabel = dayjs(`${m}-01`).format("MMM YYYY");

      let monthTotalAllotted = 0;
      let monthTotalUsed = 0;

      const subRows = subCategoryNames.map((subName) => {
        let subAllotted = 0;
        matchingCats.forEach((c) => {
          (c.subCategories || []).forEach((sub) => {
            if (sub.name === subName && (!sub.month || sub.month === m)) {
              subAllotted += Number(sub.budget) || 0;
            }
          });
        });

        const subUsed = transactions
          .filter((t) => {
            if (t.type === "Credit" || t.type === "Transfer") return false;
            const tMonth = dayjs(t.date).format("YYYY-MM");
            if (tMonth !== m) return false;

            const catId = String(t.categoryId?._id || t.categoryId);
            if (!matchingCatIds.has(catId)) return false;

            const tSubName = getTxSubcategoryName(t, matchingCats, hasConfiguredSubCats);
            return tSubName === subName;
          })
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const subRemaining = Math.max(0, subAllotted - subUsed);
        const subPct = subAllotted > 0 ? Number(((subUsed / subAllotted) * 100).toFixed(2)) : (subUsed > 0 ? 100 : 0);

        monthTotalAllotted += subAllotted;
        monthTotalUsed += subUsed;

        return {
          subName,
          allotted: subAllotted,
          used: subUsed,
          remaining: subRemaining,
          pct: subPct
        };
      });

      const monthRemaining = Math.max(0, monthTotalAllotted - monthTotalUsed);
      const monthPct = monthTotalAllotted > 0 ? Number(((monthTotalUsed / monthTotalAllotted) * 100).toFixed(2)) : (monthTotalUsed > 0 ? 100 : 0);

      return {
        monthLabel,
        rawMonth: m,
        totalAllotted: monthTotalAllotted,
        totalUsed: monthTotalUsed,
        totalRemaining: monthRemaining,
        overallPct: monthPct,
        subRows
      };
    });
  }, [isSalaryMode, availableCategories, selectedCategory, rangeMonths, subCategoryNames, categories, transactions, salary, salariesByMonth]);

  // Range aggregate totals for Sub-Category Table View
  const subCatRangeTotals = useMemo(() => {
    let allotted = 0;
    let used = 0;
    subCatMonthlyTableData.forEach((row) => {
      allotted += row.totalAllotted;
      used += row.totalUsed;
    });
    const remaining = Math.max(0, allotted - used);
    const overallPct = allotted > 0 ? Number(((used / allotted) * 100).toFixed(2)) : (used > 0 ? 100 : 0);
    return { allotted, used, remaining, overallPct };
  }, [subCatMonthlyTableData]);

  // Mobile SubCategory / Category Split Horizontal Bars Data
  const mobileSubCategoryBars = useMemo(() => {
    if (subCategoryNames.length === 0) return [];

    let items = [];

    if (mobileSubCatSelectedMonth === "all") {
      // Entire Range Aggregate
      const totalRangeExpenses = subCatRangeTotals.used || 1;
      const maxUsed = Math.max(
        ...subCategoryNames.map((name) => {
          return subCatDualStackedPlotData.reduce((sum, m) => sum + (m[`${name}_spent`] || 0), 0);
        }),
        1
      );

      items = subCategoryNames.map((name, idx) => {
        const color = subCatSpentPalette[idx % subCatSpentPalette.length];
        const used = subCatDualStackedPlotData.reduce((sum, m) => sum + (m[`${name}_spent`] || 0), 0);
        const allotted = subCatDualStackedPlotData.reduce((sum, m) => sum + (m[`${name}_allotted`] || 0), 0);
        const remaining = allotted - used;
        const sharePct = Math.round((used / totalRangeExpenses) * 100);
        const utilizedPct = allotted > 0 ? Math.round((used / allotted) * 100) : (used > 0 ? 100 : 0);
        const barPct = Math.round((used / maxUsed) * 100);

        return {
          name,
          color,
          used,
          allotted,
          remaining,
          sharePct,
          utilizedPct,
          barPct
        };
      });
    } else {
      // Specific Month Selected
      const mRow = subCatMonthlyTableData.find((m) => m.rawMonth === mobileSubCatSelectedMonth);
      const totalMonthUsed = mRow ? mRow.totalUsed : 0;
      const maxUsed = mRow && mRow.subRows ? Math.max(...mRow.subRows.map((s) => s.used || 0), 1) : 1;

      if (mRow && mRow.subRows) {
        items = mRow.subRows.map((sub, idx) => {
          const color = subCatSpentPalette[idx % subCatSpentPalette.length];
          const used = sub.used || 0;
          const allotted = sub.allotted || 0;
          const remaining = sub.remaining;
          const sharePct = totalMonthUsed > 0 ? Math.round((used / totalMonthUsed) * 100) : 0;
          const utilizedPct = Math.round(sub.pct || 0);
          const barPct = Math.round((used / maxUsed) * 100);

          return {
            name: sub.subName,
            color,
            used,
            allotted,
            remaining,
            sharePct,
            utilizedPct,
            barPct
          };
        });
      }
    }

    // Only show sub-categories that have actual spend in the selected period
    return items.filter((item) => item.used > 0).sort((a, b) => b.used - a.used);
  }, [
    subCategoryNames,
    mobileSubCatSelectedMonth,
    subCatRangeTotals,
    subCatDualStackedPlotData,
    subCatMonthlyTableData,
    subCatSpentPalette
  ]);

  // --- Option 2: Interactive Donut & Spending Distribution Data (Category / Salary) ---
  const donutChartData = useMemo(() => {
    const activeItems = mobileSubCategoryBars.filter((b) => b.used > 0);
    const series = activeItems.map((b) => b.used);
    const labels = activeItems.map((b) => b.name);
    const colors = activeItems.map((b) => b.color);

    const calculatedSum = series.reduce((sum, v) => sum + v, 0);

    const periodTotalSpent = mobileSubCatSelectedMonth === "all"
      ? (rangeTotals.totalUsed || calculatedSum)
      : (monthlyPlotData.find((m) => m.rawMonth === mobileSubCatSelectedMonth)?.used ?? calculatedSum);

    const periodTotalBudget = mobileSubCatSelectedMonth === "all"
      ? rangeTotals.totalAllotted
      : (monthlyPlotData.find((m) => m.rawMonth === mobileSubCatSelectedMonth)?.allotted || 0);

    const periodTotalLeft = mobileSubCatSelectedMonth === "all"
      ? rangeTotals.totalLeft
      : (monthlyPlotData.find((m) => m.rawMonth === mobileSubCatSelectedMonth)?.left || 0);

    const periodLabel = mobileSubCatSelectedMonth === "all"
      ? "All Range"
      : (monthlyPlotData.find((m) => m.rawMonth === mobileSubCatSelectedMonth)?.monthLabel || "");

    return {
      series,
      labels,
      colors,
      periodTotalSpent,
      periodTotalBudget,
      periodTotalLeft,
      periodLabel,
      hasData: series.length > 0 && periodTotalSpent > 0,
    };
  }, [mobileSubCategoryBars, mobileSubCatSelectedMonth, rangeTotals, monthlyPlotData]);

  const donutApexOptions = useMemo(() => {
    const currentTotal = donutChartData.periodTotalSpent;

    return {
      chart: {
        type: "donut",
        background: "transparent",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
        },
        dropShadow: { enabled: false },
      },
      labels: donutChartData.labels,
      colors: donutChartData.colors,
      stroke: {
        show: true,
        width: 2,
        colors: ["#1e293b"],
      },
      fill: {
        type: "solid",
        opacity: 0.8,
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return Number(val) >= 4 ? `${Math.round(val)}%` : "";
        },
        style: {
          fontSize: "11px",
          fontFamily: "monospace",
          fontWeight: "800",
          colors: ["#ffffff"],
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 3,
          color: "#000000",
          opacity: 0.95,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "72%",
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "11px",
                fontWeight: "700",
                color: "#94a3b8",
                offsetY: -4,
                formatter: () => "Total Spent",
              },
              value: {
                show: true,
                fontSize: "18px",
                fontWeight: "900",
                fontFamily: "monospace",
                color: "#ffffff",
                offsetY: 4,
                formatter: () => (hideNumbers ? "••••••" : `₹${formatCurrency2Dec(currentTotal)}`),
              },
              total: {
                show: true,
                showAlways: true,
                label: "Total Spent",
                fontSize: "11px",
                fontWeight: "700",
                color: "#94a3b8",
                formatter: () => (hideNumbers ? "••••••" : `₹${formatCurrency2Dec(currentTotal)}`),
              },
            },
          },
        },
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#FFFFFF" },
        itemMargin: { horizontal: 8, vertical: 4 },
        fontSize: "11px",
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val) => (hideNumbers ? "••••••" : `₹${formatCurrency2Dec(val)}`),
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { height: 270 },
            legend: { position: "bottom", fontSize: "10px" },
            plotOptions: {
              pie: {
                donut: {
                  size: "68%",
                  labels: { value: { fontSize: "15px" } },
                },
              },
            },
          },
        },
      ],
    };
  }, [donutChartData, hideNumbers]);

  // --- Option 2: Credit Card Donut & Spending Distribution Data ---
  const creditCardDonutData = useMemo(() => {
    if (creditCards.length === 0 || creditCardMonthlyData.length === 0) {
      return { series: [], labels: [], colors: [], totalSpent: 0, rankedCards: [], periodLabel: "", hasData: false };
    }

    let totalSpent = 0;
    let periodLabel = "All Range";
    let cardsData = [];

    if (mobileCardSelectedMonth === "all") {
      totalSpent = creditCardRangeTotals.totalSpend;
      periodLabel = "All Range";
      cardsData = creditCards.map((c, idx) => {
        const spent = creditCardMonthlyData.reduce((sum, d) => sum + (d.cardSpends[c.name] || 0), 0);
        const sharePct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
        return {
          name: c.name,
          color: cardColorMap[c.name] || cardColorPalette[idx % cardColorPalette.length],
          spent,
          sharePct,
          limit: c.limit,
          due: c.cardDue,
        };
      });
    } else {
      const mRow = creditCardMonthlyData.find((m) => m.rawMonth === mobileCardSelectedMonth);
      totalSpent = mRow ? mRow.totalCardSpend : 0;
      periodLabel = mRow ? mRow.monthLabel : "";
      cardsData = creditCards.map((c, idx) => {
        const spent = mRow ? (mRow.cardSpends[c.name] || 0) : 0;
        const sharePct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
        return {
          name: c.name,
          color: cardColorMap[c.name] || cardColorPalette[idx % cardColorPalette.length],
          spent,
          sharePct,
          limit: c.limit,
          due: c.cardDue,
        };
      });
    }

    const maxSpent = Math.max(...cardsData.map((c) => c.spent), 1);
    const rankedCards = cardsData
      .map((c) => ({
        ...c,
        barPct: Math.round((c.spent / maxSpent) * 100),
      }))
      .sort((a, b) => b.spent - a.spent);

    const activeCards = rankedCards.filter((c) => c.spent > 0);
    const series = activeCards.map((c) => c.spent);
    const labels = activeCards.map((c) => c.name);
    const colors = activeCards.map((c) => c.color);

    return {
      series,
      labels,
      colors,
      totalSpent,
      periodLabel,
      rankedCards,
      hasData: series.length > 0 && totalSpent > 0,
    };
  }, [creditCards, creditCardMonthlyData, creditCardRangeTotals, mobileCardSelectedMonth, cardColorMap, cardColorPalette]);

  const creditCardDonutApexOptions = useMemo(() => {
    const currentTotal = creditCardDonutData.totalSpent;

    return {
      chart: {
        type: "donut",
        background: "transparent",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
        },
        dropShadow: { enabled: false },
      },
      labels: creditCardDonutData.labels,
      colors: creditCardDonutData.colors,
      stroke: {
        show: true,
        width: 2.5,
        colors: ["#0f172a"],
      },
      fill: {
        type: "solid",
        opacity: 0.8,
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return Number(val) >= 4 ? `${Math.round(val)}%` : "";
        },
        style: {
          fontSize: "12px",
          fontFamily: "monospace",
          fontWeight: "800",
          colors: ["#ffffff"],
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 3,
          color: "#000000",
          opacity: 0.95,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "72%",
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "11px",
                fontWeight: "700",
                color: "#94a3b8",
                offsetY: -4,
                formatter: () => "Card Spend",
              },
              value: {
                show: true,
                fontSize: "18px",
                fontWeight: "900",
                fontFamily: "monospace",
                color: "#ffffff",
                offsetY: 4,
                formatter: () => (hideNumbers ? "••••••" : `₹${formatCurrency2Dec(currentTotal)}`),
              },
              total: {
                show: true,
                showAlways: true,
                label: "Total Card Spend",
                fontSize: "11px",
                fontWeight: "700",
                color: "#94a3b8",
                formatter: () => (hideNumbers ? "••••••" : `₹${formatCurrency2Dec(currentTotal)}`),
              },
            },
          },
        },
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#FFFFFF" },
        itemMargin: { horizontal: 8, vertical: 4 },
        fontSize: "11px",
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val) => (hideNumbers ? "••••••" : `₹${formatCurrency2Dec(val)}`),
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { height: 270 },
            legend: { position: "bottom", fontSize: "10px" },
            plotOptions: {
              pie: {
                donut: {
                  size: "68%",
                  labels: { value: { fontSize: "15px" } },
                },
              },
            },
          },
        },
      ],
    };
  }, [creditCardDonutData, hideNumbers]);

  // --- Tooltips ---
  const MainCategoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-base-100/95 backdrop-blur-md border border-base-300 p-4 rounded-2xl shadow-xl space-y-3 min-w-[220px] text-xs">
          <p className="font-extrabold text-sm border-b border-base-200 pb-1.5 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-[11px] opacity-60 font-mono">{categoryCleanName}</span>
          </p>
          <div className="space-y-1.5 font-medium">
            <div className="flex justify-between items-center gap-4">
              <span className="text-base-content/70">Allotted Budget:</span>
              <span className="font-mono font-bold text-primary">₹{formatCurrency2Dec(dataItem.allotted)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-base-content/70 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Left:
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ₹{formatCurrency2Dec(dataItem.left)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-base-content/70 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "rgba(16, 185, 129, 0.35)" }}></span> Used:
              </span>
              <span className="font-mono font-bold text-emerald-600/50 dark:text-emerald-400/50">
                ₹{formatCurrency2Dec(dataItem.used)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-base-200">
              <span className="text-base-content/70">% Utilized:</span>
              <span className={`font-mono font-extrabold ${dataItem.percentage > 100 ? 'text-error' : 'text-info'}`}>
                {Number(dataItem.percentage || 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const SubCatSpentOnlyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;

      const visibleItems = subCategoryNames
        .filter((name) => !hiddenSubCats.includes(name))
        .map((name) => {
          const originalIdx = subCategoryNames.indexOf(name);
          return {
            name,
            amount: dataItem[`${name}_spent`] || 0,
            color: subCatSpentPalette[originalIdx % subCatSpentPalette.length]
          };
        });

      const totalSpentVisible = visibleItems.reduce((sum, item) => sum + item.amount, 0);

      return (
        <div className="bg-base-100/95 backdrop-blur-md border border-base-300 p-4 rounded-2xl shadow-xl space-y-2.5 min-w-[240px] text-xs">
          <p className="font-extrabold text-sm border-b border-base-200 pb-1.5 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-[11px] font-mono text-rose-500 font-bold">Spent Breakdown</span>
          </p>

          <div className="space-y-1.5 font-medium">
            {visibleItems.map((item) => (
              <div key={item.name} className="flex justify-between items-center gap-4">
                <span className="flex items-center gap-1.5 truncate text-base-content/80">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate">{item.name}:</span>
                </span>
                <span className="font-mono font-bold text-rose-500">₹{formatCurrency2Dec(item.amount)}</span>
              </div>
            ))}

            <div className="flex justify-between items-center gap-4 pt-2 border-t border-base-200 font-extrabold text-sm">
              <span>Total Spent:</span>
              <span className="font-mono text-rose-500">₹{formatCurrency2Dec(totalSpentVisible)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const SubCatDualStackedTooltip = SubCatSpentOnlyTooltip;
  const SubCatAllotmentTooltip = SubCatSpentOnlyTooltip;

  const SubCatComparisonTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-base-100/95 backdrop-blur-md border border-base-300 p-4 rounded-2xl shadow-xl space-y-2.5 min-w-[220px] text-xs">
          <p className="font-extrabold text-sm border-b border-base-200 pb-1.5 flex justify-between items-center">
            <span>{label}</span>
            <span className={`badge badge-xs font-bold ${dataItem.percentage > 100 ? 'badge-error' : 'badge-info'}`}>
              {Number(dataItem.percentage || 0).toFixed(2)}% Spent
            </span>
          </p>
          <div className="space-y-1.5 font-medium">
            <div className="flex justify-between items-center gap-4">
              <span className="text-primary font-bold">Expected Allotted:</span>
              <span className="font-mono font-bold text-primary">₹{formatCurrency2Dec(dataItem.totalAllotted)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-rose-500 font-bold">Actual Spent:</span>
              <span className="font-mono font-bold text-rose-500">₹{formatCurrency2Dec(dataItem.totalSpent)}</span>
            </div>
            <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-base-200">
              <span className={dataItem.overspent > 0 ? "text-error font-bold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
                {dataItem.overspent > 0 ? "Overspent:" : "Remaining:"}
              </span>
              <span className={`font-mono font-bold ${dataItem.overspent > 0 ? "text-error" : "text-emerald-600 dark:text-emerald-400"}`}>
                ₹{formatCurrency2Dec(dataItem.overspent > 0 ? dataItem.overspent : dataItem.remaining)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const isInvalidRange = fromMonthStr > toMonthStr;

  return (
    <div className="w-full pb-20">
      {/* Desktop Sticky Header (md and up) */}
      <div className="hidden md:block sticky top-0 z-40 bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/40 px-4 py-2">
        <div className="flex items-center justify-between p-3 flex-wrap gap-3 max-w-[1600px] mx-auto px-4 md:px-6">
          {/* Left: Category Dropdown & Title */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="dropdown dropdown-bottom">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost text-lg font-bold p-0 min-h-0 h-auto hover:bg-base-200/70 px-2.5 py-1 rounded-xl flex items-center gap-2 transition-all border border-base-300/40 shadow-xs cursor-pointer"
              >
                {isSalaryMode ? (
                  <Banknote className="text-primary w-5 h-5" />
                ) : isCreditCardMode ? (
                  <CreditCard className="text-primary w-5 h-5" />
                ) : (
                  <Folder className="text-primary w-5 h-5" />
                )}
                <span>{categoryCleanName}</span>
                <ChevronDown className="w-4 h-4 opacity-60 ml-0.5" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-64 z-[100] mt-2 border border-base-300/50 max-h-96 overflow-y-auto"
              >
                <li className="menu-title text-xs font-bold text-base-content/50 uppercase tracking-wider px-3 py-1">
                  Salary & Overview
                </li>
                <li>
                  <button
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all font-medium ${
                      isSalaryMode
                        ? "bg-primary text-primary-content font-bold shadow-md"
                        : "hover:bg-base-200"
                    }`}
                    onClick={() => {
                      setSelectedCatId("SALARY");
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    }}
                  >
                    <Banknote className={`w-4 h-4 ${isSalaryMode ? "text-primary-content" : "text-primary"}`} />
                    <span>Salary / Total Income</span>
                  </button>
                </li>

                <li className="menu-title text-xs font-bold text-base-content/50 uppercase tracking-wider px-3 py-1 mt-1.5">
                  Cards & Sources
                </li>
                <li>
                  <button
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all font-medium ${
                      isCreditCardMode
                        ? "bg-primary text-primary-content font-bold shadow-md"
                        : "hover:bg-base-200"
                    }`}
                    onClick={() => {
                      setSelectedCatId("CREDIT_CARDS");
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                    }}
                  >
                    <CreditCard className={`w-4 h-4 ${isCreditCardMode ? "text-primary-content" : "text-primary"}`} />
                    <span>Credit Cards Expenses</span>
                  </button>
                </li>

                <li className="menu-title text-xs font-bold text-base-content/50 uppercase tracking-wider px-3 py-1 mt-1.5">
                  Categories
                </li>
                {availableCategories.map((cat) => {
                  const isActive = !isSalaryMode && !isCreditCardMode && String(cat._id) === String(selectedCatId);
                  return (
                    <li key={cat._id}>
                      <button
                        className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all font-medium ${
                          isActive
                            ? "bg-primary text-primary-content font-bold shadow-md"
                            : "hover:bg-base-200"
                        }`}
                        onClick={() => {
                          setSelectedCatId(String(cat._id));
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }}
                      >
                        <Folder className={`w-4 h-4 ${isActive ? "text-primary-content" : "text-primary"}`} />
                        <span>{cat.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <span className="text-lg font-bold text-base-content/80">Detailed Analysis Dashboard</span>
          </div>

          {/* Right: From & To Date Selection */}
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <button
              type="button"
              onClick={toggleHideNumbers}
              className="btn btn-xs btn-ghost btn-square rounded-xl text-base-content/60 hover:text-primary cursor-pointer"
              title={hideNumbers ? "Show numbers" : "Hide numbers (Privacy Mode)"}
            >
              {hideNumbers ? <EyeOff size={16} className="text-primary font-bold" /> : <Eye size={16} />}
            </button>

            {/* FROM */}
            <div className="flex items-center gap-1.5 bg-base-200/70 p-1.5 rounded-xl border border-base-300/50 text-xs font-medium">
              <span className="text-[11px] font-bold uppercase opacity-60 px-1">From:</span>
              <select
                className="select select-bordered select-xs font-bold font-mono bg-base-100 min-w-[80px] px-2 text-xs"
                value={fromYear}
                onChange={(e) => setFromYear(e.target.value)}
              >
                {yearOptions.map((y) => (
                  <option key={`from-y-${y}`} value={y}>{y}</option>
                ))}
              </select>
              <select
                className="select select-bordered select-xs font-bold bg-base-100 min-w-[72px] px-2 text-xs"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
              >
                {monthNamesList.map((m) => (
                  <option key={`from-m-${m.value}`} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold opacity-40">→</span>

            {/* TO */}
            <div className="flex items-center gap-1.5 bg-base-200/70 p-1.5 rounded-xl border border-base-300/50 text-xs font-medium">
              <span className="text-[11px] font-bold uppercase opacity-60 px-1">To:</span>
              <select
                className="select select-bordered select-xs font-bold font-mono bg-base-100 min-w-[80px] px-2 text-xs"
                value={toYear}
                onChange={(e) => setToYear(e.target.value)}
              >
                {yearOptions.map((y) => (
                  <option key={`to-y-${y}`} value={y}>{y}</option>
                ))}
              </select>
              <select
                className="select select-bordered select-xs font-bold bg-base-100 min-w-[72px] px-2 text-xs"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
              >
                {monthNamesList.map((m) => (
                  <option key={`to-m-${m.value}`} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Header - Mobile Phone View (Hidden on Desktop) */}
      <div className="block md:hidden sticky top-0 z-40 bg-base-100/95 dark:bg-base-900/95 backdrop-blur-md border-b border-base-300 px-3 py-2 shadow-xs space-y-2">
        {/* Row 1: Active Category Badge + Privacy Eye Toggle + Compact Date Filter Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-base-200 border border-base-300/60 shadow-xs min-w-0">
            <ActiveMobileIcon className={`${activeMobileTabObj.color} w-4 h-4 shrink-0`} />
            <span className="font-bold text-xs tracking-tight text-base-content truncate">
              {activeMobileTabObj.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleHideNumbers}
              className="btn btn-xs btn-ghost btn-square rounded-xl text-base-content/60 hover:text-primary cursor-pointer h-7 w-7"
              title={hideNumbers ? "Show numbers" : "Hide numbers (Privacy Mode)"}
            >
              {hideNumbers ? <EyeOff size={15} className="text-primary font-bold" /> : <Eye size={15} />}
            </button>

            <button
              type="button"
              onClick={openMobileFilter}
              className="btn btn-xs h-7 px-2.5 rounded-xl font-medium bg-base-200 hover:bg-base-300 border border-base-300/80 shadow-xs flex items-center gap-1.5 text-xs text-base-content cursor-pointer"
              title="Filter by Date"
            >
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[130px] font-semibold text-[11px]">
                {dayjs(`${fromYear}-${fromMonth}-01`).format("MMM 'YY")} - {dayjs(`${toYear}-${toMonth}-01`).format("MMM 'YY")}
              </span>
              <Filter className="w-3 h-3 opacity-60 shrink-0" />
            </button>
          </div>
        </div>

        {/* Row 2: Horizontal Scrollable Category Boxes with Watermark Background Icon */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCatId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCatId(tab.id)}
                className={`group relative shrink-0 min-w-[100px] max-w-[130px] h-14 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between p-2.5 text-left select-none overflow-hidden ${
                  isActive
                    ? `border ${tab.activeBorder} ${tab.activeBg} shadow-2xs scale-[1.01]`
                    : "border border-base-content/8 hover:border-base-content/15 bg-base-100/50 dark:bg-base-200/25 hover:bg-base-200/50 shadow-2xs"
                }`}
              >
                {/* Enlarged Watermark Background Icon */}
                <div className="absolute -right-2 -bottom-2.5 pointer-events-none select-none transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                  <Icon
                    size={52}
                    strokeWidth={1.5}
                    className={`transition-all duration-200 ${
                      isActive
                        ? `${tab.color} opacity-20 dark:opacity-25`
                        : "text-base-content opacity-10 dark:opacity-12 group-hover:opacity-16"
                    }`}
                  />
                </div>

                {/* Top: Status indicator & Category Badge */}
                <div className="flex items-center justify-between z-10">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isActive
                        ? `${tab.activeDot} ring-2 ring-current/20 scale-110`
                        : "bg-base-content/30"
                    }`}
                  />
                  {isActive && (
                    <span className={`badge badge-2xs text-[9px] font-black tracking-tight px-1 py-0.5 rounded-md border-0 ${tab.badgeClass}`}>
                      Active
                    </span>
                  )}
                </div>

                {/* Bottom: Label */}
                <div className="z-10 leading-none">
                  <span
                    className={`text-xs font-black tracking-tight block truncate transition-colors ${
                      isActive ? tab.color : "text-base-content/85 group-hover:text-base-content"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Date Filter Bottom Sheet (Phone View Only - Desktop View Untouched) */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setIsMobileFilterOpen(false); }}
        >
          <div
            className="bg-base-100 rounded-t-3xl shadow-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border-t border-x border-base-300 mobile-drawer-slide-up"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
          >

            {/* Drag Handle & Sheet Header — same pattern as CategoryCard */}
            <div className="border-b border-base-200 bg-base-200/60 select-none touch-none">
              {/* Grab Pill */}
              <div className="pt-3 pb-1.5 px-4 flex justify-center items-center">
                <div className="h-1.5 w-12 rounded-full bg-base-content/30" />
              </div>

              {/* Header row */}
              <div className="px-3.5 pb-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-base-100 border border-base-300 text-primary shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-base-content truncate">Filter Date Range</h3>
                    <span className="text-[10px] opacity-60 font-medium block truncate">Quick presets or choose custom months</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="btn btn-xs btn-ghost btn-circle rounded-full shrink-0 text-base-content/60 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {/* Quick Presets Section */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider block">
                  Quick Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {datePresets.map((p) => {
                    const isPresetActive =
                      tempFromYear === p.startY &&
                      tempFromMonth === p.startM &&
                      tempToYear === p.endY &&
                      tempToMonth === p.endM;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => applyMobilePreset(p.startY, p.startM, p.endY, p.endM)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isPresetActive
                            ? "bg-primary text-primary-content border-primary shadow-xs font-bold"
                            : "bg-base-200/80 hover:bg-base-200 text-base-content/80 border-base-300/80"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Month Range Section */}
              <div className="space-y-2.5 pt-2 border-t border-base-300/60">
                <span className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider block">
                  Custom Month Range
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* From Selector Card */}
                  <div className="bg-base-200/50 p-2.5 rounded-2xl border border-base-300/70 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 block">From Month</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        className="select select-sm w-full bg-base-100 border border-base-300 rounded-xl text-xs font-semibold text-base-content focus:border-primary focus:outline-none cursor-pointer px-2"
                        value={tempFromMonth}
                        onChange={(e) => setTempFromMonth(e.target.value)}
                      >
                        {monthNamesList.map((m) => (
                          <option key={`temp-fm-${m.value}`} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <select
                        className="select select-sm w-full bg-base-100 border border-base-300 rounded-xl text-xs font-semibold text-base-content focus:border-primary focus:outline-none cursor-pointer px-2"
                        value={tempFromYear}
                        onChange={(e) => setTempFromYear(e.target.value)}
                      >
                        {yearOptions.map((y) => (
                          <option key={`temp-fy-${y}`} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* To Selector Card */}
                  <div className="bg-base-200/50 p-2.5 rounded-2xl border border-base-300/70 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 block">To Month</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        className="select select-sm w-full bg-base-100 border border-base-300 rounded-xl text-xs font-semibold text-base-content focus:border-primary focus:outline-none cursor-pointer px-2"
                        value={tempToMonth}
                        onChange={(e) => setTempToMonth(e.target.value)}
                      >
                        {monthNamesList.map((m) => (
                          <option key={`temp-tm-${m.value}`} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <select
                        className="select select-sm w-full bg-base-100 border border-base-300 rounded-xl text-xs font-semibold text-base-content focus:border-primary focus:outline-none cursor-pointer px-2"
                        value={tempToYear}
                        onChange={(e) => setTempToYear(e.target.value)}
                      >
                        {yearOptions.map((y) => (
                          <option key={`temp-ty-${y}`} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Validation / Summary message */}
                <div className="pt-1">
                  {`${tempFromYear}-${tempFromMonth}` > `${tempToYear}-${tempToMonth}` ? (
                    <div className="flex items-center gap-1.5 text-error text-[11px] font-semibold bg-error/10 px-2.5 py-1.5 rounded-xl border border-error/20">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>Invalid: "From" date cannot be after "To" date</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-base-content/70 text-[11px] font-medium bg-base-200/60 px-2.5 py-1.5 rounded-xl border border-base-300/50">
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                      <span>
                        Range: <strong className="text-base-content">{dayjs(`${tempFromYear}-${tempFromMonth}-01`).format("MMM YYYY")}</strong> – <strong className="text-base-content">{dayjs(`${tempToYear}-${tempToMonth}-01`).format("MMM YYYY")}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-base-300">
                <button
                  type="button"
                  onClick={resetMobileFilter}
                  className="btn btn-sm btn-ghost border border-base-300 rounded-xl px-4 cursor-pointer text-xs"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled={`${tempFromYear}-${tempFromMonth}` > `${tempToYear}-${tempToMonth}`}
                  onClick={applyMobileFilter}
                  className="btn btn-sm btn-primary rounded-xl px-6 font-bold shadow-sm cursor-pointer text-xs disabled:opacity-50"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="px-0 sm:px-4 md:px-6 w-full max-w-[1600px] mx-auto space-y-3.5 sm:space-y-4 md:space-y-6 mt-4">

      
      {isInvalidRange && (
        <div className="alert alert-error shadow-sm text-xs font-bold rounded-2xl mx-2 sm:mx-0">
          <span>Invalid Date Range: "From" date ({fromMonthStr}) cannot be after "To" date ({toMonthStr}). Please adjust your selection.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (md and up: 100% original, untouched, revert back to normal) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">
{isCreditCardMode ? (
        <div className="space-y-6">
          {/* 1. Range Summary Cards for Credit Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="card bg-base-100 shadow-md border border-base-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                  Total Card Expenses
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <CreditCard size={18} />
                </div>
              </div>
              <span className="text-2xl font-black font-mono text-rose-500 mt-2 block">
                ₹{formatCurrency2Dec(creditCardRangeTotals.totalSpend)}
              </span>
              <span className="text-[11px] opacity-60 mt-1.5 block">
                Across {rangeMonths.length} Months • {creditCardRangeTotals.totalTxCount} Transactions
              </span>
            </div>

            <div className="card bg-base-100 shadow-md border border-base-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                  Outstanding Dues
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <AlertTriangle size={18} />
                </div>
              </div>
              <span className="text-2xl font-black font-mono text-amber-500 mt-2 block">
                ₹{formatCurrency2Dec(creditCardRangeTotals.totalDue)}
              </span>
              <span className="text-[11px] opacity-60 mt-1.5 block">
                Across {creditCards.length} Cards • {creditCardRangeTotals.overallUtilization}% Limit Utilized
              </span>
            </div>

            <div className="card bg-base-100 shadow-md border border-base-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                  Avg Monthly Spend
                </span>
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp size={18} />
                </div>
              </div>
              <span className="text-2xl font-black font-mono text-primary mt-2 block">
                ₹{formatCurrency2Dec(creditCardRangeTotals.avgMonthlySpend)}
              </span>
              <span className="text-[11px] opacity-60 mt-1.5 block">
                Monthly Average Across {rangeMonths.length} Months
              </span>
            </div>

            <div className="card bg-base-100 shadow-md border border-base-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                  Highest Spend Month
                </span>
                <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <ArrowUpRight size={18} />
                </div>
              </div>
              <span className="text-2xl font-black font-mono text-secondary mt-2 block">
                ₹{formatCurrency2Dec(creditCardRangeTotals.highestMonth.amount)}
              </span>
              <span className="text-[11px] opacity-60 mt-1.5 block">
                Peak: {creditCardRangeTotals.highestMonth.monthLabel}
              </span>
            </div>
          </section>

          {/* 2. Monthly Credit Cards Expenses Trend (Graph View & Table View) */}
          <section className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <CreditCard size={22} className="text-primary" />
                    Credit Cards Monthly Expenses Analysis
                  </h2>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    Interactive monthly spend breakdown per card and cumulative card spend
                  </p>
                </div>

                {/* View Switcher: Graph View vs Table View */}
                <div className="flex flex-wrap items-center gap-2 bg-base-200/80 p-1.5 rounded-2xl border border-base-300">
                  <button
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      cardViewTab === "graph"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                    }`}
                    onClick={() => setCardViewTab("graph")}
                  >
                    <BarChart3 size={15} /> Graph View
                  </button>
                  <button
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      cardViewTab === "table"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                    }`}
                    onClick={() => setCardViewTab("table")}
                  >
                    <TableProperties size={15} /> Table View
                  </button>
                </div>
              </div>

              {/* TAB 1: Graph View */}
              {cardViewTab === "graph" && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="h-[420px] flex items-center justify-center">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                  ) : creditCards.length > 0 && creditCardMonthlyData.length > 0 ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold text-base-content/60">
                        <span>Click legend items below to toggle card series on/off:</span>
                      </div>
                      <Chart
                        options={creditCardApexOptions}
                        series={creditCardApexSeries}
                        type="line"
                        height={420}
                      />
                    </div>
                  ) : (
                    <div className="p-12 text-center text-sm opacity-50 italic">
                      No credit card transactions available for this period.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Table View */}
              {cardViewTab === "table" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-base-200/50 p-3 rounded-2xl border border-base-300">
                    <p className="text-xs font-semibold text-base-content/70">
                      Month-by-month spend per credit card with expandable itemized records.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-extrabold shrink-0">
                      <button
                        onClick={expandAllCardMonths}
                        className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        Expand All
                      </button>
                      <span className="opacity-30">•</span>
                      <button
                        onClick={collapseAllCardMonths}
                        className="btn btn-xs btn-ghost text-base-content/60 hover:bg-base-300/50 cursor-pointer"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-base-200 bg-base-100 shadow-xs">
                    <table className="table table-zebra w-full text-xs">
                      <thead className="bg-base-200/80 text-base-content uppercase font-black tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3.5 px-4 text-left">Month</th>
                          {creditCards.map((c) => (
                            <th key={c._id || c.name} className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 justify-end">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cardColorMap[c.name] }} />
                                {c.name}
                              </span>
                            </th>
                          ))}
                          <th className="py-3.5 px-4 text-right">Total Spent</th>
                          <th className="py-3.5 px-4 text-center">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="font-medium">
                        {creditCardMonthlyData.length > 0 ? (
                          creditCardMonthlyData.map((d) => {
                            const isExpanded = expandedCardMonths.has(d.rawMonth);
                            const spendPct = creditCardRangeTotals.totalSpend > 0
                              ? Number(((d.totalCardSpend / creditCardRangeTotals.totalSpend) * 100).toFixed(2))
                              : 0;
                            const pctStyle = getUsedPercentageStyle(spendPct);

                            return (
                              <React.Fragment key={d.rawMonth}>
                                <tr
                                  onClick={() => toggleExpandCardMonth(d.rawMonth)}
                                  className="hover:bg-base-200/50 transition-colors cursor-pointer"
                                >
                                  <td className="py-3 px-4 font-bold text-sm text-base-content whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <button className="btn btn-xs btn-ghost btn-circle p-0 h-6 w-6 min-h-0 text-base-content/70">
                                        {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                      </button>
                                      <span>{d.monthLabel}</span>
                                      {d.transactions.length > 0 && (
                                        <span className="badge badge-xs bg-base-200 text-base-content/60 font-mono">
                                          {d.transactions.length} txs
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  {creditCards.map((c) => {
                                    const cardSpent = d.cardSpends[c.name] || 0;
                                    return (
                                      <td key={c._id || c.name} className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                                        {cardSpent > 0 ? (
                                          <span style={{ color: cardColorMap[c.name] }}>₹{formatCurrency2Dec(cardSpent)}</span>
                                        ) : (
                                          <span className="opacity-30 font-normal">₹0.00</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-500 whitespace-nowrap">
                                    ₹{formatCurrency2Dec(d.totalCardSpend)}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <span className={`font-mono font-extrabold text-xs w-14 text-right ${pctStyle.text}`}>
                                        {Number(spendPct || 0).toFixed(2)}%
                                      </span>
                                      <div className="w-20 bg-base-200 h-2 rounded-full overflow-hidden hidden sm:block">
                                        <div
                                          className={`h-full rounded-full transition-all ${pctStyle.barBg}`}
                                          style={{ width: `${Math.min(spendPct, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                </tr>

                                {/* Expanded Itemized Transaction Details */}
                                {isExpanded && (
                                  <tr>
                                    <td colSpan={creditCards.length + 3} className="p-0 bg-base-200/30">
                                      <div className="p-4 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-bold text-xs uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                                            <CreditCard size={14} className="text-primary" />
                                            Card Expense Transactions in {d.monthLabel} ({d.transactions.length})
                                          </h4>
                                          <span className="text-[11px] font-mono font-bold text-rose-500">
                                            Total Spent: ₹{formatCurrency2Dec(d.totalCardSpend)}
                                          </span>
                                        </div>

                                        {d.transactions.length > 0 ? (
                                          <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100/80">
                                            <table className="table table-xs w-full">
                                              <thead className="bg-base-200/60 font-bold uppercase text-[10px]">
                                                <tr>
                                                  <th className="py-2 px-3">Date</th>
                                                  <th className="py-2 px-3">Card</th>
                                                  <th className="py-2 px-3">Category</th>
                                                  <th className="py-2 px-3">Description</th>
                                                  <th className="py-2 px-3 text-right">Amount</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-base-200/60">
                                                {d.transactions.map((tx) => {
                                                  const cardName = tx.sourceId?.name || "Credit Card";
                                                  const catName = tx.categoryId?.name || "General";
                                                  const tagStyle = getCategoryTagStyle(catName);

                                                  return (
                                                    <tr key={tx._id} className="hover:bg-base-200/40">
                                                      <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                                                        {dayjs(tx.date).format("DD MMM YYYY")}
                                                      </td>
                                                      <td className="py-2 px-3 font-semibold whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5">
                                                          <span
                                                            className="w-2 h-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: cardColorMap[cardName] || "#888" }}
                                                          />
                                                          {cardName}
                                                        </span>
                                                      </td>
                                                      <td className="py-2 px-3 whitespace-nowrap">
                                                        <span className={`badge badge-xs font-bold ${tagStyle.badge}`}>
                                                          {catName}
                                                        </span>
                                                      </td>
                                                      <td className="py-2 px-3 text-base-content/80 max-w-[220px] truncate">
                                                        {tx.note || tx.description || "—"}
                                                      </td>
                                                      <td className="py-2 px-3 text-right font-mono font-bold text-rose-500 whitespace-nowrap">
                                                        -₹{formatCurrency2Dec(tx.amount)}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <p className="text-xs italic opacity-50 py-2">No transactions recorded for this month.</p>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={creditCards.length + 3} className="py-8 text-center opacity-50 italic">
                              No credit card data available for the selected date range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {creditCardMonthlyData.length > 0 && (
                        <tfoot className="bg-base-200/90 font-black text-sm text-base-content border-t-2 border-base-300">
                          <tr>
                            <td className="py-3.5 px-4 uppercase tracking-wider text-xs">Total / Range Aggregate</td>
                            {creditCards.map((c) => {
                              const cardTotal = creditCardMonthlyData.reduce((sum, d) => sum + (d.cardSpends[c.name] || 0), 0);
                              return (
                                <td key={`foot-${c._id || c.name}`} className="py-3.5 px-4 text-right font-mono" style={{ color: cardColorMap[c.name] }}>
                                  ₹{formatCurrency2Dec(cardTotal)}
                                </td>
                              );
                            })}
                            <td className="py-3.5 px-4 text-right font-mono text-rose-500">₹{formatCurrency2Dec(creditCardRangeTotals.totalSpend)}</td>
                            <td className="py-3.5 px-4 text-center font-mono">
                              <span className="badge badge-sm font-extrabold px-2.5 py-1.5 shadow-xs bg-rose-500 text-white">
                                100.00%
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <>
          {/* 2. Range Summary Cards for Selected Category / Salary */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card bg-base-100 shadow-md border border-base-200 p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
            {isSalaryMode ? "Total Salary" : "Total Allotted"}
          </span>
          <span className="text-2xl font-black font-mono text-primary mt-1 block">
            ₹{formatCurrency2Dec(rangeTotals.totalAllotted)}
          </span>
          <span className="text-[11px] opacity-60 mt-2 block">
            Across {rangeMonths.length} Months
          </span>
        </div>

        <div className="card bg-base-100 shadow-md border border-base-200 p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Total Used</span>
          <span className="text-2xl font-black font-mono text-rose-500 mt-1 block">
            ₹{formatCurrency2Dec(rangeTotals.totalUsed)}
          </span>
          <span className="text-[11px] opacity-60 mt-2 block">
            {isSalaryMode ? "Total Expenses across Categories" : `Total Spent in ${categoryCleanName}`}
          </span>
        </div>

        <div className="card bg-base-100 shadow-md border border-base-200 p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
            {isSalaryMode ? "Net Savings" : "Total Left"}
          </span>
          <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            ₹{formatCurrency2Dec(rangeTotals.totalLeft)}
          </span>
          <span className="text-[11px] opacity-60 mt-2 block">
            {isSalaryMode ? "Remaining Unspent Salary" : "Remaining Unspent Budget"}
          </span>
        </div>

        <div className="card bg-base-100 shadow-md border border-base-200 p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Utilized Rate</span>
          <span className={`text-2xl font-black font-mono mt-1 block ${rangeTotals.overallPct > 100 ? 'text-error' : 'text-info'}`}>
            {Number(rangeTotals.overallPct || 0).toFixed(2)}%
          </span>
          <div className="w-full bg-base-200 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${rangeTotals.overallPct > 100 ? 'bg-error' : 'bg-info'}`}
              style={{ width: `${Math.min(rangeTotals.overallPct, 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* 3. Main Category / Salary Section (Graph View & Table View Tabs) */}
      <section className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-base-200 pb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {isSalaryMode ? (
                  <Banknote size={22} className="text-primary" />
                ) : (
                  <Folder size={22} className="text-primary" />
                )}
                {categoryCleanName} Performance Analysis
              </h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                {isSalaryMode
                  ? "Overview displaying Net Savings vs Total Spent across all categories"
                  : `Category overview displaying Left vs Used amounts for ${categoryCleanName}`}
              </p>
            </div>

            {/* View Switcher: Graph View vs Table View */}
            <div className="flex flex-wrap items-center gap-2 bg-base-200/80 p-1.5 rounded-2xl border border-base-300">
              <button
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  mainCategoryTab === "graph"
                    ? isSalaryMode
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                      : "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                }`}
                onClick={() => setMainCategoryTab("graph")}
              >
                <BarChart3 size={15} /> Graph View
              </button>
              <button
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  mainCategoryTab === "table"
                    ? isSalaryMode
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                      : "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                }`}
                onClick={() => setMainCategoryTab("table")}
              >
                <TableProperties size={15} /> Table View
              </button>
            </div>
          </div>

          {/* TAB 1: Graph View */}
          {mainCategoryTab === "graph" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-semibold">
                <p className="text-base-content/70">
                  Single stacked bar per month showing <strong>Left</strong> (bottom) and <strong>Used</strong> (top):
                </p>
                <div className="flex items-center gap-4 font-bold bg-base-200/70 px-3 py-1.5 rounded-xl border border-base-300">
                  <div className="flex items-center gap-2">
                    {/* <span className="w-3.5 h-3.5 rounded bg-emerald-500"></span> Left {categoryCleanName} */}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: "rgba(16, 185, 129, 0.35)" }}></span> Used {categoryCleanName} */}
                  </div>
                </div>
              </div>

              <div className="w-full h-[420px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={monthlyPlotData}
                      margin={{ top: 20, right: 30, left: 15, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="monthLabel"
                        tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 600, opacity: 0.8 }}
                      />
                      <YAxis
                        tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }}
                        tickFormatter={(v) => `₹${formatCurrency2Dec(v)}`}
                      />
                      <Tooltip content={<MainCategoryTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)', rx: 8 }} />
                      <Legend formatter={(value) => <span style={{ color: '#ffffff' }}>{value}</span>} />
                      <Bar
                        dataKey="left"
                        stackId="a"
                        name={`Left ${categoryCleanName}`}
                        fill="#10b981a1"
                        radius={0}
                        maxBarSize={55}
                      >
                        <LabelList
                          dataKey="left"
                          position="center"
                          formatter={(v) => (v > 0 ? `₹${formatCurrency2Dec(v)}` : '')}
                          style={{ fill: '#ffffff', fontSize: 11, fontWeight: 800 }}
                        />
                      </Bar>
                      <Bar
                        dataKey="used"
                        stackId="a"
                        name={`Used ${categoryCleanName}`}
                        fill="rgba(16, 185, 129, 0.17)"
                        radius={0}
                        maxBarSize={55}
                      >
                        <LabelList
                          dataKey="used"
                          position="center"
                          formatter={(v) => (v > 0 ? `₹${formatCurrency2Dec(v)}` : '')}
                          style={{ fill: '#ffffff', fontSize: 11, fontWeight: 800 }}
                        />
                      </Bar>
                      {isSalaryMode && (
                        <Line
                          type="monotone"
                          dataKey="allotted"
                          name="Total Salary"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={{ r: 4.5, fill: "#10b981", stroke: "#1e293b", strokeWidth: 1.5 }}
                          activeDot={{ r: 7, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Table View */}
          {mainCategoryTab === "table" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="text-xs font-semibold text-base-content/70">
                  Detailed month-by-month financial breakdown for <strong className="text-primary">{categoryCleanName}</strong>:
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-base-200 bg-base-100 shadow-xs">
                <table className="table table-zebra w-full text-xs">
                  <thead className="bg-base-200/80 text-base-content uppercase font-black tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 text-left">Months</th>
                      <th className="py-3.5 px-4 text-right">{isSalaryMode ? "Salary" : "Allotted"}</th>
                      <th className="py-3.5 px-4 text-right">Used</th>
                      <th className="py-3.5 px-4 text-right">{isSalaryMode ? "Net Savings" : "Remaining"}</th>
                      <th className="py-3.5 px-4 text-center">Percentage Used</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {monthlyPlotData.length > 0 ? (
                      monthlyPlotData.map((d) => {
                        const pctStyle = getUsedPercentageStyle(d.percentage);
                        return (
                          <tr key={d.rawMonth} className="hover:bg-base-200/50 transition-colors">
                            <td className="py-3 px-4 font-bold text-sm text-base-content whitespace-nowrap">
                              {d.monthLabel}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-primary whitespace-nowrap">
                              ₹{formatCurrency2Dec(d.allotted)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-rose-500 whitespace-nowrap">
                              ₹{formatCurrency2Dec(d.used)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              ₹{formatCurrency2Dec(d.left)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`font-mono font-extrabold text-xs w-14 text-right ${pctStyle.text}`}>
                                  {Number(d.percentage || 0).toFixed(2)}%
                                </span>
                                <div className="w-24 bg-base-200 h-2 rounded-full overflow-hidden hidden sm:block">
                                  <div
                                    className={`h-full rounded-full transition-all ${pctStyle.barBg}`}
                                    style={{ width: `${Math.min(d.percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center opacity-50 italic">
                          No monthly data available for the selected range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {monthlyPlotData.length > 0 && (
                    <tfoot className="bg-base-200/90 font-black text-sm text-base-content border-t-2 border-base-300">
                      <tr>
                        <td className="py-3.5 px-4 uppercase tracking-wider text-xs">Total / Range Aggregate</td>
                        <td className="py-3.5 px-4 text-right font-mono text-primary">₹{formatCurrency2Dec(rangeTotals.totalAllotted)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-rose-500">₹{formatCurrency2Dec(rangeTotals.totalUsed)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">₹{formatCurrency2Dec(rangeTotals.totalLeft)}</td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          {(() => {
                            const footerStyle = getUsedPercentageStyle(rangeTotals.overallPct);
                            return (
                              <span className={`badge badge-sm font-extrabold px-2.5 py-1.5 shadow-xs ${footerStyle.badgeBg}`}>
                                {Number(rangeTotals.overallPct || 0).toFixed(2)}% Overall
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Sub-Category / Category Split Interactive Analytics & Monthly Breakdown Section */}
      <section className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-6 space-y-6">
          {/* Section Header & View Switcher */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-base-200 pb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {isSalaryMode ? (
                  <PieChart size={22} className="text-secondary" />
                ) : (
                  <Layers size={22} className="text-secondary" />
                )}
                {isSalaryMode ? "Category Split Breakdown" : `${categoryCleanName} — Sub-Category Detailed Analytics`}
              </h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                {isSalaryMode
                  ? "Monthly expenditure split across all categories with total expenses trend line"
                  : `Analyze sub-category spending under ${categoryCleanName} in Graph or Table view`}
              </p>
            </div>

            {/* Sub-Category View Switcher */}
            <div className="flex items-center gap-2 bg-base-200/80 p-1.5 rounded-2xl border border-base-300">
              <button
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  subCategoryTab === "graph"
                    ? "bg-secondary/15 text-secondary border border-secondary/30 shadow-xs"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                }`}
                onClick={() => setSubCategoryTab("graph")}
              >
                <BarChart3 size={15} /> Graph View
              </button>
              <button
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  subCategoryTab === "table"
                    ? "bg-secondary/15 text-secondary border border-secondary/30 shadow-xs"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                }`}
                onClick={() => setSubCategoryTab("table")}
              >
                <TableProperties size={15} /> Table View
              </button>
            </div>
          </div>

          {/* TAB 1: Graph View */}
          {subCategoryTab === "graph" && (
            <div className="space-y-4">
              {subCategoryNames.length > 0 ? (
                <div className="w-full">
                  <Chart
                    options={subCatApexOptions}
                    series={subCatApexSeries}
                    type="line"
                    height={420}
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-sm opacity-50 italic">
                  {isSalaryMode
                    ? "No categories configured. Add categories in Table View to view category split."
                    : `No sub-categories configured under ${categoryCleanName}. Add sub-categories in Table View to view actual spent breakdown.`}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Collapsible Sub-Category Table View */}
          {subCategoryTab === "table" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-base-200/50 p-3 rounded-2xl border border-base-300">
                <p className="text-xs font-semibold text-base-content/70">
                  {isSalaryMode
                    ? "Collapsible monthly breakdown showing Allotted, Used, Remaining, and % Utilized for each category."
                    : `Collapsible monthly breakdown showing Allotted, Used, Remaining, and % Utilized for each sub-category under ${categoryCleanName}.`}
                </p>
                <div className="flex items-center gap-2 text-xs font-extrabold shrink-0">
                  <button
                    onClick={expandAllSubMonths}
                    className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    Expand All
                  </button>
                  <span className="opacity-30">•</span>
                  <button
                    onClick={collapseAllSubMonths}
                    className="btn btn-xs btn-ghost text-base-content/60 hover:bg-base-300/50 cursor-pointer"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
                <table className="table w-full text-xs">
                  <thead className="bg-base-200/80 text-base-content font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Month / {isSalaryMode ? "Category" : "Sub-Category"}</th>
                      <th className="py-3 px-4 text-right">Allotted Budget</th>
                      <th className="py-3 px-4 text-right">Actual Spent</th>
                      <th className="py-3 px-4 text-right">Remaining</th>
                      <th className="py-3 px-4 text-center">% Utilized</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200 font-medium">
                    {subCatMonthlyTableData.length > 0 ? (
                      subCatMonthlyTableData.map((mRow) => {
                        const isExpanded = expandedSubMonths.has(mRow.rawMonth);

                        return (
                          <React.Fragment key={mRow.rawMonth}>
                            {/* Parent Month Row */}
                            <tr
                              onClick={() => toggleExpandSubMonth(mRow.rawMonth)}
                              className="bg-base-100 hover:bg-base-200/60 transition-colors cursor-pointer font-bold border-t-2 border-base-200"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <button className="btn btn-xs btn-ghost btn-circle p-0 h-6 w-6 min-h-0 text-base-content/70">
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                  </button>
                                  <span className="font-extrabold text-sm text-base-content">
                                    {mRow.monthLabel}
                                  </span>
                                  <span className="badge badge-xs font-extrabold bg-base-200 border-base-300 text-base-content/70">
                                    {mRow.subRows.length} {isSalaryMode ? "categories" : "sub-categories"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-extrabold text-primary">
                                ₹{formatCurrency2Dec(mRow.totalAllotted)}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-extrabold text-rose-500">
                                ₹{formatCurrency2Dec(mRow.totalUsed)}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                ₹{formatCurrency2Dec(mRow.totalRemaining)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {(() => {
                                  const mPctStyle = getUsedPercentageStyle(mRow.overallPct);
                                  return (
                                    <div className="flex items-center justify-center gap-2">
                                      <span className={`font-mono font-extrabold text-xs w-14 text-right ${mPctStyle.text}`}>
                                        {Number(mRow.overallPct || 0).toFixed(2)}%
                                      </span>
                                      <div className="w-20 bg-base-200 h-2 rounded-full overflow-hidden hidden sm:block">
                                        <div
                                          className={`h-full rounded-full transition-all ${mPctStyle.barBg}`}
                                          style={{ width: `${Math.min(mRow.overallPct, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })()}
                              </td>
                            </tr>

                            {/* Expanded Child Sub-Category Rows */}
                            {isExpanded &&
                              mRow.subRows.map((sub, idx) => {
                                const color = subCatSpentPalette[idx % subCatSpentPalette.length];
                                const subPctStyle = getUsedPercentageStyle(sub.pct);

                                return (
                                  <tr
                                    key={`${mRow.rawMonth}-${sub.subName}`}
                                    className="bg-base-200/30 hover:bg-base-200/70 transition-colors"
                                  >
                                    <td className="py-2.5 px-4 pl-12">
                                      <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                                        <span className="font-semibold text-base-content/90">
                                          {sub.subName}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-mono text-base-content/80 whitespace-nowrap">
                                      ₹{formatCurrency2Dec(sub.allotted)}
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-500 whitespace-nowrap">
                                      ₹{formatCurrency2Dec(sub.used)}
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                      ₹{formatCurrency2Dec(sub.remaining)}
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <span className={`font-mono font-bold text-xs w-14 text-right ${subPctStyle.text}`}>
                                          {Number(sub.pct || 0).toFixed(2)}%
                                        </span>
                                        <div className="w-16 bg-base-300/60 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                          <div
                                            className={`h-full rounded-full transition-all ${subPctStyle.barBg}`}
                                            style={{ width: `${Math.min(sub.pct, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center opacity-50 italic">
                          {isSalaryMode
                            ? "No category data available for the selected month range."
                            : "No sub-category data available for the selected month range."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {subCatMonthlyTableData.length > 0 && (
                    <tfoot className="bg-base-200/90 font-black text-sm text-base-content border-t-2 border-base-300">
                      <tr>
                        <td className="py-3.5 px-4 uppercase tracking-wider text-xs">Total / Range Aggregate</td>
                        <td className="py-3.5 px-4 text-right font-mono text-primary">₹{formatCurrency2Dec(subCatRangeTotals.allotted)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-rose-500">₹{formatCurrency2Dec(subCatRangeTotals.used)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">₹{formatCurrency2Dec(subCatRangeTotals.remaining)}</td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          {(() => {
                            const subFooterStyle = getUsedPercentageStyle(subCatRangeTotals.overallPct);
                            return (
                              <span className={`badge badge-sm font-extrabold px-2.5 py-1.5 shadow-xs ${subFooterStyle.badgeBg}`}>
                                {Number(subCatRangeTotals.overallPct || 0).toFixed(2)}% Overall
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
        </>
      )}
      </div>

      {/* ========================================================================= */}
      {/* PHONE VIEW (mobile only: minimal single-line headers, no trajectory, etc) */}
      {/* ========================================================================= */}
<div className="block md:hidden space-y-4">
        {isCreditCardMode ? (
          <div className="space-y-4">
            {/* 1. Range Summary Cards for Credit Cards */}
            <section className="grid grid-cols-2 gap-2 px-1">
              <div className="card bg-base-100 shadow-xs border border-base-content/10 p-2.5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 truncate">
                    Total Card Expenses
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                    <CreditCard size={15} />
                  </div>
                </div>
                <span className="text-base font-black font-mono text-rose-500 mt-1.5 block truncate">
                  {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(creditCardRangeTotals.totalSpend)}`}
                </span>
                <span className="text-[9.5px] opacity-60 mt-1 block truncate">
                  {rangeMonths.length} Months • {creditCardRangeTotals.totalTxCount} Txns
                </span>
              </div>

              <div className="card bg-base-100 shadow-xs border border-base-content/10 p-2.5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 truncate">
                    Outstanding Dues
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <AlertTriangle size={15} />
                  </div>
                </div>
                <span className="text-base font-black font-mono text-amber-500 mt-1.5 block truncate">
                  {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(creditCardRangeTotals.totalDue)}`}
                </span>
                <span className="text-[9.5px] opacity-60 mt-1 block truncate">
                  {creditCards.length} Cards • {creditCardRangeTotals.overallUtilization}% Limit
                </span>
              </div>

              <div className="card bg-base-100 shadow-xs border border-base-content/10 p-2.5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 truncate">
                    Avg Monthly Spend
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <TrendingUp size={15} />
                  </div>
                </div>
                <span className="text-base font-black font-mono text-primary mt-1.5 block truncate">
                  {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(creditCardRangeTotals.avgMonthlySpend)}`}
                </span>
                <span className="text-[9.5px] opacity-60 mt-1 block truncate">
                  Across {rangeMonths.length} Months
                </span>
              </div>

              <div className="card bg-base-100 shadow-xs border border-base-content/10 p-2.5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 truncate">
                    Peak Month
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <ArrowUpRight size={15} />
                  </div>
                </div>
                <span className="text-base font-black font-mono text-secondary mt-1.5 block truncate">
                  {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(creditCardRangeTotals.highestMonth.amount)}`}
                </span>
                <span className="text-[9.5px] opacity-60 mt-1 block truncate">
                  {creditCardRangeTotals.highestMonth.monthLabel}
                </span>
              </div>
            </section>

            {/* 2. Credit Cards Analysis Section */}
            <section className="card bg-base-100 shadow-xs border border-base-content/10 rounded-2xl">
              <div className="card-body p-3 space-y-3.5">
                {/* Minimal Single-line Heading & Subtitle */}
                <div className="flex items-center justify-between border-b border-base-200 pb-2.5">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold flex items-center gap-1.5 truncate">
                      <CreditCard size={16} className="text-primary shrink-0" />
                      <span className="truncate">Credit Cards</span>
                    </h2>
                    <p className="text-[11px] text-base-content/60 truncate mt-0.5">
                      Monthly spend breakdown per credit card
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="h-60 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : creditCards.length > 0 && creditCardMonthlyData.length > 0 ? (
                  <div className="space-y-3.5">
                    {/* Monthly Velocity Scrubber */}
                    <div className="space-y-2 bg-base-200/40 p-2.5 rounded-2xl border border-base-content/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={13} className="text-primary" />
                          Monthly Velocity
                        </span>
                      </div>

                      <div
                        ref={mobileCardScrubberRef}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-0.5 px-0.5"
                      >
                        {/* 'All Range' Pill */}
                        <button
                          ref={(el) => { cardMonthPillRefs.current["all"] = el; }}
                          type="button"
                          onClick={() => setMobileCardSelectedMonth("all")}
                          className={`px-3 py-2 rounded-2xl flex flex-col items-start gap-0.5 whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                            mobileCardSelectedMonth === "all"
                              ? "bg-base-200/90 dark:bg-base-800/90 border-primary/50 text-base-content shadow-xs ring-1 ring-primary/30"
                              : "bg-base-100/60 dark:bg-base-900/40 hover:bg-base-200/60 text-base-content/80 border-base-content/10"
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-wider ${mobileCardSelectedMonth === "all" ? "text-primary" : "text-base-content/70"}`}>
                            All Range
                          </span>
                          <span className="font-mono font-black text-xs text-base-content">
                            {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(creditCardRangeTotals.totalSpend)}`}
                          </span>
                          <span className="text-[9px] text-base-content/50 font-semibold">
                            {rangeMonths.length} Months Total
                          </span>
                        </button>

                        {/* Month Pills with MoM Delta */}
                        {creditCardMonthlyDataWithMoM.filter((d) => d.totalCardSpend > 0).map((d) => {
                          const isSelected = mobileCardSelectedMonth === d.rawMonth;
                          const shortMonth = dayjs(`${d.rawMonth}-01`).format("MMM 'YY");

                          return (
                            <button
                              key={`scrubber-card-${d.rawMonth}`}
                              ref={(el) => { cardMonthPillRefs.current[d.rawMonth] = el; }}
                              type="button"
                              onClick={() => setMobileCardSelectedMonth(d.rawMonth)}
                              className={`px-3 py-2 rounded-2xl flex flex-col items-start gap-0.5 whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                                isSelected
                                  ? "bg-base-200/90 dark:bg-base-800/90 border-primary/50 text-base-content shadow-xs ring-1 ring-primary/30"
                                  : "bg-base-100/60 dark:bg-base-900/40 hover:bg-base-200/60 text-base-content/80 border-base-content/10"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 w-full justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-primary" : "text-base-content/70"}`}>
                                  {shortMonth}
                                </span>
                                {d.momDeltaPct !== null ? (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                                      d.momDeltaType === "increase"
                                        ? "bg-rose-500/15 text-rose-500"
                                        : d.momDeltaType === "decrease"
                                        ? "bg-emerald-500/15 text-emerald-500"
                                        : "bg-base-content/10 text-base-content/60"
                                    }`}
                                  >
                                    {d.momDeltaType === "increase" ? (
                                      <ArrowUpRight size={10} className="shrink-0" />
                                    ) : d.momDeltaType === "decrease" ? (
                                      <ArrowDownLeft size={10} className="shrink-0" />
                                    ) : null}
                                    {d.momDeltaPct > 0 ? `+${d.momDeltaPct}%` : `${d.momDeltaPct}%`}
                                  </span>
                                ) : (
                                  <span className="text-[9px] opacity-40 font-mono">—</span>
                                )}
                              </div>
                              <span className="font-mono font-black text-xs text-base-content">
                                {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(d.totalCardSpend)}`}
                              </span>
                              <span className="text-[9px] text-base-content/50 font-semibold">
                                {d.transactions.length} Card Txns
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Donut Chart for Cards */}
                    <div className="bg-base-200/40 border border-base-content/10 rounded-2xl p-3 flex flex-col items-center justify-center">
                      <div className="w-full flex items-center justify-between border-b border-base-200 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <PieChart size={16} className="text-primary shrink-0" />
                          <span className="text-xs font-extrabold text-base-content">
                            Cards Spend Distribution
                          </span>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-base-200 text-base-content/70">
                          {creditCardDonutData.periodLabel}
                        </span>
                      </div>

                      {creditCardDonutData.hasData ? (
                        <div className="w-full">
                          <Chart
                            key={`card-donut-${mobileCardSelectedMonth}-${creditCardDonutData.totalSpent}-${creditCardDonutData.series.join("-")}`}
                            options={creditCardDonutApexOptions}
                            series={creditCardDonutData.series}
                            type="donut"
                            height={280}
                          />
                        </div>
                      ) : (
                        <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
                            <PieChart size={24} />
                          </div>
                          <p className="text-xs font-semibold text-base-content/60">
                            No card expenses in {creditCardDonutData.periodLabel}.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ranked Card Spending Breakdown Cards */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-extrabold text-base-content uppercase tracking-wider flex items-center gap-1.5">
                          <Award size={14} className="text-primary" />
                          Ranked Credit Card Expenses
                        </span>
                        <span className="text-[10px] font-mono text-base-content/50">
                          {creditCardDonutData.rankedCards.length} Cards
                        </span>
                      </div>

                      {creditCardDonutData.rankedCards.length > 0 ? (
                        <div className="space-y-2">
                          {creditCardDonutData.rankedCards.map((card, idx) => (
                            <div
                              key={card._id || card.name}
                              className="bg-base-200/40 border border-base-content/10 rounded-2xl p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-base-300 text-base-content/70 shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: card.color }}
                                  />
                                  <span className="font-bold text-xs text-base-content truncate">
                                    {card.name}
                                  </span>
                                </div>
                                <span className="font-mono text-xs font-black text-rose-500 shrink-0">
                                  {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(card.used)}`}
                                </span>
                              </div>

                              <div className="w-full bg-base-300/70 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.max(card.barPct, 2)}%`,
                                    backgroundColor: card.color,
                                  }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10.5px] font-mono text-base-content/60 pt-0.5">
                                <span className="truncate">
                                  Balance: {hideNumbers ? "••••" : `₹${formatCurrency2Dec(card.currentBalance)}`}
                                </span>
                                <span className="font-bold text-base-content/80">
                                  {card.sharePct}% share
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs opacity-50 italic bg-base-200/20 rounded-2xl border border-base-content/10">
                          No credit card expenses recorded for this period.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm opacity-50 italic">
                    No credit card transactions available for this period.
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. Range Summary Cards for Selected Category / Salary */}
            <section className="grid grid-cols-2 gap-2 px-1">
              <div className="card bg-base-100 shadow-xs border border-base-content/10 p-2.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 truncate">
                  {isSalaryMode ? "Total Income" : "Total Budget"}
                </span>
                <span className="text-base font-black font-mono text-primary mt-1.5 block truncate">
                  {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(rangeTotals.totalAllotted)}`}
                </span>
                <span className="text-[9.5px] opacity-60 mt-1 block truncate">
                  Across {rangeMonths.length} Months
                </span>
              </div>

              <div className="card bg-base-100 shadow-xs border border-base-content/10 p-2.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 truncate">
                  Total Spent
                </span>
                <span className="text-base font-black font-mono text-rose-500 mt-1.5 block truncate">
                  {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(rangeTotals.totalUsed)}`}
                </span>
                <span className="text-[9.5px] opacity-60 mt-1 block truncate">
                  {rangeTotals.overallPct}% Budget Spent
                </span>
              </div>

              <div className="card bg-base-100 shadow-xs border border-base-content/10 p-2.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 truncate">
                  {isSalaryMode ? "Net Savings" : "Total Left"}
                </span>
                <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 block truncate">
                  {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(rangeTotals.totalLeft)}`}
                </span>
                <span className="text-[9.5px] opacity-60 mt-1 block truncate">
                  Remaining Amount
                </span>
              </div>

              <div className="card bg-base-100 shadow-xs border border-base-content/10 p-2.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 truncate">
                  Budget Utilization
                </span>
                <span className="text-base font-black font-mono mt-1.5 block truncate">
                  {rangeTotals.overallPct}%
                </span>
                <div className="w-full bg-base-300 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full ${
                      rangeTotals.overallPct > 100
                        ? "bg-rose-500"
                        : rangeTotals.overallPct > 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(rangeTotals.overallPct, 100)}%` }}
                  />
                </div>
              </div>
            </section>

            {/* 2. Category / Salary Analysis Section */}
            <section className="card bg-base-100 shadow-xs border border-base-content/10 rounded-2xl">
              <div className="card-body p-3 space-y-3.5">
                {/* Minimal Single-line Heading & Subtitle (Month & Reset completely REMOVED) */}
                <div className="flex items-center justify-between border-b border-base-200 pb-2.5">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold flex items-center gap-1.5 truncate">
                      {isSalaryMode ? (
                        <Banknote size={16} className="text-primary shrink-0" />
                      ) : (
                        <Folder size={16} className="text-primary shrink-0" />
                      )}
                      <span className="truncate">{categoryCleanName}</span>
                    </h2>
                    <p className="text-[11px] text-base-content/60 truncate mt-0.5">
                      {isSalaryMode
                        ? "Category allocation & spend distribution"
                        : `Sub-category breakdown & spend for ${categoryCleanName}`}
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="h-60 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : subCategoryNames.length === 0 ? (
                  <div className="p-8 text-center text-sm opacity-50 italic">
                    {isSalaryMode
                      ? "No categories configured. Add categories in Expenses to view category split."
                      : `No sub-categories configured under ${categoryCleanName}.`}
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Monthly Velocity Scrubber */}
                    <div className="space-y-2 bg-base-200/40 p-2.5 rounded-2xl border border-base-content/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={13} className="text-primary" />
                          Monthly Velocity
                        </span>
                      </div>

                      <div
                        ref={mobileCatScrubberRef}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-0.5 px-0.5"
                      >
                        {/* 'All Range' Pill */}
                        <button
                          ref={(el) => { monthPillRefs.current["all"] = el; }}
                          type="button"
                          onClick={() => setMobileSubCatSelectedMonth("all")}
                          className={`px-3 py-2 rounded-2xl flex flex-col items-start gap-0.5 whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                            mobileSubCatSelectedMonth === "all"
                              ? "bg-base-200/90 dark:bg-base-800/90 border-primary/50 text-base-content shadow-xs ring-1 ring-primary/30"
                              : "bg-base-100/60 dark:bg-base-900/40 hover:bg-base-200/60 text-base-content/80 border-base-content/10"
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-wider ${mobileSubCatSelectedMonth === "all" ? "text-primary" : "text-base-content/70"}`}>
                            All Range
                          </span>
                          <span className="font-mono font-black text-xs text-base-content">
                            {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(rangeTotals.totalUsed)}`}
                          </span>
                          <span className="text-[9px] text-base-content/50 font-semibold">
                            {rangeMonths.length} Months Total
                          </span>
                        </button>

                        {/* Month Pills with MoM Delta */}
                        {monthlyPlotDataWithMoM.filter((m) => m.allotted > 0 || m.used > 0).map((m) => {
                          const isSelected = mobileSubCatSelectedMonth === m.rawMonth;
                          const shortMonth = dayjs(`${m.rawMonth}-01`).format("MMM 'YY");

                          return (
                            <button
                              key={`scrubber-${m.rawMonth}`}
                              ref={(el) => { monthPillRefs.current[m.rawMonth] = el; }}
                              type="button"
                              onClick={() => setMobileSubCatSelectedMonth(m.rawMonth)}
                              className={`px-3 py-2 rounded-2xl flex flex-col items-start gap-0.5 whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                                isSelected
                                  ? "bg-base-200/90 dark:bg-base-800/90 border-primary/50 text-base-content shadow-xs ring-1 ring-primary/30"
                                  : "bg-base-100/60 dark:bg-base-900/40 hover:bg-base-200/60 text-base-content/80 border-base-content/10"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 w-full justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-primary" : "text-base-content/70"}`}>
                                  {shortMonth}
                                </span>
                                {m.momDeltaPct !== null ? (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                                      m.momDeltaType === "increase"
                                        ? "bg-rose-500/15 text-rose-500"
                                        : m.momDeltaType === "decrease"
                                        ? "bg-emerald-500/15 text-emerald-500"
                                        : "bg-base-content/10 text-base-content/60"
                                    }`}
                                  >
                                    {m.momDeltaType === "increase" ? (
                                      <ArrowUpRight size={10} className="shrink-0" />
                                    ) : m.momDeltaType === "decrease" ? (
                                      <ArrowDownLeft size={10} className="shrink-0" />
                                    ) : null}
                                    {m.momDeltaPct > 0 ? `+${m.momDeltaPct}%` : `${m.momDeltaPct}%`}
                                  </span>
                                ) : (
                                  <span className="text-[9px] opacity-40 font-mono">—</span>
                                )}
                              </div>
                              <span className="font-mono font-black text-xs text-base-content">
                                {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(m.used)}`}
                              </span>
                              <span className="text-[9px] text-base-content/50 font-semibold">
                                {m.allotted > 0 ? `${Number(m.percentage).toFixed(0)}% budget` : "No budget"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="bg-base-200/40 border border-base-content/10 rounded-2xl p-3 flex flex-col items-center justify-center">
                      <div className="w-full flex items-center justify-between border-b border-base-200 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <PieChart size={16} className="text-primary shrink-0" />
                          <span className="text-xs font-extrabold text-base-content">
                            Spending Distribution
                          </span>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-base-200 text-base-content/70">
                          {donutChartData.periodLabel}
                        </span>
                      </div>

                      {donutChartData.hasData ? (
                        <div className="w-full">
                          <Chart
                            key={`donut-${selectedCatId}-${mobileSubCatSelectedMonth}-${donutChartData.periodTotalSpent}-${donutChartData.series.join("-")}`}
                            options={donutApexOptions}
                            series={donutChartData.series}
                            type="donut"
                            height={280}
                          />
                        </div>
                      ) : (
                        <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
                            <PieChart size={24} />
                          </div>
                          <p className="text-xs font-semibold text-base-content/60">
                            No expenses recorded for {donutChartData.periodLabel}.
                          </p>
                        </div>
                      )}

                      {/* Quick Summary Bar below Donut */}
                      <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-base-200 text-center text-xs">
                        <div className="bg-base-100/70 p-2 rounded-xl border border-base-content/5">
                          <span className="text-[9px] uppercase font-bold text-base-content/50 block truncate">
                            Period Budget
                          </span>
                          <span className="font-mono font-black text-xs text-primary block truncate mt-0.5">
                            {hideNumbers ? "••••" : `₹${formatCurrency2Dec(donutChartData.periodTotalBudget)}`}
                          </span>
                        </div>
                        <div className="bg-base-100/70 p-2 rounded-xl border border-base-content/5">
                          <span className="text-[9px] uppercase font-bold text-base-content/50 block truncate">
                            Period Spent
                          </span>
                          <span className="font-mono font-black text-xs text-rose-500 block truncate mt-0.5">
                            {hideNumbers ? "••••" : `₹${formatCurrency2Dec(donutChartData.periodTotalSpent)}`}
                          </span>
                        </div>
                        <div className="bg-base-100/70 p-2 rounded-xl border border-base-content/5">
                          <span className="text-[9px] uppercase font-bold text-base-content/50 block truncate">
                            Remaining
                          </span>
                          <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 block truncate mt-0.5">
                            {hideNumbers ? "••••" : `₹${formatCurrency2Dec(donutChartData.periodTotalLeft)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ranked Expense Cards (Trajectory Graph REMOVED!) */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-extrabold text-base-content uppercase tracking-wider flex items-center gap-1.5">
                          <Award size={14} className="text-primary" />
                          {isSalaryMode ? "Ranked Category Expenses" : "Ranked Sub-Category Expenses"}
                        </span>
                        <span className="text-[10px] font-mono text-base-content/50">
                          {mobileSubCategoryBars.filter((b) => b.used > 0).length} of {mobileSubCategoryBars.length} Active
                        </span>
                      </div>

                      {mobileSubCategoryBars.length > 0 ? (
                        <div className="space-y-2">
                          {mobileSubCategoryBars.map((bar, idx) => {
                            return (
                              <div
                                key={bar.name}
                                className="bg-base-200/40 border border-base-content/10 rounded-2xl p-3 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-base-300 text-base-content/70 shrink-0">
                                      {idx + 1}
                                    </span>
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: bar.color }}
                                    />
                                    <span className="font-bold text-xs text-base-content truncate">
                                      {bar.name}
                                    </span>
                                  </div>
                                  <span className="font-mono text-xs font-black text-rose-500 shrink-0">
                                    {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(bar.used)}`}
                                  </span>
                                </div>

                                <div className="w-full bg-base-300/70 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.max(bar.barPct, 2)}%`,
                                      backgroundColor: bar.color,
                                    }}
                                  />
                                </div>

                                <div className="flex items-center justify-between text-[10.5px] font-mono text-base-content/60 pt-0.5">
                                  <span className="truncate max-w-[60%]">
                                    {bar.allotted > 0
                                      ? `Budget: ${hideNumbers ? "••••" : `₹${formatCurrency2Dec(bar.allotted)}`}`
                                      : "No budget"}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="font-bold text-base-content/80">
                                      {bar.sharePct}% share
                                    </span>
                                    {bar.allotted > 0 && (
                                      <span
                                        className="badge badge-xs font-bold border"
                                        style={{
                                          borderColor: `${bar.color}50`,
                                          backgroundColor: `${bar.color}18`,
                                          color: bar.color,
                                        }}
                                      >
                                        {bar.utilizedPct}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs opacity-50 italic bg-base-200/20 rounded-2xl border border-base-content/10">
                          No expenses recorded for this period.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ExpDashboard;
