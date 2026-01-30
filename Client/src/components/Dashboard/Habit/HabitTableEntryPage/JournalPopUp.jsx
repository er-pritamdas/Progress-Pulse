import React, { useState, useEffect, useRef } from "react";
import { Bold, Italic, List, Trash2, X, Save, RotateCcw } from "lucide-react";

const JournalPopUp = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const [journalText, setJournalText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setJournalText(initialData || "");
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave(journalText);
    onClose();
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your journal entry?")) {
      setJournalText("");
    }
  };

  const insertFormat = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = journalText;
    const selectedText = text.substring(start, end);

    let newText = text;
    let newCursorPos = end;

    if (type === 'bold') {
      newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
      newCursorPos = end + 4; // cursor after **text** or inside ****
      if (selectedText.length === 0) newCursorPos = start + 2;
    } else if (type === 'italic') {
       newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
       newCursorPos = end + 2;
       if (selectedText.length === 0) newCursorPos = start + 1;
    } else if (type === 'list') {
       const prefix = "\n- ";
       newText = text.substring(0, start) + prefix + selectedText + text.substring(end);
       newCursorPos = end + prefix.length;
    }

    setJournalText(newText);
    
    // Defer cursor update to allow react render
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh] animate-scale-up">
        
        {/* Header */}
        <div className="bg-base-200 border-b border-base-300 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                <h2 className="text-xl font-bold text-base-content">Daily Journal</h2>
            </div>
            <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
                <X size={20} />
            </button>
        </div>

        {/* Toolbar */}
        <div className="bg-base-100 border-b border-base-300 p-2 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => insertFormat('bold')} 
                    className="btn btn-sm btn-ghost tooltip" 
                    data-tip="Bold"
                >
                    <Bold size={16} />
                </button>
                <button 
                    onClick={() => insertFormat('italic')} 
                    className="btn btn-sm btn-ghost tooltip" 
                    data-tip="Italic"
                >
                    <Italic size={16} />
                </button>
                <button 
                    onClick={() => insertFormat('list')} 
                    className="btn btn-sm btn-ghost tooltip" 
                    data-tip="Bullet List"
                >
                    <List size={16} />
                </button>
            </div>

            <div className="flex items-center gap-1">
                 <button 
                    onClick={handleClear} 
                    className="btn btn-sm btn-ghost text-error tooltip tooltip-left" 
                    data-tip="Clear All"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 p-0 relative bg-base-100">
            <textarea
                ref={textareaRef}
                className="w-full h-[50vh] p-6 resize-none focus:outline-none bg-transparent text-lg leading-relaxed placeholder:opacity-40"
                placeholder="What's on your mind today? Capture your thoughts, wins, or ideas..."
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
            ></textarea>
        </div>

        {/* Footer */}
        <div className="bg-base-200 border-t border-base-300 p-4 flex justify-end gap-3">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary px-6 gap-2" onClick={handleSave}>
            <Save size={18} />
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalPopUp;
