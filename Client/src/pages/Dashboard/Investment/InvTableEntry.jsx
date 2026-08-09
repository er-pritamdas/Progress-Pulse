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
  ChevronsUp,
  ChevronsDown,
  LayoutList,
  LayoutGrid,
  FolderTree,
  FolderPlus,
  GripVertical,
} from "lucide-react";
import { TitleChanger } from "../../../utils/TitleChanger";
import AddStockTradeModal from "../../../components/Dashboard/Investment/AddStockTradeModal";
import StockTradeCalculationModal from "../../../components/Dashboard/Investment/StockTradeCalculationModal";
import AddMutualFundModal from "../../../components/Dashboard/Investment/AddMutualFundModal";
import AddSipTransactionModal from "../../../components/Dashboard/Investment/AddSipTransactionModal";
import OrganizeMfGroupsModal from "../../../components/Dashboard/Investment/OrganizeMfGroupsModal";
import axiosInstance from "../../../Context/AxiosInstance";
import { formatDateDDMMMYYYY } from "../../../components/Dashboard/DatePicker";

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

  // Mutual Fund State
  // Each fund = { id, amc, category, subCategory, plan, optionType, folioNumber, investmentType, transactions: [{id, term, type, date, amtDeposit, er, actualAmt, nav, units}] }
  const [mfData, setMfData] = useState([]);
  const [isAddMfModalOpen, setIsAddMfModalOpen] = useState(false);
  const [editingMf, setEditingMf] = useState(null);
  const [expandedMfIds, setExpandedMfIds] = useState(new Set());
  const [inlineAddingMfId, setInlineAddingMfId] = useState(null);
  const [inlineNewTxn, setInlineNewTxn] = useState({
    term: '',
    type: 'SIP',
    date: new Date().toISOString().split('T')[0],
    amtDeposit: '',
    er: '0',
    nav: '',
  });
  const [editingTxnKey, setEditingTxnKey] = useState(null);
  const [editTxnData, setEditTxnData] = useState({
    term: '',
    type: 'SIP',
    date: '',
    amtDeposit: '',
    er: '',
    nav: '',
  });
  // SIP Popup Modal State
  const [isSipModalOpen, setIsSipModalOpen] = useState(false);
  const [activeSipFund, setActiveSipFund] = useState(null);
  const [editingSipTxn, setEditingSipTxn] = useState(null);

  const handleOpenAddSipModal = (fund) => {
    setActiveSipFund(fund);
    setEditingSipTxn(null);
    setIsSipModalOpen(true);
  };

  const handleOpenEditSipModal = (fund, txn) => {
    setActiveSipFund(fund);
    setEditingSipTxn(txn);
    setIsSipModalOpen(true);
  };

  const handleSaveSipModalTxn = async (txnPayload, isEdit) => {
    if (!activeSipFund) return;
    try {
      if (isEdit && editingSipTxn) {
        const res = await axiosInstance.put(
          `/v1/dashboard/investment/mf/${activeSipFund.id}/transactions/${editingSipTxn.id}`,
          txnPayload
        );
        if (res.data && res.data.success) {
          setMfData((prev) =>
            prev.map((f) => (f.id === activeSipFund.id ? res.data.data : f))
          );
        }
      } else {
        const res = await axiosInstance.post(
          `/v1/dashboard/investment/mf/${activeSipFund.id}/transactions`,
          txnPayload
        );
        if (res.data && res.data.success) {
          setMfData((prev) =>
            prev.map((f) => (f.id === activeSipFund.id ? res.data.data : f))
          );
        }
      }
    } catch (error) {
      console.error("Error saving SIP transaction:", error);
      alert("Failed to save transaction to database: " + (error.response?.data?.message || error.message));
    }
  };

  // Mutual Fund Layout View (1-col vs 2-col, Default: 2-col)
  const [mfLayoutView, setMfLayoutView] = useState(
    () => localStorage.getItem("mf_layout_view") || "2-col"
  );

  const handleMfLayoutChange = (view) => {
    setMfLayoutView(view);
    localStorage.setItem("mf_layout_view", view);
  };

  // Custom Mutual Fund Groups State (Persisted in localStorage)
  const [mfGroups, setMfGroups] = useState(() => {
    try {
      const saved = localStorage.getItem("mf_custom_groups");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState(new Set());

  const handleSaveGroups = (newGroups) => {
    setMfGroups(newGroups);
    localStorage.setItem("mf_custom_groups", JSON.stringify(newGroups));
  };

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Mutual Fund Search Filter
  const [mfSearchTerm, setMfSearchTerm] = useState("");

  const filteredMutualFunds = useMemo(() => {
    if (!mfSearchTerm.trim()) return mfData;
    const term = mfSearchTerm.toLowerCase().trim();
    return mfData.filter((fund) => {
      const amcMatch = (fund.amc || "").toLowerCase().includes(term);
      const catMatch = (fund.category || "").toLowerCase().includes(term);
      const subCatMatch = (fund.subCategory || "").toLowerCase().includes(term);
      const schemeMatch = (fund.schemeName || "").toLowerCase().includes(term);
      const folioMatch = (fund.folioNumber || "").toLowerCase().includes(term);
      return amcMatch || catMatch || subCatMatch || schemeMatch || folioMatch;
    });
  }, [mfData, mfSearchTerm]);

  // Helper to get detailed mutual fund metrics
  const getMfStats = (fund) => {
    const txns = fund.transactions || [];
    const txnCount = txns.length;
    const totalInvested = txns.reduce(
      (sum, t) => sum + (t.actualAmt ?? (t.amtDeposit ? t.amtDeposit - (t.er || 0) : t.amount) ?? 0),
      0
    );
    const totalUnits = txns.reduce(
      (sum, t) =>
        sum +
        (parseFloat(t.units) ||
          (t.nav > 0 ? (t.actualAmt ?? t.amtDeposit - (t.er || 0)) / t.nav : 0)),
      0
    );
    const avgNav = totalUnits > 0 ? totalInvested / totalUnits : 0;

    return {
      txnCount,
      totalInvested,
      totalUnits,
      avgNav,
    };
  };

  // Grouped Mutual Funds calculation
  const groupedMutualFunds = useMemo(() => {
    if (!mfGroups || mfGroups.length === 0) {
      return [
        {
          id: "default-group",
          name: "General Mutual Funds",
          funds: filteredMutualFunds,
          totalInvested: filteredMutualFunds.reduce((acc, f) => acc + (getMfStats(f).totalInvested || 0), 0),
        },
      ];
    }

    const fundMap = new Map(filteredMutualFunds.map((f) => [f.id, f]));
    const assignedFundIds = new Set();
    const resultGroups = [];

    mfGroups.forEach((group) => {
      const groupFunds = (group.fundIds || [])
        .map((id) => fundMap.get(id))
        .filter(Boolean);

      groupFunds.forEach((f) => assignedFundIds.add(f.id));

      if (groupFunds.length > 0) {
        resultGroups.push({
          id: group.id,
          name: group.name,
          funds: groupFunds,
          totalInvested: groupFunds.reduce((acc, f) => acc + (getMfStats(f).totalInvested || 0), 0),
        });
      }
    });

    const unassignedFunds = filteredMutualFunds.filter((f) => !assignedFundIds.has(f.id));
    if (unassignedFunds.length > 0) {
      resultGroups.push({
        id: "unassigned-group",
        name: "Other Mutual Funds",
        funds: unassignedFunds,
        totalInvested: unassignedFunds.reduce((acc, f) => acc + (getMfStats(f).totalInvested || 0), 0),
      });
    }

    return resultGroups;
  }, [filteredMutualFunds, mfGroups, getMfStats]);

  // Collapsed Years set for transactions inside funds
  const [collapsedMfYearKeys, setCollapsedMfYearKeys] = useState(new Set());

  // SIP Table Sorting State
  const [sipSortBy, setSipSortBy] = useState("date"); // "term" | "type" | "date" | "amtDeposit" | "er" | "nav" | "units" | "actualAmt"
  const [sipSortOrder, setSipSortOrder] = useState("desc"); // "asc" | "desc"

  const handleSipSort = (columnId) => {
    if (sipSortBy === columnId) {
      setSipSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSipSortBy(columnId);
      setSipSortOrder(
        columnId === "term" || columnId === "type" || columnId === "date" ? "asc" : "desc"
      );
    }
  };

  // Helper to sort SIP transactions
  const sortSipTransactions = (transactions = [], col = "date", order = "desc") => {
    if (!col || !transactions.length) return transactions;
    return [...transactions].sort((a, b) => {
      let valA, valB;
      switch (col) {
        case "term": {
          valA = String(a.term || "").toLowerCase();
          valB = String(b.term || "").toLowerCase();
          const numA = parseInt(valA.replace(/\D/g, ""), 10);
          const numB = parseInt(valB.replace(/\D/g, ""), 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            return order === "asc" ? numA - numB : numB - numA;
          }
          return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        case "type": {
          valA = String(a.type || "SIP").toLowerCase();
          valB = String(b.type || "SIP").toLowerCase();
          return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        case "date": {
          valA = new Date(a.date || 0).getTime();
          valB = new Date(b.date || 0).getTime();
          return order === "asc" ? valA - valB : valB - valA;
        }
        case "amtDeposit": {
          valA = Number(a.amtDeposit ?? a.amount ?? 0);
          valB = Number(b.amtDeposit ?? b.amount ?? 0);
          return order === "asc" ? valA - valB : valB - valA;
        }
        case "er": {
          valA = Number(a.er ?? 0);
          valB = Number(b.er ?? 0);
          return order === "asc" ? valA - valB : valB - valA;
        }
        case "nav": {
          valA = Number(a.nav ?? 0);
          valB = Number(b.nav ?? 0);
          return order === "asc" ? valA - valB : valB - valA;
        }
        case "units": {
          const actA = Number(a.actualAmt ?? Math.max(0, (a.amtDeposit ?? a.amount ?? 0) - (a.er ?? 0)));
          const navA = Number(a.nav ?? 0);
          valA = parseFloat(a.units) || (navA > 0 ? actA / navA : 0);

          const actB = Number(b.actualAmt ?? Math.max(0, (b.amtDeposit ?? b.amount ?? 0) - (b.er ?? 0)));
          const navB = Number(b.nav ?? 0);
          valB = parseFloat(b.units) || (navB > 0 ? actB / navB : 0);
          return order === "asc" ? valA - valB : valB - valA;
        }
        case "actualAmt": {
          valA = Number(a.actualAmt ?? Math.max(0, (a.amtDeposit ?? a.amount ?? 0) - (a.er ?? 0)));
          valB = Number(b.actualAmt ?? Math.max(0, (b.amtDeposit ?? b.amount ?? 0) - (b.er ?? 0)));
          return order === "asc" ? valA - valB : valB - valA;
        }
        default:
          return 0;
      }
    });
  };

  const toggleMfYearCollapse = (fundId, year) => {
    const key = `${fundId}-${year}`;
    setCollapsedMfYearKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllMfYearsCollapse = (fundId, yearGroups = []) => {
    const allYearKeys = yearGroups.map((yg) => `${fundId}-${yg.year}`);
    const areAllCollapsed = allYearKeys.length > 0 && allYearKeys.every((key) => collapsedMfYearKeys.has(key));

    setCollapsedMfYearKeys((prev) => {
      const next = new Set(prev);
      if (areAllCollapsed) {
        allYearKeys.forEach((key) => next.delete(key));
      } else {
        allYearKeys.forEach((key) => next.add(key));
      }
      return next;
    });
  };

  // Helper to group transactions by year (with global sorting applied across all entries and year groups)
  const getFundTransactionsByYear = (transactions = [], sortCol = sipSortBy, sortOrd = sipSortOrder) => {
    const sortedTxns = sortSipTransactions(transactions, sortCol, sortOrd);
    const yearGroupsList = [];
    const yearMap = {};

    sortedTxns.forEach((txn) => {
      let yr = "Other";
      if (txn.date) {
        const parts = String(txn.date).split("-");
        if (parts[0] && parts[0].length === 4) {
          yr = parts[0];
        } else {
          const d = new Date(txn.date);
          if (!isNaN(d.getFullYear())) {
            yr = String(d.getFullYear());
          }
        }
      }

      if (!yearMap[yr]) {
        yearMap[yr] = [];
        yearGroupsList.push(yr); // Order of years follows global transaction sorting sequence
      }
      yearMap[yr].push(txn);
    });

    return yearGroupsList.map((year) => {
      const txns = yearMap[year];
      const totalDeposit = txns.reduce((s, t) => s + (t.amtDeposit ?? t.amount ?? 0), 0);
      const totalEr = txns.reduce((s, t) => s + (t.er ?? 0), 0);
      const totalActual = txns.reduce((s, t) => s + (t.actualAmt ?? Math.max(0, (t.amtDeposit ?? t.amount ?? 0) - (t.er ?? 0))), 0);
      const totalUnits = txns.reduce((s, t) => s + (parseFloat(t.units) || (t.nav > 0 ? ((t.actualAmt ?? (t.amtDeposit - (t.er || 0))) / t.nav) : 0)), 0);
      const avgNav = totalUnits > 0 ? totalActual / totalUnits : 0;

      return {
        year,
        txns,
        totalDeposit,
        totalEr,
        totalActual,
        totalUnits,
        avgNav,
      };
    });
  };

  const handleOpenAddMfModal = () => {
    setEditingMf(null);
    setIsAddMfModalOpen(true);
  };

  const handleEditMf = (fund) => {
    setEditingMf(fund);
    setIsAddMfModalOpen(true);
  };

  const handleSaveMutualFund = async (fundPayload, isEdit) => {
    try {
      if (isEdit && editingMf) {
        const res = await axiosInstance.put(
          `/v1/dashboard/investment/mf/${editingMf.id}`,
          fundPayload
        );
        if (res.data && res.data.success) {
          setMfData((prev) =>
            prev.map((f) => (f.id === editingMf.id ? res.data.data : f))
          );
        }
      } else {
        const res = await axiosInstance.post(
          "/v1/dashboard/investment/mf",
          fundPayload
        );
        if (res.data && res.data.success) {
          const newFund = res.data.data;
          setMfData((prev) => [newFund, ...prev]);
          setExpandedMfIds((prev) => new Set([...prev, newFund.id]));
        }
      }
    } catch (error) {
      console.error("Error saving mutual fund:", error);
      alert("Failed to save mutual fund to database");
    }
  };

  const handleDeleteMf = async (fundId) => {
    if (window.confirm('Are you sure you want to delete this Mutual Fund and all its SIP transactions?')) {
      try {
        const res = await axiosInstance.delete(`/v1/dashboard/investment/mf/${fundId}`);
        if (res.data && res.data.success) {
          setMfData((prev) => prev.filter((f) => f.id !== fundId));
        }
      } catch (error) {
        console.error("Error deleting mutual fund:", error);
        alert("Failed to delete mutual fund");
      }
    }
  };

  const toggleMfExpand = (fundId) => {
    setExpandedMfIds((prev) => {
      const next = new Set(prev);
      if (next.has(fundId)) next.delete(fundId);
      else next.add(fundId);
      return next;
    });
  };

  // Start adding SIP transaction with pre-filled previous details
  const handleStartAddSipTxn = (fund) => {
    if (inlineAddingMfId === fund.id) {
      setInlineAddingMfId(null);
      return;
    }

    const txns = fund.transactions || [];
    const lastTxn = txns[0]; // Most recent transaction
    const nextTermNum = txns.length + 1;

    setInlineNewTxn({
      term: `Term ${nextTermNum}`,
      type: lastTxn?.type || fund.investmentType || 'SIP',
      date: new Date().toISOString().split('T')[0],
      amtDeposit: lastTxn ? String(lastTxn.amtDeposit ?? lastTxn.amount ?? '') : '',
      er: lastTxn ? String(lastTxn.er ?? '0') : '0',
      nav: lastTxn ? String(lastTxn.nav ?? '') : '',
    });

    setInlineAddingMfId(fund.id);
  };

  // Save SIP Transaction to DB
  const handleAddSipTxn = async (fundId) => {
    const amtDepVal = parseFloat(inlineNewTxn.amtDeposit) || 0;
    if (amtDepVal <= 0) return;

    const erVal = parseFloat(inlineNewTxn.er) || 0;
    const actualAmt = Math.max(0, amtDepVal - erVal);
    const navVal = parseFloat(inlineNewTxn.nav) || 0;
    const units = navVal > 0 ? parseFloat((actualAmt / navVal).toFixed(3)) : 0;

    const targetFund = mfData.find((f) => f.id === fundId);
    const fallbackTerm = `Term ${(targetFund?.transactions || []).length + 1}`;

    const newTxnPayload = {
      term: inlineNewTxn.term.trim() || fallbackTerm,
      type: inlineNewTxn.type || 'SIP',
      date: inlineNewTxn.date || new Date().toISOString().split('T')[0],
      amtDeposit: amtDepVal,
      er: erVal,
      actualAmt: actualAmt,
      nav: navVal,
      units: units,
      amount: actualAmt,
    };

    try {
      const res = await axiosInstance.post(
        `/v1/dashboard/investment/mf/${fundId}/transactions`,
        newTxnPayload
      );
      if (res.data && res.data.success) {
        setMfData((prev) =>
          prev.map((f) => (f.id === fundId ? res.data.data : f))
        );
      }
    } catch (error) {
      console.error("Error adding SIP transaction:", error);
      alert("Failed to add SIP transaction");
    } finally {
      setInlineAddingMfId(null);
    }
  };

  const handleDeleteSipTxn = async (fundId, txnId) => {
    try {
      const res = await axiosInstance.delete(
        `/v1/dashboard/investment/mf/${fundId}/transactions/${txnId}`
      );
      if (res.data && res.data.success) {
        setMfData((prev) =>
          prev.map((f) => (f.id === fundId ? res.data.data : f))
        );
      }
    } catch (error) {
      console.error("Error deleting SIP transaction:", error);
      alert("Failed to delete SIP transaction");
    }
  };

  const startEditSipTxn = (fundId, txn) => {
    setEditingTxnKey({ fundId, txnId: txn.id });
    setEditTxnData({
      term: txn.term || '',
      type: txn.type || 'SIP',
      date: txn.date || '',
      amtDeposit: String(txn.amtDeposit ?? txn.amount ?? ''),
      er: String(txn.er ?? 0),
      nav: String(txn.nav ?? ''),
    });
  };

  const saveEditSipTxn = async () => {
    if (!editingTxnKey) return;
    const { fundId, txnId } = editingTxnKey;

    const amtDepVal = parseFloat(editTxnData.amtDeposit) || 0;
    const erVal = parseFloat(editTxnData.er) || 0;
    const actualAmt = Math.max(0, amtDepVal - erVal);
    const navVal = parseFloat(editTxnData.nav) || 0;
    const units = navVal > 0 ? parseFloat((actualAmt / navVal).toFixed(3)) : 0;

    const updatePayload = {
      term: editTxnData.term,
      type: editTxnData.type || 'SIP',
      date: editTxnData.date,
      amtDeposit: amtDepVal,
      er: erVal,
      actualAmt: actualAmt,
      nav: navVal,
      units: units,
      amount: actualAmt,
    };

    try {
      const res = await axiosInstance.put(
        `/v1/dashboard/investment/mf/${fundId}/transactions/${txnId}`,
        updatePayload
      );
      if (res.data && res.data.success) {
        setMfData((prev) =>
          prev.map((f) => (f.id === fundId ? res.data.data : f))
        );
      }
    } catch (error) {
      console.error("Error updating SIP transaction:", error);
      alert("Failed to update SIP transaction");
    } finally {
      setEditingTxnKey(null);
    }
  };

  // Computed: total invested (actual amt) per fund
  const getMfTotalInvested = (fund) => {
    return (fund.transactions || []).reduce((sum, t) => sum + (t.actualAmt ?? (t.amtDeposit ? t.amtDeposit - (t.er || 0) : t.amount) ?? 0), 0);
  };

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoStock, setInfoStock] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch stocks & mutual funds data from DB on mount
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

  const fetchMutualFunds = async () => {
    try {
      const res = await axiosInstance.get("/v1/dashboard/investment/mf");
      if (res.data && res.data.success) {
        const funds = res.data.data || [];
        setMfData(funds);

        // 1. Expand all Mutual Fund accordion cards by default
        const allFundIds = funds.map((f) => f.id);
        setExpandedMfIds(new Set(allFundIds));

        // 2. Expand all Year groups and transaction rows by default
        setCollapsedMfYearKeys(new Set());
      }
    } catch (error) {
      console.error("Error fetching mutual funds:", error);
    }
  };

  React.useEffect(() => {
    fetchStockTrades();
    fetchMutualFunds();
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

          {/* Action Button to Open Add Stock / Mutual Fund Modal */}
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

          {activeTab === "mf" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm rounded-xl gap-2 font-medium shadow-md shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
              onClick={handleOpenAddMfModal}
            >
              <Plus size={16} />
              <span>Add Mutual Fund Entry</span>
            </button>
          )}
        </div>

        {/* Single-Line Controls & Filters Bar for Mutual Funds */}
        {activeTab === "mf" && (
          <div className="bg-base-100/80 backdrop-blur-md p-2.5 rounded-2xl border border-base-200/70 shadow-sm overflow-visible">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 w-full">
              {/* Left Side: Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  value={mfSearchTerm}
                  onChange={(e) => setMfSearchTerm(e.target.value)}
                  placeholder="Search mutual funds by AMC, Category, Scheme, Folio..."
                  className="input input-sm pl-9 pr-8 w-full rounded-xl bg-base-200/60 border-base-200 focus:border-secondary text-xs"
                />
                {mfSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setMfSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Right Side: Organize Groups & Layout View Toggle */}
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsOrganizeModalOpen(true)}
                  className="btn btn-xs btn-ghost rounded-lg gap-1.5 font-bold text-xs border border-base-300/60 hover:bg-base-200 transition-all cursor-pointer"
                  title="Organize Mutual Fund Groups & Order"
                >
                  <FolderTree size={14} className="text-secondary" />
                  <span className="hidden sm:inline">Organize Groups</span>
                </button>

                <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300/60 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMfLayoutChange("1-col")}
                    className={`btn btn-xs rounded-lg px-2.5 transition-all cursor-pointer ${
                      mfLayoutView === "1-col"
                        ? "btn-secondary shadow-xs text-white"
                        : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                    title="1 Column View"
                  >
                    <LayoutList size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMfLayoutChange("2-col")}
                    className={`btn btn-xs rounded-lg px-2.5 transition-all cursor-pointer ${
                      mfLayoutView === "2-col"
                        ? "btn-secondary shadow-xs text-white"
                        : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                    title="2 Columns View"
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
      {/* MUTUAL FUND TAB VIEW (activeTab === "mf")                          */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "mf" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Empty State */}
          {mfData.length === 0 ? (
            <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-4">
                <div className="p-4 bg-secondary/10 text-secondary rounded-3xl">
                  <PieChart size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">
                    No Mutual Funds Yet
                  </h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    Add a mutual fund to start tracking your SIP transactions. Each fund acts as a category where you can log individual installments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddMfModal}
                  className="btn btn-secondary btn-sm rounded-xl gap-2 font-bold px-5 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add First Mutual Fund</span>
                </button>
              </div>
            </div>
          ) : filteredMutualFunds.length === 0 ? (
            <div className="bg-base-100 p-10 rounded-3xl border border-base-200 shadow-sm text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
                  <Search size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-base-content">
                    No Matching Mutual Funds Found
                  </h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    No funds matched your search query <span className="font-semibold text-secondary">"{mfSearchTerm}"</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMfSearchTerm("")}
                  className="btn btn-ghost btn-xs text-secondary font-bold hover:bg-secondary/10 cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            /* Grouped Fund Cards with Full-Width Collapsible Group Headers */
            <div className="space-y-6">
              {groupedMutualFunds.map((group) => {
                const isGroupCollapsed = collapsedGroupIds.has(group.id);

                return (
                  <div key={group.id} className="space-y-3.5">
                    {/* Full-Width Collapsible Group Header */}
                    <div
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="flex items-center justify-between px-4 py-2.5 bg-base-100/90 backdrop-blur-md rounded-2xl border border-base-200/90 shadow-2xs cursor-pointer hover:bg-base-200/40 transition-all select-none group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1 rounded-xl bg-secondary/10 text-secondary transition-transform duration-200 shrink-0 ${isGroupCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                          <ChevronDown size={16} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <h3 className="font-extrabold text-sm text-base-content tracking-tight group-hover:text-secondary transition-colors truncate">
                            {group.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold border border-secondary/20 shrink-0">
                            {group.funds.length} fund{group.funds.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Group Subtotal Summary */}
                      <div className="flex items-center gap-4 text-xs font-medium text-base-content/70 shrink-0">
                        <span className="hidden sm:inline">
                          Invested: <strong className="text-base-content font-bold">₹{group.totalInvested.toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Group Fund Cards Grid / List */}
                    {!isGroupCollapsed && (
                      <div className={mfLayoutView === "2-col" ? "grid grid-cols-1 lg:grid-cols-2 gap-4 items-start" : "space-y-4"}>
                        {group.funds.map((fund) => {
                          const isExpanded = expandedMfIds.has(fund.id);
                          const { txnCount, totalInvested, totalUnits, avgNav } = getMfStats(fund);
                          const isInlineAdding = inlineAddingMfId === fund.id;
                          const yearGroups = getFundTransactionsByYear(fund.transactions || [], sipSortBy, sipSortOrder);

                          return (
                            <div
                              key={fund.id}
                              className="bg-base-100 rounded-2xl border border-base-200/90 shadow-xs hover:shadow-md h-[550px] flex flex-col relative overflow-hidden transition-all duration-300"
                            >
                    {/* Fund Header (Fixed at Top of Card) */}
                    <div className="p-3.5 sm:p-4 bg-base-100 border-b border-base-200/80 shrink-0">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Left Section: AMC Icon & Simple Fund Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* AMC Logo Initial Avatar */}
                          <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary font-bold text-xs flex items-center justify-center shrink-0">
                            {(fund.amc || '?').charAt(0).toUpperCase()}
                          </div>

                          {/* Fund Title & Simple Plain Text Metadata */}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-sm text-base-content tracking-tight truncate">
                                {fund.amc}
                              </h3>
                              {fund.folioNumber && (
                                <span className="px-1.5 py-0.2 rounded-md bg-secondary/10 text-secondary text-[10px] font-mono font-bold border border-secondary/20 shrink-0">
                                  Folio #{fund.folioNumber}
                                </span>
                              )}
                            </div>

                            {/* Simple Muted Tags/Metadata with Highlighted Asset Category */}
                            <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {fund.category} → {fund.subCategory}
                              </span>
                              <span className="text-base-content/30">•</span>
                              <span className="text-base-content/60 font-medium">{fund.plan}</span>
                              <span className="text-base-content/30">•</span>
                              <span className="text-base-content/60 font-medium">{fund.optionType}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section: Action Buttons Toolbar */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Edit Fund */}
                          <button
                            type="button"
                            onClick={() => handleEditMf(fund)}
                            className="p-1 text-info bg-info/10 hover:bg-info/20 rounded-md transition-colors cursor-pointer"
                            title="Edit Fund Details"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete Fund */}
                          <button
                            type="button"
                            onClick={() => handleDeleteMf(fund.id)}
                            className="p-1 text-error bg-error/10 hover:bg-error/20 rounded-md transition-colors cursor-pointer"
                            title="Delete Fund"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SIP Transactions Table grouped by Year (Scrollable Inner Content inside fixed h-[550px] container) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar-thin p-2.5 space-y-2.5 bg-base-200/20">
                        {/* Table Header Action Bar - Sticky inside scroll container */}
                        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 sticky top-0 z-20 bg-base-100/95 backdrop-blur-md rounded-xl border border-base-200/80 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 flex items-center gap-1.5">
                              <Layers size={12} className="text-secondary" />
                              <span>Transactions ({txnCount} total)</span>
                            </span>
                            {sipSortBy && (
                              <span className="text-[10px] text-base-content/50 font-normal">
                                (Sorted by {sipSortBy} {sipSortOrder.toUpperCase()})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {yearGroups.length > 0 && (() => {
                              const allYearKeys = yearGroups.map((yg) => `${fund.id}-${yg.year}`);
                              const areAllCollapsed = allYearKeys.every((key) => collapsedMfYearKeys.has(key));

                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAllMfYearsCollapse(fund.id, yearGroups);
                                  }}
                                  className="btn btn-ghost btn-xs rounded-lg gap-1 font-semibold text-[10px] h-6 min-h-0 text-base-content/70 hover:text-base-content hover:bg-base-200/80 cursor-pointer border border-base-200/80 shadow-2xs"
                                  title={areAllCollapsed ? "Expand All Year Groups" : "Collapse All Year Groups"}
                                >
                                  {areAllCollapsed ? (
                                    <>
                                      <ChevronsDown size={12} className="text-secondary" />
                                      <span>Expand Years</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronsUp size={12} className="text-secondary" />
                                      <span>Collapse Years</span>
                                    </>
                                  )}
                                </button>
                              );
                            })()}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddSipModal(fund);
                              }}
                              className="btn btn-secondary btn-xs rounded-lg gap-1 font-semibold text-[10px] h-6 min-h-0 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              <Plus size={11} />
                              <span>Add SIP</span>
                            </button>
                          </div>
                        </div>

                        {/* Empty State when 0 transactions */}
                        {txnCount === 0 && (
                          <div className="py-6 text-center bg-base-100 rounded-xl border border-base-200/80">
                            <div className="text-base-content/40 text-[11px] font-medium">
                              No transactions logged yet.
                              <button
                                type="button"
                                onClick={() => handleOpenAddSipModal(fund)}
                                className="text-secondary font-semibold ml-1 hover:underline cursor-pointer"
                              >
                                Add first installment →
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Single Consolidated Table for all years */}
                        <div className="bg-base-100 border border-base-200/80 rounded-xl overflow-hidden shadow-2xs">
                          <div className="w-full max-h-[400px] overflow-y-auto custom-scrollbar-thin">
                            <table className="table table-xs w-full text-[9.5px] table-fixed">
                              <thead className="z-20">
                                <tr className="border-b border-base-200/80 text-[9px] font-bold text-base-content/70 uppercase tracking-wider select-none">
                                  {/* Term Sort Button */}
                                  <th className="sticky top-0 z-20 w-[13%] h-6 py-1 px-1 text-left font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => handleSipSort("term")}
                                      className="flex items-center gap-0.5 hover:text-secondary transition-colors cursor-pointer group"
                                      title="Sort by Term"
                                    >
                                      <Hash size={9} className="text-secondary/70 shrink-0" />
                                      <span className="truncate">Term</span>
                                      {sipSortBy === "term" ? (
                                        sipSortOrder === "asc" ? (
                                          <ArrowUp size={10} className="text-secondary font-bold shrink-0" />
                                        ) : (
                                          <ArrowDown size={10} className="text-secondary font-bold shrink-0" />
                                        )
                                      ) : (
                                        <ArrowUpDown size={9} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                                      )}
                                    </button>
                                  </th>

                                  {/* Type Sort Button */}
                                  <th className="sticky top-0 z-20 w-[6%] h-6 py-1 px-0.5 text-center font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => handleSipSort("type")}
                                      className="flex items-center justify-center gap-0.5 mx-auto hover:text-secondary transition-colors cursor-pointer group"
                                      title="Sort by Type"
                                    >
                                      <Sparkles size={9} className="text-secondary/70 shrink-0" />
                                      <span className="truncate">Type</span>
                                      {sipSortBy === "type" ? (
                                        sipSortOrder === "asc" ? (
                                          <ArrowUp size={10} className="text-secondary font-bold shrink-0" />
                                        ) : (
                                          <ArrowDown size={10} className="text-secondary font-bold shrink-0" />
                                        )
                                      ) : (
                                        <ArrowUpDown size={9} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                                      )}
                                    </button>
                                  </th>

                                  {/* Date Sort Button */}
                                  <th className="sticky top-0 z-20 w-[13%] h-6 py-1 px-1 text-center font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => handleSipSort("date")}
                                      className="flex items-center justify-center gap-0.5 mx-auto hover:text-secondary transition-colors cursor-pointer group"
                                      title="Sort by Date"
                                    >
                                      <Calendar size={9} className="text-secondary/70 shrink-0" />
                                      <span className="truncate">Date</span>
                                      {sipSortBy === "date" ? (
                                        sipSortOrder === "asc" ? (
                                          <ArrowUp size={10} className="text-secondary font-bold shrink-0" />
                                        ) : (
                                          <ArrowDown size={10} className="text-secondary font-bold shrink-0" />
                                        )
                                      ) : (
                                        <ArrowUpDown size={9} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                                      )}
                                    </button>
                                  </th>

                                  {/* Deposit ₹ Sort Button */}
                                  <th className="sticky top-0 z-20 w-[13%] h-6 py-1 px-1 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => handleSipSort("amtDeposit")}
                                      className="flex items-center justify-end gap-0.5 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                                      title="Sort by Deposit Amount"
                                    >
                                      <Coins size={9} className="text-secondary/70 shrink-0" />
                                      <span className="truncate">Deposit ₹</span>
                                      {sipSortBy === "amtDeposit" ? (
                                        sipSortOrder === "asc" ? (
                                          <ArrowUp size={10} className="text-secondary font-bold shrink-0" />
                                        ) : (
                                          <ArrowDown size={10} className="text-secondary font-bold shrink-0" />
                                        )
                                      ) : (
                                        <ArrowUpDown size={9} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                                      )}
                                    </button>
                                  </th>

                                  {/* ER ₹ Sort Button */}
                                  <th className="sticky top-0 z-20 w-[7%] h-6 py-1 px-0.5 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => handleSipSort("er")}
                                      className="flex items-center justify-end gap-0.5 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                                      title="Sort by Expense Ratio / Charges"
                                    >
                                      <Percent size={9} className="text-secondary/70 shrink-0" />
                                      <span className="truncate">ER ₹</span>
                                      {sipSortBy === "er" ? (
                                        sipSortOrder === "asc" ? (
                                          <ArrowUp size={10} className="text-secondary font-bold shrink-0" />
                                        ) : (
                                          <ArrowDown size={10} className="text-secondary font-bold shrink-0" />
                                        )
                                      ) : (
                                        <ArrowUpDown size={9} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                                      )}
                                    </button>
                                  </th>

                                  {/* NAV ₹ Sort Button */}
                                  <th className="sticky top-0 z-20 w-[10%] h-6 py-1 px-1 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => handleSipSort("nav")}
                                      className="flex items-center justify-end gap-0.5 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                                      title="Sort by NAV"
                                    >
                                      <TrendingUp size={9} className="text-secondary/70 shrink-0" />
                                      <span className="truncate">NAV ₹</span>
                                      {sipSortBy === "nav" ? (
                                        sipSortOrder === "asc" ? (
                                          <ArrowUp size={10} className="text-secondary font-bold shrink-0" />
                                        ) : (
                                          <ArrowDown size={10} className="text-secondary font-bold shrink-0" />
                                        )
                                      ) : (
                                        <ArrowUpDown size={9} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                                      )}
                                    </button>
                                  </th>

                                  {/* Units Sort Button */}
                                  <th className="sticky top-0 z-20 w-[12%] h-6 py-1 px-1 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => handleSipSort("units")}
                                      className="flex items-center justify-end gap-0.5 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                                      title="Sort by Units"
                                    >
                                      <Layers size={9} className="text-secondary/70 shrink-0" />
                                      <span className="truncate">Units</span>
                                      {sipSortBy === "units" ? (
                                        sipSortOrder === "asc" ? (
                                          <ArrowUp size={10} className="text-secondary font-bold shrink-0" />
                                        ) : (
                                          <ArrowDown size={10} className="text-secondary font-bold shrink-0" />
                                        )
                                      ) : (
                                        <ArrowUpDown size={9} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                                      )}
                                    </button>
                                  </th>

                                  {/* Actual Amt ₹ Sort Button */}
                                  <th className="sticky top-0 z-20 w-[14%] h-6 py-1 px-1 text-right font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => handleSipSort("actualAmt")}
                                      className="flex items-center justify-end gap-0.5 ml-auto hover:text-secondary transition-colors cursor-pointer group"
                                      title="Sort by Actual Amt"
                                    >
                                      <PiggyBank size={9} className="text-secondary/70 shrink-0" />
                                      <span className="truncate">Actual Amt ₹</span>
                                      {sipSortBy === "actualAmt" ? (
                                        sipSortOrder === "asc" ? (
                                          <ArrowUp size={10} className="text-secondary font-bold shrink-0" />
                                        ) : (
                                          <ArrowDown size={10} className="text-secondary font-bold shrink-0" />
                                        )
                                      ) : (
                                        <ArrowUpDown size={9} className="opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                                      )}
                                    </button>
                                  </th>

                                  {/* Actions Header */}
                                  <th className="sticky top-0 z-20 w-[12%] h-6 py-1 px-0.5 text-center font-bold bg-base-200/95 backdrop-blur-md border-b border-base-200/80 shadow-2xs">Act</th>
                                </tr>
                              </thead>
                              <tbody>
                                {yearGroups.map((yg, yIdx) => {
                                  const yearKey = `${fund.id}-${yg.year}`;
                                  const isYearCollapsed = collapsedMfYearKeys.has(yearKey);

                                  return (
                                    <React.Fragment key={yg.year}>
                                      {/* Collapsible Year Group Header Row (Directly Attached to Table Header) */}
                                      <tr
                                        className="cursor-pointer select-none font-bold transition-colors"
                                        onClick={() => toggleMfYearCollapse(fund.id, yg.year)}
                                      >
                                        {/* Col 1: Term / Year Title & Count */}
                                        <td className="sticky top-[24px] z-10 py-1 px-1.5 text-left bg-base-200/95 backdrop-blur-md border-b border-base-200/80">
                                          <div className="flex items-center gap-1 min-w-0">
                                            <div className={`transition-transform duration-200 shrink-0 ${!isYearCollapsed ? 'rotate-0' : '-rotate-90'}`}>
                                              <ChevronDown size={10} className="text-base-content/60" />
                                            </div>
                                            <span className="font-bold text-[9.5px] text-base-content flex items-center gap-0.5 shrink-0">
                                              <Calendar size={9} className="text-primary shrink-0" />
                                              <span>{yg.year}</span>
                                            </span>
                                            <span className="px-1 py-0.1 rounded bg-secondary/10 text-secondary text-[8.5px] font-semibold border border-secondary/20 shrink-0">
                                              {yg.txns.length}
                                            </span>
                                          </div>
                                        </td>

                                        {/* Col 2: Type */}
                                        <td className="sticky top-[24px] z-10 py-1 px-0.5 text-center bg-base-200/95 backdrop-blur-md text-base-content/30 border-b border-base-200/80">—</td>

                                        {/* Col 3: Date */}
                                        <td className="sticky top-[24px] z-10 py-1 px-1 text-center bg-base-200/95 backdrop-blur-md text-base-content/30 border-b border-base-200/80">—</td>

                                        {/* Col 4: Deposit ₹ Subtotal */}
                                        <td className="sticky top-[24px] z-10 py-1 px-1 text-right bg-base-200/95 backdrop-blur-md font-bold text-base-content text-[9.5px] truncate border-b border-base-200/80">
                                          ₹{yg.totalDeposit.toLocaleString('en-IN')}
                                        </td>

                                        {/* Col 5: ER ₹ Subtotal */}
                                        <td className="sticky top-[24px] z-10 py-1 px-0.5 text-right bg-base-200/95 backdrop-blur-md font-bold text-error/80 text-[9.5px] truncate border-b border-base-200/80">
                                          ₹{yg.totalEr.toLocaleString('en-IN')}
                                        </td>

                                        {/* Col 6: NAV ₹ Avg */}
                                        <td className="sticky top-[24px] z-10 py-1 px-1 text-right bg-base-200/95 backdrop-blur-md font-semibold text-base-content/70 text-[9.5px] truncate border-b border-base-200/80">
                                          {yg.avgNav > 0 ? `₹${yg.avgNav.toFixed(2)}` : '—'}
                                        </td>

                                        {/* Col 7: Units Subtotal */}
                                        <td className="sticky top-[24px] z-10 py-1 px-1 text-right bg-base-200/95 backdrop-blur-md font-mono font-bold text-base-content/90 text-[9.5px] truncate border-b border-base-200/80">
                                          {yg.totalUnits.toFixed(3)}
                                        </td>

                                        {/* Col 8: Actual Amt ₹ Subtotal */}
                                        <td className="sticky top-[24px] z-10 py-1 px-1 text-right bg-base-200/95 backdrop-blur-md font-extrabold text-success text-[9.5px] truncate border-b border-base-200/80">
                                          +₹{yg.totalActual.toLocaleString('en-IN')}
                                        </td>

                                        {/* Col 9: Actions */}
                                        <td className="sticky top-[24px] z-10 py-1 px-0.5 bg-base-200/95 backdrop-blur-md border-b border-base-200/80"></td>
                                      </tr>

                                      {/* Inline Add Row (rendered inside top year block) */}
                                      {isInlineAdding && yIdx === 0 && (() => {
                                        const inlineAmtDep = parseFloat(inlineNewTxn.amtDeposit) || 0;
                                        const inlineEr = parseFloat(inlineNewTxn.er) || 0;
                                        const inlineActualAmt = Math.max(0, inlineAmtDep - inlineEr);
                                        const inlineNav = parseFloat(inlineNewTxn.nav) || 0;
                                        const inlineUnits = inlineNav > 0 ? (inlineActualAmt / inlineNav).toFixed(3) : '-';

                                        return (
                                          <tr className="bg-secondary/5 border-b border-secondary/15">
                                            <td className="py-0.5 px-0.5">
                                              <input
                                                type="text"
                                                placeholder="Term 1"
                                                value={inlineNewTxn.term}
                                                onChange={(e) => setInlineNewTxn({ ...inlineNewTxn, term: e.target.value })}
                                                className="h-5 text-[9.5px] font-medium px-1 py-0 rounded border border-base-300 bg-base-100 w-full focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                                                autoFocus
                                              />
                                            </td>
                                            <td className="py-0.5 px-0.5 text-center">
                                              <select
                                                value={inlineNewTxn.type || 'SIP'}
                                                onChange={(e) => setInlineNewTxn({ ...inlineNewTxn, type: e.target.value })}
                                                className="h-5 text-[9.5px] font-semibold px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                                              >
                                                <option value="SIP">SIP</option>
                                                <option value="Lumpsum">LS</option>
                                              </select>
                                            </td>
                                            <td className="py-0.5 px-0.5 text-center">
                                              <input
                                                type="date"
                                                value={inlineNewTxn.date}
                                                onChange={(e) => setInlineNewTxn({ ...inlineNewTxn, date: e.target.value })}
                                                className="h-5 text-[9.5px] font-mono px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                                              />
                                            </td>
                                            <td className="py-0.5 px-0.5 text-right">
                                              <input
                                                type="number"
                                                step="100"
                                                placeholder="5000"
                                                value={inlineNewTxn.amtDeposit}
                                                onChange={(e) => setInlineNewTxn({ ...inlineNewTxn, amtDeposit: e.target.value })}
                                                className="h-5 text-[9.5px] font-medium px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') handleAddSipTxn(fund.id);
                                                  if (e.key === 'Escape') setInlineAddingMfId(null);
                                                }}
                                              />
                                            </td>
                                            <td className="py-0.5 px-0.5 text-right">
                                              <input
                                                type="number"
                                                step="1"
                                                placeholder="0"
                                                value={inlineNewTxn.er}
                                                onChange={(e) => setInlineNewTxn({ ...inlineNewTxn, er: e.target.value })}
                                                className="h-5 text-[9.5px] font-medium px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') handleAddSipTxn(fund.id);
                                                  if (e.key === 'Escape') setInlineAddingMfId(null);
                                                }}
                                              />
                                            </td>
                                            <td className="py-0.5 px-0.5 text-right">
                                              <input
                                                type="number"
                                                step="0.01"
                                                placeholder="65.40"
                                                value={inlineNewTxn.nav}
                                                onChange={(e) => setInlineNewTxn({ ...inlineNewTxn, nav: e.target.value })}
                                                className="h-5 text-[9.5px] font-medium px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') handleAddSipTxn(fund.id);
                                                  if (e.key === 'Escape') setInlineAddingMfId(null);
                                                }}
                                              />
                                            </td>
                                            <td className="py-0.5 px-1 text-right font-mono text-[9.5px] text-base-content/80 font-medium truncate">
                                              {inlineUnits}
                                            </td>
                                            <td className="py-0.5 px-1 text-right font-medium text-[9.5px] text-success truncate">
                                              +₹{inlineActualAmt.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-0.5 px-0.5 text-center">
                                              <div className="flex items-center justify-center gap-0.5">
                                                <button
                                                  type="button"
                                                  onClick={() => handleAddSipTxn(fund.id)}
                                                  className="p-0.5 text-success hover:bg-success/10 rounded transition-colors cursor-pointer"
                                                  title="Save"
                                                >
                                                  <Check size={11} />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setInlineAddingMfId(null)}
                                                  className="p-0.5 text-error hover:bg-error/10 rounded transition-colors cursor-pointer"
                                                  title="Cancel"
                                                >
                                                  <X size={11} />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })()}

                                      {/* Transaction Rows for this year (rendered if NOT collapsed) */}
                                      {!isYearCollapsed &&
                                        yg.txns.map((txn, tIdx) => {
                                          const isEditing = editingTxnKey?.fundId === fund.id && editingTxnKey?.txnId === txn.id;

                                          if (isEditing) {
                                            const editAmtDep = parseFloat(editTxnData.amtDeposit) || 0;
                                            const editEr = parseFloat(editTxnData.er) || 0;
                                            const editActualAmt = Math.max(0, editAmtDep - editEr);
                                            const editNav = parseFloat(editTxnData.nav) || 0;
                                            const editUnits = editNav > 0 ? (editActualAmt / editNav).toFixed(3) : '-';

                                            return (
                                              <tr key={txn.id} className="bg-info/5 border-b border-info/15">
                                                <td className="py-0.5 px-0.5">
                                                  <input
                                                    type="text"
                                                    value={editTxnData.term}
                                                    onChange={(e) => setEditTxnData({ ...editTxnData, term: e.target.value })}
                                                    className="h-5 text-[9.5px] font-medium px-1 py-0 rounded border border-base-300 bg-base-100 w-full focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                                  />
                                                </td>
                                                <td className="py-0.5 px-0.5 text-center">
                                                  <select
                                                    value={editTxnData.type || 'SIP'}
                                                    onChange={(e) => setEditTxnData({ ...editTxnData, type: e.target.value })}
                                                    className="h-5 text-[9.5px] font-semibold px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                                  >
                                                    <option value="SIP">SIP</option>
                                                    <option value="Lumpsum">LS</option>
                                                  </select>
                                                </td>
                                                <td className="py-0.5 px-0.5 text-center">
                                                  <input
                                                    type="date"
                                                    value={editTxnData.date}
                                                    onChange={(e) => setEditTxnData({ ...editTxnData, date: e.target.value })}
                                                    className="h-5 text-[9.5px] font-mono px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                                  />
                                                </td>
                                                <td className="py-0.5 px-0.5 text-right">
                                                  <input
                                                    type="number"
                                                    step="100"
                                                    value={editTxnData.amtDeposit}
                                                    onChange={(e) => setEditTxnData({ ...editTxnData, amtDeposit: e.target.value })}
                                                    className="h-5 text-[9.5px] font-medium px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') saveEditSipTxn();
                                                      if (e.key === 'Escape') setEditingTxnKey(null);
                                                    }}
                                                  />
                                                </td>
                                                <td className="py-0.5 px-0.5 text-right">
                                                  <input
                                                    type="number"
                                                    step="1"
                                                    value={editTxnData.er}
                                                    onChange={(e) => setEditTxnData({ ...editTxnData, er: e.target.value })}
                                                    className="h-5 text-[9.5px] font-medium px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') saveEditSipTxn();
                                                      if (e.key === 'Escape') setEditingTxnKey(null);
                                                    }}
                                                  />
                                                </td>
                                                <td className="py-0.5 px-0.5 text-right">
                                                  <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editTxnData.nav}
                                                    onChange={(e) => setEditTxnData({ ...editTxnData, nav: e.target.value })}
                                                    className="h-5 text-[9.5px] font-medium px-0.5 py-0 rounded border border-base-300 bg-base-100 w-full text-right focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30"
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') saveEditSipTxn();
                                                      if (e.key === 'Escape') setEditingTxnKey(null);
                                                    }}
                                                  />
                                                </td>
                                                <td className="py-0.5 px-1 text-right font-mono text-[9.5px] text-base-content/80 font-medium truncate">
                                                  {editUnits}
                                                </td>
                                                <td className="py-0.5 px-1 text-right font-medium text-[9.5px] text-success truncate">
                                                  +₹{editActualAmt.toLocaleString('en-IN')}
                                                </td>
                                                <td className="py-0.5 px-0.5 text-center">
                                                  <div className="flex items-center justify-center gap-0.5">
                                                    <button
                                                      type="button"
                                                      onClick={saveEditSipTxn}
                                                      className="p-0.5 text-success hover:bg-success/10 rounded transition-colors cursor-pointer"
                                                      title="Save"
                                                    >
                                                      <Check size={11} />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => setEditingTxnKey(null)}
                                                      className="p-0.5 text-base-content/50 hover:bg-base-200 rounded transition-colors cursor-pointer"
                                                      title="Cancel"
                                                    >
                                                      <X size={11} />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          }

                                          const amtDep = txn.amtDeposit ?? txn.amount ?? 0;
                                          const er = txn.er ?? 0;
                                          const actualAmt = txn.actualAmt ?? Math.max(0, amtDep - er);
                                          const nav = txn.nav ?? 0;
                                          const unitsDisplay = txn.units ? parseFloat(txn.units).toFixed(3) : (nav > 0 ? (actualAmt / nav).toFixed(3) : '-');

                                          return (
                                            <tr key={txn.id} className="hover:bg-base-200/30 transition-colors border-b border-base-200/40">
                                              <td className="py-1 px-1 text-left font-medium text-[9.5px] text-base-content/90 truncate">
                                                {txn.term || `Term ${tIdx + 1}`}
                                              </td>
                                              <td className="py-1 px-0.5 text-center">
                                                <span className={`px-0.5 py-0.1 text-[8px] font-bold rounded uppercase tracking-wider ${
                                                  txn.type === 'Lumpsum' || txn.type === 'LUMPSUM'
                                                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                                    : 'bg-secondary/10 text-secondary border border-secondary/20'
                                                }`}>
                                                  {txn.type === 'Lumpsum' || txn.type === 'LUMPSUM' ? 'LS' : (txn.type || 'SIP')}
                                                </span>
                                              </td>
                                              <td className="py-1 px-1 text-center font-mono text-[9.5px] text-base-content/70 truncate">
                                                {formatDateDDMMMYYYY(txn.date)}
                                              </td>
                                              <td className="py-1 px-1 text-right font-medium text-[9.5px] text-base-content truncate">
                                                ₹{amtDep.toLocaleString('en-IN')}
                                              </td>
                                              <td className="py-1 px-0.5 text-right font-medium text-[9.5px] text-error/80 truncate">
                                                ₹{er.toLocaleString('en-IN')}
                                              </td>
                                              <td className="py-1 px-1 text-right font-medium text-[9.5px] text-base-content/70 truncate">
                                                {nav > 0 ? `₹${nav}` : '-'}
                                              </td>
                                              <td className="py-1 px-1 text-right font-mono font-medium text-[9.5px] text-base-content/80 truncate">
                                                {unitsDisplay}
                                              </td>
                                              <td className="py-1 px-1 text-right font-medium text-[9.5px] text-success truncate">
                                                +₹{actualAmt.toLocaleString('en-IN')}
                                              </td>
                                              <td className="py-1 px-0.5 text-center">
                                                <div className="flex items-center justify-center gap-0.5">
                                                  <button
                                                    type="button"
                                                    onClick={() => handleOpenEditSipModal(fund, txn)}
                                                    className="p-0.5 text-info bg-info/10 hover:bg-info/20 rounded transition-colors cursor-pointer"
                                                    title="Edit"
                                                  >
                                                    <Pencil size={10} />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleDeleteSipTxn(fund.id, txn.id)}
                                                    className="p-0.5 text-error bg-error/10 hover:bg-error/20 rounded transition-colors cursor-pointer"
                                                    title="Delete"
                                                  >
                                                    <Trash2 size={10} />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>
)}

      {/* ------------------------------------------------------------------ */}
      {/* OTHER TABS PLACEHOLDERS (Emergency Fund, FD, RD, PF)               */}
      {/* ------------------------------------------------------------------ */}
      {activeTab !== "stocks" && activeTab !== "mf" && (
        <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center animate-in fade-in duration-300">
          <div className="max-w-md mx-auto flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-3xl">
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

      {/* Add / Edit Mutual Fund Modal */}
      <AddMutualFundModal
        isOpen={isAddMfModalOpen}
        onClose={() => setIsAddMfModalOpen(false)}
        onSaveFund={handleSaveMutualFund}
        initialData={editingMf}
      />

      {/* Add / Edit SIP Transaction Popup Modal */}
      <AddSipTransactionModal
        isOpen={isSipModalOpen}
        onClose={() => setIsSipModalOpen(false)}
        onSave={handleSaveSipModalTxn}
        fund={activeSipFund}
        initialTxn={editingSipTxn}
      />

      {/* Custom MF Groups & Ordering Modal */}
      <OrganizeMfGroupsModal
        isOpen={isOrganizeModalOpen}
        onClose={() => setIsOrganizeModalOpen(false)}
        funds={mfData}
        groups={mfGroups}
        onSaveGroups={handleSaveGroups}
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
      <style>{`
        @keyframes mfSlideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 2000px; }
        }
      `}</style>
    </div>
  );
}
