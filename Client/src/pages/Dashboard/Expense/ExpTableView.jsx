import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchDashboardData, createCategory, setMonth, copyCategoriesFromLastMonth } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import HeaderSection from "../../../components/Expense/HeaderSection";
import CategoryCard from "../../../components/Expense/CategoryCard";
import { Plus, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { message } from "antd";

// This view now contains the "Expense Dashboard" UI as requested
const ExpTableView = () => {
  const dispatch = useDispatch();
  const { categories, loading, currentMonth } = useSelector((state) => state.expense);
  const { user } = useAuth();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardData(currentMonth));
  }, [currentMonth, user, dispatch]);


  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      dispatch(createCategory({ name: newCategoryName, month: currentMonth }));
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };


  if (loading && categories.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading Expense Data...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8 pb-20">

      {/* Month Selector & Header */}
      <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Financial Overview
        </h1>

        <div className="flex items-center gap-2 bg-base-200/50 p-1 rounded-lg border border-base-200">
          <button
            onClick={() => dispatch(setMonth(dayjs(currentMonth).subtract(1, 'month').format("YYYY-MM")))}
            className="btn btn-sm btn-ghost btn-square"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-sm font-bold font-mono min-w-[120px] text-center">
            {dayjs(currentMonth).format("MMMM YYYY")}
          </span>

          <button
            onClick={() => dispatch(setMonth(dayjs(currentMonth).add(1, 'month').format("YYYY-MM")))}
            className="btn btn-sm btn-ghost btn-square"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Stats Header */}
      <section>
        <HeaderSection />
      </section>

      {/* Separator / Title */}
      <div className="flex items-center justify-between pb-2 border-b border-base-200">
        <h2 className="text-xl font-bold opacity-80">Expense Categories</h2>

        {/* Add Category Trigger */}
        {isAddingCategory ? (
          <div className="join shadow-sm">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New Category..."
              className="input input-sm input-bordered join-item focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button onClick={handleAddCategory} className="btn btn-sm btn-primary join-item">Save</button>
            <button onClick={() => setIsAddingCategory(false)} className="btn btn-sm btn-ghost join-item text-error">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="btn btn-sm btn-ghost gap-2 opacity-70 hover:opacity-100"
          >
            <Plus size={16} />
            Add Category
          </button>
        )}
      </div>

      {/* Category Grid Section */}
      <section className="relative w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-4">
          {categories.map((cat) => (
            <div key={cat._id} className="min-w-0">
              <CategoryCard category={cat} />
            </div>
          ))}

          {/* Empty State / Add Helper */}
          {categories.length === 0 && (
            <div className="col-span-1 md:col-span-2 xl:col-span-4 h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-400 gap-4">
              <p className="text-lg font-medium">No Categories Yet</p>

              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setIsAddingCategory(true)} className="btn btn-primary btn-sm">Create One</button>
                <span className="text-xs opacity-50">- OR -</span>
                <CopyFromLastMonthButton currentMonth={currentMonth} />
              </div>
            </div>
          )}
        </div>
      </section>

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
