import React, { useState, useEffect, useRef, useMemo } from "react";
import dayjs from "dayjs";
import { 
  Bold, 
  Italic, 
  List, 
  Trash2, 
  X, 
  Save, 
  Calendar, 
  Smile, 
  FileText, 
  Sparkles, 
  Clock 
} from "lucide-react";

const JournalPopUp = ({
  isOpen,
  onClose,
  initialData,
  initialMood,
  date,
  onSave
}) => {
  const [journalText, setJournalText] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const textareaRef = useRef(null);

  const moodOptions = [
    { label: "Amazing", emoji: "🤩", color: "bg-blue-500/10 text-blue-500 border-blue-500/30 ring-blue-500/40" },
    { label: "Happy", emoji: "🙂", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 ring-emerald-500/40" },
    { label: "Okay", emoji: "😐", color: "bg-amber-500/10 text-amber-500 border-amber-500/30 ring-amber-500/40" },
    { label: "Productive", emoji: "🚀", color: "bg-purple-500/10 text-purple-500 border-purple-500/30 ring-purple-500/40" },
    { label: "Sad", emoji: "😔", color: "bg-red-500/10 text-red-500 border-red-500/30 ring-red-500/40" },
    { label: "Tired", emoji: "😫", color: "bg-orange-500/10 text-orange-500 border-orange-500/30 ring-orange-500/40" },
  ];

  useEffect(() => {
    if (isOpen) {
      setJournalText(initialData || "");
      setSelectedMood(initialMood || "");
    }
  }, [initialData, initialMood, isOpen]);

  const handleSave = () => {
    onSave(journalText, selectedMood);
    onClose();
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your journal entry for this day?")) {
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
      newCursorPos = end + 4;
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
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Word and Character Calculations
  const wordCount = useMemo(() => {
    if (!journalText || !journalText.trim()) return 0;
    return journalText.trim().split(/\s+/).length;
  }, [journalText]);

  const charCount = journalText ? journalText.length : 0;

  // Date Formatting
  const formattedDate = useMemo(() => {
    if (!date) return dayjs().format("MMMM D, YYYY");
    return dayjs(date).format("MMMM D, YYYY");
  }, [date]);

  const formattedDay = useMemo(() => {
    if (!date) return dayjs().format("dddd");
    return dayjs(date).format("dddd");
  }, [date]);

  const isToday = useMemo(() => {
    if (!date) return true;
    return dayjs(date).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");
  }, [date]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-4xl h-[680px] flex flex-col overflow-hidden border border-base-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-base-200/80 border-b border-base-300 p-3 sm:p-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border border-primary/20 shadow-2xs">
              ✍️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-base-content">Daily Journal</h2>
                {isToday && (
                  <span className="badge badge-primary badge-sm font-semibold">Today</span>
                )}
              </div>
              <p className="text-xs text-base-content/70 flex items-center gap-1.5 mt-0.5 font-medium">
                <Calendar size={13} className="text-primary" />
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="text-primary/90 font-semibold">{formattedDay}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mood Selector Section */}
        <div className="bg-base-100 border-b border-base-200 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-bold text-base-content/70 flex items-center gap-1.5 uppercase tracking-wider">
            <Smile size={15} className="text-accent" /> Select Mood:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {moodOptions.map((m) => {
              const isSelected = selectedMood === m.label;
              return (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelectedMood(isSelected ? "" : m.label)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5 ${
                    isSelected
                      ? `${m.color} ring-2 font-bold scale-105 shadow-2xs`
                      : "bg-base-200/50 border-base-300 text-base-content/70 hover:bg-base-200 hover:text-base-content"
                  }`}
                >
                  <span className="text-sm">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rich Text Toolbar & Dynamic Word/Char Counters */}
        <div className="bg-base-200/50 border-b border-base-300 px-4 py-1.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={() => insertFormat('bold')} 
              className="btn btn-sm btn-ghost hover:bg-base-300/80" 
              title="Bold (**text**)"
            >
              <Bold size={16} />
            </button>
            <button 
              type="button"
              onClick={() => insertFormat('italic')} 
              className="btn btn-sm btn-ghost hover:bg-base-300/80" 
              title="Italic (*text*)"
            >
              <Italic size={16} />
            </button>
            <button 
              type="button"
              onClick={() => insertFormat('list')} 
              className="btn btn-sm btn-ghost hover:bg-base-300/80" 
              title="Bullet List (- item)"
            >
              <List size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-base-content/60 bg-base-100/60 px-3 py-1 rounded-xl border border-base-300/60">
            <span className="font-semibold text-primary">{wordCount} <span className="font-normal text-base-content/60">words</span></span>
            <span>•</span>
            <span className="font-semibold">{charCount} <span className="font-normal text-base-content/60">chars</span></span>
          </div>

          <button 
            type="button"
            onClick={handleClear} 
            className="btn btn-sm btn-ghost text-error hover:bg-error/10" 
            title="Clear Entry"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {/* Editor Writing Area - Expanded Vertically */}
        <div className="flex-1 p-4 relative bg-base-100 overflow-hidden flex flex-col min-h-0">
          <textarea
            ref={textareaRef}
            className="w-full flex-1 h-full min-h-[350px] p-5 resize-none focus:outline-none bg-base-200/20 rounded-2xl border border-base-300/70 text-base sm:text-lg leading-relaxed placeholder:opacity-40 focus:ring-2 focus:ring-primary/30 transition-all font-serif custom-scrollbar"
            placeholder="Write down your thoughts, daily achievements, gratitude, or reflections for this day..."
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
          ></textarea>
        </div>

        {/* Footer Bar */}
        <div className="bg-base-200/80 border-t border-base-300 p-3 px-6 flex justify-between items-center shrink-0">
          <div className="text-xs text-base-content/60 flex items-center gap-1.5">
            <Sparkles size={14} className="text-warning" />
            <span>Auto-format supported (**bold**, *italic*)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary px-6 gap-2 shadow-md hover:shadow-lg transition-all rounded-xl" onClick={handleSave}>
              <Save size={18} />
              Save Entry
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JournalPopUp;
