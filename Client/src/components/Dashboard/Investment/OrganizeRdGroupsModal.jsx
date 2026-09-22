import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  PiggyBank,
} from "lucide-react";

const OrganizeRdGroupsModal = ({ isOpen, onClose, rds = [], groups = [], onSaveGroups }) => {
  const [localGroups, setLocalGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  
  // Drag State
  const [draggedRdId, setDraggedRdId] = useState(null);
  const [draggedFromGroupId, setDraggedFromGroupId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const allRdIds = rds.map((f) => f.id);
      let initialGroups = structuredClone(groups || []);

      if (initialGroups.length === 0) {
        initialGroups = [
          {
            id: "default-group",
            name: "General Recurring Deposits",
            rdIds: allRdIds,
          },
        ];
      } else {
        const assignedIds = new Set();
        initialGroups.forEach((g) => {
          (g.rdIds || []).forEach((id) => assignedIds.add(id));
        });

        const unassignedIds = allRdIds.filter((id) => !assignedIds.has(id));
        if (unassignedIds.length > 0) {
          if (initialGroups[0]) {
            initialGroups[0].rdIds = [...(initialGroups[0].rdIds || []), ...unassignedIds];
          } else {
            initialGroups.push({
              id: "default-group",
              name: "General Recurring Deposits",
              rdIds: unassignedIds,
            });
          }
        }
      }

      setLocalGroups(initialGroups);
      setNewGroupName("");
      setEditingGroupId(null);
    }
  }, [isOpen, rds, groups]);

  if (!isOpen) return null;

  const handleAddGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      rdIds: [],
    };

    setLocalGroups((prev) => [...prev, newGroup]);
    setNewGroupName("");
  };

  const handleDeleteGroup = (groupId) => {
    if (localGroups.length <= 1) {
      alert("At least one group must remain.");
      return;
    }

    const groupToDelete = localGroups.find((g) => g.id === groupId);
    const rdsToMove = groupToDelete ? groupToDelete.rdIds || [] : [];

    setLocalGroups((prev) => {
      const remaining = prev.filter((g) => g.id !== groupId);
      if (rdsToMove.length > 0 && remaining.length > 0) {
        remaining[0].rdIds = [...(remaining[0].rdIds || []), ...rdsToMove];
      }
      return remaining;
    });
  };

  const handleStartRename = (group) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleSaveRename = (groupId) => {
    if (!editingGroupName.trim()) return;
    setLocalGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, name: editingGroupName.trim() } : g
      )
    );
    setEditingGroupId(null);
    setEditingGroupName("");
  };

  const handleMoveGroup = (index, direction) => {
    const newGroups = [...localGroups];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newGroups.length) return;

    const [moved] = newGroups.splice(index, 1);
    newGroups.splice(targetIndex, 0, moved);
    setLocalGroups(newGroups);
  };

  const handleDragStart = (rdId, groupId) => {
    setDraggedRdId(rdId);
    setDraggedFromGroupId(groupId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetGroupId) => {
    if (!draggedRdId || !draggedFromGroupId || draggedFromGroupId === targetGroupId) {
      setDraggedRdId(null);
      setDraggedFromGroupId(null);
      return;
    }

    setLocalGroups((prev) => {
      return prev.map((g) => {
        if (g.id === draggedFromGroupId) {
          return {
            ...g,
            rdIds: (g.rdIds || []).filter((id) => id !== draggedRdId),
          };
        }
        if (g.id === targetGroupId) {
          return {
            ...g,
            rdIds: [...(g.rdIds || []), draggedRdId],
          };
        }
        return g;
      });
    });

    setDraggedRdId(null);
    setDraggedFromGroupId(null);
  };

  const handleMoveRd = (rdId, fromGroupId, toGroupId) => {
    setLocalGroups((prev) => {
      return prev.map((g) => {
        if (g.id === fromGroupId) {
          return {
            ...g,
            rdIds: (g.rdIds || []).filter((id) => id !== rdId),
          };
        }
        if (g.id === toGroupId) {
          return {
            ...g,
            rdIds: [...(g.rdIds || []), rdId],
          };
        }
        return g;
      });
    });
  };

  const handleSave = () => {
    onSaveGroups(localGroups);
    onClose();
  };

  // Move RD up/down within a group
  const handleMoveRdWithinGroup = (groupId, rdIndex, direction) => {
    setLocalGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const ids = [...(g.rdIds || [])];
        const targetIdx = rdIndex + direction;
        if (targetIdx < 0 || targetIdx >= ids.length) return g;
        const temp = ids[rdIndex];
        ids[rdIndex] = ids[targetIdx];
        ids[targetIdx] = temp;
        return { ...g, rdIds: ids };
      })
    );
  };

  const rdMap = new Map((rds || []).map((r) => [r.id, r]));

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-2.5 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-base-content/10 dark:border-base-content/10 my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-base-content/8 dark:border-base-content/8 bg-base-200/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-primary/15 text-primary shrink-0">
              <FolderTree size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base leading-tight truncate text-base-content">
                Organize Recurring Deposit Groups
              </h3>
              <p className="text-[10.5px] sm:text-xs text-base-content/60 font-medium mt-0.5 truncate">
                Create custom folders, re-order, and manage groups.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle rounded-full hover:bg-base-200 text-base-content/60 hover:text-base-content cursor-pointer shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
          
          {/* Add New Group Bar */}
          <form onSubmit={handleAddGroup} className="flex gap-2">
            <input
              type="text"
              placeholder="Create a new group (e.g., Short-term RDs, Tax Saver RDs)..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="input input-sm flex-1 rounded-xl bg-base-200/60 dark:bg-base-800/60 border border-base-content/10 dark:border-base-content/10 font-bold text-xs"
            />
            <button
              type="submit"
              disabled={!newGroupName.trim()}
              className="btn btn-sm btn-primary rounded-xl gap-1 font-black cursor-pointer"
            >
              <FolderPlus size={14} />
              <span className="hidden sm:inline">Add Group</span>
              <span className="sm:hidden">Add</span>
            </button>
          </form>

          {/* Groups */}
          <div className="space-y-3 sm:space-y-4">
            {localGroups.map((group, groupIdx) => {
              const groupRds = (group.rdIds || [])
                .map((id) => rdMap.get(id))
                .filter(Boolean);

              return (
                <div
                  key={group.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(group.id)}
                  className="p-3 sm:p-4 bg-base-200/40 rounded-2xl border border-base-content/8 dark:border-base-content/8 transition-all flex flex-col gap-2.5"
                >
                  {/* Group Header Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-base-content/8 dark:border-base-content/8">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingGroupName}
                            onChange={(e) => setEditingGroupName(e.target.value)}
                            className="input input-xs input-bordered rounded-lg font-bold flex-1"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(group.id)}
                            className="btn btn-xs btn-success text-white rounded-lg cursor-pointer"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-extrabold text-xs sm:text-sm text-base-content truncate">
                            {group.name}
                          </span>
                          <span className="badge badge-sm badge-neutral font-mono font-bold text-[10px] shrink-0">
                            {groupRds.length} RDs
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Group Management Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveGroup(groupIdx, -1)}
                        disabled={groupIdx === 0}
                        className="p-1 text-base-content/60 hover:text-base-content hover:bg-base-100 rounded-lg cursor-pointer disabled:opacity-30"
                        title="Move Group Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveGroup(groupIdx, 1)}
                        disabled={groupIdx === localGroups.length - 1}
                        className="p-1 text-base-content/60 hover:text-base-content hover:bg-base-100 rounded-lg cursor-pointer disabled:opacity-30"
                        title="Move Group Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartRename(group)}
                        className="p-1 text-info/70 hover:text-info hover:bg-info/10 rounded-lg cursor-pointer"
                        title="Rename Group"
                      >
                        <Edit2 size={13} />
                      </button>
                      {localGroups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-1 text-error/70 hover:text-error hover:bg-error/10 rounded-lg cursor-pointer"
                          title="Delete Group"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RDs inside this Group */}
                  <div className="space-y-1.5 min-h-[36px]">
                    {groupRds.length === 0 ? (
                      <div className="py-2.5 text-center text-base-content/40 italic font-medium text-xs">
                        No RDs in this group. Move RDs here or drag & drop.
                      </div>
                    ) : (
                      groupRds.map((rd, rdIdx) => (
                        <div
                          key={rd.id}
                          draggable
                          onDragStart={() => handleDragStart(rd.id, group.id)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2.5 sm:px-3 py-2 bg-base-100 rounded-xl border border-base-content/8 dark:border-base-content/8 shadow-2xs hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <GripVertical size={14} className="text-base-content/30 shrink-0" />
                            <PiggyBank size={14} className="text-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-xs truncate block text-base-content">{rd.bankName}</span>
                              <span className="text-[10px] opacity-60 font-medium block truncate">
                                {rd.interestRate}% p.a. • {rd.tenureText || `${rd.tenureValue} ${rd.tenureUnit}`}
                                {rd.rdNumber ? ` • #${rd.rdNumber}` : ""}
                              </span>
                            </div>
                          </div>

                          {/* Re-order arrows & Target Group dropdown (essential for phone view) */}
                          <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-base-content/8 dark:border-base-content/8 shrink-0">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveRdWithinGroup(group.id, rdIdx, -1)}
                                disabled={rdIdx === 0}
                                className="p-1 hover:bg-base-200 rounded text-base-content/60 hover:text-base-content disabled:opacity-20 cursor-pointer"
                                title="Move RD Up"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveRdWithinGroup(group.id, rdIdx, 1)}
                                disabled={rdIdx === (group.rdIds?.length || 0) - 1}
                                className="p-1 hover:bg-base-200 rounded text-base-content/60 hover:text-base-content disabled:opacity-20 cursor-pointer"
                                title="Move RD Down"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>

                            {/* Target Group Move Dropdown (Mobile-friendly alternative to drag-and-drop) */}
                            {localGroups.length > 1 && (
                              <select
                                value={group.id}
                                onChange={(e) => handleMoveRd(rd.id, group.id, e.target.value)}
                                className="select select-xs rounded-lg bg-base-200 border border-base-content/10 dark:border-base-content/10 text-[10px] font-bold max-w-[120px] sm:max-w-[130px] cursor-pointer"
                                title="Move RD to Group"
                              >
                                {localGroups.map((tg) => (
                                  <option key={tg.id} value={tg.id}>
                                    📁 {tg.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-base-content/8 dark:border-base-content/8 bg-base-200/40 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost font-bold rounded-xl text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-sm btn-primary text-white font-black rounded-xl gap-1 shadow-md text-xs cursor-pointer"
          >
            <Check size={14} />
            <span>Save Organization</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default OrganizeRdGroupsModal;
