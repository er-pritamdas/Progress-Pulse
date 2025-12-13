import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { addTransaction, updateTransaction, deleteTransaction } from "../../services/redux/slice/ExpenseSlice";
import { Trash2, Save, X, Edit2, Plus } from "lucide-react";

// Helper Component for DaisyUI Dropdown
const DaisySelect = ({ value, onChange, options, placeholder, disabled, className, specialOption }) => {
    const selectedItem = options.find(o => o.value === value);
    // Handle special "Add Money" label if selected
    const displayLabel = value === "add_money" ? "+ Add Money" : (selectedItem ? selectedItem.label : placeholder);
    const isSpecialSelected = value === "add_money";

    return (
        <div className={`dropdown dropdown-bottom dropdown-end w-full ${className || ''}`}>
            <div
                tabIndex={0}
                role="button"
                className={`btn btn-sm w-full justify-between font-normal text-xs border border-base-300 bg-base-100 hover:border-primary
                    ${disabled ? 'btn-disabled opacity-50' : ''}
                    ${isSpecialSelected ? 'text-success font-bold border-success/50 bg-success/5' : ''}`}
            >
                <span className="truncate">{displayLabel}</span>
                <span className="opacity-50 scale-75">▼</span>
            </div>
            {!disabled && (
                <ul tabIndex={0} className="dropdown-content z-[50] menu p-1 shadow-xl bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto border border-base-200 block text-xs">
                    {options.map((opt, idx) => (
                        <li key={opt.key || opt.value || idx}>
                            {opt.disabled ? (
                                <div className="divider my-0 py-0 h-1"></div>
                            ) : (
                                <a
                                    className={`${opt.value === value ? "active" : ""} ${opt.className || ''}`}
                                    onClick={(e) => {
                                        // e.preventDefault();
                                        onChange(opt.value);
                                        // Close dropdown by blurring
                                        e.currentTarget.closest('.dropdown')?.removeAttribute('open');
                                        document.activeElement?.blur();
                                    }}
                                >
                                    {opt.label}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const ExpenseTable = () => {
    const dispatch = useDispatch();
    const { transactions, categories, sources, loading, currentMonth } = useSelector((state) => state.expense);

    // Sort transactions by date (descending)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Editing State
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Adding State
    const [isAdding, setIsAdding] = useState(false);
    const [newData, setNewData] = useState({
        date: dayjs().format("YYYY-MM-DD"),
        description: "",
        sourceId: "", // ID
        categoryId: "", // ID
        subCategoryId: "", // ID
        amount: ""
    });

    // Helper to get Subcategories for a selected category
    const getSubCats = (catId) => {
        const cat = categories.find(c => c._id === catId);
        return cat ? cat.subCategories : [];
    };

    // --- Options Builders ---
    const sourceOptions = [
        { value: "", label: "Select Source", disabled: true }, // Placeholder logic handled by comp but good to have
        { value: "add_money", label: "+ Add Money", className: "text-success font-bold" },
        { value: "divider", disabled: true },
        ...sources.map(s => ({
            value: s._id,
            label: `${s.name} (${s.type === 'Card' ? 'Card' : s.balance})`,
            key: s._id
        }))
    ];

    const targetOptions = [
        ...sources.filter(s => s.type !== 'Card').map(s => ({ value: s._id, label: s.name, key: s._id }))
    ];

    const categoryOptions = categories.map(c => ({ value: c._id, label: c.name, key: c._id }));

    // --- Handlers ---

    // Add Transaction
    const handleAdd = () => {
        if (!newData.description || !newData.sourceId || !newData.amount) {
            alert("Please fill required fields");
            return;
        }

        const isCredit = newData.isAddMoney;

        dispatch(addTransaction({
            ...newData,
            date: newData.date || new Date(),
            amount: Number(newData.amount),
            type: isCredit ? "Credit" : "Debit",
            // If Credit, category/subcat will be undefined/ignored by backend
            categoryId: isCredit ? undefined : newData.categoryId,
            subCategoryId: isCredit ? undefined : newData.subCategoryId
        }));

        // Reset form but keep date
        setNewData({ ...newData, description: "", amount: "", isAddMoney: false, sourceId: "", categoryId: "", subCategoryId: "" });
        setIsAdding(false);
    };

    // Edit Transaction
    const startEdit = (t) => {
        setEditingId(t._id);
        setEditData({
            date: dayjs(t.date).format("YYYY-MM-DD"),
            description: t.description,
            sourceId: t.sourceId?._id || t.sourceId,
            categoryId: t.categoryId?._id || t.categoryId,
            subCategoryId: t.subCategoryId,
            amount: t.amount
        });
    };

    const saveEdit = () => {
        dispatch(updateTransaction({
            id: editingId,
            data: { ...editData, amount: Number(editData.amount) }
        }));
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this transaction?")) {
            dispatch(deleteTransaction(id));
        }
    };


    if (loading && transactions.length === 0) return <div className="p-8 text-center opacity-50">Loading transactions...</div>;

    return (
        <div className="w-full bg-base-100 rounded-2xl shadow-lg border border-base-200 flex flex-col h-[700px]">

            {/* Table Header - Sticky */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-base-200/50 border-b border-base-200 text-xs font-bold text-base-content/50 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Description</div>
                <div className="col-span-2">From</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Sub Category</div>
                <div className="col-span-1 text-right">Amount</div>
                <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-visible flex-1 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent pb-40">
                {/* Note: overflow-y-visible might break scrolling if height is fixed.
                  But dropdowns need visible.
                  Actually, DaisyUI dropdowns might need 'overflow-y-auto' on parent to serve as scroll container,
                  but that CLIPS the dropdown.
                  For now keeping auto (clip) but adding pb-40 to allow scrolling space at bottom.
                */}

                {/* Add Transaction Logic (Top of List) */}
                <div className={`transition-all duration-300 ${isAdding ? 'bg-base-200/30 py-4 px-4 border-b border-primary/20 z-20 relative' : 'p-2 border-b border-base-200/50'}`}>
                    {isAdding ? (
                        <div className="grid grid-cols-12 gap-2 items-center animate-in fade-in slide-in-from-top-2">
                            <input type="date" value={newData.date} onChange={e => setNewData({ ...newData, date: e.target.value })} className="col-span-2 input input-sm input-bordered focus:input-primary w-full text-xs" />
                            <input placeholder="Desc" value={newData.description} onChange={e => setNewData({ ...newData, description: e.target.value })} className="col-span-2 input input-sm input-bordered focus:input-primary w-full text-xs" autoFocus />

                            {/* From / Action */}
                            <div className="col-span-2">
                                <DaisySelect
                                    options={sourceOptions}
                                    value={newData.isAddMoney ? "add_money" : newData.sourceId}
                                    placeholder="Source"
                                    onChange={(val) => {
                                        if (val === "add_money") {
                                            setNewData({ ...newData, isAddMoney: true, sourceId: "", categoryId: "", subCategoryId: "" });
                                        } else {
                                            setNewData({ ...newData, isAddMoney: false, sourceId: val });
                                        }
                                    }}
                                />
                            </div>

                            {/* Target / Category */}
                            <div className="col-span-2">
                                {newData.isAddMoney ? (
                                    <DaisySelect
                                        options={targetOptions}
                                        value={newData.sourceId}
                                        placeholder="Target"
                                        onChange={(val) => setNewData({ ...newData, sourceId: val })}
                                        className="text-success"
                                    />
                                ) : (
                                    <DaisySelect
                                        options={categoryOptions}
                                        value={newData.categoryId}
                                        placeholder="Category"
                                        onChange={(val) => setNewData({ ...newData, categoryId: val, subCategoryId: "" })}
                                    />
                                )}
                            </div>

                            {/* Sub Cat */}
                            <div className="col-span-2">
                                <DaisySelect
                                    options={newData.isAddMoney ? [] : getSubCats(newData.categoryId).map(sub => ({ value: sub._id, label: sub.name }))}
                                    value={newData.subCategoryId}
                                    placeholder={newData.isAddMoney ? "—" : "SubCat"}
                                    disabled={newData.isAddMoney}
                                    onChange={(val) => setNewData({ ...newData, subCategoryId: val })}
                                />
                            </div>

                            {/* Amount */}
                            <input type="number" placeholder="0.00" value={newData.amount} onChange={e => setNewData({ ...newData, amount: e.target.value })} className="col-span-1 input input-sm input-bordered focus:input-primary w-full text-xs text-right" />

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-center gap-1">
                                <button onClick={handleAdd} className="btn btn-sm btn-square btn-primary text-white" title="Save"><Save size={14} /></button>
                                <button onClick={() => setIsAdding(false)} className="btn btn-sm btn-square btn-ghost text-error" title="Cancel"><X size={14} /></button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsAdding(true)} className="btn btn-ghost btn-sm w-full gap-2 text-base-content/50 hover:text-primary hover:bg-base-200">
                            <Plus size={16} /> Add New Transaction
                        </button>
                    )}
                </div>

                {/* Rows */}
                {sortedTransactions.map(t => (
                    <div key={t._id} className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-base-200 hover:bg-base-200/50 transition-colors group items-center text-sm relative">
                        {/* Note: 'relative' on row + 'z-10' on dropdowns helps stacking, but clipping by parent scroll is unavoidable without portals */}
                        {editingId === t._id ? (
                            // Edit Mode (Inline Inputs)
                            <>
                                <input type="date" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} className="col-span-2 input input-xs input-bordered" />
                                <input value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="col-span-2 input input-xs input-bordered" />

                                <div className="col-span-2">
                                    <DaisySelect
                                        options={sources.map(s => ({ value: s._id, label: s.name }))}
                                        value={editData.sourceId}
                                        placeholder="Source"
                                        onChange={(val) => setEditData({ ...editData, sourceId: val })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <DaisySelect
                                        options={categoryOptions}
                                        value={editData.categoryId}
                                        placeholder="Category"
                                        onChange={(val) => setEditData({ ...editData, categoryId: val, subCategoryId: "" })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <DaisySelect
                                        options={getSubCats(editData.categoryId).map(sub => ({ value: sub._id, label: sub.name }))}
                                        value={editData.subCategoryId}
                                        placeholder="SubCat"
                                        onChange={(val) => setEditData({ ...editData, subCategoryId: val })}
                                    />
                                </div>

                                <input type="number" value={editData.amount} onChange={e => setEditData({ ...editData, amount: e.target.value })} className="col-span-1 input input-xs input-bordered w-full text-right" />

                                <div className="col-span-1 flex items-center justify-center gap-1">
                                    <button onClick={saveEdit} className="btn btn-xs btn-square btn-success text-white"><Save size={12} /></button>
                                    <button onClick={() => setEditingId(null)} className="btn btn-xs btn-square btn-ghost text-error"><X size={12} /></button>
                                </div>
                            </>
                        ) : (
                            // View Mode
                            <>
                                <div className="col-span-2 text-base-content/60 font-medium">{dayjs(t.date).format("MMM DD, YYYY")}</div>
                                <div className="col-span-2 font-semibold text-base-content truncate pr-4" title={t.description}>{t.description}</div>
                                <div className="col-span-2">
                                    <div className="badge badge-ghost badge-sm gap-1 font-medium bg-base-200/80 border-0 text-base-content/70">
                                        {t.sourceId?.name || 'Unknown'}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    {t.type === 'Credit' ? (
                                        <div className="badge badge-success badge-outline badge-sm gap-1 bg-success/5 font-bold border-success/30">
                                            + Add Money
                                        </div>
                                    ) : (
                                        <div className="text-base-content/80 font-medium">{t.categoryId?.name}</div>
                                    )}
                                </div>
                                <div className="col-span-2 text-base-content/50 text-xs">
                                    {(() => {
                                        const catId = t.categoryId?._id || t.categoryId;
                                        const subId = t.subCategoryId?._id || t.subCategoryId;
                                        const cat = categories.find(c => c._id === catId);
                                        const sub = cat?.subCategories?.find(s => s._id === subId);
                                        return sub?.name || '—';
                                    })()}
                                </div>
                                <div className={`col-span-1 text-right font-bold font-mono tracking-tight ${t.type === 'Credit' ? 'text-success' : 'text-base-content'}`}>
                                    {t.type === 'Credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                </div>

                                <div className="col-span-1 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(t)} className="btn btn-xs btn-ghost btn-square text-info hover:bg-info/10"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDelete(t._id)} className="btn btn-xs btn-ghost btn-square text-error hover:bg-error/10"><Trash2 size={14} /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {sortedTransactions.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-base-content/30 italic">
                        No transactions recorded for this period.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseTable;
