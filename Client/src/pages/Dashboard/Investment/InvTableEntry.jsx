import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  PieChart,
  ShieldAlert,
  Landmark,
  PiggyBank,
  Percent,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Info,
  Calendar,
  Building2,
  Briefcase,
  Table,
  Edit,
  Trash2,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Coins,
  Clock,
  Hash,
  Columns,
  CheckSquare,
  Square,
  RotateCcw,
  Check,
  Pencil,
  X,
} from "lucide-react";
import { TitleChanger } from "../../../utils/TitleChanger";
import AddStockTradeModal from "../../../components/Dashboard/Investment/AddStockTradeModal";
import StockTradeCalculationModal from "../../../components/Dashboard/Investment/StockTradeCalculationModal";
import axiosInstance from "../../../Context/AxiosInstance";

// ----------------------------------------------------------------------
// Initial Stocks Data (Empty by Default)
// ----------------------------------------------------------------------
const INITIAL_STOCKS_DATA = [];

// ----------------------------------------------------------------------
// Table Columns Registry Configuration
// ----------------------------------------------------------------------
const ALL_COLUMNS = [
  { id: "slno", label: "SLNo.", category: "fixed", locked: true },
  { id: "name", label: "Name", category: "fixed", locked: true },
  // Buy Columns Set
  { id: "bDate", label: "B-Date", category: "buy", icon: Calendar },
  { id: "bQty", label: "B-Qty", category: "buy", icon: Layers },
  { id: "bShare", label: "B-Share", category: "buy", icon: Coins },
  { id: "bStock", label: "B-Stock", category: "buy", icon: PiggyBank },
  { id: "bBkg", label: "B-BKG", category: "buy", icon: Percent, tooltip: "Buy Brokerage Charges" },
  { id: "bPdc", label: "B-PDC", category: "buy", icon: Percent, tooltip: "Buy PDC / Taxes / STT" },
  { id: "bBkgPdc", label: "B-BKG+PDC", category: "buy", icon: Percent, tooltip: "Total Buy Charges" },
  { id: "bTT", label: "B-TT", category: "buy", icon: Landmark, tooltip: "Buy Total Transaction Amount" },
  { id: "bFShare", label: "B-FShare", category: "buy", icon: TrendingUp, tooltip: "Buy Effective Final Share Price" },
  { id: "bFStock", label: "B-FStock", category: "buy", icon: PiggyBank, tooltip: "Buy Final Value" },
  // Sell Columns Set
  { id: "sDate", label: "S-Date", category: "sell", icon: Calendar },
  { id: "sQty", label: "S-Qty", category: "sell", icon: Layers },
  { id: "sShare", label: "S-Share", category: "sell", icon: Coins },
  { id: "sStock", label: "S-Stock", category: "sell", icon: PiggyBank },
  { id: "sBkg", label: "S-BKG", category: "sell", icon: Percent, tooltip: "Sell Brokerage Charges" },
  { id: "sPdc", label: "S-PDC", category: "sell", icon: Percent, tooltip: "Sell PDC / Taxes / STT" },
  { id: "sBkgPdc", label: "S-BKG+PDC", category: "sell", icon: Percent, tooltip: "Total Sell Charges" },
  { id: "dp", label: "DP", category: "sell", icon: ShieldAlert, tooltip: "Depository Participant Charges" },
  { id: "sTT", label: "S-TT", category: "sell", icon: Landmark, tooltip: "Sell Total Transaction Amount" },
  { id: "sFShare", label: "S-FShare", category: "sell", icon: TrendingUp, tooltip: "Sell Net Final Share Price" },
  { id: "sFStock", label: "S-FStock", category: "sell", icon: PiggyBank, tooltip: "Sell Net Realization" },
  // Other Columns Set
  { id: "period", label: "Period", category: "other", icon: Clock },
  { id: "qLeft", label: "Q-Left", category: "other", icon: Layers, tooltip: "Quantity Left / Holdings Remaining" },
  { id: "platform", label: "Platform", category: "other", icon: Building2 },
  { id: "cap", label: "CAP", category: "other", icon: PieChart },
  { id: "exchange", label: "Exchange", category: "other", icon: Landmark },
  { id: "term", label: "Term", category: "other", icon: Sparkles },
  { id: "gainRs", label: "Gain(₹)", category: "other", icon: TrendingUp },
  { id: "gainPercent", label: "Gain(%)", category: "other", icon: Percent },
  { id: "actions", label: "Actions", category: "fixed", locked: true },
];

export default function InvTableEntry() {
  TitleChanger("Progress Pulse | Investment Tracker Logging");

  // ----------------------------------------------------------------------
  // State Definitions
  // ----------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState("stocks"); // "stocks" | "mf" | "ef" | "fd" | "rd" | "pf"
  const [stocksTypeFilter, setStocksTypeFilter] = useState("all"); // "all" | "delivery" | "intraday"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "holding" | "sold"
  const [sortBy, setSortBy] = useState("default"); // colId or "default"
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" | "asc"
  const [searchQuery, setSearchQuery] = useState("");
  const [capFilter, setCapFilter] = useState("all"); // "all" | "large" | "mid" | "small"
  const [platformFilter, setPlatformFilter] = useState("all"); // "all" | "zerodha" | "groww" ...
  const [columnFilters, setColumnFilters] = useState({}); // per-column filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Table View Modal Popup state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Visible Columns Preference State (Persisted in localStorage)
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("inv_table_visible_columns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse stored visible columns", e);
      }
    }
    return ALL_COLUMNS.map((c) => c.id);
  });

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  const isColVisible = (colId) => visibleColumns.includes(colId);

  const toggleColumn = (colId) => {
    const colObj = ALL_COLUMNS.find((c) => c.id === colId);
    if (colObj?.locked) return; // Locked columns cannot be hidden
    let updated;
    if (visibleColumns.includes(colId)) {
      updated = visibleColumns.filter((id) => id !== colId);
    } else {
      updated = [...visibleColumns, colId];
    }
    setVisibleColumns(updated);
    localStorage.setItem("inv_table_visible_columns", JSON.stringify(updated));
  };

  const handleSelectAllColumns = () => {
    const allIds = ALL_COLUMNS.map((c) => c.id);
    setVisibleColumns(allIds);
    localStorage.setItem("inv_table_visible_columns", JSON.stringify(allIds));
  };

  const handleDeselectOptionalColumns = () => {
    const lockedIds = ALL_COLUMNS.filter((c) => c.locked).map((c) => c.id);
    setVisibleColumns(lockedIds);
    localStorage.setItem("inv_table_visible_columns", JSON.stringify(lockedIds));
  };

  const handleResetDefaultColumns = () => {
    const allIds = ALL_COLUMNS.map((c) => c.id);
    setVisibleColumns(allIds);
    localStorage.setItem("inv_table_visible_columns", JSON.stringify(allIds));
  };

  const [stocksData, setStocksData] = useState(INITIAL_STOCKS_DATA);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoStock, setInfoStock] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch stocks data from DB on mount
  const fetchStockTrades = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/v1/dashboard/investment/stocks");
      if (res.data && res.data.success) {
        setStocksData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching stock trades:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStockTrades();
  }, []);

  const calculateStockTerm = (stock) => {
    if (!stock) return "";
    let days = stock.period || 0;
    if (stock.sDate && stock.sDate !== "-") {
      if (!days && stock.bDate) {
        const d1 = new Date(stock.bDate);
        const d2 = new Date(stock.sDate);
        const diff = d2.getTime() - d1.getTime();
        days = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
      }
    } else if (stock.bDate) {
      const d1 = new Date(stock.bDate);
      const d2 = new Date();
      const diff = d2.getTime() - d1.getTime();
      days = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
    }
    if (days <= 1) return "Intraday (1D)";
    if (days <= 2) return "BTST (2D)";
    if (days <= 29) return "Swing (2D-1M)";
    if (days <= 90) return "Positional (1M-3M)";
    if (days <= 270) return "Short Term (3M-6M)";
    if (days <= 360) return "Medium Term (6M-1Y)";
    return "Long Term (1Y-Max)";
  };

  const handleOpenAddModal = () => {
    setEditingStock(null);
    setIsAddStockModalOpen(true);
  };

  const handleOpenEditModal = (stock) => {
    setEditingStock(stock);
    setIsAddStockModalOpen(true);
  };

  const handleOpenInfoModal = (stock) => {
    setInfoStock(stock);
    setIsInfoModalOpen(true);
  };

  const handleDeleteStockTrade = async (stockId) => {
    if (!window.confirm("Are you sure you want to delete this stock trade entry?")) return;
    try {
      const res = await axiosInstance.delete(`/v1/dashboard/investment/stocks/${stockId}`);
      if (res.data && res.data.success) {
        setStocksData((prev) => prev.filter((item) => item.id !== stockId));
      }
      fetchStockTrades();
    } catch (error) {
      console.error("Error deleting stock trade:", error);
      alert("Failed to delete stock trade.");
    }
  };

  const handleSaveStockTrade = async (tradeObj, isEdit) => {
    try {
      if (isEdit) {
        const res = await axiosInstance.put(
          `/v1/dashboard/investment/stocks/${tradeObj.id}`,
          tradeObj
        );
        if (res.data && res.data.success) {
          setStocksData((prev) =>
            prev.map((item) => (item.id === tradeObj.id ? res.data.data : item))
          );
        }
      } else {
        const res = await axiosInstance.post(
          "/v1/dashboard/investment/stocks",
          tradeObj
        );
        if (res.data && res.data.success) {
          setStocksData((prev) => [res.data.data, ...prev]);
        }
      }
      fetchStockTrades();
    } catch (error) {
      console.error("Error saving stock trade to database:", error);
      alert("Failed to save stock trade to database.");
    }
  };

  // Category Configuration Options
  const categories = [
    {
      id: "stocks",
      label: "Stocks",
      subLabel: "Delivery & Intraday Trades",
      icon: TrendingUp,
      badge: `${stocksData.length} Trades`,
      badgeColor: "badge-primary",
    },
    {
      id: "mf",
      label: "Mutual Fund",
      subLabel: "SIP & Lumpsum Equity/Debt",
      icon: PieChart,
      badge: "SIP Active",
      badgeColor: "badge-secondary",
    },
    {
      id: "ef",
      label: "Emergency Fund",
      subLabel: "Liquid Funds & High-Yield Savings",
      icon: ShieldAlert,
      badge: "6 Months Cover",
      badgeColor: "badge-warning",
    },
    {
      id: "fd",
      label: "FD (Fixed Deposit)",
      subLabel: "Bank & NBFC Fixed Term Deposits",
      icon: Landmark,
      badge: "Guaranteed Return",
      badgeColor: "badge-info",
    },
    {
      id: "rd",
      label: "RD (Recurring)",
      subLabel: "Monthly Systematic Savings",
      icon: PiggyBank,
      badge: "Monthly Deposit",
      badgeColor: "badge-accent",
    },
    {
      id: "pf",
      label: "PF (Provident Fund)",
      subLabel: "EPF & PPF Retirement Funds",
      icon: Percent,
      badge: "Tax Exempt EEE",
      badgeColor: "badge-success",
    },
  ];

  // Helper to extract raw value for sorting/filtering per column
  const getColumnValue = (stock, colId) => {
    switch (colId) {
      case "slno":
        return stock.slNo || 0;
      case "name":
        return (stock.name || "").toLowerCase();
      case "bDate":
        return stock.bDate ? new Date(stock.bDate).getTime() : 0;
      case "bQty":
        return stock.bQty || 0;
      case "bShare":
        return stock.bShare || 0;
      case "bStock":
        return stock.bStock || 0;
      case "bBkg":
        return stock.bBkg || 0;
      case "bPdc":
        return stock.bPdc || 0;
      case "bBkgPdc":
        return stock.bBkgPdc || 0;
      case "bFShare":
        return stock.bFShare || 0;
      case "bFStock":
      case "invested":
        return stock.bFStock || 0;
      case "bTT":
        return stock.bTt || 0;
      case "period":
      case "holdingDays":
        return stock.period || 0;
      case "sDate":
        return stock.sDate && stock.sDate !== "-" ? new Date(stock.sDate).getTime() : 0;
      case "sQty":
      case "holdingQty":
        return stock.sQty || 0;
      case "sShare":
        return stock.sShare || 0;
      case "sStock":
        return stock.sStock || 0;
      case "sBkg":
        return stock.sBkg || 0;
      case "sPdc":
        return stock.sPdc || 0;
      case "sBkgPdc":
        return stock.sBkgPdc || 0;
      case "dp":
        return stock.dp || 0;
      case "sFShare":
        return stock.sFShare || 0;
      case "sFStock":
        return stock.sFStock || 0;
      case "sTT":
        return stock.sTt || 0;
      case "qLeft":
        return stock.qLeft !== undefined ? stock.qLeft : stock.bQty || 0;
      case "platform":
        return (stock.platform || "").toLowerCase();
      case "cap":
        return (stock.cap || "").toLowerCase();
      case "exchange":
        return (stock.exchange || "").toLowerCase();
      case "term":
        return (stock.term || "").toLowerCase();
      case "gainRs":
        return stock.gainRs || 0;
      case "gainPct":
      case "gainPercent":
        return stock.gainPct || 0;
      case "buyDate":
        return stock.bDate ? new Date(stock.bDate).getTime() : 0;
      case "sellDate":
        return stock.sDate && stock.sDate !== "-" ? new Date(stock.sDate).getTime() : 0;
      default:
        return stock.slNo || 0;
    }
  };

  const updateColumnFilter = (colId, value) => {
    setColumnFilters((prev) => {
      if (!value || value === "all" || value === "") {
        const copy = { ...prev };
        delete copy[colId];
        return copy;
      }
      return { ...prev, [colId]: value };
    });
  };

  const handleColumnSort = (colId) => {
    if (colId === "actions") return;
    if (sortBy === colId) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(colId);
      setSortOrder("desc");
    }
  };

  const clearAllFilters = () => {
    setStocksTypeFilter("all");
    setStatusFilter("all");
    setCapFilter("all");
    setPlatformFilter("all");
    setSearchQuery("");
    setColumnFilters({});
    setSortBy("default");
    setSortOrder("desc");
  };

  // ----------------------------------------------------------------------
  // Filtered & Sorted Stocks Logic
  // ----------------------------------------------------------------------
  const filteredStocks = useMemo(() => {
    let result = stocksData.filter((stock) => {
      // Trade Type Filter
      if (
        stocksTypeFilter !== "all" &&
        stock.term.toLowerCase() !== stocksTypeFilter.toLowerCase()
      ) {
        return false;
      }
      // Position Status Filter: holding vs sold
      if (statusFilter === "holding" && stock.qLeft <= 0) {
        return false;
      }
      if (statusFilter === "sold" && stock.qLeft > 0) {
        return false;
      }
      // Cap Filter
      if (
        capFilter !== "all" &&
        stock.cap.toLowerCase() !== capFilter.toLowerCase()
      ) {
        return false;
      }
      // Platform Filter
      if (
        platformFilter !== "all" &&
        stock.platform.toLowerCase() !== platformFilter.toLowerCase()
      ) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = stock.name.toLowerCase().includes(q);
        const matchesPlatform = stock.platform.toLowerCase().includes(q);
        const matchesExchange = stock.exchange.toLowerCase().includes(q);
        if (!matchesName && !matchesPlatform && !matchesExchange) return false;
      }

      // Per-Column Filters
      for (const [colKey, filterVal] of Object.entries(columnFilters)) {
        if (!filterVal || filterVal === "all") continue;
        if (colKey === "exchange" && stock.exchange.toLowerCase() !== filterVal.toLowerCase()) {
          return false;
        }
        if (colKey === "gainRs") {
          if (filterVal === "profit" && stock.gainRs < 0) return false;
          if (filterVal === "loss" && stock.gainRs >= 0) return false;
        }
        if (colKey === "gainPercent") {
          if (filterVal === "profit" && stock.gainPct < 0) return false;
          if (filterVal === "loss" && stock.gainPct >= 0) return false;
        }
        // General text substring search for column
        const rawVal = getColumnValue(stock, colKey);
        const strVal = String(rawVal).toLowerCase();
        if (!strVal.includes(filterVal.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Reorder / Sorting Logic for any active column or preset
    if (sortBy && sortBy !== "default") {
      result.sort((a, b) => {
        const valA = getColumnValue(a, sortBy);
        const valB = getColumnValue(b, sortBy);
        if (typeof valA === "string" && typeof valB === "string") {
          const comp = valA.localeCompare(valB);
          return sortOrder === "asc" ? comp : -comp;
        }
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
    } else {
      result.sort((a, b) => {
        return sortOrder === "asc" ? a.slNo - b.slNo : b.slNo - a.slNo;
      });
    }

    return result;
  }, [
    stocksData,
    stocksTypeFilter,
    statusFilter,
    capFilter,
    platformFilter,
    searchQuery,
    columnFilters,
    sortBy,
    sortOrder,
  ]);

  // Reset pagination to page 1 on filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    stocksTypeFilter,
    statusFilter,
    capFilter,
    platformFilter,
    searchQuery,
    columnFilters,
    sortBy,
    sortOrder,
    itemsPerPage,
  ]);

  // Paginated Stocks Slice & Total Pages
  const paginatedStocks = useMemo(() => {
    if (itemsPerPage === "all") return filteredStocks;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStocks.slice(start, start + itemsPerPage);
  }, [filteredStocks, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === "all") return 1;
    return Math.max(1, Math.ceil(filteredStocks.length / itemsPerPage));
  }, [filteredStocks.length, itemsPerPage]);

  // Render Column Filter Controls inside header dropdown
  const renderColumnFilterControl = (colKey, label) => {
    const currentVal = columnFilters[colKey] || "";

    if (colKey === "name") {
      return (
        <div className="p-1 space-y-2">
          <input
            type="text"
            placeholder="Filter Stock Name..."
            className="input input-xs input-bordered w-full rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="text-xs text-error hover:underline cursor-pointer pt-1"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          )}
        </div>
      );
    }

    if (colKey === "cap") {
      return (
        <div className="space-y-1">
          {[
            { value: "all", label: "All Caps" },
            { value: "large", label: "Large Cap" },
            { value: "mid", label: "Mid Cap" },
            { value: "small", label: "Small Cap" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                capFilter === opt.value
                  ? "bg-primary text-primary-content font-bold"
                  : "hover:bg-base-200"
              }`}
              onClick={() => {
                setCapFilter(opt.value);
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (colKey === "platform") {
      return (
        <div className="space-y-1">
          {[
            { value: "all", label: "All Brokers" },
            { value: "zerodha", label: "Zerodha" },
            { value: "groww", label: "Groww" },
            { value: "angelone", label: "AngelOne" },
            { value: "upstox", label: "Upstox" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                platformFilter === opt.value
                  ? "bg-primary text-primary-content font-bold"
                  : "hover:bg-base-200"
              }`}
              onClick={() => {
                setPlatformFilter(opt.value);
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (colKey === "term") {
      return (
        <div className="space-y-1">
          {[
            { value: "all", label: "All Trade Types" },
            { value: "delivery", label: "Delivery" },
            { value: "intraday", label: "Intraday" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                stocksTypeFilter === opt.value
                  ? "bg-primary text-primary-content font-bold"
                  : "hover:bg-base-200"
              }`}
              onClick={() => {
                setStocksTypeFilter(opt.value);
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (colKey === "status" || colKey === "qLeft") {
      return (
        <div className="space-y-1">
          {[
            { value: "all", label: "All Positions" },
            { value: "holding", label: "Holding Active (>0 Qty)" },
            { value: "sold", label: "Sold Out (0 Qty)" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === opt.value
                  ? "bg-primary text-primary-content font-bold"
                  : "hover:bg-base-200"
              }`}
              onClick={() => {
                setStatusFilter(opt.value);
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (colKey === "exchange") {
      return (
        <div className="space-y-1">
          {[
            { value: "all", label: "All Exchanges" },
            { value: "nse", label: "NSE" },
            { value: "bse", label: "BSE" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                (columnFilters.exchange || "all") === opt.value
                  ? "bg-primary text-primary-content font-bold"
                  : "hover:bg-base-200"
              }`}
              onClick={() => {
                updateColumnFilter("exchange", opt.value);
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (colKey === "gainRs" || colKey === "gainPercent") {
      return (
        <div className="space-y-1">
          {[
            { value: "all", label: "All PnL Results" },
            { value: "profit", label: "Profit Only (> 0)" },
            { value: "loss", label: "Loss Only (< 0)" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                (columnFilters[colKey] || "all") === opt.value
                  ? "bg-primary text-primary-content font-bold"
                  : "hover:bg-base-200"
              }`}
              onClick={() => {
                updateColumnFilter(colKey, opt.value);
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    // Generic input filter for any other column
    return (
      <div className="p-1 space-y-2">
        <input
          type="text"
          placeholder={`Filter ${label}...`}
          className="input input-xs input-bordered w-full rounded-lg"
          value={currentVal}
          onChange={(e) => updateColumnFilter(colKey, e.target.value)}
        />
        {currentVal && (
          <button
            type="button"
            className="text-xs text-error hover:underline cursor-pointer pt-1"
            onClick={() => updateColumnFilter(colKey, null)}
          >
            Clear Filter
          </button>
        )}
      </div>
    );
  };

  // Column Header Renderer with Sort Icon & Filter Button on EVERY column
  const renderTableHeaderCell = (
    label,
    colKey = null,
    IconComponent = null,
    title = null,
    extraClass = ""
  ) => {
    const isSorted = sortBy === colKey;
    const filterVal = columnFilters[colKey];
    let isFiltered = Boolean(filterVal && filterVal !== "all");

    // Also check top-level filters for specific columns
    if (colKey === "name" && searchQuery.trim()) isFiltered = true;
    if (colKey === "cap" && capFilter !== "all") isFiltered = true;
    if (colKey === "platform" && platformFilter !== "all") isFiltered = true;
    if (colKey === "term" && stocksTypeFilter !== "all") isFiltered = true;
    if ((colKey === "status" || colKey === "qLeft") && statusFilter !== "all") isFiltered = true;

    const colCategory = ALL_COLUMNS.find((c) => c.id === colKey)?.category;
    const isBuyCol = colCategory === "buy";
    const isSellCol = colCategory === "sell";

    let categoryHeaderClasses = "bg-base-200 text-base-content border-base-300";
    let iconClass = "w-3.5 h-3.5 text-primary shrink-0";
    let textClass = "hover:text-primary";
    let sortIconClass = "text-base-content/40 hover:text-primary";
    let activeSortIconClass = "text-primary";

    if (isBuyCol) {
      const isHighlighted = extraClass.includes("bg-base-300/40") || extraClass.includes("bg-emerald");
      categoryHeaderClasses = isHighlighted
        ? "bg-emerald-500/25 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 border-emerald-500/40"
        : "bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-500/25";
      iconClass = "w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0";
      textClass = "hover:text-emerald-600 dark:hover:text-emerald-300";
      sortIconClass = "text-emerald-600/40 hover:text-emerald-600 dark:text-emerald-400/40 dark:hover:text-emerald-300";
      activeSortIconClass = "text-emerald-600 dark:text-emerald-400";
    } else if (isSellCol) {
      const isHighlighted = extraClass.includes("bg-base-300/40") || extraClass.includes("bg-rose");
      categoryHeaderClasses = isHighlighted
        ? "bg-rose-500/25 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 border-rose-500/40"
        : "bg-rose-500/15 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-500/25";
      iconClass = "w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0";
      textClass = "hover:text-rose-600 dark:hover:text-rose-300";
      sortIconClass = "text-rose-600/40 hover:text-rose-600 dark:text-rose-400/40 dark:hover:text-rose-300";
      activeSortIconClass = "text-rose-600 dark:text-rose-400";
    }

    return (
      <th
        className={`sticky top-0 z-30 font-bold px-3 py-2.5 text-center border whitespace-nowrap shadow-xs select-none relative ${categoryHeaderClasses} ${extraClass}`}
        title={title || undefined}
      >
        {/* Buy Operator Symbols */}
        {colKey === "bQty" && isColVisible("bShare") && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
            title="Multiply Qty × Share Price"
          >
            ×
          </span>
        )}
        {colKey === "bShare" && isColVisible("bStock") && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
            title="Equals B-Stock Value"
          >
            =
          </span>
        )}
        {colKey === "bBkg" && isColVisible("bPdc") && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
            title="Plus +"
          >
            +
          </span>
        )}
        {colKey === "bPdc" && isColVisible("bBkgPdc") && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
            title="Equals B-BKG+PDC Total"
          >
            =
          </span>
        )}
        {/* Sell Operator Symbols */}
        {colKey === "sQty" && isColVisible("sShare") && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
            title="Multiply Qty × Share Price"
          >
            ×
          </span>
        )}
        {colKey === "sShare" && isColVisible("sStock") && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
            title="Equals S-Stock Value"
          >
            =
          </span>
        )}
        {colKey === "sBkg" && isColVisible("sPdc") && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
            title="Plus +"
          >
            +
          </span>
        )}
        {colKey === "sPdc" && isColVisible("sBkgPdc") && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
            title="Equals S-BKG+PDC Total"
          >
            =
          </span>
        )}
        <div className="flex items-center justify-center gap-1.5 font-bold whitespace-nowrap relative z-10">
          {IconComponent && <IconComponent className={iconClass} />}

          {colKey && colKey !== "actions" ? (
            <button
              type="button"
              onClick={() => handleColumnSort(colKey)}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${textClass}`}
              title={`Click to sort by ${label}`}
            >
              <span>{label}</span>
              {isSorted ? (
                sortOrder === "asc" ? (
                  <ArrowUp className={`w-3.5 h-3.5 font-extrabold shrink-0 ${activeSortIconClass}`} />
                ) : (
                  <ArrowDown className={`w-3.5 h-3.5 font-extrabold shrink-0 ${activeSortIconClass}`} />
                )
              ) : (
                <ArrowUpDown className={`w-3 h-3 shrink-0 transition-colors ${sortIconClass}`} />
              )}
            </button>
          ) : (
            <span>{label}</span>
          )}

          {label === "Actions" && (
            <button
              type="button"
              onClick={() => setIsColumnModalOpen(true)}
              className="p-1.5 rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-primary-content transition-all ml-1 cursor-pointer shrink-0 shadow-xs"
              title="Customize Visible Table Columns"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

        </div>
      </th>
    );
  };

  // Overall Stats summary for Stocks
  const stocksStats = useMemo(() => {
    let totalInvested = 0;
    let totalRealizedGain = 0;
    let openPositions = 0;

    stocksData.forEach((s) => {
      totalInvested += s.bFStock || 0;
      totalRealizedGain += s.gainRs || 0;
      if (s.qLeft > 0) openPositions += 1;
    });

    return {
      totalInvested,
      totalRealizedGain,
      openPositions,
      totalCount: stocksData.length,
    };
  }, [stocksData]);

  // Totals for all numeric columns in table footer
  const tableTotals = useMemo(() => {
    let bQty = 0;
    let bStock = 0;
    let bBkg = 0;
    let bPdc = 0;
    let bBkgPdc = 0;
    let bTt = 0;
    let bFStock = 0;
    let sQty = 0;
    let sStock = 0;
    let sBkg = 0;
    let sPdc = 0;
    let sBkgPdc = 0;
    let dp = 0;
    let sTt = 0;
    let sFStock = 0;
    let qLeft = 0;
    let gainRs = 0;

    paginatedStocks.forEach((s) => {
      bQty += Number(s.bQty) || 0;
      bStock += Number(s.bStock) || 0;
      bBkg += Number(s.bBkg) || 0;
      bPdc += Number(s.bPdc) || 0;
      bBkgPdc += Number(s.bBkgPdc) || 0;
      bTt += Number(s.bTt) || 0;
      bFStock += Number(s.bFStock) || 0;
      sQty += Number(s.sQty) || 0;
      sStock += Number(s.sStock) || 0;
      sBkg += Number(s.sBkg) || 0;
      sPdc += Number(s.sPdc) || 0;
      sBkgPdc += Number(s.sBkgPdc) || 0;
      dp += Number(s.dp) || 0;
      sTt += Number(s.sTt) || 0;
      sFStock += Number(s.sFStock) || 0;
      qLeft += Number(s.qLeft) || 0;
      gainRs += Number(s.gainRs) || 0;
    });

    const gainPct = bFStock > 0 ? (gainRs / bFStock) * 100 : 0;

    return {
      bQty,
      bStock,
      bBkg,
      bPdc,
      bBkgPdc,
      bTt,
      bFStock,
      sQty,
      sStock,
      sBkg,
      sPdc,
      sBkgPdc,
      dp,
      sTt,
      sFStock,
      qLeft,
      gainRs,
      gainPct,
    };
  }, [paginatedStocks]);

  // Format Helper Functions
  const formatINR = (val) => {
    if (val === undefined || val === null || isNaN(val) || val === "-")
      return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDateCell = (dStr) => {
    if (!dStr || dStr === "-") return "-";
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <div className="pb-12 max-w-full overflow-visible space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* Sticky Glassmorphism Header: Category Navigation Tabs & Filters   */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky -top-4 -mx-4 px-4 pt-4 pb-3 z-50 bg-base-100/95 backdrop-blur-2xl border-b border-base-200/80 shadow-2xl space-y-2.5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="bg-base-100/80 backdrop-blur-md p-2 rounded-2xl border border-base-200/70 shadow-sm overflow-x-auto flex-1">
            <div className="flex items-center gap-1.5 min-w-max">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeTab === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-primary-content shadow-sm shadow-primary/20 scale-[1.02]"
                        : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button to Open Add Stock Trade Modal */}
          {activeTab === "stocks" && (
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-xl gap-2 font-medium shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
              onClick={handleOpenAddModal}
            >
              <Plus size={16} />
              <span>Add Stock Trade</span>
            </button>
          )}
        </div>

        {/* Single-Line Controls & Filters Bar */}
        {activeTab === "stocks" && (
          <div className="bg-base-100/80 backdrop-blur-md p-2.5 rounded-2xl border border-base-200/70 shadow-sm overflow-visible">
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
              {/* Left Side: 2 Separate Filter Groups */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Filter Group 1: Trade Type (All / Delivery / Intraday) */}
                <div className="flex items-center gap-1 bg-base-200 p-1 rounded-xl shrink-0 text-xs font-bold border border-base-300/60">
                  <button
                    type="button"
                    onClick={() => setStocksTypeFilter("all")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      stocksTypeFilter === "all"
                        ? "bg-base-100 text-primary shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    All ({stocksData.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStocksTypeFilter("delivery")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      stocksTypeFilter === "delivery"
                        ? "bg-base-100 text-primary shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setStocksTypeFilter("intraday")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      stocksTypeFilter === "intraday"
                        ? "bg-base-100 text-primary shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    Intraday
                  </button>
                </div>

                {/* Filter Group 2: Position Status (All Positions / Holding Active / Sold Out) */}
                <div className="flex items-center gap-1 bg-base-200 p-1 rounded-xl shrink-0 text-xs font-bold border border-base-300/60">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === "all"
                        ? "bg-base-100 text-primary shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    All Positions
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("holding")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === "holding"
                        ? "bg-base-100 text-success shadow-sm font-black"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                    title="Show only stocks with remaining active holding shares"
                  >
                    Holding Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("sold")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === "sold"
                        ? "bg-base-100 text-secondary shadow-sm font-black"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                    title="Show only stocks with 0 shares remaining (completely sold)"
                  >
                    Sold Out (0 Qty)
                  </button>
                </div>
              </div>

              {/* Right Side: Sorting Dropdowns, Market Cap, Broker, Search & Simple Table View Icon */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Sort Field Dropdown + Interactive Direction Arrow Button */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="dropdown dropdown-bottom">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost btn-xs h-8 px-3 text-xs font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-base-200/70"
                    >
                      <span className="text-base-content/60 font-medium">Sort:</span>
                      <span className="text-primary">
                        {sortBy === "name"
                          ? "Stock Name"
                          : sortBy === "gainPct" || sortBy === "gainPercent"
                          ? "% Gain / Loss"
                          : sortBy === "gainRs"
                          ? "Money Gain (₹)"
                          : sortBy === "invested" || sortBy === "bFStock"
                          ? "Money Invested"
                          : sortBy === "holdingDays" || sortBy === "period"
                          ? "Holding Days"
                          : sortBy === "holdingQty" || sortBy === "sQty"
                          ? "Shares Held"
                          : sortBy === "buyDate" || sortBy === "bDate"
                          ? "Buy Date"
                          : sortBy === "sellDate" || sortBy === "sDate"
                          ? "Sell Date"
                          : "Default"}
                      </span>
                      <ChevronDown size={13} className="opacity-60" />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-48 z-[100] mt-1.5 border border-base-300/50"
                    >
                      <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                        Sort Field
                      </li>
                      {[
                        { value: "default", label: "Default (SlNo)" },
                        { value: "name", label: "Stock Name" },
                        { value: "gainPct", label: "% Gain / Loss" },
                        { value: "gainRs", label: "Money Gain (₹)" },
                        { value: "bFStock", label: "Money Invested" },
                        { value: "period", label: "Holding Days" },
                        { value: "bQty", label: "Shares Held (Qty)" },
                        { value: "bDate", label: "Buy Date" },
                        { value: "sDate", label: "Sell Date" },
                      ].map((opt) => (
                        <li key={opt.value}>
                          <button
                            type="button"
                            className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-all ${
                              sortBy === opt.value
                                ? "bg-primary text-primary-content font-bold shadow-md"
                                : "hover:bg-base-200"
                            }`}
                            onClick={() => {
                              setSortBy(opt.value);
                              if (document.activeElement instanceof HTMLElement) {
                                document.activeElement.blur();
                              }
                            }}
                          >
                            <span>{opt.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interactive Sort Direction Arrow Button */}
                  <button
                    type="button"
                    onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    className="btn btn-ghost btn-xs h-8 w-8 p-0 border border-base-300 rounded-xl bg-base-100 hover:bg-base-200 text-primary flex items-center justify-center cursor-pointer shadow-xs transition-all"
                    title={
                      sortOrder === "asc"
                        ? "Sorting Ascending (Click for Descending)"
                        : "Sorting Descending (Click for Ascending)"
                    }
                  >
                    {sortOrder === "asc" ? (
                      <ArrowUp size={14} className="text-primary font-bold" />
                    ) : (
                      <ArrowDown size={14} className="text-primary font-bold" />
                    )}
                  </button>
                </div>

                {/* Market Cap Dropdown */}
                <div className="dropdown dropdown-bottom">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-xs h-8 px-3 text-xs font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-base-200/70"
                  >
                    <span className="text-base-content/60 font-medium">Cap:</span>
                    <span className="capitalize text-primary">
                      {capFilter === "all" ? "All Caps" : `${capFilter} Cap`}
                    </span>
                    <ChevronDown size={13} className="opacity-60" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-40 z-[100] mt-1.5 border border-base-300/50"
                  >
                    <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                      Market Cap
                    </li>
                    {[
                      { value: "all", label: "All Caps" },
                      { value: "large", label: "Large Cap" },
                      { value: "mid", label: "Mid Cap" },
                      { value: "small", label: "Small Cap" },
                    ].map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-all ${
                            capFilter === opt.value
                              ? "bg-primary text-primary-content font-bold shadow-md"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => {
                            setCapFilter(opt.value);
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                        >
                          <span>{opt.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Broker Dropdown */}
                <div className="dropdown dropdown-bottom">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-xs h-8 px-3 text-xs font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-base-200/70"
                  >
                    <span className="text-base-content/60 font-medium">Broker:</span>
                    <span className="capitalize text-primary">
                      {platformFilter === "all" ? "All Brokers" : platformFilter}
                    </span>
                    <ChevronDown size={13} className="opacity-60" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-44 z-[100] mt-1.5 border border-base-300/50"
                  >
                    <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                      Broker / Platform
                    </li>
                    {[
                      { value: "all", label: "All Brokers" },
                      { value: "zerodha", label: "Zerodha" },
                      { value: "groww", label: "Groww" },
                      { value: "angelone", label: "AngelOne" },
                      { value: "upstox", label: "Upstox" },
                    ].map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-all ${
                            platformFilter === opt.value
                              ? "bg-primary text-primary-content font-bold shadow-md"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => {
                            setPlatformFilter(opt.value);
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                        >
                          <span>{opt.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preset Show Rows Dropdown with Custom Input Option */}
                <div className="dropdown dropdown-bottom">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-xs h-8 px-3 text-xs font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-base-200/70"
                  >
                    <span className="text-base-content/60 font-medium">Show:</span>
                    <span className="text-primary font-bold">
                      {itemsPerPage === "all"
                        ? "All"
                        : [10, 20, 30, 40, 50].includes(itemsPerPage)
                        ? `${itemsPerPage}`
                        : `${itemsPerPage} (Custom)`}
                    </span>
                    <ChevronDown size={13} className="opacity-60" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-48 z-[100] mt-1.5 border border-base-300/50 space-y-0.5"
                  >
                    <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                      Show Rows Count
                    </li>
                    {[10, 20, 30, 40, 50].map((val) => (
                      <li key={val}>
                        <button
                          type="button"
                          className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-all ${
                            itemsPerPage === val
                              ? "bg-primary text-primary-content font-bold shadow-md"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                        >
                          <span>{val} Rows</span>
                          {itemsPerPage === val && <Check size={13} />}
                        </button>
                      </li>
                    ))}

                    <li>
                      <button
                        type="button"
                        className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-all ${
                          itemsPerPage === "all"
                            ? "bg-primary text-primary-content font-bold shadow-md"
                            : "hover:bg-base-200"
                        }`}
                        onClick={() => {
                          setItemsPerPage("all");
                          setCurrentPage(1);
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }}
                      >
                        <span>All ({filteredStocks.length})</span>
                        {itemsPerPage === "all" && <Check size={13} />}
                      </button>
                    </li>

                    <div className="border-t border-base-200 my-1"></div>

                    {/* Custom Input Option */}
                    <li className="p-1.5 bg-base-200/50 rounded-xl cursor-default">
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                        <span className="text-base-content/60 text-[11px] shrink-0">Custom:</span>
                        <input
                          type="number"
                          min={1}
                          max={filteredStocks.length || 1}
                          placeholder="Number..."
                          value={
                            typeof itemsPerPage === "number" && ![10, 20, 30, 40, 50].includes(itemsPerPage)
                              ? itemsPerPage
                              : ""
                          }
                          onChange={(e) => {
                            const valStr = e.target.value;
                            if (valStr === "") return;
                            const num = parseInt(valStr, 10);
                            if (isNaN(num)) return;
                            const clamped = Math.max(1, Math.min(num, filteredStocks.length || 1));
                            setItemsPerPage(clamped);
                            setCurrentPage(1);
                          }}
                          className="input input-xs bg-base-100 border border-base-300 w-20 text-center font-extrabold text-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-6 p-1"
                        />
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Search Bar */}
                <div className="relative w-36 min-w-[120px]">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/50"
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="input input-xs input-bordered w-full pl-8 text-xs rounded-xl h-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* SIMPLE TABLE VIEW ICON BUTTON (Opens Table View Popup in Middle of UI) */}
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(true)}
                  className="btn btn-ghost btn-xs h-8 px-3 text-xs font-extrabold bg-primary/10 border border-primary/30 text-primary rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-primary hover:text-primary-content hover:border-primary transition-all cursor-pointer shrink-0"
                  title="Open Table View Popup Modal"
                >
                  <Table size={15} />
                  <span>Table View</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main Stocks Cards Display View (Clean Card Grid Layout)            */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "stocks" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {filteredStocks.length === 0 ? (
            <div className="bg-base-100 rounded-3xl border border-base-200 p-12 text-center shadow-sm">
              <div className="flex flex-col items-center justify-center gap-2 text-base-content/60">
                <Layers size={32} className="text-base-content/30" />
                <span className="font-semibold text-sm">
                  No Stock trades match your current filter.
                </span>
                <span className="text-xs">
                  Try resetting filters or search query.
                </span>
                <button
                  type="button"
                  className="btn btn-xs btn-outline btn-primary mt-2"
                  onClick={clearAllFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedStocks.map((stock) => {
                const isProfit = stock.gainRs >= 0;
                const isSold = stock.sQty > 0 || (stock.sDate && stock.sDate !== "-");

                return (
                  <div
                    key={stock.id}
                    className="bg-base-100 rounded-3xl border border-base-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative group"
                  >
                    {/* Top Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2.5">
                        {/* Stock Name & SlNo */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-base-content/50">
                            #{stock.slNo}
                          </span>
                          <span
                            className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-sm font-black tracking-wide truncate max-w-[200px] sm:max-w-[240px] inline-block align-middle"
                            title={stock.name}
                          >
                            {stock.name}
                          </span>
                        </div>

                        {/* Tags Row: Term Tag + Platform, Exchange, Cap */}
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold mt-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-primary text-primary-content font-extrabold shadow-sm">
                            {calculateStockTerm(stock)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-base-200 text-base-content/70 border border-base-300">
                            {stock.platform}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-base-200 text-base-content/70 border border-base-300">
                            {stock.exchange}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-base-200 text-base-content/70 border border-base-300">
                            {stock.cap} Cap
                          </span>
                        </div>
                      </div>

                      {/* Info (i), Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenInfoModal(stock)}
                          className="btn btn-ghost btn-xs text-info hover:bg-info/10 rounded-lg p-1.5 cursor-pointer"
                          title="View Calculation Details"
                        >
                          <Info size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(stock)}
                          className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                          title="Edit Stock Trade"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStockTrade(stock.id)}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg p-1.5 cursor-pointer"
                          title="Delete Stock Trade"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Buy & Sell Info Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-base-200/50 p-3 rounded-2xl border border-base-200">
                      {/* Buy Column */}
                      <div className="space-y-1 pr-2 border-r border-base-200">
                        <div className="text-[10px] font-extrabold uppercase text-primary tracking-wider">
                          Buy Info
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Date:</span>
                          <span className="font-medium">{formatDateCell(stock.bDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Qty:</span>
                          <span className="font-bold">{stock.bQty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Price:</span>
                          <span>{formatINR(stock.bShare)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Charges:</span>
                          <span className="text-warning font-semibold">{formatINR(stock.bBkgPdc)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-base-200 font-bold">
                          <span>Cost:</span>
                          <span className="text-primary">{formatINR(stock.bFStock)}</span>
                        </div>
                      </div>

                      {/* Sell Column */}
                      <div className="space-y-1 pl-1 flex flex-col justify-between">
                        <div className="text-[10px] font-extrabold uppercase text-secondary tracking-wider">
                          Sell Info
                        </div>
                        {isSold ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Date:</span>
                              <span className="font-medium">{formatDateCell(stock.sDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Qty:</span>
                              <span className="font-bold">{stock.sQty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Price:</span>
                              <span>{formatINR(stock.sShare)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Charges:</span>
                              <span className="text-warning font-semibold">{formatINR(stock.sBkgPdc + stock.dp)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-base-200 font-bold">
                              <span>Net:</span>
                              <span className="text-secondary">{formatINR(stock.sFStock)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="my-auto text-center space-y-0.5 py-3">
                            <div className="text-[9px] uppercase font-extrabold text-primary/80 tracking-wider">
                              Position Active
                            </div>
                            <div className="text-xs font-black text-primary">
                              {stock.qLeft > 0 ? `${stock.qLeft} Shares Holding` : "Holding"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Realized Gain Banner */}
                    <div className="pt-1">
                      {isSold ? (
                        <div
                          className={`p-3 rounded-2xl border flex items-center justify-between font-bold ${
                            isProfit
                              ? "bg-success/10 border-success/30 text-success"
                              : "bg-error/10 border-error/30 text-error"
                          }`}
                        >
                          <span className="text-xs font-extrabold uppercase tracking-wide">
                            Realized PnL ({stock.period}d)
                          </span>
                          <div className="flex items-center gap-1 text-sm font-black">
                            {isProfit ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            <span>
                              {isProfit ? "+" : ""}
                              {formatINR(stock.gainRs)} ({stock.gainPct}%)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl border border-base-300 bg-base-200/50 flex items-center justify-between text-xs text-base-content/70">
                          <span className="font-semibold">Holding Position</span>
                          <span className="badge badge-xs badge-outline">
                            Holding {stock.period} Days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Bar */}
          {filteredStocks.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-base-100 p-3 rounded-2xl border border-base-200 text-xs shadow-sm">
              <span className="text-xs text-base-content/70 font-semibold">
                Showing {filteredStocks.length === 0 ? 0 : (currentPage - 1) * (itemsPerPage === "all" ? filteredStocks.length : itemsPerPage) + 1} to{" "}
                {itemsPerPage === "all"
                  ? filteredStocks.length
                  : Math.min(currentPage * itemsPerPage, filteredStocks.length)}{" "}
                of {filteredStocks.length} entries
              </span>

              {itemsPerPage !== "all" && totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-soft btn-secondary btn-xs font-bold rounded-lg cursor-pointer"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>

                  <span className="font-bold text-base-content/80 px-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="btn btn-soft btn-secondary btn-xs font-bold rounded-lg cursor-pointer"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* OTHER TABS PLACEHOLDERS (Mutual Fund, Emergency Fund, FD, RD, PF) */}
      {/* ------------------------------------------------------------------ */}
      {activeTab !== "stocks" && (
        <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center animate-in fade-in duration-300">
          <div className="max-w-md mx-auto flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-3xl">
              {activeTab === "mf" && <PieChart size={36} />}
              {activeTab === "ef" && <ShieldAlert size={36} />}
              {activeTab === "fd" && <Landmark size={36} />}
              {activeTab === "rd" && <PiggyBank size={36} />}
              {activeTab === "pf" && <Percent size={36} />}
            </div>

            <div>
              <h2 className="text-xl font-bold text-base-content">
                {categories.find((c) => c.id === activeTab)?.label} Tracking
              </h2>
              <p className="text-xs text-base-content/70 mt-1">
                Configure your {categories.find((c) => c.id === activeTab)?.subLabel}{" "}
                entries, SIP calculations, and maturity schedules.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-primary rounded-xl gap-2 font-medium"
              onClick={() =>
                alert(
                  `Table fields and entry popups for ${
                    categories.find((c) => c.id === activeTab)?.label
                  } will be configured in the next steps!`
                )
              }
            >
              <Plus size={16} />
              <span>
                Add New {categories.find((c) => c.id === activeTab)?.label} Entry
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Stock Trade Wide 4-Section Popup Modal */}
      <AddStockTradeModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onSaveTrade={handleSaveStockTrade}
        initialData={editingStock}
      />

      {/* 5-Window Read-Only Calculation Viewer Modal */}
      <StockTradeCalculationModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        trade={infoStock}
      />

      {/* ------------------------------------------------------------------ */}
      {/* TABLE VIEW POPUP MODAL (Middle of UI with Sticky Top Headers)      */}
      {/* ------------------------------------------------------------------ */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
          <div className="bg-base-100 border border-base-300 rounded-3xl p-4 sm:p-6 shadow-2xl w-[98vw] max-w-[1800px] max-h-[96vh] flex flex-col gap-4 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-xs">
                  <Table size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-lg text-base-content tracking-tight">
                      Stock Trades Table View
                    </h2>
                    <span className="badge badge-primary font-extrabold text-xs">
                      {filteredStocks.length} Trades
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60 font-medium mt-0.5">
                    Click column names or sort icons to sort, or filter icon on each column to filter. Sticky header row pinned at top.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Column Customizer Button */}
                <button
                  type="button"
                  onClick={() => setIsColumnModalOpen(true)}
                  className="btn btn-sm btn-ghost bg-base-200/80 hover:bg-base-300 text-base-content font-bold rounded-xl gap-1.5 cursor-pointer text-xs"
                  title="Customize Table Columns"
                >
                  <Columns size={15} className="text-primary" />
                  <span>Columns ({visibleColumns.length})</span>
                </button>

                {/* Reset Filters Button */}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn btn-sm btn-ghost text-xs font-bold text-base-content/70 hover:text-error rounded-xl cursor-pointer"
                  title="Clear all filters & resets"
                >
                  Reset Filters
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content"
                  title="Close Table View Modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Inline Comprehensive Filter & Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 py-2 px-1 bg-base-200/40 rounded-2xl border border-base-200">
              {/* Left Side: Trade Type & Position Status Filters */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Trade Type Filter */}
                <div className="flex items-center gap-1 bg-base-200 p-0.5 rounded-xl shrink-0 text-[11px] font-bold border border-base-300/60">
                  <button
                    type="button"
                    onClick={() => setStocksTypeFilter("all")}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      stocksTypeFilter === "all"
                        ? "bg-base-100 text-primary shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    All ({stocksData.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStocksTypeFilter("delivery")}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      stocksTypeFilter === "delivery"
                        ? "bg-base-100 text-primary shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setStocksTypeFilter("intraday")}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      stocksTypeFilter === "intraday"
                        ? "bg-base-100 text-primary shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    Intraday
                  </button>
                </div>

                {/* Position Status Filter */}
                <div className="flex items-center gap-1 bg-base-200 p-0.5 rounded-xl shrink-0 text-[11px] font-bold border border-base-300/60">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === "all"
                        ? "bg-base-100 text-primary shadow-sm"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    All Positions
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("holding")}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === "holding"
                        ? "bg-base-100 text-success shadow-sm font-black"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    Holding
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("sold")}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === "sold"
                        ? "bg-base-100 text-secondary shadow-sm font-black"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                  >
                    Sold Out
                  </button>
                </div>
              </div>

              {/* Right Side: Sort, Cap, Broker, Show & Search Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Sort Field Dropdown + Direction Arrow */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="dropdown dropdown-bottom">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost btn-xs h-7 px-2.5 text-[11px] font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1 shadow-xs hover:bg-base-200/70"
                    >
                      <span className="text-base-content/60 font-medium">Sort:</span>
                      <span className="text-primary">
                        {sortBy === "name"
                          ? "Stock Name"
                          : sortBy === "gainPct" || sortBy === "gainPercent"
                          ? "% Gain / Loss"
                          : sortBy === "gainRs"
                          ? "Money Gain (₹)"
                          : sortBy === "invested" || sortBy === "bFStock"
                          ? "Money Invested"
                          : sortBy === "holdingDays" || sortBy === "period"
                          ? "Holding Days"
                          : sortBy === "holdingQty" || sortBy === "sQty"
                          ? "Shares Held"
                          : sortBy === "buyDate" || sortBy === "bDate"
                          ? "Buy Date"
                          : sortBy === "sellDate" || sortBy === "sDate"
                          ? "Sell Date"
                          : "Default"}
                      </span>
                      <ChevronDown size={12} className="opacity-60" />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-48 z-[99999] mt-1.5 border border-base-300/50"
                    >
                      <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                        Sort Field
                      </li>
                      {[
                        { value: "default", label: "Default (SlNo)" },
                        { value: "name", label: "Stock Name" },
                        { value: "gainPct", label: "% Gain / Loss" },
                        { value: "gainRs", label: "Money Gain (₹)" },
                        { value: "bFStock", label: "Money Invested" },
                        { value: "period", label: "Holding Days" },
                        { value: "bQty", label: "Shares Held (Qty)" },
                        { value: "bDate", label: "Buy Date" },
                        { value: "sDate", label: "Sell Date" },
                      ].map((opt) => (
                        <li key={opt.value}>
                          <button
                            type="button"
                            className={`flex items-center justify-between py-1 px-2 rounded-xl text-xs transition-all ${
                              sortBy === opt.value
                                ? "bg-primary text-primary-content font-bold shadow-md"
                                : "hover:bg-base-200"
                            }`}
                            onClick={() => {
                              setSortBy(opt.value);
                              if (document.activeElement instanceof HTMLElement) {
                                document.activeElement.blur();
                              }
                            }}
                          >
                            <span>{opt.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    className="btn btn-ghost btn-xs h-7 w-7 p-0 border border-base-300 rounded-xl bg-base-100 hover:bg-base-200 text-primary flex items-center justify-center cursor-pointer shadow-xs transition-all"
                    title={
                      sortOrder === "asc"
                        ? "Sorting Ascending (Click for Descending)"
                        : "Sorting Descending (Click for Ascending)"
                    }
                  >
                    {sortOrder === "asc" ? (
                      <ArrowUp size={13} className="text-primary font-bold" />
                    ) : (
                      <ArrowDown size={13} className="text-primary font-bold" />
                    )}
                  </button>
                </div>

                {/* Market Cap Dropdown */}
                <div className="dropdown dropdown-bottom">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-xs h-7 px-2.5 text-[11px] font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1 shadow-xs hover:bg-base-200/70"
                  >
                    <span className="text-base-content/60 font-medium">Cap:</span>
                    <span className="capitalize text-primary">
                      {capFilter === "all" ? "All Caps" : `${capFilter} Cap`}
                    </span>
                    <ChevronDown size={12} className="opacity-60" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-40 z-[99999] mt-1.5 border border-base-300/50"
                  >
                    <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                      Market Cap
                    </li>
                    {[
                      { value: "all", label: "All Caps" },
                      { value: "large", label: "Large Cap" },
                      { value: "mid", label: "Mid Cap" },
                      { value: "small", label: "Small Cap" },
                    ].map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          className={`flex items-center justify-between py-1 px-2 rounded-xl text-xs transition-all ${
                            capFilter === opt.value
                              ? "bg-primary text-primary-content font-bold shadow-md"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => {
                            setCapFilter(opt.value);
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                        >
                          <span>{opt.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Broker Dropdown */}
                <div className="dropdown dropdown-bottom">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-xs h-7 px-2.5 text-[11px] font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1 shadow-xs hover:bg-base-200/70"
                  >
                    <span className="text-base-content/60 font-medium">Broker:</span>
                    <span className="capitalize text-primary">
                      {platformFilter === "all" ? "All Brokers" : platformFilter}
                    </span>
                    <ChevronDown size={12} className="opacity-60" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-44 z-[99999] mt-1.5 border border-base-300/50"
                  >
                    <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                      Broker / Platform
                    </li>
                    {[
                      { value: "all", label: "All Brokers" },
                      { value: "zerodha", label: "Zerodha" },
                      { value: "groww", label: "Groww" },
                      { value: "angelone", label: "AngelOne" },
                      { value: "upstox", label: "Upstox" },
                    ].map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          className={`flex items-center justify-between py-1 px-2 rounded-xl text-xs transition-all ${
                            platformFilter === opt.value
                              ? "bg-primary text-primary-content font-bold shadow-md"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => {
                            setPlatformFilter(opt.value);
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                        >
                          <span>{opt.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preset Show Rows Dropdown with Custom Input Option */}
                <div className="dropdown dropdown-bottom">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-xs h-7 px-2.5 text-[11px] font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1 shadow-xs hover:bg-base-200/70"
                  >
                    <span className="text-base-content/60 font-medium">Show:</span>
                    <span className="text-primary font-bold">
                      {itemsPerPage === "all"
                        ? "All"
                        : [10, 20, 30, 40, 50].includes(itemsPerPage)
                        ? `${itemsPerPage}`
                        : `${itemsPerPage} (Custom)`}
                    </span>
                    <ChevronDown size={12} className="opacity-60" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-48 z-[99999] mt-1.5 border border-base-300/50 space-y-0.5"
                  >
                    <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                      Show Rows Count
                    </li>
                    {[10, 20, 30, 40, 50].map((val) => (
                      <li key={val}>
                        <button
                          type="button"
                          className={`flex items-center justify-between py-1 px-2 rounded-xl text-xs transition-all ${
                            itemsPerPage === val
                              ? "bg-primary text-primary-content font-bold shadow-md"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                        >
                          <span>{val} Rows</span>
                          {itemsPerPage === val && <Check size={13} />}
                        </button>
                      </li>
                    ))}

                    <li>
                      <button
                        type="button"
                        className={`flex items-center justify-between py-1 px-2 rounded-xl text-xs transition-all ${
                          itemsPerPage === "all"
                            ? "bg-primary text-primary-content font-bold shadow-md"
                            : "hover:bg-base-200"
                        }`}
                        onClick={() => {
                          setItemsPerPage("all");
                          setCurrentPage(1);
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }}
                      >
                        <span>All ({filteredStocks.length})</span>
                        {itemsPerPage === "all" && <Check size={13} />}
                      </button>
                    </li>

                    <div className="border-t border-base-200 my-1"></div>

                    {/* Custom Input Option */}
                    <li className="p-1.5 bg-base-200/50 rounded-xl cursor-default">
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                        <span className="text-base-content/60 text-[11px] shrink-0">Custom:</span>
                        <input
                          type="number"
                          min={1}
                          max={filteredStocks.length || 1}
                          placeholder="Number..."
                          value={
                            typeof itemsPerPage === "number" && ![10, 20, 30, 40, 50].includes(itemsPerPage)
                              ? itemsPerPage
                              : ""
                          }
                          onChange={(e) => {
                            const valStr = e.target.value;
                            if (valStr === "") return;
                            const num = parseInt(valStr, 10);
                            if (isNaN(num)) return;
                            const clamped = Math.max(1, Math.min(num, filteredStocks.length || 1));
                            setItemsPerPage(clamped);
                            setCurrentPage(1);
                          }}
                          className="input input-xs bg-base-100 border border-base-300 w-20 text-center font-extrabold text-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-primary h-5 p-1"
                        />
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Search Box */}
                <div className="flex items-center gap-1.5 bg-base-100 border border-base-300/80 rounded-xl px-2.5 py-1 h-7">
                  <Search size={12} className="text-base-content/50 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-[11px] font-medium text-base-content placeholder:text-base-content/40 outline-none w-28 sm:w-36"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-base-content/40 hover:text-base-content cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Table Wrapper with Sticky Header */}
            <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-inner flex-1 min-h-[300px]">
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(85vh-200px)] relative">
                <table className="bg-base-300 table table-xs w-full text-center border-separate border-spacing-0">
                  {/* Sticky Header Row */}
                  <thead className="sticky top-0 z-30 bg-base-200 shadow-md">
                    <tr className="bg-base-200 text-base-content/80 text-[11px] font-bold tracking-wider uppercase border-b border-base-300">
                      {/* Fixed Left Columns */}
                      {isColVisible("slno") && renderTableHeaderCell("SLNo.", "slno", Hash, null, "sticky left-0 top-0 z-[60] min-w-[65px] max-w-[65px] w-[65px] bg-base-200 border-r border-b border-base-300 shadow-md")}
                      {isColVisible("name") && renderTableHeaderCell("Name", "name", Building2, null, "sticky left-[65px] top-0 z-[60] min-w-[175px] max-w-[175px] w-[175px] bg-base-200 border-r-2 border-b border-base-300 shadow-md")}

                      {/* Buy Columns */}
                      {isColVisible("bDate") && renderTableHeaderCell("B-Date", "bDate", Calendar)}
                      {isColVisible("bQty") && renderTableHeaderCell("B-Qty", "bQty", Layers)}
                      {isColVisible("bShare") && renderTableHeaderCell("B-Share", "bShare", Coins)}
                      {isColVisible("bStock") && renderTableHeaderCell("B-Stock", "bStock", PiggyBank)}
                      {isColVisible("bBkg") && renderTableHeaderCell("B-BKG", "bBkg", Percent, "Buy Brokerage Charges")}
                      {isColVisible("bPdc") && renderTableHeaderCell("B-PDC", "bPdc", Percent, "Buy PDC / Taxes / STT")}
                      {isColVisible("bBkgPdc") && renderTableHeaderCell("B-BKG+PDC", "bBkgPdc", Percent, "Total Buy Charges", "bg-base-300/40")}
                      {isColVisible("bTT") && renderTableHeaderCell("B-TT", "bTT", Landmark, "Buy Total Transaction Amount")}
                      {isColVisible("bFShare") && renderTableHeaderCell("B-FShare", "bFShare", TrendingUp, "Buy Effective Final Share Price")}
                      {isColVisible("bFStock") && renderTableHeaderCell("B-FStock", "bFStock", PiggyBank, "Buy Final Value", "bg-base-300/40")}

                      {/* Sell Columns */}
                      {isColVisible("sDate") && renderTableHeaderCell("S-Date", "sDate", Calendar)}
                      {isColVisible("sQty") && renderTableHeaderCell("S-Qty", "sQty", Layers)}
                      {isColVisible("sShare") && renderTableHeaderCell("S-Share", "sShare", Coins)}
                      {isColVisible("sStock") && renderTableHeaderCell("S-Stock", "sStock", PiggyBank)}
                      {isColVisible("sBkg") && renderTableHeaderCell("S-BKG", "sBkg", Percent, "Sell Brokerage Charges")}
                      {isColVisible("sPdc") && renderTableHeaderCell("S-PDC", "sPdc", Percent, "Sell PDC / Taxes / STT")}
                      {isColVisible("sBkgPdc") && renderTableHeaderCell("S-BKG+PDC", "sBkgPdc", Percent, "Total Sell Charges", "bg-base-300/40")}
                      {isColVisible("dp") && renderTableHeaderCell("DP", "dp", ShieldAlert, "Depository Participant Charges")}
                      {isColVisible("sTT") && renderTableHeaderCell("S-TT", "sTT", Landmark, "Sell Total Transaction Amount")}
                      {isColVisible("sFShare") && renderTableHeaderCell("S-FShare", "sFShare", TrendingUp, "Sell Net Final Share Price")}
                      {isColVisible("sFStock") && renderTableHeaderCell("S-FStock", "sFStock", PiggyBank, "Sell Net Realization", "bg-base-300/40")}

                      {/* Other Columns */}
                      {isColVisible("period") && renderTableHeaderCell("Period", "period", Clock)}
                      {isColVisible("qLeft") && renderTableHeaderCell("Q-Left", "qLeft", Layers, "Quantity Left / Holdings Remaining", "text-primary")}
                      {isColVisible("platform") && renderTableHeaderCell("Platform", "platform", Building2)}
                      {isColVisible("cap") && renderTableHeaderCell("CAP", "cap", PieChart)}
                      {isColVisible("exchange") && renderTableHeaderCell("Exchange", "exchange", Landmark)}
                      {isColVisible("term") && renderTableHeaderCell("Term", "term", Sparkles)}
                      {isColVisible("gainRs") && renderTableHeaderCell("Gain(₹)", "gainRs", TrendingUp)}
                      {isColVisible("gainPercent") && renderTableHeaderCell("Gain(%)", "gainPercent", Percent)}

                      {/* Fixed Right Column */}
                      {isColVisible("actions") && renderTableHeaderCell("Actions", "actions", SlidersHorizontal, null, "sticky right-0 z-50 bg-base-200 border-l-2 border-base-300 shadow-md")}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="text-xs divide-y divide-base-200 relative z-0 bg-base-100">
                    {filteredStocks.length === 0 ? (
                      <tr>
                        <td colSpan={32} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-base-content/60">
                            <Layers size={32} className="text-base-content/30" />
                            <span className="font-semibold text-sm">
                              No Stock trades match your current filter.
                            </span>
                            <button
                              type="button"
                              className="btn btn-xs btn-outline btn-primary mt-2"
                              onClick={clearAllFilters}
                            >
                              Reset Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedStocks.map((row) => {
                        const isProfit = row.gainRs >= 0;

                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-base-200/50 transition-colors"
                          >
                            {/* 1. SLNo. (Fixed Left) */}
                            {isColVisible("slno") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-semibold text-base-content/70 sticky left-0 z-30 bg-base-100 dark:bg-base-200 shadow-r">
                                #{row.slNo}
                              </td>
                            )}

                            {/* 2. Name (Fixed Left) */}
                            {isColVisible("name") && (
                              <td className="px-3 py-2.5 border-r-2 border-base-200 text-left font-bold text-base-content whitespace-nowrap max-w-[180px] sticky left-[65px] z-30 bg-base-100 dark:bg-base-200 shadow-md">
                                <span
                                  className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-extrabold mr-1 truncate max-w-[160px] inline-block align-middle relative z-10"
                                  title={row.name}
                                >
                                  {row.name}
                                </span>
                              </td>
                            )}

                            {/* 3. B-Date */}
                            {isColVisible("bDate") && (
                              <td className="px-3 py-2.5 border-r border-base-200 whitespace-nowrap text-base-content/80">
                                {formatDateCell(row.bDate)}
                              </td>
                            )}

                            {/* 4. B-Qty */}
                            {isColVisible("bQty") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-medium relative">
                                <span className="relative z-10">{row.bQty}</span>
                                {isColVisible("bShare") && (
                                  <span
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
                                    title="Multiply Qty × Share Price"
                                  >
                                    ×
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 5. B-Share */}
                            {isColVisible("bShare") && (
                              <td className="px-3 py-2.5 border-r border-base-200 relative">
                                <span className="relative z-10">{formatINR(row.bShare)}</span>
                                {isColVisible("bStock") && (
                                  <span
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
                                    title="Equals B-Stock Value"
                                  >
                                    =
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 6. B-Stock */}
                            {isColVisible("bStock") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-medium">
                                <span className="relative z-10">{formatINR(row.bStock)}</span>
                              </td>
                            )}

                            {/* 7. B-BKG */}
                            {isColVisible("bBkg") && (
                              <td className="px-3 py-2.5 border-r border-base-200 text-base-content/70 relative">
                                <span className="relative z-10">{formatINR(row.bBkg)}</span>
                                {isColVisible("bPdc") && (
                                  <span
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
                                    title="Plus +"
                                  >
                                    +
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 8. B-PDC */}
                            {isColVisible("bPdc") && (
                              <td className="px-3 py-2.5 border-r border-base-200 text-base-content/70 relative">
                                <span className="relative z-10">{formatINR(row.bPdc)}</span>
                                {isColVisible("bBkgPdc") && (
                                  <span
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
                                    title="Equals B-BKG+PDC Total"
                                  >
                                    =
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 9. B-BKG+PDC */}
                            {isColVisible("bBkgPdc") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-semibold bg-base-200/30 relative">
                                <span className="relative z-10">{formatINR(row.bBkgPdc)}</span>
                              </td>
                            )}

                            {/* 10. B-TT */}
                            {isColVisible("bTT") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-medium relative">
                                <span className="relative z-10">{row.bTt || 0}</span>
                              </td>
                            )}

                            {/* 11. B-FShare */}
                            {isColVisible("bFShare") && (
                              <td className="px-3 py-2.5 border-r border-base-200 text-base-content/80">
                                {formatINR(row.bFShare)}
                              </td>
                            )}

                            {/* 12. B-FStock */}
                            {isColVisible("bFStock") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-bold bg-base-200/30">
                                {formatINR(row.bFStock)}
                              </td>
                            )}

                            {/* 13. S-Date */}
                            {isColVisible("sDate") && (
                              <td className="px-3 py-2.5 border-r border-base-200 whitespace-nowrap text-base-content/80">
                                {formatDateCell(row.sDate)}
                              </td>
                            )}

                            {/* 14. S-Qty */}
                            {isColVisible("sQty") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-medium relative">
                                <span className="relative z-10">{row.sQty || 0}</span>
                                {isColVisible("sShare") && (
                                  <span
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
                                    title="Multiply Qty × Share Price"
                                  >
                                    ×
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 15. S-Share */}
                            {isColVisible("sShare") && (
                              <td className="px-3 py-2.5 border-r border-base-200 relative">
                                <span className="relative z-10">{row.sShare ? formatINR(row.sShare) : "-"}</span>
                                {isColVisible("sStock") && (
                                  <span
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
                                    title="Equals S-Stock Value"
                                  >
                                    =
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 16. S-Stock */}
                            {isColVisible("sStock") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-medium">
                                <span className="relative z-10">{row.sStock ? formatINR(row.sStock) : "-"}</span>
                              </td>
                            )}

                            {/* 17. S-BKG */}
                            {isColVisible("sBkg") && (
                              <td className="px-3 py-2.5 border-r border-base-200 text-base-content/70 relative">
                                <span className="relative z-10">{row.sBkg ? formatINR(row.sBkg) : "-"}</span>
                                {isColVisible("sPdc") && (
                                  <span
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
                                    title="Plus +"
                                  >
                                    +
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 18. S-PDC */}
                            {isColVisible("sPdc") && (
                              <td className="px-3 py-2.5 border-r border-base-200 text-base-content/70 relative">
                                <span className="relative z-10">{row.sPdc ? formatINR(row.sPdc) : "-"}</span>
                                {isColVisible("sBkgPdc") && (
                                  <span
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-0 text-white font-semibold text-sm pointer-events-none drop-shadow-xs select-none"
                                    title="Equals S-BKG+PDC Total"
                                  >
                                    =
                                  </span>
                                )}
                              </td>
                            )}

                            {/* 19. S-BKG+PDC */}
                            {isColVisible("sBkgPdc") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-semibold bg-base-200/30">
                                {formatINR(row.sBkgPdc)}
                              </td>
                            )}

                            {/* 20. DP */}
                            {isColVisible("dp") && (
                              <td className="px-3 py-2.5 border-r border-base-200 text-base-content/70">
                                {row.dp ? formatINR(row.dp) : "-"}
                              </td>
                            )}

                            {/* 21. S-TT */}
                            {isColVisible("sTT") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-medium">
                                {row.sTt ? formatINR(row.sTt) : "-"}
                              </td>
                            )}

                            {/* 22. S-FShare */}
                            {isColVisible("sFShare") && (
                              <td className="px-3 py-2.5 border-r border-base-200 text-base-content/80">
                                {row.sFShare ? formatINR(row.sFShare) : "-"}
                              </td>
                            )}

                            {/* 23. S-FStock */}
                            {isColVisible("sFStock") && (
                              <td className="px-3 py-2.5 border-r border-base-200 font-bold bg-base-200/30">
                                {formatINR(row.sFStock)}
                              </td>
                            )}

                            {/* 24. Period */}
                            {isColVisible("period") && (
                              <td className="px-3 py-2.5 border-r border-base-200">
                                <span className="badge badge-xs badge-ghost font-mono">
                                  {row.period}d
                                </span>
                              </td>
                            )}

                            {/* 25. Q-Left */}
                            {isColVisible("qLeft") && (
                              <td className="px-3 py-2.5 border-r border-base-200">
                                {row.qLeft > 0 ? (
                                  <span className="badge badge-xs badge-primary font-bold">
                                    {row.qLeft}
                                  </span>
                                ) : (
                                  <span className="text-base-content/40">0</span>
                                )}
                              </td>
                            )}

                            {/* 26. Platform */}
                            {isColVisible("platform") && (
                              <td className="px-3 py-2.5 border-r border-base-200 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-base-200 text-base-content/70 border border-base-300 text-[10px] font-semibold">
                                  {row.platform}
                                </span>
                              </td>
                            )}

                            {/* 27. CAP */}
                            {isColVisible("cap") && (
                              <td className="px-3 py-2.5 border-r border-base-200">
                                <span className="px-2 py-0.5 rounded-md bg-base-200 text-base-content/70 border border-base-300 text-[10px] font-semibold">
                                  {row.cap}
                                </span>
                              </td>
                            )}

                            {/* 28. Exchange */}
                            {isColVisible("exchange") && (
                              <td className="px-3 py-2.5 border-r border-base-200">
                                <span className="px-2 py-0.5 rounded-md bg-base-200 text-base-content/70 border border-base-300 text-[10px] font-semibold">
                                  {row.exchange}
                                </span>
                              </td>
                            )}

                            {/* 29. Term */}
                            {isColVisible("term") && (
                              <td className="px-3 py-2.5 border-r border-base-200">
                                <span className="px-2 py-0.5 rounded-md bg-primary text-primary-content font-extrabold text-[10px] whitespace-nowrap shadow-sm">
                                  {calculateStockTerm(row)}
                                </span>
                              </td>
                            )}

                            {/* 30. Gain(₹) */}
                            {isColVisible("gainRs") && (
                              <td className="px-3 py-2.5 border-r border-base-200 text-right font-bold">
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-xs inline-block font-mono ${
                                    isProfit
                                      ? "bg-success/15 text-success"
                                      : "bg-error/15 text-error"
                                  }`}
                                >
                                  {isProfit ? "+" : ""}
                                  {formatINR(row.gainRs)}
                                </span>
                              </td>
                            )}

                            {/* 31. Gain(%) */}
                            {isColVisible("gainPercent") && (
                              <td className="px-3 py-2.5 border-r border-base-200 text-right font-bold">
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-xs inline-flex items-center gap-0.5 font-mono ${
                                    isProfit
                                      ? "bg-success/15 text-success"
                                      : "bg-error/15 text-error"
                                  }`}
                                >
                                  {isProfit ? (
                                    <ArrowUpRight size={12} />
                                  ) : (
                                    <ArrowDownRight size={12} />
                                  )}
                                  {row.gainPct}%
                                </span>
                              </td>
                            )}

                            {/* 32. Actions (Fixed Right) */}
                            {isColVisible("actions") && (
                              <td className="px-3 py-2.5 text-center whitespace-nowrap sticky right-0 z-20 bg-base-100 border-l-2 border-base-200 shadow-md">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInfoModal(row)}
                                    className="btn btn-ghost btn-xs text-info hover:bg-info/10 rounded-lg p-1.5 cursor-pointer"
                                    title="View Calculation Details"
                                  >
                                    <Info size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(row)}
                                    className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                                    title="Edit Stock Trade"
                                  >
                                    <Edit size={14} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStockTrade(row.id)}
                                    className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg p-1.5 cursor-pointer"
                                    title="Delete Stock Trade"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* Sticky Footer Row for Totals */}
                  <tfoot className="sticky bottom-0 z-30 bg-base-200 shadow-md font-extrabold text-xs">
                    <tr className="bg-base-200 border-t-2 border-base-300 text-base-content">
                      {/* 1. SLNo (Fixed Left) */}
                      {isColVisible("slno") && (
                        <td className="px-3 py-2.5 border-r border-base-300 font-black text-center sticky left-0 z-40 bg-base-200 shadow-md uppercase tracking-wider text-[10px]">
                          TOTAL
                        </td>
                      )}

                      {/* 2. Name (Fixed Left) */}
                      {isColVisible("name") && (
                        <td className="px-3 py-2.5 border-r-2 border-base-300 text-left font-black text-primary sticky left-[65px] z-40 bg-base-200 shadow-md">
                          {paginatedStocks.length} Shown
                        </td>
                      )}

                      {/* Buy Columns Set */}
                      {isColVisible("bDate") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("bQty") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-bold">
                          {tableTotals.bQty}
                        </td>
                      )}
                      {isColVisible("bShare") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("bStock") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-bold">
                          {formatINR(tableTotals.bStock)}
                        </td>
                      )}
                      {isColVisible("bBkg") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center text-base-content/80 font-bold">
                          {formatINR(tableTotals.bBkg)}
                        </td>
                      )}
                      {isColVisible("bPdc") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center text-base-content/80 font-bold">
                          {formatINR(tableTotals.bPdc)}
                        </td>
                      )}
                      {isColVisible("bBkgPdc") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-bold bg-base-300/40">
                          {formatINR(tableTotals.bBkgPdc)}
                        </td>
                      )}
                      {isColVisible("bTT") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-bold">
                          {formatINR(tableTotals.bTt)}
                        </td>
                      )}
                      {isColVisible("bFShare") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("bFStock") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-black text-primary bg-base-300/40">
                          {formatINR(tableTotals.bFStock)}
                        </td>
                      )}

                      {/* Sell Columns Set */}
                      {isColVisible("sDate") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("sQty") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-bold">
                          {tableTotals.sQty}
                        </td>
                      )}
                      {isColVisible("sShare") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("sStock") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-bold">
                          {formatINR(tableTotals.sStock)}
                        </td>
                      )}
                      {isColVisible("sBkg") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center text-base-content/80 font-bold">
                          {formatINR(tableTotals.sBkg)}
                        </td>
                      )}
                      {isColVisible("sPdc") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center text-base-content/80 font-bold">
                          {formatINR(tableTotals.sPdc)}
                        </td>
                      )}
                      {isColVisible("sBkgPdc") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-bold bg-base-300/40">
                          {formatINR(tableTotals.sBkgPdc)}
                        </td>
                      )}
                      {isColVisible("dp") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center text-base-content/80 font-bold">
                          {formatINR(tableTotals.dp)}
                        </td>
                      )}
                      {isColVisible("sTT") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-bold">
                          {formatINR(tableTotals.sTt)}
                        </td>
                      )}
                      {isColVisible("sFShare") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("sFStock") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-black text-primary bg-base-300/40">
                          {formatINR(tableTotals.sFStock)}
                        </td>
                      )}

                      {/* Other Columns Set */}
                      {isColVisible("period") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("qLeft") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-center font-black text-primary">
                          {tableTotals.qLeft}
                        </td>
                      )}
                      {isColVisible("platform") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("cap") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("exchange") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("term") && (
                        <td className="px-3 py-2.5 border-r border-base-200 text-base-content/40 text-center">-</td>
                      )}
                      {isColVisible("gainRs") && (
                        <td className={`px-3 py-2.5 border-r border-base-200 text-right font-mono font-black ${
                          tableTotals.gainRs >= 0 ? "text-success" : "text-error"
                        }`}>
                          {tableTotals.gainRs >= 0 ? "+" : ""}
                          {formatINR(tableTotals.gainRs)}
                        </td>
                      )}
                      {isColVisible("gainPercent") && (
                        <td className={`px-3 py-2.5 border-r border-base-200 text-right font-mono font-black ${
                          tableTotals.gainRs >= 0 ? "text-success" : "text-error"
                        }`}>
                          {tableTotals.gainPct.toFixed(2)}%
                        </td>
                      )}

                      {/* Actions (Fixed Right) */}
                      {isColVisible("actions") && (
                        <td className="px-3 py-2.5 text-center sticky right-0 z-40 bg-base-200 border-l-2 border-base-300 shadow-md text-base-content/40">
                          -
                        </td>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs border-t border-base-200">
              <div className="text-base-content/70 font-semibold flex items-center gap-3">
                <span>Showing {filteredStocks.length} entries</span>
                <span className="text-base-content/30">•</span>
                <span>
                  Invested: <strong className="text-primary">{formatINR(stocksStats.totalInvested)}</strong>
                </span>
                <span className="text-base-content/30">•</span>
                <span>
                  Realized PnL:{" "}
                  <strong
                    className={
                      stocksStats.totalRealizedGain >= 0 ? "text-success" : "text-error"
                    }
                  >
                    {stocksStats.totalRealizedGain >= 0 ? "+" : ""}
                    {formatINR(stocksStats.totalRealizedGain)}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="btn btn-primary btn-sm rounded-xl font-bold px-5 cursor-pointer shadow-md"
              >
                Close Table View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Column Customization Modal Popup                                  */}
      {/* ------------------------------------------------------------------ */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-base-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
                  <Columns size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-base-content">
                    Customize Table Columns
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Select which columns to show or hide. Preferences save automatically.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content"
                onClick={() => setIsColumnModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-base-200/60 p-2.5 rounded-2xl border border-base-300/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/70 px-1">
                <span>Active:</span>
                <span className="badge badge-sm badge-primary font-bold">
                  {visibleColumns.length} of {ALL_COLUMNS.length} Columns
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllColumns}
                  className="btn btn-xs btn-ghost text-xs font-bold gap-1 rounded-xl cursor-pointer hover:bg-base-300"
                >
                  <CheckSquare size={12} className="text-success" />
                  <span>Select All</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeselectOptionalColumns}
                  className="btn btn-xs btn-ghost text-xs font-bold gap-1 rounded-xl cursor-pointer hover:bg-base-300"
                >
                  <Square size={12} className="text-error" />
                  <span>Deselect Optional</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaultColumns}
                  className="btn btn-xs btn-ghost text-xs font-bold gap-1 rounded-xl cursor-pointer hover:bg-base-300"
                >
                  <RotateCcw size={12} className="text-info" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* Scrollable Column Groups Grid */}
            <div className="overflow-y-auto space-y-4 pr-1 max-h-[50vh]">
              {/* 1. Buy Columns Set */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-extrabold text-[10px] tracking-wide uppercase">
                    Buy Columns Set
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    ({ALL_COLUMNS.filter((c) => c.category === "buy" && isColVisible(c.id)).length} / {ALL_COLUMNS.filter((c) => c.category === "buy").length} active)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_COLUMNS.filter((c) => c.category === "buy").map((col) => {
                    const isChecked = isColVisible(col.id);
                    const ColIcon = col.icon || Layers;

                    return (
                      <label
                        key={col.id}
                        onClick={() => toggleColumn(col.id)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-xs"
                            : "bg-base-100 border-base-200 text-base-content/60 hover:bg-base-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ColIcon size={14} className="shrink-0" />
                          <span className="truncate">{col.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="checkbox checkbox-xs checkbox-success rounded-md"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Sell Columns Set */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-extrabold text-[10px] tracking-wide uppercase">
                    Sell Columns Set
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    ({ALL_COLUMNS.filter((c) => c.category === "sell" && isColVisible(c.id)).length} / {ALL_COLUMNS.filter((c) => c.category === "sell").length} active)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_COLUMNS.filter((c) => c.category === "sell").map((col) => {
                    const isChecked = isColVisible(col.id);
                    const ColIcon = col.icon || Clock;

                    return (
                      <label
                        key={col.id}
                        onClick={() => toggleColumn(col.id)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 shadow-xs"
                            : "bg-base-100 border-base-200 text-base-content/60 hover:bg-base-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ColIcon size={14} className="shrink-0" />
                          <span className="truncate">{col.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="checkbox checkbox-xs checkbox-error rounded-md"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Other Columns Set */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm badge-info font-extrabold text-[10px] tracking-wide uppercase">
                    Other Columns Set
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    ({ALL_COLUMNS.filter((c) => c.category === "other" && isColVisible(c.id)).length} / {ALL_COLUMNS.filter((c) => c.category === "other").length} active)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_COLUMNS.filter((c) => c.category === "other").map((col) => {
                    const isChecked = isColVisible(col.id);
                    const ColIcon = col.icon || Sparkles;

                    return (
                      <label
                        key={col.id}
                        onClick={() => toggleColumn(col.id)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-info/10 border-info/40 text-info shadow-xs"
                            : "bg-base-100 border-base-200 text-base-content/60 hover:bg-base-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ColIcon size={14} className="shrink-0" />
                          <span className="truncate">{col.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="checkbox checkbox-xs checkbox-info rounded-md"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-base-200">
              <span className="text-xs text-base-content/50 font-medium">
                SLNo, Name, and Actions are fixed columns.
              </span>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 shadow-md cursor-pointer"
                onClick={() => setIsColumnModalOpen(false)}
              >
                <Check size={16} />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
