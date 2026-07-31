import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchDashboardData, setMonth, copyCategoriesFromLastMonth } from "../../../services/redux/slice/ExpenseSlice";
import { useAuth } from "../../../Context/JwtAuthContext";
import HeaderSection from "../../../components/Expense/HeaderSection";
import CategoryCard from "../../../components/Expense/CategoryCard";
import AddCategoryModal from "../../../components/Expense/AddCategoryModal";
import ReorderCategoriesModal from "../../../components/Expense/ReorderCategoriesModal";
import { Plus, ChevronLeft, ChevronRight, RefreshCw, FolderPlus, ArrowUpDown } from "lucide-react";
import { message } from "antd";

// This view contains the Expense Dashboard UI
const ExpTableView = () => {
  const dispatch = useDispatch();
  const { categories, loading, currentMonth } = useSelector((state) => state.expense);
  const { user } = useAuth();

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardData(currentMonth));
  }, [currentMonth, user, dispatch]);

  if (loading && categories.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading Expense Data...</div>;
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-[-17px] z-40 bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/40 -mx-4 px-4 py-2 mt-[-16px]">
        <div className="flex items-center justify-between p-3 flex-wrap gap-3 max-w-[1600px] mx-auto px-4 md:px-6">
          <h1 className="text-lg font-bold text-base-content/90 flex items-center gap-2">
            <span className="text-primary font-extrabold">Expense</span> Table View
          </h1>

          <div className="flex items-center gap-2 bg-base-200/60 p-1 rounded-xl border border-base-300/40">
            <button
              onClick={() => dispatch(setMonth(dayjs(currentMonth).subtract(1, 'month').format("YYYY-MM")))}
              className="btn btn-xs btn-ghost btn-square"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-bold font-mono min-w-[110px] text-center">
              {dayjs(currentMonth).format("MMMM YYYY")}
            </span>

            <button
              onClick={() => dispatch(setMonth(dayjs(currentMonth).add(1, 'month').format("YYYY-MM")))}
              className="btn btn-xs btn-ghost btn-square"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 w-full max-w-[1600px] mx-auto space-y-6">

      {/* Stats Header */}
      <section>
        <HeaderSection />
      </section>

      {/* Separator / Title */}
      <div className="flex items-center justify-between pb-2 border-b border-base-200">
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

      {/* Category Grid Section */}
      <section className="relative w-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-4">
          {categories.map((cat) => (
            <div key={cat._id} className="min-w-0">
              <CategoryCard category={cat} />
            </div>
          ))}

          {/* Empty State / Add Helper */}
          {categories.length === 0 && (
            <div className="col-span-1 xl:col-span-2 h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-400 gap-4">
              <p className="text-lg font-medium">No Categories Yet</p>

              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setShowAddCategoryModal(true)} className="btn btn-primary btn-sm">Create One</button>
                <span className="text-xs opacity-50">- OR -</span>
                <CopyFromLastMonthButton currentMonth={currentMonth} />
              </div>
            </div>
          )}
        </div>
      </section>

      </div>
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
