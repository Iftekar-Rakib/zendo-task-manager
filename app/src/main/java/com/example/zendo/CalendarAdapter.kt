package com.example.zendo

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView

class CalendarAdapter(
    private var dates: List<CalendarDate>,
    private val onDateClick: (CalendarDate) -> Unit
) : RecyclerView.Adapter<CalendarAdapter.CalendarViewHolder>() {

    class CalendarViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvDayNumber: TextView = view.findViewById(R.id.tvDayNumber)
        val tvDayName: TextView = view.findViewById(R.id.tvDayName)
        val cardDate: MaterialCardView = view.findViewById(R.id.cardDate)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CalendarViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_calendar_date, parent, false)
        return CalendarViewHolder(view)
    }

    override fun onBindViewHolder(holder: CalendarViewHolder, position: Int) {
        val dateItem = dates[position]
        holder.tvDayNumber.text = dateItem.dayNumber
        holder.tvDayName.text = dateItem.dayName

        if (dateItem.isSelected) {
            holder.cardDate.setCardBackgroundColor(Color.parseColor("#8B5CF6"))
            holder.tvDayNumber.setTextColor(Color.WHITE)
            holder.tvDayName.setTextColor(Color.WHITE)
        } else {
            holder.cardDate.setCardBackgroundColor(Color.parseColor("#F3F4F6"))
            holder.tvDayNumber.setTextColor(Color.parseColor("#9CA3AF"))
            holder.tvDayName.setTextColor(Color.parseColor("#9CA3AF"))
        }

        holder.itemView.setOnClickListener {
            onDateClick(dateItem)
        }
    }

    override fun getItemCount() = dates.size

    fun updateDates(newDates: List<CalendarDate>) {
        dates = newDates
        notifyDataSetChanged()
    }
}