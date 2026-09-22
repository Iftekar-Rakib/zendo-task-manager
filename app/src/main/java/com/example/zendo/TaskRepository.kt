package com.example.zendo

import androidx.lifecycle.LiveData

class TaskRepository(private val taskDao: TaskDao) {
    val allTasks: LiveData<List<Task>> = taskDao.getAllTasks()

    fun getTasksByDate(date: String): LiveData<List<Task>> {
        return taskDao.getTasksByDate(date)
    }

    suspend fun insert(task: Task): Long {
        return taskDao.insertTask(task)
    }

    suspend fun update(task: Task) {
        taskDao.updateTask(task)
    }

    suspend fun delete(task: Task) {
        taskDao.deleteTask(task)
    }
    
    suspend fun getCountByCategory(category: String): Int {
        return taskDao.getTaskCountByCategory(category)
    }
}