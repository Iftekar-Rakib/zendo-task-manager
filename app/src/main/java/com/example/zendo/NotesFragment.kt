package com.example.zendo

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton

class NotesFragment : Fragment() {

    private lateinit var viewModel: NoteViewModel
    private lateinit var adapter: NotesAdapter
    private lateinit var emptyState: View

    private val editNoteLauncher =
        registerForActivityResult(
            androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()
        ) { 
            // Note: Data is saved automatically in NoteDetailActivity.
            // Room's LiveData will update the list automatically.
        }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val view = inflater.inflate(R.layout.fragment_notes, container, false)

        val recyclerView = view.findViewById<RecyclerView>(R.id.recyclerViewNotes)
        val fab = view.findViewById<FloatingActionButton>(R.id.fabAddNote)
        val etSearchNotes = view.findViewById<android.widget.EditText>(R.id.etSearchNotes)
        emptyState = view.findViewById(R.id.emptyStateNotes)

        viewModel = ViewModelProvider(requireActivity()).get(NoteViewModel::class.java)

        recyclerView.layoutManager = GridLayoutManager(requireContext(), 2)
        
        adapter = NotesAdapter(
            emptyList(),
            onClick = { note ->
                val intent = Intent(requireContext(), NoteDetailActivity::class.java)
                intent.putExtra("noteId", note.id)
                intent.putExtra("noteTitle", note.title)
                editNoteLauncher.launch(intent)
            },
            onLongClick = { note ->
                viewModel.delete(note)
                Toast.makeText(requireContext(), "Note Deleted", Toast.LENGTH_SHORT).show()
            }
        )

        recyclerView.adapter = adapter

        etSearchNotes.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                adapter.filter(s.toString())
            }
            override fun afterTextChanged(s: android.text.Editable?) {}
        })

        viewModel.allNotes.observe(viewLifecycleOwner) { notes ->
            val isFirstLoad = adapter.itemCount == 0
            adapter.updateData(notes)
            emptyState.visibility = if (notes.isEmpty()) View.VISIBLE else View.GONE

            if (isFirstLoad && notes.isNotEmpty()) {
                recyclerView.scheduleLayoutAnimation()
            }
        }

        fab.setOnClickListener {
            val noteCount = viewModel.allNotes.value?.size ?: 0
            val newNoteTitle = "New Note ${noteCount + 1}"
            viewModel.insert(Note(title = newNoteTitle))
            Toast.makeText(requireContext(), "Note Added", Toast.LENGTH_SHORT).show()
        }

        return view
    }
}