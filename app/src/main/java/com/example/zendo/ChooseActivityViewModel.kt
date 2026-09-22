package com.example.zendo

import android.graphics.Color
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import java.text.SimpleDateFormat
import java.util.*

class ChooseActivityViewModel : ViewModel() {

    private val _categories = MutableLiveData<List<Category>>()
    val categories: LiveData<List<Category>> = _categories

    private val _selectedCategory = MutableLiveData<Category?>()
    val selectedCategory: LiveData<Category?> = _selectedCategory

    private val _calendarDates = MutableLiveData<List<CalendarDate>>()
    val calendarDates: LiveData<List<CalendarDate>> = _calendarDates

    private val _selectedDateString = MutableLiveData<String>()
    val selectedDateString: LiveData<String> = _selectedDateString

    init {
        loadInitialData()
        setupCalendar()
    }

    private fun loadInitialData() {
        _categories.value = listOf(
            Category("Idea", 12, android.R.drawable.ic_menu_info_details, Color.parseColor("#F5F3FF")),
            Category("Food", 9, android.R.drawable.ic_menu_gallery, Color.parseColor("#F5F3FF")),
            Category("Work", 14, android.R.drawable.ic_menu_edit, Color.parseColor("#F5F3FF")),
            Category("Sport", 5, android.R.drawable.ic_menu_directions, Color.parseColor("#F5F3FF")),
            Category("Music", 4, android.R.drawable.ic_lock_silent_mode_off, Color.parseColor("#F5F3FF"))
        )
    }

    private fun setupCalendar() {
        val dates = mutableListOf<CalendarDate>()
        val cal = Calendar.getInstance()
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(cal.time)
        _selectedDateString.value = today

        for (i in 0 until 14) {
            val date = cal.time
            val fullDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(date)
            dates.add(CalendarDate(date, fullDate == today))
            cal.add(Calendar.DAY_OF_YEAR, 1)
        }
        _calendarDates.value = dates
    }

    fun selectDate(fullDate: String) {
        _selectedDateString.value = fullDate
        val currentDates = _calendarDates.value ?: return
        _calendarDates.value = currentDates.map {
            it.copy(isSelected = it.fullDate == fullDate)
        }
    }

    fun selectCategory(category: Category) {
        _selectedCategory.value = category
    }

    fun addCategory(name: String) {
        val current = _categories.value ?: emptyList()
        val newList = current + Category(name, 0, android.R.drawable.ic_menu_help, Color.parseColor("#F5F3FF"))
        _categories.value = newList
    }
}