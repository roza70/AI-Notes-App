import React from "react";
import Navbar from "../components/navbar.jsx";
import NoteModal from "../components/NoteModal.jsx";
import { apiFetch } from "../utils/api.js";
import { useToast } from "../context/ToastContext.jsx";

const Home = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [notes, setNotes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selectedNoteToEdit, setSelectedNoteToEdit] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchNotes = React.useCallback(async () => {
    setError("");
    try {
      const res = await apiFetch("/api/notes");
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load notes");
        return;
      }
      setNotes(data.notes);
    } catch (err) {
      if (err.message !== "Unauthorized") {
        setError("Could not load notes. Is the server running?");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Real-time record filtering
  const filteredNotes = React.useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        (note.description && note.description.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  const handleNoteAdded = (note) => {
    setNotes((prev) => [note, ...prev]);
  };

  const handleNoteUpdated = (updatedNote) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
    );
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    setError("");
    try {
      const res = await apiFetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n._id !== id));
        showToast("Note deleted successfully", "success");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete note");
        showToast(data.message || "Failed to delete note", "error");
      }
    } catch (err) {
      setError("Could not delete note. Is the server running?");
      showToast("Could not delete note. Is the server running?", "error");
    }
  };

  // Get matching CSS colors for note tags
  const getColorStyles = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-50/40 border-blue-200 border-t-blue-500";
      case "green":
        return "bg-emerald-50/40 border-emerald-200 border-t-emerald-500";
      case "purple":
        return "bg-purple-50/40 border-purple-200 border-t-purple-500";
      case "red":
        return "bg-rose-50/40 border-rose-200 border-t-rose-500";
      case "yellow":
        return "bg-amber-50/40 border-amber-200 border-t-amber-500";
      default:
        return "bg-white border-gray-200 border-t-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#e2e8f0]">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <button
        type="button"
        onClick={() => {
          setSelectedNoteToEdit(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 bg-teal-500 text-white text-2xl w-14 h-14 rounded-full shadow-lg hover:bg-teal-600 transition z-40 flex items-center justify-center font-bold"
        aria-label="Add new note"
      >
        +
      </button>

      {isModalOpen && (
        <NoteModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNoteToEdit(null);
          }}
          onNoteAdded={handleNoteAdded}
          noteToEdit={selectedNoteToEdit}
          onNoteUpdated={handleNoteUpdated}
        />
      )}

      <main className="w-full px-6 py-6 pb-24">
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded max-w-3xl mx-auto">{error}</p>
        )}

        {loading ? (
          <p className="text-gray-500 max-w-3xl mx-auto">Loading notes...</p>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 max-w-md mx-auto">
            {/* Elegant Premium SVG Illustration for Empty States */}
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4 opacity-80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              ></path>
            </svg>
            <p className="text-gray-600 font-semibold text-lg mb-1">
              {searchQuery ? "No matches found" : "No notes yet"}
            </p>
            <p className="text-gray-400 text-sm">
              {searchQuery
                ? "Try searching for a different keyword or filter term."
                : "Create your first note to begin organizing your thoughts."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={`border border-t-4 rounded shadow-sm p-4 relative min-h-[110px] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${getColorStyles(
                  note.color
                )}`}
              >
                <div>
                  <h3 className="font-semibold text-gray-800 text-base mb-1">
                    {note.title}
                  </h3>
                  {note.description && (
                    <p className="text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
                      {note.description}
                    </p>
                  )}
                </div>
                <div className="flex justify-end items-center gap-2 mt-4 self-end w-full">
                  <button
                    onClick={() => {
                      setSelectedNoteToEdit(note);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                    title="Edit Note"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    title="Delete Note"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
