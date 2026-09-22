package com.example.zendo

import java.util.Date

data class CalendarDate(
    val date: Date,
    val isSelected: Boolean = false
) {
    val dayNumber: String = java.text.SimpleDateFormat("dd", java.util.Locale.getDefault()).format(date)
    val dayName: String = java.text.SimpleDateFormat("EEE", java.util.Locale.getDefault()).format(date)
    val fullDate: String = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()).format(date)
}