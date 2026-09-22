package com.example.zendo

import android.os.Bundle
import android.os.CountDownTimer
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.google.android.material.button.MaterialButton
import com.google.android.material.progressindicator.CircularProgressIndicator

class FocusTimerBottomSheet : BottomSheetDialogFragment() {

    private var timer: CountDownTimer? = null
    private var isRunning = false
    private var timeLeftInMillis: Long = 25 * 60 * 1000 // 25 minutes
    
    private lateinit var tvTimerDisplay: TextView
    private lateinit var timerProgress: CircularProgressIndicator
    private lateinit var btnStartPause: MaterialButton
    private lateinit var btnReset: MaterialButton

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.layout_pomodoro_timer, container, false)
        
        tvTimerDisplay = view.findViewById(R.id.tvTimerDisplay)
        timerProgress = view.findViewById(R.id.timerProgress)
        btnStartPause = view.findViewById(R.id.btnStartPause)
        btnReset = view.findViewById(R.id.btnReset)

        btnStartPause.setOnClickListener {
            if (isRunning) pauseTimer() else startTimer()
        }

        btnReset.setOnClickListener {
            resetTimer()
        }

        updateCountDownText()
        
        return view
    }

    private fun startTimer() {
        timer = object : CountDownTimer(timeLeftInMillis, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                timeLeftInMillis = millisUntilFinished
                updateCountDownText()
                updateProgress()
            }

            override fun onFinish() {
                isRunning = false
                btnStartPause.text = "Start"
            }
        }.start()

        isRunning = true
        btnStartPause.text = "Pause"
    }

    private fun pauseTimer() {
        timer?.cancel()
        isRunning = false
        btnStartPause.text = "Resume"
    }

    private fun resetTimer() {
        timer?.cancel()
        timeLeftInMillis = 25 * 60 * 1000
        isRunning = false
        btnStartPause.text = "Start"
        updateCountDownText()
        updateProgress()
    }

    private fun updateCountDownText() {
        val minutes = (timeLeftInMillis / 1000).toInt() / 60
        val seconds = (timeLeftInMillis / 1000).toInt() % 60
        val timeLeftFormatted = String.format("%02d:%02d", minutes, seconds)
        tvTimerDisplay.text = timeLeftFormatted
    }

    private fun updateProgress() {
        val progress = (timeLeftInMillis.toFloat() / (25 * 60 * 1000) * 100).toInt()
        timerProgress.progress = progress
    }

    override fun onDestroyView() {
        super.onDestroyView()
        timer?.cancel()
    }
}