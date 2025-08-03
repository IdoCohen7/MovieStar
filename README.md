# 🎬 Movie Star

**Movie Star** היא אפליקציית מובייל שנבנתה ב־React Native עם Expo ו-TypeScript, ומעוצבת באמצעות Tailwind CSS.  
האפליקציה מציגה סרטים פופולריים בעיצוב מודרני ומבוססת על נתונים חיים מ־[TMDB API](https://www.themoviedb.org/documentation/api).

---

## 🚀 תכונות עיקריות

- 🔥 **Trending Movies** – סרטים פופולריים לפי חיפושי משתמשים באפליקציה.
- 🎞️ **Latest Hot Movies** – הסרטים הלוהטים ביותר עכשיו מה-TMDB.
- 🔎 **מנוע חיפוש** – מאפשר למשתמשים לחפש סרטים לפי שם.
- 🧠 **למידת הרגלי שימוש** – כל חיפוש משפיע על רשימת ה־Trending.
- ☁️ **שירות צד שרת באמצעות Appwrite** – לניהול מסד נתונים, אחסון וחיבור מאובטח.

---

## 🖼️ תצוגות מסך

<p float="left">
  <img src="./assets/screenshots/home.jpg" width="30%" />
  <img src="./assets/screenshots/search.jpg" width="30%" />
  <img src="./assets/screenshots/details.jpg" width="30%" />
</p>

## 🧱 טכנולוגיות בשימוש

| טכנולוגיה       | תיאור |
|------------------|--------|
| **React Native** | לפיתוח חוצה פלטפורמות |
| **Expo**         | לבנייה והרצה מהירה |
| **TypeScript**   | הקלדה סטטית ובטיחות בקוד |
| **Tailwind CSS** | עיצוב יעיל ומהיר עם Utility Classes |
| **TMDB API**     | מקור הסרטים |
| **Appwrite**     | Backend לניהול מסד נתונים וחיפושים |

---

## 📁 מבנה עתידי

האפליקציה תתרחב בקרוב עם שני מסכים חדשים:

- **Saved** – מסך מועדפים שבו המשתמשים יוכלו לשמור סרטים לעיון עתידי.
- **Profile** – מסך פרופיל אישי שיציג פרטי משתמש, סטטיסטיקות וצפיות קודמות.

---

## 🛠️ התקנה מקומית

```bash
git clone https://github.com/your-username/movie-star.git
cd movie-star
npm install
npx expo start

## משתני סביבה

# מפתח ה-API שלך מ-TMDB
EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# מזהה פרויקט Appwrite
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id

# מזהה מסד נתונים Appwrite
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id

# מזהה קולקציית החיפושים ב-Appwrite
EXPO_PUBLIC_APPWRITE_COLLECTION_ID=your_collection_id

