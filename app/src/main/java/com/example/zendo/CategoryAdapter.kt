package com.example.zendo

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

import android.graphics.Color
import com.google.android.material.card.MaterialCardView

class CategoryAdapter(
    private var categories: List<Category>,
    private var selectedCategory: Category? = null,
    private val onCategoryClick: (Category) -> Unit
) : RecyclerView.Adapter<CategoryAdapter.CategoryViewHolder>() {

    class CategoryViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ivIcon: ImageView = view.findViewById(R.id.ivCategoryIcon)
        val tvName: TextView = view.findViewById(R.id.tvCategoryName)
        val tvCount: TextView = view.findViewById(R.id.tvTaskCount)
        val card: MaterialCardView = itemView as MaterialCardView
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategoryViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_category, parent, false)
        return CategoryViewHolder(view)
    }

    override fun onBindViewHolder(holder: CategoryViewHolder, position: Int) {
        val category = categories[position]
        holder.tvName.text = category.name
        holder.tvCount.text = "${category.taskCount} Tasks"
        holder.ivIcon.setImageResource(category.icon)
        
        if (category.name == selectedCategory?.name) {
            holder.card.strokeWidth = 4
            holder.card.strokeColor = Color.parseColor("#8B5CF6")
        } else {
            holder.card.strokeWidth = 0
        }

        holder.itemView.setOnClickListener {
            onCategoryClick(category)
        }
    }

    override fun getItemCount() = categories.size

    fun updateData(newList: List<Category>) {
        categories = newList
        notifyDataSetChanged()
    }

    fun setSelectedCategory(category: Category?) {
        val oldCategory = selectedCategory
        selectedCategory = category
        
        // Find positions to update
        val oldPos = categories.indexOfFirst { it.name == oldCategory?.name }
        val newPos = categories.indexOfFirst { it.name == category?.name }
        
        if (oldPos != -1) notifyItemChanged(oldPos)
        if (newPos != -1) notifyItemChanged(newPos)
    }
}