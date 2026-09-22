package com.example.zendo

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.zendo.databinding.ActivityLoginBinding
import com.google.android.material.snackbar.Snackbar

class LoginActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val sharedPref = getSharedPreferences("ZenDoPrefs", Context.MODE_PRIVATE)
        if (sharedPref.getBoolean("isLoggedIn", false)) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }

        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Load animations
        binding.iconContainer.alpha = 0f
        binding.iconContainer.scaleX = 0.8f
        binding.iconContainer.scaleY = 0.8f
        
        binding.iconContainer.animate()
            .alpha(1f)
            .scaleX(1f)
            .scaleY(1f)
            .setDuration(800)
            .setInterpolator(android.view.animation.OvershootInterpolator())
            .start()

        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, getString(R.string.fill_all_fields), Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Simple validation
            if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.etEmail.error = getString(R.string.email) // You might want a more specific error string
                return@setOnClickListener
            }

            if (password.length < 6) {
                binding.etPassword.error = getString(R.string.password) // You might want a more specific error string
                return@setOnClickListener
            }

            // Mock authentication logic
            if (email == "user@zendo.com" && password == "password123") {
                with(sharedPref.edit()) {
                    putBoolean("isLoggedIn", true)
                    putString("userEmail", email)
                    apply()
                }
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            } else {
                Snackbar.make(
                    binding.root,
                    getString(R.string.incorrect_credentials),
                    Snackbar.LENGTH_LONG
                ).show()
            }
        }

        binding.tvGoToSignUp.setOnClickListener {
            Toast.makeText(this, "Sign Up coming soon", Toast.LENGTH_SHORT).show()
        }
    }
}