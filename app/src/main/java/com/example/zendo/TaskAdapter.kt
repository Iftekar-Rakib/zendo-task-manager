package com.example.zendo

import android.graphics.Color
import android.graphics.Paint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView

class TaskAdapter(
    private val onDelete: (Task) -> Unit,
    private val onStatusChange: (Task) -> Unit,
    private val onEdit: (Task) -> Unit
) : RecyclerView.Adapter<TaskAdapter.TaskViewHolder>() {

    private var taskList = emptyList<Task>()
    private var filteredList = emptyList<Task>()

    class TaskViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val checkTask: CheckBox = view.findViewById(R.id.checkTask)
        val tvTaskTime: TextView = view.findViewById(R.id.tvTaskTime)
        val tvTaskName: TextView = view.findViewById(R.id.tvTaskName)
        val tvTaskDesc: TextView = view.findViewById(R.id.tvTaskDesc)
        val tvCategoryPill: TextView = view.findViewById(R.id.tvCategoryPill)
        val cardTask: MaterialCardView = view.findViewById(R.id.cardTask)
        val viewPriority: View = view.findViewById(R.id.viewPriority)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TaskViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_task, parent, false)
        return TaskViewHolder(view)
    }

    override fun onBindViewHolder(holder: TaskViewHolder, position: Int) {
        val task = filteredList[position]

        holder.tvTaskName.text = task.title
        holder.tvTaskDesc.text = task.description ?: ""
        holder.tvTaskTime.text = "${task.startTime ?: ""} - ${task.endTime ?: ""}"
        holder.tvCategoryPill.text = task.category
        
        // Priority color
        val priorityColor = when (task.priority) {
            "High" -> Color.parseColor("#EF4444")
            "Medium" -> Color.parseColor("#F59E0B")
            "Low" -> Color.parseColor("#10B981")
            else -> Color.parseColor("#9CA3AF")
        }
        holder.viewPriority.setBackgroundColor(priorityColor)

        holder.checkTask.setOnCheckedChangeListener(null)
        holder.checkTask.isChecked = task.isCompleted

        updateTaskAppearance(holder, task.isCompleted)

        holder.checkTask.setOnCheckedChangeListener { _, isChecked ->
            val updatedTask = task.copy(isCompleted = isChecked)
            onStatusChange(updatedTask)
            updateTaskAppearance(holder, isChecked)
        }

        if (task.isCompleted) {
            holder.cardTask.setCardBackgroundColor(Color.parseColor("#F3F4F6"))
            holder.tvTaskName.setTextColor(Color.parseColor("#9CA3AF"))
            holder.tvCategoryPill.alpha = 0.5f
        } else {
            holder.tvCategoryPill.alpha = 1.0f
            val bgColor = task.color ?: Color.WHITE
            holder.cardTask.setCardBackgroundColor(bgColor)
            
            if (bgColor == Color.WHITE) {
                holder.tvTaskName.setTextColor(Color.parseColor("#111827"))
            } else {
                holder.tvTaskName.setTextColor(Color.WHITE)
                holder.tvTaskDesc.setTextColor(Color.parseColor("#E5E7EB"))
                holder.tvTaskTime.setTextColor(Color.parseColor("#E5E7EB"))
                holder.checkTask.buttonTintList = android.content.res.ColorStateList.valueOf(Color.WHITE)
            }
        }

        holder.itemView.setOnClickListener { onEdit(task) }
        holder.itemView.setOnLongClickListener {
            onDelete(task)
            true
        }
    }

    private fun updateTaskAppearance(holder: TaskViewHolder, isCompleted: Boolean) {
        if (isCompleted) {
            holder.tvTaskName.paintFlags = holder.tvTaskName.paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
        } else {
            holder.tvTaskName.paintFlags = holder.tvTaskName.paintFlags and Paint.STRIKE_THRU_TEXT_FLAG.inv()
        }
    }

    override fun getItemCount() = filteredList.size

    fun setData(tasks: List<Task>) {
        this.taskList = tasks
        this.filteredList = tasks
        notifyDataSetChanged()
    }

    fun filter(query: String) {
        filteredList = if (query.isEmpty()) {
            taskList
        } else {
            taskList.filter { 
                it.title.contains(query, ignoreCase = true) || 
                it.category.contains(query, ignoreCase = true) 
            }
        }
        notifyDataSetChanged()
    }

    fun getTaskAt(position: Int): Task {
        return filteredList[position]
    }
}