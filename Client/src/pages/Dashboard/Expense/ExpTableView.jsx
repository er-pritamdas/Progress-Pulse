import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchDashboardData, setMonth, copyCategoriesFromLastMonth } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import HeaderSection from "../../../components/Expense/HeaderSection";
import CategoryCard from "../../../components/Expense/CategoryCard";
import AddCategoryModal from "../../../components/Expense/AddCategoryModal";
import ReorderCategoriesModal from "../../../components/Expense/ReorderCategoriesModal";
import { Plus, ChevronLeft, ChevronRight, RefreshCw, FolderPlus, ArrowUpDown, ChevronDown, Calendar, Sparkles, Layers, Eye, EyeOff } from "lucide-react";
import { message } from "antd";

// This view contains the Expense Dashboard UI
const ExpTableView = () => {
  const dispatch = useDispatch();
  const { categories, loading, error, currentMonth } = useSelector((state) => state.expense);
  const { user } = useAuth();

  const [initialLoading, setInitialLoading] = useState(true);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [isAllCollapsed, setIsAllCollapsed] = useState(false);

  // Privacy State (synced with localStorage & across views)
  const [hideNumbers, setHideNumbers] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_hide_numbers");
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handleHideSync = () => {
      try {
        const saved = localStorage.getItem("expense_hide_numbers");
        setHideNumbers(saved ? JSON.parse(saved) : false);
      } catch (e) {}
    };
    window.addEventListener("expense_hide_numbers_updated", handleHideSync);
    return () => window.removeEventListener("expense_hide_numbers_updated", handleHideSync);
  }, []);

  const toggleHideNumbers = () => {
    const nextVal = !hideNumbers;
    setHideNumbers(nextVal);
    try {
      localStorage.setItem("expense_hide_numbers", JSON.stringify(nextVal));
      window.dispatchEvent(new Event("expense_hide_numbers_updated"));
    } catch (e) {}
  };

  // Mobile Month Picker Popover State
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => dayjs(currentMonth).year());
  const monthPickerRef = useRef(null);

  useEffect(() => {
    setPickerYear(dayjs(currentMonth).year());
  }, [currentMonth]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) {
        setIsMonthPickerOpen(false);
      }
    };
    if (isMonthPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMonthPickerOpen]);

  // Always default to current month on page mount
  useEffect(() => {
    const actualCurrentMonth = dayjs().format("YYYY-MM");
    if (currentMonth !== actualCurrentMonth) {
      dispatch(setMonth(actualCurrentMonth));
    }
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);
    const promise = dispatch(fetchDashboardData(currentMonth));
    if (promise && typeof promise.finally === "function") {
      promise.finally(() => {
        if (isMounted) setInitialLoading(false);
      });
    } else {
      setInitialLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [currentMonth, user, dispatch]);

  const isDataLoading = loading || initialLoading;
  const monthCategories = categories.filter(c => !c.month || c.month === currentMonth);

  return (
    <div className="w-full space-y-3.5 md:space-y-6 pb-20">
      {/* Desktop Sticky Header */}
      <div className="hidden md:block sticky top-[-17px] z-40 bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/40 -mx-4 px-4 py-2 mt-[-16px]">
        <div className="flex items-center justify-between p-3 flex-wrap gap-3 max-w-[1600px] mx-auto px-4 md:px-6">
          <h1 className="text-lg font-bold text-base-content/90 flex items-center gap-2">
            <span className="text-primary font-extrabold">Expense</span> Budgeting
          </h1>

          <div className="flex items-center gap-2 bg-base-200/60 p-1 rounded-xl border border-base-300/40">
            <button
              onClick={() => dispatch(setMonth(dayjs(currentMonth).subtract(1, 'month').format("YYYY-MM")))}
              className="btn btn-xs btn-ghost btn-square"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-bold font-mono min-w-[110px] text-center">
              {dayjs(currentMonth).format("MMMM YYYY")}
            </span>

            <button
              onClick={() => dispatch(setMonth(dayjs(currentMonth).add(1, 'month').format("YYYY-MM")))}
              className="btn btn-xs btn-ghost btn-square"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>

            <div className="w-[1px] h-4 bg-base-300 mx-0.5" />

            <button
              type="button"
              onClick={toggleHideNumbers}
              className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/60 hover:text-primary cursor-pointer"
              title={hideNumbers ? "Show numbers" : "Hide all numbers (Privacy Mode)"}
            >
              {hideNumbers ? <EyeOff size={15} className="text-primary font-bold" /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-Only Sticky Glass Header Section (Mirrored from ExpenseTable, No Search Bar) */}
      <div className="md:hidden sticky top-[-17px] -mt-4 pt-4 z-40 bg-base-100/90 dark:bg-base-900/90 backdrop-blur-2xl border-b border-base-200/80 shadow-md transition-all">
        <div className="flex flex-col gap-2 p-3 bg-base-100/40 dark:bg-base-900/40">
          {/* Upper Header Row: Month Selector on Left, Quick Actions on Right */}
          <div className="flex items-center justify-between">
            {/* Month Selector */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => dispatch(setMonth(dayjs(currentMonth).subtract(1, 'month').format("YYYY-MM")))}
                className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/70 hover:text-primary cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPickerYear(dayjs(currentMonth).year());
                  setIsMonthPickerOpen((prev) => !prev);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-xl hover:bg-base-200 text-base-content font-sans text-sm sm:text-base font-extrabold tracking-tight cursor-pointer"
              >
                <span>{dayjs(currentMonth).format("MMM YYYY")}</span>
                <ChevronDown size={13} className={`text-primary/70 transition-transform ${isMonthPickerOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => dispatch(setMonth(dayjs(currentMonth).add(1, 'month').format("YYYY-MM")))}
                className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/70 hover:text-primary cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={toggleHideNumbers}
                className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/60 hover:text-primary cursor-pointer ml-0.5"
                title={hideNumbers ? "Show numbers" : "Hide all numbers (Privacy Mode)"}
              >
                {hideNumbers ? <EyeOff size={14} className="text-primary font-bold" /> : <Eye size={14} />}
              </button>
            </div>

            {/* Right Tools & Add Button */}
            <div className="flex items-center gap-1.5">
              {/* Collapse / Expand All Subcategories Button */}
              <button
                type="button"
                onClick={() => setIsAllCollapsed(prev => !prev)}
                className="btn btn-xs btn-square h-7.5 w-7.5 rounded-xl bg-base-200/70 hover:bg-base-200 border border-base-300 text-base-content/70 cursor-pointer shrink-0"
                title={isAllCollapsed ? "Expand All Subcategories" : "Collapse All Subcategories"}
              >
                <Layers size={14} className={isAllCollapsed ? "text-base-content/60" : "text-primary"} />
              </button>

              {/* Reorder Categories */}
              {monthCategories.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowReorderModal(true)}
                  className="btn btn-xs btn-square h-7.5 w-7.5 rounded-xl bg-base-200/70 hover:bg-base-200 border border-base-300 text-base-content/70 cursor-pointer shrink-0"
                  title="Reorder Categories"
                >
                  <ArrowUpDown size={13} />
                </button>
              )}

              {/* Add Category Button */}
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="btn btn-primary btn-xs rounded-xl font-bold gap-1 text-primary-content h-7.5 px-3 shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Month Picker Popover for Mobile */}
          {isMonthPickerOpen && (
            <div ref={monthPickerRef} className="w-full bg-base-100 rounded-2xl shadow-2xl border border-base-300 p-3 mt-1 animate-in fade-in zoom-in-95 duration-150">
              {/* Year Selector with Side Arrows */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-200">
                <button
                  type="button"
                  onClick={() => setPickerYear((y) => y - 1)}
                  className="btn btn-xs btn-ghost btn-square rounded-lg hover:bg-base-200 text-base-content/70 hover:text-primary cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="font-mono font-extrabold text-sm text-base-content tracking-wider">
                  {pickerYear}
                </span>
                <button
                  type="button"
                  onClick={() => setPickerYear((y) => y + 1)}
                  className="btn btn-xs btn-ghost btn-square rounded-lg hover:bg-base-200 text-base-content/70 hover:text-primary cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthDate = dayjs().year(pickerYear).month(i);
                  const monthKey = monthDate.format("YYYY-MM");
                  const isSelected = currentMonth === monthKey;
                  const isCurrentActualMonth = dayjs().format("YYYY-MM") === monthKey;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        dispatch(setMonth(monthKey));
                        setIsMonthPickerOpen(false);
                      }}
                      className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-content shadow-xs font-extrabold"
                          : isCurrentActualMonth
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "hover:bg-base-200 text-base-content/80"
                      }`}
                    >
                      {monthDate.format("MMM")}
                    </button>
                  );
                })}
              </div>

              {/* Jump to Current Month */}
              <button
                type="button"
                onClick={() => {
                  const nowStr = dayjs().format("YYYY-MM");
                  dispatch(setMonth(nowStr));
                  setPickerYear(dayjs().year());
                  setIsMonthPickerOpen(false);
                }}
                className="mt-2.5 w-full btn btn-xs btn-ghost border border-base-200 text-[11px] font-medium"
              >
                Jump to This Month
              </button>
            </div>
          )}
        </div>
      </div>

      {error && !isDataLoading && (
        <div className="px-2 md:px-6 w-full max-w-[1600px] mx-auto">
          <div className="alert alert-error shadow-lg py-2.5">
            <span className="text-xs md:text-sm">{typeof error === "string" ? error : "Failed to load expense data. Please try again."}</span>
          </div>
        </div>
      )}

      {isDataLoading ? (
        <div className="h-96 flex items-center justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="px-0 sm:px-2 md:px-6 w-full max-w-[1600px] mx-auto space-y-3 md:space-y-6">

          {/* Stats Header */}
          <section className="px-2 sm:px-0">
            <HeaderSection />
          </section>

          {/* Desktop Separator / Title */}
          <div className="hidden md:flex items-center justify-between pb-2 border-b border-base-200">
            <h2 className="text-xl font-bold opacity-80">Expense Categories</h2>

            {/* Category Actions */}
            <div className="flex items-center gap-2">
              {categories.length > 1 && (
                <button
                  onClick={() => setShowReorderModal(true)}
                  className="btn btn-sm btn-ghost border border-base-300 gap-2 shadow-sm hover:shadow transition-all"
                  title="Reorder Expense Categories"
                >
                  <ArrowUpDown size={16} />
                  Reorder Categories
                </button>
              )}
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="btn btn-sm btn-primary gap-2 shadow-sm hover:shadow transition-all"
              >
                <FolderPlus size={16} />
                Add Category
              </button>
            </div>
          </div>

          {/* Category Grid Section */}
          <section className="relative w-full">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 md:gap-6 pb-4">
              {monthCategories.map((cat) => (
                <div key={cat._id} className="min-w-0">
                  <CategoryCard category={cat} isAllCollapsed={isAllCollapsed} />
                </div>
              ))}

              {/* Empty State / Add Helper */}
              {monthCategories.length === 0 && (
                <div className="col-span-1 xl:col-span-2 py-12 px-4 flex flex-col items-center justify-center border-2 border-dashed border-base-300 dark:border-base-content/20 rounded-2xl text-base-content/50 gap-3 text-center">
                  <div className="p-3 rounded-full bg-base-200/60">
                    <FolderPlus size={28} className="opacity-60" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-bold text-base-content">No Categories Yet for {dayjs(currentMonth).format("MMMM YYYY")}</p>
                    <p className="text-xs text-base-content/60 mt-0.5">Start organizing this month's budget by creating your first category</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <button onClick={() => setShowAddCategoryModal(true)} className="btn btn-primary btn-sm rounded-xl">Create Category</button>
                    <span className="text-xs opacity-50 font-bold">OR</span>
                    <CopyFromLastMonthButton currentMonth={currentMonth} />
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      )}

      {/* Add Category Popup Modal */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        currentMonth={currentMonth}
      />

      {/* Reorder Categories Popup Modal */}
      <ReorderCategoriesModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
      />
    </div>
  );
};

// Internal sub-component for the button to keep main component clean
const CopyFromLastMonthButton = ({ currentMonth }) => {
  const dispatch = useDispatch();
  const [isCopying, setIsCopying] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const resultAction = await dispatch(copyCategoriesFromLastMonth({ currentMonth }));
      if (copyCategoriesFromLastMonth.fulfilled.match(resultAction)) {
        if (resultAction.payload && resultAction.payload.length > 0) {
          messageApi.success(`Successfully copied ${resultAction.payload.length} categories!`);
          dispatch(fetchDashboardData(currentMonth));
        } else {
          messageApi.info("No categories found in last month to copy.");
        }
      } else {
        messageApi.error(resultAction.payload || "Failed to copy.");
      }
    } catch (error) {
      console.error(error);
      messageApi.error("Something went wrong");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <>
      {contextHolder}
      <button
        onClick={handleCopy}
        className="btn btn-ghost btn-sm text-base-content/70 hover:text-primary gap-2"
        disabled={isCopying}
      >
        {isCopying ? <span className="loading loading-spinner loading-xs"></span> : <RefreshCw size={14} />}
        Use Last Month's Categories
      </button>
    </>
  );
};

export default ExpTableView;
