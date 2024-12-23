import {
  db,
  database,
  setDoc,
  doc,
  checkUserRole,
  logOut,
  ref,
  update,
  get,
  child,
  createButtons,
  fetchItemPrices,
  getUserUid,
  remove,
  set,
} from "../js/commonUtilityMgr.js";

const userID = getUserUid();
const userRole = localStorage.getItem("userRole");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  let itemPrices;

  checkUserRole("cashier", async (role) => {
    createButtons(fetchOrderDetails, "buttonsContainer", role); // Pass the role here
    itemPrices = await fetchItemPrices();
    document.getElementById("loading-overlay").style.display = "none";
  });

  const logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", () => logOut(userID, userRole));

  async function fetchOrderDetails(button) {
    try {
      const orderId = button.getAttribute("data-table-no");
      // console.log("Inside orderID if:", tableID);
      if (orderId) {
        // console.log("Inside orderID if:", orderId);
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, "orders/" + orderId));
        let order = snapshot.val();
        if (order) {
          // console.log("Inside orders if:", orders);
          const to_billing_var = order["toBilling"];
          // console.log("to_billing", to_billing_var);
          if (to_billing_var != true) {
            alert("Table not cleared yet! Please wait");
            location.reload(); // Reload the page
            return;
          } else if (to_billing_var == true) {
            displayBillDetails(order, orderId);
          } else {
            alert("This should not show. Please contact Developer!!");
          }
        } else {
          order = null;
          displayBillDetails(order, orderId);
        }
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  }

  function displayBillDetails(order, orderId) {
    let billAmount = 0;
    const tableID = orderId.toLowerCase();
    const orderDetails = order["orderDetail"];
    var tableOneData = orderDetails[tableID]; // Accessing only the "Table-1" element
    console.log("tableOneData details:\n", tableOneData);

    if (tableOneData) {
      // Check if the data is a string and parse it if necessary
      if (typeof tableOneData === "string") {
        console.log(
          "Inside typeof tableOneData === string\n\ntableOneData:\n:",
          tableOneData
        );
        tableOneData = JSON.parse(tableOneData);
      }
    }
    console.log("Table-1 data:", tableOneData); // Log the fetched data
    // Clear any existing content in the display area
    const displayArea = document.getElementById("ordersContainer");
    displayArea.innerHTML = ""; // Clear previous data

    if (!order) {
      displayArea.innerHTML = "<p>No orders found for this table.</p>";
      return;
    }

    // Display order details
    const { custName, tableClosed, timeStamp, waiterName } = order;
    // Display customer and order details
    const h2Element = document.createElement("h2");
    h2Element.id = "orderIDHeader";
    h2Element.textContent = `Order Details for : ${orderId}`;
    const orderDetailsContainer = document.createElement("div");
    orderDetailsContainer.classList.add("orderDetailsContainer");
    displayArea.appendChild(h2Element);
    orderDetailsContainer.innerHTML += `<p>Customer Name: ${custName}</p>`;
    orderDetailsContainer.innerHTML += `<p>Table Closed: ${tableClosed}</p>`;
    orderDetailsContainer.innerHTML += `<p>Time Stamp: ${timeStamp}</p>`;
    // displayArea.innerHTML += `<p>To Billing: ${toBilling}</p>`;
    orderDetailsContainer.innerHTML += `<p>Waiter Name: ${waiterName}</p>`;
    displayArea.appendChild(orderDetailsContainer);

    // Create a table element
    const table = document.createElement("table");

    // Create the table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = [
      "Item Name",
      "Quantity",
      "Note",
      "Dine In",
      "Rate",
      "Price",
    ];
    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement("tbody");
    let pairCounter = 0; // Add this line

    tableOneData.forEach((item) => {
      // console.log("pairCounter vefore: " + pairCounter);
      const rowClass = pairCounter % 2 === 1 ? "second-pair" : "first-pair"; // Modified line
      // console.log("pairCounter after: " + pairCounter);
      const row = document.createElement("tr");
      row.className = rowClass; // Add this line

      const itemNameCell = document.createElement("td");
      itemNameCell.setAttribute("data-label", "Item Name");
      itemNameCell.textContent = item.itemName;
      row.appendChild(itemNameCell);

      const quantityCell = document.createElement("td");
      quantityCell.setAttribute("data-label", "Quantity");
      quantityCell.textContent = item.quantity;
      row.appendChild(quantityCell);

      const noteCell = document.createElement("td");
      noteCell.setAttribute("data-label", "Note");
      noteCell.textContent = item.note;
      row.appendChild(noteCell);

      const dineInCell = document.createElement("td");
      dineInCell.setAttribute("data-label", "Dine-In");
      dineInCell.textContent = item.dineIn;
      row.appendChild(dineInCell);

      const rateCell = document.createElement("td");
      rateCell.setAttribute("data-label", "Rate");
      rateCell.textContent = item.rate; //itemPrices[item.itemName] || 0;
      row.appendChild(rateCell);

      // Calculate the price and create a cell for it
      // Get the price from itemPrices based on item name
      const price = itemPrices[item.itemName] || 0; // Default to 0 if item not found
      const totalPrice = price * parseFloat(item.quantity, 10); // Calculate total price

      billAmount += totalPrice;

      const priceCell = document.createElement("td");
      priceCell.setAttribute("data-label", "Price");
      priceCell.textContent = `NRs. ${totalPrice.toFixed(2)}`; // Display price in fixed-point notation
      row.appendChild(priceCell);

      tbody.appendChild(row);
      table.appendChild(tbody);

      // Append the table to the container
      displayArea.appendChild(table);
    });

    // Display the gross amount
    displayArea.innerHTML += `<p>Gross Amount: NRs: ${billAmount}.00</p>`;

    // Create the discount input field
    const discountField = document.createElement("div");
    discountField.classList.add("discount-container");
    discountField.innerHTML =
      '<label for="discount" class="label_discountInput">Discount:</label> <input type="number" id="discount" class="discountInput" name="discount" placeholder="Enter Discount amount if any" required>';
    displayArea.appendChild(discountField);

    // Initialize a variable to store the discount value
    let discount_var = 0;

    // Get a reference to the input field
    const discountInput = document.getElementById("discount");

    // Create the "Payment" button
    const toPaymentBtn = document.createElement("button");
    toPaymentBtn.id = "showPopupButton";
    toPaymentBtn.textContent = "Payment";
    toPaymentBtn.classList.add("payment-btn");
    toPaymentBtn.type = "button";

    toPaymentBtn.addEventListener("click", function () {
      discount_var = parseFloat(discountInput.value) || 0;
      updateTotal(orderId, discount_var, billAmount);
      toPaymentDetails(tableOneData, orderId);
    });

    // Append the payment button to the display area
    displayArea.appendChild(toPaymentBtn);
  }

  async function updateTotal(orderId, discountAmount, billAmount) {
    const discount = { discount: discountAmount };
    const grossAmount = { grossAmount: billAmount };
    const totalAmount = { totalAmount: billAmount - discountAmount };

    try {
      if (orderId) {
        const reference = ref(database, "orders/" + orderId);
        await update(reference, discount);
        await update(reference, grossAmount);
        await update(reference, totalAmount);
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }
    } catch (error) {
      console.error("Error writing data to Firebase:", error);
    }
  }

  // const showPopupButton = document.getElementById("showPopupButton");
  const paymentPopup = document.getElementById("paymentPopup");
  const popupOverlay = document.getElementById("popupOverlay");
  const itemDetails = document.getElementById("itemDetails");
  const printButton = document.getElementById("printButton");
  // const paymentButton = document.getElementById("printButton");
  const closePopupButton = document.getElementById("closePopupButton");
  const paymentReceivedBtn = document.getElementById("paymentReceivedBtn");
  const confirmationPopup = document.getElementById("confirmationPopup");

  // Function to show the confirmation popup
  function showConfirmationPopup() {
    confirmationPopup.classList.remove("hidden");
  }

  // Function to populate the table
  function populateTable(itemList) {
    console.log("Inside PopulateData");

    itemDetails.innerHTML = ""; // Clear previous entries
    itemList.forEach((item) => {
      let total = item.rate * parseInt(item.quantity, 10);
      console.log("Inside loop");
      const row = document.createElement("tr");
      row.innerHTML = `
              <td>${item.itemName}</td>
              <td>${item.quantity}</td>
              <td>${item.rate}</td>
              <td>${total}</td>
          `;
      itemDetails.appendChild(row);
    });
  }

  // Function to open the popup
  async function toPaymentDetails(tableOneData, orderID) {
    console.log("Inside PaymentDetails" + orderID);
    populateTable(tableOneData);
    paymentPopup.classList.remove("hidden");
    popupOverlay.classList.remove("hidden");
    document.getElementById("messageInput").value = ""; // Clear the message input
    console.log("Out of toPaymentDetails function ");
  }

  // Event listeners
  // showPopupButton.addEventListener("click", toPaymentDetails);
  closePopupButton.addEventListener("click", () => {
    paymentPopup.classList.add("hidden");
    popupOverlay.classList.add("hidden");
    document.getElementById("messageInput").value = ""; // Clear the message input
  });

  paymentReceivedBtn.addEventListener("click", paymentReceivedFn);

  async function paymentReceivedFn() {
    paymentReceivedBtn.classList.add("loading");

    // Add the loader SVG to the button (only if it's not already added)
    if (!paymentReceivedBtn.querySelector("svg")) {
      paymentReceivedBtn.innerHTML = `
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
            x="0px" y="0px" width="20px" height="20px" viewBox="0 0 40 40" xml:space="preserve">
            <path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
              s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
              c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>
            <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
              C22.32,8.481,24.301,9.057,26.013,10.047z">
              <animateTransform attributeType="xml"
                attributeName="transform"
                type="rotate"
                from="0 20 20"
                to="360 20 20"
                dur="0.9s"
                repeatCount="indefinite"/>
            </path>
          </svg>`;
    }
    console.log("Payment Received : ");
    try {
      const moveToFirestoreResult = await moveToFirestore();

      if (moveToFirestoreResult) {
        await initializeTableWithDeafultValues();
      }
      location.reload();
    } catch (error) {
      console.error("Payement Received: ", error);
    } finally {
      // Remove loading class and reset button text
      paymentReceivedBtn.classList.remove("loading");
      paymentReceivedBtn.innerHTML = "Payment Received";
    }
    // showConfirmationPopup();
  }

  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");

  // Function to handle printing the bill
  function printBill() {
    // Implement your print logic here
    window.print(); // This will open the print dialog
    closePaymentPopup(); // Close the popups after printing
  }

  function closePaymentPopup() {
    paymentPopup.classList.add("hidden");
    popupOverlay.classList.add("hidden");
    document.getElementById("messageInput").value = ""; // Clear the message input
  }

  // Event listener for Yes button
  yesButton.addEventListener("click", function () {
    confirmationPopup.classList.add("hidden");
    printBill();
    location.reload();
  });

  // Event listener for No button
  noButton.addEventListener("click", () => {
    confirmationPopup.classList.add("hidden");
    location.reload();
  });

  printButton.addEventListener("click", printButtonFn);
  function printButtonFn() {
    const printContent = paymentPopup.innerHTML; // Get the content of the popup
    const printWindow = window.open("", "", "height=600,width=800"); // Open a new window

    // Write the HTML and include styles
    printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h2 {
                        color: #333;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid #ccc;
                        padding: 10px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                ${printContent} <!-- Add the popup content -->
            </body>
        </html>
    `);
    printWindow.document.close(); // Close the document
    printWindow.print(); // Trigger the print dialog
    printWindow.close(); // Close the print window after printing
  }

  // Optional: Close the popup when clicking on the overlay
  popupOverlay.addEventListener("click", () => {
    paymentPopup.classList.add("hidden");
    popupOverlay.classList.add("hidden");
    document.getElementById("messageInput").value = ""; // Clear the message input
  });

  async function moveToFirestore() {
    const tableButton = document.querySelector(".table-btn.active-btn");
    const orderId = tableButton.dataset.tableNo;
    console.log("moveToFirestore Enter with orderID: " + orderId);

    try {
      // Fetch order data from Realtime Database
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, "orders/" + orderId));
      let orderData = snapshot.val();

      // Retrieve message from textarea
      const messageInput = document.getElementById("messageInput").value.trim();

      if (orderData) {
        console.log("moveToFirestore Snapshot exists");
        console.log("Order Data: ", orderData);

        // Add the message from the textarea
        orderData.message = messageInput || "No message provided";

        const now = new Date();

        // Format the date to YYYYMMDD
        const formattedDate = now.toISOString().split("T")[0].replace(/-/g, ""); // e.g., '20240811'
        const timeStampStr = now.toTimeString().split(" ")[0].replace(/:/g, ""); // e.g., '11:18:23'
        const dataDocName = `${orderId}_${formattedDate}_${timeStampStr}`;

        try {
          await setDoc(
            doc(db, `orders/data_${formattedDate}/${orderId}`, dataDocName),
            orderData
          );
          console.log(
            `Order data stored at: orders/data_${formattedDate}/${dataDocName}`
          );
        } catch (error) {
          console.error("Error writing document: ", error);
          return false; // Execution failed
        }
        // Optionally, remove the original order from Realtime Database
        const entryRef = ref(database, "orders/" + orderId);
        try {
          await remove(entryRef);
          console.log("Entry removed successfully");
          alert("Payment received and order moved to Firestore!");
          return true;
        } catch (error) {
          console.error("Error removing entry (code):", error.code);
          console.error("Error removing entry (message):", error.message);
          alert(`Error: ${error.message}`);
          return false; // Return false if removal fails
        }
      } else {
        console.error("No data available for this table.");
        alert("No order found for this table.");
      }
    } catch (error) {
      console.error("Error fetching or moving data: ", error);
      alert("An error occurred. Please try again.");
    }
  }

  async function initializeTableWithDeafultValues() {
    const tableButton = document.querySelector(".table-btn.active-btn");
    const orderId = tableButton.dataset.tableNo;
    console.log(
      "initializeTableWithDeafultValues Enter with orderID: " + orderId
    );
    const tableID = orderId.toLowerCase();
    const data = {
      tableClosed: false,
      toBilling: false,
      custName: "Rajnish",
      orderDetail: {
        [tableID]: [
          {
            changeValue: "",
            chefStatus: 100,
            dineIn: "Yes",
            itemName: "Paneer Curry",
            note: "",
            quantity: 0,
          },
        ],
      },
      timeStamp: "2024-07-28_11:10:11",
      waiterName: "",
    };

    try {
      if (orderId) {
        const reference = ref(database, "orders/" + orderId);
        await set(reference, data);
        console.log("Orders submitted successfully!");
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }
    } catch (error) {
      console.error("Error writing data (code):", error.code);
      console.error("Error writing data (message):", error.message);
      alert("Error submitting orders. Please try again.");
    }
  }

  document
    .getElementById("generate-bill")
    ?.addEventListener("click", function () {
      alert("Bill Generated!");
    });
});
