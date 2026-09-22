package com.example.zendo

import android.app.AlarmManager
import android.app.PendingIntent
import android.app.TimePickerDialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class CreateTaskActivity : AppCompatActivity() {

    private lateinit var viewModel: TaskViewModel
    private var selectedDate: String = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    private var startTime: String = "10:00"
    private var endTime: String = "11:00"

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (!isGranted) {
            Toast.makeText(this, "Notification permission denied", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_task)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        viewModel = ViewModelProvider(this).get(TaskViewModel::class.java)

        val btnBack = findViewById<ImageButton>(R.id.btnBack)
        val tvSelectedCat = findViewById<TextView>(R.id.tvSelectedCat)
        val etTaskName = findViewById<EditText>(R.id.etTaskName)
        val etTaskDesc = findViewById<EditText>(R.id.etTaskDesc)
        val btnCreateTask = findViewById<Button>(R.id.btnCreateTask)
        val btnSelectDate = findViewById<View>(R.id.btnSelectDate)
        val tvSelectedDate = findViewById<TextView>(R.id.tvSelectedDate)
        val categoryCard = findViewById<View>(R.id.categoryCard)
        
        val btnStartTime = findViewById<Button>(R.id.btnStartTime)
        val btnEndTime = findViewById<Button>(R.id.btnEndTime)

        val category = intent.getStringExtra("category") ?: "Idea"
        tvSelectedCat.text = category
        tvSelectedDate.text = "Date: $selectedDate"

        btnBack.setOnClickListener { finish() }

        btnSelectDate.setOnClickListener {
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            android.app.DatePickerDialog(this, { _, y, m, d ->
                val cal = Calendar.getInstance()
                cal.set(y, m, d)
                selectedDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(cal.time)
                tvSelectedDate.text = "Date: $selectedDate"
            }, year, month, day).show()
        }

        categoryCard.setOnClickListener {
            startActivity(Intent(this, CategorySelectionActivity::class.java))
        }

        btnStartTime.setOnClickListener {
            showTimePicker { time ->
                startTime = time
                btnStartTime.text = "Start: $time"
            }
        }

        btnEndTime.setOnClickListener {
            showTimePicker { time ->
                endTime = time
                btnEndTime.text = "End: $time"
            }
        }

        // AI Suggestion Logic
        etTaskName.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val input = etTaskName.text.toString()
                val suggestions = viewModel.getSuggestions(input)
                if (input.isNotEmpty() && suggestions.isNotEmpty()) {
                    Toast.makeText(this, "Suggestion: ${suggestions[0]}", Toast.LENGTH_LONG).show()
                }
            }
        }

        val chipGroupPriority = findViewById<com.google.android.material.chip.ChipGroup>(R.id.chipGroupPriority)

        btnCreateTask.setOnClickListener {
            val title = etTaskName.text.toString().trim()
            val desc = etTaskDesc.text.toString().trim()
            
            val priority = when (chipGroupPriority.checkedChipId) {
                R.id.chipHigh -> "High"
                R.id.chipLow -> "Low"
                else -> "Medium"
            }

            if (title.isNotEmpty()) {
                val newTask = Task(
                    title = title,
                    description = desc,
                    date = selectedDate,
                    startTime = startTime,
                    endTime = endTime,
                    category = category,
                    priority = priority,
                    isCompleted = false
                )
                
                lifecycleScope.launch {
                    val id = viewModel.insert(newTask)
                    scheduleNotification(id.toInt(), title, selectedDate, startTime)
                    
                    Toast.makeText(this@CreateTaskActivity, "Task Created!", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this@CreateTaskActivity, MainActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                    startActivity(intent)
                }
            } else {
                Toast.makeText(this, "Please enter a task name", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showTimePicker(onTimeSelected: (String) -> Unit) {
        val calendar = Calendar.getInstance()
        val hour = calendar.get(Calendar.HOUR_OF_DAY)
        val minute = calendar.get(Calendar.MINUTE)

        TimePickerDialog(this, { _, h, m ->
            val formattedTime = String.format(Locale.getDefault(), "%02d:%02d", h, m)
            onTimeSelected(formattedTime)
        }, hour, minute, true).show()
    }

    private fun scheduleNotification(taskId: Int, title: String, date: String, time: String) {
        val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(this, TaskReminderReceiver::class.java).apply {
            putExtra("taskTitle", title)
            putExtra("taskId", taskId)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            this,
            taskId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
        val triggerDate = sdf.parse("$date $time")
        
        triggerDate?.let {
            if (it.time > System.currentTimeMillis()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (alarmManager.canScheduleExactAlarms()) {
                        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, it.time, pendingIntent)
                    } else {
                        alarmManager.set(AlarmManager.RTC_WAKEUP, it.time, pendingIntent)
                    }
                } else {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, it.time, pendingIntent)
                }
            }
        }
    }
}