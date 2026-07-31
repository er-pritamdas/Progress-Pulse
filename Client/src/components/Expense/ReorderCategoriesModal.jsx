import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GripVertical, X, Check, ArrowUpDown } from 'lucide-react';
import { reorderCategories, setLocalCategoriesOrder } from '../../services/redux/slice/ExpenseSlice';

const ReorderCategoriesModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.expense);
    const [items, setItems] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && categories) {
            setItems([...categories]);
        }
    }, [isOpen, categories]);

    if (!isOpen) return null;

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (draggedIndex === null || draggedIndex === index) return;

        const updated = [...items];
        const [movedItem] = updated.splice(draggedIndex, 1);
        updated.splice(index, 0, movedItem);
        setDraggedIndex(index);
        setItems(updated);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Optimistically update local redux state
        dispatch(setLocalCategoriesOrder(items));
        const categoryIds = items.map(c => c._id);
        await dispatch(reorderCategories({ categoryIds }));
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
            {/* Fixed size modal container */}
            <div className="bg-base-100 border border-base-200 shadow-2xl rounded-2xl w-full max-w-lg h-[580px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <ArrowUpDown size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-base-content">Reorder Categories</h3>
                            <p className="text-xs text-base-content/60">Drag items up or down to set your preferred dashboard display order</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-300/50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content - Fixed height scrollable body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {items.length === 0 ? (
                        <div className="text-center py-12 opacity-50 text-sm">No categories available to reorder.</div>
                    ) : (
                        items.map((cat, idx) => (
                            <div
                                key={cat._id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center justify-between p-3.5 bg-base-100 border border-base-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none
                                    ${draggedIndex === idx ? 'opacity-40 border-primary border-dashed bg-primary/5 scale-[0.98]' : 'hover:border-primary/40'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-base-content/40 hover:text-primary cursor-grab active:cursor-grabbing p-1">
                                        <GripVertical size={18} />
                                    </div>
                                    <span className="w-6 h-6 rounded-full bg-base-200 text-xs font-bold flex items-center justify-center text-base-content/70">
                                        {idx + 1}
                                    </span>
                                    <span className="font-semibold text-sm text-base-content">{cat.name}</span>
                                </div>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-base-200/70 text-base-content/60">
                                    {cat.subCategories?.length || 0} subcategories
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-base-200 bg-base-200/40 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-ghost px-5"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn btn-sm btn-primary text-white gap-2 px-6 shadow-md"
                    >
                        {isSaving ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <Check size={16} />
                        )}
                        Save Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReorderCategoriesModal;
