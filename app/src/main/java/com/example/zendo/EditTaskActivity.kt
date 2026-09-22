package com.example.zendo

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity

class EditTaskActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edit_task)

        val editTask = findViewById<EditText>(R.id.editTask)
        val buttonSave = findViewById<Button>(R.id.buttonSave)

        // get old task
        val oldTask = intent.getStringExtra("task")
        editTask.setText(oldTask)

        // save button
        buttonSave.setOnClickListener {

            val newTask = editTask.text.toString()

            val resultIntent = intent
            resultIntent.putExtra("updatedTask", newTask)
            resultIntent.putExtra("oldTask", oldTask)

            setResult(RESULT_OK, resultIntent)
            finish()
        }
    }
}