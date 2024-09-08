// // auth.js
// window.addEventListener('DOMContentLoaded', (event) => {
//     if (localStorage.getItem("isLoggedIn") !== "true") {
//         alert("Access denied. Please log in first.");
//         window.location.href = "index.html";
//     }
// });

// function logout() {
//     localStorage.removeItem("isLoggedIn");
//     alert("You have been logged out.");
//     window.location.href = "index.html";
// }
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcUrYx_eLswtcKPBpgJVyPWdyveDZLSyk",
  authDomain: "resturant-order-1d2b3.firebaseapp.com",
  databaseURL: "https://resturant-order-1d2b3-default-rtdb.firebaseio.com",
  projectId: "resturant-order-1d2b3",
  storageBucket: "resturant-order-1d2b3.appspot.com",
  messagingSenderId: "971852262554",
  appId: "1:971852262554:web:fefe99d0997f56f79e0323",
  measurementId: "G-4TS2JLW1BY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Your local data
const itemPrices = {
  // Curry Items
  "Paneer Curry": 350,
  "Matar Paneer": 320,
  "Shahi Paneer": 370,
  "Kadhai Paneer": 390,
  "Paneer Tikka": 400,
  "Paneer Tikka Masala": 450,
  Chola: 100,
  "Chana Masala": 70,
  "Mix Veg. Curry": 250,
  // Chilly Items
  "Panner Chilly": 450,
  // Machurian Items
  "Veg Machurian": 170,
  // Samosa Items
  Samosa: 30,
  Kachori: 35,
  "Jeery (Ghee)": 45,
  Imetry: 60,
  // Pav Baji Items
  "Pav Baji": 230,
  "Dahi Bara": 210,
  "Pani Puri": 100,
  // Sweets
  "Ghee Laddu": 1200,
  "Mota Bundi Laddu": 1300,
  "Masala Laddu": 1300,
  "Besan Laddu": 1300,
  "Kaju Katli": 1800,
  "Khowa Burfi": 1800,
  "Chocolate Burfi": 1400,
  Chamcham: 1250,
  "Kala Jamun": 1300,
  "Cream Chamcham": 1500,
  Buniya: 700,
  "Milk Cake": 1500,
  Kalakand: 1400,
  Peda: 1500,
  "Mathura Peda": 1450,
  Rasbari: 40,
  "Lal Mohan": 45,
  "Raj Bhoj": 85,
  Rasmalai: 150,
  // Breakfast Items
  Puri: 185,
  "Chole Bhature": 220,
  "Aloo Paratha": 270,
  "Roti Chole": 235,
  "Samosa Tarkari": 130,
  "Pakorra Tarkari": 170,
  "Idli Sambar": 255,
  // Chaat Items
  "Mix Chaat": 250,
  "Samosa Chaat": 225,
  "Raj Kachori Chaat": 255,
  "Papri Chaat": 210,
  "Tikiya Chaat": 225,
  "Dahi Puri Chaat": 200,
  // Rolls
  "Katti Roll": 350,
  // Paratha Items
  "Alu Paratha + Raita": 270,
  "Paneer Paratha + Raita": 375,
  "Veg Keema Paratha + Raita": 270,
  "Plain Paratha + Chole": 240,
  // Chowmein Items
  "Veg Chowmein": 190,
  "Paneer Chowmein": 260,
  "Mushroom Chowmein": 310,
  "Mix Chowmein": 350,
  // Thali Sets
  "South Indian Platter": 390,
  "Indian Thali Set": 400,
  "Shauray's Special Thali Set": 550,
  // Momo Items
  "Veg Steam Momo": 160,
  "Paneer Chilly Momo": 350,
  "Veg Chilly Momo": 290,
  "Fry Momo": 200,
  "Jhol Momo": 290,
  // South Indian Items
  "Plain Dosa": 300,
  "Masala Dosa": 350,
  "Paneer Dosa": 350,
  "Butter Masala Paneer Dosa": 450,
  "Rawa Dosa": 350,
  "Rawa Masala Dosa": 350,
  "Paper Plain Dosa": 350,
  "Idli Sambar": 250,
  "Onion Uttapam": 260,
  "Masala Uttapam": 350,
  "Pav Bhaji": 350,
  "Sambar Bada": 250,
  // Pakoda Items
  "Paneer Pakoda": 290,
  "Veg Pakoda": 100,
  // Thukpa Items
  "Veg Thukpa": 220,
  "Paneer Thukpa": 310,
  "Mushroom Thukpa": 310,
  "Mix Thukpa": 350,
  // Drinks
  Coke: 80,
  Fanta: 80,
  Sprite: 80,
  "Cold Coffee": 80,
  "Frooti or Appy": 30,
  Dahi: 60,
  // Lassi Items
  "Sweet Lassi": 140,
  "Vanilla Lassi": 140,
  "Plain Lassi": 120,
  "Chocolate Lassi": 120,
  "Coconut Lassi": 130,
  "Banana Lassi": 135,
  "Lassi with Ice Cream": 195,
  // Hot Drinks
  "Milk Coffee": 150,
  "Black Coffee": 40,
  "Milk Tea": 15,
  "Black Tea": 30,
  "Lemon Tea": 40,
  "Hot Lemon": 60,
  "Hot Lemon and Honey": 90,
};

const itemNames = [
  // Curry Items
  "Paneer Curry",
  "Matar Paneer",
  "Shahi Paneer",
  "Kadhai Paneer",
  "Paneer Tikka",
  "Paneer Tikka Masala",
  "Chola",
  "Chana Masala",
  "Mix Veg. Curry",
  // Chilly Items
  "Panner Chilly",
  // Machurian Items
  "Veg Machurian",
  // Samosa Items
  "Samosa",
  "Kachori",
  "Jeery (Ghee)",
  "Imetry",
  // Pav Baji Items
  "Pav Baji",
  "Dahi Bara",
  "Pani Puri",
  // Sweets
  "Ghee Laddu",
  "Mota Bundi Laddu",
  "Masala Laddu",
  "Besan Laddu",
  "Kaju Katli",
  "Khowa Burfi",
  "Chocolate Burfi",
  "Chamcham",
  "Kala Jamun",
  "Cream Chamcham",
  "Buniya",
  "Milk Cake",
  "Kalakand",
  "Peda",
  "Mathura Peda",
  "Rasbari",
  "Lal Mohan",
  "Raj Bhoj",
  "Rasmalai",
  // Breakfast
  "Puri",
  "Chole Bhature",
  "Aloo Paratha",
  "Roti Chole",
  "Samosa Tarkari",
  "Pakorra Tarkari",
  "Idli Sambar",
  // Chaat Items
  "Mix Chaat",
  "Samosa Chaat",
  "Raj Kachori Chaat",
  "Papri Chaat",
  "Tikiya Chaat",
  "Dahi Puri Chaat",
  // Rolls
  "Katti Roll",
  // Paratha Items
  "Alu Paratha + Raita",
  "Paneer Paratha + Raita",
  "Veg Keema Paratha + Raita",
  "Plain Paratha + Chole",
  // Chowmein Items
  "Veg Chowmein",
  "Paneer Chowmein",
  "Mushroom Chowmein",
  "Mix Chowmein",
  // Thali Set
  "South Indian Platter",
  "Indian Thali Set",
  "Shauray's Special Thali Set",
  // Momo Items
  "Veg Steam Momo",
  "Paneer Chilly Momo",
  "Veg Chilly Momo",
  "Fry Momo",
  "Jhol Momo",
  // South Indian Items
  "Plain Dosa",
  "Masala Dosa",
  "Paneer Dosa",
  "Butter Masala Paneer Dosa",
  "Rawa Dosa",
  "Rawa Masala Dosa",
  "Paper Plain Dosa",
  "Idli Sambar",
  "Onion Uttapam",
  "Masala Uttapam",
  "Pav Bhaji",
  "Sambar Bada",
  // Pakoda Items
  "Paneer Pakoda",
  "Veg Pakoda",
  // Thukpa
  "Veg Thukpa",
  "Paneer Thukpa",
  "Mushroom Thukpa",
  "Mix Thukpa",
  // Cold Drinks
  "Coke",
  "Fanta",
  "Sprite",
  "Cold Coffee",
  "Frooti or Appy",
  "Dahi",
  // Lassi Items
  "Sweet Lassi",
  "Vanilla Lassi",
  "Plain Lassi",
  "Chocolate Lassi",
  "Coconut Lassi",
  "Banana Lassi",
  "Lassi with Ice Cream",
  // Hot Drinks
  "Milk Coffee",
  "Black Coffee",
  "Milk Tea",
  "Black Tea",
  "Lemon Tea",
  "Hot Lemon",
  "Hot Lemon and Honey",
];

async function uploadData() {
  try {
    // Upload itemPrices
    for (const [item, price] of Object.entries(itemPrices)) {
      await setDoc(doc(db, "itemPrices", item), { price });
    }
    console.log("itemPrices data uploaded successfully.");

    // Upload itemNames
    await setDoc(doc(db, "itemNames", "names"), { names: itemNames });
    console.log("itemNames data uploaded successfully.");
  } catch (error) {
    console.error("Error uploading data:", error);
  }
}

document.getElementById("upload").addEventListener("click", function () {
  // Call the createButtons function
  uploadData();
});
