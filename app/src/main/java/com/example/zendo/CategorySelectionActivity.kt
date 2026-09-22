package com.example.zendo

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton

class CategorySelectionActivity : AppCompatActivity() {
    
    private lateinit var viewModel: ChooseActivityViewModel
    private lateinit var categoryAdapter: CategoryAdapter
    private lateinit var calendarAdapter: CalendarAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_choose_activity)
        
        viewModel = ViewModelProvider(this).get(ChooseActivityViewModel::class.java)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val btnBack = findViewById<ImageButton>(R.id.btnBack)
        btnBack.setOnClickListener {
            finish()
        }

        val btnTimer = findViewById<ImageButton>(R.id.btnTimer)
        btnTimer.setOnClickListener {
            FocusTimerBottomSheet().show(supportFragmentManager, "FocusTimer")
        }

        val fabAdd = findViewById<FloatingActionButton>(R.id.fabAdd)
        fabAdd.setOnClickListener {
            showAddCategoryDialog()
        }

        setupRecyclerViews()
        observeViewModel()
    }

    private fun setupRecyclerViews() {
        // Categories
        val rvCategories = findViewById<RecyclerView>(R.id.rvCategories)
        categoryAdapter = CategoryAdapter(emptyList()) { category ->
            viewModel.selectCategory(category)
            
            // Navigate to CreateTaskActivity
            val intent = Intent(this, CreateTaskActivity::class.java)
            intent.putExtra("category", category.name)
            startActivity(intent)
        }
        rvCategories.layoutManager = LinearLayoutManager(this)
        rvCategories.adapter = categoryAdapter

        // Calendar
        val rvCalendar = findViewById<RecyclerView>(R.id.rvCalendar)
        calendarAdapter = CalendarAdapter(emptyList()) { calendarDate ->
            viewModel.selectDate(calendarDate.fullDate)
        }
        rvCalendar.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        rvCalendar.adapter = calendarAdapter
    }

    private fun observeViewModel() {
        viewModel.categories.observe(this) { categories ->
            categoryAdapter.updateData(categories)
        }

        viewModel.selectedCategory.observe(this) { selected ->
            categoryAdapter.setSelectedCategory(selected)
        }

        viewModel.calendarDates.observe(this) { dates ->
            calendarAdapter.updateDates(dates)
        }
    }

    private fun showAddCategoryDialog() {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_add_category, null)
        val etCategoryName = dialogView.findViewById<EditText>(R.id.etCategoryName)

        AlertDialog.Builder(this)
            .setTitle("Add New Activity")
            .setView(dialogView)
            .setPositiveButton("Save") { _, _ ->
                val name = etCategoryName.text.toString().trim()
                if (name.isNotEmpty()) {
                    viewModel.addCategory(name)
                    Toast.makeText(this, "Category added", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}