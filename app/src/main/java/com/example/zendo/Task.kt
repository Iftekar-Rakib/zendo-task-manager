package com.example.zendo

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tasks")
data class Task(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val description: String?,
    val date: String,
    val startTime: String?,
    val endTime: String?,
    val category: String,
    val priority: String = "Medium", // High, Medium, Low
    val isCompleted: Boolean = false,
    val color: Int? = null
)