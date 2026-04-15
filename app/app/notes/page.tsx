"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Pencil, Trash2, FileText } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteFormData {
  title: string;
  content: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState<NoteFormData>({ title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notes");
      if (!response.ok) {
        throw new Error("Failed to load notes");
      }
      const notesData = await response.json();
      setNotes(notesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setFormData({ title: "", content: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content || "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setFormData({ title: "", content: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingNote) {
        const response = await fetch(`/api/notes/${editingNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content || undefined,
          }),
        });
        if (!response.ok) throw new Error("Failed to update note");
        const updatedNote = await response.json();
        setNotes(notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
      } else {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content || undefined,
          }),
        });
        if (!response.ok) throw new Error("Failed to create note");
        const newNote = await response.json();
        setNotes([newNote, ...notes]);
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete note");
      setNotes(notes.filter((n) => n.id !== noteId));
      if (expandedNoteId === noteId) {
        setExpandedNoteId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const toggleExpand = (noteId: string) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notes</h1>
            <p className="text-muted-foreground mt-1">Manage your personal notes</p>
          </div>
          <Button onClick={openCreateModal} data-testid="notes-create-button">
            Create Note
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="relative">
            <AlertDescription>{error}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError("")}
              className="absolute top-2 right-2"
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading notes...</p>
          </div>
        )}

        {!isLoading && notes.length === 0 && (
          <Card
            className="border border-border shadow-sm text-center p-12"
            data-testid="notes-empty-state"
          >
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No notes yet</h3>
              <p className="text-muted-foreground">Create your first note to get started</p>
              <Button onClick={openCreateModal} className="mt-4">
                Create Your First Note
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && notes.length > 0 && (
          <div className="grid gap-3" data-testid="notes-list">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="border border-border shadow-sm cursor-pointer transition-all hover:shadow-md"
                onClick={() => toggleExpand(note.id)}
                data-testid={`note-card-${note.title}`}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex-1">
                    <CardTitle className="text-foreground font-semibold mb-2">
                      {note.title}
                    </CardTitle>
                    {expandedNoteId === note.id ? (
                      <p
                        className="text-sm text-foreground whitespace-pre-wrap"
                        data-testid="note-content"
                      >
                        {note.content || "No content"}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {note.content || "No content"}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(note);
                      }}
                      title="Edit note"
                      data-testid="note-edit-button"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className="text-destructive hover:text-destructive"
                      title="Delete note"
                      data-testid="note-delete-button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="note-dialog">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl">
              {editingNote ? "Edit Note" : "Create Note"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingNote ? "Make changes to your note." : "Add a new note to your collection."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground text-sm">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Note title"
                required
                autoFocus
                className="h-12 bg-input border-0 rounded-xl"
                data-testid="note-dialog-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-foreground text-sm">
                Content
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                placeholder="Write your note content here..."
                className="resize-none bg-input border-0 rounded-xl"
                data-testid="note-dialog-content-input"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className="flex-1"
                data-testid="note-dialog-save-button"
              >
                {isSubmitting ? "Saving..." : editingNote ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
