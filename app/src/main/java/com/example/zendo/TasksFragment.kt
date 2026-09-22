package com.example.zendo

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.recyclerview.widget.ItemTouchHelper
import java.text.SimpleDateFormat
import java.util.*

import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class TasksFragment : Fragment() {

    private lateinit var viewModel: TaskViewModel
    private lateinit var taskAdapter: TaskAdapter
    private lateinit var calendarAdapter: CalendarAdapter
    private lateinit var textTaskCount: TextView
    private lateinit var emptyState: View

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val view = inflater.inflate(R.layout.fragment_tasks, container, false)

        viewModel = ViewModelProvider(requireActivity()).get(TaskViewModel::class.java)

        val editText = view.findViewById<EditText>(R.id.editTextTask)
        val buttonAdd = view.findViewById<ImageButton>(R.id.buttonAdd)
        val recyclerView = view.findViewById<RecyclerView>(R.id.recyclerViewTasks)
        val rvCalendar = view.findViewById<RecyclerView>(R.id.rvCalendar)
        val etSearchTasks = view.findViewById<EditText>(R.id.etSearchTasks)
        val fabAddTask = view.findViewById<com.google.android.material.floatingactionbutton.FloatingActionButton>(R.id.fabAddTask)
        textTaskCount = view.findViewById(R.id.textTaskCount)
        emptyState = view.findViewById(R.id.emptyState)
        val btnAddNew = view.findViewById<View>(R.id.btnAddNew)
        val btnAutoSchedule = view.findViewById<View>(R.id.btnAutoSchedule)
        val tvHeaderDate = view.findViewById<TextView>(R.id.tvHeaderDate)

        // Set current date in header
        val sdf = SimpleDateFormat("dd MMM", Locale.getDefault())
        tvHeaderDate.text = sdf.format(Date())

        setupCalendar(rvCalendar)

        etSearchTasks.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                taskAdapter.filter(s.toString())
            }
            override fun afterTextChanged(s: android.text.Editable?) {}
        })

        taskAdapter = TaskAdapter(
            onDelete = { task -> viewModel.delete(task) },
            onStatusChange = { task -> viewModel.update(task) },
            onEdit = { task ->
                val intent = Intent(requireContext(), CreateTaskActivity::class.java)
                intent.putExtra("taskId", task.id)
                startActivity(intent)
            }
        )

        recyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = taskAdapter
        }

        viewModel.tasksForSelectedDate.observe(viewLifecycleOwner) { tasks ->
            val isFirstLoad = taskAdapter.itemCount == 0
            taskAdapter.setData(tasks)
            textTaskCount.text = "${tasks.size} Tasks"
            emptyState.visibility = if (tasks.isEmpty()) View.VISIBLE else View.GONE
            
            if (isFirstLoad && tasks.isNotEmpty()) {
                recyclerView.scheduleLayoutAnimation()
            }
        }

        viewModel.selectedDate.observe(viewLifecycleOwner) { selectedDate ->
            updateCalendarSelection(selectedDate)
        }

        val btnTimer = view.findViewById<ImageButton>(R.id.btnTimer)

        fabAddTask.setOnClickListener {
            startActivity(Intent(requireContext(), CreateTaskActivity::class.java))
        }

        btnAutoSchedule.setOnClickListener {
            val currentTasks = viewModel.tasksForSelectedDate.value ?: emptyList()
            if (currentTasks.isNotEmpty()) {
                val scheduledTasks = viewModel.autoSchedule(currentTasks)
                scheduledTasks.forEach { task ->
                    viewModel.update(task)
                }
                Toast.makeText(requireContext(), "Tasks scheduled!", Toast.LENGTH_SHORT).show()
            }
        }

        btnAddNew.setOnClickListener {
            startActivity(Intent(requireContext(), CategorySelectionActivity::class.java))
        }

        btnTimer.setOnClickListener {
            FocusTimerBottomSheet().show(parentFragmentManager, "FocusTimer")
        }

        buttonAdd.setOnClickListener {
            val title = editText.text.toString().trim()
            if (title.isNotEmpty()) {
                val newTask = Task(
                    title = title,
                    description = "",
                    date = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()),
                    startTime = "09:00",
                    endTime = "10:00",
                    category = "Idea"
                )
                viewLifecycleOwner.lifecycleScope.launch {
                    viewModel.insert(newTask)
                }
                editText.text.clear()
            } else {
                Toast.makeText(requireContext(), "Enter a task", Toast.LENGTH_SHORT).show()
            }
        }

        // Swipe to Delete
        val itemTouchHelper = ItemTouchHelper(object : ItemTouchHelper.SimpleCallback(0, ItemTouchHelper.LEFT or ItemTouchHelper.RIGHT) {
            override fun onMove(r: RecyclerView, v: RecyclerView.ViewHolder, t: RecyclerView.ViewHolder) = false
            override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
                val task = taskAdapter.getTaskAt(viewHolder.bindingAdapterPosition)
                viewModel.delete(task)
                Toast.makeText(requireContext(), "Task deleted", Toast.LENGTH_SHORT).show()
            }
        })
        itemTouchHelper.attachToRecyclerView(recyclerView)

        return view
    }

    private fun setupCalendar(rvCalendar: RecyclerView) {
        val calendarDates = mutableListOf<CalendarDate>()
        val cal = Calendar.getInstance()
        
        val selectedDate = viewModel.selectedDate.value ?: SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        for (i in 0 until 14) {
            val date = cal.time
            val fullDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(date)
            calendarDates.add(CalendarDate(date, fullDate == selectedDate))
            cal.add(Calendar.DAY_OF_YEAR, 1)
        }

        calendarAdapter = CalendarAdapter(calendarDates) { calendarDate ->
            viewModel.setSelectedDate(calendarDate.fullDate)
        }

        rvCalendar.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        rvCalendar.adapter = calendarAdapter
        rvCalendar.setHasFixedSize(true)
    }

    private fun updateCalendarSelection(selectedDate: String) {
        if (!::calendarAdapter.isInitialized) return
        
        // We only need to regenerate if the dates themselves change (e.g., new day), 
        // but for simple selection we can just update the adapter's list.
        val currentDates = mutableListOf<CalendarDate>()
        val cal = Calendar.getInstance()
        for (i in 0 until 14) {
            val date = cal.time
            val fullDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(date)
            currentDates.add(CalendarDate(date, fullDate == selectedDate))
            cal.add(Calendar.DAY_OF_YEAR, 1)
        }
        calendarAdapter.updateDates(currentDates)
    }
}