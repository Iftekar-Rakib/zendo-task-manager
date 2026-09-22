package com.example.zendo

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class NotesAdapter(
    private var noteList: List<Note>,
    private val onClick: (Note) -> Unit,
    private val onLongClick: (Note) -> Unit
) : RecyclerView.Adapter<NotesAdapter.NoteViewHolder>() {

    private var filteredList = noteList

    fun updateData(newNotes: List<Note>) {
        noteList = newNotes
        filteredList = newNotes
        notifyDataSetChanged()
    }

    fun filter(query: String) {
        filteredList = if (query.isEmpty()) {
            noteList
        } else {
            noteList.filter { it.title.contains(query, ignoreCase = true) }
        }
        notifyDataSetChanged()
    }

    class NoteViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textNote: TextView = view.findViewById(R.id.textNote)
        val btnDelete: View = view.findViewById(R.id.btnDeleteNote)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NoteViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_note, parent, false)
        return NoteViewHolder(view)
    }

    override fun onBindViewHolder(holder: NoteViewHolder, position: Int) {
        val note = filteredList[position]
        holder.textNote.text = note.title

        // Random Zen background colors
        val colors = listOf("#FEF3C7", "#E0F2FE", "#DCFCE7", "#F3E8FF", "#FFEDD5")
        val color = Color.parseColor(colors[position % colors.size])
        (holder.itemView as? com.google.android.material.card.MaterialCardView)?.setCardBackgroundColor(color)

        holder.itemView.setOnClickListener {
            onClick(note)
        }

        holder.btnDelete.setOnClickListener {
            onLongClick(note)
        }

        holder.itemView.setOnLongClickListener {
            onLongClick(note)
            true
        }
    }

    override fun getItemCount(): Int = filteredList.size
}