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

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-base-100 border border-base-300 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-base-200 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
              <FolderTree size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-base-content">
                Organize Recurring Deposit Folders / Groups
              </h2>
              <p className="text-xs text-base-content/60 font-medium">
                Create custom folders and drag & drop or move RDs between them.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle text-base-content/70 hover:text-base-content"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          
          {/* Add New Group Bar */}
          <form onSubmit={handleAddGroup} className="flex gap-2">
            <input
              type="text"
              placeholder="Create a new group (e.g., Short-term RDs, Tax Saver RDs, High-Yield RDs)..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="input input-bordered input-sm sm:input-md flex-1 rounded-2xl font-bold text-xs"
            />
            <button
              type="submit"
              disabled={!newGroupName.trim()}
              className="btn btn-sm sm:btn-md btn-primary rounded-2xl gap-1 font-black"
            >
              <FolderPlus size={16} />
              <span>Add Group</span>
            </button>
          </form>

          {/* Groups Columns / Cards */}
          <div className="space-y-4">
            {localGroups.map((group, groupIdx) => {
              const groupRds = (group.rdIds || [])
                .map((id) => rds.find((f) => f.id === id))
                .filter(Boolean);

              return (
                <div
                  key={group.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(group.id)}
                  className="p-4 bg-base-200/40 rounded-2xl border border-base-300 transition-all flex flex-col gap-3"
                >
                  {/* Group Header Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-base-200">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
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
                            className="btn btn-xs btn-success text-white rounded-lg"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-base-content">
                            {group.name}
                          </span>
                          <span className="badge badge-sm badge-neutral font-mono font-bold text-[10px]">
                            {groupRds.length} RDs
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Group Management Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveGroup(groupIdx, -1)}
                        disabled={groupIdx === 0}
                        className="btn btn-xs btn-ghost btn-square"
                        title="Move Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveGroup(groupIdx, 1)}
                        disabled={groupIdx === localGroups.length - 1}
                        className="btn btn-xs btn-ghost btn-square"
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartRename(group)}
                        className="btn btn-xs btn-ghost text-info btn-square"
                        title="Rename Group"
                      >
                        <Edit2 size={13} />
                      </button>
                      {localGroups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="btn btn-xs btn-ghost text-error btn-square"
                          title="Delete Group"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RDs inside this Group */}
                  <div className="min-h-[50px] p-2 bg-base-100/60 rounded-xl border border-dashed border-base-300/80 flex flex-wrap gap-2 items-center">
                    {groupRds.length === 0 ? (
                      <p className="text-[11px] text-base-content/40 italic px-2 py-1 select-none">
                        Drop Recurring Deposits here or move from other groups.
                      </p>
                    ) : (
                      groupRds.map((rd) => (
                        <div
                          key={rd.id}
                          draggable
                          onDragStart={() => handleDragStart(rd.id, group.id)}
                          className="p-2 bg-base-200 rounded-xl border border-base-300 shadow-2xs flex items-center gap-2 cursor-grab active:cursor-grabbing text-xs hover:border-primary/50 transition-colors"
                        >
                          <GripVertical size={13} className="text-base-content/40 shrink-0" />
                          <PiggyBank size={14} className="text-primary shrink-0" />
                          <div className="min-w-0 flex flex-col">
                            <span className="font-bold truncate max-w-[140px] text-base-content">
                              {rd.bankName}
                            </span>
                            <span className="text-[10px] font-mono text-base-content/60">
                              ₹{Number(rd.amount || 0).toLocaleString()} • {rd.interestRate}%
                            </span>
                          </div>

                          {/* Quick Group Move Select */}
                          {localGroups.length > 1 && (
                            <select
                              value={group.id}
                              onChange={(e) => handleMoveRd(rd.id, group.id, e.target.value)}
                              className="select select-xs rounded-lg bg-base-100 text-[10px] font-bold py-0 h-6 min-h-0 ml-1"
                            >
                              {localGroups.map((g) => (
                                <option key={g.id} value={g.id}>
                                  {g.name}
                                </option>
                              ))}
                            </select>
                          )}
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
        <div className="p-4 border-t border-base-200 flex justify-end gap-2 bg-base-200/30">
          <button onClick={onClose} className="btn btn-sm btn-ghost font-bold rounded-xl">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-sm btn-primary font-black rounded-xl px-5">
            Save Group Changes
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default OrganizeRdGroupsModal;
