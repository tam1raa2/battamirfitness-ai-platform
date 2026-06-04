// Global state
let currentUser = null;
let userProfile = null;

// ============================================
// Google OAuth Authentication
// ============================================

function handleCredentialResponse(response) {
    const token = response.credential;
    
    // Decode JWT to get user info
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    currentUser = JSON.parse(jsonPayload);
    
    // Save to localStorage
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(currentUser));
    
    // Check if profile exists
    const savedProfile = localStorage.getItem('userProfile');
    if (!savedProfile) {
        showSection('editProfile');
    } else {
        userProfile = JSON.parse(savedProfile);
        showSection('dashboard');
        displayDashboard();
    }
}

function logout() {
    currentUser = null;
    userProfile = null;
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userProfile');
    showSection('home');
}

// ============================================
// Section Navigation
// ============================================

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Update navbar
    updateNavbar();
}

function updateNavbar() {
    const userMenu = document.getElementById('userMenu');
    if (currentUser) {
        userMenu.style.display = 'flex';
    } else {
        userMenu.style.display = 'none';
    }
}

// ============================================
// Profile Management
// ============================================

function saveProfile(event) {
    event.preventDefault();
    
    const profile = {
        age: document.getElementById('age').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        gender: document.getElementById('gender').value,
        fitnessLevel: document.getElementById('fitnessLevel').value,
        goal: document.getElementById('goal').value,
        appearanceFocus: document.getElementById('appearanceFocus').value,
        healthConditions: document.getElementById('healthConditions').value,
        dateCreated: new Date().toISOString()
    };
    
    userProfile = profile;
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    showSection('dashboard');
    displayDashboard();
}

function displayDashboard() {
    // Display user name
    const userName = currentUser.name || currentUser.email;
    document.getElementById('userName').textContent = userName;
    
    // Display user info
    const bmi = (userProfile.weight / ((userProfile.height / 100) ** 2)).toFixed(1);
    const userInfoHtml = `
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Age:</strong> ${userProfile.age}</p>
        <p><strong>Height:</strong> ${userProfile.height} cm</p>
        <p><strong>Weight:</strong> ${userProfile.weight} kg</p>
        <p><strong>BMI:</strong> ${bmi}</p>
        <p><strong>Goal:</strong> ${capitalizeText(userProfile.goal)}</p>
    `;
    document.getElementById('userInfo').innerHTML = userInfoHtml;
    
    // Display progress
    const progressHtml = `
        <p><strong>BMI:</strong> ${bmi}</p>
        <p><strong>Fitness Level:</strong> ${capitalizeText(userProfile.fitnessLevel)}</p>
        <p><strong>Goal:</strong> ${capitalizeText(userProfile.goal)}</p>
        <p><strong>Member Since:</strong> ${new Date(userProfile.dateCreated).toLocaleDateString()}</p>
    `;
    document.getElementById('progressData').innerHTML = progressHtml;
}

// ============================================
// Fitness Plan Generation (AI-Powered)
// ============================================

async function generateFitnessPlan() {
    if (!userProfile) {
        alert('Please complete your profile first');
        return;
    }
    
    showLoading(true);
    
    try {
        const bmi = (userProfile.weight / ((userProfile.height / 100) ** 2)).toFixed(1);
        
        // Create a detailed prompt for AI
        const prompt = `
        Generate a personalized fitness plan for:
        - Age: ${userProfile.age}
        - Weight: ${userProfile.weight} kg
        - Height: ${userProfile.height} cm
        - BMI: ${bmi}
        - Gender: ${userProfile.gender}
        - Fitness Level: ${userProfile.fitnessLevel}
        - Goal: ${userProfile.goal}
        - Appearance Focus: ${userProfile.appearanceFocus || 'General'}
        - Health Conditions: ${userProfile.healthConditions || 'None'}
        
        Please provide:
        1. A detailed assessment of their current fitness status
        2. Specific fitness goals based on their appearance focus
        3. A 4-week workout plan with 3-4 workouts per week (include exercise names, sets, reps, duration)
        4. Workout diversity (include strength training, cardio, flexibility work)
        5. Recovery tips
        6. Nutrition recommendations
        7. Progress milestones
        
        Format the response clearly with headers and bullet points.
        `;
        
        // For now, we'll create a realistic mock response
        // In production, replace this with actual API call to Google Gemini or similar
        const planResult = generateMockFitnessPlan(userProfile, bmi);
        
        document.getElementById('fitnessPlanResult').innerHTML = planResult;
        
    } catch (error) {
        console.error('Error generating fitness plan:', error);
        document.getElementById('fitnessPlanResult').innerHTML = '<p style="color: red;">Error generating plan. Please try again.</p>';
    } finally {
        showLoading(false);
    }
}

function generateMockFitnessPlan(profile, bmi) {
    const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    
    let plan = `
    <h3>🎯 Your Personalized Fitness Plan</h3>
    
    <h4>📊 Current Assessment</h4>
    <ul>
        <li><strong>BMI:</strong> ${bmi} (${bmiCategory})</li>
        <li><strong>Fitness Level:</strong> ${capitalizeText(profile.fitnessLevel)}</li>
        <li><strong>Primary Goal:</strong> ${capitalizeText(profile.goal)}</li>
        <li><strong>Focus Area:</strong> ${profile.appearanceFocus || 'Overall fitness'}</li>
    </ul>
    
    <h4>💪 Recommended Workout Types</h4>
    <ul>
        <li><strong>Strength Training:</strong> 2-3x per week (30-45 min)</li>
        <li><strong>Cardiovascular:</strong> 2-3x per week (30-45 min)</li>
        <li><strong>Flexibility/Yoga:</strong> 1-2x per week (20-30 min)</li>
        <li><strong>HIIT Training:</strong> 1x per week (20-30 min)</li>
    </ul>
    
    <h4>📅 Weekly Schedule</h4>
    <ul>
        <li><strong>Monday:</strong> Upper Body Strength + Core (45 min)</li>
        <li><strong>Tuesday:</strong> Cardio & HIIT (35 min)</li>
        <li><strong>Wednesday:</strong> Lower Body Strength (45 min)</li>
        <li><strong>Thursday:</strong> Yoga & Flexibility (30 min)</li>
        <li><strong>Friday:</strong> Full Body + Cardio (45 min)</li>
        <li><strong>Saturday:</strong> Active Recovery (20 min walk)</li>
        <li><strong>Sunday:</strong> Rest Day</li>
    </ul>
    
    <h4>🥗 Nutrition Guidelines</h4>
    <ul>
        <li><strong>Protein:</strong> ${Math.round(profile.weight * 1.6)}-${Math.round(profile.weight * 2.2)}g per day</li>
        <li><strong>Calories:</strong> Adjust based on your goal (deficit for weight loss, surplus for muscle gain)</li>
        <li><strong>Macros:</strong> 40% Carbs, 30% Protein, 30% Fat</li>
        <li><strong>Hydration:</strong> 3-4 liters of water daily</li>
    </ul>
    
    <h4>🎯 30-Day Goals</h4>
    <ul>
        <li>Complete 12+ workouts</li>
        <li>Increase endurance by 10-15%</li>
        <li>Improve flexibility</li>
        <li>Establish consistent routine</li>
        <li>Monitor energy levels & mood</li>
    </ul>
    
    <h4>✅ Tips for Success</h4>
    <ul>
        <li>Start with proper form over weight</li>
        <li>Gradually increase intensity week by week</li>
        <li>Track your workouts & progress</li>
        <li>Get 7-9 hours of sleep</li>
        <li>Stay hydrated</li>
        <li>Listen to your body & rest when needed</li>
    </ul>
    `;
    
    return plan;
}

// ============================================
// Nutrition Search & Tracking
// ============================================

async function searchFood() {
    const foodName = document.getElementById('foodSearch').value.trim();
    
    if (!foodName) {
        alert('Please enter a food item');
        return;
    }
    
    showLoading(true);
    
    try {
        // Using Open Food Facts API (free, no authentication needed)
        const response = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1`
        );
        
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
            displayNutritionResults(data.products.slice(0, 6));
        } else {
            document.getElementById('nutritionResult').innerHTML = '<p>No foods found. Try a different search term.</p>';
        }
    } catch (error) {
        console.error('Error searching food:', error);
        
        // Fallback to mock data if API fails
        displayMockNutritionResults(foodName);
    } finally {
        showLoading(false);
    }
}

function displayNutritionResults(foods) {
    let html = '<div class="nutrition-items">';
    
    foods.forEach(food => {
        const name = food.product_name || 'Unknown';
        const calories = food.nutriments?.['energy-kcal'] || 'N/A';
        const protein = food.nutriments?.proteins || 'N/A';
        const carbs = food.nutriments?.carbohydrates || 'N/A';
        const fat = food.nutriments?.fat || 'N/A';
        
        html += `
            <div class="nutrition-item">
                <h4>${name}</h4>
                <p><strong>${calories}</strong> cal</p>
                <div class="nutrition-macros">
                    <div class="macro">🥩 Protein: ${typeof protein === 'number' ? protein.toFixed(1) : protein}g</div>
                    <div class="macro">🍞 Carbs: ${typeof carbs === 'number' ? carbs.toFixed(1) : carbs}g</div>
                    <div class="macro">🧈 Fat: ${typeof fat === 'number' ? fat.toFixed(1) : fat}g</div>
                </div>
                <button onclick="addToMeal('${name}')" class="btn-primary" style="width: 100%; margin-top: 0.5rem;">Add to Meal</button>
            </div>
        `;
    });
    
    html += '</div>';
    document.getElementById('nutritionResult').innerHTML = html;
}

function displayMockNutritionResults(foodName) {
    const mockFoods = {
        'chicken': {
            name: 'Chicken Breast (100g)',
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6
        },
        'rice': {
            name: 'White Rice (100g)',
            calories: 130,
            protein: 2.7,
            carbs: 28,
            fat: 0.3
        },
        'apple': {
            name: 'Apple (100g)',
            calories: 52,
            protein: 0.3,
            carbs: 14,
            fat: 0.2
        },
        'egg': {
            name: 'Egg (1 large)',
            calories: 78,
            protein: 6,
            carbs: 0.6,
            fat: 5.3
        },
        'broccoli': {
            name: 'Broccoli (100g)',
            calories: 34,
            protein: 2.8,
            carbs: 7,
            fat: 0.4
        }
    };
    
    let html = '<div class="nutrition-items">';
    
    // Find matching foods or show popular options
    let foods = [];
    const searchLower = foodName.toLowerCase();
    
    for (const [key, value] of Object.entries(mockFoods)) {
        if (key.includes(searchLower) || value.name.toLowerCase().includes(searchLower)) {
            foods.push(value);
        }
    }
    
    if (foods.length === 0) {
        foods = Object.values(mockFoods).slice(0, 5);
    }
    
    foods.forEach(food => {
        html += `
            <div class="nutrition-item">
                <h4>${food.name}</h4>
                <p><strong>${food.calories}</strong> cal</p>
                <div class="nutrition-macros">
                    <div class="macro">🥩 Protein: ${food.protein}g</div>
                    <div class="macro">🍞 Carbs: ${food.carbs}g</div>
                    <div class="macro">🧈 Fat: ${food.fat}g</div>
                </div>
                <button onclick="addToMeal('${food.name}')" class="btn-primary" style="width: 100%; margin-top: 0.5rem;">Add to Meal</button>
            </div>
        `;
    });
    
    html += '</div>';
    document.getElementById('nutritionResult').innerHTML = html;
}

function addToMeal(foodName) {
    alert(`Added "${foodName}" to your meal! 🍽️`);
    // In production, this would save to a meal log
}

// ============================================
// Tab Switching
// ============================================

function switchTab(tabName) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// ============================================
// Utility Functions
// ============================================

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.style.display = 'flex';
    } else {
        spinner.style.display = 'none';
    }
}

function capitalizeText(text) {
    return text
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('userToken');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedToken && savedUserData) {
        currentUser = JSON.parse(savedUserData);
        const savedProfile = localStorage.getItem('userProfile');
        
        if (savedProfile) {
            userProfile = JSON.parse(savedProfile);
            showSection('dashboard');
            displayDashboard();
        } else {
            showSection('editProfile');
        }
    } else {
        showSection('home');
    }
});

// Handle Enter key in search
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && event.target.id === 'foodSearch') {
        searchFood();
    }
});
