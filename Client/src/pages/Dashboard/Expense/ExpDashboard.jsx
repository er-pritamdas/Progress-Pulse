import React, { useEffect, useState, useMemo } from "react";
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
  LabelList
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
  Receipt
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

  // Credit Card Section View Tab ("graph" | "table")
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

  // Category Section View Tab ("graph" | "table")
  const [mainCategoryTab, setMainCategoryTab] = useState("graph");

  // Sub-Category View Tab ("graph" | "table")
  const [subCategoryTab, setSubCategoryTab] = useState("graph");
  const [activeSubTab, setActiveSubTab] = useState("allotment");
  const [selectedSubCatName, setSelectedSubCatName] = useState("");

  // Expanded Month Rows in Sub-Category Table View
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
    "#ef4444", "#8b5cf6", "#3b82f6", "#f59e0b", "#06b6d4",
    "#ec4899", "#10b981", "#6366f1", "#14b8a6", "#e11d48"
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
    return Array.from(namesSet);
  }, [isSalaryMode, isCreditCardMode, availableCategories, selectedCategory, categories]);

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
            if (t.type === "Credit" || t.type === "Transfer" || t.type !== "Debit") return false;
            const tMonth = dayjs(t.date).format("YYYY-MM");
            if (tMonth !== m) return false;

            const catId = String(t.categoryId?._id || t.categoryId);
            if (!matchingCatIds.has(catId)) return false;

            const tSubId = String(t.subCategoryId?._id || t.subCategoryId || "");
            const matchingSubCatIds = new Set();
            matchingCats.forEach((c) => {
              (c.subCategories || []).forEach((sub) => {
                if (sub.name === subName && sub._id) matchingSubCatIds.add(String(sub._id));
              });
            });

            if (tSubId && matchingSubCatIds.has(tSubId)) return true;
            return false;
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

            const tSubId = String(t.subCategoryId?._id || t.subCategoryId || "");
            const matchingSubCatIds = new Set();
            matchingCats.forEach((c) => {
              (c.subCategories || []).forEach((sub) => {
                if (sub.name === subName && sub._id) matchingSubCatIds.add(String(sub._id));
              });
            });

            if (tSubId && matchingSubCatIds.has(tSubId)) return true;
            return false;
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



  // Data for the Monthly Breakdown Table (Months, Alloted, Used, Remaining, Percentage Used)
  const tableRows = useMemo(() => {
    if (activeSubTab === "comparison") {
      return subCatMonthlyComparisonData.list;
    }
    if (activeSubTab === "usage" && selectedSubCatName && selectedSubCatName !== "ALL") {
      return subCatUsagePlotData.list.map((d) => ({
        monthLabel: d.monthLabel,
        rawMonth: d.rawMonth,
        allotted: d.allotted,
        used: d.used,
        remaining: d.left,
        percentage: d.allotted > 0 ? Number(((d.used / d.allotted) * 100).toFixed(2)) : 0
      }));
    }
    return monthlyPlotData.map((d) => ({
      monthLabel: d.monthLabel,
      rawMonth: d.rawMonth,
      allotted: d.allotted,
      used: d.used,
      remaining: d.left,
      percentage: d.percentage
    }));
  }, [activeSubTab, selectedSubCatName, subCatMonthlyComparisonData, subCatUsagePlotData, monthlyPlotData]);

  const tableTotals = useMemo(() => {
    const totalAllotted = tableRows.reduce((sum, r) => sum + r.allotted, 0);
    const totalUsed = tableRows.reduce((sum, r) => sum + r.used, 0);
    const totalRemaining = tableRows.reduce((sum, r) => sum + r.remaining, 0);
    const overallPct = totalAllotted > 0 ? Number(((totalUsed / totalAllotted) * 100).toFixed(2)) : 0;
    return { totalAllotted, totalUsed, totalRemaining, overallPct };
  }, [tableRows]);

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

  const SubCatUsageTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-base-100/95 backdrop-blur-md border border-base-300 p-4 rounded-2xl shadow-xl space-y-2 min-w-[200px] text-xs">
          <p className="font-extrabold text-sm border-b border-base-200 pb-1.5 flex justify-between items-center">
            <span>{label}</span>
            <span className="text-[11px] opacity-60 font-mono">{selectedSubCatName}</span>
          </p>
          <div className="space-y-1.5 font-medium">
            <div className="flex justify-between items-center gap-4">
              <span className="text-base-content/70">Allotted:</span>
              <span className="font-mono font-bold text-primary">₹{(dataItem.allotted || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-base-content/70 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Used:
              </span>
              <span className="font-mono font-bold text-rose-500">₹{(dataItem.used || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-base-content/70 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Left:
              </span>
              <span className="font-mono font-bold text-emerald-500">₹{(dataItem.left || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-base-200">
              <span className="text-amber-500 font-bold">Range Avg:</span>
              <span className="font-mono font-bold text-amber-500">₹{Math.round(subCatUsagePlotData.avgUsage).toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const isInvalidRange = fromMonthStr > toMonthStr;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-[-17px] z-40 bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/40 -mx-4 px-4 py-2 mt-[-16px]">
        <div className="flex items-center justify-between p-3 flex-wrap gap-3 max-w-[1600px] mx-auto px-4 md:px-6">
          {/* Left: Category Dropdown & Title */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="dropdown dropdown-bottom">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost text-lg font-bold p-0 min-h-0 h-auto hover:bg-base-200/70 px-2.5 py-1 rounded-xl flex items-center gap-2 transition-all border border-base-300/40 shadow-xs"
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

      <div className="px-4 md:px-6 w-full max-w-[1600px] mx-auto space-y-6">

      {/* Date Range Error Alert */}
      {isInvalidRange && (
        <div className="alert alert-error shadow-sm text-xs font-bold rounded-2xl">
          <span>Invalid Date Range: "From" date ({fromMonthStr}) cannot be after "To" date ({toMonthStr}). Please adjust your selection.</span>
        </div>
      )}

      {/* Conditionally Render Credit Cards Dashboard OR Category / Salary Dashboard */}
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
                        ? "bg-primary text-primary-content shadow-sm"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                    }`}
                    onClick={() => setCardViewTab("graph")}
                  >
                    <BarChart3 size={15} /> Graph View
                  </button>
                  <button
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      cardViewTab === "table"
                        ? "bg-primary text-primary-content shadow-sm"
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
                    ? "bg-primary text-primary-content shadow-sm"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                }`}
                onClick={() => setMainCategoryTab("graph")}
              >
                <BarChart3 size={15} /> Graph View
              </button>
              <button
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  mainCategoryTab === "table"
                    ? "bg-primary text-primary-content shadow-sm"
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
                    ? "bg-secondary text-secondary-content shadow-sm"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                }`}
                onClick={() => setSubCategoryTab("graph")}
              >
                <BarChart3 size={15} /> Graph View
              </button>
              <button
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  subCategoryTab === "table"
                    ? "bg-secondary text-secondary-content shadow-sm"
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
    </div>
  );
};

export default ExpDashboard;
