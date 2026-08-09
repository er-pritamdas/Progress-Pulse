import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  GripVertical,
  FolderPlus,
  FolderTree,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";

const OrganizeMfGroupsModal = ({ isOpen, onClose, funds = [], groups = [], onSaveGroups }) => {
  const [localGroups, setLocalGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  
  // Drag State
  const [draggedFundId, setDraggedFundId] = useState(null);
  const [draggedFromGroupId, setDraggedFromGroupId] = useState(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Ensure all funds are accounted for
      const allFundIds = funds.map((f) => f.id);
      let initialGroups = structuredClone(groups || []);

      if (initialGroups.length === 0) {
        initialGroups = [
          {
            id: "default-group",
            name: "General Mutual Funds",
            fundIds: allFundIds,
          },
        ];
      } else {
        // Collect assigned fund IDs
        const assignedIds = new Set();
        initialGroups.forEach((g) => {
          (g.fundIds || []).forEach((id) => assignedIds.add(id));
        });

        // Any unassigned fund goes to the first group or a new default group
        const unassignedIds = allFundIds.filter((id) => !assignedIds.has(id));
        if (unassignedIds.length > 0) {
          if (initialGroups[0]) {
            initialGroups[0].fundIds = [...(initialGroups[0].fundIds || []), ...unassignedIds];
          } else {
            initialGroups.push({
              id: "default-group",
              name: "General Mutual Funds",
              fundIds: unassignedIds,
            });
          }
        }
      }

      setLocalGroups(initialGroups);
      setNewGroupName("");
      setEditingGroupId(null);
    }
  }, [isOpen, funds, groups]);

  if (!isOpen) return null;

  // Map fund ID to fund object
  const fundMap = new Map((funds || []).map((f) => [f.id, f]));

  // Add a new custom Group
  const handleAddGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const newGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      fundIds: [],
    };
    setLocalGroups((prev) => [...prev, newGroup]);
    setNewGroupName("");
  };

  // Rename a Group
  const handleStartRenameGroup = (group) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleSaveRenameGroup = (groupId) => {
    if (!editingGroupName.trim()) return;
    setLocalGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name: editingGroupName.trim() } : g))
    );
    setEditingGroupId(null);
  };

  // Delete a Group (moves its funds to first group)
  const handleDeleteGroup = (groupId) => {
    if (localGroups.length <= 1) {
      alert("At least one group must remain!");
      return;
    }

    const groupToDelete = localGroups.find((g) => g.id === groupId);
    const orphanedFundIds = groupToDelete ? groupToDelete.fundIds || [] : [];

    setLocalGroups((prev) => {
      const filtered = prev.filter((g) => g.id !== groupId);
      if (filtered.length > 0 && orphanedFundIds.length > 0) {
        filtered[0].fundIds = [...(filtered[0].fundIds || []), ...orphanedFundIds];
      }
      return filtered;
    });
  };

  // Move Group Up/Down
  const handleMoveGroup = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= localGroups.length) return;
    setLocalGroups((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  // Move Fund Up/Down within a group
  const handleMoveFundInGroup = (groupId, fundIndex, direction) => {
    setLocalGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const fundIds = [...(g.fundIds || [])];
        const targetIdx = fundIndex + direction;
        if (targetIdx < 0 || targetIdx >= fundIds.length) return g;
        const temp = fundIds[fundIndex];
        fundIds[fundIndex] = fundIds[targetIdx];
        fundIds[targetIdx] = temp;
        return { ...g, fundIds };
      })
    );
  };

  // Move Fund to Another Group
  const handleMoveFundToGroup = (fundId, fromGroupId, toGroupId) => {
    if (fromGroupId === toGroupId) return;
    setLocalGroups((prev) =>
      prev.map((g) => {
        if (g.id === fromGroupId) {
          return { ...g, fundIds: (g.fundIds || []).filter((id) => id !== fundId) };
        }
        if (g.id === toGroupId) {
          return { ...g, fundIds: [...(g.fundIds || []), fundId] };
        }
        return g;
      })
    );
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, fundId, groupId) => {
    setDraggedFundId(fundId);
    setDraggedFromGroupId(groupId);
    e.dataTransfer.setData("text/plain", JSON.stringify({ fundId, groupId }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropGroup = (e, targetGroupId) => {
    e.preventDefault();
    if (!draggedFundId || !draggedFromGroupId) return;

    handleMoveFundToGroup(draggedFundId, draggedFromGroupId, targetGroupId);
    setDraggedFundId(null);
    setDraggedFromGroupId(null);
  };

  // Save changes
  const handleSave = () => {
    onSaveGroups(localGroups);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-3xl border border-base-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between bg-base-100/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-secondary/10 text-secondary rounded-2xl">
              <FolderTree size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-base-content">Organize Mutual Fund Groups & Order</h2>
              <p className="text-xs text-base-content/60">Create groups, re-order funds, and drag & drop between groups.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-base-200 text-base-content/60 hover:text-base-content transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Custom Groups & Drag Drop Container */}
        <div className="p-6 overflow-y-auto custom-scrollbar-thin space-y-6 flex-1">
          {/* Create Group Input */}
          <form onSubmit={handleAddGroup} className="flex items-center gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter new group name (e.g., Core Equity, Debt Funds)..."
              className="input input-sm flex-1 rounded-xl bg-base-200/60 border-base-200 text-xs focus:border-secondary"
            />
            <button
              type="submit"
              disabled={!newGroupName.trim()}
              className="btn btn-secondary btn-sm rounded-xl gap-1.5 text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
            >
              <FolderPlus size={14} />
              <span>Add Group</span>
            </button>
          </form>

          {/* Groups List */}
          <div className="space-y-4">
            {localGroups.map((group, gIdx) => {
              const groupFunds = (group.fundIds || [])
                .map((id) => fundMap.get(id))
                .filter(Boolean);

              return (
                <div
                  key={group.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropGroup(e, group.id)}
                  className="bg-base-200/80 rounded-2xl border border-base-300/80 p-4 space-y-3 shadow-xs transition-all"
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-base-300/70">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-1 flex-1 max-w-xs">
                          <input
                            type="text"
                            value={editingGroupName}
                            onChange={(e) => setEditingGroupName(e.target.value)}
                            className="input input-xs rounded-lg bg-base-100 border-secondary text-xs w-full"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRenameGroup(group.id)}
                            className="p-1 text-success hover:bg-success/10 rounded"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-extrabold text-xs text-base-content tracking-tight truncate">
                            {group.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold border border-secondary/20">
                            {groupFunds.length} fund{groupFunds.length !== 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Group Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartRenameGroup(group)}
                        className="p-1 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded cursor-pointer"
                        title="Rename Group"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveGroup(gIdx, -1)}
                        disabled={gIdx === 0}
                        className="p-1 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded cursor-pointer disabled:opacity-30"
                        title="Move Group Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveGroup(gIdx, 1)}
                        disabled={gIdx === localGroups.length - 1}
                        className="p-1 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded cursor-pointer disabled:opacity-30"
                        title="Move Group Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                      {localGroups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-1 text-error/80 hover:text-error hover:bg-error/10 rounded cursor-pointer"
                          title="Delete Group"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Fund Items inside Group */}
                  {groupFunds.length === 0 ? (
                    <div className="py-4 text-center border-2 border-dashed border-base-200 rounded-xl text-base-content/40 text-xs font-medium">
                      Drag funds here or select a target group
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {groupFunds.map((fund, fIdx) => (
                        <div
                          key={fund.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, fund.id, group.id)}
                          className="flex items-center justify-between gap-3 px-3 py-2 bg-base-100 rounded-xl border border-base-200/80 shadow-2xs hover:border-secondary/40 cursor-grab active:cursor-grabbing transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <GripVertical size={14} className="text-base-content/30 group-hover:text-secondary shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-base-content truncate">{fund.amc}</span>
                                {fund.folioNumber && (
                                  <span className="font-mono text-[9.5px] text-secondary font-bold">
                                    #{fund.folioNumber}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                                {fund.category} → {fund.subCategory}
                              </p>
                            </div>
                          </div>

                          {/* Re-order Arrows & Target Group Selector */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveFundInGroup(group.id, fIdx, -1)}
                              disabled={fIdx === 0}
                              className="p-1 text-base-content/50 hover:text-base-content hover:bg-base-200 rounded cursor-pointer disabled:opacity-20"
                              title="Move Fund Up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveFundInGroup(group.id, fIdx, 1)}
                              disabled={fIdx === groupFunds.length - 1}
                              className="p-1 text-base-content/50 hover:text-base-content hover:bg-base-200 rounded cursor-pointer disabled:opacity-20"
                              title="Move Fund Down"
                            >
                              <ArrowDown size={12} />
                            </button>

                            {localGroups.length > 1 && (
                              <select
                                value={group.id}
                                onChange={(e) => handleMoveFundToGroup(fund.id, group.id, e.target.value)}
                                className="select select-xs select-bordered text-[10px] font-medium rounded-lg bg-base-200 text-base-content/80 ml-1 cursor-pointer"
                              >
                                {localGroups.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    Move to {g.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-base-200 flex items-center justify-end gap-2 bg-base-100/90 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm rounded-xl font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-secondary btn-sm rounded-xl font-bold text-xs gap-1.5 px-5 shadow-sm cursor-pointer"
          >
            <Check size={15} />
            <span>Save Custom Groups & Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizeMfGroupsModal;
