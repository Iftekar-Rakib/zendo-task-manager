package com.example.zendo

data class Category(
    val name: String,
    val taskCount: Int,
    val icon: Int, // This will hold the drawable ID
    val backgroundColor: Int // This will hold the color for the card
)