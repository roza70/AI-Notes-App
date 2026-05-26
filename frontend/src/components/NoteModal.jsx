import React from "react";
import { apiFetch } from "../utils/api.js";
import { useToast } from "../context/ToastContext.jsx";

const NoteModal = ({ onClose, onNoteAdded, noteToEdit, onNoteUpdated }) => {
  const { showToast } = useToast();
  const [title, setTitle] = React.useState(noteToEdit ? noteToEdit.title : "");
  const [description, setDescription] = React.useState(noteToEdit ? noteToEdit.description : "");
  const [color, setColor] = React.useState(noteToEdit ? (noteToEdit.color || "white") : "white");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // ── AI summary states ──────────────────────────────
  const [summary, setSummary] = React.useState(
    noteToEdit?.summary || ""
  );
  const [summarizing, setSummarizing] = React.useState(false);
  // ──────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Note title is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint = noteToEdit ? `/api/notes/${noteToEdit._id}` : "/api/notes";
      const method = noteToEdit ? "PUT" : "POST";
      const res = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, color }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.message || (noteToEdit ? "Failed to update note" : "Failed to add note");
        setError(msg);
        showToast(msg, "error");
        return;
      }
      if (noteToEdit) {
        onNoteUpdated(data.note);
        showToast("Note updated successfully!", "success");
      } else {
        onNoteAdded(data.note);
        showToast("Note added successfully!", "success");
      }
      onClose();
    } catch (err) {
      setError("Could not save note. Is the server running?");
      showToast("Could not save note. Is the server running?", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── AI Summarize handler ───────────────────────────
  const handleSummarize = async () => {
    if (!noteToEdit?._id) {
      showToast("Save the note first before summarizing!", "error");
      return;
    }
    if (!description.trim()) {
      showToast("Add some description before summarizing!", "error");
      return;
    }
    setSummarizing(true);
    setSummary("");
    try {
      const res = await apiFetch(`/api/notes/${noteToEdit._id}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Summarization failed", "error");
        return;
      }
      setSummary(data.summary);
      showToast("Summary generated!", "success");
    } catch (err) {
      showToast("Could not summarize. Is the server running?", "error");
    } finally {
      setSummarizing(false);
    }
  };
  // ──────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-xl font-bold text-gray-800">
          {noteToEdit ? "Edit Note" : "Add New Note"}
        </h3>

        {error && (
          <p className="p-2 mb-3 text-sm text-red-600 rounded bg-red-50">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Note Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter note description"
              rows={4}
              className="w-full px-3 py-2 text-sm border rounded resize-y focus:outline-none focus:ring-2 focus:ring-teal-400"
              disabled={loading}
            />
          </div>

          {/* ── AI Summarize Button ── */}
          {noteToEdit && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleSummarize}
                disabled={summarizing}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-semibold text-white rounded bg-violet-500 hover:bg-violet-600 disabled:opacity-60"
              >
                {summarizing ? (
                  <>
                    <span className="animate-spin">⚙️</span> Summarizing...
                  </>
                ) : (
                  <>✨ Summarize with AI</>
                )}
              </button>

              {/* Summary Result Box */}
              {summary && (
                <div className="p-3 mt-3 border rounded-lg bg-violet-50 border-violet-200">
                  <p className="mb-1 text-xs font-semibold text-violet-600">
                    ✨ AI Summary
                  </p>
                  <p className="text-sm text-gray-700">{summary}</p>
                </div>
              )}
            </div>
          )}
          {/* ─────────────────────── */}

          {/* Color Picker */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Select Tag Color
            </label>
            <div className="flex gap-3">
              {[
                { value: "white", class: "bg-white border-gray-300 ring-gray-400" },
                { value: "blue", class: "bg-blue-100 border-blue-300 ring-blue-500" },
                { value: "green", class: "bg-emerald-100 border-emerald-300 ring-emerald-500" },
                { value: "purple", class: "bg-purple-100 border-purple-300 ring-purple-500" },
                { value: "red", class: "bg-rose-100 border-rose-300 ring-rose-500" },
                { value: "yellow", class: "bg-amber-100 border-amber-300 ring-amber-500" },
              ].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full border transition-all duration-200 ${c.class} ${
                    color === c.value
                      ? "scale-110 ring-2 ring-offset-2"
                      : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  title={c.value.charAt(0).toUpperCase() + c.value.slice(1)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-teal-500 rounded hover:bg-teal-600 disabled:opacity-60"
            >
              {loading
                ? noteToEdit ? "Saving..." : "Adding..."
                : noteToEdit ? "Save Changes" : "Add Note"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;