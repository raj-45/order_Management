// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  update,
  get,
  push,
  child,
  onValue,
  remove,
  set,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  updateDoc,
  arrayUnion,
  deleteDoc,
  arrayRemove,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import firebaseConfig from "../js/config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app);
// let userUid;

// Fetch data from Firestore
async function fetchItemPrices() {
  try {
    const itemPrices = {};
    const querySnapshot = await getDocs(collection(db, "itemPrices"));
    querySnapshot.forEach((doc) => {
      itemPrices[doc.id] = doc.data().price; // Assuming each document has a `price` field
    });
    return itemPrices;
  } catch (error) {
    console.error("Error fetching itemPrices:", error);
    throw error;
  }
}

async function fetchItemNames() {
  console.log("fetchItemNames called");
  try {
    const docRef = doc(db, "itemNames", "names");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().names;
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (error) {
    console.error("Error fetching itemNames:", error);
    throw error;
  }
}

function showAlert(title, text, shouldReload = true) {
  Swal.fire({
    title: title,
    text: text,
    icon: "info",
    confirmButtonText: "OK",
  }).then((result) => {
    if (result.isConfirmed && shouldReload) {
      location.reload();
    }
  });
}

function getUserName() {
  console.log("UserName: " + localStorage.getItem("username"));
  return localStorage.getItem("username");
}

function setUserName(a_userName) {
  localStorage.setItem("username", a_userName);
}

function getUserUid() {
  console.log("UserName: " + localStorage.getItem("userUid"));
  return localStorage.getItem("userUid");
}

function setUserUid(a_userUid) {
  console.log("UserID: " + a_userUid);
  localStorage.setItem("userUid", a_userUid);
}

async function checkUserRole(
  requiredRole,
  onSuccess,
  redirectPage = "index.html"
) {
  console.log("commonUtilityMgr:checkUserRole() called");
  onAuthStateChanged(auth, async (user) => {
    console.log("commonUtilityMgr:checkUserRole() onAuthStateChanged called");
    if (user) {
      const uid = user.uid;

      try {
        // Retrieve the user role from Firestore
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const role = userDoc.data().role;
          console.log("Role " + role + "\tUserRole :" + requiredRole);
          // Check if role matches the required role
          if (role !== requiredRole) {
            console.log("It shouldn't Hit");
            localStorage.clear();
            window.location.href = redirectPage;
          } else {
            // console.log("It should Hit");
            document.body.style.display = "block";
            onSuccess(role);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userRole", requiredRole);
          }
        } else {
          localStorage.clear(); // Clear storage if user is not authenticated
          console.error("User document not found. Redirecting to login.");
          window.location.href = redirectPage;
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        localStorage.clear(); // Clear storage if user is not authenticated
        window.location.href = redirectPage;
      }
    } else {
      // Redirect to login if not authenticated
      localStorage.clear(); // Clear storage if user is not authenticated
      window.location.href = redirectPage;
    }
  });
}

async function logOut(userID, role) {
  console.log("Logout called");

  console.log(`Token for ${role} with userID ${userID} deleted successfully.`);

  try {
    const tokenDocRef = doc(db, `/auth/tokens/${role}/${userID}`);
    const docSnap = await getDoc(tokenDocRef); // Get the document to check if it exists
    if (docSnap.exists()) {
      console.log("Document exists. Proceeding to delete...");
      await deleteDoc(tokenDocRef);
      console.log(
        `Token after for ${role} with userID ${userID} deleted successfully.`
      );
    } else {
      console.log("Document does not exist.");
    }
  } catch (error) {
    console.error("Error deleting document: ", error);
  }

  signOut(auth)
    .then(() => {
      console.log("signOut called Successfully");
      localStorage.clear();
      if (window.AndroidInterface) {
        window.AndroidInterface.onUserLoggedOut(userID);
      }
      window.location.href = "index.html"; // Redirect to login page after successful logout
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
}

// async function createButtons(fetchOrderDetails, containerId, userRole) {
//   console.log("Inside createButtons");
//   const buttonsContainer = document.getElementById(containerId);

//   const dbRef = ref(database, "orders");
//   const snapshot = await get(dbRef);
//   let orders = snapshot.val();

//   for (let i = 1; i <= 12; i++) {
//     // console.log("userRole: " + userRole);
//     let tableKey = "Table-" + i;
//     const button = document.createElement("button");
//     button.textContent = `Table ${i}`;
//     button.setAttribute("data-table-no", `Table-${i}`);
//     button.classList.add("table-btn");

//     if (orders) {
//       // console.log("userRole: " + userRole);
//       const tableData = orders[tableKey];
//       if (userRole === "cashier") {
//         // Change toBilling check for chef role
//         if (!(tableData.toBilling === true)) {
//           // Disable the button if the table is not to be billed
//           button.classList.add("disabled-btn");
//           button.disabled = true;
//         }
//       } else {
//         // Default check for other roles
//         if (!(tableData.toBilling === false)) {
//           // Disable the button if the table is closed
//           button.classList.add("disabled-btn");
//           button.disabled = true;
//         }
//       }
//     } else {
//       // console.log("userRole: " + userRole);
//       button.classList.add("disabled-btn");
//       button.disabled = true;
//     }

//     button.onclick = async function () {
//       showJsonContainer();
//       // Remove active class from all buttons
//       const allButtons = document.querySelectorAll(".table-btn");
//       allButtons.forEach((btn) => btn.classList.remove("active-btn"));

//       // Add active class to the clicked button
//       button.classList.add("active-btn");

//       // Show loading indicator
//       const originalText = button.textContent;
//       button.textContent = "Loading...";
//       button.disabled = true;

//       try {
//         await fetchOrderDetails(button); // Execute the async function
//       } finally {
//         // Revert button text and re-enable it
//         button.textContent = originalText;
//         button.disabled = false;
//       }
//     };
//     buttonsContainer.appendChild(button);
//   }

//   if (
//     window.AndroidInterface &&
//     typeof window.AndroidInterface.onUserSignedIn === "function"
//   ) {
//     window.AndroidInterface.onUserSignedIn(getUserUid());
//   }
// }

async function createButtons(fetchOrderDetails, containerId, userRole) {
  console.log("Inside createButtons");

  const buttonsContainer = document.getElementById(containerId);
  const fragment = document.createDocumentFragment(); // Batch DOM updates

  const dbRef = ref(database, "orders");
  const snapshot = await get(dbRef);
  const orders = snapshot.val();

  const isButtonDisabled = (tableData, role) => {
    if (!tableData) return true; // Disable if no data exists for the table
    return role === "cashier" ? !tableData.toBilling : tableData.toBilling;
  };

  for (let i = 1; i <= 12; i++) {
    const tableKey = `Table-${i}`;
    const tableData = orders ? orders[tableKey] : null;

    const button = document.createElement("button");
    button.textContent = `Table ${i}`;
    button.setAttribute("data-table-no", tableKey);
    button.classList.add("table-btn");

    // Apply button state
    if (isButtonDisabled(tableData, userRole)) {
      button.classList.add("disabled-btn");
      button.disabled = true;
    }

    // Attach event listener
    button.onclick = async function () {
      handleButtonClick(button, fetchOrderDetails);
    };

    fragment.appendChild(button); // Add to fragment
  }

  buttonsContainer.appendChild(fragment); // Append all buttons at once

  // Notify Android interface if available
  if (window.AndroidInterface?.onUserSignedIn) {
    window.AndroidInterface.onUserSignedIn(getUserUid());
  }
}

// Reusable function to handle button click
async function handleButtonClick(button, fetchOrderDetails) {
  showJsonContainer();

  // Remove active class from all buttons
  document
    .querySelectorAll(".table-btn")
    .forEach((btn) => btn.classList.remove("active-btn"));
  button.classList.add("active-btn");

  // Show loading state
  const originalText = button.textContent;
  button.textContent = "Loading...";
  button.disabled = true;

  try {
    await fetchOrderDetails(button); // Execute the async function
  } finally {
    // Restore button state
    button.textContent = originalText;
    button.disabled = false;
  }
}

function showJsonContainer() {
  const jsonContainer = document.getElementById("json-container");
  if (jsonContainer) {
    jsonContainer.style.display = "block"; // Show container when a button is clicked
  }
}

export {
  app,
  database,
  auth,
  db,
  fetchItemPrices,
  fetchItemNames,
  showAlert,
  checkUserRole,
  logOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  ref,
  update,
  get,
  push,
  child,
  onValue,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  updateDoc,
  arrayUnion,
  deleteDoc,
  arrayRemove,
  serverTimestamp,
  remove,
  set,
  getUserName,
  setUserName,
  getUserUid,
  setUserUid,
  createButtons,
};
