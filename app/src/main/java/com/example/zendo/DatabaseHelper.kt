package com.example.zendo

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class DatabaseHelper(context: Context) :
    SQLiteOpenHelper(context, "TodoDB", null, 4) { // Version bumped to 4

    override fun onCreate(db: SQLiteDatabase) {

        // Tasks table
        db.execSQL(
            "CREATE TABLE tasks(" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "task TEXT, " +
                    "description TEXT, " +
                    "time TEXT, " +
                    "color INTEGER, " +
                    "isDone INTEGER)"
        )

        // Notes table
        db.execSQL(
            "CREATE TABLE notes(" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "title TEXT)"
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS tasks")
        db.execSQL("DROP TABLE IF EXISTS notes")
        onCreate(db)
    }

    // ================= TASK FUNCTIONS =================

    fun insertTask(task: Task) {
        val db = writableDatabase
        val values = ContentValues()
        values.put("task", task.title)
        values.put("description", task.description)
        values.put("time", task.date)
        values.put("color", task.color)
        values.put("isDone", if (task.isCompleted) 1 else 0)
        db.insert("tasks", null, values)
    }

    fun getAllTasks(): ArrayList<Task> {
        val list = ArrayList<Task>()
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM tasks", null)

        if (cursor.moveToFirst()) {
            do {
                val name = cursor.getString(1)
                val description = cursor.getString(2)
                val time = cursor.getString(3)
                val color = if (cursor.isNull(4)) null else cursor.getInt(4)
                val isDone = cursor.getInt(5) == 1
                list.add(Task(title = name, description = description, date = time, isCompleted = isDone, color = color, startTime = null, endTime = null, category = "General"))
            } while (cursor.moveToNext())
        }

        cursor.close()
        return list
    }

    fun updateTaskStatus(taskName: String, isDone: Boolean) {
        val db = writableDatabase
        val values = ContentValues()
        values.put("isDone", if (isDone) 1 else 0)
        db.update("tasks", values, "task=?", arrayOf(taskName))
    }

    fun deleteTask(taskName: String) {
        val db = writableDatabase
        db.delete("tasks", "task=?", arrayOf(taskName))
    }

    fun updateTask(oldTaskName: String, updatedTask: Task) {
        val db = writableDatabase
        val values = ContentValues()
        values.put("task", updatedTask.title)
        values.put("description", updatedTask.description)
        values.put("time", updatedTask.date)
        values.put("color", updatedTask.color)
        values.put("isDone", if (updatedTask.isCompleted) 1 else 0)

        db.update("tasks", values, "task=?", arrayOf(oldTaskName))
    }

    // ================= NOTES FUNCTIONS =================

    fun insertNote(title: String) {
        val db = writableDatabase
        val values = ContentValues()
        values.put("title", title)
        db.insert("notes", null, values)
    }

    fun getAllNotes(): ArrayList<Note> {
        val list = ArrayList<Note>()
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM notes", null)

        if (cursor.moveToFirst()) {
            do {
                val title = cursor.getString(1)
                list.add(Note(title = title))
            } while (cursor.moveToNext())
        }

        cursor.close()
        return list
    }

    fun updateNote(oldTitle: String, newTitle: String) {
        val db = writableDatabase
        val values = ContentValues()
        values.put("title", newTitle)
        db.update("notes", values, "title=?", arrayOf(oldTitle))
    }

    fun deleteNote(title: String) {
        val db = writableDatabase
        db.delete("notes", "title=?", arrayOf(title))
    }
}