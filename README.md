# 👨‍🍳 ChefMate AI — Intelligent Full-Stack AI Cooking Agent

ChefMate AI is a modern, full-stack AI cooking assistant powered by Google Gemini. It bridges the gap between what is currently in your kitchen and chef-level meals by providing zero-waste ingredient matching, dynamic culinary scaling, ingredient substitution analysis, hands-free step-by-step cooking assistance, intelligent weekly meal planning, and multi-turn conversational cooking guidance.

---

## 🌟 Key Features

1. **"What's in Your Kitchen?" (Ingredient-to-Recipe Generator)**
   - Enter ingredients via interactive chips/tags (e.g. *Eggs, Rice, Tomatoes, Onions*).
   - Filter by cuisine (Indian, Italian, Chinese, Mexican, Korean, American, Any), dietary preferences (Vegetarian, Vegan, High-Protein, Low-Calorie, Gluten-Free), difficulty, and cooking time.
   - Powered by Gemini structured JSON outputs to generate multiple creative, realistic recipes.

2. **Dedicated Distraction-Free "Start Cooking" Mode**
   - High-contrast, large-format step typography designed for reading across the kitchen counter.
   - Sequential progress navigation (`← Previous`, `Next →`) with progress bar and step completion tracking.
   - **In-Step "Ask ChefMate" Drawer**: Ask real-time questions in context (e.g., *"How do I know when the onions are translucent?"* or *"Can I lower the burner heat?"*) and receive immediate guidance with the active recipe and step kept in context.

3. **Smart Culinary Ingredient Substitution**
   - Select any ingredient from a recipe to discover 3–4 practical culinary alternatives.
   - Explains the exact substitution ratio, **taste impact**, **texture impact**, and **cooking method adjustments** required.

4. **Dynamic Recipe Scaling (1 to 8 Servings)**
   - Scale recipes effortlessly (1, 2, 4, 6, 8 portions).
   - Dynamically recalculates ingredient quantities and proportioned prep times.

5. **Integrated Kitchen Pantry (SQLite Database)**
   - Add, edit quantities, categorize (Produce, Dairy & Eggs, Meat & Seafood, Grains & Pasta, Spices), and search stored kitchen ingredients.
   - **"Cook With My Pantry" Action**: Instantly transfers all in-stock pantry items to the AI recipe generator with a single click.

6. **7-Day Weekly Meal Planner**
   - Specify household size, dietary style, cuisine preferences, budget tier, and daily calorie/protein goals.
   - Gemini outputs a full 7-day calendar (Monday through Sunday) covering Breakfast, Lunch, and Dinner.
   - Automatically compiles a **consolidated grocery shopping list** and **3 practical chef prep tips**.

7. **Favorite Recipes Collection**
   - Save any generated or curated recipe into SQLite database storage.
   - Open full recipe details, launch into Cooking Mode, or manage saved dishes anytime.

8. **Conversational Cooking Assistant Chat**
   - Maintains multi-turn conversation memory with the ChefMate AI persona: warm, encouraging, safety-first.
   - Provides safe internal food cooking temperatures, storage advice, flavor balancing, and leftover guidance.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Editorial Typography (Plus Jakarta Sans & Playfair Display)
- **Icons**: Lucide React
- **API Client**: Native `fetch` with proxying and typed error handling

### Backend
- **Framework**: Python 3.10+ / FastAPI
- **Server**: Uvicorn (ASGI)
- **Data Validation**: Pydantic v2
- **ORM & Database**: SQLAlchemy 2.0 with SQLite (structured for zero-friction PostgreSQL migration)
- **Environment Management**: `python-dotenv`

### Artificial Intelligence
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`)
- **SDK**: Official Google GenAI Python SDK (`google-genai`)
- **Safety & Format**: Structured JSON schemas with rigorous server-side parsing and graceful error boundaries.

---

## 📁 Project Structure

```
skill lab/
├── backend/
│   ├── config.py              # Environment variable loading & API key status
│   ├── database.py            # SQLAlchemy engine, session maker & get_db dependency
│   ├── main.py                # FastAPI app initialization, CORS, routers & healthcheck
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Backend environment template
│   │
│   ├── models/                # SQLAlchemy database models
│   │   ├── __init__.py
│   │   ├── pantry.py          # PantryItem model
│   │   ├── favorite.py        # FavoriteRecipe model
│   │   └── recipe.py          # RecipeRecord model
│   │
│   ├── schemas/               # Pydantic schemas & response contracts
│   │   ├── __init__.py
│   │   ├── recipe.py          # Recipe, Ingredient, Nutrition, Scale & MealPlan schemas
│   │   ├── chat.py            # ChatMessage, ChatRequest, ChatResponse
│   │   ├── pantry.py          # PantryItemCreate, Update, Response
│   │   └── favorite.py        # FavoriteCreateRequest, Response
│   │
│   ├── routes/                # FastAPI endpoint handlers
│   │   ├── __init__.py
│   │   ├── recipes.py         # /api/recipes (generate, from-ingredients, substitute, scale, {id})
│   │   ├── chat.py            # /api/chat
│   │   ├── pantry.py          # /api/pantry (GET, POST, PUT, DELETE)
│   │   ├── favorites.py       # /api/favorites (GET, POST, DELETE)
│   │   └── meal_planner.py    # /api/meal-plan/generate
│   │
│   └── services/              # Business logic & AI integrations
│       ├── gemini_service.py   # Dedicated Gemini GenAI client & structured prompt engines
│       ├── recipe_service.py   # Database persistence & recipe retrieval
│       └── nutrition_service.py# Nutritional estimation utilities
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts         # Vite configuration with Tailwind & /api proxy to FastAPI
│   ├── tsconfig.json
│   ├── index.html             # SEO tags & Google Fonts typography
│   │
│   └── src/
│       ├── App.tsx            # Main application coordinator, global state & modals
│       ├── index.css          # Tailwind CSS import, theme variables & custom scrollbars
│       ├── main.tsx           # React DOM root entrypoint
│       │
│       ├── types/
│       │   └── recipe.ts      # TypeScript interfaces for recipes, pantry, chat & meal plans
│       │
│       ├── services/
│       │   └── api.ts         # Centralized API service for all backend calls
│       │
│       ├── components/
│       │   ├── Navbar.tsx             # Header navigation with active tabs & key status indicator
│       │   ├── RecipeCard.tsx         # Recipe card with badges, preview & action buttons
│       │   ├── IngredientInput.tsx    # Interactive chip/tag input with quick pantry staples
│       │   ├── CookingStep.tsx        # Step component with completion checkbox & ask helper
│       │   ├── ChatMessage.tsx        # Styled chef/user message bubbles with markdown bullets
│       │   ├── LoadingState.tsx       # Animated cooking indicators with alternating culinary tips
│       │   ├── SubstitutionModal.tsx  # Ingredient replacement modal with taste/texture/method details
│       │   ├── ScaleModal.tsx         # Portion scaling modal (1, 2, 4, 6, 8 servings)
│       │   └── ConfigWarningModal.tsx # Setup helper modal for GEMINI_API_KEY
│       │
│       └── pages/
│           ├── Home.tsx               # Hero dashboard, AI prompt box, quick tags & feature grid
│           ├── Recipes.tsx            # "What's in your kitchen?" ingredient-to-recipe generator
│           ├── RecipeDetail.tsx       # Full recipe breakdown with checkboxes & progress bar
│           ├── CookingMode.tsx        # Distraction-free countertop cooking mode with live Q&A
│           ├── Pantry.tsx             # SQLite-backed pantry manager with "Cook With My Pantry"
│           ├── Favorites.tsx          # Saved recipes catalog with quick open & cooking actions
│           ├── MealPlanner.tsx        # 7-day meal plan generator with grocery list & prep tips
│           └── CookingAssistant.tsx   # Multi-turn conversational cooking chat
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔑 Google Gemini API Setup

1. **Obtain an API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Sign in with your Google account and click **"Create API Key"**.

2. **Configure Environment Variables**:
   Create a `.env` file inside the `backend/` directory (or copy from `.env.example`):

   ```bash
   cp backend/.env.example backend/.env
   ```

   Open `backend/.env` and insert your API key:

   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
   DATABASE_URL=sqlite:///./chefmate.db
   GEMINI_MODEL=gemini-2.5-flash
   ```

> **Security Note**: The Gemini API key is strictly maintained on the FastAPI backend and is **never** exposed to the frontend or bundled into client-side JavaScript.

---

## 🚀 Quickstart & How to Run

### Step 1: Start the Backend (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server with reload
uvicorn main:app --reload --port 8000
```

The backend API will be live at:
- **API Base**: `http://localhost:8000`
- **Interactive OpenAPI Docs**: `http://localhost:8000/docs`
- **Health Endpoint**: `http://localhost:8000/api/health`

### Step 2: Start the Frontend (React + Vite)

In a new terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install node dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser to:
- **Web App**: `http://localhost:5173`

The Vite dev server automatically proxies any requests to `/api/*` directly to `http://localhost:8000`.

---

## 📡 API Documentation & Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns health status and whether Gemini API key is configured |
| `POST` | `/api/recipes/generate` | Generates a custom recipe based on craving, cuisine, diet, and time |
| `POST` | `/api/recipes/from-ingredients` | Generates 3 custom recipes using available kitchen ingredients |
| `POST` | `/api/recipes/substitute` | Provides 3–4 culinary substitutions with taste, texture, and method impact |
| `POST` | `/api/recipes/scale` | Dynamically recalculates recipe quantities for target servings (1 to 20) |
| `GET` | `/api/recipes/{id}` | Fetches a recipe by its unique ID (supports cached records & favorites) |
| `POST` | `/api/chat` | Conversational chef assistant maintaining context and active recipe steps |
| `GET` | `/api/pantry` | Lists pantry items from SQLite (supports `?q=` search filter) |
| `POST` | `/api/pantry` | Adds a new pantry item or updates existing stock |
| `PUT` | `/api/pantry/{id}` | Updates quantity, unit, or category of a pantry item |
| `DELETE` | `/api/pantry/{id}` | Removes an item from the pantry database |
| `GET` | `/api/favorites` | Returns all saved favorite recipes from SQLite |
| `POST` | `/api/favorites` | Saves a recipe to favorites |
| `DELETE` | `/api/favorites/{id}` | Removes a recipe from favorites by database ID or recipe ID |
| `POST` | `/api/meal-plan/generate` | Generates a 7-day meal plan with grocery list and prep tips |

---

## 📸 Screenshots & UI Showcase

*(Place screenshots here when deploying or presenting)*

- **Hero & Craving Dashboard**: Editorial layout with quick prompt chips and feature navigation.
- **Kitchen Ingredient Chips**: Tag-based input with instant pantry sync and dietary filters.
- **Distraction-Free Cooking Mode**: Large-font countertop mode with previous/next controls and in-step Q&A.
- **Ingredient Substitution Matrix**: Visual comparison of replacement ratios, flavor shifts, and technique tips.
- **7-Day Meal Plan Grid**: Interactive day-by-day menu with calories, protein, and grocery list.

---

## 🛡️ Error Handling & Reliability

- **Graceful Gemini Missing Key Notice**: If `GEMINI_API_KEY` is omitted or unconfigured, the application returns a clear, helpful status (`503 Service Unavailable`) and renders an interactive helper modal in the UI explaining how to set it.
- **Malformed AI Response Fallbacks**: Uses server-side regex cleaning and Pydantic validation to handle code fences or irregular JSON outputs from LLMs.
- **Mathematical Scaling Fallback**: In the event of network interruption during scaling, the client seamlessly computes proportional ratios so cooking is never blocked.
- **Database Safety**: Uses parameterized SQLAlchemy queries with `SessionLocal` dependency injection to safeguard against SQL injection.

---

## 🔮 Future Improvements

- [ ] **Voice-Activated Cooking Mode**: Add Web Speech API integration for true hands-free voice commands while cooking.
- [ ] **Barcode & Receipt Scanning**: Allow snapping a photo of grocery receipts to populate the pantry automatically.
- [ ] **PostgreSQL Production Deployment**: Swap SQLite connection string with PostgreSQL and deploy via Docker container.
