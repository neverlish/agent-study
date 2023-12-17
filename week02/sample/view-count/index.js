// Get the total views from localStorage or initialize it to 0
var totalViews = parseInt(localStorage.getItem('totalViews')) || 0;

// Display the total views
document.getElementById('viewCount').textContent = totalViews;

// Increment the total views when the page is loaded
totalViews++;

// Store the updated total views back to localStorage
localStorage.setItem('totalViews', totalViews.toString());
