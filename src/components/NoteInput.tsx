import { useRef, useEffect, useState, useCallback } from "react";
import { updateArray } from "../utils/updateArray";

type Note = {
    id: number;
    text: string;
}

const STORAGE_KEY = "session_notes";


const NoteInput = () => {
    const [note, setNote] = useState<Note[]>([]);
    const [text, setText] = useState<string>("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const notesContainerRef = useRef<HTMLDivElement>(null);

    const handleButtonClick = useCallback(() => {
        // Use local text state directly
        if (!text.trim()) return alert("Note cannot be empty.");
        
        const newNote: Note = {
            id: Date.now(),
            text: text.trim(),
        };
        
        // Use functional update for state
        setNote(prevNotes => updateArray(prevNotes, newNote));
        setText(""); // clear input
        textareaRef.current?.focus(); // refocus textarea
    }, [text]); // Dependency on 'text' ensures we capture the latest input value

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    }

    const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>, id: number) => {
    const updatedNotes = note.map(n => 
        n.id === id ? { ...n, text: e.target.value } : n
    );
    setNote(updatedNotes);
};


    const toggleEdit = (id: number) => {
        // If the ID is already set, we stop editing (set to null), otherwise start editing
        setEditingId(prevId => prevId === id ? null : id);
    }

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    // LOAD
    useEffect (() => {
        try {
            const storedNotes = sessionStorage.getItem(STORAGE_KEY);
            if (storedNotes) {
                setNote(JSON.parse(storedNotes));
            }
            

        } catch (error) {
            console.error("Error loading notes from sessionStorage:", error);
        }
    }, [])

    // WRITE
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(note));
            console.log(`Notes saved to sessionStorage: ${JSON.stringify(note)}`);
        } catch (error) {
            console.error("Error saving note to sessionStorage:", error);
        }
    }, [note]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the key is Enter AND the target is the textarea
            // Prevents false triggers when other elements are focused
            if (e.key === 'Enter' && e.target === textareaRef.current) {
                e.preventDefault(); 
                // Call the stabilized handler function
                handleButtonClick(); 
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // CLEANUP: Remove the listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleButtonClick]); // Dependency on handleButtonClick (stable due to useCallback)

    // 3. SCROLL EFFECT: Scroll to the bottom whenever 'note' state changes
    useEffect(() => {
        if (notesContainerRef.current) {
            notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight;
        }
    }, [note]);


    return (
        <>
            <div>
                <textarea
                    placeholder="Take a note..."
                    ref={textareaRef}
                    onChange={handleChange}
                    value={text}
                    rows={4}
                    cols={50}>
                </textarea>

                <button onClick={handleButtonClick}>Add Note</button>
            </div>
            <div ref={notesContainerRef}>
                {note.map(n => (
                    <div key={n.id}>
                        {editingId === n.id ? (
                            <textarea
                                value={n.text}
                                onChange={(e) => handleEditChange(e, n.id)}
                                rows={3}
                                cols={40}
                            />
                        ) : (
                            <p>{n.text}</p>
                        )}
                        <a onClick={() => toggleEdit(n.id)} style={{ cursor: 'pointer' }}>
                            {editingId === n.id ? 'Done' : 'Edit'}
                        </a>
                    </div>
                ))}
                <button onClick={() => setNote([])}>Clear</button>
            </div>

            
        </>
    )
};

export default NoteInput;