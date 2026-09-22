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
  Landmark,
} from "lucide-react";

const OrganizeFdGroupsModal = ({ isOpen, onClose, fds = [], groups = [], onSaveGroups }) => {
  const [localGroups, setLocalGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  
  // Drag State
  const [draggedFdId, setDraggedFdId] = useState(null);
  const [draggedFromGroupId, setDraggedFromGroupId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const allFdIds = fds.map((f) => f.id);
      let initialGroups = structuredClone(groups || []);

      if (initialGroups.length === 0) {
        initialGroups = [
          {
            id: "default-group",
            name: "General Fixed Deposits",
            fdIds: allFdIds,
          },
        ];
      } else {
        const assignedIds = new Set();
        initialGroups.forEach((g) => {
          (g.fdIds || []).forEach((id) => assignedIds.add(id));
        });

        const unassignedIds = allFdIds.filter((id) => !assignedIds.has(id));
        if (unassignedIds.length > 0) {
          if (initialGroups[0]) {
            initialGroups[0].fdIds = [...(initialGroups[0].fdIds || []), ...unassignedIds];
          } else {
            initialGroups.push({
              id: "default-group",
              name: "General Fixed Deposits",
              fdIds: unassignedIds,
            });
          }
        }
      }

      setLocalGroups(initialGroups);
      setNewGroupName("");
      setEditingGroupId(null);
    }
  }, [isOpen, fds, groups]);

  if (!isOpen) return null;

  const fdMap = new Map((fds || []).map((f) => [f.id, f]));

  const handleAddGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const newGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      fdIds: [],
    };
    setLocalGroups((prev) => [...prev, newGroup]);
    setNewGroupName("");
  };

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

  const handleDeleteGroup = (groupId) => {
    const groupToDelete = localGroups.find((g) => g.id === groupId);
    if (!groupToDelete) return;
    const remainingGroups = localGroups.filter((g) => g.id !== groupId);

    if (groupToDelete.fdIds?.length > 0) {
      if (remainingGroups.length > 0) {
        remainingGroups[0].fdIds = [
          ...(remainingGroups[0].fdIds || []),
          ...groupToDelete.fdIds,
        ];
      } else {
        remainingGroups.push({
          id: "default-group",
          name: "General Fixed Deposits",
          fdIds: groupToDelete.fdIds,
        });
      }
    }

    setLocalGroups(remainingGroups);
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

  // Move FD Up/Down within a group
  const handleMoveFdWithinGroup = (groupId, fdIndex, direction) => {
    setLocalGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const ids = [...(g.fdIds || [])];
        const targetIdx = fdIndex + direction;
        if (targetIdx < 0 || targetIdx >= ids.length) return g;
        const temp = ids[fdIndex];
        ids[fdIndex] = ids[targetIdx];
        ids[targetIdx] = temp;
        return { ...g, fdIds: ids };
      })
    );
  };

  // Move FD to another group
  const handleMoveFdToGroup = (fdId, fromGroupId, toGroupId) => {
    if (fromGroupId === toGroupId) return;
    setLocalGroups((prev) =>
      prev.map((g) => {
        if (g.id === fromGroupId) {
          return {
            ...g,
            fdIds: (g.fdIds || []).filter((id) => id !== fdId),
          };
        }
        if (g.id === toGroupId) {
          return {
            ...g,
            fdIds: [...(g.fdIds || []), fdId],
          };
        }
        return g;
      })
    );
  };

  const handleDragStart = (e, fdId, fromGroupId) => {
    setDraggedFdId(fdId);
    setDraggedFromGroupId(fromGroupId);
    e.dataTransfer.setData("text/plain", fdId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnGroup = (e, targetGroupId) => {
    e.preventDefault();
    if (!draggedFdId || !draggedFromGroupId) return;
    handleMoveFdToGroup(draggedFdId, draggedFromGroupId, targetGroupId);
    setDraggedFdId(null);
    setDraggedFromGroupId(null);
  };

  const handleSave = () => {
    onSaveGroups(localGroups);
    onClose();
  };

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
                Organize Fixed Deposit Groups
              </h3>
              <p className="text-[10.5px] sm:text-xs text-base-content/60 font-medium mt-0.5 truncate">
                Organize FDs across custom folders, re-order, and manage groups.
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

        {/* Add Group Bar */}
        <form onSubmit={handleAddGroup} className="p-3 sm:p-4 border-b border-base-content/8 dark:border-base-content/8 bg-base-100 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New Group Name (e.g. Tax Savers, High Yield, Senior Citizen)..."
            className="input input-sm flex-1 rounded-xl bg-base-200/60 border border-base-content/10 text-xs font-semibold focus:border-primary"
          />
          <button
            type="submit"
            className="btn btn-sm btn-primary rounded-xl font-bold gap-1 text-xs shrink-0 cursor-pointer disabled:opacity-50"
            disabled={!newGroupName.trim()}
          >
            <Plus size={14} />
            <span>Add Group</span>
          </button>
        </form>

        {/* Groups & FDs Drag-Drop List */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-4 text-xs">
          {localGroups.map((group, gIdx) => (
            <div
              key={group.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnGroup(e, group.id)}
              className="p-3 sm:p-4 rounded-2xl bg-base-200/40 dark:bg-base-300/20 border border-base-content/8 dark:border-base-content/8 space-y-2.5 transition-colors"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-base-content/8">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                  {editingGroupId === group.id ? (
                    <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                      <input
                        type="text"
                        value={editingGroupName}
                        onChange={(e) => setEditingGroupName(e.target.value)}
                        className="input input-xs rounded-lg bg-base-100 border-primary text-xs font-bold flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRenameGroup(group.id)}
                        className="p-1 text-success hover:bg-success/10 rounded cursor-pointer"
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-extrabold text-xs sm:text-sm text-base-content tracking-tight truncate">
                        {group.name}
                      </span>
                      <span className="px-1.5 sm:px-2 py-0.2 rounded-full bg-primary/15 text-primary text-[9.5px] sm:text-[10px] font-bold border border-primary/20 shrink-0">
                        {group.fdIds?.length || 0} FD{(group.fdIds?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </div>

                {/* Group Controls */}
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartRenameGroup(group)}
                    className="p-1 text-base-content/60 hover:text-base-content hover:bg-base-100 rounded-lg cursor-pointer"
                    title="Rename Group"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveGroup(gIdx, -1)}
                    disabled={gIdx === 0}
                    className="p-1 text-base-content/60 hover:text-base-content hover:bg-base-100 rounded-lg cursor-pointer disabled:opacity-30"
                    title="Move Group Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveGroup(gIdx, 1)}
                    disabled={gIdx === localGroups.length - 1}
                    className="p-1 text-base-content/60 hover:text-base-content hover:bg-base-100 rounded-lg cursor-pointer disabled:opacity-30"
                    title="Move Group Down"
                  >
                    <ArrowDown size={13} />
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

              {/* FD List Inside Group */}
              <div className="space-y-1.5 min-h-[36px]">
                {(group.fdIds || []).length === 0 ? (
                  <div className="py-2.5 text-center text-base-content/40 italic font-medium">
                    No FDs in this group. Move FDs here or drag & drop.
                  </div>
                ) : (
                  (group.fdIds || []).map((fdId, idx) => {
                    const fd = fdMap.get(fdId);
                    if (!fd) return null;

                    return (
                      <div
                        key={fdId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, fdId, group.id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2.5 sm:px-3 py-2 bg-base-100 rounded-xl border border-base-content/8 dark:border-base-content/8 shadow-2xs hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <GripVertical size={14} className="text-base-content/30 shrink-0" />
                          <Landmark size={14} className="text-primary shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs truncate block text-base-content">{fd.bankName}</span>
                            <span className="text-[10px] opacity-60 font-medium block truncate">
                              {fd.interestRate}% p.a. • {fd.tenureText || `${fd.tenureValue} ${fd.tenureUnit}`}
                              {fd.fdNumber ? ` • #${fd.fdNumber}` : ""}
                            </span>
                          </div>
                        </div>

                        {/* Re-order arrows & Target Group dropdown (essential for phone view) */}
                        <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-base-200/60 shrink-0">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveFdWithinGroup(group.id, idx, -1)}
                              disabled={idx === 0}
                              className="p-1 hover:bg-base-200 rounded text-base-content/60 hover:text-base-content disabled:opacity-20 cursor-pointer"
                              title="Move FD Up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveFdWithinGroup(group.id, idx, 1)}
                              disabled={idx === (group.fdIds?.length || 0) - 1}
                              className="p-1 hover:bg-base-200 rounded text-base-content/60 hover:text-base-content disabled:opacity-20 cursor-pointer"
                              title="Move FD Down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>

                          {/* Target Group Move Dropdown (Mobile-friendly alternative to drag-and-drop) */}
                          {localGroups.length > 1 && (
                            <select
                              value={group.id}
                              onChange={(e) => handleMoveFdToGroup(fd.id, group.id, e.target.value)}
                              className="select select-xs rounded-lg bg-base-200 border-base-300 text-[10px] font-bold max-w-[130px] cursor-pointer"
                              title="Move FD to Group"
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
                    );
                  })
                )}
              </div>

            </div>
          ))}
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

export default OrganizeFdGroupsModal;
