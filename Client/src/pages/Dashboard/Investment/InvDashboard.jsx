import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import axiosInstance from "../../../Context/AxiosInstance";
import { TitleChanger } from "../../../utils/TitleChanger";
import Chart from "react-apexcharts";
import StocksDashboard from "../../../components/Dashboard/Investment/StocksDashboard";
import FixedDepositDashboard from "../../../components/Dashboard/Investment/FixedDepositDashboard";
import SelectDashboardModal, {
  DASHBOARDS_LIST,
} from "../../../components/Dashboard/Investment/SelectDashboardModal";
import {
  Banknote,
  TrendingUp,
  BarChart3,
  TableProperties,
  ChevronDown,
  ChevronRight,
  Calendar,
  LayoutGrid,
  Sparkles,
  RefreshCw,
  Building2,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  Percent,
  Wallet,
  Coins,
  CheckCircle2,
  Info,
  Filter,
  Palette,
  ExternalLink,
  Receipt,
  Briefcase,
  Landmark,
  PiggyBank,
  Plus,
  ArrowDownRight,
  FolderKanban,
  X,
  Search,
  Clock,
  Zap,
  PackageCheck
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
  { value: "12", label: "Dec" },
];

// Color Theme Options for Salary Stacked Bars
const SALARY_COLOR_THEMES = [
  { id: "emerald", label: "Emerald Green", hex: "#10b981", class: "bg-emerald-500 text-white" },
  { id: "indigo", label: "Indigo Blue", hex: "#6366f1", class: "bg-indigo-500 text-white" },
  { id: "sky", label: "Sky Cyan", hex: "#0284c7", class: "bg-sky-500 text-white" },
  { id: "purple", label: "Royal Purple", hex: "#8b5cf6", class: "bg-purple-500 text-white" },
  { id: "amber", label: "Warm Amber", hex: "#f59e0b", class: "bg-amber-500 text-white" },
];

const formatCurrency2Dec = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCurrencyCompact = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)} K`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

export default function InvDashboard() {
  TitleChanger("Progress Pulse | Investment Dashboard");

  // Raw salary data, PF withdrawals, Mutual Funds, Stock Trades, and Fixed Deposits from backend
  const [salaryData, setSalaryData] = useState([]);
  const [pfWithdrawals, setPfWithdrawals] = useState([]);
  const [mfData, setMfData] = useState([]);
  const [stocksData, setStocksData] = useState([]);
  const [fdData, setFdData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active dashboard view: "SALARY" | "PF" | "MF" | "STOCKS" | "FD" | "RD" (persisted in localStorage)
  const [activeDashboard, setActiveDashboard] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_active_view") || "SALARY";
  });

  // Dashboard Selection Modal Popup state
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);

  const handleSelectDashboard = (id) => {
    setActiveDashboard(id);
    localStorage.setItem("pulse_inv_dash_active_view", id);
    setIsDashboardModalOpen(false);
  };

  const currentDashboardMeta = useMemo(() => {
    return (
      DASHBOARDS_LIST.find((d) => d.id === activeDashboard) ||
      DASHBOARDS_LIST[0]
    );
  }, [activeDashboard]);

  // Active stock sub-view: "demat" | "delivery" | "intraday" (persisted in localStorage)
  const [stockSubView, setStockSubView] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_stock_view") || "demat";
  });

  // Selected Mutual Fund for filtering: "all", "group:<id>", or specific fund id (persisted in localStorage)
  const [selectedMfFund, setSelectedMfFund] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_mf_fund") || "all";
  });

  // Mutual Fund Custom Groups (synced from Table Entry & DB)
  const [mfGroups, setMfGroups] = useState(() => {
    try {
      const saved = localStorage.getItem("mf_custom_groups");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [collapsedMfDropdownGroups, setCollapsedMfDropdownGroups] = useState(new Set());

  const toggleMfDropdownGroup = (groupId) => {
    setCollapsedMfDropdownGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Mutual Fund Selection Modal popup state & search
  const [isMfModalOpen, setIsMfModalOpen] = useState(false);
  const [mfSearchQuery, setMfSearchQuery] = useState("");

  // Lock body scroll and handle Escape key for MF Modal Popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMfModalOpen) {
        setIsMfModalOpen(false);
      }
    };
    if (isMfModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMfModalOpen]);

  // MF Graph Metric Mode: "cashflow" | "nav" | "units" | "er" (persisted in localStorage)
  const [mfMetricMode, setMfMetricMode] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_mf_metric") || "cashflow";
  });

  // MF Table Sub-Tab: "transactions" | "funds"
  const [mfTableSubTab, setMfTableSubTab] = useState("transactions");

  // Current year default (Jan to Dec)
  const currentYearStr = dayjs().format("YYYY");

  // View switch: "graph" | "table" (persisted in localStorage)
  const [viewTab, setViewTab] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_view_tab") || "graph";
  });

  // PF sub-tab switch: "contributions" | "withdrawals"
  const [pfSubTab, setPfSubTab] = useState("contributions");

  // Color theme selection for the stacked bars (persisted in localStorage)
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_theme") || "emerald";
  });

  // Salary Component Distribution View: "earnings" | "deductions" | "overview" (persisted in localStorage)
  const [salaryComponentView, setSalaryComponentView] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_salary_comp_view") || "earnings";
  });

  // Active date preset: "all" | "this_year" | "last_12" | "last_6" | "custom"
  const [activePreset, setActivePreset] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_date_preset") || "all";
  });

  // Filter states: Default is current year (Jan to Dec), with user preferences stored in localStorage
  const [selectedCompany, setSelectedCompany] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_company") || "all";
  });
  const [fromYear, setFromYear] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_from_year") || currentYearStr;
  });
  const [fromMonth, setFromMonth] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_from_month") || "01";
  });
  const [toYear, setToYear] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_to_year") || currentYearStr;
  });
  const [toMonth, setToMonth] = useState(() => {
    return localStorage.getItem("pulse_inv_dash_to_month") || "12";
  });

  // Persist user preferences to localStorage
  useEffect(() => {
    if (activeDashboard) localStorage.setItem("pulse_inv_dash_active_view", activeDashboard);
  }, [activeDashboard]);

  useEffect(() => {
    if (salaryComponentView) localStorage.setItem("pulse_inv_dash_salary_comp_view", salaryComponentView);
  }, [salaryComponentView]);

  useEffect(() => {
    if (activePreset) localStorage.setItem("pulse_inv_dash_date_preset", activePreset);
  }, [activePreset]);

  useEffect(() => {
    if (stockSubView) localStorage.setItem("pulse_inv_dash_stock_view", stockSubView);
  }, [stockSubView]);

  useEffect(() => {
    if (selectedMfFund) localStorage.setItem("pulse_inv_dash_mf_fund", selectedMfFund);
  }, [selectedMfFund]);

  useEffect(() => {
    if (mfMetricMode) localStorage.setItem("pulse_inv_dash_mf_metric", mfMetricMode);
  }, [mfMetricMode]);

  useEffect(() => {
    if (fromYear) localStorage.setItem("pulse_inv_dash_from_year", fromYear);
  }, [fromYear]);

  useEffect(() => {
    if (fromMonth) localStorage.setItem("pulse_inv_dash_from_month", fromMonth);
  }, [fromMonth]);

  useEffect(() => {
    if (toYear) localStorage.setItem("pulse_inv_dash_to_year", toYear);
  }, [toYear]);

  useEffect(() => {
    if (toMonth) localStorage.setItem("pulse_inv_dash_to_month", toMonth);
  }, [toMonth]);

  useEffect(() => {
    if (selectedCompany) localStorage.setItem("pulse_inv_dash_company", selectedCompany);
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedTheme) localStorage.setItem("pulse_inv_dash_theme", selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    if (viewTab) localStorage.setItem("pulse_inv_dash_view_tab", viewTab);
  }, [viewTab]);

  // Table expanded rows state for Salary and PF
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [expandedPfMonths, setExpandedPfMonths] = useState(new Set());

  // Fetch Salaries, PF Withdrawals, Mutual Funds, Groups, Stocks, and Fixed Deposits from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [salaryRes, pfRes, mfRes, mfGroupsRes, stocksRes, fdRes] = await Promise.allSettled([
        axiosInstance.get("/v1/dashboard/investment/salary"),
        axiosInstance.get("/v1/dashboard/investment/pf/withdrawals"),
        axiosInstance.get("/v1/dashboard/investment/mf"),
        axiosInstance.get("/v1/dashboard/investment/mf-groups"),
        axiosInstance.get("/v1/dashboard/investment/stocks"),
        axiosInstance.get("/v1/dashboard/investment/fd"),
      ]);

      if (salaryRes.status === "fulfilled" && salaryRes.value.data?.success) {
        setSalaryData(salaryRes.value.data.data || []);
      }
      if (pfRes.status === "fulfilled" && pfRes.value.data?.success) {
        setPfWithdrawals(pfRes.value.data.data || []);
      }
      if (mfRes.status === "fulfilled" && mfRes.value.data?.success) {
        setMfData(mfRes.value.data.data || []);
      }
      if (mfGroupsRes.status === "fulfilled" && mfGroupsRes.value.data?.success) {
        const dbGroups = mfGroupsRes.value.data.data || [];
        if (dbGroups.length > 0) {
          setMfGroups(dbGroups);
        }
      }
      if (stocksRes.status === "fulfilled" && stocksRes.value.data?.success) {
        setStocksData(stocksRes.value.data.data || []);
      }
      if (fdRes.status === "fulfilled" && fdRes.value.data?.success) {
        setFdData(fdRes.value.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch investment dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Available Companies for filter
  const companiesList = useMemo(() => {
    return Array.from(new Set(salaryData.map((s) => s.company).filter(Boolean))).sort();
  }, [salaryData]);

  // Available Years for filter dropdowns
  const availableYears = useMemo(() => {
    const yearsSet = new Set(salaryData.map((s) => s.month?.slice(0, 4)).filter(Boolean));
    pfWithdrawals.forEach((w) => {
      if (w.date) yearsSet.add(dayjs(w.date).format("YYYY"));
    });
    mfData.forEach((f) => {
      (f.transactions || []).forEach((t) => {
        if (t.date) yearsSet.add(dayjs(t.date).format("YYYY"));
      });
    });
    stocksData.forEach((s) => {
      if (s.bDate) yearsSet.add(dayjs(s.bDate).format("YYYY"));
      if (s.sDate && s.sDate !== "-") yearsSet.add(dayjs(s.sDate).format("YYYY"));
    });
    const currentYear = dayjs().format("YYYY");
    yearsSet.add(currentYear);
    if (fromYear) yearsSet.add(fromYear);
    if (toYear) yearsSet.add(toYear);
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [salaryData, pfWithdrawals, mfData, stocksData, fromYear, toYear]);

  // Quick Range Selection Handlers
  const handleQuickRange = (type) => {
    setActivePreset(type);
    const currentY = dayjs().format("YYYY");
    const currentM = dayjs().format("MM");

    if (type === "all") {
      // For SALARY or PF, reset company to "all" so the user sees complete data across all employers
      if (activeDashboard === "SALARY" || activeDashboard === "PF") {
        setSelectedCompany("all");
      }
      const allMonths = [
        ...salaryData.map((s) => s.month).filter(Boolean),
        ...pfWithdrawals.map((w) => (w.date ? dayjs(w.date).format("YYYY-MM") : null)).filter(Boolean),
        ...mfData.flatMap((f) =>
          (f.transactions || []).map((t) => (t.date ? dayjs(t.date).format("YYYY-MM") : null))
        ).filter(Boolean),
        ...stocksData.map((s) => (s.bDate ? dayjs(s.bDate).format("YYYY-MM") : null)).filter(Boolean),
        ...stocksData.map((s) => (s.sDate && s.sDate !== "-" ? dayjs(s.sDate).format("YYYY-MM") : null)).filter(Boolean),
      ].sort();
      if (allMonths.length > 0) {
        const startY = allMonths[0].slice(0, 4);
        const endY = allMonths[allMonths.length - 1].slice(0, 4);
        setFromYear(startY);
        setFromMonth("01");
        setToYear(endY);
        setToMonth("12");
      } else {
        setFromYear("2020");
        setFromMonth("01");
        setToYear(currentY);
        setToMonth("12");
      }
    } else if (type === "this_year") {
      setFromYear(currentY);
      setFromMonth("01");
      setToYear(currentY);
      setToMonth("12");
    } else if (type === "last_12") {
      const fromD = dayjs().subtract(11, "month");
      setFromYear(fromD.format("YYYY"));
      setFromMonth(fromD.format("MM"));
      setToYear(currentY);
      setToMonth(currentM);
    } else if (type === "last_6") {
      const fromD = dayjs().subtract(5, "month");
      setFromYear(fromD.format("YYYY"));
      setFromMonth(fromD.format("MM"));
      setToYear(currentY);
      setToMonth(currentM);
    }
  };

  const fromMonthStr = `${fromYear}-${fromMonth}`;
  const toMonthStr = `${toYear}-${toMonth}`;
  const isInvalidRange = useMemo(() => {
    if (!fromMonthStr || !toMonthStr) return false;
    return fromMonthStr > toMonthStr;
  }, [fromMonthStr, toMonthStr]);

  // Filtered Salary Records based on Company & Date Range
  const filteredSalaries = useMemo(() => {
    return salaryData.filter((item) => {
      const itemMonth = item.month || "";
      if (fromMonthStr && itemMonth < fromMonthStr) return false;
      if (toMonthStr && itemMonth > toMonthStr) return false;
      if (selectedCompany !== "all" && item.company !== selectedCompany) return false;
      return true;
    });
  }, [salaryData, fromMonthStr, toMonthStr, selectedCompany]);

  // Aggregated Monthly Plot Data (sorted chronologically ascending for the chart)
  const monthlyPlotData = useMemo(() => {
    const monthMap = new Map();

    filteredSalaries.forEach((s) => {
      const monthKey = s.month;
      if (!monthKey) return;

      const basic = Number(s.basicSalary) || 0;
      const hra = Number(s.hra) || 0;
      const flexi = Number(s.flexi) || 0;
      const bonus = Number(s.bonus) || 0;
      const gratuity = Number(s.gratuity) || 0;
      const variablePay = Number(s.variablePay) || 0;
      const erPf = Number(s.erPf) || 0;
      const taxes = Number(s.taxes) || 0;
      const deductions = erPf + taxes;

      const gross = Number(s.gross) || basic + hra + flexi + bonus;
      const earnings = gross + gratuity + variablePay;
      const inHand = Number(s.inHand) || gross - deductions;
      const ctc = Number(s.ctc) || earnings + erPf;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          rawMonth: monthKey,
          monthLabel: dayjs(monthKey).format("MMM YYYY"),
          companies: [s.company].filter(Boolean),
          inHand: 0,
          deductions: 0,
          gross: 0,
          earnings: 0,
          ctc: 0,
          erPf: 0,
          taxes: 0,
          basic: 0,
          hra: 0,
          flexi: 0,
          bonus: 0,
          gratuity: 0,
          variablePay: 0,
          records: [],
        });
      }

      const item = monthMap.get(monthKey);
      if (s.company && !item.companies.includes(s.company)) {
        item.companies.push(s.company);
      }
      item.inHand += inHand;
      item.deductions += deductions;
      item.gross += gross;
      item.earnings += earnings;
      item.ctc += ctc;
      item.erPf += erPf;
      item.taxes += taxes;
      item.basic += basic;
      item.hra += hra;
      item.flexi += flexi;
      item.bonus += bonus;
      item.gratuity += gratuity;
      item.variablePay += variablePay;
      item.records.push(s);
    });

    // Chronological order (earliest to latest)
    return Array.from(monthMap.values()).sort((a, b) => a.rawMonth.localeCompare(b.rawMonth));
  }, [filteredSalaries]);

  // KPI Overall Totals
  const kpiSummary = useMemo(() => {
    let totalInHand = 0;
    let totalDeductions = 0;
    let totalGross = 0;
    let totalEarnings = 0;
    let totalCtc = 0;
    let totalErPf = 0;
    let totalTaxes = 0;

    monthlyPlotData.forEach((m) => {
      totalInHand += m.inHand;
      totalDeductions += m.deductions;
      totalGross += m.gross;
      totalEarnings += m.earnings;
      totalCtc += m.ctc;
      totalErPf += m.erPf;
      totalTaxes += m.taxes;
    });

    const monthsCount = monthlyPlotData.length;
    const avgMonthlyInHand = monthsCount > 0 ? Math.round(totalInHand / monthsCount) : 0;
    const avgMonthlyGross = monthsCount > 0 ? Math.round(totalGross / monthsCount) : 0;
    const overallTakeHomePct = totalGross > 0 ? (totalInHand / totalGross) * 100 : 0;
    const overallDeductionPct = totalGross > 0 ? (totalDeductions / totalGross) * 100 : 0;

    // Experience span calculation
    const expYears = Math.floor(monthsCount / 12);
    const expMonths = monthsCount % 12;
    let expText = "0 Months";
    if (expYears > 0 && expMonths > 0) {
      expText = `${expYears} ${expYears === 1 ? "Year" : "Years"} ${expMonths} ${expMonths === 1 ? "Mo" : "Mos"}`;
    } else if (expYears > 0) {
      expText = `${expYears} ${expYears === 1 ? "Year" : "Years"}`;
    } else if (expMonths > 0) {
      expText = `${expMonths} ${expMonths === 1 ? "Month" : "Months"}`;
    }

    return {
      totalInHand,
      totalDeductions,
      totalGross,
      totalEarnings,
      totalCtc,
      totalErPf,
      totalTaxes,
      avgMonthlyInHand,
      avgMonthlyGross,
      overallTakeHomePct,
      overallDeductionPct,
      monthsCount,
      expText,
    };
  }, [monthlyPlotData]);

  // Selected Theme Color Hex
  const currentThemeObj = useMemo(() => {
    return SALARY_COLOR_THEMES.find((t) => t.id === selectedTheme) || SALARY_COLOR_THEMES[0];
  }, [selectedTheme]);

  // Dynamic Chart Colors based on Salary Component View
  const chartColors = useMemo(() => {
    if (salaryComponentView === "earnings") {
      const colors = ["#10b981", "#06b6d4", "#3b82f6"]; // Basic (Emerald), HRA (Cyan), Flexi (Blue)
      if (monthlyPlotData.some((m) => m.bonus > 0)) colors.push("#f59e0b"); // Bonus (Amber)
      if (monthlyPlotData.some((m) => m.variablePay > 0)) colors.push("#8b5cf6"); // Variable Pay (Purple)
      if (monthlyPlotData.some((m) => m.gratuity > 0)) colors.push("#ec4899"); // Gratuity (Pink)
      colors.push("#10b981"); // Total Earnings trend line
      return colors;
    }
    if (salaryComponentView === "deductions") {
      return ["#f97316", "#ef4444", "#f43f5e"]; // PF (Orange), Taxes (Red), Total Deductions line (Rose)
    }
    // Overview (In-Hand vs Deductions)
    return ["#10b981", "#ef4444", "#38bdf8"]; // In-Hand (Emerald), Deductions (Red), Total CTC (Sky)
  }, [salaryComponentView, monthlyPlotData]);

  // ApexCharts Series Data based on Component Distribution
  const apexSeries = useMemo(() => {
    if (salaryComponentView === "earnings") {
      const series = [
        {
          name: "Basic Salary",
          type: "bar",
          data: monthlyPlotData.map((m) => m.basic),
        },
        {
          name: "HRA",
          type: "bar",
          data: monthlyPlotData.map((m) => m.hra),
        },
        {
          name: "Flexi / Allowances",
          type: "bar",
          data: monthlyPlotData.map((m) => m.flexi),
        },
      ];
      if (monthlyPlotData.some((m) => m.bonus > 0)) {
        series.push({
          name: "Bonus & Incentives",
          type: "bar",
          data: monthlyPlotData.map((m) => m.bonus),
        });
      }
      if (monthlyPlotData.some((m) => m.variablePay > 0)) {
        series.push({
          name: "Variable Pay",
          type: "bar",
          data: monthlyPlotData.map((m) => m.variablePay),
        });
      }
      if (monthlyPlotData.some((m) => m.gratuity > 0)) {
        series.push({
          name: "Gratuity",
          type: "bar",
          data: monthlyPlotData.map((m) => m.gratuity),
        });
      }
      series.push({
        name: "Total Earnings",
        type: "line",
        data: monthlyPlotData.map((m) => m.earnings),
      });
      return series;
    }

    if (salaryComponentView === "deductions") {
      return [
        {
          name: "Employer PF",
          type: "bar",
          data: monthlyPlotData.map((m) => m.erPf),
        },
        {
          name: "Taxes & Statutory",
          type: "bar",
          data: monthlyPlotData.map((m) => m.taxes),
        },
        {
          name: "Total Deductions",
          type: "line",
          data: monthlyPlotData.map((m) => m.deductions),
        },
      ];
    }

    // Default: "overview"
    return [
      {
        name: "In Hand Salary",
        type: "bar",
        data: monthlyPlotData.map((m) => m.inHand),
      },
      {
        name: "Total Deductions",
        type: "bar",
        data: monthlyPlotData.map((m) => m.deductions),
      },
      {
        name: "Total CTC",
        type: "line",
        data: monthlyPlotData.map((m) => m.ctc),
      },
    ];
  }, [monthlyPlotData, salaryComponentView]);

  // ApexCharts Options for Salary Breakdown
  const apexOptions = useMemo(() => {
    const strokeWidths = apexSeries.map((s) => (s.type === "line" ? 2.5 : 0));
    const fillOpacities = apexSeries.map((s) => (s.type === "line" ? 1 : 0.88));
    const markerSizes = apexSeries.map((s) => (s.type === "line" ? 4.5 : 0));

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
          speed: 700,
        },
      },
      colors: chartColors,
      stroke: {
        width: strokeWidths,
        curve: "smooth",
        dashArray: strokeWidths.map(() => 0),
      },
      fill: {
        opacity: fillOpacities,
      },
      plotOptions: {
        bar: {
          columnWidth: "62%",
          borderRadius: 4,
          borderRadiusApplication: "end",
          dataLabels: { position: "top" },
          distributed: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: markerSizes,
        strokeColor: "#1e293b",
        strokeWidth: 2,
        hover: { size: 7 },
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#FFFFFF" },
        markers: {
          fillColors: chartColors,
          radius: 12,
        },
        itemMargin: { horizontal: 14, vertical: 8 },
        onItemClick: {
          toggleDataSeries: true,
        },
        onItemHover: {
          highlightDataSeries: true,
        },
      },
      xaxis: {
        categories: monthlyPlotData.map((m) => m.monthLabel),
        labels: {
          style: { colors: "#FFFFFF", fontSize: "11px", fontWeight: "600" },
          rotate: -45,
        },
        axisBorder: { color: "#888" },
        axisTicks: { color: "#888" },
        title: {
          text: "Months",
          style: { color: "#FFFFFF", fontSize: "11px", fontWeight: "700" },
        },
      },
      yaxis: [
        {
          title: {
            text:
              salaryComponentView === "earnings"
                ? "Earnings Components (₹)"
                : salaryComponentView === "deductions"
                ? "Deductions (₹)"
                : "Salary & Compensation (₹)",
            style: { color: "#FFFFFF", fontSize: "11px", fontWeight: "700" },
          },
          labels: {
            style: { colors: "#FFFFFF", fontSize: "11px" },
            formatter: (v) => formatCurrencyCompact(v),
          },
        },
      ],
      grid: {
        show: true,
        borderColor: "#444",
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      // Interactive Custom HTML Glassmorphic Tooltip
      tooltip: {
        theme: "dark",
        shared: true,
        intersect: false,
        custom: function ({ dataPointIndex }) {
          const item = monthlyPlotData[dataPointIndex];
          if (!item) return "";

          const monthLabel = item.monthLabel;
          const companyStr = item.companies.join(", ") || "Company";

          if (salaryComponentView === "earnings") {
            return `
              <div class="space-y-3 min-w-[280px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.20); padding: 14px 18px; border-radius: 18px; box-shadow: 0 20px 30px -8px rgba(0, 0, 0, 0.45); font-size: 12px; font-family: inherit; color: #f8fafc;">
                <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-weight: 800; font-size: 13.5px; color: #ffffff; display: block;">${monthLabel}</span>
                    <span style="font-size: 10.5px; opacity: 0.75; color: #cbd5e1;">${companyStr}</span>
                  </div>
                  <span style="background: rgba(16, 185, 129, 0.25); border: 1px solid rgba(16, 185, 129, 0.45); color: #34d399; font-weight: 700; font-size: 10.5px; padding: 2.5px 8px; border-radius: 9999px;">
                    Earnings: ₹${formatCurrency2Dec(item.earnings)}
                  </span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px; font-weight: 500;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 7px; color: #e2e8f0;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                      Basic Salary:
                    </span>
                    <span style="font-family: monospace; font-weight: 700; color: #f1f5f9;">₹${formatCurrency2Dec(item.basic)}</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 7px; color: #e2e8f0;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; display: inline-block;"></span>
                      HRA:
                    </span>
                    <span style="font-family: monospace; font-weight: 700; color: #f1f5f9;">₹${formatCurrency2Dec(item.hra)}</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 7px; color: #e2e8f0;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
                      Flexi / Allowances:
                    </span>
                    <span style="font-family: monospace; font-weight: 700; color: #f1f5f9;">₹${formatCurrency2Dec(item.flexi)}</span>
                  </div>

                  ${item.bonus > 0 ? `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 7px; color: #e2e8f0;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
                      Bonus:
                    </span>
                    <span style="font-family: monospace; font-weight: 700; color: #f59e0b;">₹${formatCurrency2Dec(item.bonus)}</span>
                  </div>` : ""}

                  ${item.variablePay > 0 ? `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 7px; color: #e2e8f0;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6; display: inline-block;"></span>
                      Variable Pay:
                    </span>
                    <span style="font-family: monospace; font-weight: 700; color: #c084fc;">₹${formatCurrency2Dec(item.variablePay)}</span>
                  </div>` : ""}

                  ${item.gratuity > 0 ? `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 7px; color: #e2e8f0;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: #ec4899; display: inline-block;"></span>
                      Gratuity:
                    </span>
                    <span style="font-family: monospace; font-weight: 700; color: #f472b6;">₹${formatCurrency2Dec(item.gratuity)}</span>
                  </div>` : ""}
                </div>

                <div style="border-top: 1px solid rgba(255, 255, 255, 0.12); margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: 700;">
                  <span style="color: #94a3b8; font-size: 11px;">Total CTC:</span>
                  <span style="font-family: monospace; color: #38bdf8;">₹${formatCurrency2Dec(item.ctc)}</span>
                </div>
              </div>
            `;
          }

          if (salaryComponentView === "deductions") {
            return `
              <div class="space-y-3 min-w-[280px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.20); padding: 14px 18px; border-radius: 18px; box-shadow: 0 20px 30px -8px rgba(0, 0, 0, 0.45); font-size: 12px; font-family: inherit; color: #f8fafc;">
                <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-weight: 800; font-size: 13.5px; color: #ffffff; display: block;">${monthLabel}</span>
                    <span style="font-size: 10.5px; opacity: 0.75; color: #cbd5e1;">${companyStr}</span>
                  </div>
                  <span style="background: rgba(239, 68, 68, 0.25); border: 1px solid rgba(239, 68, 68, 0.45); color: #f87171; font-weight: 700; font-size: 10.5px; padding: 2.5px 8px; border-radius: 9999px;">
                    Deductions: ₹${formatCurrency2Dec(item.deductions)}
                  </span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px; font-weight: 500;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 7px; color: #e2e8f0;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: #f97316; display: inline-block;"></span>
                      Employer PF:
                    </span>
                    <span style="font-family: monospace; font-weight: 700; color: #fb923c;">₹${formatCurrency2Dec(item.erPf)}</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 7px; color: #e2e8f0;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
                      Taxes & Statutory:
                    </span>
                    <span style="font-family: monospace; font-weight: 700; color: #f87171;">₹${formatCurrency2Dec(item.taxes)}</span>
                  </div>
                </div>

                <div style="border-top: 1px solid rgba(255, 255, 255, 0.12); margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: 700;">
                  <span style="color: #94a3b8; font-size: 11px;">In Hand Salary:</span>
                  <span style="font-family: monospace; color: #34d399;">₹${formatCurrency2Dec(item.inHand)}</span>
                </div>
              </div>
            `;
          }

          // Overview tooltip
          const inHand = item.inHand;
          const deductions = item.deductions;
          const gross = item.gross;
          const ctc = item.ctc;
          const erPf = item.erPf;
          const taxes = item.taxes;
          const takeHomePct = gross > 0 ? ((inHand / gross) * 100).toFixed(1) : "0.0";

          return `
            <div class="space-y-3 min-w-[270px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.20); padding: 14px 18px; border-radius: 18px; box-shadow: 0 20px 30px -8px rgba(0, 0, 0, 0.45); min-width: 270px; font-size: 12px; font-family: inherit; color: #f8fafc;">
              <div class="border-b pb-2 flex justify-between items-center" style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="font-extrabold text-sm text-white block" style="font-weight: 800; font-size: 13.5px; color: #ffffff;">${monthLabel}</span>
                  <span class="text-[11px] opacity-75 font-medium" style="font-size: 10.5px; opacity: 0.75; color: #cbd5e1;">${companyStr}</span>
                </div>
                <span class="badge badge-sm font-bold text-[10.5px] px-2.5 py-1 rounded-full" style="background: rgba(16, 185, 129, 0.25); border: 1px solid rgba(16, 185, 129, 0.45); color: #34d399; font-weight: 700;">
                  ${takeHomePct}% Take-Home
                </span>
              </div>

              <div class="space-y-2 font-medium" style="display: flex; flex-direction: column; gap: 7px; font-weight: 500;">
                <!-- In Hand Salary -->
                <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                  <span class="flex items-center gap-1.5 truncate" style="display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: #e2e8f0;">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #10b981; display: inline-block; flex-shrink: 0; box-shadow: 0 0 8px #10b98188;"></span>
                    <span class="font-semibold">In Hand Salary:</span>
                  </span>
                  <span class="font-mono font-extrabold" style="font-family: monospace; font-weight: 800; color: #10b981; font-size: 12px; white-space: nowrap;">₹${formatCurrency2Dec(inHand)}</span>
                </div>

                <!-- Total Deductions -->
                <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                  <span class="flex items-center gap-1.5 truncate" style="display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: #e2e8f0;">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #ef4444; opacity: 0.45; border: 1px solid #ef4444; display: inline-block; flex-shrink: 0;"></span>
                    <span class="font-semibold">Total Deductions:</span>
                  </span>
                  <span class="font-mono font-bold" style="font-family: monospace; font-weight: 700; color: #f87171; font-size: 12px; white-space: nowrap;">₹${formatCurrency2Dec(deductions)}</span>
                </div>

                <!-- Sub-deduction details -->
                <div class="pl-4 text-[10.5px] opacity-70 space-y-1" style="padding-left: 17px; font-size: 10.5px; opacity: 0.75; display: flex; flex-direction: column; gap: 3px; color: #cbd5e1;">
                  <div class="flex justify-between" style="display: flex; justify-content: space-between;">
                    <span>PF (Employer):</span>
                    <span class="font-mono">₹${formatCurrency2Dec(erPf)}</span>
                  </div>
                  <div class="flex justify-between" style="display: flex; justify-content: space-between;">
                    <span>Taxes & Special:</span>
                    <span class="font-mono">₹${formatCurrency2Dec(taxes)}</span>
                  </div>
                </div>

                <!-- Divider -->
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.12); margin-top: 4px; padding-top: 6px;">
                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 4px;">
                    <span class="text-base-content/80" style="color: #94a3b8; font-size: 11px;">Gross Salary:</span>
                    <span class="font-mono font-bold" style="font-family: monospace; font-size: 11.5px; color: #f1f5f9;">₹${formatCurrency2Dec(gross)}</span>
                  </div>

                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; font-weight: 800;">
                    <span class="flex items-center gap-1.5" style="display: flex; align-items: center; gap: 7px; color: #38bdf8; font-size: 11.5px;">
                      <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #38bdf8; display: inline-block; flex-shrink: 0;"></span>
                      Total CTC:
                    </span>
                    <span class="font-mono font-bold" style="font-family: monospace; color: #38bdf8; font-size: 12.5px; font-weight: 800;">₹${formatCurrency2Dec(ctc)}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        },
      },
    };
  }, [monthlyPlotData, salaryComponentView, chartColors, apexSeries]);

  // Expand / Collapse Table Months
  const toggleExpandMonth = (rawMonth) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(rawMonth)) next.delete(rawMonth);
      else next.add(rawMonth);
      return next;
    });
  };

  const expandAllMonths = () => {
    setExpandedMonths(new Set(monthlyPlotData.map((m) => m.rawMonth)));
  };

  const collapseAllMonths = () => {
    setExpandedMonths(new Set());
  };

  // Table rows sorted descending (latest month first for table browsing)
  const tableDataDescending = useMemo(() => {
    return [...monthlyPlotData].sort((a, b) => b.rawMonth.localeCompare(a.rawMonth));
  }, [monthlyPlotData]);

  // ----------------------------------------------------------------------
  // PROVIDENT FUND (PF) COMPUTATIONS & METRICS
  // ----------------------------------------------------------------------

  // All unique timeline months across history (for running balance)
  const allTimelineMonths = useMemo(() => {
    const mSet = new Set();
    salaryData.forEach((s) => {
      if (s.month) mSet.add(s.month);
    });
    pfWithdrawals.forEach((w) => {
      if (w.date) mSet.add(dayjs(w.date).format("YYYY-MM"));
    });
    return Array.from(mSet).sort();
  }, [salaryData, pfWithdrawals]);

  // Monthly breakdown and cumulative balance map across entire history
  const { monthlyCumulativeBalanceMap, depositsByMonthMap, withdrawalsByMonthMap } = useMemo(() => {
    const depMap = new Map();
    const withMap = new Map();

    salaryData.forEach((s) => {
      if (!s.month) return;
      if (selectedCompany !== "all" && s.company !== selectedCompany) return;
      const er = Number(s.erPf) || 0;
      const ee = s.eePf !== undefined && s.eePf !== null && s.eePf !== "" ? Number(s.eePf) || 0 : er;
      depMap.set(s.month, (depMap.get(s.month) || 0) + er + ee);
    });

    pfWithdrawals.forEach((w) => {
      if (!w.date) return;
      const m = dayjs(w.date).format("YYYY-MM");
      withMap.set(m, (withMap.get(m) || 0) + (Number(w.amount) || 0));
    });

    let running = 0;
    const cumMap = new Map();
    allTimelineMonths.forEach((m) => {
      const dep = depMap.get(m) || 0;
      const wit = withMap.get(m) || 0;
      running = Math.max(0, running + dep - wit);
      cumMap.set(m, running);
    });

    return {
      monthlyCumulativeBalanceMap: cumMap,
      depositsByMonthMap: depMap,
      withdrawalsByMonthMap: withMap,
    };
  }, [salaryData, pfWithdrawals, selectedCompany, allTimelineMonths]);

  // Overall All-Time PF Totals
  const allTimePfDeposited = useMemo(() => {
    return salaryData
      .filter((s) => selectedCompany === "all" || s.company === selectedCompany)
      .reduce((sum, s) => {
        const er = Number(s.erPf) || 0;
        const ee = s.eePf !== undefined && s.eePf !== null && s.eePf !== "" ? Number(s.eePf) || 0 : er;
        return sum + er + ee;
      }, 0);
  }, [salaryData, selectedCompany]);

  const allTimePfWithdrawn = useMemo(() => {
    return pfWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  }, [pfWithdrawals]);

  const allTimeAvailablePfBalance = useMemo(() => {
    return Math.max(0, allTimePfDeposited - allTimePfWithdrawn);
  }, [allTimePfDeposited, allTimePfWithdrawn]);

  // PF Monthly Data filtered by Date Range and Company
  const pfMonthlyPlotData = useMemo(() => {
    const monthMap = new Map();

    filteredSalaries.forEach((s) => {
      const monthKey = s.month;
      if (!monthKey) return;

      const er = Number(s.erPf) || 0;
      const ee = s.eePf !== undefined && s.eePf !== null && s.eePf !== "" ? Number(s.eePf) || 0 : er;
      const total = er + ee;
      const basic = Number(s.basicSalary) || 0;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          rawMonth: monthKey,
          monthLabel: dayjs(monthKey).format("MMM YYYY"),
          companies: [s.company].filter(Boolean),
          erPf: 0,
          eePf: 0,
          totalDeposit: 0,
          withdrawn: withdrawalsByMonthMap.get(monthKey) || 0,
          cumulativeBalance: monthlyCumulativeBalanceMap.get(monthKey) || 0,
          basicSalary: 0,
          records: [],
        });
      }

      const item = monthMap.get(monthKey);
      if (s.company && !item.companies.includes(s.company)) {
        item.companies.push(s.company);
      }
      item.erPf += er;
      item.eePf += ee;
      item.totalDeposit += total;
      item.basicSalary += basic;
      item.records.push(s);
    });

    // Also include months in the date range with withdrawals even if no salary entry was made
    allTimelineMonths.forEach((m) => {
      if (fromMonthStr && m < fromMonthStr) return;
      if (toMonthStr && m > toMonthStr) return;
      const wit = withdrawalsByMonthMap.get(m) || 0;
      if (wit > 0 && !monthMap.has(m)) {
        monthMap.set(m, {
          rawMonth: m,
          monthLabel: dayjs(m).format("MMM YYYY"),
          companies: [],
          erPf: 0,
          eePf: 0,
          totalDeposit: 0,
          withdrawn: wit,
          cumulativeBalance: monthlyCumulativeBalanceMap.get(m) || 0,
          basicSalary: 0,
          records: [],
        });
      }
    });

    return Array.from(monthMap.values()).sort((a, b) => a.rawMonth.localeCompare(b.rawMonth));
  }, [
    filteredSalaries,
    withdrawalsByMonthMap,
    monthlyCumulativeBalanceMap,
    allTimelineMonths,
    fromMonthStr,
    toMonthStr,
  ]);

  // PF KPI Summary
  const pfKpiSummary = useMemo(() => {
    let periodErPf = 0;
    let periodEePf = 0;
    let periodTotalDeposit = 0;
    let periodWithdrawn = 0;

    pfMonthlyPlotData.forEach((m) => {
      periodErPf += m.erPf;
      periodEePf += m.eePf;
      periodTotalDeposit += m.totalDeposit;
      periodWithdrawn += m.withdrawn;
    });

    const activeMonths = pfMonthlyPlotData.filter((m) => m.totalDeposit > 0).length;
    const avgMonthlyDeposit = activeMonths > 0 ? Math.round(periodTotalDeposit / activeMonths) : 0;

    return {
      allTimeAvailablePfBalance,
      allTimePfDeposited,
      allTimePfWithdrawn,
      periodErPf,
      periodEePf,
      periodTotalDeposit,
      periodWithdrawn,
      activeMonths,
      avgMonthlyDeposit,
      totalWithdrawalCount: pfWithdrawals.length,
    };
  }, [pfMonthlyPlotData, allTimeAvailablePfBalance, allTimePfDeposited, allTimePfWithdrawn, pfWithdrawals]);

  // Filtered PF Withdrawals for Table View
  const filteredPfWithdrawals = useMemo(() => {
    return pfWithdrawals
      .filter((item) => {
        if (!item.date) return true;
        const itemMonth = dayjs(item.date).format("YYYY-MM");
        if (fromMonthStr && itemMonth < fromMonthStr) return false;
        if (toMonthStr && itemMonth > toMonthStr) return false;
        return true;
      })
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  }, [pfWithdrawals, fromMonthStr, toMonthStr]);

  // PF ApexCharts Series Data
  const pfApexSeries = useMemo(() => {
    return [
      {
        name: "Employee Share (EE PF)",
        type: "bar",
        data: pfMonthlyPlotData.map((m) => m.eePf),
      },
      {
        name: "Employer Share (ER PF)",
        type: "bar",
        data: pfMonthlyPlotData.map((m) => m.erPf),
      },
      {
        name: "Cumulative PF Balance",
        type: "line",
        data: pfMonthlyPlotData.map((m) => m.cumulativeBalance),
      },
    ];
  }, [pfMonthlyPlotData]);

  // PF ApexCharts Options mirroring the exact requested design
  const pfApexOptions = useMemo(() => {
    const themeColor = currentThemeObj.hex;
    const lineTrendColor = "#38bdf8"; // Sky Blue for Cumulative Net PF Balance line

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
          speed: 700,
        },
      },
      // Same color hue for Employee & Employer shares, Sky Blue for Cumulative balance
      colors: [themeColor, themeColor, lineTrendColor],
      stroke: {
        width: [0, 0, 2.5],
        curve: "smooth",
        dashArray: [0, 0, 0],
      },
      fill: {
        // Employee Share full opacity, Employer Share lower opacity (0.35)
        opacity: [0.95, 0.35, 1],
      },
      plotOptions: {
        bar: {
          columnWidth: "62%",
          borderRadius: 4,
          borderRadiusApplication: "end",
          dataLabels: { position: "top" },
          distributed: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: [0, 0, 4.5],
        strokeColor: "#1e293b",
        strokeWidth: 2,
        hover: { size: 7 },
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#FFFFFF" },
        markers: {
          fillColors: [themeColor, themeColor, lineTrendColor],
          radius: 12,
        },
        itemMargin: { horizontal: 14, vertical: 8 },
        onItemClick: {
          toggleDataSeries: true,
        },
        onItemHover: {
          highlightDataSeries: true,
        },
      },
      xaxis: {
        categories: pfMonthlyPlotData.map((m) => m.monthLabel),
        labels: {
          style: { colors: "#FFFFFF", fontSize: "11px", fontWeight: "600" },
          rotate: -45,
        },
        axisBorder: { color: "#888" },
        axisTicks: { color: "#888" },
        title: {
          text: "Months",
          style: { color: "#FFFFFF", fontSize: "11px", fontWeight: "700" },
        },
      },
      yaxis: [
        {
          title: {
            text: "Provident Fund (₹)",
            style: { color: "#FFFFFF", fontSize: "11px", fontWeight: "700" },
          },
          labels: {
            style: { colors: "#FFFFFF", fontSize: "11px" },
            formatter: (v) => formatCurrencyCompact(v),
          },
        },
      ],
      grid: {
        show: true,
        borderColor: "#444",
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      // Interactive Custom Glassmorphic Tooltip
      tooltip: {
        theme: "dark",
        shared: true,
        intersect: false,
        custom: function ({ dataPointIndex }) {
          const item = pfMonthlyPlotData[dataPointIndex];
          if (!item) return "";

          const monthLabel = item.monthLabel;
          const companyStr = item.companies.length > 0 ? item.companies.join(", ") : "EPF Contribution";
          const eePf = item.eePf;
          const erPf = item.erPf;
          const totalDeposit = item.totalDeposit;
          const withdrawn = item.withdrawn;
          const cumulativeBalance = item.cumulativeBalance;

          return `
            <div class="space-y-3 min-w-[280px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.20); padding: 14px 18px; border-radius: 18px; box-shadow: 0 20px 30px -8px rgba(0, 0, 0, 0.45); min-width: 280px; font-size: 12px; font-family: inherit; color: #f8fafc;">
              <div class="border-b pb-2 flex justify-between items-center" style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="font-extrabold text-sm text-white block" style="font-weight: 800; font-size: 13.5px; color: #ffffff;">${monthLabel}</span>
                  <span class="text-[11px] opacity-75 font-medium" style="font-size: 10.5px; opacity: 0.75; color: #cbd5e1;">${companyStr}</span>
                </div>
                <span class="badge badge-sm font-bold text-[10.5px] px-2.5 py-1 rounded-full" style="background: rgba(16, 185, 129, 0.25); border: 1px solid rgba(16, 185, 129, 0.45); color: #34d399; font-weight: 700;">
                  +₹${formatCurrencyCompact(totalDeposit)} Added
                </span>
              </div>

              <div class="space-y-2 font-medium" style="display: flex; flex-direction: column; gap: 7px; font-weight: 500;">
                <!-- Employee Share -->
                <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                  <span class="flex items-center gap-1.5 truncate" style="display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: #e2e8f0;">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${themeColor}; display: inline-block; flex-shrink: 0; box-shadow: 0 0 8px ${themeColor}88;"></span>
                    <span class="font-semibold">Employee Share (EE):</span>
                  </span>
                  <span class="font-mono font-extrabold" style="font-family: monospace; font-weight: 800; color: ${themeColor}; font-size: 12px; white-space: nowrap;">₹${formatCurrency2Dec(eePf)}</span>
                </div>

                <!-- Employer Share -->
                <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                  <span class="flex items-center gap-1.5 truncate" style="display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: #e2e8f0;">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${themeColor}; opacity: 0.45; border: 1px solid ${themeColor}; display: inline-block; flex-shrink: 0;"></span>
                    <span class="font-semibold">Employer Share (ER):</span>
                  </span>
                  <span class="font-mono font-bold" style="font-family: monospace; font-weight: 700; color: #94a3b8; font-size: 12px; white-space: nowrap;">₹${formatCurrency2Dec(erPf)}</span>
                </div>

                ${
                  withdrawn > 0
                    ? `
                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <span class="flex items-center gap-1.5 truncate" style="display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: #f59e0b;">
                      <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #f59e0b; display: inline-block; flex-shrink: 0;"></span>
                      <span class="font-semibold">Withdrawn This Month:</span>
                    </span>
                    <span class="font-mono font-bold" style="font-family: monospace; font-weight: 700; color: #f59e0b; font-size: 12px; white-space: nowrap;">-₹${formatCurrency2Dec(withdrawn)}</span>
                  </div>
                `
                    : ""
                }

                <!-- Divider -->
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.12); margin-top: 4px; padding-top: 6px;">
                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 4px;">
                    <span class="text-base-content/80" style="color: #94a3b8; font-size: 11px;">Total Monthly Deposit:</span>
                    <span class="font-mono font-bold" style="font-family: monospace; font-size: 11.5px; color: #f1f5f9;">₹${formatCurrency2Dec(totalDeposit)}</span>
                  </div>

                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; font-weight: 800;">
                    <span class="flex items-center gap-1.5" style="display: flex; align-items: center; gap: 7px; color: #38bdf8; font-size: 11.5px;">
                      <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #38bdf8; display: inline-block; flex-shrink: 0;"></span>
                      Cumulative PF Balance:
                    </span>
                    <span class="font-mono font-bold" style="font-family: monospace; color: #38bdf8; font-size: 12.5px; font-weight: 800;">₹${formatCurrency2Dec(cumulativeBalance)}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        },
      },
    };
  }, [currentThemeObj, pfMonthlyPlotData]);

  // PF Expand / Collapse Table Months
  const toggleExpandPfMonth = (rawMonth) => {
    setExpandedPfMonths((prev) => {
      const next = new Set(prev);
      if (next.has(rawMonth)) next.delete(rawMonth);
      else next.add(rawMonth);
      return next;
    });
  };

  const expandAllPfMonths = () => {
    setExpandedPfMonths(new Set(pfMonthlyPlotData.map((m) => m.rawMonth)));
  };

  const collapseAllPfMonths = () => {
    setExpandedPfMonths(new Set());
  };

  // PF Table rows sorted descending (latest month first)
  const pfTableDataDescending = useMemo(() => {
    return [...pfMonthlyPlotData].sort((a, b) => b.rawMonth.localeCompare(a.rawMonth));
  }, [pfMonthlyPlotData]);

  // ----------------------------------------------------------------------
  // MUTUAL FUND (MF) COMPUTATIONS & METRICS
  // ----------------------------------------------------------------------

  // Grouped Mutual Funds based on Custom Groups from Table Entry
  const groupedMutualFunds = useMemo(() => {
    if (!mfGroups || mfGroups.length === 0) {
      return [
        {
          id: "default-group",
          name: "General Mutual Funds",
          funds: mfData,
        },
      ];
    }

    const fundMap = new Map(mfData.map((f) => [String(f.id || f._id), f]));
    const assignedFundIds = new Set();
    const resultGroups = [];

    mfGroups.forEach((group) => {
      const groupFunds = (group.fundIds || [])
        .map((id) => fundMap.get(String(id)))
        .filter(Boolean);

      groupFunds.forEach((f) => assignedFundIds.add(String(f.id || f._id)));

      if (groupFunds.length > 0) {
        resultGroups.push({
          id: group.id,
          name: group.name,
          funds: groupFunds,
        });
      }
    });

    const unassignedFunds = mfData.filter((f) => !assignedFundIds.has(String(f.id || f._id)));
    if (unassignedFunds.length > 0) {
      resultGroups.push({
        id: "unassigned-group",
        name: "Other Mutual Funds",
        funds: unassignedFunds,
      });
    }

    return resultGroups;
  }, [mfData, mfGroups]);

  // Filtered groups & schemes by search query inside the modal
  const displayedGroupedMutualFunds = useMemo(() => {
    if (!mfSearchQuery.trim()) return groupedMutualFunds;
    const q = mfSearchQuery.toLowerCase().trim();

    return groupedMutualFunds
      .map((g) => {
        const matchingFunds = g.funds.filter((f) => {
          const name = (f.schemeName || "").toLowerCase();
          const amc = (f.amc || "").toLowerCase();
          const cat = (f.category || "").toLowerCase();
          const folio = (f.folioNumber || "").toLowerCase();
          return name.includes(q) || amc.includes(q) || cat.includes(q) || folio.includes(q);
        });
        if (matchingFunds.length === 0) return null;
        return {
          ...g,
          funds: matchingFunds,
        };
      })
      .filter(Boolean);
  }, [groupedMutualFunds, mfSearchQuery]);

  // Selected Group Object (if a whole group is filtered)
  const selectedGroupObj = useMemo(() => {
    if (!selectedMfFund || !selectedMfFund.startsWith("group:")) return null;
    const groupId = selectedMfFund.replace("group:", "");
    return groupedMutualFunds.find((g) => g.id === groupId) || null;
  }, [selectedMfFund, groupedMutualFunds]);

  // Active funds based on fund dropdown filter: "all", "group:<id>", or specific fund ID
  const activeMfFunds = useMemo(() => {
    if (selectedMfFund === "all") return mfData;
    if (selectedMfFund.startsWith("group:")) {
      return selectedGroupObj ? selectedGroupObj.funds : mfData;
    }
    return mfData.filter((f) => String(f.id || f._id) === selectedMfFund);
  }, [mfData, selectedMfFund, selectedGroupObj]);

  // Selected Fund Object (if specific fund is selected)
  const selectedFundObj = useMemo(() => {
    if (!selectedMfFund || selectedMfFund === "all" || selectedMfFund.startsWith("group:")) return null;
    return mfData.find((f) => String(f.id || f._id) === selectedMfFund) || null;
  }, [mfData, selectedMfFund]);

  // All flattened transactions from active funds
  const rawMfTransactions = useMemo(() => {
    const list = [];
    activeMfFunds.forEach((fund) => {
      (fund.transactions || []).forEach((t) => {
        list.push({
          ...t,
          fundId: fund.id,
          fundName: fund.schemeName || fund.amc,
          amc: fund.amc,
          category: fund.category,
        });
      });
    });
    return list.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [activeMfFunds]);

  // All unique timeline months across MF transactions
  const allMfTimelineMonths = useMemo(() => {
    const mSet = new Set();
    rawMfTransactions.forEach((t) => {
      if (t.date) mSet.add(dayjs(t.date).format("YYYY-MM"));
    });
    return Array.from(mSet).sort();
  }, [rawMfTransactions]);

  // Monthly breakdown and running cumulative values across all time
  const { mfMonthlyCumulativeMap, mfMonthlyAggregatesMap } = useMemo(() => {
    const monthMap = new Map();

    rawMfTransactions.forEach((t) => {
      if (!t.date) return;
      const m = dayjs(t.date).format("YYYY-MM");
      if (!monthMap.has(m)) {
        monthMap.set(m, {
          rawMonth: m,
          monthLabel: dayjs(m).format("MMM YYYY"),
          deposited: 0,
          withdrawn: 0,
          unitsAdded: 0,
          unitsWithdrawn: 0,
          er: 0,
          navSum: 0,
          navCount: 0,
          funds: new Set(),
          transactions: [],
        });
      }

      const item = monthMap.get(m);
      const typeLower = (t.type || "").toLowerCase();
      const isWithdrawal =
        typeLower.includes("withdr") ||
        typeLower.includes("redemp") ||
        typeLower.includes("swp");

      const amtDep = Number(t.amtDeposit ?? t.amount ?? 0);
      const er = Number(t.er ?? 0);
      const actual =
        t.actualAmt !== undefined && t.actualAmt !== null
          ? Number(t.actualAmt)
          : Math.max(0, Math.abs(amtDep) - er);
      const nav = Number(t.nav ?? 0);
      const units = parseFloat(t.units) || (nav > 0 ? actual / nav : 0);

      if (isWithdrawal) {
        item.withdrawn += actual > 0 ? actual : Math.abs(amtDep);
        item.unitsWithdrawn += units;
      } else {
        item.deposited += actual > 0 ? actual : amtDep;
        item.unitsAdded += units;
      }

      item.er += er;
      if (nav > 0) {
        item.navSum += nav * (units > 0 ? units : 1);
        item.navCount += units > 0 ? units : 1;
      }
      if (t.fundName) item.funds.add(t.fundName);
      item.transactions.push(t);
    });

    let runningInvested = 0;
    let runningUnits = 0;
    let runningEr = 0;
    const cumMap = new Map();

    allMfTimelineMonths.forEach((m) => {
      const item = monthMap.get(m) || {
        deposited: 0,
        withdrawn: 0,
        unitsAdded: 0,
        unitsWithdrawn: 0,
        er: 0,
      };
      runningInvested = Math.max(0, runningInvested + item.deposited - item.withdrawn);
      runningUnits = Math.max(0, runningUnits + item.unitsAdded - item.unitsWithdrawn);
      runningEr += item.er;

      cumMap.set(m, {
        cumulativeInvested: runningInvested,
        cumulativeUnits: Number(runningUnits.toFixed(3)),
        cumulativeEr: Number(runningEr.toFixed(2)),
      });
    });

    return {
      mfMonthlyCumulativeMap: cumMap,
      mfMonthlyAggregatesMap: monthMap,
    };
  }, [rawMfTransactions, allMfTimelineMonths]);

  // MF Monthly Plot Data (filtered by selected Date Range)
  const mfMonthlyPlotData = useMemo(() => {
    return allMfTimelineMonths
      .filter((m) => {
        if (fromMonthStr && m < fromMonthStr) return false;
        if (toMonthStr && m > toMonthStr) return false;
        return true;
      })
      .map((m) => {
        const agg = mfMonthlyAggregatesMap.get(m) || {};
        const cum = mfMonthlyCumulativeMap.get(m) || {
          cumulativeInvested: 0,
          cumulativeUnits: 0,
          cumulativeEr: 0,
        };
        const avgNav = agg.navCount > 0 ? agg.navSum / agg.navCount : 0;

        return {
          rawMonth: m,
          monthLabel: agg.monthLabel || dayjs(m).format("MMM YYYY"),
          deposited: agg.deposited || 0,
          withdrawn: agg.withdrawn || 0,
          netFlow: (agg.deposited || 0) - (agg.withdrawn || 0),
          unitsAdded: Number((agg.unitsAdded || 0).toFixed(3)),
          unitsWithdrawn: Number((agg.unitsWithdrawn || 0).toFixed(3)),
          netUnits: Number(((agg.unitsAdded || 0) - (agg.unitsWithdrawn || 0)).toFixed(3)),
          er: Number((agg.er || 0).toFixed(2)),
          avgNav: Number(avgNav.toFixed(2)),
          cumulativeInvested: cum.cumulativeInvested,
          cumulativeUnits: cum.cumulativeUnits,
          cumulativeEr: cum.cumulativeEr,
          funds: Array.from(agg.funds || []),
          transactions: agg.transactions || [],
        };
      });
  }, [allMfTimelineMonths, mfMonthlyAggregatesMap, mfMonthlyCumulativeMap, fromMonthStr, toMonthStr]);

  // Filtered MF Transactions in Date Range (for Table View)
  const filteredMfTransactions = useMemo(() => {
    return rawMfTransactions
      .filter((t) => {
        if (!t.date) return false;
        const m = dayjs(t.date).format("YYYY-MM");
        if (fromMonthStr && m < fromMonthStr) return false;
        if (toMonthStr && m > toMonthStr) return false;
        return true;
      })
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  }, [rawMfTransactions, fromMonthStr, toMonthStr]);

  // MF KPI Summary Metrics
  const mfKpiSummary = useMemo(() => {
    let periodDeposited = 0;
    let periodWithdrawn = 0;
    let periodUnitsAdded = 0;
    let periodUnitsWithdrawn = 0;
    let periodEr = 0;

    mfMonthlyPlotData.forEach((m) => {
      periodDeposited += m.deposited;
      periodWithdrawn += m.withdrawn;
      periodUnitsAdded += m.unitsAdded;
      periodUnitsWithdrawn += m.unitsWithdrawn;
      periodEr += m.er;
    });

    let allTimeDeposited = 0;
    let allTimeWithdrawn = 0;
    let allTimeUnitsAdded = 0;
    let allTimeUnitsWithdrawn = 0;
    let allTimeEr = 0;
    let totalSipCount = 0;
    let totalLsCount = 0;
    let totalWithdrawalCount = 0;

    rawMfTransactions.forEach((t) => {
      const typeLower = (t.type || "").toLowerCase();
      const isWithdrawal =
        typeLower.includes("withdr") ||
        typeLower.includes("redemp") ||
        typeLower.includes("swp");

      const amtDep = Number(t.amtDeposit ?? t.amount ?? 0);
      const er = Number(t.er ?? 0);
      const actual =
        t.actualAmt !== undefined && t.actualAmt !== null
          ? Number(t.actualAmt)
          : Math.max(0, Math.abs(amtDep) - er);
      const nav = Number(t.nav ?? 0);
      const units = parseFloat(t.units) || (nav > 0 ? actual / nav : 0);

      if (isWithdrawal) {
        totalWithdrawalCount += 1;
        allTimeWithdrawn += actual > 0 ? actual : Math.abs(amtDep);
        allTimeUnitsWithdrawn += units;
      } else {
        if (t.type === "Lumpsum" || t.type === "LUMPSUM" || t.type === "LS") {
          totalLsCount += 1;
        } else {
          totalSipCount += 1;
        }
        allTimeDeposited += actual > 0 ? actual : amtDep;
        allTimeUnitsAdded += units;
      }
      allTimeEr += er;
    });

    const allTimeNetInvested = Math.max(0, allTimeDeposited - allTimeWithdrawn);
    const allTimeUnitsHeld = Math.max(0, allTimeUnitsAdded - allTimeUnitsWithdrawn);
    const avgAcquisitionNav = allTimeUnitsHeld > 0 ? allTimeNetInvested / allTimeUnitsHeld : 0;

    return {
      allTimeNetInvested,
      allTimeDeposited,
      allTimeWithdrawn,
      allTimeUnitsHeld: Number(allTimeUnitsHeld.toFixed(3)),
      allTimeEr: Number(allTimeEr.toFixed(2)),
      periodDeposited,
      periodWithdrawn,
      periodEr: Number(periodEr.toFixed(2)),
      periodUnitsAdded: Number(periodUnitsAdded.toFixed(3)),
      periodUnitsWithdrawn: Number(periodUnitsWithdrawn.toFixed(3)),
      avgAcquisitionNav: Number(avgAcquisitionNav.toFixed(2)),
      totalSipCount,
      totalLsCount,
      totalWithdrawalCount,
      activeFundsCount: activeMfFunds.length,
      txnsCount: filteredMfTransactions.length,
    };
  }, [mfMonthlyPlotData, rawMfTransactions, activeMfFunds, filteredMfTransactions]);

  // Dedicated MF Series for each metric
  const mfCashflowSeries = useMemo(() => [
    {
      name: "Deposited Amount",
      type: "bar",
      data: mfMonthlyPlotData.map((m) => m.deposited),
    },
    {
      name: "Withdrawal Amount",
      type: "bar",
      data: mfMonthlyPlotData.map((m) => m.withdrawn),
    },
    {
      name: "Net Cumulative Invested",
      type: "line",
      data: mfMonthlyPlotData.map((m) => m.cumulativeInvested),
    },
  ], [mfMonthlyPlotData]);

  const mfNavSeries = useMemo(() => [
    {
      name: "Purchase NAV (₹)",
      type: "line",
      data: mfMonthlyPlotData.map((m) => m.avgNav),
    },
  ], [mfMonthlyPlotData]);

  const mfUnitsSeries = useMemo(() => [
    {
      name: "Units Added",
      type: "bar",
      data: mfMonthlyPlotData.map((m) => m.unitsAdded),
    },
    {
      name: "Units Redeemed",
      type: "bar",
      data: mfMonthlyPlotData.map((m) => m.unitsWithdrawn),
    },
    {
      name: "Cumulative Units Held",
      type: "line",
      data: mfMonthlyPlotData.map((m) => m.cumulativeUnits),
    },
  ], [mfMonthlyPlotData]);

  const mfErSeries = useMemo(() => [
    {
      name: "ER Incurred (₹)",
      type: "bar",
      data: mfMonthlyPlotData.map((m) => m.er),
    },
    {
      name: "Cumulative ER Incurred",
      type: "line",
      data: mfMonthlyPlotData.map((m) => m.cumulativeEr),
    },
  ], [mfMonthlyPlotData]);

  // MF ApexCharts Series Data dynamically driven by mfMetricMode
  const mfApexSeries = useMemo(() => {
    if (mfMetricMode === "nav") return mfNavSeries;
    if (mfMetricMode === "units") return mfUnitsSeries;
    if (mfMetricMode === "er") return mfErSeries;
    return mfCashflowSeries;
  }, [mfMetricMode, mfNavSeries, mfUnitsSeries, mfErSeries, mfCashflowSeries]);

  // Helper generator for MF ApexCharts Options per metric mode
  const generateMfApexOptions = (metric) => {
    const themeColor = currentThemeObj.hex;
    const lineTrendColor = "#38bdf8"; // Sky Blue for Trend Line

    let colors = [themeColor, themeColor, lineTrendColor];
    let strokeWidth = [0, 0, 2.5];
    let fillOpacity = [0.95, 0.35, 1];
    let yTitle = "Mutual Fund Cash Flow (₹)";
    let isStacked = true;

    if (metric === "nav") {
      colors = [themeColor];
      strokeWidth = [3];
      fillOpacity = [1];
      yTitle = "Net Asset Value - NAV (₹)";
      isStacked = false;
    } else if (metric === "units") {
      colors = [themeColor, themeColor, lineTrendColor];
      strokeWidth = [0, 0, 2.5];
      fillOpacity = [0.95, 0.35, 1];
      yTitle = "Units Transacted & Held";
      isStacked = true;
    } else if (metric === "er") {
      colors = [themeColor, lineTrendColor];
      strokeWidth = [0, 2.5];
      fillOpacity = [0.85, 1];
      yTitle = "Expense Ratio (₹)";
      isStacked = false;
    }

    return {
      chart: {
        type: "line",
        stacked: isStacked,
        background: "transparent",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 700,
        },
      },
      colors,
      stroke: {
        width: strokeWidth,
        curve: "smooth",
        dashArray: [0, 0, 0],
      },
      fill: {
        opacity: fillOpacity,
      },
      plotOptions: {
        bar: {
          columnWidth: "62%",
          borderRadius: 4,
          borderRadiusApplication: "end",
          dataLabels: { position: "top" },
          distributed: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: metric === "nav" ? [5] : [0, 0, 4.5],
        strokeColor: "#1e293b",
        strokeWidth: 2,
        hover: { size: 7 },
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: "#FFFFFF" },
        markers: {
          fillColors: colors,
          radius: 12,
        },
        itemMargin: { horizontal: 14, vertical: 8 },
        onItemClick: { toggleDataSeries: true },
        onItemHover: { highlightDataSeries: true },
      },
      xaxis: {
        categories: mfMonthlyPlotData.map((m) => m.monthLabel),
        labels: {
          style: { colors: "#FFFFFF", fontSize: "11px", fontWeight: "600" },
          rotate: -45,
        },
        axisBorder: { color: "#888" },
        axisTicks: { color: "#888" },
        title: {
          text: "Months",
          style: { color: "#FFFFFF", fontSize: "11px", fontWeight: "700" },
        },
      },
      yaxis: [
        {
          title: {
            text: yTitle,
            style: { color: "#FFFFFF", fontSize: "11px", fontWeight: "700" },
          },
          labels: {
            style: { colors: "#FFFFFF", fontSize: "11px" },
            formatter: (v) => {
              if (metric === "units") return `${Number(v).toFixed(1)} u`;
              if (metric === "nav") return `₹${Number(v).toFixed(2)}`;
              return formatCurrencyCompact(v);
            },
          },
        },
      ],
      grid: {
        show: true,
        borderColor: "#444",
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        theme: "dark",
        shared: true,
        intersect: false,
        custom: function ({ dataPointIndex }) {
          const item = mfMonthlyPlotData[dataPointIndex];
          if (!item) return "";

          const monthLabel = item.monthLabel;
          const fundHeader =
            selectedFundObj?.schemeName ||
            (selectedGroupObj ? `Group: ${selectedGroupObj.name}` : null) ||
            (item.funds.length === 1 ? item.funds[0] : `${item.funds.length} Active Funds`);

          if (metric === "nav") {
            return `
              <div class="space-y-3 min-w-[270px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.20); padding: 14px 18px; border-radius: 18px; box-shadow: 0 20px 30px -8px rgba(0, 0, 0, 0.45); min-width: 270px; font-size: 12px; font-family: inherit; color: #f8fafc;">
                <div class="border-b pb-2 flex justify-between items-center" style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span class="font-extrabold text-sm text-white block" style="font-weight: 800; font-size: 13.5px; color: #ffffff;">${monthLabel}</span>
                    <span class="text-[11px] opacity-75 font-medium truncate max-w-[170px] block" style="font-size: 10.5px; opacity: 0.75; color: #cbd5e1;">${fundHeader}</span>
                  </div>
                  <span class="badge badge-sm font-bold text-[10.5px] px-2.5 py-1 rounded-full" style="background: rgba(99, 102, 241, 0.25); border: 1px solid rgba(99, 102, 241, 0.45); color: #818cf8; font-weight: 700;">
                    NAV ₹${item.avgNav.toFixed(2)}
                  </span>
                </div>
                <div class="space-y-2 font-medium" style="display: flex; flex-direction: column; gap: 7px; font-weight: 500;">
                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <span class="text-base-content/80">Avg Purchase NAV:</span>
                    <span class="font-mono font-extrabold" style="color: ${themeColor}; font-size: 13px;">₹${item.avgNav.toFixed(4)}</span>
                  </div>
                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <span class="text-base-content/80">Units Purchased:</span>
                    <span class="font-mono font-bold">${item.unitsAdded.toFixed(3)} u</span>
                  </div>
                  <div class="flex justify-between items-center gap-4 pt-1" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px; margin-top: 2px;">
                    <span class="text-base-content/80">Capital Deployed:</span>
                    <span class="font-mono font-bold text-sky-400">₹${formatCurrency2Dec(item.deposited)}</span>
                  </div>
                </div>
              </div>
            `;
          }

          if (metric === "units") {
            return `
              <div class="space-y-3 min-w-[280px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.20); padding: 14px 18px; border-radius: 18px; box-shadow: 0 20px 30px -8px rgba(0, 0, 0, 0.45); min-width: 280px; font-size: 12px; font-family: inherit; color: #f8fafc;">
                <div class="border-b pb-2 flex justify-between items-center" style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span class="font-extrabold text-sm text-white block" style="font-weight: 800; font-size: 13.5px; color: #ffffff;">${monthLabel}</span>
                    <span class="text-[11px] opacity-75 font-medium truncate max-w-[170px] block" style="font-size: 10.5px; opacity: 0.75; color: #cbd5e1;">${fundHeader}</span>
                  </div>
                  <span class="badge badge-sm font-bold text-[10.5px] px-2.5 py-1 rounded-full" style="background: rgba(16, 185, 129, 0.25); border: 1px solid rgba(16, 185, 129, 0.45); color: #34d399; font-weight: 700;">
                    ${item.netUnits >= 0 ? "+" : ""}${item.netUnits.toFixed(3)} u
                  </span>
                </div>
                <div class="space-y-2 font-medium" style="display: flex; flex-direction: column; gap: 7px; font-weight: 500;">
                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <span class="flex items-center gap-1.5" style="display: flex; align-items: center; gap: 7px;">
                      <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${themeColor};"></span>
                      Units Added:
                    </span>
                    <span class="font-mono font-extrabold" style="color: ${themeColor}; font-size: 12px;">+${item.unitsAdded.toFixed(3)} u</span>
                  </div>
                  ${
                    item.unitsWithdrawn > 0
                      ? `
                    <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                      <span class="flex items-center gap-1.5" style="display: flex; align-items: center; gap: 7px;">
                        <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${themeColor}; opacity: 0.45; border: 1px solid ${themeColor};"></span>
                        Units Redeemed:
                      </span>
                      <span class="font-mono font-bold text-rose-400">-${item.unitsWithdrawn.toFixed(3)} u</span>
                    </div>
                  `
                      : ""
                  }
                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.12); margin-top: 4px; padding-top: 6px;">
                    <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; font-weight: 800;">
                      <span class="flex items-center gap-1.5" style="color: #38bdf8; font-size: 11.5px;">
                        <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #38bdf8;"></span>
                        Cumulative Units Held:
                      </span>
                      <span class="font-mono font-bold" style="color: #38bdf8; font-size: 12.5px;">${item.cumulativeUnits.toFixed(3)} u</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }

          if (metric === "er") {
            return `
              <div class="space-y-3 min-w-[270px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.20); padding: 14px 18px; border-radius: 18px; box-shadow: 0 20px 30px -8px rgba(0, 0, 0, 0.45); min-width: 270px; font-size: 12px; font-family: inherit; color: #f8fafc;">
                <div class="border-b pb-2 flex justify-between items-center" style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span class="font-extrabold text-sm text-white block" style="font-weight: 800; font-size: 13.5px; color: #ffffff;">${monthLabel}</span>
                    <span class="text-[11px] opacity-75 font-medium truncate max-w-[170px] block" style="font-size: 10.5px; opacity: 0.75; color: #cbd5e1;">${fundHeader}</span>
                  </div>
                  <span class="badge badge-sm font-bold text-[10.5px] px-2.5 py-1 rounded-full" style="background: rgba(244, 63, 94, 0.25); border: 1px solid rgba(244, 63, 94, 0.45); color: #fb7185; font-weight: 700;">
                    ₹${item.er.toFixed(2)} ER
                  </span>
                </div>
                <div class="space-y-2 font-medium" style="display: flex; flex-direction: column; gap: 7px; font-weight: 500;">
                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <span class="text-base-content/80">Expense Ratio Deducted:</span>
                    <span class="font-mono font-extrabold" style="color: ${themeColor}; font-size: 12px;">₹${item.er.toFixed(2)}</span>
                  </div>
                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <span class="text-base-content/80">Monthly Deposit:</span>
                    <span class="font-mono font-bold">₹${formatCurrency2Dec(item.deposited)}</span>
                  </div>
                  <div style="border-top: 1px solid rgba(255, 255, 255, 0.12); margin-top: 4px; padding-top: 6px;">
                    <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; font-weight: 800;">
                      <span style="color: #38bdf8;">Cumulative ER Incurred:</span>
                      <span class="font-mono font-bold" style="color: #38bdf8; font-size: 12.5px;">₹${formatCurrency2Dec(item.cumulativeEr)}</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }

          // Default: "cashflow" (Deposited Amt and Withdrawal Amt)
          return `
            <div class="space-y-3 min-w-[280px] text-xs text-base-content" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.20); padding: 14px 18px; border-radius: 18px; box-shadow: 0 20px 30px -8px rgba(0, 0, 0, 0.45); min-width: 280px; font-size: 12px; font-family: inherit; color: #f8fafc;">
              <div class="border-b pb-2 flex justify-between items-center" style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="font-extrabold text-sm text-white block" style="font-weight: 800; font-size: 13.5px; color: #ffffff;">${monthLabel}</span>
                  <span class="text-[11px] opacity-75 font-medium truncate max-w-[170px] block" style="font-size: 10.5px; opacity: 0.75; color: #cbd5e1;">${fundHeader}</span>
                </div>
                <span class="badge badge-sm font-bold text-[10.5px] px-2.5 py-1 rounded-full" style="background: rgba(16, 185, 129, 0.25); border: 1px solid rgba(16, 185, 129, 0.45); color: #34d399; font-weight: 700;">
                  +₹${formatCurrencyCompact(item.deposited)} Deposited
                </span>
              </div>

              <div class="space-y-2 font-medium" style="display: flex; flex-direction: column; gap: 7px; font-weight: 500;">
                <!-- Deposited Amount -->
                <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                  <span class="flex items-center gap-1.5 truncate" style="display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: #e2e8f0;">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${themeColor}; display: inline-block; flex-shrink: 0; box-shadow: 0 0 8px ${themeColor}88;"></span>
                    <span class="font-semibold">Deposited Amount:</span>
                  </span>
                  <span class="font-mono font-extrabold" style="font-family: monospace; font-weight: 800; color: ${themeColor}; font-size: 12px; white-space: nowrap;">₹${formatCurrency2Dec(item.deposited)}</span>
                </div>

                <!-- Withdrawal Amount -->
                <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                  <span class="flex items-center gap-1.5 truncate" style="display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: #e2e8f0;">
                    <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${themeColor}; opacity: 0.45; border: 1px solid ${themeColor}; display: inline-block; flex-shrink: 0;"></span>
                    <span class="font-semibold">Withdrawal Amount:</span>
                  </span>
                  <span class="font-mono font-bold" style="font-family: monospace; font-weight: 700; color: #f59e0b; font-size: 12px; white-space: nowrap;">₹${formatCurrency2Dec(item.withdrawn)}</span>
                </div>

                <!-- Divider -->
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.12); margin-top: 4px; padding-top: 6px;">
                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 4px;">
                    <span class="text-base-content/80" style="color: #94a3b8; font-size: 11px;">Net Capital Flow:</span>
                    <span class="font-mono font-bold" style="font-family: monospace; font-size: 11.5px; color: #f1f5f9;">${item.netFlow >= 0 ? "+" : ""}₹${formatCurrency2Dec(item.netFlow)}</span>
                  </div>

                  <div class="flex justify-between items-center gap-4" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; font-weight: 800;">
                    <span class="flex items-center gap-1.5" style="display: flex; align-items: center; gap: 7px; color: #38bdf8; font-size: 11.5px;">
                      <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="width: 10px; height: 10px; border-radius: 50%; background-color: #38bdf8; display: inline-block; flex-shrink: 0;"></span>
                      Net Cumulative Invested:
                    </span>
                    <span class="font-mono font-bold" style="font-family: monospace; color: #38bdf8; font-size: 12.5px; font-weight: 800;">₹${formatCurrency2Dec(item.cumulativeInvested)}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        },
      },
    };
  };

  // Dedicated MF Options for each metric
  const mfCashflowOptions = useMemo(() => generateMfApexOptions("cashflow"), [currentThemeObj, mfMonthlyPlotData, selectedFundObj, selectedGroupObj]);
  const mfNavOptions = useMemo(() => generateMfApexOptions("nav"), [currentThemeObj, mfMonthlyPlotData, selectedFundObj, selectedGroupObj]);
  const mfUnitsOptions = useMemo(() => generateMfApexOptions("units"), [currentThemeObj, mfMonthlyPlotData, selectedFundObj, selectedGroupObj]);
  const mfErOptions = useMemo(() => generateMfApexOptions("er"), [currentThemeObj, mfMonthlyPlotData, selectedFundObj, selectedGroupObj]);

  // Main MF ApexCharts Options
  const mfApexOptions = useMemo(() => {
    return generateMfApexOptions(mfMetricMode === "all" ? "cashflow" : mfMetricMode);
  }, [currentThemeObj, mfMonthlyPlotData, mfMetricMode, selectedFundObj, selectedGroupObj]);

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Sticky Glassmorphism Header */}
      <div className="sticky top-[-17px] z-40 bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/40 -mx-4 px-4 py-2 mt-[-16px]">
        <div className="flex items-center justify-between p-3 flex-wrap gap-3 max-w-[1600px] mx-auto px-4 md:px-6">
          {/* Left: Investment Category Selector Dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Dashboard Selector Modal Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDashboardModalOpen(true)}
              className="btn btn-ghost text-lg font-bold p-0 min-h-0 h-auto hover:bg-base-200/80 px-2.5 py-1.5 rounded-2xl flex items-center gap-2.5 transition-all border border-base-300/50 shadow-xs group"
              title="Click to switch dashboard view"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-transform group-hover:scale-105 border ${currentDashboardMeta.bgClass}`}
              >
                {React.createElement(currentDashboardMeta.icon, {
                  className: "w-4 h-4",
                })}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-sm sm:text-base leading-tight tracking-tight text-base-content group-hover:text-primary transition-colors">
                  {currentDashboardMeta.title}
                </span>
                <span className="text-[10px] font-bold text-base-content/50 leading-tight">
                  Investment Dashboard
                </span>
              </div>
              <div className="flex items-center gap-1.5 ml-1 text-xs opacity-70 group-hover:opacity-100 bg-base-200/80 px-2 py-1 rounded-xl border border-base-300/40 transition-all">
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform group-hover:translate-y-0.5" />
              </div>
            </button>

            {/* Fund Filter Modal Trigger Button - Visible when Mutual Funds dashboard is selected */}
            {activeDashboard === "MF" && (
              <button
                type="button"
                onClick={() => setIsMfModalOpen(true)}
                className="btn btn-ghost text-xs md:text-sm font-bold min-h-0 h-auto hover:bg-base-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs"
                title="Click to choose mutual fund or group"
              >
                <PieChart className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px] text-left">
                  {selectedMfFund === "all"
                    ? "All Mutual Funds"
                    : selectedGroupObj
                    ? `Group: ${selectedGroupObj.name}`
                    : selectedFundObj?.schemeName || selectedFundObj?.amc || "Select Fund"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5 shrink-0" />
              </button>
            )}

            {/* Stocks Sub-Dashboard Dropdown Selector - Visible when Stocks & Equity is selected */}
            {activeDashboard === "STOCKS" && (
              <div className="dropdown dropdown-bottom">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost text-xs md:text-sm font-bold min-h-0 h-auto hover:bg-base-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs"
                  title="Select stock view: Demat, Delivery, or Intraday"
                >
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px] text-left">
                    {stockSubView === "demat"
                      ? "Stocks In Demat"
                      : stockSubView === "delivery"
                      ? "Delivery Analysis"
                      : "Intraday Analysis"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5 shrink-0" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-56 z-[100] mt-2 border border-base-300/50"
                >
                  <li className="menu-title text-[10px] font-bold uppercase tracking-wider text-base-content/50 px-3 py-1">
                    Stock Category
                  </li>
                  <li>
                    <button
                      className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold ${
                        stockSubView === "demat"
                          ? "bg-primary text-primary-content font-bold shadow-xs"
                          : "hover:bg-base-200"
                      }`}
                      onClick={() => {
                        setStockSubView("demat");
                        localStorage.setItem("pulse_inv_dash_stock_view", "demat");
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-3.5 h-3.5 text-blue-500" />
                        <span>Stocks In Demat</span>
                      </div>
                      {stockSubView === "demat" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold ${
                        stockSubView === "delivery"
                          ? "bg-primary text-primary-content font-bold shadow-xs"
                          : "hover:bg-base-200"
                      }`}
                      onClick={() => {
                        setStockSubView("delivery");
                        localStorage.setItem("pulse_inv_dash_stock_view", "delivery");
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Delivery Analysis</span>
                      </div>
                      {stockSubView === "delivery" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold ${
                        stockSubView === "intraday"
                          ? "bg-primary text-primary-content font-bold shadow-xs"
                          : "hover:bg-base-200"
                      }`}
                      onClick={() => {
                        setStockSubView("intraday");
                        localStorage.setItem("pulse_inv_dash_stock_view", "intraday");
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Intraday Analysis</span>
                      </div>
                      {stockSubView === "intraday" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* Company Filter - Visible when SALARY or PF dashboard is selected */}
            {(activeDashboard === "SALARY" || activeDashboard === "PF") && (
              <div className="flex items-center gap-1.5 bg-base-200/70 p-1.5 rounded-xl border border-base-300/50 text-xs font-medium">
                <span className="text-[11px] font-bold uppercase opacity-60 px-1 flex items-center gap-1">
                  <Building2 size={12} className="text-base-content/60" /> Company:
                </span>
                <select
                  className="select select-bordered select-xs font-bold bg-base-100 min-w-[120px] max-w-[210px] px-2 text-xs truncate"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="all">All Companies</option>
                  {companiesList.map((c) => (
                    <option key={`comp-${c}`} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              to={
                activeDashboard === "PF"
                  ? "/dashboard/investment/table-entry?tab=pf"
                  : activeDashboard === "MF"
                  ? "/dashboard/investment/table-entry?tab=mf"
                  : activeDashboard === "STOCKS"
                  ? "/dashboard/investment/table-entry?tab=stocks"
                  : activeDashboard === "FD"
                  ? "/dashboard/investment/table-entry?tab=fd"
                  : activeDashboard === "RD"
                  ? "/dashboard/investment/table-entry?tab=rd"
                  : "/dashboard/investment/table-entry?tab=salary"
              }
              className="btn btn-xs btn-ghost gap-1.5 text-base-content/70 hover:text-primary font-semibold border border-base-300/40 rounded-lg px-2.5 py-1"
              title={`Manage ${currentDashboardMeta.title} in Table Entry`}
            >
              <TableProperties size={13} />
              <span>Table Entry</span>
            </Link>
          </div>

          {/* Right: Date Range Selectors (Only applicable for Salary, PF, and MF month records) */}
          <div className="flex items-center gap-2.5 ml-auto flex-wrap">
            {["SALARY", "PF", "MF"].includes(activeDashboard) && (
              <>
                {/* Range Preset Dropdown */}
                <div className="flex items-center gap-1.5 bg-base-200/70 p-1.5 rounded-xl text-xs font-medium">
                  <span className="text-[11px] font-bold uppercase opacity-60 px-1 flex items-center gap-1">
                    <Calendar size={12} /> Range:
                  </span>
                  <select
                    className="select select-bordered select-xs font-bold bg-base-100 min-w-[95px] px-2 text-xs"
                    value={activePreset}
                    onChange={(e) => {
                      const val = e.target.value;
                      setActivePreset(val);
                      if (val !== "custom") handleQuickRange(val);
                    }}
                  >
                    <option value="all">All Time</option>
                    <option value="this_year">This Year</option>
                    <option value="last_12">Last 12 Mos</option>
                    <option value="last_6">Last 6 Mos</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* FROM */}
                <div className="flex items-center gap-1.5 bg-base-200/70 p-1.5 rounded-xl text-xs font-medium">
                  <span className="text-[11px] font-bold uppercase opacity-60 px-1">From:</span>
                  <select
                    className="select select-bordered select-xs font-bold font-mono bg-base-100 min-w-[76px] px-2 text-xs"
                    value={fromYear}
                    onChange={(e) => {
                      setFromYear(e.target.value);
                      setActivePreset("custom");
                    }}
                  >
                    {availableYears.map((y) => (
                      <option key={`from-y-${y}`} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered select-xs font-bold bg-base-100 min-w-[68px] px-2 text-xs"
                    value={fromMonth}
                    onChange={(e) => {
                      setFromMonth(e.target.value);
                      setActivePreset("custom");
                    }}
                  >
                    {monthNamesList.map((m) => (
                      <option key={`from-m-${m.value}`} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TO */}
                <div className="flex items-center gap-1.5 bg-base-200/70 p-1.5 rounded-xl text-xs font-medium">
                  <span className="text-[11px] font-bold uppercase opacity-60 px-1">To:</span>
                  <select
                    className="select select-bordered select-xs font-bold font-mono bg-base-100 min-w-[76px] px-2 text-xs"
                    value={toYear}
                    onChange={(e) => {
                      setToYear(e.target.value);
                      setActivePreset("custom");
                    }}
                  >
                    {availableYears.map((y) => (
                      <option key={`to-y-${y}`} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered select-xs font-bold bg-base-100 min-w-[68px] px-2 text-xs"
                    value={toMonth}
                    onChange={(e) => {
                      setToMonth(e.target.value);
                      setActivePreset("custom");
                    }}
                  >
                    {monthNamesList.map((m) => (
                      <option key={`to-m-${m.value}`} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-circle btn-xs bg-base-200/70 hover:bg-base-200"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-primary" : "opacity-70"} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 w-full max-w-[1600px] mx-auto space-y-6">
        {/* Date Range Error Alert */}
        {isInvalidRange && ["SALARY", "PF", "MF"].includes(activeDashboard) && (
          <div className="alert alert-error shadow-sm text-xs font-bold rounded-2xl">
            <span>Invalid Date Range: "From" date ({fromMonthStr}) cannot be after "To" date ({toMonthStr}). Please adjust your selection or pick a Date Range preset.</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-xs text-base-content/60 font-semibold animate-pulse">
              Loading {currentDashboardMeta.title} analytics & portfolios...
            </p>
          </div>
        )}

        {/* Empty State - Salary */}
        {!loading && salaryData.length === 0 && activeDashboard === "SALARY" && (
          <div className="card bg-base-200 shadow-md p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Banknote size={32} />
            </div>
            <h3 className="text-xl font-bold">No Salary Entries Found</h3>
            <p className="text-sm text-base-content/60 max-w-md mx-auto">
              Start by logging your monthly salary breakdowns in Table Entry to activate interactive compensation
              intelligence, graphs, deductions, and tax tracking.
            </p>
            <div>
              <Link to="/dashboard/investment/table-entry" className="btn btn-primary btn-sm gap-2 rounded-xl">
                <TableProperties size={14} /> Go to Salary Table Entry
              </Link>
            </div>
          </div>
        )}

        {/* Empty State - Provident Fund */}
        {!loading && salaryData.length === 0 && pfWithdrawals.length === 0 && activeDashboard === "PF" && (
          <div className="card bg-base-200 shadow-md p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold">No PF Data Available</h3>
            <p className="text-sm text-base-content/60 max-w-md mx-auto">
              PF contributions are automatically computed from your employee & employer salary entries.
              Log monthly salary records or record PF withdrawals in Table Entry to view PF analytics.
            </p>
            <div>
              <Link to="/dashboard/investment/table-entry" className="btn btn-primary btn-sm gap-2 rounded-xl">
                <TableProperties size={14} /> Go to Table Entry
              </Link>
            </div>
          </div>
        )}

        {/* Empty State - MF */}
        {!loading && mfData.length === 0 && activeDashboard === "MF" && (
          <div className="card bg-base-200 shadow-md p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
              <PieChart size={32} />
            </div>
            <h3 className="text-xl font-bold">No Mutual Fund Portfolios Found</h3>
            <p className="text-sm text-base-content/60 max-w-md mx-auto">
              Track your SIPs, Lumpsums, Redemptions, NAV histories, Units, and Expense Ratios. Add your mutual fund schemes
              and installments in Table Entry to activate portfolio intelligence.
            </p>
            <div>
              <Link to="/dashboard/investment/table-entry?tab=mf" className="btn btn-primary btn-sm gap-2 rounded-xl">
                <TableProperties size={14} /> Go to Mutual Fund Table Entry
              </Link>
            </div>
          </div>
        )}

        {/* Empty State - Stocks & Equity */}
        {!loading && stocksData.length === 0 && activeDashboard === "STOCKS" && (
          <div className="card bg-base-200 shadow-md p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-xl font-bold">No Stock Trades Found</h3>
            <p className="text-sm text-base-content/60 max-w-md mx-auto">
              Analyze your Demat holdings, delivery trades, and intraday orders with capital allocations,
              quantity distributions, and detailed ledgers. Start by logging your trades in Table Entry.
            </p>
            <div>
              <Link to="/dashboard/investment/table-entry?tab=stocks" className="btn btn-primary btn-sm gap-2 rounded-xl">
                <TableProperties size={14} /> Go to Stocks Table Entry
              </Link>
            </div>
          </div>
        )}

        {/* Empty State - Fixed Deposits */}
        {!loading && fdData.length === 0 && activeDashboard === "FD" && (
          <div className="card bg-base-200 shadow-md p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Landmark size={32} />
            </div>
            <h3 className="text-xl font-bold">No Fixed Deposits Found</h3>
            <p className="text-sm text-base-content/60 max-w-md mx-auto">
              Track your bank fixed deposits, interest compounding, maturity schedules, and asset allocations across institutions. Start by adding your deposits.
            </p>
            <div>
              <Link to="/dashboard/investment/table-entry?tab=fd" className="btn btn-primary btn-sm gap-2 rounded-xl">
                <TableProperties size={14} /> Go to Fixed Deposits Table Entry
              </Link>
            </div>
          </div>
        )}

        {!loading && salaryData.length > 0 && activeDashboard === "SALARY" && (
          <>
            {/* 2. KPI Summary Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total In Hand */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <Wallet size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Total In Hand
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{formatCurrency2Dec(kpiSummary.totalInHand)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span className="badge badge-xs badge-success font-bold text-[10px]">
                        {kpiSummary.overallTakeHomePct.toFixed(1)}% Take-Home
                      </span>
                      <span>of Gross Salary</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Deductions */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-rose-500/10 dark:text-rose-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <Receipt size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Total Deductions
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-rose-500">
                      ₹{formatCurrency2Dec(kpiSummary.totalDeductions)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span>PF: ₹{formatCurrencyCompact(kpiSummary.totalErPf)}</span>
                      <span>•</span>
                      <span>Taxes: ₹{formatCurrencyCompact(kpiSummary.totalTaxes)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Gross / Earnings */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-primary/10 dark:text-primary/15 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <Banknote size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Gross Earnings
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-primary">
                      ₹{formatCurrency2Dec(kpiSummary.totalGross)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span>Avg/Mo: ₹{formatCurrencyCompact(kpiSummary.avgMonthlyGross)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total CTC & Experience */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-sky-500/10 dark:text-sky-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <TrendingUp size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Total CTC Logged
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-sky-500">
                      ₹{formatCurrency2Dec(kpiSummary.totalCtc)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span className="badge badge-xs badge-ghost font-bold text-[10px]">
                        {kpiSummary.expText}
                      </span>
                      <span>across {kpiSummary.monthsCount} records</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Main Salary Analysis Interactive Section */}
            <section className="card bg-base-200 shadow-md rounded-3xl overflow-hidden">
              <div className="card-body p-6 space-y-6">
                {/* Section Header & View Switcher */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-base-300/60 pb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <BarChart3 size={22} className="text-emerald-500" />
                      Salary & Compensation Breakdown
                    </h2>
                    <p className="text-xs text-base-content/60 mt-0.5">
                      {salaryComponentView === "earnings"
                        ? "Monthly distribution of earnings components (Basic, HRA, Flexi, Bonus) with Total Earnings trend line"
                        : salaryComponentView === "deductions"
                        ? "Monthly distribution of deductions (Employer PF, Taxes & Statutory) with Total Deductions trend line"
                        : "Stacked monthly distribution of In-Hand Salary and Total Deductions with overall CTC trend line"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Component Distribution Dropdown */}
                    <div className="flex items-center gap-2 bg-base-100 px-3 py-1.5 rounded-2xl shadow-xs">
                      <span className="text-xs font-bold text-base-content/70 flex items-center gap-1.5 whitespace-nowrap">
                        <Layers size={13} className="text-primary" /> Component:
                      </span>
                      <select
                        className="select select-bordered select-xs font-bold bg-base-200/60 text-xs min-w-[145px]"
                        value={salaryComponentView}
                        onChange={(e) => setSalaryComponentView(e.target.value)}
                      >
                        <option value="earnings">Total Earnings</option>
                        <option value="deductions">Total Deductions</option>
                        <option value="overview">In-Hand & Deductions</option>
                      </select>
                    </div>

                    {/* View Switcher: Graph View vs Table View */}
                    <div className="flex items-center gap-2 bg-base-100 p-1.5 rounded-2xl shadow-xs">
                      <button
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                          viewTab === "graph"
                            ? "bg-primary text-primary-content shadow-sm"
                            : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                        }`}
                        onClick={() => setViewTab("graph")}
                      >
                        <BarChart3 size={15} /> Graph View
                      </button>
                      <button
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                          viewTab === "table"
                            ? "bg-primary text-primary-content shadow-sm"
                            : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                        }`}
                        onClick={() => setViewTab("table")}
                      >
                        <TableProperties size={15} /> Table View
                      </button>
                    </div>
                  </div>
                </div>

                {/* TAB 1: Graph View */}
                {viewTab === "graph" && (
                  <div className="space-y-4">
                    {monthlyPlotData.length > 0 ? (
                      <div className="w-full [&_.apexcharts-tooltip]:!bg-transparent [&_.apexcharts-tooltip]:!border-none [&_.apexcharts-tooltip]:!shadow-none [&_.apexcharts-tooltip]:!p-0">
                        <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold text-base-content/60">
                          <span>
                            {salaryComponentView === "earnings"
                              ? "Click legend items below to toggle individual earnings components or Total Earnings line:"
                              : salaryComponentView === "deductions"
                              ? "Click legend items below to toggle deduction components or Total Deductions line:"
                              : "Click legend items below to toggle In Hand, Total Deductions, or Total CTC:"}
                          </span>
                          <span className="text-[11px] opacity-75">
                            Showing {monthlyPlotData.length} monthly records
                          </span>
                        </div>
                        <Chart
                          options={apexOptions}
                          series={apexSeries}
                          type="line"
                          height={440}
                        />
                      </div>
                    ) : (
                      <div className="p-12 text-center text-sm opacity-50 italic">
                        No salary records match the selected company or date filter range.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Collapsible Table View */}
                {viewTab === "table" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-base-200/50 p-3 rounded-2xl border border-base-300">
                      <p className="text-xs font-semibold text-base-content/70">
                        Monthly salary records with In-Hand, Deductions (PF + Taxes), Gross Earnings, and full itemized details.
                      </p>
                      <div className="flex items-center gap-2 text-xs font-extrabold shrink-0">
                        <button
                          onClick={expandAllMonths}
                          className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          Expand All
                        </button>
                        <span className="opacity-30">•</span>
                        <button
                          onClick={collapseAllMonths}
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
                            <th className="py-3 px-4">Month & Company</th>
                            <th className="py-3 px-4 text-right">In Hand Salary</th>
                            <th className="py-3 px-4 text-right">Total Deductions</th>
                            <th className="py-3 px-4 text-right">Gross Earnings</th>
                            <th className="py-3 px-4 text-right">Total CTC</th>
                            <th className="py-3 px-4 text-center">Take-Home %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-base-200 font-medium">
                          {tableDataDescending.length > 0 ? (
                            tableDataDescending.map((mRow) => {
                              const isExpanded = expandedMonths.has(mRow.rawMonth);
                              const takeHomeRatio =
                                mRow.gross > 0 ? (mRow.inHand / mRow.gross) * 100 : 0;

                              return (
                                <React.Fragment key={mRow.rawMonth}>
                                  {/* Summary Row */}
                                  <tr
                                    onClick={() => toggleExpandMonth(mRow.rawMonth)}
                                    className="bg-base-100 hover:bg-base-200/60 transition-colors cursor-pointer font-bold border-t-2 border-base-200"
                                  >
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-2.5">
                                        <button className="btn btn-xs btn-ghost btn-circle p-0 h-6 w-6 min-h-0 text-base-content/70">
                                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                        <span className="font-extrabold text-sm text-base-content">
                                          {mRow.monthLabel}
                                        </span>
                                        <span className="badge badge-xs font-bold bg-base-200 border-base-300 text-base-content/70">
                                          {mRow.companies.join(", ")}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                      ₹{formatCurrency2Dec(mRow.inHand)}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-rose-500">
                                      ₹{formatCurrency2Dec(mRow.deductions)}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-primary">
                                      ₹{formatCurrency2Dec(mRow.gross)}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sky-500">
                                      ₹{formatCurrency2Dec(mRow.ctc)}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                      <span className="badge badge-sm font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                                        {takeHomeRatio.toFixed(1)}%
                                      </span>
                                    </td>
                                  </tr>

                                  {/* Expanded Itemized Breakdown Row */}
                                  {isExpanded && (
                                    <tr className="bg-base-200/40">
                                      <td colSpan={6} className="py-3 px-6">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs bg-base-100 p-4 rounded-xl border border-base-300/60 shadow-2xs">
                                          <div>
                                            <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                              Basic Salary
                                            </span>
                                            <span className="font-mono font-bold">
                                              ₹{formatCurrency2Dec(mRow.basic)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                              HRA
                                            </span>
                                            <span className="font-mono font-bold">
                                              ₹{formatCurrency2Dec(mRow.hra)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                              Flexi / Extras
                                            </span>
                                            <span className="font-mono font-bold">
                                              ₹{formatCurrency2Dec(mRow.flexi)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                              Bonus
                                            </span>
                                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                              ₹{formatCurrency2Dec(mRow.bonus)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                              Employer PF
                                            </span>
                                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                              ₹{formatCurrency2Dec(mRow.erPf)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                              Taxes
                                            </span>
                                            <span className="font-mono font-bold text-rose-500">
                                              ₹{formatCurrency2Dec(mRow.taxes)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                              Gratuity
                                            </span>
                                            <span className="font-mono font-bold">
                                              ₹{formatCurrency2Dec(mRow.gratuity)}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                              Variable Pay
                                            </span>
                                            <span className="font-mono font-bold">
                                              ₹{formatCurrency2Dec(mRow.variablePay)}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-base-content/50 italic">
                                No records found for the selected period.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ================================================================ */}
        {/* PROVIDENT FUND (PF) DASHBOARD VIEW */}
        {/* ================================================================ */}
        {!loading && (salaryData.length > 0 || pfWithdrawals.length > 0) && activeDashboard === "PF" && (
          <>
            {/* 1. PF KPI Summary Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Net Available Balance */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-teal-500/10 dark:text-teal-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <ShieldCheck size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Net Available Balance
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-teal-600 dark:text-teal-400">
                      ₹{formatCurrency2Dec(pfKpiSummary.allTimeAvailablePfBalance)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span className="badge badge-xs badge-success font-bold text-[10px]">
                        EPF Balance
                      </span>
                      <span>Available to withdraw</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Deposited in Period */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-primary/10 dark:text-primary/15 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <PiggyBank size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Period Deposits
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-primary">
                      ₹{formatCurrency2Dec(pfKpiSummary.periodTotalDeposit)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span>Avg/Mo: ₹{formatCurrencyCompact(pfKpiSummary.avgMonthlyDeposit)}</span>
                      <span>•</span>
                      <span>{pfKpiSummary.activeMonths} mos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Withdrawn */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-amber-500/10 dark:text-amber-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <ArrowUpRight size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Total Withdrawn
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-amber-500">
                      ₹{formatCurrency2Dec(pfKpiSummary.allTimePfWithdrawn)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span className="badge badge-xs badge-warning font-bold text-[10px]">
                        {pfKpiSummary.totalWithdrawalCount} {pfKpiSummary.totalWithdrawalCount === 1 ? "Txn" : "Txns"}
                      </span>
                      <span>
                        {pfKpiSummary.periodWithdrawn > 0
                          ? `Period: ₹${formatCurrencyCompact(pfKpiSummary.periodWithdrawn)}`
                          : "All-time withdrawals"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employer Share (ER) */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-sky-500/10 dark:text-sky-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <Building2 size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Employer Share (ER)
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-sky-500">
                      ₹{formatCurrency2Dec(pfKpiSummary.periodErPf)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span>Company match</span>
                      <span>•</span>
                      <span>Period total</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Share (EE) */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-purple-500/10 dark:text-purple-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <Wallet size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Employee Share (EE)
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-purple-500">
                      ₹{formatCurrency2Dec(pfKpiSummary.periodEePf)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span>Salary deduction</span>
                      <span>•</span>
                      <span>Period total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Main PF Analysis Interactive Section */}
            <section className="card bg-base-200 shadow-md rounded-3xl overflow-hidden">
              <div className="card-body p-6 space-y-6">
                {/* Section Header & View Switcher */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-base-300 pb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <ShieldCheck size={22} className="text-teal-500" />
                      Provident Fund (EPF) Growth & Contributions
                    </h2>
                    <p className="text-xs text-base-content/60 mt-0.5">
                      Stacked monthly distribution of Employee Share (EE) and Employer Share (ER) with cumulative PF balance trend line
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Theme Color Selector */}
                    <div className="flex items-center gap-1.5 bg-base-100 p-1 rounded-xl border border-base-300">
                      <span className="text-[10.5px] font-bold text-base-content/50 uppercase px-1 flex items-center gap-1">
                        <Palette size={11} /> Theme:
                      </span>
                      {SALARY_COLOR_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`w-5 h-5 rounded-lg transition-all ${
                            selectedTheme === theme.id
                              ? "ring-2 ring-primary scale-110 shadow-sm"
                              : "opacity-60 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: theme.hex }}
                          title={theme.label}
                        />
                      ))}
                    </div>

                    {/* View Switcher: Graph View vs Table View */}
                    <div className="flex items-center gap-2 bg-base-100 p-1.5 rounded-2xl border border-base-300">
                      <button
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                          viewTab === "graph"
                            ? "bg-primary text-primary-content shadow-sm"
                            : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                        }`}
                        onClick={() => setViewTab("graph")}
                      >
                        <BarChart3 size={15} /> Graph View
                      </button>
                      <button
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                          viewTab === "table"
                            ? "bg-primary text-primary-content shadow-sm"
                            : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                        }`}
                        onClick={() => setViewTab("table")}
                      >
                        <TableProperties size={15} /> Table View
                      </button>
                    </div>
                  </div>
                </div>

                {/* TAB 1: Graph View */}
                {viewTab === "graph" && (
                  <div className="space-y-4">
                    {pfMonthlyPlotData.length > 0 ? (
                      <div className="w-full [&_.apexcharts-tooltip]:!bg-transparent [&_.apexcharts-tooltip]:!border-none [&_.apexcharts-tooltip]:!shadow-none [&_.apexcharts-tooltip]:!p-0">
                        <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold text-base-content/60 flex-wrap gap-2">
                          <span>
                            Click legend items below to toggle <span className="font-bold">Employee Share (EE)</span>,{" "}
                            <span className="font-bold">Employer Share (ER)</span>, or <span className="font-bold">Cumulative PF Balance</span>:
                          </span>
                          <span className="text-[11px] opacity-75">
                            Showing {pfMonthlyPlotData.length} timeline records
                          </span>
                        </div>
                        <Chart
                          options={pfApexOptions}
                          series={pfApexSeries}
                          type="line"
                          height={440}
                        />
                      </div>
                    ) : (
                      <div className="p-12 text-center text-sm opacity-50 italic">
                        No Provident Fund records match the selected company or date filter range.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Table View */}
                {viewTab === "table" && (
                  <div className="space-y-4">
                    {/* Sub-tab Navigation Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-base-200/50 p-3 rounded-2xl border border-base-300">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPfSubTab("contributions")}
                          className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                            pfSubTab === "contributions"
                              ? "bg-primary text-primary-content shadow-sm"
                              : "btn-ghost text-base-content/70 hover:bg-base-300/50"
                          }`}
                        >
                          <PiggyBank size={13} />
                          Monthly Contributions ({pfMonthlyPlotData.length})
                        </button>
                        <button
                          onClick={() => setPfSubTab("withdrawals")}
                          className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                            pfSubTab === "withdrawals"
                              ? "bg-primary text-primary-content shadow-sm"
                              : "btn-ghost text-base-content/70 hover:bg-base-300/50"
                          }`}
                        >
                          <ArrowUpRight size={13} />
                          Withdrawals History ({filteredPfWithdrawals.length})
                        </button>
                      </div>

                      {pfSubTab === "contributions" && (
                        <div className="flex items-center gap-2 text-xs font-extrabold shrink-0">
                          <button
                            onClick={expandAllPfMonths}
                            className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 cursor-pointer"
                          >
                            Expand All
                          </button>
                          <span className="opacity-30">•</span>
                          <button
                            onClick={collapseAllPfMonths}
                            className="btn btn-xs btn-ghost text-base-content/60 hover:bg-base-300/50 cursor-pointer"
                          >
                            Collapse All
                          </button>
                        </div>
                      )}

                      {pfSubTab === "withdrawals" && (
                        <Link
                          to="/dashboard/investment/table-entry?tab=pf"
                          className="btn btn-xs btn-primary gap-1.5 rounded-xl font-bold"
                        >
                          <Plus size={12} />
                          <span>Record Withdrawal</span>
                        </Link>
                      )}
                    </div>

                    {/* Sub-Tab 1: Monthly Contributions Table */}
                    {pfSubTab === "contributions" && (
                      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
                        <table className="table w-full text-xs">
                          <thead className="bg-base-200/80 text-base-content font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                              <th className="py-3 px-4">Month & Company</th>
                              <th className="py-3 px-4 text-right">Employer Share (ER)</th>
                              <th className="py-3 px-4 text-right">Employee Share (EE)</th>
                              <th className="py-3 px-4 text-right">Monthly Deposit</th>
                              <th className="py-3 px-4 text-right">Cumulative PF Balance</th>
                              <th className="py-3 px-4 text-center">EPF % of Basic</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-base-200 font-medium">
                            {pfTableDataDescending.length > 0 ? (
                              pfTableDataDescending.map((mRow) => {
                                const isExpanded = expandedPfMonths.has(mRow.rawMonth);
                                const epfPct =
                                  mRow.basicSalary > 0
                                    ? ((mRow.totalDeposit / mRow.basicSalary) * 100).toFixed(1)
                                    : null;

                                return (
                                  <React.Fragment key={mRow.rawMonth}>
                                    {/* Summary Row */}
                                    <tr
                                      onClick={() => toggleExpandPfMonth(mRow.rawMonth)}
                                      className="bg-base-100 hover:bg-base-200/60 transition-colors cursor-pointer font-bold border-t-2 border-base-200"
                                    >
                                      <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2.5">
                                          <button className="btn btn-xs btn-ghost btn-circle p-0 h-6 w-6 min-h-0 text-base-content/70">
                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                          </button>
                                          <span className="font-extrabold text-sm text-base-content">
                                            {mRow.monthLabel}
                                          </span>
                                          {mRow.companies.length > 0 && (
                                            <span className="badge badge-xs font-bold bg-base-200 border-base-300 text-base-content/70">
                                              {mRow.companies.join(", ")}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-base-content/80">
                                        ₹{formatCurrency2Dec(mRow.erPf)}
                                      </td>
                                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                        ₹{formatCurrency2Dec(mRow.eePf)}
                                      </td>
                                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-primary">
                                        ₹{formatCurrency2Dec(mRow.totalDeposit)}
                                      </td>
                                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sky-500">
                                        ₹{formatCurrency2Dec(mRow.cumulativeBalance)}
                                      </td>
                                      <td className="py-3.5 px-4 text-center">
                                        {epfPct ? (
                                          <span className="badge badge-sm font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30">
                                            {epfPct}% Basic
                                          </span>
                                        ) : (
                                          <span className="text-base-content/40 font-mono">—</span>
                                        )}
                                      </td>
                                    </tr>

                                    {/* Expanded Itemized Breakdown Row */}
                                    {isExpanded && (
                                      <tr className="bg-base-200/40">
                                        <td colSpan={6} className="py-3 px-6">
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-base-100 p-4 rounded-xl border border-base-300/60 shadow-2xs">
                                            <div>
                                              <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                                Basic Salary
                                              </span>
                                              <span className="font-mono font-bold text-sm">
                                                ₹{formatCurrency2Dec(mRow.basicSalary)}
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                                Employer Share (ER PF)
                                              </span>
                                              <span className="font-mono font-bold text-sm text-base-content/80">
                                                ₹{formatCurrency2Dec(mRow.erPf)}
                                              </span>
                                              {mRow.basicSalary > 0 && (
                                                <span className="text-[10.5px] text-base-content/50 block mt-0.5">
                                                  {((mRow.erPf / mRow.basicSalary) * 100).toFixed(1)}% of Basic
                                                </span>
                                              )}
                                            </div>
                                            <div>
                                              <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                                Employee Share (EE PF)
                                              </span>
                                              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                                                ₹{formatCurrency2Dec(mRow.eePf)}
                                              </span>
                                              {mRow.basicSalary > 0 && (
                                                <span className="text-[10.5px] text-base-content/50 block mt-0.5">
                                                  {((mRow.eePf / mRow.basicSalary) * 100).toFixed(1)}% of Basic
                                                </span>
                                              )}
                                            </div>
                                            <div>
                                              <span className="text-[10px] font-bold text-base-content/50 uppercase block">
                                                Month-End Cumulative Balance
                                              </span>
                                              <span className="font-mono font-bold text-sm text-sky-500">
                                                ₹{formatCurrency2Dec(mRow.cumulativeBalance)}
                                              </span>
                                              <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">
                                                ✓ Synced via Salary Slip
                                              </span>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-base-content/50 italic">
                                  No Provident Fund records found for the selected period.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Sub-Tab 2: Withdrawals History Table */}
                    {pfSubTab === "withdrawals" && (
                      <div className="space-y-4">
                        {filteredPfWithdrawals.length === 0 ? (
                          <div className="card bg-base-100 border border-base-200 p-8 text-center space-y-3 rounded-2xl">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                              <ArrowUpRight size={24} />
                            </div>
                            <h4 className="font-bold text-base">No Withdrawals in Selected Period</h4>
                            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                              No PF withdrawals were recorded for this period. Your available EPF balance is{" "}
                              <span className="font-bold font-mono text-teal-600 dark:text-teal-400">
                                ₹{formatCurrency2Dec(pfKpiSummary.allTimeAvailablePfBalance)}
                              </span>.
                            </p>
                            <div>
                              <Link
                                to="/dashboard/investment/table-entry?tab=pf"
                                className="btn btn-primary btn-xs rounded-xl gap-1.5 font-bold"
                              >
                                <Plus size={12} /> Manage Withdrawals in Table Entry
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
                            <table className="table w-full text-xs">
                              <thead className="bg-base-200/80 text-base-content font-bold uppercase tracking-wider text-[11px]">
                                <tr>
                                  <th className="py-3 px-4 text-center w-14">#</th>
                                  <th className="py-3 px-4 min-w-[140px]">Withdrawal Date</th>
                                  <th className="py-3 px-4 text-right min-w-[150px]">Amount Withdrawn</th>
                                  <th className="py-3 px-4 min-w-[180px]">Reason</th>
                                  <th className="py-3 px-4 min-w-[220px]">Notes / Remarks</th>
                                  <th className="py-3 px-4 text-center min-w-[100px]">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-base-200 font-medium">
                                {filteredPfWithdrawals.map((item, idx) => (
                                  <tr key={item.id || item._id || idx} className="hover:bg-base-200/40 transition-colors">
                                    <td className="py-3.5 px-4 text-center font-mono text-base-content/50">
                                      {idx + 1}
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-base-content">
                                      <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-amber-500 shrink-0" />
                                        <span>{dayjs(item.date).format("DD MMMM YYYY")}</span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-500 bg-amber-500/5 whitespace-nowrap">
                                      ₹{formatCurrency2Dec(item.amount)}
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                      <span className="badge badge-sm bg-base-200 font-semibold text-base-content/80 border-base-300">
                                        {item.reason || "General Withdrawal"}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-base-content/70 max-w-xs truncate">
                                      {item.notes || "—"}
                                    </td>
                                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                      <Link
                                        to="/dashboard/investment/table-entry?tab=pf"
                                        className="btn btn-ghost btn-xs text-primary gap-1 font-bold"
                                        title="View or Edit in Table Entry"
                                      >
                                        <ExternalLink size={12} />
                                        <span>View</span>
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ================================================================ */}
        {/* MUTUAL FUND (MF) DASHBOARD VIEW */}
        {/* ================================================================ */}
        {!loading && mfData.length > 0 && activeDashboard === "MF" && (
          <>
            {/* 1. MF KPI Summary Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Net Capital Invested */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-purple-500/10 dark:text-purple-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <Wallet size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Net Capital Invested
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
                      ₹{formatCurrency2Dec(mfKpiSummary.allTimeNetInvested)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span className="badge badge-xs badge-secondary font-bold text-[10px]">
                        Portfolio Cost
                      </span>
                      <span>
                        {selectedMfFund === "all"
                          ? `${activeMfFunds.length} Funds`
                          : selectedGroupObj
                          ? `${selectedGroupObj.name} (${activeMfFunds.length} Funds)`
                          : "Selected Scheme"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Period Deposits */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <PiggyBank size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Period Deposits
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{formatCurrency2Dec(mfKpiSummary.periodDeposited)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span className="badge badge-xs badge-success font-bold text-[10px]">
                        {mfKpiSummary.totalSipCount} SIPs • {mfKpiSummary.totalLsCount} LS
                      </span>
                      <span>All: ₹{formatCurrencyCompact(mfKpiSummary.allTimeDeposited)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Total Withdrawn / Redeemed */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-amber-500/10 dark:text-amber-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <ArrowUpRight size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Total Withdrawn
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-amber-500">
                      ₹{formatCurrency2Dec(mfKpiSummary.allTimeWithdrawn)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span className="badge badge-xs badge-warning font-bold text-[10px]">
                        {mfKpiSummary.totalWithdrawalCount} {mfKpiSummary.totalWithdrawalCount === 1 ? "Redemption" : "Redemptions"}
                      </span>
                      <span>
                        {mfKpiSummary.periodWithdrawn > 0
                          ? `Period: ₹${formatCurrencyCompact(mfKpiSummary.periodWithdrawn)}`
                          : "All-time redemptions"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Total Units Held */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-sky-500/10 dark:text-sky-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <Layers size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Total Units Held
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-sky-500">
                      {mfKpiSummary.allTimeUnitsHeld.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span>Added: +{mfKpiSummary.periodUnitsAdded.toFixed(2)}</span>
                      <span>•</span>
                      <span>Redeemed: -{mfKpiSummary.periodUnitsWithdrawn.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Expense Ratio & Avg NAV */}
              <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                {/* Light Background Watermark Icon */}
                <div className="absolute -right-3 -bottom-3 text-rose-500/10 dark:text-rose-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <Percent size={88} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Total ER Incurred
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl lg:text-3xl font-black font-mono text-rose-500">
                      ₹{formatCurrency2Dec(mfKpiSummary.allTimeEr)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                      <span className="badge badge-xs badge-info font-bold text-[10px]">
                        Avg NAV: ₹{mfKpiSummary.avgAcquisitionNav.toFixed(2)}
                      </span>
                      <span>Period: ₹{formatCurrencyCompact(mfKpiSummary.periodEr)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Main Mutual Fund Section Card */}
            <section className="card bg-base-200 shadow-md rounded-3xl overflow-hidden">
              <div className="card-body p-4 sm:p-6 space-y-6">
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-base-300 pb-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg sm:text-xl font-black tracking-tight text-base-content">
                        Mutual Funds Portfolio Analytics
                      </h3>
                      <span className="badge badge-sm badge-secondary font-bold">
                        {selectedMfFund === "all"
                          ? "Portfolio Aggregated"
                          : selectedGroupObj
                          ? `Group: ${selectedGroupObj.name}`
                          : selectedFundObj?.category || "Equity"}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>Portfolio:</span>
                      <span className="font-bold text-base-content">
                        {selectedMfFund === "all"
                          ? `All Mutual Funds (${activeMfFunds.length} schemes)`
                          : selectedGroupObj
                          ? `${selectedGroupObj.name} (${activeMfFunds.length} schemes in group)`
                          : selectedFundObj?.schemeName || selectedFundObj?.amc || "Selected Scheme"}
                      </span>
                      {selectedFundObj?.folioNumber && (
                        <>
                          <span>•</span>
                          <span className="badge badge-xs bg-base-200 font-mono font-bold">
                            Folio: {selectedFundObj.folioNumber}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>{filteredMfTransactions.length} transactions logged</span>
                    </p>
                  </div>

                  {/* Header Controls: Theme Picker & View Tab Switcher */}
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
                    {/* Theme Color Picker Dropdown */}
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-sm rounded-xl gap-2 border border-base-300/80 hover:bg-base-200"
                        title="Change visualization color accent"
                      >
                        <Palette size={14} />
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: currentThemeObj.hex }}
                        />
                        <span className="text-xs font-bold hidden sm:inline">{currentThemeObj.label}</span>
                        <ChevronDown size={12} className="opacity-60" />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow-2xl bg-base-100 rounded-2xl w-48 z-50 border border-base-300 mt-2"
                      >
                        <li className="menu-title text-[10px] font-bold uppercase tracking-wider text-base-content/50">
                          Chart Color Theme
                        </li>
                        {SALARY_COLOR_THEMES.map((theme) => (
                          <li key={theme.id}>
                            <button
                              onClick={() => {
                                setSelectedTheme(theme.id);
                                if (document.activeElement instanceof HTMLElement) {
                                  document.activeElement.blur();
                                }
                              }}
                              className={`flex items-center justify-between text-xs py-2 rounded-xl ${
                                selectedTheme === theme.id ? "bg-base-200 font-bold text-primary" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: theme.hex }}
                                />
                                <span>{theme.label}</span>
                              </div>
                              {selectedTheme === theme.id && (
                                <CheckCircle2 size={14} className="text-primary" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* View Switcher: Graph View vs Table View */}
                    <div className="bg-base-100 p-1 rounded-2xl flex items-center border border-base-300">
                      <button
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                          viewTab === "graph"
                            ? "bg-primary text-primary-content shadow-sm"
                            : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                        }`}
                        onClick={() => setViewTab("graph")}
                      >
                        <BarChart3 size={15} /> Graph View
                      </button>
                      <button
                        className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                          viewTab === "table"
                            ? "bg-primary text-primary-content shadow-sm"
                            : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                        }`}
                        onClick={() => setViewTab("table")}
                      >
                        <TableProperties size={15} /> Table View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metric Switcher Button Toolbar - User Requested Multi-Graph Switcher */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-base-100 p-3 rounded-2xl border border-base-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-base-content/70">
                    <Sparkles size={14} className="text-primary" />
                    <span>Select Metric Visualization:</span>
                  </div>

                  {/* 5 Interactive Metric Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    <button
                      onClick={() => setMfMetricMode("all")}
                      className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                        mfMetricMode === "all"
                          ? "bg-primary text-primary-content shadow-md scale-105"
                          : "btn-ghost text-base-content/80 hover:bg-base-300/60"
                      }`}
                    >
                      <BarChart3 size={12} />
                      All Graphs
                    </button>

                    <button
                      onClick={() => setMfMetricMode("cashflow")}
                      className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                        mfMetricMode === "cashflow"
                          ? "bg-primary text-primary-content shadow-md scale-105"
                          : "btn-ghost text-base-content/80 hover:bg-base-300/60"
                      }`}
                    >
                      <PiggyBank size={12} />
                      Deposits & Withdrawals
                    </button>

                    <button
                      onClick={() => setMfMetricMode("nav")}
                      className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                        mfMetricMode === "nav"
                          ? "bg-primary text-primary-content shadow-md scale-105"
                          : "btn-ghost text-base-content/80 hover:bg-base-300/60"
                      }`}
                    >
                      <TrendingUp size={12} />
                      NAV History
                    </button>

                    <button
                      onClick={() => setMfMetricMode("units")}
                      className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                        mfMetricMode === "units"
                          ? "bg-primary text-primary-content shadow-md scale-105"
                          : "btn-ghost text-base-content/80 hover:bg-base-300/60"
                      }`}
                    >
                      <Layers size={12} />
                      Units Allocated
                    </button>

                    <button
                      onClick={() => setMfMetricMode("er")}
                      className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                        mfMetricMode === "er"
                          ? "bg-primary text-primary-content shadow-md scale-105"
                          : "btn-ghost text-base-content/80 hover:bg-base-300/60"
                      }`}
                    >
                      <Percent size={12} />
                      Expense Ratio (ER)
                    </button>
                  </div>
                </div>

                {/* TAB 1: Graph View */}
                {viewTab === "graph" && (
                  <div className="space-y-4">
                    {mfMonthlyPlotData.length > 0 ? (
                      mfMetricMode === "all" ? (
                        /* All 4 Graphs Grid View */
                        <div className="space-y-6">
                          <div className="flex items-center justify-between px-2 text-xs font-semibold text-base-content/60">
                            <span>Displaying all 4 Mutual Fund analytical dimensions simultaneously:</span>
                            <span className="text-[11px] opacity-75">
                              Showing {mfMonthlyPlotData.length} monthly timeline periods
                            </span>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 [&_.apexcharts-tooltip]:!bg-transparent [&_.apexcharts-tooltip]:!border-none [&_.apexcharts-tooltip]:!shadow-none [&_.apexcharts-tooltip]:!p-0">
                            {/* 1. Deposits & Withdrawals */}
                            <div className="card bg-base-100 shadow-sm border border-base-300 p-4 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm flex items-center gap-1.5 text-base-content">
                                  <PiggyBank size={15} className="text-primary" />
                                  Deposits & Withdrawals Flow
                                </h3>
                                <span className="badge badge-xs badge-primary font-bold">Cashflow</span>
                              </div>
                              <Chart
                                options={mfCashflowOptions}
                                series={mfCashflowSeries}
                                type="line"
                                height={320}
                              />
                            </div>

                            {/* 2. Purchase NAV History */}
                            <div className="card bg-base-100 shadow-sm border border-base-300 p-4 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm flex items-center gap-1.5 text-base-content">
                                  <TrendingUp size={15} className="text-sky-500" />
                                  Purchase NAV Trajectory
                                </h3>
                                <span className="badge badge-xs badge-info font-bold">NAV (₹)</span>
                              </div>
                              <Chart
                                options={mfNavOptions}
                                series={mfNavSeries}
                                type="line"
                                height={320}
                              />
                            </div>

                            {/* 3. Units Allocated & Held */}
                            <div className="card bg-base-100 shadow-sm border border-base-300 p-4 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm flex items-center gap-1.5 text-base-content">
                                  <Layers size={15} className="text-indigo-500" />
                                  Units Allocated & Cumulative Balance
                                </h3>
                                <span className="badge badge-xs badge-ghost font-mono">Units (u)</span>
                              </div>
                              <Chart
                                options={mfUnitsOptions}
                                series={mfUnitsSeries}
                                type="line"
                                height={320}
                              />
                            </div>

                            {/* 4. Expense Ratio Incurred */}
                            <div className="card bg-base-100 shadow-sm border border-base-300 p-4 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm flex items-center gap-1.5 text-base-content">
                                  <Percent size={15} className="text-rose-500" />
                                  Expense Ratio (ER) Deducted
                                </h3>
                                <span className="badge badge-xs badge-error font-bold">ER Cost (₹)</span>
                              </div>
                              <Chart
                                options={mfErOptions}
                                series={mfErSeries}
                                type="line"
                                height={320}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Single Selected Graph View */
                        <div className="w-full [&_.apexcharts-tooltip]:!bg-transparent [&_.apexcharts-tooltip]:!border-none [&_.apexcharts-tooltip]:!shadow-none [&_.apexcharts-tooltip]:!p-0">
                          <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold text-base-content/60 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              {mfMetricMode === "cashflow" && (
                                <span>
                                  Showing <span className="font-bold text-base-content">Deposited Amount</span> (solid bar),{" "}
                                  <span className="font-bold text-base-content">Withdrawal Amount</span> (lighter bar), and{" "}
                                  <span className="font-bold text-sky-400">Net Cumulative Capital</span> (line).
                                </span>
                              )}
                              {mfMetricMode === "nav" && (
                                <span>
                                  Showing <span className="font-bold text-base-content">Purchase NAV Trajectory</span> across logged investment installments.
                                </span>
                              )}
                              {mfMetricMode === "units" && (
                                <span>
                                  Showing <span className="font-bold text-base-content">Units Added</span> vs{" "}
                                  <span className="font-bold text-base-content">Units Redeemed</span> and{" "}
                                  <span className="font-bold text-sky-400">Cumulative Units Balance</span>.
                                </span>
                              )}
                              {mfMetricMode === "er" && (
                                <span>
                                  Showing <span className="font-bold text-base-content">Expense Ratio (ER) Incurred</span> per month and{" "}
                                  <span className="font-bold text-sky-400">Cumulative ER Paid</span>.
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] opacity-75">
                              Showing {mfMonthlyPlotData.length} monthly timeline periods
                            </span>
                          </div>
                          <Chart
                            options={mfApexOptions}
                            series={mfApexSeries}
                            type="line"
                            height={440}
                          />
                        </div>
                      )
                    ) : (
                      <div className="p-12 text-center text-sm opacity-50 italic">
                        No Mutual Fund transactions match the selected scheme or date filter range.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Table View */}
                {viewTab === "table" && (
                  <div className="space-y-4">
                    {/* Sub-tab Navigation Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-base-100 p-3 rounded-2xl border border-base-300">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setMfTableSubTab("transactions")}
                          className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                            mfTableSubTab === "transactions"
                              ? "bg-primary text-primary-content shadow-sm"
                              : "btn-ghost text-base-content/70 hover:bg-base-300/50"
                          }`}
                        >
                          <Receipt size={13} />
                          Installments & Transactions ({filteredMfTransactions.length})
                        </button>
                        <button
                          onClick={() => setMfTableSubTab("monthly")}
                          className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                            mfTableSubTab === "monthly"
                              ? "bg-primary text-primary-content shadow-sm"
                              : "btn-ghost text-base-content/70 hover:bg-base-300/50"
                          }`}
                        >
                          <Calendar size={13} />
                          Monthly Timeline ({mfMonthlyPlotData.length})
                        </button>
                        <button
                          onClick={() => setMfTableSubTab("funds")}
                          className={`btn btn-xs rounded-xl font-bold px-3 transition-all ${
                            mfTableSubTab === "funds"
                              ? "bg-primary text-primary-content shadow-sm"
                              : "btn-ghost text-base-content/70 hover:bg-base-300/50"
                          }`}
                        >
                          <Briefcase size={13} />
                          Fund Schemes ({activeMfFunds.length})
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to="/dashboard/investment/table-entry?tab=mf"
                          className="btn btn-ghost btn-xs text-primary gap-1 font-bold"
                          title="Open Mutual Fund Table Entry"
                        >
                          <ExternalLink size={12} />
                          <span>Manage Mutual Funds in Table Entry</span>
                        </Link>
                      </div>
                    </div>

                    {/* Sub-Tab 1: Transactions Table */}
                    {mfTableSubTab === "transactions" && (
                      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
                        <table className="table w-full text-xs">
                          <thead className="bg-base-200/80 text-base-content font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                              <th className="py-3 px-4 text-center w-12">#</th>
                              <th className="py-3 px-4 min-w-[110px]">Date</th>
                              <th className="py-3 px-4 min-w-[180px]">Fund Scheme & AMC</th>
                              <th className="py-3 px-4 text-center min-w-[100px]">Type</th>
                              <th className="py-3 px-4 text-right min-w-[130px]">Amount</th>
                              <th className="py-3 px-4 text-right min-w-[100px]">NAV (₹)</th>
                              <th className="py-3 px-4 text-right min-w-[110px]">Units</th>
                              <th className="py-3 px-4 text-right min-w-[90px]">ER (₹)</th>
                              <th className="py-3 px-4 text-center w-20">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-base-200">
                            {filteredMfTransactions.length > 0 ? (
                              filteredMfTransactions.map((txn, index) => {
                                const typeLower = (txn.type || "").toLowerCase();
                                const isWithdrawal =
                                  typeLower.includes("withdr") ||
                                  typeLower.includes("redemp") ||
                                  typeLower.includes("swp");
                                const amtVal = Number(txn.amtDeposit ?? txn.amount ?? 0);
                                const actualVal =
                                  txn.actualAmt !== undefined && txn.actualAmt !== null
                                    ? Number(txn.actualAmt)
                                    : Math.max(0, Math.abs(amtVal) - Number(txn.er ?? 0));
                                const navVal = Number(txn.nav ?? 0);
                                const unitsVal = parseFloat(txn.units) || (navVal > 0 ? actualVal / navVal : 0);

                                return (
                                  <tr key={txn.id || index} className="hover:bg-base-200/40 transition-colors">
                                    <td className="py-3.5 px-4 text-center font-bold text-base-content/50">
                                      {index + 1}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                                      {txn.date ? dayjs(txn.date).format("DD MMM YYYY") : "—"}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div className="font-bold text-base-content text-xs max-w-xs truncate">
                                        {txn.fundName || txn.amc}
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="badge badge-xs badge-ghost text-[10px]">
                                          {txn.amc}
                                        </span>
                                        {txn.category && (
                                          <span className="badge badge-xs badge-info font-bold text-[10px]">
                                            {txn.category}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                      <span
                                        className={`badge badge-sm font-bold text-[10.5px] ${
                                          isWithdrawal
                                            ? "badge-warning text-amber-950 dark:text-amber-100"
                                            : txn.type === "Lumpsum" || txn.type === "LUMPSUM"
                                            ? "badge-info"
                                            : "badge-success text-emerald-950 dark:text-emerald-100"
                                        }`}
                                      >
                                        {txn.type || "SIP"}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono font-black text-sm whitespace-nowrap">
                                      <span className={isWithdrawal ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"}>
                                        {isWithdrawal ? "-" : "+"}₹{formatCurrency2Dec(actualVal > 0 ? actualVal : Math.abs(amtVal))}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap text-base-content/80">
                                      {navVal > 0 ? `₹${navVal.toFixed(2)}` : "—"}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono font-extrabold whitespace-nowrap text-sky-500">
                                      {unitsVal > 0 ? `${unitsVal.toFixed(3)} u` : "—"}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap text-rose-500">
                                      {Number(txn.er || 0) > 0 ? `₹${Number(txn.er).toFixed(2)}` : "—"}
                                    </td>
                                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                      <Link
                                        to="/dashboard/investment/table-entry?tab=mf"
                                        className="btn btn-ghost btn-xs text-primary gap-1 font-bold"
                                        title="View or Edit in Table Entry"
                                      >
                                        <ExternalLink size={12} />
                                        <span>View</span>
                                      </Link>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={9} className="py-8 text-center text-base-content/50 italic">
                                  No mutual fund transactions found for the selected period.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Sub-Tab 2: Monthly Timeline Aggregates */}
                    {mfTableSubTab === "monthly" && (
                      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
                        <table className="table w-full text-xs">
                          <thead className="bg-base-200/80 text-base-content font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                              <th className="py-3 px-4 min-w-[120px]">Month</th>
                              <th className="py-3 px-4 text-right min-w-[130px]">Deposited</th>
                              <th className="py-3 px-4 text-right min-w-[120px]">Withdrawn</th>
                              <th className="py-3 px-4 text-right min-w-[120px]">Net Inflow</th>
                              <th className="py-3 px-4 text-right min-w-[120px]">Units Added</th>
                              <th className="py-3 px-4 text-right min-w-[110px]">Avg NAV</th>
                              <th className="py-3 px-4 text-right min-w-[100px]">ER Paid</th>
                              <th className="py-3 px-4 text-right min-w-[150px]">Cumulative Invested</th>
                              <th className="py-3 px-4 text-right min-w-[140px]">Cumulative Units</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-base-200">
                            {mfMonthlyPlotData.length > 0 ? (
                              [...mfMonthlyPlotData].reverse().map((row) => (
                                <tr key={row.rawMonth} className="hover:bg-base-200/40 transition-colors">
                                  <td className="py-3.5 px-4 font-bold text-base-content whitespace-nowrap">
                                    {row.monthLabel}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                    ₹{formatCurrency2Dec(row.deposited)}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-500 whitespace-nowrap">
                                    {row.withdrawn > 0 ? `₹${formatCurrency2Dec(row.withdrawn)}` : "—"}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                                    <span className={row.netFlow >= 0 ? "text-primary" : "text-rose-500"}>
                                      {row.netFlow >= 0 ? "+" : ""}₹{formatCurrency2Dec(row.netFlow)}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                                    {row.unitsAdded > 0 ? `+${row.unitsAdded.toFixed(3)} u` : "—"}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap text-base-content/80">
                                    {row.avgNav > 0 ? `₹${row.avgNav.toFixed(2)}` : "—"}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-500 whitespace-nowrap">
                                    {row.er > 0 ? `₹${row.er.toFixed(2)}` : "—"}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-black text-sky-500 whitespace-nowrap">
                                    ₹{formatCurrency2Dec(row.cumulativeInvested)}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sky-400 whitespace-nowrap">
                                    {row.cumulativeUnits.toFixed(3)} u
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={9} className="py-8 text-center text-base-content/50 italic">
                                  No monthly records found for the selected period.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Sub-Tab 3: Fund Schemes Summary */}
                    {mfTableSubTab === "funds" && (
                      <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-sm">
                        <table className="table w-full text-xs">
                          <thead className="bg-base-200/80 text-base-content font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                              <th className="py-3 px-4 text-center w-12">#</th>
                              <th className="py-3 px-4 min-w-[200px]">Scheme Name & AMC</th>
                              <th className="py-3 px-4 min-w-[130px]">Category</th>
                              <th className="py-3 px-4 min-w-[110px]">Plan & Option</th>
                              <th className="py-3 px-4 min-w-[110px]">Folio Number</th>
                              <th className="py-3 px-4 text-right min-w-[120px]">Total Invested</th>
                              <th className="py-3 px-4 text-right min-w-[110px]">Total Redeemed</th>
                              <th className="py-3 px-4 text-right min-w-[110px]">Units Held</th>
                              <th className="py-3 px-4 text-center min-w-[80px]">Txns</th>
                              <th className="py-3 px-4 text-center w-20">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-base-200">
                            {activeMfFunds.map((fund, idx) => {
                              let fDeposit = 0;
                              let fWithdrawn = 0;
                              let fUnitsAdded = 0;
                              let fUnitsWithdrawn = 0;

                              (fund.transactions || []).forEach((t) => {
                                const typeLower = (t.type || "").toLowerCase();
                                const isW =
                                  typeLower.includes("withdr") ||
                                  typeLower.includes("redemp") ||
                                  typeLower.includes("swp");
                                const amt = Number(t.amtDeposit ?? t.amount ?? 0);
                                const er = Number(t.er ?? 0);
                                const act =
                                  t.actualAmt !== undefined && t.actualAmt !== null
                                    ? Number(t.actualAmt)
                                    : Math.max(0, Math.abs(amt) - er);
                                const nav = Number(t.nav ?? 0);
                                const u = parseFloat(t.units) || (nav > 0 ? act / nav : 0);

                                if (isW) {
                                  fWithdrawn += act > 0 ? act : Math.abs(amt);
                                  fUnitsWithdrawn += u;
                                } else {
                                  fDeposit += act > 0 ? act : amt;
                                  fUnitsAdded += u;
                                }
                              });

                              const netUnits = Math.max(0, fUnitsAdded - fUnitsWithdrawn);

                              return (
                                <tr key={fund.id || idx} className="hover:bg-base-200/40 transition-colors">
                                  <td className="py-3.5 px-4 text-center font-bold text-base-content/50">
                                    {idx + 1}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-base-content text-xs">
                                      {fund.schemeName || fund.amc}
                                    </div>
                                    <div className="text-[11px] text-base-content/60">{fund.amc}</div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="badge badge-sm badge-ghost font-bold text-[10.5px]">
                                      {fund.category || "Equity"}
                                    </span>
                                    {fund.subCategory && (
                                      <span className="text-[10.5px] text-base-content/60 block mt-0.5">
                                        {fund.subCategory}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-base-content/80 text-[11px]">
                                      {fund.plan || "Direct"}
                                    </div>
                                    <div className="text-[10.5px] text-base-content/50">
                                      {fund.optionType || "Growth"}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-xs text-base-content/80">
                                    {fund.folioNumber || "—"}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                    ₹{formatCurrency2Dec(fDeposit)}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-500 whitespace-nowrap">
                                    {fWithdrawn > 0 ? `₹${formatCurrency2Dec(fWithdrawn)}` : "—"}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sky-500 whitespace-nowrap">
                                    {netUnits.toFixed(3)} u
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <span className="badge badge-xs font-bold bg-base-200">
                                      {fund.transactions?.length || 0}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <Link
                                      to="/dashboard/investment/table-entry?tab=mf"
                                      className="btn btn-ghost btn-xs text-primary gap-1 font-bold"
                                      title="View or Edit Scheme in Table Entry"
                                    >
                                      <ExternalLink size={12} />
                                      <span>View</span>
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ================================================================ */}
        {/* STOCKS & EQUITY DASHBOARD VIEW */}
        {/* ================================================================ */}
        {!loading && stocksData.length > 0 && activeDashboard === "STOCKS" && (
          <StocksDashboard
            key={`stocks-dashboard-${stockSubView}`}
            stocksData={stocksData}
            loading={loading}
            fromYear={fromYear}
            fromMonth={fromMonth}
            toYear={toYear}
            toMonth={toMonth}
            activeSubView={stockSubView}
            onSubViewChange={setStockSubView}
          />
        )}

        {/* ================================================================ */}
        {/* FIXED DEPOSITS (FD) DASHBOARD VIEW */}
        {/* ================================================================ */}
        {!loading && fdData.length > 0 && activeDashboard === "FD" && (
          <FixedDepositDashboard
            fdData={fdData}
            loading={loading}
            onRefresh={fetchData}
          />
        )}

        {/* ================================================================ */}
        {/* RECURRING DEPOSITS (RD) SHOWCASE VIEW */}
        {/* ================================================================ */}
        {!loading && activeDashboard === "RD" && (
          <div className="card bg-base-200 shadow-md p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 rounded-3xl">
            <div
              className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center p-4 border shadow-sm ${currentDashboardMeta.bgClass}`}
            >
              {React.createElement(currentDashboardMeta.icon, { size: 38 })}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <h3 className="text-2xl font-black tracking-tight text-base-content">
                  {currentDashboardMeta.title} Dashboard
                </h3>
                <span className="badge badge-sm font-bold border bg-base-100 text-base-content/70">
                  {currentDashboardMeta.badgeLabel}
                </span>
              </div>
              <p className="text-sm text-base-content/65 max-w-lg mx-auto">
                {currentDashboardMeta.description}
              </p>
            </div>

            <div className="bg-base-100 border border-base-300 rounded-2xl p-5 text-left space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-2">
                <Sparkles size={14} className="text-primary" /> Features & Analytics In Progress
              </h4>
              <ul className="text-xs text-base-content/70 space-y-1.5 list-disc list-inside">
                <li>Monthly recurring deposit compounding, maturity forecasts & interest calendar.</li>
                <li>Installment payment schedules, due dates, and cumulative growth.</li>
                <li>Bank-wise interest yield comparison & maturity timeline ledger.</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/dashboard/investment/table-entry?tab=rd"
                className="btn btn-primary btn-sm gap-2 rounded-xl font-bold"
              >
                <TableProperties size={14} /> Open Recurring Deposits Table Entry
              </Link>
              <button
                type="button"
                onClick={() => setIsDashboardModalOpen(true)}
                className="btn btn-outline btn-sm gap-2 rounded-xl font-bold"
              >
                <LayoutGrid size={14} /> Switch Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MUTUAL FUND SELECTION MODAL POPUP */}
      {isMfModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMfModalOpen(false);
          }}
        >
          <div
            className="bg-base-100 w-full max-w-4xl max-h-[88vh] rounded-3xl shadow-2xl border border-base-300 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-base-200 bg-base-100/90 flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-base-content flex items-center gap-2 truncate">
                      Select Mutual Fund or Group
                    </h2>
                    <p className="text-xs text-base-content/60 truncate">
                      Filter dashboard analytics by all funds, custom group, or individual scheme
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    to="/dashboard/investment/table-entry?tab=mf"
                    onClick={() => setIsMfModalOpen(false)}
                    className="btn btn-ghost btn-xs text-primary gap-1 font-semibold hidden sm:inline-flex"
                    title="Manage Groups and Schemes in Table Entry"
                  >
                    <ExternalLink size={12} />
                    <span>Manage Groups</span>
                  </Link>
                  <button
                    onClick={() => setIsMfModalOpen(false)}
                    className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:bg-base-200"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Live Search Input */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search scheme name, AMC, category, or folio..."
                  value={mfSearchQuery}
                  onChange={(e) => setMfSearchQuery(e.target.value)}
                  className="input input-sm sm:input-md input-bordered w-full pl-9 pr-8 text-xs sm:text-sm bg-base-200/50 focus:bg-base-100 rounded-xl"
                  autoFocus
                />
                {mfSearchQuery && (
                  <button
                    onClick={() => setMfSearchQuery("")}
                    className="btn btn-ghost btn-xs btn-circle absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body - Scrollable Vertically, Strictly No Horizontal Scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-4">
              {/* Option: All Mutual Funds (When not searching) */}
              {!mfSearchQuery && (
                <div
                  onClick={() => {
                    setSelectedMfFund("all");
                    setIsMfModalOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedMfFund === "all"
                      ? "bg-purple-500/10 border-purple-500/50 shadow-sm ring-1 ring-purple-500/30"
                      : "bg-base-200/40 hover:bg-base-200/80 border-base-300/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedMfFund === "all"
                          ? "bg-purple-500 text-white"
                          : "bg-base-300/70 text-base-content/70"
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-base-content flex items-center gap-2">
                        <span>All Mutual Funds</span>
                        {selectedMfFund === "all" && (
                          <span className="badge badge-xs badge-primary font-semibold">Active</span>
                        )}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-2 mt-0.5">
                        <span>Combined analytics for all {mfData.length} schemes</span>
                      </div>
                    </div>
                  </div>

                  {selectedMfFund === "all" && (
                    <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                  )}
                </div>
              )}

              {/* Grouped Schemes */}
              {displayedGroupedMutualFunds.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Search className="w-8 h-8 mx-auto text-base-content/30 mb-2" />
                  <p className="font-bold text-sm text-base-content/80">No schemes found</p>
                  <p className="text-xs text-base-content/50 mt-1">
                    No mutual fund matches "{mfSearchQuery}"
                  </p>
                  <button
                    onClick={() => setMfSearchQuery("")}
                    className="btn btn-xs btn-ghost text-primary mt-3 font-semibold"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                displayedGroupedMutualFunds.map((group) => {
                  const isGroupSelected = selectedMfFund === `group:${group.id}`;
                  const isCollapsed = collapsedMfDropdownGroups.has(group.id);

                  return (
                    <div
                      key={`modal-group-${group.id}`}
                      className="border border-base-300/70 rounded-2xl bg-base-100 overflow-hidden shadow-xs"
                    >
                      {/* Group Header Bar */}
                      <div className="p-3 sm:px-4 bg-base-200/50 border-b border-base-300/50 flex items-center justify-between gap-2 flex-wrap">
                        <div
                          className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0"
                          onClick={() => toggleMfDropdownGroup(group.id)}
                        >
                          <span className="text-base-content/50">
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                          <FolderKanban className="w-4 h-4 text-purple-500 shrink-0" />
                          <span className="font-bold text-xs sm:text-sm text-base-content truncate">
                            {group.name}
                          </span>
                          <span className="badge badge-xs bg-base-300/70 text-base-content/70 font-bold">
                            {group.funds.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMfFund(`group:${group.id}`);
                              setIsMfModalOpen(false);
                            }}
                            className={`btn btn-xs rounded-lg font-bold gap-1 transition-all ${
                              isGroupSelected
                                ? "btn-primary shadow-xs"
                                : "btn-ghost border border-base-300 hover:bg-base-200 text-base-content/80"
                            }`}
                            title={`Filter dashboard to all ${group.funds.length} funds in ${group.name}`}
                          >
                            {isGroupSelected ? (
                              <>
                                <CheckCircle2 size={12} />
                                <span>Active Group</span>
                              </>
                            ) : (
                              <span>Filter whole group</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Funds in this Group (Grid view) */}
                      {!isCollapsed && (
                        <div className="p-2.5 sm:p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {group.funds.map((fund) => {
                            const fundId = String(fund.id || fund._id);
                            const isFundSelected = selectedMfFund === fundId;

                            return (
                              <div
                                key={`modal-fund-${fundId}`}
                                onClick={() => {
                                  setSelectedMfFund(fundId);
                                  setIsMfModalOpen(false);
                                }}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                  isFundSelected
                                    ? "bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/30 shadow-xs"
                                    : "bg-base-200/30 hover:bg-base-200/80 border-base-300/50 hover:border-base-300"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-xs text-base-content truncate leading-tight">
                                    {fund.schemeName || fund.amc || "Unnamed Scheme"}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[11px] text-base-content/60">
                                    {fund.amc && (
                                      <span className="font-medium truncate max-w-[130px]">
                                        {fund.amc}
                                      </span>
                                    )}
                                    {fund.category && (
                                      <span className="badge badge-xs bg-base-300/60 font-semibold truncate max-w-[120px]">
                                        {fund.category}
                                      </span>
                                    )}
                                    {fund.folioNumber && (
                                      <span className="font-mono text-[10px] opacity-70">
                                        #{fund.folioNumber}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1.5">
                                  <span className="badge badge-xs font-bold bg-base-200 text-base-content/70">
                                    {fund.transactions?.length || 0} tx
                                  </span>
                                  {isFundSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:px-5 py-3 border-t border-base-200 bg-base-200/30 flex items-center justify-between gap-3 shrink-0">
              <Link
                to="/dashboard/investment/table-entry?tab=mf"
                onClick={() => setIsMfModalOpen(false)}
                className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
              >
                <ExternalLink size={13} />
                <span>Manage Schemes & Groups</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMfModalOpen(false)}
                className="btn btn-sm btn-ghost border border-base-300 rounded-xl px-4 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* DASHBOARD SELECTION MODAL POPUP */}
      {/* ================================================================ */}
      <SelectDashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        activeDashboard={activeDashboard}
        onSelectDashboard={handleSelectDashboard}
        counts={{
          SALARY: salaryData.length,
          PF: salaryData.length + pfWithdrawals.length,
          MF: mfData.length,
          STOCKS: stocksData.length,
          FD: fdData.length,
        }}
      />
    </div>
  );
}

