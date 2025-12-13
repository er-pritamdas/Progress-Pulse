import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Edit2, Plus, X, Save } from "lucide-react";
import { addSubCategory, updateSubCategory, deleteSubCategory, deleteCategory, updateCategory } from "../../services/redux/slice/ExpenseSlice";

const CategoryCard = ({ category }) => {
    const dispatch = useDispatch();
    // Global State
    const { transactions, currentMonth } = useSelector((state) => state.expense);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState(category.name);

    // SubCategory Editing State
    const [editingSubId, setEditingSubId] = useState(null);
    const [tempSubName, setTempSubName] = useState("");
    const [tempSubBudget, setTempSubBudget] = useState(0);

    // Adding SubCategory State
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [newSubName, setNewSubName] = useState("");
    const [newSubBudget, setNewSubBudget] = useState("");


    // Calculations
    const subCategoryStats = category.subCategories.map(sub => {
        const used = transactions
            .filter(t => t.subCategoryId === sub._id || (t.categoryId === category._id && t.description.includes(sub.name))) // Fallback logic if needed, but ID strict check is better
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            ...sub,
            used,
            remaining: sub.budget - used
        };
    });

    const totalBudget = subCategoryStats.reduce((sum, s) => sum + s.budget, 0);
    const totalUsed = subCategoryStats.reduce((sum, s) => sum + s.used, 0);
    const totalRemaining = totalBudget - totalUsed;
    const totalPercentage = totalBudget > 0 ? ((totalUsed / totalBudget) * 100).toFixed(0) : 0;


    // Handlers
    const handleUpdateCategoryName = () => {
        if (newTitle !== category.name) {
            dispatch(updateCategory({ id: category._id, name: newTitle }));
        }
        setIsEditingTitle(false);
    };

    const handleAddSubCategory = () => {
        if (newSubName && newSubBudget) {
            dispatch(addSubCategory({
                categoryId: category._id,
                name: newSubName,
                budget: Number(newSubBudget),
                month: currentMonth // Pass selected month
            }));
            setNewSubName("");
            setNewSubBudget("");
            setIsAddingSub(false);
        }
    };

    const handleSaveSubEdit = (subId) => {
        dispatch(updateSubCategory({
            categoryId: category._id,
            subId,
            name: tempSubName,
            budget: Number(tempSubBudget)
        }));
        setEditingSubId(null);
    };

    return (
        <div className="card bg-base-100 shadow-lg border border-base-200 h-full">

            <div className="card-body p-0 gap-0">

                {/* Header */}
                <div className="p-5 border-b border-base-200 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2 w-full">
                                <input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="input input-sm input-bordered w-full"
                                    autoFocus
                                />
                                <button onClick={handleUpdateCategoryName} className="btn btn-xs btn-square btn-success btn-outline"><Save size={14} /></button>
                            </div>
                        ) : (
                            <div className="flex flex-col flex-1 min-w-0" onDoubleClick={() => setIsEditingTitle(true)}>
                                <h2 className="card-title text-lg font-bold truncate">{category.name}</h2>
                            </div>
                        )}

                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-xs btn-square opacity-50 hover:opacity-100">
                                <Edit2 size={14} />
                            </label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-32 border border-base-300">
                                <li><a onClick={() => setIsEditingTitle(true)}>Rename</a></li>
                                <li><a onClick={() => dispatch(deleteCategory(category._id))} className="text-error">Delete</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Category Progress */}
                    <div className="w-full flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-semibold opacity-70">
                            <span>{totalPercentage}% Used</span>
                            <span>₹{totalRemaining.toLocaleString()} Left</span>
                        </div>
                        <progress
                            className={`progress w-full h-2 ${Number(totalPercentage) > 100 ? 'progress-error' : totalPercentage > 85 ? 'progress-warning' : 'progress-primary'}`}
                            value={totalPercentage}
                            max="100"
                        ></progress>
                    </div>
                </div>

                {/* Sub-Category Table / List */}
                <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar p-2">
                    <table className="table table-xs w-full">
                        <tbody className="space-y-1">
                            {subCategoryStats.map((sub) => (
                                <tr
                                    key={sub._id}
                                    className="group hover:bg-base-200 transition-colors border-b border-base-100 last:border-0 rounded-lg"
                                >
                                    {editingSubId === sub._id ? (
                                        <td colSpan="3" className="p-1">
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    value={tempSubName}
                                                    onChange={(e) => setTempSubName(e.target.value)}
                                                    className="input input-xs input-bordered w-full"
                                                    placeholder="Name"
                                                />
                                                <input
                                                    type="number"
                                                    value={tempSubBudget}
                                                    onChange={(e) => setTempSubBudget(e.target.value)}
                                                    className="input input-xs input-bordered w-24"
                                                    placeholder="Budget"
                                                />
                                                <button onClick={() => handleSaveSubEdit(sub._id)} className="btn btn-xs btn-square btn-success btn-outline"><Save size={12} /></button>
                                                <button onClick={() => setEditingSubId(null)} className="btn btn-xs btn-square btn-ghost"><X size={12} /></button>
                                            </div>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="w-1/2 align-middle pl-2 py-3 rounded-l-lg">
                                                <div className="font-semibold text-sm">{sub.name}</div>
                                                <div className="text-[10px] opacity-50 mt-0.5">₹{sub.budget.toLocaleString()}</div>
                                            </td>

                                            <td className="w-1/4 align-middle py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-xs">₹{sub.used.toLocaleString()}</span>
                                                    <progress
                                                        className={`progress progress-xs w-full ${((sub.used / sub.budget) * 100) > 100 ? 'progress-error' : 'progress-info'}`}
                                                        value={(sub.used / sub.budget) * 100 || 0}
                                                        max="100"
                                                    ></progress>
                                                </div>
                                            </td>

                                            <td className="w-1/4 align-middle text-right pr-2 py-3 rounded-r-lg relative">
                                                <div className={`font-bold text-xs ${sub.remaining < 0 ? 'text-error' : 'text-success'}`}>
                                                    {sub.remaining > 0 ? `+` : ''}₹{sub.remaining.toLocaleString()}
                                                </div>

                                                {/* Hidden Actions */}
                                                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex bg-base-200 shadow-md rounded-md p-0.5 border border-base-300">
                                                    <button onClick={() => {
                                                        setEditingSubId(sub._id);
                                                        setTempSubName(sub.name);
                                                        setTempSubBudget(sub.budget);
                                                    }} className="btn btn-xs btn-ghost btn-square text-info"><Edit2 size={10} /></button>
                                                    <button onClick={() => dispatch(deleteSubCategory({ categoryId: category._id, subId: sub._id }))} className="btn btn-xs btn-ghost btn-square text-error"><Trash2 size={10} /></button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Add Item Action */}
                    {isAddingSub ? (
                        <div className="p-2 border-t border-base-200 mt-2 bg-base-200 rounded-lg m-2">
                            <div className="flex flex-col gap-2">
                                <input
                                    className="input input-xs input-bordered w-full"
                                    placeholder="Name (e.g. Stocks)"
                                    value={newSubName}
                                    onChange={(e) => setNewSubName(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="input input-xs input-bordered w-full"
                                        placeholder="Budget"
                                        value={newSubBudget}
                                        onChange={(e) => setNewSubBudget(e.target.value)}
                                    />
                                    <button onClick={handleAddSubCategory} className="btn btn-xs btn-primary">Add</button>
                                    <button onClick={() => setIsAddingSub(false)} className="btn btn-xs btn-ghost">Cancel</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-2 pt-2">
                            <button
                                onClick={() => setIsAddingSub(true)}
                                className="btn btn-xs btn-ghost btn-block border-dashed border-base-300 text-base-content/50 hover:bg-base-200 hover:text-primary transition-colors h-8 font-normal"
                            >
                                <Plus size={14} className="mr-1" /> Add Item
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Totals */}
                <div className="bg-base-200 p-3 text-xs flex justify-between items-center border-t border-base-200 font-medium rounded-b-xl">
                    <div className="flex flex-col">
                        <span className="opacity-50 text-[10px] uppercase">Budget</span>
                        <span>₹{totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="opacity-50 text-[10px] uppercase">Remaining</span>
                        <span className={`${totalRemaining < 0 ? 'text-error' : 'text-success'}`}>₹{totalRemaining.toLocaleString()}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CategoryCard;

