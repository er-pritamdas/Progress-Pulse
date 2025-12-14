import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { addTransaction, updateTransaction, deleteTransaction } from "../../services/redux/slice/ExpenseSlice";
import { Trash2, Save, X, Edit2, Plus, Handshake, AlertTriangle } from "lucide-react";

// Helper Component for DaisyUI Dropdown
const DaisySelect = ({ value, onChange, options, placeholder, disabled, className, specialOption }) => {
    const selectedItem = options.find(o => o.value === value);
    // Handle special "Add Money" label if selected
    const displayLabel = value === "add_money" ? "+ Add Money" : (value === "debit_money" ? "- Debit Money" : (selectedItem ? selectedItem.label : placeholder));
    const isSpecialSelected = value === "add_money" || value === "debit_money";

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
                                        if (opt.value !== "divider") {
                                            onChange(opt.value);
                                            // Close dropdown by blurring
                                            e.currentTarget.closest('.dropdown')?.removeAttribute('open');
                                            document.activeElement?.blur();
                                        }
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

    // Delete Modal State
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        date: "",
        description: "",
        sourceId: "",
        categoryId: "",
        subCategoryId: ""
    });

    const filteredTransactions = sortedTransactions.filter(t => {
        const matchDate = filters.date ? dayjs(t.date).format("YYYY-MM-DD") === filters.date : true;
        const matchDesc = filters.description ? t.description.toLowerCase().includes(filters.description.toLowerCase()) : true;
        const matchSource = filters.sourceId ? (t.sourceId?._id === filters.sourceId || t.sourceId === filters.sourceId) : true;
        const matchCategory = filters.categoryId ? (t.categoryId?._id === filters.categoryId || t.categoryId === filters.categoryId) : true;
        const matchSub = filters.subCategoryId ? (t.subCategoryId?._id === filters.subCategoryId || t.subCategoryId === filters.subCategoryId) : true;
        return matchDate && matchDesc && matchSource && matchCategory && matchSub;
    });

    // Adding State
    const [isAdding, setIsAdding] = useState(false);
    const [newData, setNewData] = useState({
        date: dayjs().format("YYYY-MM-DD"),
        description: "",
        sourceId: "", // ID
        categoryId: "", // ID
        subCategoryId: "", // ID
        amount: "",
        isReimbursable: false
    });

    // Helper to get Subcategories for a selected category
    const getSubCats = (catId) => {
        const cat = categories.find(c => c._id === catId);
        return cat ? cat.subCategories : [];
    };

    // --- Options Builders ---
    const sourceOptions = [
        { value: "", label: "Select Source", disabled: true }, // Placeholder
        { value: "add_money", label: "+ Add Money", className: "text-success font-bold" },
        { value: "debit_money", label: "- Debit Money", className: "text-error font-bold" },
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
        // Validation: For manual debit, we need sourceId (which is stored in sourceId for simplicity but implemented as 'target' logic in UI for Debit?)
        // Wait, for Debit Money: 
        // Source Dropdown -> "Debit Money"
        // Category Dropdown -> Select *Source* to debit from (e.g. Bank) -> Stored in newData.sourceId
        // So validation matches usual: need sourceId.

        if (!newData.description || !newData.sourceId || !newData.amount) {
            alert("Please fill required fields");
            return;
        }

        const isCredit = newData.isAddMoney;
        const isDebit = newData.isManualDebit;

        dispatch(addTransaction({
            ...newData,
            date: newData.date || new Date(),
            amount: Number(newData.amount),
            type: isCredit ? "Credit" : "Debit",
            // If Credit or Manual Debit, category/subcat will be undefined
            categoryId: (isCredit || isDebit) ? undefined : newData.categoryId,
            subCategoryId: (isCredit || isDebit) ? undefined : newData.subCategoryId,
            isReimbursable: newData.isReimbursable
        }));

        // Reset form but keep date
        setNewData({ ...newData, description: "", amount: "", isAddMoney: false, isManualDebit: false, sourceId: "", categoryId: "", subCategoryId: "", isReimbursable: false });
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
            amount: t.amount,
            isReimbursable: t.isReimbursable || false
        });
    };

    const saveEdit = () => {
        dispatch(updateTransaction({
            id: editingId,
            data: { ...editData, amount: Number(editData.amount), isReimbursable: editData.isReimbursable }
        }));
        setEditingId(null);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch(deleteTransaction(deleteId));
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteId(null);
    };


    if (loading && transactions.length === 0) return <div className="p-8 text-center opacity-50">Loading transactions...</div>;

    return (
        <div className="w-full bg-base-100 rounded-2xl shadow-lg border border-base-200 flex flex-col h-[700px]">

            {/* Table Header - Sticky with Filters */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-base-200/90 border-b border-base-200 text-xs font-bold text-base-content/50 uppercase tracking-widest sticky top-0 z-30 backdrop-blur-md items-end">
                <div className="col-span-2">
                    <span className="mb-1 block">Date</span>
                    <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} className="input input-xs input-bordered w-full" />
                </div>
                <div className="col-span-2">
                    <span className="mb-1 block">Description</span>
                    <input type="text" placeholder="Filter..." value={filters.description} onChange={(e) => setFilters({ ...filters, description: e.target.value })} className="input input-xs input-bordered w-full" />
                </div>
                <div className="col-span-2">
                    <span className="mb-1 block">From</span>
                    <select value={filters.sourceId} onChange={(e) => setFilters({ ...filters, sourceId: e.target.value })} className="select select-bordered select-xs w-full">
                        <option value="">All</option>
                        {sources.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <span className="mb-1 block">Category</span>
                    <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, subCategoryId: "" })} className="select select-bordered select-xs w-full">
                        <option value="">All</option>
                        {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <span className="mb-1 block">Sub Category</span>
                    <select value={filters.subCategoryId} onChange={(e) => setFilters({ ...filters, subCategoryId: e.target.value })} className="select select-bordered select-xs w-full">
                        <option value="">All</option>
                        {filters.categoryId
                            ? getSubCats(filters.categoryId).map(s => <option key={s._id} value={s._id}>{s.name}</option>)
                            : categories.flatMap(c => c.subCategories).map(s => <option key={s._id} value={s._id}>{s.name}</option>)
                        }
                        {/* Note: FlatMap might show duplicate names if not careful, but usually subcat names are unique enough or user knows context. 
                            Strictly filtering by Category first is better UX usually.
                        */}
                    </select>
                </div>
                <div className="col-span-1 text-right mb-2">Amount</div>
                <div className="col-span-1 text-center mb-2">Action</div>
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
                            {/* Date & Reimbursable Toggle */}
                            <div className="col-span-2 flex items-center gap-1">
                                <button
                                    onClick={() => setNewData({ ...newData, isReimbursable: !newData.isReimbursable })}
                                    className={`btn btn-xs btn-square ${newData.isReimbursable ? 'btn-warning' : 'btn-ghost opacity-40 hover:opacity-100'}`}
                                    title="Need to collect money? (Mark as Reimbursable)"
                                >
                                    <Handshake size={14} />
                                </button>
                                <input type="date" value={newData.date} onChange={e => setNewData({ ...newData, date: e.target.value })} className="input input-sm input-bordered focus:input-primary w-full text-xs" />
                            </div>
                            <input placeholder="Desc" value={newData.description} onChange={e => setNewData({ ...newData, description: e.target.value })} className="col-span-2 input input-sm input-bordered focus:input-primary w-full text-xs" autoFocus />

                            {/* From / Action */}
                            <div className="col-span-2">
                                <DaisySelect
                                    options={sourceOptions}
                                    value={newData.isAddMoney ? "add_money" : (newData.isManualDebit ? "debit_money" : newData.sourceId)}
                                    placeholder="Source"
                                    onChange={(val) => {
                                        if (val === "add_money") {
                                            setNewData({ ...newData, isAddMoney: true, isManualDebit: false, sourceId: "", categoryId: "", subCategoryId: "" });
                                        } else if (val === "debit_money") {
                                            setNewData({ ...newData, isAddMoney: false, isManualDebit: true, sourceId: "", categoryId: "", subCategoryId: "" });
                                        } else {
                                            setNewData({ ...newData, isAddMoney: false, isManualDebit: false, sourceId: val });
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
                                ) : newData.isManualDebit ? (
                                    <DaisySelect
                                        options={targetOptions}
                                        value={newData.sourceId}
                                        placeholder="Debit From"
                                        onChange={(val) => setNewData({ ...newData, sourceId: val })}
                                        className="text-error"
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
                                    options={(newData.isAddMoney || newData.isManualDebit) ? [] : getSubCats(newData.categoryId).map(sub => ({ value: sub._id, label: sub.name }))}
                                    value={newData.subCategoryId}
                                    placeholder={(newData.isAddMoney || newData.isManualDebit) ? "—" : "SubCat"}
                                    disabled={newData.isAddMoney || newData.isManualDebit}
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
                {filteredTransactions.map(t => (
                    <div key={t._id} className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-base-200 hover:bg-base-200/50 transition-colors group items-center text-sm relative">
                        {/* Note: 'relative' on row + 'z-10' on dropdowns helps stacking, but clipping by parent scroll is unavoidable without portals */}
                        {editingId === t._id ? (
                            // Edit Mode (Inline Inputs)
                            <>
                                <div className="col-span-2 flex items-center gap-1">
                                    <button
                                        onClick={() => setEditData({ ...editData, isReimbursable: !editData.isReimbursable })}
                                        className={`btn btn-xs btn-square ${editData.isReimbursable ? 'btn-warning' : 'btn-ghost opacity-40 hover:opacity-100'}`}
                                        title="Need to collect money? (Mark as Reimbursable)"
                                    >
                                        <Handshake size={14} />
                                    </button>
                                    <input type="date" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} className="input input-xs input-bordered w-full" />
                                </div>
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
                                <div className="col-span-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            {t.isReimbursable && <Handshake size={12} className="text-warning" title="Reimbursable: Need to collect money" />}
                                            <span className="font-bold text-base-content/80 truncate text-xs" title={t.description}>{t.description}</span>
                                        </div>
                                    </div>
                                </div>
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
                                <div className={`col-span-1 text-right font-bold font-mono tracking-tight ${t.type === 'Credit' ? 'text-success' : 'text-error'}`}>
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

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden border border-base-200 p-6 text-center">
                        <div className="mx-auto mb-4 p-3 bg-error/10 rounded-full text-error">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-base-content mb-2">Delete Transaction?</h3>
                        <p className="text-sm text-base-content/60 mb-6">
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={cancelDelete} className="btn btn-sm flex-1">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="btn btn-sm btn-error flex-1 text-white">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseTable;
