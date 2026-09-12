import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
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
  Wallet,
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
  Columns2,
  Columns3,
  FolderTree,
  FolderPlus,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import { TitleChanger } from "../../../utils/TitleChanger";
import AddStockTradeModal from "../../../components/Dashboard/Investment/AddStockTradeModal";
import StockTradeCalculationModal from "../../../components/Dashboard/Investment/StockTradeCalculationModal";
import AddMutualFundModal from "../../../components/Dashboard/Investment/AddMutualFundModal";
import AddSipTransactionModal from "../../../components/Dashboard/Investment/AddSipTransactionModal";
import OrganizeMfGroupsModal from "../../../components/Dashboard/Investment/OrganizeMfGroupsModal";
import MutualFundCard from "../../../components/Dashboard/Investment/MutualFundCard";
import MutualFundTableModal from "../../../components/Dashboard/Investment/MutualFundTableModal";
import MutualFundInfoModal from "../../../components/Dashboard/Investment/MutualFundInfoModal";
import AddFixedDepositModal from "../../../components/Dashboard/Investment/AddFixedDepositModal";
import WithdrawFdModal from "../../../components/Dashboard/Investment/WithdrawFdModal";
import OrganizeFdGroupsModal from "../../../components/Dashboard/Investment/OrganizeFdGroupsModal";
import FixedDepositCard from "../../../components/Dashboard/Investment/FixedDepositCard";
import FixedDepositInfoModal from "../../../components/Dashboard/Investment/FixedDepositInfoModal";
import AddRecurringDepositModal from "../../../components/Dashboard/Investment/AddRecurringDepositModal";
import WithdrawRdModal from "../../../components/Dashboard/Investment/WithdrawRdModal";
import OrganizeRdGroupsModal from "../../../components/Dashboard/Investment/OrganizeRdGroupsModal";
import RecurringDepositCard from "../../../components/Dashboard/Investment/RecurringDepositCard";
import AddRdDepositModal from "../../../components/Dashboard/Investment/AddRdDepositModal";
import RecurringDepositTableModal from "../../../components/Dashboard/Investment/RecurringDepositTableModal";
import AddSalaryModal from "../../../components/Dashboard/Investment/AddSalaryModal";
import AddPfWithdrawalModal from "../../../components/Dashboard/Investment/AddPfWithdrawalModal";
import CompanyLogo from "../../../components/Dashboard/Investment/CompanyLogo";
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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "stocks"); // "stocks" | "mf" | "ef" | "fd" | "rd" | "pf" | "salary"

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["stocks", "mf", "ef", "fd", "rd", "pf", "salary"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
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

  // Salary State
  const [salaryData, setSalaryData] = useState([]);
  const [loadingSalary, setLoadingSalary] = useState(false);
  const [salarySearchTerm, setSalarySearchTerm] = useState("");
  const [salaryCompanyFilter, setSalaryCompanyFilter] = useState("all");
  const [salaryYearFilter, setSalaryYearFilter] = useState("all");
  const [isAddSalaryModalOpen, setIsAddSalaryModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [salaryTableViewMode, setSalaryTableViewMode] = useState(() => {
    return localStorage.getItem("pulse_salary_table_view_mode") || "detailed";
  });
  const [salaryBreakdownModal, setSalaryBreakdownModal] = useState(null);

  const handleSalaryViewChange = (mode) => {
    setSalaryTableViewMode(mode);
    localStorage.setItem("pulse_salary_table_view_mode", mode);
  };

  // PF State (Synced from Salary + Withdrawals)
  const [pfSearchTerm, setPfSearchTerm] = useState("");
  const [pfCompanyFilter, setPfCompanyFilter] = useState("all");
  const [pfYearFilter, setPfYearFilter] = useState("all");
  const [pfSubTab, setPfSubTab] = useState("deposits"); // "deposits" | "withdrawals"
  const [pfWithdrawals, setPfWithdrawals] = useState([]);
  const [loadingPfWithdrawals, setLoadingPfWithdrawals] = useState(false);
  const [isAddPfWithdrawalModalOpen, setIsAddPfWithdrawalModalOpen] = useState(false);
  const [editingPfWithdrawal, setEditingPfWithdrawal] = useState(null);

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
  const [inlineTxnData, setInlineTxnData] = useState({
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
  // SIP / Withdrawal Popup Modal State
  const [isSipModalOpen, setIsSipModalOpen] = useState(false);
  const [activeSipFund, setActiveSipFund] = useState(null);
  const [editingSipTxn, setEditingSipTxn] = useState(null);
  const [sipModalMode, setSipModalMode] = useState("deposit"); // "deposit" | "withdrawal"
  const [mfTableViewMode, setMfTableViewMode] = useState("deposit"); // "deposit" | "withdrawal"
  const [viewingInfoMfFund, setViewingInfoMfFund] = useState(null);

  const handleOpenMfInfoModal = (fund) => {
    setViewingInfoMfFund(fund);
  };

  const handleOpenAddSipModal = (fund, mode = "deposit") => {
    setActiveSipFund(fund);
    setEditingSipTxn(null);
    setSipModalMode(mode);
    setIsSipModalOpen(true);
  };

  const handleOpenAddWithdrawalModal = (fund) => {
    handleOpenAddSipModal(fund, "withdrawal");
  };

  const handleOpenEditSipModal = (fund, txn) => {
    setActiveSipFund(fund);
    setEditingSipTxn(txn);
    const typeLower = (txn?.type || "").toLowerCase();
    const isW =
      typeLower.includes("withdr") ||
      typeLower.includes("redemp") ||
      typeLower.includes("swp");
    setSipModalMode(isW ? "withdrawal" : "deposit");
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

  // Mutual Fund Privacy Mode (Hide Numbers in MF Cards)
  const [hideMfNumbers, setHideMfNumbers] = useState(() => {
    return localStorage.getItem("mf_hide_numbers") === "true";
  });

  const toggleHideMfNumbers = () => {
    setHideMfNumbers((prev) => {
      const next = !prev;
      localStorage.setItem("mf_hide_numbers", String(next));
      return next;
    });
  };

  // Stock Privacy Mode (Hide Numbers in Stock Cards)
  const [hideStockNumbers, setHideStockNumbers] = useState(() => {
    return localStorage.getItem("stocks_hide_numbers") === "true";
  });

  const toggleHideStockNumbers = () => {
    setHideStockNumbers((prev) => {
      const next = !prev;
      localStorage.setItem("stocks_hide_numbers", String(next));
      return next;
    });
  };

  // Mutual Fund Layout View (2-col vs 3-col, Default: 3-col)
  const [mfLayoutView, setMfLayoutView] = useState(() => {
    const saved = localStorage.getItem("mf_layout_view");
    return saved === "2-col" ? "2-col" : "3-col";
  });

  const handleMfLayoutChange = (view) => {
    setMfLayoutView(view);
    localStorage.setItem("mf_layout_view", view);
  };

  // Custom Mutual Fund Groups State (Persisted in DB)
  const [mfGroups, setMfGroups] = useState([]);

  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState(new Set());

  const handleSaveGroups = async (newGroups) => {
    setMfGroups(newGroups);
    try {
      const res = await axiosInstance.put("/v1/dashboard/investment/mf-groups", {
        groups: newGroups,
      });
      if (res.data && res.data.success) {
        setMfGroups(res.data.data || []);
        localStorage.removeItem("mf_custom_groups");
      }
    } catch (error) {
      console.error("Error saving mutual fund groups to DB:", error);
      alert("Failed to save custom groups to database: " + (error.response?.data?.message || error.message));
    }
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

  // Modal State for Viewing Full Transactions Table in a Popup
  const [viewingMfTableFundId, setViewingMfTableFundId] = useState(null);
  const viewingMfFund = useMemo(
    () => mfData.find((f) => f.id === viewingMfTableFundId),
    [mfData, viewingMfTableFundId]
  );

  // Close Table View modal on Escape key
  useEffect(() => {
    if (!viewingMfTableFundId) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setViewingMfTableFundId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingMfTableFundId]);

  // Helper to compute comprehensive mutual fund summary metrics
  const getMfDetailedSummary = (fund) => {
    const txns = fund?.transactions || [];

    // Deposit aggregates
    let sipCount = 0;
    let lsCount = 0;
    let totalDeposited = 0;
    let totalEr = 0;
    let totalInvested = 0;
    let totalUnits = 0;
    const validDates = [];

    // Withdrawal aggregates
    let swpCount = 0;
    let lsWithdrawalCount = 0;
    let totalWithdrawalTerms = 0;
    let grossWithdrawn = 0;
    let totalWithdrawalEr = 0;
    let totalWithdrawn = 0;
    let totalUnitsWithdrawn = 0;
    const validWithdrawalDates = [];

    txns.forEach((t) => {
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
        totalWithdrawalTerms += 1;
        if (typeLower.includes("swp")) {
          swpCount += 1;
        } else {
          lsWithdrawalCount += 1;
        }
        grossWithdrawn += Math.abs(amtDep);
        totalWithdrawalEr += er;
        totalWithdrawn += actual;
        totalUnitsWithdrawn += units;
        if (t.date) {
          const d = dayjs(t.date);
          if (d.isValid()) validWithdrawalDates.push(d);
        }
      } else {
        const isLs =
          t.type === "Lumpsum" || t.type === "LUMPSUM" || t.type === "LS";
        if (isLs) {
          lsCount += 1;
        } else {
          sipCount += 1;
        }

        totalDeposited += amtDep;
        totalEr += er;
        totalInvested += actual;
        totalUnits += units;

        if (t.date) {
          const d = dayjs(t.date);
          if (d.isValid()) {
            validDates.push(d);
          }
        }
      }
    });

    validDates.sort((a, b) => a.valueOf() - b.valueOf());
    const fromDateObj = validDates.length > 0 ? validDates[0] : null;
    const toDateObj =
      validDates.length > 0 ? validDates[validDates.length - 1] : null;

    let durationText = "—";
    if (fromDateObj && toDateObj) {
      const totalDays = toDateObj.diff(fromDateObj, "day");
      const totalMonths = toDateObj.diff(fromDateObj, "month");
      if (totalMonths >= 12) {
        const yrs = Math.floor(totalMonths / 12);
        const mos = totalMonths % 12;
        durationText =
          mos > 0
            ? `${yrs} yr${yrs > 1 ? "s" : ""} ${mos} mo${mos > 1 ? "s" : ""}`
            : `${yrs} yr${yrs > 1 ? "s" : ""}`;
      } else if (totalMonths > 0) {
        durationText = `${totalMonths} mo${totalMonths > 1 ? "s" : ""}`;
      } else {
        durationText = totalDays === 0 ? "1 day" : `${totalDays} days`;
      }
    }

    const avgNav = totalUnits > 0 ? totalInvested / totalUnits : 0;

    // Withdrawal duration & avg exit NAV
    validWithdrawalDates.sort((a, b) => a.valueOf() - b.valueOf());
    const wFromDateObj =
      validWithdrawalDates.length > 0 ? validWithdrawalDates[0] : null;
    const wToDateObj =
      validWithdrawalDates.length > 0
        ? validWithdrawalDates[validWithdrawalDates.length - 1]
        : null;

    let withdrawalDurationText = "—";
    if (wFromDateObj && wToDateObj) {
      const totalDays = wToDateObj.diff(wFromDateObj, "day");
      const totalMonths = wToDateObj.diff(wFromDateObj, "month");
      if (totalMonths >= 12) {
        const yrs = Math.floor(totalMonths / 12);
        const mos = totalMonths % 12;
        withdrawalDurationText =
          mos > 0
            ? `${yrs} yr${yrs > 1 ? "s" : ""} ${mos} mo${mos > 1 ? "s" : ""}`
            : `${yrs} yr${yrs > 1 ? "s" : ""}`;
      } else if (totalMonths > 0) {
        withdrawalDurationText = `${totalMonths} mo${totalMonths > 1 ? "s" : ""}`;
      } else {
        withdrawalDurationText = totalDays === 0 ? "1 day" : `${totalDays} days`;
      }
    }

    const avgExitNav =
      totalUnitsWithdrawn > 0 ? totalWithdrawn / totalUnitsWithdrawn : 0;

    // Active Holding & Redemption Status
    const activeUnits = Math.max(
      0,
      parseFloat((totalUnits - totalUnitsWithdrawn).toFixed(4))
    );
    const isFullyRedeemed = totalUnits > 0 && activeUnits <= 0.0001;

    // Calculation when all units are redeemed: Withdrawn amt - Deposited amt
    // If -ve then loss, if +ve then profit
    const depositedAmt = totalDeposited;
    const withdrawnAmt = totalWithdrawn;
    const realizedPnL = withdrawnAmt - depositedAmt;
    const isProfit = realizedPnL > 0;
    const isLoss = realizedPnL < 0;
    const isBreakEven = realizedPnL === 0;
    const realizedPnLPct =
      depositedAmt > 0 ? (realizedPnL / depositedAmt) * 100 : 0;

    return {
      totalTerms: sipCount + lsCount,
      sipCount,
      lsCount,
      fromDateStr: fromDateObj ? fromDateObj.format("DD MMM YYYY") : "—",
      toDateStr: toDateObj ? toDateObj.format("DD MMM YYYY") : "—",
      durationText,
      totalDeposited,
      totalEr,
      avgNav,
      totalUnits,
      totalInvested,

      // Withdrawal fields
      totalWithdrawalTerms,
      swpCount,
      lsWithdrawalCount,
      withdrawalFromDateStr: wFromDateObj
        ? wFromDateObj.format("DD MMM YYYY")
        : "—",
      withdrawalToDateStr: wToDateObj ? wToDateObj.format("DD MMM YYYY") : "—",
      withdrawalDurationText,
      grossWithdrawn,
      totalWithdrawalEr,
      avgExitNav,
      totalUnitsWithdrawn,
      totalWithdrawn,

      // Redemption & Realized P&L fields
      activeUnits,
      isFullyRedeemed,
      depositedAmt,
      withdrawnAmt,
      realizedPnL,
      isProfit,
      isLoss,
      isBreakEven,
      realizedPnLPct,
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
          totalInvested: filteredMutualFunds.reduce((acc, f) => acc + (getMfDetailedSummary(f).totalInvested || 0), 0),
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
          totalInvested: groupFunds.reduce((acc, f) => acc + (getMfDetailedSummary(f).totalInvested || 0), 0),
        });
      }
    });

    const unassignedFunds = filteredMutualFunds.filter((f) => !assignedFundIds.has(f.id));
    if (unassignedFunds.length > 0) {
      resultGroups.push({
        id: "unassigned-group",
        name: "Other Mutual Funds",
        funds: unassignedFunds,
        totalInvested: unassignedFunds.reduce((acc, f) => acc + (getMfDetailedSummary(f).totalInvested || 0), 0),
      });
    }

    return resultGroups;
  }, [filteredMutualFunds, mfGroups]);

  // ----------------------------------------------------------------------
  // Fixed Deposit (FD) State & Helper Computations
  // ----------------------------------------------------------------------
  const [fdData, setFdData] = useState([]);
  const [isAddFdModalOpen, setIsAddFdModalOpen] = useState(false);
  const [editingFd, setEditingFd] = useState(null);
  const [fdGroups, setFdGroups] = useState([]);
  const [isOrganizeFdModalOpen, setIsOrganizeFdModalOpen] = useState(false);
  const [collapsedFdGroupIds, setCollapsedFdGroupIds] = useState(new Set());
  const [fdSearchTerm, setFdSearchTerm] = useState("");

  const [hideFdNumbers, setHideFdNumbers] = useState(() => {
    return localStorage.getItem("fd_hide_numbers") === "true";
  });
  const toggleHideFdNumbers = () => {
    setHideFdNumbers((prev) => {
      const next = !prev;
      localStorage.setItem("fd_hide_numbers", String(next));
      return next;
    });
  };

  const [fdLayoutView, setFdLayoutView] = useState(() => {
    const saved = localStorage.getItem("fd_layout_view");
    return saved === "2-col" ? "2-col" : "3-col";
  });
  const handleFdLayoutChange = (view) => {
    setFdLayoutView(view);
    localStorage.setItem("fd_layout_view", view);
  };

  // FD Single Settlement (Withdrawal / Liquidation) Modal
  const [withdrawingFd, setWithdrawingFd] = useState(null);

  // FD Info Modal State
  const [viewingInfoFd, setViewingInfoFd] = useState(null);

  const toggleFdGroupCollapse = (groupId) => {
    setCollapsedFdGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const filteredFixedDeposits = useMemo(() => {
    if (!fdSearchTerm.trim()) return fdData;
    const term = fdSearchTerm.toLowerCase().trim();
    return fdData.filter((fd) => {
      const bankMatch = (fd.bankName || "").toLowerCase().includes(term);
      const numMatch = (fd.fdNumber || "").toLowerCase().includes(term);
      const schemeMatch = (fd.schemeName || "").toLowerCase().includes(term);
      return bankMatch || numMatch || schemeMatch;
    });
  }, [fdData, fdSearchTerm]);

  const groupedFixedDeposits = useMemo(() => {
    const list = filteredFixedDeposits;
    if (!list || list.length === 0) return [];

    const fdMap = new Map(list.map((f) => [f.id, f]));
    const assignedIds = new Set();
    const result = [];

    (fdGroups || []).forEach((g) => {
      const groupFds = [];
      (g.fdIds || []).forEach((id) => {
        if (fdMap.has(id)) {
          groupFds.push(fdMap.get(id));
          assignedIds.add(id);
        }
      });

      if (groupFds.length > 0) {
        const totalInvested = groupFds.reduce(
          (sum, f) => sum + (f.isWithdrawn ? 0 : Number(f.amount || 0)),
          0
        );
        result.push({
          id: g.id,
          name: g.name,
          fds: groupFds,
          totalInvested,
        });
      }
    });

    const unassigned = list.filter((f) => !assignedIds.has(f.id));
    if (unassigned.length > 0) {
      const totalInvested = unassigned.reduce(
        (sum, f) => sum + (f.isWithdrawn ? 0 : Number(f.amount || 0)),
        0
      );
      result.unshift({
        id: "default-group",
        name: "General Fixed Deposits",
        fds: unassigned,
        totalInvested,
      });
    }

    return result;
  }, [filteredFixedDeposits, fdGroups]);

  // ----------------------------------------------------------------------
  // Recurring Deposit (RD) State & Helper Computations
  // ----------------------------------------------------------------------
  const [rdData, setRdData] = useState([]);
  const [isAddRdModalOpen, setIsAddRdModalOpen] = useState(false);
  const [editingRd, setEditingRd] = useState(null);
  const [rdGroups, setRdGroups] = useState([]);
  const [isOrganizeRdModalOpen, setIsOrganizeRdModalOpen] = useState(false);
  const [collapsedRdGroupIds, setCollapsedRdGroupIds] = useState(new Set());
  const [rdSearchTerm, setRdSearchTerm] = useState("");

  const [hideRdNumbers, setHideRdNumbers] = useState(() => {
    return localStorage.getItem("rd_hide_numbers") === "true";
  });
  const toggleHideRdNumbers = () => {
    setHideRdNumbers((prev) => {
      const next = !prev;
      localStorage.setItem("rd_hide_numbers", String(next));
      return next;
    });
  };

  const [rdLayoutView, setRdLayoutView] = useState(() => {
    const saved = localStorage.getItem("rd_layout_view");
    return saved === "2-col" ? "2-col" : "3-col";
  });
  const handleRdLayoutChange = (view) => {
    setRdLayoutView(view);
    localStorage.setItem("rd_layout_view", view);
  };

  // RD Single Settlement (Withdrawal / Liquidation) Modal
  const [withdrawingRd, setWithdrawingRd] = useState(null);

  // RD Deposit Modal & Table Modal States
  const [isAddRdDepositModalOpen, setIsAddRdDepositModalOpen] = useState(false);
  const [activeRdForDeposit, setActiveRdForDeposit] = useState(null);
  const [editingRdTxn, setEditingRdTxn] = useState(null);
  const [isRdTableModalOpen, setIsRdTableModalOpen] = useState(false);
  const [viewingTableRd, setViewingTableRd] = useState(null);

  const getRdTotalPrincipal = (rd) => {
    if (rd.isWithdrawn) return 0;
    const txns = rd.transactions || [];
    if (txns.length > 0) {
      return txns.reduce((sum, t) => sum + Number(t.amount || t.amtDeposit || 0), 0);
    }
    return Number(rd.amount || 0);
  };

  const toggleRdGroupCollapse = (groupId) => {
    setCollapsedRdGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const filteredRecurringDeposits = useMemo(() => {
    if (!rdSearchTerm.trim()) return rdData;
    const term = rdSearchTerm.toLowerCase().trim();
    return rdData.filter((rd) => {
      const bankMatch = (rd.bankName || "").toLowerCase().includes(term);
      const numMatch = (rd.rdNumber || "").toLowerCase().includes(term);
      const schemeMatch = (rd.schemeName || "").toLowerCase().includes(term);
      return bankMatch || numMatch || schemeMatch;
    });
  }, [rdData, rdSearchTerm]);

  const groupedRecurringDeposits = useMemo(() => {
    const list = filteredRecurringDeposits;
    if (!list || list.length === 0) return [];

    const rdMap = new Map(list.map((f) => [f.id, f]));
    const assignedIds = new Set();
    const result = [];

    (rdGroups || []).forEach((g) => {
      const groupRds = [];
      (g.rdIds || []).forEach((id) => {
        if (rdMap.has(id)) {
          groupRds.push(rdMap.get(id));
          assignedIds.add(id);
        }
      });

      if (groupRds.length > 0) {
        const totalInvested = groupRds.reduce(
          (sum, f) => sum + getRdTotalPrincipal(f),
          0
        );
        result.push({
          id: g.id,
          name: g.name,
          rds: groupRds,
          totalInvested,
        });
      }
    });

    const unassigned = list.filter((f) => !assignedIds.has(f.id));
    if (unassigned.length > 0) {
      const totalInvested = unassigned.reduce(
        (sum, f) => sum + getRdTotalPrincipal(f),
        0
      );
      result.unshift({
        id: "default-group",
        name: "General Recurring Deposits",
        rds: unassigned,
        totalInvested,
      });
    }

    return result;
  }, [filteredRecurringDeposits, rdGroups]);

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

  const handleSaveMutualFund = async (
    fundPayload,
    isEdit,
    targetGroupId = "others",
    newGroupName = ""
  ) => {
    try {
      let savedFund = null;
      if (isEdit && editingMf) {
        const res = await axiosInstance.put(
          `/v1/dashboard/investment/mf/${editingMf.id}`,
          fundPayload
        );
        if (res.data && res.data.success) {
          savedFund = {
            ...res.data.data,
            subCategory: (res.data.data?.subCategory || "").replace(/\s*\/\s*Tax[\s-]*Saver/gi, "").trim(),
          };
          setMfData((prev) =>
            prev.map((f) => (f.id === editingMf.id ? savedFund : f))
          );
        }
      } else {
        const res = await axiosInstance.post(
          "/v1/dashboard/investment/mf",
          fundPayload
        );
        if (res.data && res.data.success) {
          savedFund = {
            ...res.data.data,
            subCategory: (res.data.data?.subCategory || "").replace(/\s*\/\s*Tax[\s-]*Saver/gi, "").trim(),
          };
          setMfData((prev) => [savedFund, ...prev]);
          setExpandedMfIds((prev) => new Set([...prev, savedFund.id]));
        }
      }

      // Group Assignment Persistence
      if (savedFund && savedFund.id) {
        const fundId = savedFund.id;
        let updatedGroups = (mfGroups || []).map((g) => ({
          ...g,
          fundIds: (g.fundIds || []).filter((id) => id !== fundId),
        }));

        if (targetGroupId === "__new__" && newGroupName?.trim()) {
          const newGrp = {
            id: `group-${Date.now()}`,
            name: newGroupName.trim(),
            fundIds: [fundId],
          };
          updatedGroups = [...updatedGroups, newGrp];
          setMfGroups(updatedGroups);
          handleSaveGroups(updatedGroups);
        } else if (targetGroupId && targetGroupId !== "others") {
          updatedGroups = updatedGroups.map((g) =>
            g.id === targetGroupId
              ? { ...g, fundIds: Array.from(new Set([...(g.fundIds || []), fundId])) }
              : g
          );
          setMfGroups(updatedGroups);
          handleSaveGroups(updatedGroups);
        } else {
          // If "others", fund is removed from all custom groups (so it falls under "Others")
          setMfGroups(updatedGroups);
          handleSaveGroups(updatedGroups);
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
          setMfGroups((prev) =>
            prev.map((g) => ({
              ...g,
              fundIds: (g.fundIds || []).filter((id) => id !== fundId),
            }))
          );
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

    setInlineTxnData({
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
    const targetFundId = fundId || inlineAddingMfId || viewingMfTableFundId;
    if (!targetFundId) return;

    const amtDepVal = parseFloat(inlineTxnData.amtDeposit) || 0;
    if (amtDepVal <= 0) return;

    const erVal = parseFloat(inlineTxnData.er) || 0;
    const actualAmt = Math.max(0, amtDepVal - erVal);
    const navVal = parseFloat(inlineTxnData.nav) || 0;
    const explicitUnits = parseFloat(inlineTxnData.units);
    const units = !isNaN(explicitUnits) && explicitUnits >= 0
      ? explicitUnits
      : (navVal > 0 ? parseFloat((actualAmt / navVal).toFixed(3)) : 0);

    const targetFund = mfData.find((f) => f.id === targetFundId);
    const fallbackTerm = `Term ${(targetFund?.transactions || []).length + 1}`;

    const newTxnPayload = {
      term: inlineTxnData.term.trim() || fallbackTerm,
      type: inlineTxnData.type || 'SIP',
      date: inlineTxnData.date || new Date().toISOString().split('T')[0],
      amtDeposit: amtDepVal,
      er: erVal,
      actualAmt: actualAmt,
      nav: navVal,
      units: units,
      amount: actualAmt,
    };

    try {
      const res = await axiosInstance.post(
        `/v1/dashboard/investment/mf/${targetFundId}/transactions`,
        newTxnPayload
      );
      if (res.data && res.data.success) {
        setMfData((prev) =>
          prev.map((f) => (f.id === targetFundId ? res.data.data : f))
        );
      }
    } catch (error) {
      console.error("Error adding SIP transaction:", error);
      alert("Failed to add SIP transaction");
    } finally {
      setInlineAddingMfId(null);
    }
  };

  const saveInlineSipTxn = async (fundId) => {
    await handleAddSipTxn(fundId || viewingMfTableFundId || inlineAddingMfId);
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
      units: txn.units !== undefined && txn.units !== null ? String(txn.units) : '',
    });
  };

  const saveEditSipTxn = async () => {
    if (!editingTxnKey) return;
    const { fundId, txnId } = editingTxnKey;
    const targetFund = mfData.find((f) => f.id === fundId);

    const amtDepVal = parseFloat(editTxnData.amtDeposit) || 0;
    const erVal = parseFloat(editTxnData.er) || 0;
    const actualAmt = Math.max(0, amtDepVal - erVal);
    const navVal = parseFloat(editTxnData.nav) || 0;
    const explicitUnits = parseFloat(editTxnData.units);
    let units = !isNaN(explicitUnits) && explicitUnits >= 0
      ? explicitUnits
      : (navVal > 0 ? parseFloat((actualAmt / navVal).toFixed(3)) : 0);

    const typeLower = (editTxnData.type || "").toLowerCase();
    const isW =
      typeLower.includes("withdr") ||
      typeLower.includes("redemp") ||
      typeLower.includes("swp");

    if (isW && targetFund) {
      const totalDepositUnits = (targetFund.transactions || []).reduce((sum, t) => {
        const tl = (t?.type || "").toLowerCase();
        if (tl.includes("withdr") || tl.includes("redemp") || tl.includes("swp")) return sum;
        const act =
          t.actualAmt !== undefined && t.actualAmt !== null
            ? Number(t.actualAmt)
            : Math.max(0, (t.amtDeposit ?? t.amount ?? 0) - (t.er ?? 0));
        const n = Number(t.nav ?? 0);
        return sum + (parseFloat(t.units) || (n > 0 ? act / n : 0));
      }, 0);

      const alreadyRedeemedUnits = (targetFund.transactions || []).reduce((sum, t) => {
        const tl = (t?.type || "").toLowerCase();
        if (!tl.includes("withdr") && !tl.includes("redemp") && !tl.includes("swp")) return sum;
        if (t.id === txnId) return sum;
        const act =
          t.actualAmt !== undefined && t.actualAmt !== null
            ? Number(t.actualAmt)
            : Math.max(0, (t.amtDeposit ?? t.amount ?? 0) - (t.er ?? 0));
        const n = Number(t.nav ?? 0);
        return sum + (parseFloat(t.units) || (n > 0 ? act / n : 0));
      }, 0);

      const availableUnits = Math.max(
        0,
        parseFloat((totalDepositUnits - alreadyRedeemedUnits).toFixed(4))
      );

      if (units > availableUnits) {
        alert(`Cannot redeem more than available units (${availableUnits.toFixed(3)}). Setting to max available.`);
        units = availableUnits;
      }
    }

    const updatePayload = {
      term: editTxnData.term,
      type: editTxnData.type || (isW ? 'SWP' : 'SIP'),
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
        const rawFunds = res.data.data || [];
        const funds = rawFunds.map((f) => ({
          ...f,
          subCategory: (f.subCategory || "").replace(/\s*\/\s*Tax[\s-]*Saver/gi, "").trim(),
        }));
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

  const fetchMutualFundGroups = async () => {
    try {
      const res = await axiosInstance.get("/v1/dashboard/investment/mf-groups");
      if (res.data && res.data.success) {
        const dbGroups = res.data.data || [];
        if (dbGroups.length > 0) {
          setMfGroups(dbGroups);
        } else {
          // Auto-migrate from localStorage if previous groups exist
          const saved = localStorage.getItem("mf_custom_groups");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setMfGroups(parsed);
                await axiosInstance.put("/v1/dashboard/investment/mf-groups", {
                  groups: parsed,
                });
                localStorage.removeItem("mf_custom_groups");
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching mutual fund groups from DB:", error);
    }
  };

  const fetchFixedDeposits = async () => {
    try {
      const res = await axiosInstance.get("/v1/dashboard/investment/fd");
      if (res.data && res.data.success) {
        setFdData(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching fixed deposits:", error);
    }
  };

  const fetchFixedDepositGroups = async () => {
    try {
      const res = await axiosInstance.get("/v1/dashboard/investment/fd-groups");
      if (res.data && res.data.success) {
        setFdGroups(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching fixed deposit groups:", error);
    }
  };

  const fetchRecurringDeposits = async () => {
    try {
      const res = await axiosInstance.get("/v1/dashboard/investment/rd");
      if (res.data && res.data.success) {
        setRdData(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching recurring deposits:", error);
    }
  };

  const fetchRecurringDepositGroups = async () => {
    try {
      const res = await axiosInstance.get("/v1/dashboard/investment/rd-groups");
      if (res.data && res.data.success) {
        setRdGroups(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching recurring deposit groups:", error);
    }
  };

  const fetchSalaries = async () => {
    try {
      setLoadingSalary(true);
      const res = await axiosInstance.get("/v1/dashboard/investment/salary");
      if (res.data && res.data.success) {
        setSalaryData(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching salaries:", error);
    } finally {
      setLoadingSalary(false);
    }
  };

  React.useEffect(() => {
    fetchStockTrades();
    fetchMutualFunds();
    fetchMutualFundGroups();
    fetchFixedDeposits();
    fetchFixedDepositGroups();
    fetchRecurringDeposits();
    fetchRecurringDepositGroups();
    fetchSalaries();
    fetchPfWithdrawals();
  }, []);

  const handleOpenAddSalaryModal = () => {
    setEditingSalary(null);
    setIsAddSalaryModalOpen(true);
  };

  const handleEditSalary = (item) => {
    setEditingSalary(item);
    setIsAddSalaryModalOpen(true);
  };

  const handleSaveSalary = async (payload) => {
    try {
      if (editingSalary) {
        const id = editingSalary.id || editingSalary._id;
        const res = await axiosInstance.put(
          `/v1/dashboard/investment/salary/${id}`,
          payload
        );
        if (res.data && res.data.success) {
          const updatedItem = {
            ...res.data.data,
            id: res.data.data.id || res.data.data._id,
          };
          setSalaryData((prev) =>
            prev.map((s) => ((s.id || s._id) === id ? updatedItem : s))
          );
        }
      } else {
        const res = await axiosInstance.post(
          "/v1/dashboard/investment/salary",
          payload
        );
        if (res.data && res.data.success) {
          const newItem = {
            ...res.data.data,
            id: res.data.data.id || res.data.data._id,
          };
          setSalaryData((prev) => [newItem, ...prev]);
        }
      }
    } catch (error) {
      console.error("Error saving salary:", error);
      throw error;
    }
  };

  const handleDeleteSalary = async (salaryId) => {
    if (!window.confirm("Are you sure you want to delete this Salary entry?")) return;
    try {
      const res = await axiosInstance.delete(`/v1/dashboard/investment/salary/${salaryId}`);
      if (res.data && res.data.success) {
        setSalaryData((prev) => prev.filter((s) => (s.id || s._id) !== salaryId));
      }
    } catch (error) {
      console.error("Error deleting salary entry:", error);
      alert("Failed to delete salary: " + (error.response?.data?.message || error.message));
    }
  };

  const fetchPfWithdrawals = async () => {
    try {
      setLoadingPfWithdrawals(true);
      const res = await axiosInstance.get("/v1/dashboard/investment/pf/withdrawals");
      if (res.data && res.data.success) {
        setPfWithdrawals(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching PF withdrawals:", error);
    } finally {
      setLoadingPfWithdrawals(false);
    }
  };

  const handleSavePfWithdrawal = async (payload, isEdit) => {
    const editId = payload.id || payload._id;
    if (isEdit && editId) {
      const res = await axiosInstance.put(
        `/v1/dashboard/investment/pf/withdrawals/${editId}`,
        payload
      );
      if (res.data && res.data.success) {
        setPfWithdrawals((prev) =>
          prev.map((w) => ((w.id || w._id) === editId ? res.data.data : w))
        );
      }
    } else {
      const res = await axiosInstance.post(
        "/v1/dashboard/investment/pf/withdrawals",
        payload
      );
      if (res.data && res.data.success) {
        setPfWithdrawals((prev) => [res.data.data, ...prev]);
      }
    }
    fetchPfWithdrawals();
  };

  const handleDeletePfWithdrawal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PF withdrawal record?")) return;
    try {
      const res = await axiosInstance.delete(`/v1/dashboard/investment/pf/withdrawals/${id}`);
      if (res.data && res.data.success) {
        setPfWithdrawals((prev) => prev.filter((w) => (w.id || w._id) !== id));
      }
      fetchPfWithdrawals();
    } catch (error) {
      console.error("Error deleting PF withdrawal:", error);
      alert("Failed to delete PF withdrawal.");
    }
  };

  const handleOpenAddFdModal = () => {
    setEditingFd(null);
    setIsAddFdModalOpen(true);
  };

  const handleEditFd = (fd) => {
    setEditingFd(fd);
    setIsAddFdModalOpen(true);
  };

  const handleSaveFixedDeposit = async (fdPayload) => {
    const editId = editingFd?.id || editingFd?._id;
    try {
      if (editId) {
        const res = await axiosInstance.put(
          `/v1/dashboard/investment/fd/${editId}`,
          fdPayload
        );
        if (res.data && res.data.success) {
          const updated = res.data.data;
          setFdData((prev) =>
            prev.map((f) => ((f.id || f._id) === editId ? updated : f))
          );
        }
      } else {
        const res = await axiosInstance.post(
          "/v1/dashboard/investment/fd",
          fdPayload
        );
        if (res.data && res.data.success) {
          const newFd = res.data.data;
          setFdData((prev) => [newFd, ...prev]);

          setFdGroups((prev) => {
            if (prev.length > 0) {
              const updated = [...prev];
              updated[0] = {
                ...updated[0],
                fdIds: [newFd.id || newFd._id, ...(updated[0].fdIds || [])],
              };
              axiosInstance.put("/v1/dashboard/investment/fd-groups", { groups: updated }).catch(() => {});
              return updated;
            }
            return prev;
          });
        }
      }
      setIsAddFdModalOpen(false);
      setEditingFd(null);
    } catch (error) {
      console.error("Error saving fixed deposit:", error);
      alert("Failed to save Fixed Deposit: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteFd = async (fdId) => {
    if (!window.confirm("Are you sure you want to delete this Fixed Deposit entry?")) return;
    try {
      const res = await axiosInstance.delete(`/v1/dashboard/investment/fd/${fdId}`);
      if (res.data && res.data.success) {
        setFdData((prev) => prev.filter((f) => (f.id || f._id) !== fdId));
      }
    } catch (error) {
      console.error("Error deleting fixed deposit:", error);
      alert("Failed to delete Fixed Deposit: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveFdSettlement = async (settlementPayload) => {
    const fdId = settlementPayload.id || settlementPayload._id;
    if (!fdId) {
      alert("Error: Missing Fixed Deposit ID");
      return;
    }
    try {
      const res = await axiosInstance.put(
        `/v1/dashboard/investment/fd/${fdId}`,
        settlementPayload
      );
      if (res.data && res.data.success) {
        const updated = res.data.data;
        setFdData((prev) =>
          prev.map((f) => ((f.id || f._id) === fdId ? updated : f))
        );
      }
      setWithdrawingFd(null);
    } catch (error) {
      console.error("Error saving FD settlement:", error);
      alert("Failed to save settlement: " + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveFdWithdrawal = async (fd) => {
    const fdId = fd?.id || fd?._id;
    if (!fdId) return;
    if (!window.confirm("Are you sure you want to remove the Withdrawn transaction and restore this Fixed Deposit to Active?")) return;

    try {
      const resetPayload = {
        ...fd,
        isWithdrawn: false,
        withdrawalDate: "",
        totalPayout: 0,
        penalty: 0,
        realizedGain: 0,
        realizedReturnPercent: 0,
        realizedPrincipal: 0,
        realizedInterest: 0,
        status: "Active",
      };
      const res = await axiosInstance.put(
        `/v1/dashboard/investment/fd/${fdId}`,
        resetPayload
      );
      if (res.data && res.data.success) {
        const updated = res.data.data;
        setFdData((prev) =>
          prev.map((f) => ((f.id || f._id) === fdId ? updated : f))
        );
      }
    } catch (error) {
      console.error("Error removing FD withdrawal:", error);
      alert("Failed to remove withdrawal: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveFdGroups = async (newGroups) => {
    setFdGroups(newGroups);
    try {
      const res = await axiosInstance.put("/v1/dashboard/investment/fd-groups", {
        groups: newGroups,
      });
      if (res.data && res.data.success) {
        setFdGroups(res.data.data || []);
      }
    } catch (error) {
      console.error("Error saving FD groups:", error);
    }
  };

  // ----------------------------------------------------------------------
  // Recurring Deposit (RD) Handlers
  // ----------------------------------------------------------------------
  const handleOpenAddRdModal = () => {
    setEditingRd(null);
    setIsAddRdModalOpen(true);
  };

  const handleEditRd = (rd) => {
    setEditingRd(rd);
    setIsAddRdModalOpen(true);
  };

  const handleSaveRecurringDeposit = async (rdPayload) => {
    const editId = editingRd?.id || editingRd?._id;
    try {
      if (editId) {
        const res = await axiosInstance.put(
          `/v1/dashboard/investment/rd/${editId}`,
          rdPayload
        );
        if (res.data && res.data.success) {
          const updated = res.data.data;
          setRdData((prev) =>
            prev.map((f) => ((f.id || f._id) === editId ? updated : f))
          );
        }
      } else {
        const res = await axiosInstance.post(
          "/v1/dashboard/investment/rd",
          rdPayload
        );
        if (res.data && res.data.success) {
          const newRd = res.data.data;
          setRdData((prev) => [newRd, ...prev]);

          setRdGroups((prev) => {
            if (prev.length > 0) {
              const updated = [...prev];
              updated[0] = {
                ...updated[0],
                rdIds: [newRd.id || newRd._id, ...(updated[0].rdIds || [])],
              };
              axiosInstance.put("/v1/dashboard/investment/rd-groups", { groups: updated }).catch(() => {});
              return updated;
            }
            return prev;
          });
        }
      }
      setIsAddRdModalOpen(false);
      setEditingRd(null);
    } catch (error) {
      console.error("Error saving recurring deposit:", error);
      alert("Failed to save Recurring Deposit: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRd = async (rdId) => {
    if (!window.confirm("Are you sure you want to delete this Recurring Deposit entry?")) return;
    try {
      const res = await axiosInstance.delete(`/v1/dashboard/investment/rd/${rdId}`);
      if (res.data && res.data.success) {
        setRdData((prev) => prev.filter((f) => (f.id || f._id) !== rdId));
      }
    } catch (error) {
      console.error("Error deleting recurring deposit:", error);
      alert("Failed to delete Recurring Deposit: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveRdSettlement = async (settlementPayload) => {
    const rdId = settlementPayload.id || settlementPayload._id;
    if (!rdId) {
      alert("Error: Missing Recurring Deposit ID");
      return;
    }
    try {
      const res = await axiosInstance.put(
        `/v1/dashboard/investment/rd/${rdId}`,
        settlementPayload
      );
      if (res.data && res.data.success) {
        const updated = res.data.data;
        setRdData((prev) =>
          prev.map((f) => ((f.id || f._id) === rdId ? updated : f))
        );
      }
      setWithdrawingRd(null);
    } catch (error) {
      console.error("Error saving RD settlement:", error);
      alert("Failed to save settlement: " + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveRdWithdrawal = async (rd) => {
    const rdId = rd?.id || rd?._id;
    if (!rdId) return;
    if (!window.confirm("Are you sure you want to remove the Withdrawn transaction and restore this Recurring Deposit to Active?")) return;

    try {
      const resetPayload = {
        ...rd,
        isWithdrawn: false,
        withdrawalDate: "",
        totalPayout: 0,
        penalty: 0,
        realizedGain: 0,
        realizedReturnPercent: 0,
        realizedPrincipal: 0,
        realizedInterest: 0,
        status: "Active",
      };
      const res = await axiosInstance.put(
        `/v1/dashboard/investment/rd/${rdId}`,
        resetPayload
      );
      if (res.data && res.data.success) {
        const updated = res.data.data;
        setRdData((prev) =>
          prev.map((f) => ((f.id || f._id) === rdId ? updated : f))
        );
      }
    } catch (error) {
      console.error("Error removing RD withdrawal:", error);
      alert("Failed to remove withdrawal: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveRdGroups = async (newGroups) => {
    setRdGroups(newGroups);
    try {
      const res = await axiosInstance.put("/v1/dashboard/investment/rd-groups", {
        groups: newGroups,
      });
      if (res.data && res.data.success) {
        setRdGroups(res.data.data || []);
      }
    } catch (error) {
      console.error("Error saving RD groups:", error);
    }
  };

  const handleOpenAddRdDeposit = (rd, initialTxn = null) => {
    setActiveRdForDeposit(rd);
    setEditingRdTxn(initialTxn);
    setIsAddRdDepositModalOpen(true);
  };

  const handleOpenRdTable = (rd) => {
    setViewingTableRd(rd);
    setIsRdTableModalOpen(true);
  };

  const handleSaveRdDeposit = async (payload, txnId = null) => {
    const rdId = activeRdForDeposit?.id || activeRdForDeposit?._id;
    if (!rdId) return;

    try {
      if (txnId) {
        const res = await axiosInstance.put(
          `/v1/dashboard/investment/rd/${rdId}/transactions/${txnId}`,
          payload
        );
        if (res.data && res.data.success) {
          const updated = res.data.data;
          setRdData((prev) =>
            prev.map((f) => ((f.id || f._id) === rdId ? updated : f))
          );
          if (viewingTableRd && (viewingTableRd.id || viewingTableRd._id) === rdId) {
            setViewingTableRd(updated);
          }
          setActiveRdForDeposit(updated);
        }
      } else {
        const res = await axiosInstance.post(
          `/v1/dashboard/investment/rd/${rdId}/transactions`,
          payload
        );
        if (res.data && res.data.success) {
          const updated = res.data.data;
          setRdData((prev) =>
            prev.map((f) => ((f.id || f._id) === rdId ? updated : f))
          );
          if (viewingTableRd && (viewingTableRd.id || viewingTableRd._id) === rdId) {
            setViewingTableRd(updated);
          }
          setActiveRdForDeposit(updated);
        }
      }
      setIsAddRdDepositModalOpen(false);
      setEditingRdTxn(null);
    } catch (error) {
      console.error("Error saving RD deposit:", error);
      alert("Failed to save deposit: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRdDeposit = async (rd, txnId) => {
    const rdId = rd?.id || rd?._id;
    if (!rdId || !txnId) return;
    if (!window.confirm("Are you sure you want to delete this deposit entry?")) return;

    try {
      const res = await axiosInstance.delete(
        `/v1/dashboard/investment/rd/${rdId}/transactions/${txnId}`
      );
      if (res.data && res.data.success) {
        const updated = res.data.data;
        setRdData((prev) =>
          prev.map((f) => ((f.id || f._id) === rdId ? updated : f))
        );
        if (viewingTableRd && (viewingTableRd.id || viewingTableRd._id) === rdId) {
          setViewingTableRd(updated);
        }
      }
    } catch (error) {
      console.error("Error deleting RD deposit:", error);
      alert("Failed to delete deposit: " + (error.response?.data?.message || error.message));
    }
  };

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
      badge: `${salaryData.length} Records`,
      badgeColor: "badge-success",
    },
    {
      id: "salary",
      label: "Salary",
      subLabel: "Monthly Compensation & Payslips",
      icon: Briefcase,
      badge: `${salaryData.length} Records`,
      badgeColor: "badge-accent",
    },
  ];

  // Filtered Salaries
  const filteredSalaries = useMemo(() => {
    return salaryData.filter((item) => {
      // Search term: company, month
      if (salarySearchTerm) {
        const q = salarySearchTerm.toLowerCase();
        const monthText = dayjs(item.month).format("MMMM YYYY").toLowerCase();
        const comp = (item.company || "").toLowerCase();
        if (!comp.includes(q) && !monthText.includes(q) && !item.month.includes(q)) {
          return false;
        }
      }
      // Company filter
      if (salaryCompanyFilter !== "all") {
        if (item.company !== salaryCompanyFilter) return false;
      }
      // Year filter
      if (salaryYearFilter !== "all") {
        const itemYear = item.month?.slice(0, 4);
        if (itemYear !== salaryYearFilter) return false;
      }
      return true;
    });
  }, [salaryData, salarySearchTerm, salaryCompanyFilter, salaryYearFilter]);

  // Unique companies and years for filter dropdowns
  const salaryCompanies = useMemo(() => {
    return Array.from(new Set(salaryData.map((s) => s.company).filter(Boolean)));
  }, [salaryData]);

  const salaryYears = useMemo(() => {
    return Array.from(
      new Set(salaryData.map((s) => s.month?.slice(0, 4)).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a));
  }, [salaryData]);

  // Latest salary entry for prefilling next month when adding new records
  const latestSalaryEntry = useMemo(() => {
    if (!salaryData || salaryData.length === 0) return null;
    const sorted = [...salaryData].sort((a, b) => {
      const monthA = a.month || "";
      const monthB = b.month || "";
      return monthB.localeCompare(monthA);
    });
    return sorted[0] || null;
  }, [salaryData]);

  // Summary stats for Salary
  const salarySummary = useMemo(() => {
    let totalInHand = 0;
    let totalGross = 0;
    let totalBasic = 0;
    let totalHra = 0;
    let totalFlexi = 0;
    let totalBonus = 0;
    let totalErPf = 0;
    let totalTaxes = 0;
    let totalGratuity = 0;
    let totalVarPay = 0;
    let totalCtc = 0;

    filteredSalaries.forEach((s) => {
      const basic = Number(s.basicSalary) || 0;
      const hra = Number(s.hra) || 0;
      const flexi = Number(s.flexi) || 0;
      const bonus = Number(s.bonus) || 0;
      const erPf = Number(s.erPf) || 0;
      const taxes = Number(s.taxes) || 0;
      const gratuity = Number(s.gratuity) || 0;
      const variablePay = Number(s.variablePay) || 0;
      const gross = Number(s.gross) || (basic + hra + flexi + bonus);
      const rowEarnings = gross + gratuity + variablePay;
      const inHand = Number(s.inHand) || (gross - (erPf + taxes));
      const ctc = Number(s.ctc) || (rowEarnings + erPf);

      totalInHand += inHand;
      totalGross += gross;
      totalBasic += basic;
      totalHra += hra;
      totalFlexi += flexi;
      totalBonus += bonus;
      totalErPf += erPf;
      totalTaxes += taxes;
      totalGratuity += gratuity;
      totalVarPay += variablePay;
      totalCtc += ctc;
    });

    const totalEarnings = totalGross + totalGratuity + totalVarPay;
    const count = filteredSalaries.length;
    const avgInHand = count > 0 ? Math.round(totalInHand / count) : 0;
    const avgGross = count > 0 ? Math.round(totalGross / count) : 0;
    const avgEarnings = count > 0 ? Math.round(totalEarnings / count) : 0;

    // Experience calculation (in Years and Months, e.g. "2 Years 3 Months")
    const uniqueMonths = new Set(
      filteredSalaries.map((s) => s.month).filter(Boolean)
    ).size;
    const totalMonths = uniqueMonths || count;
    const expYears = Math.floor(totalMonths / 12);
    const expMonths = totalMonths % 12;

    let experienceText = "0 Months";
    if (expYears > 0 && expMonths > 0) {
      experienceText = `${expYears} ${expYears === 1 ? "Year" : "Years"} ${expMonths} ${expMonths === 1 ? "Month" : "Months"}`;
    } else if (expYears > 0) {
      experienceText = `${expYears} ${expYears === 1 ? "Year" : "Years"}`;
    } else if (expMonths > 0) {
      experienceText = `${expMonths} ${expMonths === 1 ? "Month" : "Months"}`;
    }

    return {
      totalInHand,
      totalGross,
      totalBasic,
      totalHra,
      totalFlexi,
      totalBonus,
      totalErPf,
      totalTaxes,
      totalGratuity,
      totalVarPay,
      totalEarnings,
      totalCtc,
      avgInHand,
      avgGross,
      avgEarnings,
      count,
      totalMonths,
      expYears,
      expMonths,
      experienceText,
    };
  }, [filteredSalaries]);

  // Filtered PF records derived directly from salaryData (auto-synced)
  const filteredPf = useMemo(() => {
    return salaryData.filter((item) => {
      // Search term: company, month
      if (pfSearchTerm) {
        const q = pfSearchTerm.toLowerCase();
        const monthText = dayjs(item.month).format("MMMM YYYY").toLowerCase();
        const comp = (item.company || "").toLowerCase();
        if (!comp.includes(q) && !monthText.includes(q) && !item.month.includes(q)) {
          return false;
        }
      }
      // Company filter
      if (pfCompanyFilter !== "all") {
        if (item.company !== pfCompanyFilter) return false;
      }
      // Year filter
      if (pfYearFilter !== "all") {
        const itemYear = item.month?.slice(0, 4);
        if (itemYear !== pfYearFilter) return false;
      }
      return true;
    });
  }, [salaryData, pfSearchTerm, pfCompanyFilter, pfYearFilter]);

  // Summary stats for PF
  const pfSummary = useMemo(() => {
    let totalEmployerShare = 0;
    let totalEmployeeShare = 0;
    let grandTotal = 0;

    filteredPf.forEach((item) => {
      const er = Number(item.erPf) || 0;
      const ee =
        item.eePf !== undefined && item.eePf !== null && item.eePf !== ""
          ? Number(item.eePf) || 0
          : er;
      const total = er + ee;

      totalEmployerShare += er;
      totalEmployeeShare += ee;
      grandTotal += total;
    });

    return {
      totalEmployerShare,
      totalEmployeeShare,
      grandTotal,
      count: filteredPf.length,
    };
  }, [filteredPf]);

  // Total PF Withdrawn & Available PF Balance
  const totalPfWithdrawn = useMemo(() => {
    return pfWithdrawals.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
  }, [pfWithdrawals]);

  const filteredPfWithdrawals = useMemo(() => {
    if (!pfSearchTerm.trim()) return pfWithdrawals;
    const term = pfSearchTerm.toLowerCase();
    return pfWithdrawals.filter((item) => {
      const reasonMatch = (item.reason || "").toLowerCase().includes(term);
      const notesMatch = (item.notes || "").toLowerCase().includes(term);
      const dateMatch = dayjs(item.date).format("DD MMMM YYYY").toLowerCase().includes(term);
      const amountMatch = String(item.amount || "").includes(term);
      return reasonMatch || notesMatch || dateMatch || amountMatch;
    });
  }, [pfWithdrawals, pfSearchTerm]);

  const availablePfBalance = useMemo(() => {
    return Math.max(0, pfSummary.grandTotal - totalPfWithdrawn);
  }, [pfSummary.grandTotal, totalPfWithdrawn]);

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

          {activeTab === "fd" && (
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-xl gap-2 font-medium shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
              onClick={handleOpenAddFdModal}
            >
              <Plus size={16} />
              <span>Add Fixed Deposit Entry</span>
            </button>
          )}

          {activeTab === "rd" && (
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-xl gap-2 font-medium shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
              onClick={handleOpenAddRdModal}
            >
              <Plus size={16} />
              <span>Add Recurring Deposit Entry</span>
            </button>
          )}

          {activeTab === "salary" && (
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-xl gap-2 font-medium shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
              onClick={handleOpenAddSalaryModal}
            >
              <Plus size={16} />
              <span>Add Salary Entry</span>
            </button>
          )}

          {activeTab === "pf" && (
            <div className="flex items-center gap-2">
              <div className="badge badge-success badge-soft gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                Auto-synced with Salary
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-xl gap-2 font-medium shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
                onClick={handleOpenAddSalaryModal}
                title="Add salary entry to sync new PF records"
              >
                <Plus size={16} />
                <span>Add Monthly Salary</span>
              </button>
            </div>
          )}
        </div>

        {/* Single-Line Controls & Filters Bar for Salary */}
        {activeTab === "salary" && (
          <div className="bg-base-100/80 backdrop-blur-md p-2.5 rounded-2xl border border-base-200/70 shadow-sm overflow-visible">
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
              {/* Left Side: Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  value={salarySearchTerm}
                  onChange={(e) => setSalarySearchTerm(e.target.value)}
                  placeholder="Search salary records by Company, Month..."
                  className="input input-xs h-8 pl-9 pr-8 w-full rounded-xl bg-base-200/60 border border-base-300/60 focus:border-primary text-xs"
                />
                {salarySearchTerm && (
                  <button
                    type="button"
                    onClick={() => setSalarySearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Right Side: Filters */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {/* View Switcher: Detailed vs Earnings & Deductions */}
                <div className="flex items-center gap-1 bg-base-200 p-1 rounded-xl shrink-0 text-xs font-bold border border-base-300/60">
                  <button
                    type="button"
                    onClick={() => handleSalaryViewChange("detailed")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      salaryTableViewMode === "detailed"
                        ? "bg-base-100 text-primary shadow-sm font-black"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                    title="Detailed View (All columns)"
                  >
                    <Columns3 size={13} />
                    <span>Detailed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSalaryViewChange("summary")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      salaryTableViewMode === "summary"
                        ? "bg-base-100 text-primary shadow-sm font-black"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                    title="Earnings & Deductions View"
                  >
                    <Columns2 size={13} />
                    <span>Earnings & Deductions</span>
                  </button>
                </div>

                {/* Filter by Company Dropdown */}
                <div className="dropdown dropdown-bottom dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-xs h-8 px-3 text-xs font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-2 shadow-xs hover:bg-base-200/70 cursor-pointer min-w-max"
                  >
                    <Building2 size={13} className="text-primary shrink-0" />
                    <span className="text-base-content/60 font-medium">Company:</span>
                    <span className="text-primary font-bold whitespace-nowrap">
                      {salaryCompanyFilter === "all" ? "All" : salaryCompanyFilter}
                    </span>
                    <ChevronDown size={13} className="opacity-60 shrink-0" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl min-w-full w-max z-[100] mt-1.5 border border-base-300/50"
                  >
                    <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                      Filter Company
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`flex items-center justify-between gap-4 py-2 px-3 rounded-xl text-xs transition-all ${
                          salaryCompanyFilter === "all"
                            ? "bg-primary text-primary-content font-bold shadow-md"
                            : "hover:bg-base-200"
                        }`}
                        onClick={() => {
                          setSalaryCompanyFilter("all");
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }}
                      >
                        <span className="whitespace-nowrap font-medium">All Companies</span>
                        <span className="badge badge-xs badge-ghost text-[10px] opacity-70">
                          {salaryCompanies.length}
                        </span>
                      </button>
                    </li>
                    {salaryCompanies.map((c) => (
                      <li key={c}>
                        <button
                          type="button"
                          className={`flex items-center justify-between gap-4 py-2 px-3 rounded-xl text-xs transition-all ${
                            salaryCompanyFilter === c
                              ? "bg-primary text-primary-content font-bold shadow-md"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => {
                            setSalaryCompanyFilter(c);
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                        >
                          <span className="whitespace-nowrap font-medium">{c}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Filter by Year Dropdown */}
                <div className="dropdown dropdown-bottom dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-xs h-8 px-3 text-xs font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-base-200/70 cursor-pointer"
                  >
                    <Calendar size={13} className="text-primary shrink-0" />
                    <span className="text-base-content/60 font-medium">Year:</span>
                    <span className="text-primary font-mono">
                      {salaryYearFilter === "all" ? "All" : salaryYearFilter}
                    </span>
                    <ChevronDown size={13} className="opacity-60 shrink-0" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-40 z-[100] mt-1.5 border border-base-300/50 max-h-60 overflow-y-auto"
                  >
                    <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                      Filter Year
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-all ${
                          salaryYearFilter === "all"
                            ? "bg-primary text-primary-content font-bold shadow-md"
                            : "hover:bg-base-200"
                        }`}
                        onClick={() => {
                          setSalaryYearFilter("all");
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }}
                      >
                        <span>All Years</span>
                        <span className="badge badge-xs badge-ghost text-[10px] opacity-70">
                          {salaryYears.length}
                        </span>
                      </button>
                    </li>
                    {salaryYears.map((y) => (
                      <li key={y}>
                        <button
                          type="button"
                          className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-all ${
                            salaryYearFilter === y
                              ? "bg-primary text-primary-content font-bold shadow-md"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => {
                            setSalaryYearFilter(y);
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                        >
                          <span className="font-mono">{y}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reset Filters button if any filter applied */}
                {(salarySearchTerm || salaryCompanyFilter !== "all" || salaryYearFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSalarySearchTerm("");
                      setSalaryCompanyFilter("all");
                      setSalaryYearFilter("all");
                    }}
                    className="btn btn-xs h-8 px-2.5 btn-ghost text-primary font-bold hover:bg-primary/10 rounded-xl cursor-pointer shrink-0"
                    title="Reset all filters"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Single-Line Controls & Filters Bar for PF */}
        {activeTab === "pf" && (
          <div className="bg-base-100/80 backdrop-blur-md p-2.5 rounded-2xl border border-base-200/70 shadow-sm overflow-visible">
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 w-full">
              {/* Left Side: Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  value={pfSearchTerm}
                  onChange={(e) => setPfSearchTerm(e.target.value)}
                  placeholder={
                    pfSubTab === "deposits"
                      ? "Search PF records by Company, Month..."
                      : "Search withdrawals by Reason, Date, Notes..."
                  }
                  className="input input-xs h-8 pl-9 pr-8 w-full rounded-xl bg-base-200/60 border border-base-300/60 focus:border-primary text-xs"
                />
                {pfSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setPfSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Right Side: Sub-Tabs Switcher & Filters */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Deposited & Withdrawal Sub-Tabs Switcher */}
                <div className="flex items-center gap-1 bg-base-200 p-1 rounded-xl shrink-0 text-xs font-bold border border-base-300/60">
                  <button
                    type="button"
                    onClick={() => setPfSubTab("deposits")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      pfSubTab === "deposits"
                        ? "bg-base-100 text-primary shadow-sm font-black"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                    title="Deposited PF Contributions"
                  >
                    <Percent size={13} />
                    <span>Deposited</span>
                    <span
                      className={`badge badge-xs px-1 py-0.5 rounded-md font-mono text-[10px] ${
                        pfSubTab === "deposits"
                          ? "badge-primary text-primary-content font-bold"
                          : "badge-ghost opacity-70"
                      }`}
                    >
                      {salaryData.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPfSubTab("withdrawals")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      pfSubTab === "withdrawals"
                        ? "bg-base-100 text-primary shadow-sm font-black"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
                    title="PF Withdrawals"
                  >
                    <ArrowUpRight size={13} />
                    <span>Withdrawal</span>
                    <span
                      className={`badge badge-xs px-1 py-0.5 rounded-md font-mono text-[10px] ${
                        pfSubTab === "withdrawals"
                          ? "badge-primary text-primary-content font-bold"
                          : "badge-ghost opacity-70"
                      }`}
                    >
                      {pfWithdrawals.length}
                    </span>
                  </button>
                </div>

                {/* Filters for Deposited Tab */}
                {pfSubTab === "deposits" && (
                  <>
                    {/* Filter by Company */}
                    <div className="dropdown dropdown-bottom dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-xs h-8 px-3 text-xs font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-2 shadow-xs hover:bg-base-200/70 cursor-pointer min-w-max"
                      >
                        <Building2 size={13} className="text-primary shrink-0" />
                        <span className="text-base-content/60 font-medium">Company:</span>
                        <span className="text-primary font-bold whitespace-nowrap">
                          {pfCompanyFilter === "all" ? "All" : pfCompanyFilter}
                        </span>
                        <ChevronDown size={13} className="opacity-60 shrink-0" />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl min-w-full w-max z-[100] mt-1.5 border border-base-300/50"
                      >
                        <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                          Filter Company
                        </li>
                        <li>
                          <button
                            type="button"
                            className={`flex items-center justify-between gap-4 py-2 px-3 rounded-xl text-xs transition-all ${
                              pfCompanyFilter === "all"
                                ? "bg-primary text-primary-content font-bold shadow-md"
                                : "hover:bg-base-200"
                            }`}
                            onClick={() => {
                              setPfCompanyFilter("all");
                              if (document.activeElement instanceof HTMLElement) {
                                document.activeElement.blur();
                              }
                            }}
                          >
                            <span className="whitespace-nowrap font-medium">All Companies</span>
                            <span className="badge badge-xs badge-ghost text-[10px] opacity-70">
                              {salaryCompanies.length}
                            </span>
                          </button>
                        </li>
                        {salaryCompanies.map((c) => (
                          <li key={c}>
                            <button
                              type="button"
                              className={`flex items-center justify-between gap-4 py-2 px-3 rounded-xl text-xs transition-all ${
                                pfCompanyFilter === c
                                  ? "bg-primary text-primary-content font-bold shadow-md"
                                  : "hover:bg-base-200"
                              }`}
                              onClick={() => {
                                setPfCompanyFilter(c);
                                if (document.activeElement instanceof HTMLElement) {
                                  document.activeElement.blur();
                                }
                              }}
                            >
                              <span className="whitespace-nowrap font-medium">{c}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Filter by Year */}
                    <div className="dropdown dropdown-bottom dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-xs h-8 px-3 text-xs font-bold bg-base-100 border border-base-300 rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-base-200/70 cursor-pointer"
                      >
                        <Calendar size={13} className="text-primary shrink-0" />
                        <span className="text-base-content/60 font-medium">Year:</span>
                        <span className="text-primary font-mono">
                          {pfYearFilter === "all" ? "All" : pfYearFilter}
                        </span>
                        <ChevronDown size={13} className="opacity-60 shrink-0" />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-1.5 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-40 z-[100] mt-1.5 border border-base-300/50 max-h-60 overflow-y-auto"
                      >
                        <li className="menu-title text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-2 py-1">
                          Filter Year
                        </li>
                        <li>
                          <button
                            type="button"
                            className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-all ${
                              pfYearFilter === "all"
                                ? "bg-primary text-primary-content font-bold shadow-md"
                                : "hover:bg-base-200"
                            }`}
                            onClick={() => {
                              setPfYearFilter("all");
                              if (document.activeElement instanceof HTMLElement) {
                                document.activeElement.blur();
                              }
                            }}
                          >
                            <span>All Years</span>
                            <span className="badge badge-xs badge-ghost text-[10px] opacity-70">
                              {salaryYears.length}
                            </span>
                          </button>
                        </li>
                        {salaryYears.map((y) => (
                          <li key={y}>
                            <button
                              type="button"
                              className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-all ${
                                pfYearFilter === y
                                  ? "bg-primary text-primary-content font-bold shadow-md"
                                  : "hover:bg-base-200"
                              }`}
                              onClick={() => {
                                setPfYearFilter(y);
                                if (document.activeElement instanceof HTMLElement) {
                                  document.activeElement.blur();
                                }
                              }}
                            >
                              <span className="font-mono">{y}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Reset Filters button if any filter applied */}
                    {(pfSearchTerm || pfCompanyFilter !== "all" || pfYearFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setPfSearchTerm("");
                          setPfCompanyFilter("all");
                          setPfYearFilter("all");
                        }}
                        className="btn btn-xs h-8 px-2.5 btn-ghost text-primary font-bold hover:bg-primary/10 rounded-xl cursor-pointer shrink-0"
                        title="Reset all filters"
                      >
                        Reset
                      </button>
                    )}
                  </>
                )}

                {/* Withdraw from PF Button when in Withdrawals Tab */}
                {pfSubTab === "withdrawals" && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPfWithdrawal(null);
                      setIsAddPfWithdrawalModalOpen(true);
                    }}
                    disabled={availablePfBalance <= 0}
                    className="btn btn-xs h-8 px-3 btn-primary rounded-xl gap-1.5 font-bold cursor-pointer shadow-sm disabled:opacity-50"
                    title={
                      availablePfBalance <= 0
                        ? "No balance available to withdraw"
                        : "Record a PF withdrawal"
                    }
                  >
                    <Plus size={14} />
                    <span>Withdraw from PF</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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

              {/* Right Side: MF Actions */}
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsOrganizeModalOpen(true)}
                  className="btn btn-xs btn-ghost rounded-lg px-2.5 font-bold text-xs border border-base-300/60 hover:bg-base-200 transition-all cursor-pointer"
                  title="Organize Fund Groups & Order"
                >
                  <FolderTree size={14} className="text-secondary" />
                </button>

                {/* Privacy Mode Eye Toggle (Hide / Show Numbers in MF Cards) */}
                <button
                  type="button"
                  onClick={toggleHideMfNumbers}
                  className={`btn btn-xs rounded-xl px-2.5 font-bold text-xs transition-all cursor-pointer border ${
                    hideMfNumbers
                      ? "btn-warning bg-warning/15 border-warning/30 text-warning shadow-xs"
                      : "btn-ghost border-base-300/60 text-base-content/70 hover:text-base-content hover:bg-base-200"
                  }`}
                  title={hideMfNumbers ? "Numbers Hidden (Click to Show Numbers)" : "Hide Numbers in MF Cards"}
                >
                  {hideMfNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>

                <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300/60 shrink-0">
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
                    <Columns2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMfLayoutChange("3-col")}
                    className={`btn btn-xs rounded-lg px-2.5 transition-all cursor-pointer ${
                      mfLayoutView === "3-col"
                        ? "btn-secondary shadow-xs text-white"
                        : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                    title="3 Columns View"
                  >
                    <Columns3 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Single-Line Controls & Filters Bar for Fixed Deposits */}
        {activeTab === "fd" && (
          <div className="bg-base-100/80 backdrop-blur-md p-2.5 rounded-2xl border border-base-200/70 shadow-sm overflow-visible">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 w-full">
              {/* Left Side: Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  value={fdSearchTerm}
                  onChange={(e) => setFdSearchTerm(e.target.value)}
                  placeholder="Search fixed deposits by Bank, Account #, Scheme..."
                  className="input input-sm pl-9 pr-8 w-full rounded-xl bg-base-200/60 border-base-200 focus:border-primary text-xs"
                />
                {fdSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setFdSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Right Side: Organize Groups, Privacy Eye Toggle & Layout View Toggle */}
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsOrganizeFdModalOpen(true)}
                  className="btn btn-xs btn-ghost rounded-lg px-2.5 font-bold text-xs border border-base-300/60 hover:bg-base-200 transition-all cursor-pointer"
                  title="Organize Fixed Deposit Groups & Order"
                >
                  <FolderTree size={14} className="text-primary" />
                </button>

                {/* Privacy Mode Eye Toggle (Hide / Show Numbers in FD Cards) */}
                <button
                  type="button"
                  onClick={toggleHideFdNumbers}
                  className={`btn btn-xs rounded-xl px-2.5 font-bold text-xs transition-all cursor-pointer border ${
                    hideFdNumbers
                      ? "btn-warning bg-warning/15 border-warning/30 text-warning shadow-xs"
                      : "btn-ghost border-base-300/60 text-base-content/70 hover:text-base-content hover:bg-base-200"
                  }`}
                  title={hideFdNumbers ? "Numbers Hidden (Click to Show Numbers)" : "Hide Numbers in FD Cards"}
                >
                  {hideFdNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>

                <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300/60 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleFdLayoutChange("2-col")}
                    className={`btn btn-xs rounded-lg px-2.5 transition-all cursor-pointer ${
                      fdLayoutView === "2-col"
                        ? "btn-primary shadow-xs text-white"
                        : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                    title="2 Columns View"
                  >
                    <Columns2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFdLayoutChange("3-col")}
                    className={`btn btn-xs rounded-lg px-2.5 transition-all cursor-pointer ${
                      fdLayoutView === "3-col"
                        ? "btn-primary shadow-xs text-white"
                        : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                    title="3 Columns View"
                  >
                    <Columns3 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Single-Line Controls & Filters Bar for Recurring Deposits */}
        {activeTab === "rd" && (
          <div className="bg-base-100/80 backdrop-blur-md p-2.5 rounded-2xl border border-base-200/70 shadow-sm overflow-visible">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 w-full">
              {/* Left Side: Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  value={rdSearchTerm}
                  onChange={(e) => setRdSearchTerm(e.target.value)}
                  placeholder="Search recurring deposits by Bank, Account #, Scheme..."
                  className="input input-sm pl-9 pr-8 w-full rounded-xl bg-base-200/60 border-base-200 focus:border-primary text-xs"
                />
                {rdSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setRdSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Right Side: Organize Groups, Privacy Eye Toggle & Layout View Toggle */}
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsOrganizeRdModalOpen(true)}
                  className="btn btn-xs btn-ghost rounded-lg px-2.5 font-bold text-xs border border-base-300/60 hover:bg-base-200 transition-all cursor-pointer"
                  title="Organize Recurring Deposit Groups & Order"
                >
                  <FolderTree size={14} className="text-primary" />
                </button>

                {/* Privacy Mode Eye Toggle (Hide / Show Numbers in RD Cards) */}
                <button
                  type="button"
                  onClick={toggleHideRdNumbers}
                  className={`btn btn-xs rounded-xl px-2.5 font-bold text-xs transition-all cursor-pointer border ${
                    hideRdNumbers
                      ? "btn-warning bg-warning/15 border-warning/30 text-warning shadow-xs"
                      : "btn-ghost border-base-300/60 text-base-content/70 hover:text-base-content hover:bg-base-200"
                  }`}
                  title={hideRdNumbers ? "Numbers Hidden (Click to Show Numbers)" : "Hide Numbers in RD Cards"}
                >
                  {hideRdNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>

                <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300/60 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRdLayoutChange("2-col")}
                    className={`btn btn-xs rounded-lg px-2.5 transition-all cursor-pointer ${
                      rdLayoutView === "2-col"
                        ? "btn-primary shadow-xs text-white"
                        : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                    title="2 Columns View"
                  >
                    <Columns2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRdLayoutChange("3-col")}
                    className={`btn btn-xs rounded-lg px-2.5 transition-all cursor-pointer ${
                      rdLayoutView === "3-col"
                        ? "btn-primary shadow-xs text-white"
                        : "btn-ghost text-base-content/60 hover:text-base-content"
                    }`}
                    title="3 Columns View"
                  >
                    <Columns3 size={14} />
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

                {/* Privacy Mode Eye Toggle (Hide / Show Numbers in Stock Cards) */}
                <button
                  type="button"
                  onClick={toggleHideStockNumbers}
                  className={`btn btn-xs h-8 px-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                    hideStockNumbers
                      ? "btn-warning bg-warning/15 border-warning/30 text-warning shadow-xs"
                      : "btn-ghost border-base-300/60 text-base-content/70 hover:text-base-content hover:bg-base-200"
                  }`}
                  title={hideStockNumbers ? "Numbers Hidden (Click to Show Numbers)" : "Hide Numbers in Stock Cards"}
                >
                  {hideStockNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>

                {/* SIMPLE TABLE VIEW ICON BUTTON (Opens Table View Popup in Middle of UI) */}
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(true)}
                  className="btn btn-ghost btn-xs h-8 px-2.5 text-xs font-extrabold bg-primary/10 border border-primary/30 text-primary rounded-xl flex items-center justify-center shadow-xs hover:bg-primary hover:text-primary-content hover:border-primary transition-all cursor-pointer shrink-0"
                  title="Open Table View Popup Modal"
                >
                  <Table size={15} />
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
                          <span className="font-bold">{hideStockNumbers ? "••" : stock.bQty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Price:</span>
                          <span>{hideStockNumbers ? "₹ ••••" : formatINR(stock.bShare)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/60">Charges:</span>
                          <span className="text-warning font-semibold">{hideStockNumbers ? "₹ •••" : formatINR(stock.bBkgPdc)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-base-200 font-bold">
                          <span>Cost:</span>
                          <span className="text-primary">{hideStockNumbers ? "₹ ••••••" : formatINR(stock.bFStock)}</span>
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
                              <span className="font-bold">{hideStockNumbers ? "••" : stock.sQty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Price:</span>
                              <span>{hideStockNumbers ? "₹ ••••" : formatINR(stock.sShare)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-base-content/60">Charges:</span>
                              <span className="text-warning font-semibold">{hideStockNumbers ? "₹ •••" : formatINR(stock.sBkgPdc + stock.dp)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-base-200 font-bold">
                              <span>Net:</span>
                              <span className="text-secondary">{hideStockNumbers ? "₹ ••••••" : formatINR(stock.sFStock)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="my-auto text-center space-y-0.5 py-3">
                            <div className="text-[9px] uppercase font-extrabold text-primary/80 tracking-wider">
                              Position Active
                            </div>
                            <div className="text-xs font-black text-primary">
                              {stock.qLeft > 0 ? (hideStockNumbers ? "•• Shares Holding" : `${stock.qLeft} Shares Holding`) : "Holding"}
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
                              {hideStockNumbers
                                ? (isProfit ? "+₹ •••••• (••%)" : "-₹ •••••• (••%)")
                                : `${isProfit ? "+" : ""}${formatINR(stock.gainRs)} (${stock.gainPct}%)`}
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
                          Invested:{" "}
                          <strong className="text-base-content font-bold">
                            {hideMfNumbers
                              ? "₹ ••••••"
                              : `₹${group.totalInvested.toLocaleString("en-IN")}`}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Group Fund Cards Grid */}
                    {!isGroupCollapsed && (
                      <div
                        className={
                          mfLayoutView === "2-col"
                            ? "grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
                            : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch"
                        }
                      >
                        {group.funds.map((fund, fundIdx) => {
                          const summary = getMfDetailedSummary(fund);

                          return (
                            <MutualFundCard
                              key={fund.id}
                              index={fundIdx + 1}
                              fund={fund}
                              summary={summary}
                              hideNumbers={hideMfNumbers}
                              onOpenInfo={handleOpenMfInfoModal}
                              onOpenTable={(fund, mode) => {
                                setMfTableViewMode(mode || "deposit");
                                setViewingMfTableFundId(fund.id);
                              }}
                              onOpenAddSip={(fund, mode) =>
                                handleOpenAddSipModal(fund, mode || "deposit")
                              }
                              onOpenAddWithdrawal={(fund) =>
                                handleOpenAddWithdrawalModal(fund)
                              }
                              onEdit={() => handleEditMf(fund)}
                              onDelete={() => handleDeleteMf(fund.id)}
                            />
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
      {/* ------------------------------------------------------------------ */}
      {/* FIXED DEPOSIT TAB VIEW (activeTab === "fd")                        */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "fd" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Empty State */}
          {fdData.length === 0 ? (
            <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 text-primary rounded-3xl">
                  <Landmark size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">
                    No Fixed Deposits Yet
                  </h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    Add your bank and NBFC Fixed Deposits to track interest rates, compounding maturity schedules, and partial or full withdrawals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddFdModal}
                  className="btn btn-primary btn-sm rounded-xl gap-2 font-bold px-5 cursor-pointer shadow-md"
                >
                  <Plus size={16} />
                  <span>Add First Fixed Deposit</span>
                </button>
              </div>
            </div>
          ) : filteredFixedDeposits.length === 0 ? (
            <div className="bg-base-100 p-10 rounded-3xl border border-base-200 shadow-sm text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <Search size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-base-content">
                    No Matching Fixed Deposits Found
                  </h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    No fixed deposits matched your search query <span className="font-semibold text-primary">"{fdSearchTerm}"</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFdSearchTerm("")}
                  className="btn btn-ghost btn-xs text-primary font-bold hover:bg-primary/10 cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            /* Grouped Fixed Deposit Cards with Collapsible Headers */
            <div className="space-y-6">
              {groupedFixedDeposits.map((group) => {
                const isGroupCollapsed = collapsedFdGroupIds.has(group.id);

                return (
                  <div key={group.id} className="space-y-3.5">
                    {/* Collapsible Group Header */}
                    <div
                      onClick={() => toggleFdGroupCollapse(group.id)}
                      className="flex items-center justify-between px-4 py-2.5 bg-base-100/90 backdrop-blur-md rounded-2xl border border-base-200/90 shadow-2xs cursor-pointer hover:bg-base-200/40 transition-all select-none group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1 rounded-xl bg-primary/10 text-primary transition-transform duration-200 shrink-0 ${isGroupCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                          <ChevronDown size={16} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <h3 className="font-extrabold text-sm text-base-content tracking-tight group-hover:text-primary transition-colors truncate">
                            {group.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-bold border border-primary/20 shrink-0">
                            {group.fds.length} deposit{group.fds.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Group Subtotal Summary */}
                      <div className="flex items-center gap-4 text-xs font-medium text-base-content/70 shrink-0">
                        <span className="hidden sm:inline">
                          Active Principal:{" "}
                          <strong className="text-base-content font-bold">
                            {hideFdNumbers
                              ? "₹ ••••••"
                              : `₹${group.totalInvested.toLocaleString("en-IN")}`}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Group FD Cards Grid */}
                    {!isGroupCollapsed && (
                      <div
                        className={
                          fdLayoutView === "2-col"
                            ? "grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
                            : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch"
                        }
                      >
                        {group.fds.map((fd, fdIdx) => {
                          return (
                            <FixedDepositCard
                              key={fd.id}
                              index={fdIdx + 1}
                              fd={fd}
                              hideNumbers={hideFdNumbers}
                              onOpenInfo={setViewingInfoFd}
                              onOpenWithdraw={setWithdrawingFd}
                              onRemoveWithdrawal={handleRemoveFdWithdrawal}
                              onEdit={() => handleEditFd(fd)}
                              onDelete={() => handleDeleteFd(fd.id)}
                            />
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
      {/* RECURRING DEPOSIT TAB VIEW (activeTab === "rd")                    */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "rd" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Empty State */}
          {rdData.length === 0 ? (
            <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 text-primary rounded-3xl">
                  <PiggyBank size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">
                    No Recurring Deposits Yet
                  </h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    Add your bank and NBFC Recurring Deposits to track interest rates, compounding maturity schedules, and withdrawals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddRdModal}
                  className="btn btn-primary btn-sm rounded-xl gap-2 font-bold px-5 cursor-pointer shadow-md"
                >
                  <Plus size={16} />
                  <span>Add First Recurring Deposit</span>
                </button>
              </div>
            </div>
          ) : filteredRecurringDeposits.length === 0 ? (
            <div className="bg-base-100 p-10 rounded-3xl border border-base-200 shadow-sm text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <Search size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-base-content">
                    No Matching Recurring Deposits Found
                  </h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    No recurring deposits matched your search query <span className="font-semibold text-primary">"{rdSearchTerm}"</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRdSearchTerm("")}
                  className="btn btn-ghost btn-xs text-primary font-bold hover:bg-primary/10 cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            /* Grouped Recurring Deposit Cards with Collapsible Headers */
            <div className="space-y-6">
              {groupedRecurringDeposits.map((group) => {
                const isGroupCollapsed = collapsedRdGroupIds.has(group.id);

                return (
                  <div key={group.id} className="space-y-3.5">
                    {/* Collapsible Group Header */}
                    <div
                      onClick={() => toggleRdGroupCollapse(group.id)}
                      className="flex items-center justify-between px-4 py-2.5 bg-base-100/90 backdrop-blur-md rounded-2xl border border-base-200/90 shadow-2xs cursor-pointer hover:bg-base-200/40 transition-all select-none group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1 rounded-xl bg-primary/10 text-primary transition-transform duration-200 shrink-0 ${isGroupCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                          <ChevronDown size={16} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <h3 className="font-extrabold text-sm text-base-content tracking-tight group-hover:text-primary transition-colors truncate">
                            {group.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-bold border border-primary/20 shrink-0">
                            {group.rds.length} deposit{group.rds.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Group Subtotal Summary */}
                      <div className="flex items-center gap-4 text-xs font-medium text-base-content/70 shrink-0">
                        <span className="hidden sm:inline">
                          Active Principal:{" "}
                          <strong className="text-base-content font-bold">
                            {hideRdNumbers
                              ? "₹ ••••••"
                              : `₹${group.totalInvested.toLocaleString("en-IN")}`}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Group RD Cards Grid */}
                    {!isGroupCollapsed && (
                      <div
                        className={
                          rdLayoutView === "2-col"
                            ? "grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
                            : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch"
                        }
                      >
                        {group.rds.map((rd, rdIdx) => {
                          return (
                            <RecurringDepositCard
                              key={rd.id}
                              index={rdIdx + 1}
                              rd={rd}
                              hideNumbers={hideRdNumbers}
                              onOpenWithdraw={setWithdrawingRd}
                              onRemoveWithdrawal={handleRemoveRdWithdrawal}
                              onOpenAddDeposit={(targetRd) => handleOpenAddRdDeposit(targetRd)}
                              onOpenTable={(targetRd) => handleOpenRdTable(targetRd)}
                              onEdit={() => handleEditRd(rd)}
                              onDelete={() => handleDeleteRd(rd.id)}
                            />
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
      {/* SALARY TAB VIEW (activeTab === "salary")                           */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "salary" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                Experience
              </span>
              <div className="text-xl font-black text-secondary truncate">
                {salarySummary.experienceText}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                {salarySummary.totalMonths} {salarySummary.totalMonths === 1 ? "month" : "months"} recorded
              </span>
            </div>

            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                Total In Hand Received
              </span>
              <div className="text-xl font-black text-success truncate">
                ₹{salarySummary.totalInHand.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                Across {salarySummary.count} {salarySummary.count === 1 ? "month" : "months"}
              </span>
            </div>

            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                Total E6r PF
              </span>
              <div className="text-xl font-black text-primary truncate">
                ₹{salarySummary.totalErPf.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                Employer Provident Fund
              </span>
            </div>

            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                Total Taxes & Deductions
              </span>
              <div className="text-xl font-black text-error truncate">
                ₹{salarySummary.totalTaxes.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                Tax + State Tax + Special Allowance
              </span>
            </div>

            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                Total CTC
              </span>
              <div className="text-xl font-black text-info truncate">
                ₹{salarySummary.totalCtc.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                Total Earnings + E6r PF
              </span>
            </div>
          </div>

          {/* Salary Table */}
          {salaryData.length === 0 ? (
            <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 text-primary rounded-3xl">
                  <Briefcase size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">
                    No Salary Records Yet
                  </h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    Add your monthly salary slips to track basic salary, HRA, flexi allowances, gross earnings, PF deductions, taxes, and in-hand pay.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddSalaryModal}
                  className="btn btn-primary btn-sm rounded-xl gap-2 font-bold px-5 cursor-pointer shadow-md"
                >
                  <Plus size={16} />
                  <span>Add First Salary Entry</span>
                </button>
              </div>
            </div>
          ) : filteredSalaries.length === 0 ? (
            <div className="bg-base-100 p-10 rounded-3xl border border-base-200 shadow-sm text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <Search size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-base-content">
                    No Matching Salary Records Found
                  </h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    No records matched your search query or filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSalarySearchTerm("");
                    setSalaryCompanyFilter("all");
                    setSalaryYearFilter("all");
                  }}
                  className="btn btn-ghost btn-xs text-primary font-bold hover:bg-primary/10 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : salaryTableViewMode === "detailed" ? (
            <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="overflow-x-auto max-w-full">
                <table className="table table-sm w-full text-xs border-separate border-spacing-0">
                  <thead className="bg-base-200 text-base-content/80 text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="sticky left-0 z-30 bg-base-200 py-3 px-3 text-center w-12 min-w-[48px] max-w-[48px] border-b border-base-300">
                        #
                      </th>
                      <th className="sticky left-[48px] z-30 bg-base-200 py-3 px-3 min-w-[130px] max-w-[130px] border-b border-base-300">
                        Month
                      </th>
                      <th className="sticky left-[178px] z-30 bg-base-200 py-3 px-3 min-w-[200px] max-w-[220px] border-b border-r border-base-300 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_8px_-2px_rgba(0,0,0,0.4)]">
                        Company
                      </th>
                      <th className="py-3 px-3 text-right min-w-[110px] bg-base-200/80 border-b border-base-300">Basic Salary</th>
                      <th className="py-3 px-3 text-right min-w-[100px] bg-base-200/80 border-b border-base-300">HRA</th>
                      <th className="py-3 px-3 text-right min-w-[130px] bg-base-200/80 border-b border-base-300">Flexi / RSA / Extras</th>
                      <th className="py-3 px-3 text-right min-w-[100px] text-emerald-600 dark:text-emerald-400 bg-base-200/80 border-b border-base-300">Bonus</th>
                      <th className="py-3 px-3 text-right min-w-[100px] bg-base-200/80 border-b border-base-300">Gratuity</th>
                      <th className="py-3 px-3 text-right min-w-[105px] bg-base-200/80 border-b border-base-300">Variable Pay</th>
                      <th className="py-3 px-3 text-right min-w-[130px] bg-primary/10 text-primary font-black border-b border-base-300" title="Basic + HRA + Flexi + Bonus + Gratuity + Variable Pay">
                        Total Earnings
                      </th>
                      <th className="py-3 px-3 text-right min-w-[100px] bg-base-200/80 border-b border-base-300">E6r PF</th>
                      <th className="py-3 px-3 text-right min-w-[105px] text-error bg-base-200/80 border-b border-base-300" title="Tax + State Tax + Special Allowance">
                        Tax + Others
                      </th>
                      <th className="py-3 px-3 text-right min-w-[120px] bg-success/15 text-success font-black border-b border-base-300">
                        In Hand
                      </th>
                      <th className="py-3 px-3 text-right min-w-[110px] font-black bg-base-200/80 border-b border-base-300" title="Total Earnings + E6r PF">
                        CTC
                      </th>
                      <th className="sticky right-0 z-30 bg-base-200 py-3 px-3 text-center min-w-[80px] max-w-[80px] border-b border-l border-base-300 shadow-[-3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-3px_0_8px_-2px_rgba(0,0,0,0.4)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalaries.map((item, idx) => {
                      const basic = Number(item.basicSalary || 0);
                      const hra = Number(item.hra || 0);
                      const flexi = Number(item.flexi || 0);
                      const bonus = Number(item.bonus || 0);
                      const gratuity = Number(item.gratuity || 0);
                      const variablePay = Number(item.variablePay || 0);
                      const gross = Number(item.gross || 0) || (basic + hra + flexi + bonus);
                      const rowEarnings = gross + gratuity + variablePay;
                      const erPf = Number(item.erPf || 0);
                      const taxes = Number(item.taxes || 0);
                      const inHand = Number(item.inHand || 0) || (gross - (erPf + taxes));
                      const ctc = Number(item.ctc || 0) || (rowEarnings + erPf);

                      return (
                        <tr key={item.id || item._id} className="group hover:bg-base-200/40 transition-colors">
                          <td className="sticky left-0 z-10 bg-base-100 group-hover:bg-base-200 py-3 px-3 text-center font-mono text-base-content/50 w-12 min-w-[48px] max-w-[48px] border-b border-base-200/60 transition-colors">
                            {idx + 1}
                          </td>
                          <td className="sticky left-[48px] z-10 bg-base-100 group-hover:bg-base-200 py-3 px-3 whitespace-nowrap font-bold text-base-content min-w-[130px] max-w-[130px] border-b border-base-200/60 transition-colors">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-primary shrink-0" />
                              <span>{dayjs(item.month).format("MMM YYYY")}</span>
                            </div>
                          </td>
                          <td className="sticky left-[178px] z-10 bg-base-100 group-hover:bg-base-200 py-3 px-3 whitespace-nowrap font-bold text-base-content opacity-100 min-w-[200px] max-w-[220px] border-b border-r border-base-200/80 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_8px_-2px_rgba(0,0,0,0.4)] transition-colors" style={{ opacity: 1 }}>
                            <div className="flex items-center gap-2">
                              <CompanyLogo name={item.company} size="w-6 h-6" type="company" />
                              <span className="font-bold text-base-content opacity-100 truncate max-w-[150px]" style={{ opacity: 1 }} title={item.company}>
                                {item.company}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-base-content/90 whitespace-nowrap border-b border-base-200/60">
                            ₹{basic.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-base-content/90 whitespace-nowrap border-b border-base-200/60">
                            ₹{hra.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-base-content/90 whitespace-nowrap border-b border-base-200/60">
                            ₹{flexi.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap border-b border-base-200/60">
                            ₹{bonus.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-base-content/80 whitespace-nowrap border-b border-base-200/60">
                            ₹{gratuity.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-base-content/80 whitespace-nowrap border-b border-base-200/60">
                            ₹{variablePay.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-primary bg-primary/5 whitespace-nowrap border-b border-base-200/60">
                            ₹{rowEarnings.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-base-content/80 whitespace-nowrap border-b border-base-200/60">
                            ₹{erPf.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-error font-medium whitespace-nowrap border-b border-base-200/60 min-w-[105px]">
                            ₹{taxes.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-success bg-success/10 whitespace-nowrap border-b border-base-200/60">
                            ₹{inHand.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-base-content whitespace-nowrap border-b border-base-200/60">
                            ₹{ctc.toLocaleString("en-IN")}
                          </td>
                          <td className="sticky right-0 z-10 bg-base-100 group-hover:bg-base-200 py-3 px-3 text-center whitespace-nowrap min-w-[80px] max-w-[80px] border-b border-l border-base-200/80 shadow-[-3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-3px_0_8px_-2px_rgba(0,0,0,0.4)] transition-colors">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditSalary(item)}
                                className="btn btn-ghost btn-xs btn-circle text-base-content/70 hover:text-primary hover:bg-primary/10 cursor-pointer"
                                title="Edit Salary"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSalary(item.id || item._id)}
                                className="btn btn-ghost btn-xs btn-circle text-base-content/70 hover:text-error hover:bg-error/10 cursor-pointer"
                                title="Delete Salary"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals Summary Footer */}
                  <tfoot className="bg-base-200/90 text-xs font-bold">
                    <tr>
                      <td colSpan={3} className="sticky left-0 z-20 bg-base-200 py-3 px-3 font-extrabold text-base-content uppercase tracking-wider border-t-2 border-r border-base-300 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_8px_-2px_rgba(0,0,0,0.4)]">
                        Totals ({salarySummary.count} {salarySummary.count === 1 ? "Entry" : "Entries"})
                      </td>
                      <td className="py-3 px-3 text-right font-mono border-t-2 border-base-300">
                        ₹{salarySummary.totalBasic.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono border-t-2 border-base-300">
                        ₹{salarySummary.totalHra.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono border-t-2 border-base-300">
                        ₹{salarySummary.totalFlexi.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold border-t-2 border-base-300">
                        ₹{salarySummary.totalBonus.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono border-t-2 border-base-300">
                        ₹{salarySummary.totalGratuity.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono border-t-2 border-base-300">
                        ₹{salarySummary.totalVarPay.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-primary font-black bg-primary/10 border-t-2 border-base-300">
                        ₹{salarySummary.totalEarnings.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono border-t-2 border-base-300">
                        ₹{salarySummary.totalErPf.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-error border-t-2 border-base-300 min-w-[105px]">
                        ₹{salarySummary.totalTaxes.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-success font-black bg-success/15 text-sm border-t-2 border-base-300">
                        ₹{salarySummary.totalInHand.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black border-t-2 border-base-300">
                        ₹{salarySummary.totalCtc.toLocaleString("en-IN")}
                      </td>
                      <td className="sticky right-0 z-20 bg-base-200 py-3 px-3 border-t-2 border-l border-base-300 shadow-[-3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-3px_0_8px_-2px_rgba(0,0,0,0.4)]"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            /* Earnings & Deductions View Table */
            <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="overflow-x-auto max-w-full">
                <table className="table table-sm w-full text-xs border-separate border-spacing-0">
                  <thead className="bg-base-200 text-base-content/80 text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="sticky left-0 z-30 bg-base-200 py-3.5 px-4 text-center w-12 min-w-[48px] max-w-[48px] border-b border-base-300">
                        #
                      </th>
                      <th className="sticky left-[48px] z-30 bg-base-200 py-3.5 px-4 min-w-[130px] max-w-[130px] border-b border-base-300">
                        Month
                      </th>
                      <th className="sticky left-[178px] z-30 bg-base-200 py-3.5 px-4 min-w-[200px] max-w-[220px] border-b border-r border-base-300 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_8px_-2px_rgba(0,0,0,0.4)]">
                        Company
                      </th>
                      <th className="py-3.5 px-4 text-right min-w-[170px] bg-primary/10 text-primary font-black border-b border-base-300" title="Includes Basic, HRA, Flexi, Bonus, Gratuity & Variable Pay">
                        Total Earnings
                      </th>
                      <th className="py-3.5 px-4 text-right min-w-[170px] bg-error/10 text-error font-black border-b border-base-300">
                        Deductions (PF + Taxes)
                      </th>
                      <th className="py-3.5 px-4 text-right min-w-[170px] bg-success/15 text-success font-black border-b border-base-300">
                        In Hand Salary
                      </th>
                      <th className="py-3.5 px-4 text-right min-w-[140px] font-black border-b border-base-300" title="Total Earnings + E6r PF">
                        CTC
                      </th>
                      <th className="sticky right-0 z-30 bg-base-200 py-3.5 px-4 text-center min-w-[80px] max-w-[80px] border-b border-l border-base-300 shadow-[-3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-3px_0_8px_-2px_rgba(0,0,0,0.4)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalaries.map((item, idx) => {
                      const basic = Number(item.basicSalary || 0);
                      const hra = Number(item.hra || 0);
                      const flexi = Number(item.flexi || 0);
                      const bonus = Number(item.bonus || 0);
                      const gratuity = Number(item.gratuity || 0);
                      const variablePay = Number(item.variablePay || 0);
                      const gross = Number(item.gross || 0) || (basic + hra + flexi + bonus);
                      const rowEarnings = gross + gratuity + variablePay;
                      const erPf = Number(item.erPf || 0);
                      const taxes = Number(item.taxes || 0);
                      const deductions = erPf + taxes;
                      const inHand = Number(item.inHand || 0) || (gross - deductions);
                      const ctc = Number(item.ctc || 0) || (rowEarnings + erPf);

                      return (
                        <tr key={item.id || item._id} className="group hover:bg-base-200/40 transition-colors">
                          <td className="sticky left-0 z-10 bg-base-100 group-hover:bg-base-200 py-3.5 px-4 text-center font-mono text-base-content/50 w-12 min-w-[48px] max-w-[48px] border-b border-base-200/60 transition-colors">
                            {idx + 1}
                          </td>
                          <td className="sticky left-[48px] z-10 bg-base-100 group-hover:bg-base-200 py-3.5 px-4 whitespace-nowrap font-bold text-base-content min-w-[130px] max-w-[130px] border-b border-base-200/60 transition-colors">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-primary shrink-0" />
                              <span>{dayjs(item.month).format("MMM YYYY")}</span>
                            </div>
                          </td>
                          <td
                            className="sticky left-[178px] z-10 bg-base-100 group-hover:bg-base-200 py-3.5 px-4 whitespace-nowrap font-bold text-base-content opacity-100 min-w-[200px] max-w-[220px] border-b border-r border-base-200/80 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_8px_-2px_rgba(0,0,0,0.4)] transition-colors"
                            style={{ opacity: 1 }}
                          >
                            <div className="flex items-center gap-2">
                              <CompanyLogo name={item.company} size="w-6 h-6" type="company" />
                              <span className="font-bold text-base-content opacity-100 truncate max-w-[150px]" style={{ opacity: 1 }} title={item.company}>
                                {item.company}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-primary bg-primary/5 whitespace-nowrap border-b border-base-200/60">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSalaryBreakdownModal({
                                    type: "earnings",
                                    title: "Earnings Breakdown",
                                    month: dayjs(item.month).format("MMMM YYYY"),
                                    company: item.company,
                                    items: [
                                      { label: "Basic Salary", value: basic, note: "Core base pay" },
                                      { label: "HRA", value: hra, note: "House Rent Allowance" },
                                      { label: "Flexi / RSA / Extras", value: flexi, note: "Flexible benefits allowance" },
                                      { label: "Bonus", value: bonus, note: "Performance or festive bonus", highlight: bonus > 0 },
                                      { label: "Gratuity", value: gratuity, note: "Gratuity component" },
                                      { label: "Variable Pay", value: variablePay, note: "Variable performance incentive" },
                                    ],
                                    totalLabel: "Total Earnings",
                                    totalValue: rowEarnings,
                                    bottomNote: `Gross Cash: ₹${gross.toLocaleString("en-IN")} + Benefits: ₹${(gratuity + variablePay).toLocaleString("en-IN")}`,
                                  })
                                }
                                className="btn btn-ghost btn-circle btn-xs text-primary/70 hover:text-primary hover:bg-primary/20 cursor-pointer p-0 w-5 h-5 min-h-0"
                                title="Click to view Earnings breakdown"
                              >
                                <Info size={13} />
                              </button>
                              <span className="text-sm">₹{rowEarnings.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="text-[10px] text-base-content/50 font-sans font-normal">
                              Gross + Gratuity + Var Pay
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-error bg-error/5 whitespace-nowrap border-b border-base-200/60">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSalaryBreakdownModal({
                                    type: "deductions",
                                    title: "Deductions Breakdown",
                                    month: dayjs(item.month).format("MMMM YYYY"),
                                    company: item.company,
                                    items: [
                                      { label: "Employer PF (E6r PF)", value: erPf, note: "Provident Fund deduction" },
                                      { label: "Tax + Others", value: taxes, note: "Income Tax, Professional Tax & others" },
                                    ],
                                    totalLabel: "Total Deductions",
                                    totalValue: deductions,
                                    bottomNote: `Net In Hand: ₹${inHand.toLocaleString("en-IN")} (Gross ₹${gross.toLocaleString("en-IN")} − Deductions ₹${deductions.toLocaleString("en-IN")})`,
                                  })
                                }
                                className="btn btn-ghost btn-circle btn-xs text-error/70 hover:text-error hover:bg-error/20 cursor-pointer p-0 w-5 h-5 min-h-0"
                                title="Click to view Deductions breakdown"
                              >
                                <Info size={13} />
                              </button>
                              <span className="text-sm">-₹{deductions.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="text-[10px] text-base-content/50 font-sans font-normal">
                              PF: ₹{erPf.toLocaleString("en-IN")} + Tax: ₹{taxes.toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-success bg-success/15 whitespace-nowrap border-b border-base-200/60">
                            <div className="text-sm">₹{inHand.toLocaleString("en-IN")}</div>
                            <div className="text-[10px] text-success/80 font-sans font-normal">
                              Net Take-Home
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-base-content whitespace-nowrap border-b border-base-200/60">
                            <div className="text-sm">₹{ctc.toLocaleString("en-IN")}</div>
                            <div className="text-[10px] text-base-content/50 font-sans font-normal">
                              Earnings + E6r PF
                            </div>
                          </td>
                          <td className="sticky right-0 z-10 bg-base-100 group-hover:bg-base-200 py-3.5 px-4 text-center whitespace-nowrap min-w-[80px] max-w-[80px] border-b border-l border-base-200/80 shadow-[-3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-3px_0_8px_-2px_rgba(0,0,0,0.4)] transition-colors">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditSalary(item)}
                                className="btn btn-ghost btn-xs btn-circle text-base-content/70 hover:text-primary hover:bg-primary/10 cursor-pointer"
                                title="Edit Salary"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSalary(item.id || item._id)}
                                className="btn btn-ghost btn-xs btn-circle text-base-content/70 hover:text-error hover:bg-error/10 cursor-pointer"
                                title="Delete Salary"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals Summary Footer */}
                  <tfoot className="bg-base-200/90 text-xs font-bold">
                    <tr>
                      <td
                        colSpan={3}
                        className="sticky left-0 z-20 bg-base-200 py-3.5 px-4 font-extrabold text-base-content uppercase tracking-wider border-t-2 border-r border-base-300 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_8px_-2px_rgba(0,0,0,0.4)]"
                      >
                        Totals ({salarySummary.count} {salarySummary.count === 1 ? "Entry" : "Entries"})
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-primary bg-primary/10 border-t-2 border-base-300 text-sm">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSalaryBreakdownModal({
                                type: "earnings",
                                title: "Total Earnings Breakdown",
                                month: "All Filtered Months",
                                company: salaryCompanyFilter === "all" ? "All Companies" : salaryCompanyFilter,
                                items: [
                                  { label: "Total Basic Salary", value: salarySummary.totalBasic, note: "Base pay across entries" },
                                  { label: "Total HRA", value: salarySummary.totalHra, note: "House rent allowance across entries" },
                                  { label: "Total Flexi / RSA / Extras", value: salarySummary.totalFlexi, note: "Flexi benefits across entries" },
                                  { label: "Total Bonus", value: salarySummary.totalBonus, note: "Bonus across entries", highlight: salarySummary.totalBonus > 0 },
                                  { label: "Total Gratuity", value: salarySummary.totalGratuity, note: "Gratuity across entries" },
                                  { label: "Total Variable Pay", value: salarySummary.totalVarPay, note: "Variable pay across entries" },
                                ],
                                totalLabel: "Grand Total Earnings",
                                totalValue: salarySummary.totalEarnings,
                                bottomNote: `Aggregated across ${salarySummary.count} ${salarySummary.count === 1 ? "entry" : "entries"}`,
                              })
                            }
                            className="btn btn-ghost btn-circle btn-xs text-primary hover:bg-primary/20 cursor-pointer p-0 w-5 h-5 min-h-0"
                            title="Click to view Total Earnings breakdown"
                          >
                            <Info size={13} />
                          </button>
                          <span>₹{salarySummary.totalEarnings.toLocaleString("en-IN")}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-error bg-error/10 border-t-2 border-base-300 text-sm">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSalaryBreakdownModal({
                                type: "deductions",
                                title: "Total Deductions Breakdown",
                                month: "All Filtered Months",
                                company: salaryCompanyFilter === "all" ? "All Companies" : salaryCompanyFilter,
                                items: [
                                  { label: "Total Employer PF (E6r PF)", value: salarySummary.totalErPf, note: "PF contribution across entries" },
                                  { label: "Total Tax + Others", value: salarySummary.totalTaxes, note: "Taxes across entries" },
                                ],
                                totalLabel: "Grand Total Deductions",
                                totalValue: salarySummary.totalErPf + salarySummary.totalTaxes,
                                bottomNote: `Aggregated across ${salarySummary.count} ${salarySummary.count === 1 ? "entry" : "entries"}`,
                              })
                            }
                            className="btn btn-ghost btn-circle btn-xs text-error hover:bg-error/20 cursor-pointer p-0 w-5 h-5 min-h-0"
                            title="Click to view Total Deductions breakdown"
                          >
                            <Info size={13} />
                          </button>
                          <span>-₹{(salarySummary.totalErPf + salarySummary.totalTaxes).toLocaleString("en-IN")}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-success bg-success/20 text-sm border-t-2 border-base-300">
                        ₹{salarySummary.totalInHand.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-base-content border-t-2 border-base-300 text-sm">
                        ₹{salarySummary.totalCtc.toLocaleString("en-IN")}
                      </td>
                      <td className="sticky right-0 z-20 bg-base-200 py-3.5 px-4 border-t-2 border-l border-base-300 shadow-[-3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-3px_0_8px_-2px_rgba(0,0,0,0.4)]"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PF TAB VIEW (activeTab === "pf") - AUTO-SYNCED WITH SALARY         */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "pf" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                  Available Balance
                </span>
                <span className="badge badge-success badge-xs font-semibold py-1">
                  Active
                </span>
              </div>
              <div className="text-xl font-black text-success truncate">
                ₹{availablePfBalance.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                Total Deposited − Withdrawn
              </span>
            </div>

            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                Total Deposited
              </span>
              <div className="text-xl font-black text-primary truncate">
                ₹{pfSummary.grandTotal.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                Employer + Employee Total
              </span>
            </div>

            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                  Withdrawal Amt
                </span>
                {totalPfWithdrawn > 0 && (
                  <span className="badge badge-warning badge-xs font-semibold py-1">
                    {pfWithdrawals.length} {pfWithdrawals.length === 1 ? "Txn" : "Txns"}
                  </span>
                )}
              </div>
              <div className="text-xl font-black text-amber-500 truncate">
                ₹{totalPfWithdrawn.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                Total Withdrawn Amount
              </span>
            </div>

            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                Total Employer Share
              </span>
              <div className="text-xl font-black text-info truncate">
                ₹{pfSummary.totalEmployerShare.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                E6r PF Contributions
              </span>
            </div>

            <div className="bg-base-100 p-4 rounded-3xl border border-base-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block">
                Total Employee Share
              </span>
              <div className="text-xl font-black text-secondary truncate">
                ₹{pfSummary.totalEmployeeShare.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-base-content/50 block">
                E6e PF Contributions
              </span>
            </div>
          </div>

          {/* Sub-Tab 1: Deposited (Contributions) */}
          {pfSubTab === "deposits" && (
            <>
              {salaryData.length === 0 ? (
                <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center gap-4">
                    <div className="p-4 bg-primary/10 text-primary rounded-3xl">
                      <Percent size={40} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-base-content">
                        No PF Records Yet
                      </h3>
                      <p className="text-xs text-base-content/60 mt-1">
                        PF contributions are automatically tracked and synchronized whenever you enter your monthly Salary slip.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddSalaryModal}
                      className="btn btn-primary btn-sm rounded-xl gap-2 font-bold px-5 cursor-pointer shadow-md"
                    >
                      <Plus size={16} />
                      <span>Add First Salary Entry</span>
                    </button>
                  </div>
                </div>
              ) : filteredPf.length === 0 ? (
                <div className="bg-base-100 p-10 rounded-3xl border border-base-200 shadow-sm text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                      <Search size={32} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-base-content">
                        No Matching PF Records Found
                      </h3>
                      <p className="text-xs text-base-content/60 mt-1">
                        No records matched your search query or filters.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPfSearchTerm("");
                        setPfCompanyFilter("all");
                        setPfYearFilter("all");
                      }}
                      className="btn btn-ghost btn-xs text-primary font-bold hover:bg-primary/10 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto max-w-full">
                    <table className="table table-sm w-full text-xs">
                      <thead className="bg-base-200/80 text-base-content/80 text-[11px] font-bold uppercase tracking-wider border-b border-base-300">
                        <tr>
                          <th className="py-3 px-4 text-center w-14">#</th>
                          <th className="py-3 px-4 min-w-[150px]">Month</th>
                          <th className="py-3 px-4 min-w-[200px]">Company Name</th>
                          <th className="py-3 px-4 text-right min-w-[150px] text-primary">Employer Share</th>
                          <th className="py-3 px-4 text-right min-w-[150px] text-secondary">Employee Share</th>
                          <th className="py-3 px-4 text-right min-w-[160px] bg-success/10 text-success font-black">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-base-200/60">
                        {filteredPf.map((item, idx) => {
                          const er = Number(item.erPf || 0);
                          const ee =
                            item.eePf !== undefined && item.eePf !== null && item.eePf !== ""
                              ? Number(item.eePf) || 0
                              : er;
                          const total = er + ee;

                          return (
                            <tr key={item.id || item._id || idx} className="hover:bg-base-200/40 transition-colors">
                              <td className="py-3.5 px-4 text-center font-mono text-base-content/50">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap font-bold text-base-content">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-primary shrink-0" />
                                  <span>{dayjs(item.month).format("MMMM YYYY")}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap font-bold text-base-content opacity-100" style={{ opacity: 1 }}>
                                <div className="flex items-center gap-2">
                                  <CompanyLogo name={item.company} size="w-6 h-6" type="company" />
                                  <span className="font-bold text-base-content opacity-100 truncate max-w-[170px]" style={{ opacity: 1 }} title={item.company}>
                                    {item.company}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-medium text-base-content/90 whitespace-nowrap">
                                ₹{er.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-medium text-base-content/90 whitespace-nowrap">
                                ₹{ee.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-black text-success bg-success/5 whitespace-nowrap">
                                ₹{total.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-base-200/70 border-t-2 border-base-300 font-bold text-base-content">
                        <tr>
                          <td colSpan={3} className="py-3.5 px-4 text-left font-bold text-base-content uppercase tracking-wider text-[11px]">
                            Total ({filteredPf.length} {filteredPf.length === 1 ? "Month" : "Months"})
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-primary">
                            ₹{pfSummary.totalEmployerShare.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-secondary">
                            ₹{pfSummary.totalEmployeeShare.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-success bg-success/10">
                            ₹{pfSummary.grandTotal.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Sub-Tab 2: Withdrawal */}
          {pfSubTab === "withdrawals" && (
            <>
              {loadingPfWithdrawals ? (
                <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center flex flex-col items-center justify-center gap-3">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                  <span className="text-xs text-base-content/60">Loading withdrawals...</span>
                </div>
              ) : pfWithdrawals.length === 0 ? (
                <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center gap-4">
                    <div className="p-4 bg-amber-500/10 text-amber-500 rounded-3xl">
                      <ArrowUpRight size={40} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-base-content">
                        No PF Withdrawals Recorded
                      </h3>
                      <p className="text-xs text-base-content/60 mt-1">
                        You have not recorded any withdrawals from your Provident Fund balance yet. You can withdraw up to your available balance (₹{availablePfBalance.toLocaleString("en-IN")}).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPfWithdrawal(null);
                        setIsAddPfWithdrawalModalOpen(true);
                      }}
                      disabled={availablePfBalance <= 0}
                      className="btn btn-primary btn-sm rounded-xl gap-2 font-bold px-5 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Plus size={16} />
                      <span>Withdraw Money</span>
                    </button>
                  </div>
                </div>
              ) : filteredPfWithdrawals.length === 0 ? (
                <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                    <Search size={32} className="text-base-content/30" />
                    <h3 className="text-base font-bold text-base-content">No Matching Withdrawals</h3>
                    <p className="text-xs text-base-content/60">
                      No withdrawal records found matching "{pfSearchTerm}".
                    </p>
                    <button
                      type="button"
                      onClick={() => setPfSearchTerm("")}
                      className="btn btn-sm btn-ghost text-primary font-bold rounded-xl cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto max-w-full">
                    <table className="table table-sm w-full text-xs">
                      <thead className="bg-base-200/80 text-base-content/80 text-[11px] font-bold uppercase tracking-wider border-b border-base-300">
                        <tr>
                          <th className="py-3 px-4 text-center w-14">#</th>
                          <th className="py-3 px-4 min-w-[140px]">Withdrawal Date</th>
                          <th className="py-3 px-4 text-right min-w-[160px] text-amber-500 font-bold">Amount Withdrawn</th>
                          <th className="py-3 px-4 min-w-[180px]">Reason</th>
                          <th className="py-3 px-4 min-w-[220px]">Notes / Remarks</th>
                          <th className="py-3 px-4 text-center min-w-[100px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-base-200/60">
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
                              ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="badge badge-sm bg-base-200 font-semibold text-base-content/80 border-base-300">
                                {item.reason || "General"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-base-content/70 max-w-xs truncate">
                              {item.notes || "—"}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPfWithdrawal(item);
                                    setIsAddPfWithdrawalModalOpen(true);
                                  }}
                                  className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary hover:bg-primary/10"
                                  title="Edit PF Withdrawal"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePfWithdrawal(item.id || item._id)}
                                  className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-error hover:bg-error/10"
                                  title="Delete PF Withdrawal"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-base-200/70 border-t-2 border-base-300 font-bold text-base-content">
                        <tr>
                          <td colSpan={2} className="py-3.5 px-4 text-left font-bold text-base-content uppercase tracking-wider text-[11px]">
                            Total Withdrawn ({filteredPfWithdrawals.length} {filteredPfWithdrawals.length === 1 ? "Record" : "Records"})
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-amber-500 bg-amber-500/10">
                            ₹{filteredPfWithdrawals.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString("en-IN")}
                          </td>
                          <td colSpan={3} className="py-3.5 px-4 text-xs text-base-content/60 font-normal">
                            Remaining Available Balance: <strong className="font-mono text-success font-bold">₹{availablePfBalance.toLocaleString("en-IN")}</strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* OTHER TABS PLACEHOLDERS (Emergency Fund)                           */}
      {/* ------------------------------------------------------------------ */}
      {activeTab !== "stocks" && activeTab !== "mf" && activeTab !== "fd" && activeTab !== "rd" && activeTab !== "salary" && activeTab !== "pf" && (
        <div className="bg-base-100 p-12 rounded-3xl border border-base-200 shadow-sm text-center animate-in fade-in duration-300">
          <div className="max-w-md mx-auto flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-3xl">
              {activeTab === "ef" && <ShieldAlert size={36} />}
            </div>

            <div>
              <h2 className="text-xl font-bold text-base-content">
                {categories.find((c) => c.id === activeTab)?.label} Tracking
              </h2>
              <p className="text-xs text-base-content/70 mt-1">
                Configure your {categories.find((c) => c.id === activeTab)?.subLabel}{" "}
                entries, calculations, and maturity schedules.
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
        groups={mfGroups}
      />

      {/* Custom MF Groups & Ordering Modal */}
      <OrganizeMfGroupsModal
        isOpen={isOrganizeModalOpen}
        onClose={() => setIsOrganizeModalOpen(false)}
        funds={mfData}
        groups={mfGroups}
        onSaveGroups={handleSaveGroups}
      />

      {/* Add / Edit Fixed Deposit Modal */}
      <AddFixedDepositModal
        isOpen={isAddFdModalOpen}
        onClose={() => setIsAddFdModalOpen(false)}
        onSave={handleSaveFixedDeposit}
        initialData={editingFd}
      />

      {/* Single Settlement (Withdraw / Liquidate) Modal */}
      <WithdrawFdModal
        isOpen={!!withdrawingFd}
        onClose={() => setWithdrawingFd(null)}
        fd={withdrawingFd}
        onSaveSettlement={handleSaveFdSettlement}
      />

      {/* Fixed Deposit Detailed Info Modal */}
      <FixedDepositInfoModal
        isOpen={!!viewingInfoFd}
        onClose={() => setViewingInfoFd(null)}
        fd={viewingInfoFd}
      />

      {/* Custom FD Groups & Ordering Modal */}
      <OrganizeFdGroupsModal
        isOpen={isOrganizeFdModalOpen}
        onClose={() => setIsOrganizeFdModalOpen(false)}
        fds={fdData}
        groups={fdGroups}
        onSaveGroups={handleSaveFdGroups}
      />

      {/* Add / Edit Recurring Deposit Modal */}
      <AddRecurringDepositModal
        isOpen={isAddRdModalOpen}
        onClose={() => setIsAddRdModalOpen(false)}
        onSave={handleSaveRecurringDeposit}
        editingRd={editingRd}
      />

      {/* Single Settlement (Withdraw / Liquidate) Modal for RD */}
      <WithdrawRdModal
        isOpen={!!withdrawingRd}
        onClose={() => setWithdrawingRd(null)}
        rd={withdrawingRd}
        onSaveSettlement={handleSaveRdSettlement}
      />

      {/* Custom RD Groups & Ordering Modal */}
      <OrganizeRdGroupsModal
        isOpen={isOrganizeRdModalOpen}
        onClose={() => setIsOrganizeRdModalOpen(false)}
        rds={rdData}
        groups={rdGroups}
        onSaveGroups={handleSaveRdGroups}
      />

      {/* Add / Edit RD Deposit Installment Modal */}
      <AddRdDepositModal
        isOpen={isAddRdDepositModalOpen}
        onClose={() => {
          setIsAddRdDepositModalOpen(false);
          setEditingRdTxn(null);
        }}
        rd={
          rdData.find(
            (r) => (r.id || r._id) === (activeRdForDeposit?.id || activeRdForDeposit?._id)
          ) || activeRdForDeposit
        }
        initialTxn={editingRdTxn}
        onSave={handleSaveRdDeposit}
      />

      {/* RD Deposits Table Modal */}
      <RecurringDepositTableModal
        isOpen={isRdTableModalOpen}
        onClose={() => {
          setIsRdTableModalOpen(false);
          setViewingTableRd(null);
        }}
        rd={viewingTableRd}
        hideNumbers={hideRdNumbers}
        onOpenAddDeposit={(rd) => handleOpenAddRdDeposit(rd)}
        onOpenEditDeposit={(rd, txn) => handleOpenAddRdDeposit(rd, txn)}
        onDeleteDeposit={handleDeleteRdDeposit}
        onSaveInlineDeposit={(payload, txnId) => handleSaveRdDeposit(payload, txnId)}
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
      {isTableModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
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
                              <td className="px-3 py-2.5 border-r-2 border-base-200 text-left font-bold text-base-content whitespace-nowrap max-w-[210px] sticky left-[65px] z-30 bg-base-100 dark:bg-base-200 shadow-md">
                                <div className="flex items-center gap-2">
                                  <CompanyLogo name={row.name} size="w-6 h-6" type="stock" />
                                  <span
                                    className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-extrabold mr-1 truncate max-w-[130px] inline-block align-middle relative z-10"
                                    title={row.name}
                                  >
                                    {row.name}
                                  </span>
                                </div>
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
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-base-200 text-base-content/80 border border-base-300 text-[10px] font-semibold">
                                  <CompanyLogo name={row.platform} size="w-4 h-4" rounded="rounded-sm" type="platform" />
                                  <span>{row.platform}</span>
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
        </div>,
        document.body
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Column Customization Modal Popup                                  */}
      {/* ------------------------------------------------------------------ */}
      {isColumnModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[9999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
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
        </div>,
        document.body
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Mutual Fund Transactions Table Modal Popup                        */}
      {/* ------------------------------------------------------------------ */}
      {viewingMfFund && (
        <MutualFundTableModal
          fund={viewingMfFund}
          summary={getMfDetailedSummary(viewingMfFund)}
          isOpen={Boolean(viewingMfFund)}
          defaultViewMode={mfTableViewMode}
          onClose={() => setViewingMfTableFundId(null)}
          onOpenAddSip={(fund, mode) =>
            handleOpenAddSipModal(fund, mode || "deposit")
          }
          onOpenAddWithdrawal={(fund) => handleOpenAddWithdrawalModal(fund)}
          onOpenEditSip={(fund, txn) => handleOpenEditSipModal(fund, txn)}
          onDeleteSipTxn={handleDeleteSipTxn}
          getFundTransactionsByYear={getFundTransactionsByYear}
          sipSortBy={sipSortBy}
          sipSortOrder={sipSortOrder}
          handleSipSort={handleSipSort}
          collapsedMfYearKeys={collapsedMfYearKeys}
          toggleMfYearCollapse={toggleMfYearCollapse}
          toggleAllMfYearsCollapse={toggleAllMfYearsCollapse}
          inlineAddingMfId={inlineAddingMfId}
          setInlineAddingMfId={setInlineAddingMfId}
          inlineTxnData={inlineTxnData}
          setInlineTxnData={setInlineTxnData}
          saveInlineSipTxn={saveInlineSipTxn}
          editingTxnKey={editingTxnKey}
          setEditingTxnKey={setEditingTxnKey}
          editTxnData={editTxnData}
          setEditTxnData={setEditTxnData}
          saveEditSipTxn={saveEditSipTxn}
        />
      )}

      {/* Mutual Fund Detailed Insights Info Modal (Deposited, Withdrawn & Cumulative) */}
      {viewingInfoMfFund && (
        <MutualFundInfoModal
          fund={viewingInfoMfFund}
          isOpen={Boolean(viewingInfoMfFund)}
          onClose={() => setViewingInfoMfFund(null)}
        />
      )}

      {/* Add / Edit SIP / Withdrawal Transaction Popup Modal */}
      <AddSipTransactionModal
        isOpen={isSipModalOpen}
        mode={sipModalMode}
        onClose={() => setIsSipModalOpen(false)}
        onSave={handleSaveSipModalTxn}
        fund={activeSipFund}
        initialTxn={editingSipTxn}
      />

      {/* Add / Edit Monthly Salary Record Popup Modal */}
      <AddSalaryModal
        isOpen={isAddSalaryModalOpen}
        onClose={() => {
          setIsAddSalaryModalOpen(false);
          setEditingSalary(null);
        }}
        onSave={handleSaveSalary}
        initialData={editingSalary}
        lastSalaryEntry={latestSalaryEntry}
      />

      {/* Add / Edit PF Withdrawal Modal */}
      <AddPfWithdrawalModal
        isOpen={isAddPfWithdrawalModalOpen}
        onClose={() => {
          setIsAddPfWithdrawalModalOpen(false);
          setEditingPfWithdrawal(null);
        }}
        onSaveWithdrawal={handleSavePfWithdrawal}
        initialData={editingPfWithdrawal}
        availableBalance={availablePfBalance}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Salary Breakdown Modal Popup (Earnings & Deductions View)          */}
      {/* ------------------------------------------------------------------ */}
      {salaryBreakdownModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 w-screen h-screen z-[9999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSalaryBreakdownModal(null)}
        >
          <div
            className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-base-200">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-2xl ${
                    salaryBreakdownModal.type === "earnings"
                      ? "bg-primary/10 text-primary"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {salaryBreakdownModal.type === "earnings" ? (
                    <TrendingUp size={20} />
                  ) : (
                    <Percent size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-base-content leading-tight">
                    {salaryBreakdownModal.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-base-content/60 mt-0.5 font-medium">
                    <span className="text-base-content font-bold">{salaryBreakdownModal.company}</span>
                    <span>•</span>
                    <span>{salaryBreakdownModal.month}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content cursor-pointer"
                onClick={() => setSalaryBreakdownModal(null)}
              >
                ✕
              </button>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider px-1">
                Component Breakdown
              </div>
              <div className="divide-y divide-base-200 bg-base-200/40 rounded-2xl p-2 border border-base-200">
                {salaryBreakdownModal.items.map((it, idx) => {
                  const pct =
                    salaryBreakdownModal.totalValue > 0
                      ? ((it.value / salaryBreakdownModal.totalValue) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <div
                      key={idx}
                      className="py-2.5 px-3 flex items-center justify-between gap-3 text-xs hover:bg-base-200/70 rounded-xl transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-base-content">{it.label}</span>
                          {it.highlight && (
                            <span className="badge badge-xs badge-success text-[9px] font-bold">
                              Bonus
                            </span>
                          )}
                        </div>
                        {it.note && (
                          <div className="text-[10px] text-base-content/50 truncate">
                            {it.note}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`font-mono font-bold text-sm ${
                            salaryBreakdownModal.type === "earnings"
                              ? "text-primary"
                              : "text-error"
                          }`}
                        >
                          ₹{it.value.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-base-content/50 font-mono">
                          {pct}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Highlight Card */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-xs ${
                salaryBreakdownModal.type === "earnings"
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-error/10 border-error/20 text-error"
              }`}
            >
              <div>
                <span className="text-[11px] uppercase font-extrabold tracking-wider block opacity-75">
                  {salaryBreakdownModal.totalLabel}
                </span>
                {salaryBreakdownModal.bottomNote && (
                  <span className="text-[10px] opacity-80 font-normal block mt-0.5">
                    {salaryBreakdownModal.bottomNote}
                  </span>
                )}
              </div>
              <div className="text-lg sm:text-xl font-black font-mono">
                {salaryBreakdownModal.type === "deductions" ? "-" : ""}₹
                {salaryBreakdownModal.totalValue.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Footer Close Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setSalaryBreakdownModal(null)}
                className="btn btn-sm btn-ghost w-full rounded-xl text-base-content/70 hover:text-base-content cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
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
