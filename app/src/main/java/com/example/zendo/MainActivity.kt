package com.example.zendo

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.google.android.material.bottomnavigation.BottomNavigationView

class MainActivity : AppCompatActivity() {

    private var currentFragmentTag: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val sharedPref = getSharedPreferences("ZenDoPrefs", android.content.Context.MODE_PRIVATE)
        val isDarkMode = sharedPref.getBoolean("darkMode", false)
        if (isDarkMode) {
            androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_YES)
        } else {
            androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_NO)
        }

        setContentView(R.layout.activity_main)

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNavigation)

        if (savedInstanceState == null) {
            loadFragment(DashboardFragment(), "dashboard")
        }

        bottomNav.setOnItemSelectedListener {
            when (it.itemId) {
                R.id.nav_dashboard -> loadFragment(DashboardFragment(), "dashboard")
                R.id.nav_notes -> loadFragment(NotesFragment(), "notes")
                R.id.nav_tasks -> loadFragment(TasksFragment(), "tasks")
            }
            true
        }
    }

    private fun loadFragment(fragment: Fragment, tag: String) {
        if (currentFragmentTag == tag) return
        
        val transaction = supportFragmentManager.beginTransaction()
        
        // Hide existing fragment if any
        currentFragmentTag?.let {
            supportFragmentManager.findFragmentByTag(it)?.let { existingFragment ->
                transaction.hide(existingFragment)
            }
        }

        // Show or Add new fragment
        var newFragment = supportFragmentManager.findFragmentByTag(tag)
        if (newFragment == null) {
            newFragment = fragment
            transaction.add(R.id.fragmentContainer, newFragment, tag)
        } else {
            transaction.show(newFragment)
        }

        currentFragmentTag = tag
        transaction.commit()
    }
}