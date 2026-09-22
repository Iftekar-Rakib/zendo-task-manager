package com.example.zendo

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider

class DashboardFragment : Fragment() {

    private lateinit var viewModel: TaskViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_dashboard, container, false)

        viewModel = ViewModelProvider(requireActivity()).get(TaskViewModel::class.java)

        val tvProgressPercentage = view.findViewById<TextView>(R.id.tvProgressPercentage)
        val progressBar = view.findViewById<ProgressBar>(R.id.progressBar)
        val tvTotalTasks = view.findViewById<TextView>(R.id.tvTotalTasks)
        val tvCompletedTasks = view.findViewById<TextView>(R.id.tvCompletedTasks)
        val tvProgressSummary = view.findViewById<TextView>(R.id.tvProgressSummary)
        val tvInsight = view.findViewById<TextView>(R.id.tvInsight)
        val switchDarkMode = view.findViewById<com.google.android.material.materialswitch.MaterialSwitch>(R.id.switchDarkMode)
        val btnSignOut = view.findViewById<View>(R.id.btnSignOut)

        val sharedPref = requireActivity().getSharedPreferences("ZenDoPrefs", android.content.Context.MODE_PRIVATE)

        btnSignOut.setOnClickListener {
            with(sharedPref.edit()) {
                putBoolean("isLoggedIn", false)
                apply()
            }
            startActivity(Intent(requireContext(), LoginActivity::class.java))
            requireActivity().finish()
        }

        // Set initial state
        val isDarkMode = sharedPref.getBoolean("darkMode", false)
        switchDarkMode.isChecked = isDarkMode

        switchDarkMode.setOnCheckedChangeListener { _, isChecked ->
            sharedPref.edit().putBoolean("darkMode", isChecked).apply()
            if (isChecked) {
                androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_YES)
            } else {
                androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_NO)
            }
        }

        viewModel.totalTasksCount.observe(viewLifecycleOwner) { total ->
            tvTotalTasks.text = total.toString()
        }

        viewModel.completedTasksCount.observe(viewLifecycleOwner) { completed ->
            tvCompletedTasks.text = completed.toString()
        }

        viewModel.completionPercentage.observe(viewLifecycleOwner) { percentage ->
            tvProgressPercentage.text = "$percentage%"
            progressBar.progress = percentage
            
            val total = viewModel.totalTasksCount.value ?: 0
            val completed = viewModel.completedTasksCount.value ?: 0
            val left = total - completed
            tvProgressSummary.text = if (left > 0) "Almost there! $left tasks left." else "All tasks completed! Great job!"
            
            tvInsight.text = viewModel.getProductivityInsight()
        }

        return view
    }
}