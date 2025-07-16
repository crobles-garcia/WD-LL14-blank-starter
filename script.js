// Full updated script.js with combined filter + enhancements

window.addEventListener("DOMContentLoaded", async () => {
  const areaUrl = "https://www.themealdb.com/api/json/v1/1/list.php?a=list";
  const categoryUrl = "https://www.themealdb.com/api/json/v1/1/list.php?c=list";

  const areaSelect = document.getElementById("area-select");
  const resultsDiv = document.getElementById("results");
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loading";
  loadingDiv.innerHTML = "<p>Loading...</p>";
  loadingDiv.style.textAlign = "center";
  loadingDiv.style.display = "none";
  document.body.insertBefore(loadingDiv, resultsDiv);

  const categorySelect = document.createElement("select");
  categorySelect.id = "category-select";
  categorySelect.name = "category-select";
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  categorySelect.style.display = "block";
  categorySelect.style.margin = "0 auto 32px auto";
  categorySelect.style.padding = "8px 16px";
  categorySelect.style.fontSize = "1rem";
  categorySelect.style.borderRadius = "4px";
  categorySelect.style.border = "1px solid #ccc";
  areaSelect.parentNode.insertBefore(categorySelect, areaSelect.nextSibling);

  const searchBar = document.createElement("input");
  searchBar.id = "search-bar";
  searchBar.type = "text";
  searchBar.placeholder = "Search for a meal...";
  searchBar.style.display = "block";
  searchBar.style.margin = "20px auto";
  searchBar.style.padding = "10px";
  searchBar.style.fontSize = "1rem";
  searchBar.style.borderRadius = "6px";
  searchBar.style.border = "1px solid #ccc";
  areaSelect.parentNode.insertBefore(searchBar, areaSelect);

  const themeToggle = document.createElement("button");
  themeToggle.id = "toggle-theme";
  themeToggle.innerText = "🌙 Toggle Dark Mode";
  themeToggle.style.display = "block";
  themeToggle.style.margin = "10px auto";
  themeToggle.style.padding = "10px 20px";
  themeToggle.style.fontSize = "1rem";
  areaSelect.parentNode.insertBefore(themeToggle, searchBar);

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  try {
    const [areaRes, categoryRes] = await Promise.all([
      fetch(areaUrl),
      fetch(categoryUrl)
    ]);
    const areaData = await areaRes.json();
    const categoryData = await categoryRes.json();

    areaData.meals.forEach(area => {
      const option = document.createElement("option");
      option.value = area.strArea;
      option.textContent = area.strArea;
      areaSelect.appendChild(option);
    });

    categoryData.meals.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.strCategory;
      option.textContent = cat.strCategory;
      categorySelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading filters:", err);
  }

  async function getCombinedMeals(area, category) {
    const areaUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`;
    const categoryUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

    const [areaRes, catRes] = await Promise.all([
      fetch(areaUrl),
      fetch(categoryUrl)
    ]);
    const areaData = await areaRes.json();
    const catData = await catRes.json();

    if (!areaData.meals || !catData.meals) return [];

    const areaMeals = areaData.meals;
    const catMeals = catData.meals;

    return areaMeals.filter(meal =>
      catMeals.some(catMeal => catMeal.idMeal === meal.idMeal)
    );
  }

  function displayMeals(meals, resultsDiv) {
    resultsDiv.innerHTML = "";
    if (!meals || meals.length === 0) {
      resultsDiv.innerHTML = "<p>No meals found matching selected filters.</p>";
      return;
    }

    meals.forEach(meal => {
      const mealDiv = document.createElement("div");
      mealDiv.className = "meal";
      mealDiv.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h3>${meal.strMeal}</h3>
      `;
      mealDiv.addEventListener("click", async () => {
        const detailUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`;
        const detailRes = await fetch(detailUrl);
        const detailData = await detailRes.json();
        const mealDetail = detailData.meals[0];

        let ingredientsList = "";
        for (let i = 1; i <= 20; i++) {
          const ing = mealDetail[`strIngredient${i}`];
          const meas = mealDetail[`strMeasure${i}`];
          if (ing && ing.trim() !== "") {
            ingredientsList += `<li>${ing} - ${meas}</li>`;
          }
        }

        const detailDiv = document.createElement("div");
        detailDiv.className = "meal-detail";
        detailDiv.innerHTML = `
          <h2>${mealDetail.strMeal}</h2>
          <img src="${mealDetail.strMealThumb}" alt="${mealDetail.strMeal}">
          <h4>Ingredients:</h4>
          <ul>${ingredientsList}</ul>
          <h4>Instructions:</h4>
          <p>${mealDetail.strInstructions}</p>
          <button id="close-detail">Close</button>
        `;
        resultsDiv.innerHTML = "";
        resultsDiv.appendChild(detailDiv);

        document.getElementById("close-detail").onclick = () => {
          resultsDiv.innerHTML = "";
          displayMeals(meals, resultsDiv);
        };
      });
      resultsDiv.appendChild(mealDiv);
    });
  }

  function handleFilters() {
    const selectedArea = areaSelect.value;
    const selectedCategory = categorySelect.value;
    resultsDiv.innerHTML = "";

    if (!selectedArea && !selectedCategory) return;

    loadingDiv.style.display = "block";
    const loaderDone = () => loadingDiv.style.display = "none";

    if (selectedArea && selectedCategory) {
      getCombinedMeals(selectedArea, selectedCategory).then(meals => {
        loaderDone();
        displayMeals(meals, resultsDiv);
      });
    } else if (selectedArea) {
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${selectedArea}`)
        .then(res => res.json())
        .then(data => {
          loaderDone();
          displayMeals(data.meals, resultsDiv);
        });
    } else if (selectedCategory) {
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`)
        .then(res => res.json())
        .then(data => {
          loaderDone();
          displayMeals(data.meals, resultsDiv);
        });
    }
  }

  areaSelect.addEventListener("change", handleFilters);
  categorySelect.addEventListener("change", handleFilters);

  searchBar.addEventListener("input", async (e) => {
    const searchTerm = e.target.value.trim();
    if (!searchTerm) return;

    loadingDiv.style.display = "block";
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
    const data = await res.json();
    loadingDiv.style.display = "none";
    displayMeals(data.meals, resultsDiv);
  });
});

