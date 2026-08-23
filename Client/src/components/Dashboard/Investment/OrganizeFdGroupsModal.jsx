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
    if (draggedFromGroupId === targetGroupId) return;

    setLocalGroups((prev) => {
      return prev.map((g) => {
        if (g.id === draggedFromGroupId) {
          return {
            ...g,
            fdIds: (g.fdIds || []).filter((id) => id !== draggedFdId),
          };
        }
        if (g.id === targetGroupId) {
          return {
            ...g,
            fdIds: [...(g.fdIds || []), draggedFdId],
          };
        }
        return g;
      });
    });

    setDraggedFdId(null);
    setDraggedFromGroupId(null);
  };

  const handleMoveFdWithinGroup = (groupId, fdId, direction) => {
    setLocalGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const ids = [...(g.fdIds || [])];
        const idx = ids.indexOf(fdId);
        if (idx === -1) return g;
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= ids.length) return g;
        const temp = ids[idx];
        ids[idx] = ids[targetIdx];
        ids[targetIdx] = temp;
        return { ...g, fdIds: ids };
      })
    );
  };

  const handleSave = () => {
    onSaveGroups(localGroups);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-base-300 my-auto flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-base-200 bg-base-200/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/15 text-primary">
              <FolderTree size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Organize Fixed Deposit Groups
              </h3>
              <p className="text-xs opacity-60 font-medium mt-0.5">
                Drag and drop FDs between custom folders and arrange custom ordering.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-xs btn-ghost btn-circle rounded-full hover:bg-base-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Add Group Bar */}
        <form onSubmit={handleAddGroup} className="p-4 border-b border-base-200 bg-base-100 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New Group Name (e.g. Tax Savers, High Yield, Senior Citizen)..."
            className="input input-sm flex-1 rounded-xl bg-base-200/60 border-base-300 text-xs font-semibold"
          />
          <button
            type="submit"
            className="btn btn-sm btn-primary rounded-xl font-bold gap-1 text-xs"
            disabled={!newGroupName.trim()}
          >
            <Plus size={14} />
            <span>Add Group</span>
          </button>
        </form>

        {/* Groups & FDs Drag-Drop List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {localGroups.map((group) => (
            <div
              key={group.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnGroup(e, group.id)}
              className="p-3 rounded-2xl bg-base-200/40 border-2 border-dashed border-base-300 hover:border-primary/50 transition-colors space-y-2.5"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {editingGroupId === group.id ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingGroupName}
                        onChange={(e) => setEditingGroupName(e.target.value)}
                        className="input input-xs rounded-lg bg-base-100 border-base-300 text-xs font-bold flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRenameGroup(group.id)}
                        className="btn btn-xs btn-primary btn-circle"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-extrabold text-sm text-base-content tracking-tight truncate">
                        {group.name}
                      </span>
                      <span className="badge badge-xs font-bold bg-base-300">
                        {group.fdIds?.length || 0} FD{(group.fdIds?.length || 0) !== 1 ? "s" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartRenameGroup(group)}
                        className="p-1 text-base-content/40 hover:text-base-content rounded-lg"
                      >
                        <Edit2 size={12} />
                      </button>
                    </>
                  )}
                </div>

                {localGroups.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1 text-error/60 hover:text-error rounded-lg"
                    title="Delete Group"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* FD List Inside Group */}
              <div className="space-y-1.5 min-h-[40px]">
                {(group.fdIds || []).length === 0 ? (
                  <div className="py-2.5 text-center text-base-content/40 italic font-medium">
                    Drag and drop FDs here
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
                        className="p-2 rounded-xl bg-base-100 border border-base-200 flex items-center justify-between gap-2 shadow-2xs hover:shadow-sm cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical size={14} className="text-base-content/30 shrink-0" />
                          <Landmark size={14} className="text-primary shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-xs truncate block">{fd.bankName}</span>
                            <span className="text-[10px] opacity-60 font-medium block">
                              {fd.interestRate}% p.a. • {fd.tenureValue} {fd.tenureUnit}
                              {fd.fdNumber ? ` • #${fd.fdNumber}` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveFdWithinGroup(group.id, fdId, "up")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-base-200 rounded disabled:opacity-20"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveFdWithinGroup(group.id, fdId, "down")}
                            disabled={idx === (group.fdIds?.length || 0) - 1}
                            className="p-1 hover:bg-base-200 rounded disabled:opacity-20"
                          >
                            <ArrowDown size={12} />
                          </button>
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
        <div className="p-4 border-t border-base-200 bg-base-200/50 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost font-bold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-sm btn-primary text-white font-black rounded-xl gap-1 shadow-md"
          >
            <Check size={14} />
            <span>Save Group Organization</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default OrganizeFdGroupsModal;
