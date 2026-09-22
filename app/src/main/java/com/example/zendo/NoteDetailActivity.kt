package com.example.zendo

import android.os.Bundle
import android.view.inputmethod.InputMethodManager
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.example.zendo.databinding.ActivityNoteDetailBinding
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class NoteDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityNoteDetailBinding
    private lateinit var viewModel: NoteViewModel
    private var saveJob: Job? = null
    private var noteId: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNoteDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this).get(NoteViewModel::class.java)

        noteId = intent.getIntExtra("noteId", -1)
        val noteTitle = intent.getStringExtra("noteTitle")
        binding.editNote.setText(noteTitle)

        // Auto-focus and open keyboard
        binding.editNote.requestFocus()
        binding.editNote.postDelayed({
            val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
            imm.showSoftInput(binding.editNote, InputMethodManager.SHOW_IMPLICIT)
            binding.editNote.setSelection(binding.editNote.text?.length ?: 0)
        }, 200)

        // Auto-save feature with debounce
        binding.editNote.addTextChangedListener { text ->
            saveJob?.cancel()
            saveJob = lifecycleScope.launch {
                delay(1000) // 1 second delay
                if (noteId != -1) {
                    viewModel.update(Note(id = noteId, title = text.toString()))
                }
            }
        }

        binding.buttonSave.setOnClickListener {
            if (noteId != -1) {
                viewModel.update(Note(id = noteId, title = binding.editNote.text.toString()))
            }
            finish()
        }
    }
}