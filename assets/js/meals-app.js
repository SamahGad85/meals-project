/*
https://dummyjson.com/docs
https://www.themealdb.com/api.php
*/
// ============================================
// Simple Meal Recipe App
// ============================================

// API Configuration
const API_URL = "https://www.themealdb.com/api/json/v1/1";
// Global Variables
let allMeals = [];
const MEALS_PER_PAGE = 6;
let currentChunkIndex = 0;

// ============================================
// Function 1: Load All Meals on Page Load
// ============================================
/**
 * Load all meals when page loads
 * Uses Fetch API with Promises
 * Only loads meals starting with letter 'a'
 */
function loadAllMeals() {
  allMeals = [];
  currentChunkIndex = 0;
  fetch(`${API_URL}/search.php?f=a`)
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals || [];
      allMeals = meals;

      //   displayMeals(allMeals);
      displayMealsChunk();
      //   console.log("allMeals:", allMeals);
      document.getElementById("loaderScreen").classList.add("d-none");
    })
    .catch((error) => {
      console.error("Error loading meals:", error);
      alert("Failed to load meals. Please refresh the page.");
      document.getElementById("loaderScreen").classList.add("d-none");
    });
}

// ============================================
// Function 2: Display Meals
// ============================================
/**
 * Display meals in the container
 * DOM Manipulation
 * @param {Array} meals - Array of meal objects
 */

function displayMeals(meals, appendData = false) {
  const container = document.getElementById("mealsContainer");

  if (!appendData) {
    container.innerHTML = "";
  }

  if (meals.length === 0 && !appendData) {
    container.innerHTML =
      '<div class="col-12"><p class="text-center">No meals found.</p></div>';
    return;
  }

  meals.forEach((meal) => {
    const col = document.createElement("div");
    col.className = "col-md-4 col-sm-6 mb-4";

    col.innerHTML = `
        <div class="card h-100 shadow-sm">
            <img src="${meal.strMealThumb}"
                alt="${meal.strMeal}" class="card-img-top" style="height: 250px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title">${meal.strMeal}</h5>
                <p class="card-text text-muted">${meal.strCategory || "N/A"}</p>
                <button class="btn btn-primary" onclick="showMealDetails('${meal.idMeal}')">
                    View Details
                </button>
            </div>
        </div>
    `;

    container.appendChild(col);
  });
}

// ============================================
// Function 3: Display Meals Chunk (6 meals)
// ============================================

/**
 * Display meals in chunks of 6
 * Simple function for beginners
 */
function displayMealsChunk() {
  const startIndex = currentChunkIndex * MEALS_PER_PAGE; // 0 * 6 => 0
  const endIndex = startIndex + MEALS_PER_PAGE; // 0 + 6 = 6

  const chunk = allMeals.slice(startIndex, endIndex); // 0,6

  if (chunk.length === 0) {
    document.getElementById("loadMoreBtn").classList.add("d-none");
    return;
  }

  displayMeals(chunk, currentChunkIndex > 0);

  if (endIndex >= allMeals.length) {
    document.getElementById("loadMoreBtn").classList.add("d-none");
  } else {
    document.getElementById("loadMoreBtn").classList.remove("d-none");
  }
}

// ============================================
// Function 4: Load More Meals
// ============================================

/**
 * Load more meals from array chunks (6 by 6)
 * Simple function for beginners
 */
function loadMoreMeals() {
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  loadMoreBtn.disabled = true;

  setTimeout(() => {
    currentChunkIndex++;
    displayMealsChunk();
    loadMoreBtn.disabled = false;
  }, 300);
}

// ============================================
// Function 5: Search Meals
// ============================================

/**
 * Search for meals by name
 * @param {string} searchTerm - The meal name to search for
 */

function searchMeals(searchTerm) {
  //    console.log("searchTerm",searchTerm)

  // sanitize data
  let cleanedSearchTerm = sanitizeData(searchTerm);
  // reset
  if (!cleanedSearchTerm) {
    currentChunkIndex = 0;
    displayMealsChunk();
    document.getElementById("loadMoreBtn").style.display = "block";
    return;
  }

  fetch(`${API_URL}/search.php?s=${encodeURIComponent(cleanedSearchTerm)}`)
    .then((response) => response.json())
    .then((data) => {
      const meals = data.meals || [];

      console.log("meals", meals);
      allMeals = meals;
      console.log("allMeals", allMeals);

      currentChunkIndex = 0;
      displayMealsChunk();
    })
    .catch((error) => {
      console.error("Error loading meals:", error);
      alert("Failed to search meals. Please try again");
    });
}

function sanitizeData(input) {
  return input.trim().replace(/[<>]/g, "");
}

// ============================================
// Function 6: Show Meal Details
// ============================================

/**
 * Show meal details page
 * Navigates to details page
 * @param {string} mealId - The meal ID
 */
function getIngredients(meal) {
  let ingredients = [];
  for (let i = 0; i <= 20; i++) {
    let ingredient = meal[`strIngredient${i}`];
    let measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(
        ` ${ingredient} ${measure ? `  ( ${measure.trim()})` : ""}.`,
      );
    }
  }
  return ingredients;
}
async function showMealDetails(mealId) {
  try {
    const response = await fetch(
      `${API_URL}/lookup.php?i=${encodeURIComponent(mealId)}`,
    );
    const mealDetails = await response.json();
    console.log(mealDetails.meals[0]);
    const meal = mealDetails.meals[0];
    let ingredients = getIngredients(meal);
    document.getElementById("mainContent").classList.add("d-none");
    document.getElementById("mealDetailsPage").classList.remove("d-none");
    let backButton = document.getElementById("backButton");
    backButton.addEventListener("click", () => {
      document.getElementById("mainContent").classList.remove("d-none");
      document.getElementById("mealDetailsPage").classList.add("d-none");
    });
    document.getElementById("mealDetailsContent").innerHTML = `
    <h2 >${meal.strMeal}</h2>
    
    <div class='mb-2 relative'>
    <img class='card'  src='${meal.strMealThumb}'/>
    
    </div>
    <div class='badges'><div class='badge'>${meal.strArea}</div><div class='badge'>${meal.strCategory}</div></div>
    <h3>Ingredients</h3>
    <ol class ='list-group-item mb-5 ml-5'>
    ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
    </ol>
    <div>
    <h3>Instructions</h3>
    <p>${meal.strInstructions}</p>
    
     </div>
   
      <a href="${meal.strYoutube}" class="btn btn-primary">
                    Watch on youtube
                </a>

    `;
  } catch (error) {
    console.log(error);
  }
}

// ============================================
// Function 7: Toggle Dark Mode
// ============================================

/**
 * Toggle dark mode and save to localStorage
 * BOM - localStorage usage
 */
function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDark);

  // Update icon
  const icon = document.getElementById("darkModeIcon");
  icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
}
/**
 * Load dark mode preference from localStorage
 */
function loadDarkMode() {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("darkModeIcon").classList = "fas fa-sun";
  }
}
//  Area Filter
// Filter by Area www.themealdb.com/api/json/v1/1/filter.php?a=Canadian
async function getAllAreas() {
  try {
    const response = await fetch(`${API_URL}/list.php?a=list`);
    const areas = await response.json();
    const mealAreas = areas.meals;
    const areaSelect = document.getElementById("areaFilter");
    areaSelect.innerHTML = ` <option value="">🌍 All Regions</option>
            ${mealAreas.map((area) => `<option value="${area.strArea}">${area.strArea}</option>`).join("")}
`
areaSelect.addEventListener(('change'),async (event)=>{
let selectedArea = (event.target.value)
if(selectedArea){
const response = await fetch(`${API_URL}/filter.php?a=${selectedArea}`);
  const data = await response.json()
  const meals = data.meals || [];

      console.log("meals", meals);
      allMeals = meals;
      console.log("allMeals", allMeals);

      currentChunkIndex = 0;
      displayMealsChunk();
}else{
  loadAllMeals();
}
  
})
;
  } catch (error) {
    console.log(error);
  }
}
window.addEventListener("DOMContentLoaded", async function () {
  loadDarkMode();
  loadAllMeals();
  await getAllAreas();

  document
    .getElementById("searchForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const searchTerm = document.getElementById("searchInput").value;
      searchMeals(searchTerm);
    });

  document
    .getElementById("darkModeToggle")
    .addEventListener("click", toggleDarkMode);
});

// how to host site in git
// https://www.youtube.com/watch?si=g0LI2C798gyPMMXk&v=e5AwNU3Y2es&feature=youtu.be
