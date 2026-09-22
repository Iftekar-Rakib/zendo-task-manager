package com.example.zendo

import android.app.Application
import androidx.lifecycle.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class TaskViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: TaskRepository
    val allTasks: LiveData<List<Task>>
    
    private val _selectedDate = MutableLiveData<String>(
        SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    )
    val selectedDate: LiveData<String> = _selectedDate

    val tasksForSelectedDate: LiveData<List<Task>>

    // Dashboard Stats
    private val _totalTasksCount = MediatorLiveData<Int>()
    val totalTasksCount: LiveData<Int> = _totalTasksCount

    private val _completedTasksCount = MediatorLiveData<Int>()
    val completedTasksCount: LiveData<Int> = _completedTasksCount

    private val _completionPercentage = MediatorLiveData<Int>()
    val completionPercentage: LiveData<Int> = _completionPercentage

    private var statsJob: Job? = null

    init {
        val taskDao = AppDatabase.getDatabase(application).taskDao()
        repository = TaskRepository(taskDao)
        allTasks = repository.allTasks
        
        tasksForSelectedDate = _selectedDate.switchMap { date ->
            repository.getTasksByDate(date)
        }

        // Optimized Stats calculation
        _totalTasksCount.addSource(allTasks) { list ->
            _totalTasksCount.value = list.size
        }

        _completedTasksCount.addSource(allTasks) { list ->
            statsJob?.cancel()
            statsJob = viewModelScope.launch(Dispatchers.Default) {
                val count = list.count { it.isCompleted }
                _completedTasksCount.postValue(count)
            }
        }

        _completionPercentage.addSource(_totalTasksCount) { calculatePercentage() }
        _completionPercentage.addSource(_completedTasksCount) { calculatePercentage() }
    }

    private fun calculatePercentage() {
        val total = _totalTasksCount.value ?: 0
        val completed = _completedTasksCount.value ?: 0
        _completionPercentage.value = if (total > 0) (completed * 100) / total else 0
    }

    fun setSelectedDate(date: String) {
        if (_selectedDate.value != date) {
            _selectedDate.value = date
        }
    }

    suspend fun insert(task: Task): Long {
        return repository.insert(task)
    }

    fun update(task: Task) = viewModelScope.launch {
        repository.update(task)
    }

    fun delete(task: Task) = viewModelScope.launch {
        repository.delete(task)
    }
    
    // AI Suggestion Feature
    fun getSuggestions(input: String): List<String> {
        val lowerInput = input.lowercase()
        return when {
            lowerInput.contains("study") -> listOf("Read Chapter 1", "Complete assignment", "Review notes", "Solve practice test")
            lowerInput.contains("work") -> listOf("Check emails", "Attend meeting", "Update report", "Fix bugs", "Plan sprint")
            lowerInput.contains("fitness") || lowerInput.contains("gym") -> listOf("30 min run", "Go to gym", "Leg day workout", "Morning yoga")
            lowerInput.contains("food") || lowerInput.contains("cook") -> listOf("Meal prep", "Grocery shopping", "Try new recipe", "Clean kitchen")
            else -> listOf("Plan your day", "Meditation", "Read a book", "Water plants")
        }
    }

    fun autoSchedule(tasks: List<Task>): List<Task> {
        val startHour = 9
        return tasks.mapIndexed { index, task ->
            val h = startHour + index
            task.copy(
                startTime = String.format(Locale.getDefault(), "%02d:00", h % 24),
                endTime = String.format(Locale.getDefault(), "%02d:00", (h + 1) % 24)
            )
        }
    }

    fun getProductivityInsight(): String {
        val percentage = completionPercentage.value ?: 0
        return when {
            percentage == 100 -> "Master of Productivity! You've crushed everything."
            percentage >= 80 -> "Great job! You're extremely focused today."
            percentage >= 50 -> "Good progress. Keep the momentum going!"
            percentage > 0 -> "You've started! Keep going, one task at a time."
            else -> "Ready to start your Zen journey? Add some tasks!"
        }
    }
}