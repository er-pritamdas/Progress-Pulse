import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createCategory } from '../../services/redux/slice/ExpenseSlice';
import { Plus, Trash2, X, FolderPlus, Layers, IndianRupee } from 'lucide-react';
import { message } from 'antd';

const AddCategoryModal = ({ isOpen, onClose, currentMonth }) => {
    const dispatch = useDispatch();

    const [categoryName, setCategoryName] = useState("");
    const [subCategories, setSubCategories] = useState([
        { id: Date.now(), name: "", budget: "" }
    ]);

    if (!isOpen) return null;

    const handleAddSubRow = () => {
        setSubCategories([...subCategories, { id: Date.now(), name: "", budget: "" }]);
    };

    const handleRemoveSubRow = (id) => {
        if (subCategories.length === 1) {
            // Keep at least one empty row or clear it
            setSubCategories([{ id: Date.now(), name: "", budget: "" }]);
        } else {
            setSubCategories(subCategories.filter(s => s.id !== id));
        }
    };

    const handleSubChange = (id, field, value) => {
        setSubCategories(subCategories.map(s => {
            if (s.id === id) {
                return { ...s, [field]: value };
            }
            return s;
        }));
    };

    const totalPlannedBudget = subCategories.reduce((sum, s) => sum + (Number(s.budget) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) {
            message.error("Please enter a category name");
            return;
        }

        const validSubs = subCategories
            .filter(s => s.name && s.name.trim())
            .map(s => ({
                name: s.name.trim(),
                budget: Number(s.budget) || 0
            }));

        try {
            await dispatch(createCategory({
                name: categoryName.trim(),
                month: currentMonth,
                subCategories: validSubs
            })).unwrap();

            message.success(`Category "${categoryName}" created successfully!`);
            // Reset form
            setCategoryName("");
            setSubCategories([{ id: Date.now(), name: "", budget: "" }]);
            onClose();
        } catch (error) {
            message.error(typeof error === 'string' ? error : "Failed to create category");
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="card bg-base-100 shadow-2xl border border-primary/30 w-full max-w-lg h-[580px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="shrink-0 p-5 bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10 border-b border-base-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary text-primary-content shadow-md">
                            <FolderPlus size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">Add Expense Category</h3>
                            <p className="text-xs opacity-60 mt-0.5">Define your main category and planned sub-budgets</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-ghost btn-square rounded-full opacity-70 hover:opacity-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body - Fixed Container with Scrollable Content */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Category Name */}
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text font-bold text-xs uppercase tracking-wider opacity-70">Category Name *</span>
                            </label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="e.g. Housing & Rent, Food & Dining, Travel"
                                className="input input-bordered w-full focus:input-primary text-sm font-medium"
                                autoFocus
                            />
                        </div>

                        {/* Subcategories Section */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-1 border-b border-base-200">
                                <div className="flex items-center gap-2">
                                    <Layers size={16} className="text-secondary" />
                                    <span className="font-bold text-xs uppercase tracking-wider opacity-80">Sub-Categories & Budgets</span>
                                </div>

                                {totalPlannedBudget > 0 && (
                                    <span className="badge badge-primary badge-outline text-xs font-mono font-bold">
                                        Total: ₹{totalPlannedBudget.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                {subCategories.map((sub, idx) => (
                                    <div key={sub.id} className="flex items-center gap-2 animate-in fade-in duration-150">
                                        <div className="w-6 text-center text-xs font-mono opacity-40 font-bold">
                                            #{idx + 1}
                                        </div>
                                        <input
                                            type="text"
                                            value={sub.name}
                                            onChange={(e) => handleSubChange(sub.id, 'name', e.target.value)}
                                            placeholder="Subcategory Name (e.g. Rent)"
                                            className="input input-sm input-bordered flex-1 text-xs"
                                        />
                                        <div className="relative w-32">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 font-mono">₹</span>
                                            <input
                                                type="number"
                                                value={sub.budget}
                                                onChange={(e) => handleSubChange(sub.id, 'budget', e.target.value)}
                                                placeholder="Budget"
                                                className="input input-sm input-bordered w-full pl-6 text-xs font-mono font-semibold text-right"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubRow(sub.id)}
                                            className="btn btn-xs btn-ghost btn-square text-error/70 hover:text-error hover:bg-error/10"
                                            title="Remove Row"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleAddSubRow}
                                className="btn btn-xs btn-outline btn-secondary w-full gap-1 border-dashed mt-1"
                            >
                                <Plus size={14} /> Add Another Subcategory
                            </button>
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="shrink-0 p-4 border-t border-base-200 bg-base-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-sm btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-sm btn-primary px-6 gap-2 shadow-md"
                        >
                            <FolderPlus size={16} /> Save Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryModal;
