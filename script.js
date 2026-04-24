document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("create-event-btn");
  const cancelEventBtn = document.getElementById("cancel-event-btn");
  const createEventSection = document.getElementById("create-event-section");
  const form = document.querySelector(".event-form");
  const tableBody = document.getElementById("events-table-body");
  const editingEventIndex = document.getElementById("editing-event-index");
  const uploadBtn = document.getElementById("upload-event-btn");
  const eventImageInput = document.getElementById("eventImage");
  const uploadStatus = document.getElementById("upload-status");

  const eventNameInput = document.getElementById("eventName");
  const clientNameInput = document.getElementById("clientName");
  const eventDateInput = document.getElementById("eventDate");
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");
  const guestCountInput = document.getElementById("guestCount");
  const eventMenuInput = document.getElementById("eventMenu");
  const venueInput = document.getElementById("venue");
  const statusInput = document.getElementById("status");

  const navDashboard = document.getElementById("nav-dashboard");
  const navEvents = document.getElementById("nav-events");
  const navMenus = document.getElementById("nav-menus");
  const navRecipes = document.getElementById("nav-recipes");
  const dashboardSection = document.getElementById("dashboard-section");
  const eventsSection = document.getElementById("events-section");
  const menusSection = document.getElementById("menus-section");
  const recipesSection = document.getElementById("recipes-section");
  const addMenuBtn = document.getElementById("add-menu-btn");
  const menusTableBody = document.getElementById("menus-table-body");
  const menuNameInput = document.getElementById("menuName");
  const menuTypeInput = document.getElementById("menuType");
  const menuCostInput = document.getElementById("menuCost");
  const menuPriceInput = document.getElementById("menuPrice");
  const menuRecipesInput = document.getElementById("menuRecipes");
  const addRecipeBtn = document.getElementById("add-recipe-btn");
  const recipesTableBody = document.getElementById("recipes-table-body");
  const recipeNameInput = document.getElementById("recipeName");
  const recipeCategoryInput = document.getElementById("recipeCategory");
  const recipeCostInput = document.getElementById("recipeCost");
  const recipePortionsInput = document.getElementById("recipePortions");
  const recipeNotesInput = document.getElementById("recipeNotes");
  const recipeIngredientItemInput = document.getElementById("recipeIngredientItem");
  const recipeIngredientQtyInput = document.getElementById("recipeIngredientQty");
  const addRecipeIngredientBtn = document.getElementById("add-recipe-ingredient-btn");
  const selectedIngredientsList = document.getElementById("selected-ingredients-list");
  let currentRecipeIngredients = [];
  let editingRecipeId = null;
  const navInventory = document.getElementById("nav-inventory");
  const inventorySection = document.getElementById("inventory-section");
  const addInventoryBtn = document.getElementById("add-inventory-btn");
  const inventoryTableBody = document.getElementById("inventory-table-body");
  const inventoryItemNameInput = document.getElementById("inventoryItemName");
  const inventoryQuantityInput = document.getElementById("inventoryQuantity");
  const inventoryUnitInput = document.getElementById("inventoryUnit");
  const inventoryCostInput = document.getElementById("inventoryCost");
  let editingInventoryItemId = null;

  const kpiEventsToday = document.getElementById("kpi-events-today");
  const kpiUpcomingEvents = document.getElementById("kpi-upcoming-events");
  const kpiDraftEvents = document.getElementById("kpi-draft-events");
  const kpiConfirmedEvents = document.getElementById("kpi-confirmed-events");

  const getEvents = () => {
    try {
      return JSON.parse(localStorage.getItem("events")) || [];
    } catch {
      return [];
    }
  };

  const saveEvents = (events) => {
    localStorage.setItem("events", JSON.stringify(events));
  };

  const getMenus = () => {
    try {
      return JSON.parse(localStorage.getItem("menus")) || [];
    } catch {
      return [];
    }
  };

  const saveMenus = (menus) => {
    localStorage.setItem("menus", JSON.stringify(menus));
  };

  const getRecipes = () => {
    try {
      return JSON.parse(localStorage.getItem("recipes")) || [];
    } catch {
      return [];
    }
  };

  const saveRecipes = (recipes) => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  };

  const getInventory = () => {
    try {
      return JSON.parse(localStorage.getItem("inventory")) || [];
    } catch {
      return [];
    }
  };

  const saveInventory = (inventory) => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  };

  const resetFormState = () => {
    if (form) form.reset();
    if (editingEventIndex) editingEventIndex.value = "";
    if (eventImageInput) eventImageInput.value = "";
    if (uploadStatus) uploadStatus.textContent = "No image uploaded yet.";
  };

  const openForm = () => {
    if (!createEventSection) return;
    createEventSection.hidden = false;
    createEventSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const closeForm = () => {
    if (!createEventSection) return;
    createEventSection.hidden = true;
    resetFormState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusClass = (status) => {
    if (status === "Confirmed") return "confirmed";
    if (status === "Draft") return "draft";
    if (status === "In Preparation") return "prep";
    if (status === "Ready") return "ready";
    return "draft";
  };

  const getEventIntelligence = ({ selectedMenu, guests, estimatedMargin, estimatedProfit }) => {
    if (!selectedMenu) {
      return {
        label: "No menu",
        className: "draft",
        insight: "No menu selected. Connect this event to a menu to calculate revenue, cost, profit, and recommendations.",
        recommendation: "Select a menu before confirming this event."
      };
    }

    const marginNumber = Number(estimatedMargin);
    const guestNumber = Number(guests || 0);

    if (marginNumber >= 80) {
      return {
        label: "🟢 Add Value",
        className: "confirmed",
        insight: "Very high margin. This event is highly profitable, but the food value may look too low if the menu is too simple.",
        recommendation: "Consider adding one premium side, dessert, or beverage station while keeping the strong margin."
      };
    }

    if (marginNumber >= 55) {
      return {
        label: "🟢 High Profit",
        className: "confirmed",
        insight: "Strong profit event. This menu has a healthy margin.",
        recommendation: guestNumber >= 300
          ? "Maintain price and review production staffing because this is a large event."
          : "Maintain price and keep this menu as a strong profitable option."
      };
    }

    if (marginNumber >= 35) {
      return {
        label: "🟡 Review Cost",
        className: "upcoming",
        insight: "Medium profit event. The margin is acceptable but should be reviewed before confirmation.",
        recommendation: "Check food cost, labor needs, and consider increasing price slightly if service complexity is high."
      };
    }

    return {
      label: "🔴 Adjust Price",
      className: "issue",
      insight: estimatedProfit < 0
        ? "This event is projected to lose money."
        : "Low margin event. Profit is too close to cost.",
      recommendation: "Increase selling price, reduce food cost, or simplify the menu before confirming."
    };
  };

  // Inventory Check Helper
  const getEventInventoryCheck = ({ selectedMenu, guests }) => {
    if (!selectedMenu) {
      return {
        label: "No menu",
        className: "draft",
        details: "No menu selected. Inventory cannot be checked yet.",
        purchaseRecommendations: "Select a menu to generate purchase recommendations."
      };
    }

    const guestCount = Number(guests || 0);
    if (guestCount <= 0) {
      return {
        label: "No guests",
        className: "draft",
        details: "Guest count is missing. Add guests to check inventory needs.",
        purchaseRecommendations: "Add guest count to calculate purchase quantities."
      };
    }

    const recipes = getRecipes();
    const inventory = getInventory();
    const requiredItems = {};

    (selectedMenu.recipeIds || []).forEach((recipeId) => {
      const recipe = recipes.find((item) => item.id === recipeId);
      if (!recipe || !recipe.ingredients) return;

      recipe.ingredients.forEach((ingredient) => {
        const inventoryItemId = ingredient.inventoryItemId;
        const neededQty = Number(ingredient.qty || 0) * guestCount;

        if (!requiredItems[inventoryItemId]) {
          requiredItems[inventoryItemId] = 0;
        }

        requiredItems[inventoryItemId] += neededQty;
      });
    });

    const requiredItemIds = Object.keys(requiredItems);

    if (requiredItemIds.length === 0) {
      return {
        label: "No recipe data",
        className: "draft",
        details: "This menu does not have recipe ingredients connected to inventory yet.",
        purchaseRecommendations: "Connect recipes and inventory ingredients to this menu before generating purchase recommendations."
      };
    }

    const issues = [];
    const warnings = [];
    const readyItems = [];
    const purchaseRecommendations = [];

    requiredItemIds.forEach((itemId) => {
      const inventoryItem = inventory.find((item) => item.id === itemId);
      const neededQty = Number(requiredItems[itemId] || 0);

      if (!inventoryItem) {
        issues.push(`Missing inventory item for ingredient ID ${itemId}`);
        purchaseRecommendations.push(`Unknown item ${itemId}: add this item to inventory before production.`);
        return;
      }

      const availableQty = Number(inventoryItem.quantity || 0);
      const unit = inventoryItem.unit || "units";

      if (availableQty < neededQty) {
        const buyQty = neededQty - availableQty;
        issues.push(`${inventoryItem.name}: need ${neededQty.toFixed(2)} ${unit}, available ${availableQty.toFixed(2)} ${unit}`);
        purchaseRecommendations.push(`${inventoryItem.name}: buy at least ${buyQty.toFixed(2)} ${unit}`);
      } else if (availableQty - neededQty <= 10) {
        warnings.push(`${inventoryItem.name}: need ${neededQty.toFixed(2)} ${unit}, available ${availableQty.toFixed(2)} ${unit}`);
      } else {
        readyItems.push(`${inventoryItem.name}: need ${neededQty.toFixed(2)} ${unit}, available ${availableQty.toFixed(2)} ${unit}`);
      }
    });

    if (issues.length > 0) {
      return {
        label: "❌ Not Enough",
        className: "issue",
        details: issues.join("\n"),
        purchaseRecommendations: purchaseRecommendations.join("\n")
      };
    }

    if (warnings.length > 0) {
      return {
        label: "⚠️ Low Stock",
        className: "upcoming",
        details: warnings.join("\n"),
        purchaseRecommendations: "Inventory is technically enough, but stock will be low after this event. Consider ordering backup stock."
      };
    }

    return {
      label: "✅ Ready",
      className: "confirmed",
      details: readyItems.join("\n") || "Inventory looks ready for this event.",
      purchaseRecommendations: "No urgent purchase needed for this event."
    };
  };

  const populateFormForEdit = (eventData, index) => {
    if (!eventData) return;

    if (eventNameInput) eventNameInput.value = eventData.name || "";
    if (clientNameInput) clientNameInput.value = eventData.client || "";
    if (eventDateInput) eventDateInput.value = eventData.date || "";
    if (startTimeInput) startTimeInput.value = eventData.startTime || "";
    if (endTimeInput) endTimeInput.value = eventData.endTime || "";
    if (guestCountInput) guestCountInput.value = eventData.guests || "";
    if (eventMenuInput) eventMenuInput.value = eventData.menuId || "";
    if (venueInput) venueInput.value = eventData.venue || "";
    if (statusInput) statusInput.value = eventData.status || "Draft";
    if (editingEventIndex) editingEventIndex.value = String(index);

    openForm();
  };

  const applyExtractedEventData = (data) => {
    if (!data) return;

    if (eventNameInput && data.name) eventNameInput.value = data.name;
    if (clientNameInput && data.client) clientNameInput.value = data.client;
    if (eventDateInput && data.date) eventDateInput.value = data.date;
    if (startTimeInput && data.startTime) startTimeInput.value = data.startTime;
    if (endTimeInput && data.endTime) endTimeInput.value = data.endTime;
    if (guestCountInput && data.guests) guestCountInput.value = data.guests;
    if (venueInput && data.venue) venueInput.value = data.venue;
    if (statusInput && data.status) statusInput.value = data.status;
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          reject(new Error("Unable to read image."));
          return;
        }
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Unable to read image."));
      reader.readAsDataURL(file);
    });

  const extractEventFromImage = async (file) => {
    if (!file) return;
    openForm();
    if (uploadStatus) uploadStatus.textContent = `Analyzing ${file.name}...`;

    try {
      const imageBase64 = await fileToBase64(file);

      const response = await fetch("http://localhost:3001/api/extract-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          imageBase64
        })
      });

      if (!response.ok) {
        throw new Error("Extraction request failed.");
      }

      const result = await response.json();
      applyExtractedEventData(result);
      if (uploadStatus) {
        uploadStatus.textContent = "Event image analyzed. Review the autofilled fields.";
      }
    } catch (error) {
      console.error(error);
      if (uploadStatus) {
        uploadStatus.textContent = "AI extraction is not connected yet. Hook up POST /api/extract-event to autofill this form.";
      }
    }
  };

  const renderEvents = () => {
    const events = getEvents();
    if (!tableBody) return;

    tableBody.innerHTML = "";
    const menus = getMenus();

    if (events.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="13" style="color:#64748b; text-align:center; padding:20px;">
          No events yet. Create your first event.
        </td>
      `;
      tableBody.appendChild(emptyRow);
      return;
    }

    [...events].reverse().forEach((eventData, index) => {
      const realIndex = events.length - 1 - index;
      const newRow = document.createElement("tr");
      const selectedMenu = menus.find((menu) => menu.id === eventData.menuId);
      const guests = Number(eventData.guests || 0);
      const estimatedRevenue = selectedMenu ? guests * Number(selectedMenu.price || 0) : 0;
      const estimatedCost = selectedMenu ? guests * Number(selectedMenu.cost || 0) : 0;
      const estimatedProfit = estimatedRevenue - estimatedCost;
      const estimatedMargin = estimatedRevenue > 0
        ? ((estimatedProfit / estimatedRevenue) * 100).toFixed(1)
        : "0.0";

      const eventIntelligence = getEventIntelligence({
        selectedMenu,
        guests,
        estimatedMargin,
        estimatedProfit
      });

      const visibleInsight = eventIntelligence.label;
      const insightClass = eventIntelligence.className;

      const inventoryCheck = getEventInventoryCheck({
        selectedMenu,
        guests
      });

      newRow.innerHTML = `
        <td>${eventData.name || "-"}</td>
        <td>
          <div>${eventData.date || "-"}</div>
          <div class="event-time-range">${eventData.startTime || "--:--"} - ${eventData.endTime || "--:--"}</div>
        </td>
        <td>${eventData.venue || "-"}</td>
        <td>${eventData.guests || "-"}</td>
        <td>${selectedMenu ? selectedMenu.name : "No menu"}</td>
        <td>${selectedMenu ? `$${estimatedRevenue.toFixed(2)}` : "-"}</td>
        <td>${selectedMenu ? `$${estimatedCost.toFixed(2)}` : "-"}</td>
        <td>${selectedMenu ? `$${estimatedProfit.toFixed(2)}` : "-"}</td>
        <td>${selectedMenu ? `${estimatedMargin}%` : "-"}</td>
        <td><span class="status ${insightClass}">${visibleInsight}</span></td>
        <td><span class="status ${inventoryCheck.className}">${inventoryCheck.label}</span></td>
        <td><span class="status ${getStatusClass(eventData.status)}">${eventData.status || "Draft"}</span></td>
        <td>
          <div class="action-menu">
            <button type="button" class="action-menu-btn" aria-label="Open actions menu">☰</button>
            <div class="action-menu-dropdown">
              <button type="button" class="action-item analyze-btn">Analyze</button>
              <button type="button" class="action-item edit-btn">Edit</button>
              <button type="button" class="action-item delete-btn danger">Delete</button>
            </div>
          </div>
        </td>
      `;

      const actionMenuBtn = newRow.querySelector(".action-menu-btn");
      const actionMenu = newRow.querySelector(".action-menu");
      const analyzeBtn = newRow.querySelector(".analyze-btn");
      const editBtn = newRow.querySelector(".edit-btn");
      const deleteBtn = newRow.querySelector(".delete-btn");

      if (actionMenuBtn && actionMenu) {
        actionMenuBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          document.querySelectorAll(".action-menu.open").forEach((menu) => {
            if (menu !== actionMenu) menu.classList.remove("open");
          });
          actionMenu.classList.toggle("open");
        });
      }

      if (analyzeBtn) {
        analyzeBtn.addEventListener("click", () => {
          if (!selectedMenu) {
            alert("No menu selected for this event.");
            return;
          }

          const eventIntelligence = getEventIntelligence({
            selectedMenu,
            guests,
            estimatedMargin,
            estimatedProfit
          });

          const inventoryCheck = getEventInventoryCheck({
            selectedMenu,
            guests
          });

          let staffSuggestion = "";

          if (guests >= 300) {
            staffSuggestion = "Suggested staff: large team recommended. Review prep, service, and steward coverage.";
          } else if (guests >= 100) {
            staffSuggestion = "Suggested staff: medium team recommended. Confirm prep and service coverage.";
          } else {
            staffSuggestion = "Suggested staff: small team may be enough, depending on service style.";
          }

          alert(`
BEOFlow Event Analysis

Event: ${eventData.name || "Untitled Event"}
Guests: ${guests}
Menu: ${selectedMenu.name}

Revenue: $${estimatedRevenue.toFixed(2)}
Cost: $${estimatedCost.toFixed(2)}
Profit: $${estimatedProfit.toFixed(2)}
Margin: ${estimatedMargin}%

Insight:
${eventIntelligence.insight}

Recommendation:
${eventIntelligence.recommendation}

Inventory Check:
${inventoryCheck.label}
${inventoryCheck.details}

Purchase Recommendations:
${inventoryCheck.purchaseRecommendations || "No purchase recommendation available."}

${staffSuggestion}
          `);
        });
      }

      if (editBtn) {
        editBtn.addEventListener("click", () => {
          const realEvents = getEvents();
          populateFormForEdit(realEvents[realIndex], realIndex);
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          const confirmDelete = confirm("Delete this event?");
          if (!confirmDelete) return;

          const realEvents = getEvents();
          realEvents.splice(realIndex, 1);
          saveEvents(realEvents);
          renderEvents();
          renderKpis();
        });
      }

      tableBody.appendChild(newRow);
    });
  };

  document.addEventListener("click", () => {
    document.querySelectorAll(".action-menu.open").forEach((menu) => {
      menu.classList.remove("open");
    });
  });

  const renderKpis = () => {
    const events = getEvents();
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    let eventsTodayCount = 0;
    let upcomingEventsCount = 0;
    let draftEventsCount = 0;
    let confirmedEventsCount = 0;

    events.forEach((eventData) => {
      if (eventData.date === todayString) {
        eventsTodayCount++;
      }

      if (eventData.date) {
        const eventDate = new Date(`${eventData.date}T00:00:00`);
        const startOfToday = new Date(`${todayString}T00:00:00`);
        if (eventDate > startOfToday && eventDate <= next7Days) {
          upcomingEventsCount++;
        }
      }

      if (eventData.status === "Draft") {
        draftEventsCount++;
      }

      if (eventData.status === "Confirmed") {
        confirmedEventsCount++;
      }
    });

    if (kpiEventsToday) kpiEventsToday.textContent = eventsTodayCount;
    if (kpiUpcomingEvents) kpiUpcomingEvents.textContent = upcomingEventsCount;
    if (kpiDraftEvents) kpiDraftEvents.textContent = draftEventsCount;
    if (kpiConfirmedEvents) kpiConfirmedEvents.textContent = confirmedEventsCount;
  };

  const hideAllMainSections = () => {
    if (dashboardSection) {
      dashboardSection.hidden = true;
      dashboardSection.style.display = "none";
    }
    if (eventsSection) eventsSection.hidden = true;
    if (menusSection) menusSection.hidden = true;
    if (recipesSection) recipesSection.hidden = true;
    if (inventorySection) inventorySection.hidden = true;
    if (createEventSection) createEventSection.hidden = true;
  };

  const setActiveNav = (activeNav) => {
    [navDashboard, navEvents, navMenus, navRecipes, navInventory].forEach((navItem) => {
      if (!navItem) return;
      navItem.classList.toggle("active", navItem === activeNav);
    });
  };

  const calculateRecipeIngredientCost = (ingredients = []) => {
    const inventory = getInventory();

    return ingredients.reduce((total, ingredient) => {
      const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
      return total + (Number(ingredient.qty || 0) * Number(item?.cost || 0));
    }, 0);
  };

  const renderSelectedIngredients = () => {
    if (!selectedIngredientsList) return;

    if (currentRecipeIngredients.length === 0) {
      selectedIngredientsList.textContent = "No ingredients added yet.";
      return;
    }

    const inventory = getInventory();
    selectedIngredientsList.innerHTML = currentRecipeIngredients.map((ingredient) => {
      const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
      const itemName = item ? item.name : "Unknown item";
      const itemUnit = item ? item.unit : "unit";
      const ingredientCost = Number(ingredient.qty || 0) * Number(item?.cost || 0);

      return `
        <div class="selected-ingredient-pill">
          ${itemName}: ${Number(ingredient.qty || 0).toFixed(2)} ${itemUnit} / portion · $${ingredientCost.toFixed(2)}
        </div>
      `;
    }).join("");
  };

  const populateRecipeIngredientOptions = () => {
    if (!recipeIngredientItemInput) return;

    const selectedValue = recipeIngredientItemInput.value;
    const inventory = getInventory();

    recipeIngredientItemInput.innerHTML = "";

    if (inventory.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Add inventory items first";
      recipeIngredientItemInput.appendChild(option);
      return;
    }

    inventory.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.name} (${item.unit}) - $${Number(item.cost || 0).toFixed(2)} / ${item.unit}`;
      recipeIngredientItemInput.appendChild(option);
    });

    recipeIngredientItemInput.value = selectedValue;
  };

  const addRecipeIngredient = () => {
    const inventoryItemId = recipeIngredientItemInput ? recipeIngredientItemInput.value : "";
    const qty = recipeIngredientQtyInput ? Number(recipeIngredientQtyInput.value) : 0;

    if (!inventoryItemId || qty <= 0) {
      alert("Please select an inventory item and enter quantity per portion.");
      return;
    }

    currentRecipeIngredients.push({ inventoryItemId, qty });
    renderSelectedIngredients();

    if (recipeIngredientQtyInput) recipeIngredientQtyInput.value = "";
  };

  const populateEventMenuOptions = () => {
    if (!eventMenuInput) return;

    const selectedValue = eventMenuInput.value;
    const menus = getMenus();

    eventMenuInput.innerHTML = `<option value="">Select a menu</option>`;

    menus.forEach((menu) => {
      const option = document.createElement("option");
      option.value = menu.id;
      option.textContent = `${menu.name} - $${Number(menu.price || 0).toFixed(2)} / person`;
      eventMenuInput.appendChild(option);
    });

    eventMenuInput.value = selectedValue;
  };

  const populateMenuRecipeOptions = () => {
    if (!menuRecipesInput) return;

    const selectedValues = Array.from(menuRecipesInput.selectedOptions).map((option) => option.value);
    const recipes = getRecipes();

    menuRecipesInput.innerHTML = "";

    if (recipes.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Create recipes first";
      menuRecipesInput.appendChild(option);
      return;
    }

    recipes.forEach((recipe) => {
      const option = document.createElement("option");
      option.value = recipe.id;
      option.textContent = `${recipe.name} - $${Number(recipe.cost || 0).toFixed(2)} / portion`;
      option.selected = selectedValues.includes(recipe.id);
      menuRecipesInput.appendChild(option);
    });
  };

  const renderMenus = () => {
    const menus = getMenus();
    const recipes = getRecipes();
    if (!menusTableBody) return;

    menusTableBody.innerHTML = "";

    if (menus.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="6" style="color:#64748b; text-align:center; padding:20px;">
          No menus yet. Create your first menu.
        </td>
      `;
      menusTableBody.appendChild(emptyRow);
      return;
    }

    menus.forEach((menu) => {
      const recipeNames = (menu.recipeIds || [])
        .map((recipeId) => recipes.find((recipe) => recipe.id === recipeId)?.name)
        .filter(Boolean);

      const recipeCost = (menu.recipeIds || []).reduce((total, recipeId) => {
        const recipe = recipes.find((item) => item.id === recipeId);
        return total + Number(recipe?.cost || 0);
      }, 0);

      const displayCost = recipeCost > 0 ? recipeCost : Number(menu.cost || 0);
      const margin = menu.price > 0
        ? (((menu.price - displayCost) / menu.price) * 100).toFixed(1)
        : "0.0";

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${menu.name || "-"}</td>
        <td>${menu.type || "-"}</td>
        <td>${recipeNames.length ? recipeNames.join(", ") : "No recipes"}</td>
        <td>$${displayCost.toFixed(2)}</td>
        <td>$${Number(menu.price || 0).toFixed(2)}</td>
        <td>${margin}%</td>
      `;
      menusTableBody.appendChild(newRow);
    });
  };

  const addMenu = () => {
    const name = menuNameInput ? menuNameInput.value.trim() : "";
    const type = menuTypeInput ? menuTypeInput.value : "Buffet";
    const selectedRecipeIds = menuRecipesInput
      ? Array.from(menuRecipesInput.selectedOptions)
          .map((option) => option.value)
          .filter(Boolean)
      : [];
    const recipes = getRecipes();
    const recipeCost = selectedRecipeIds.reduce((total, recipeId) => {
      const recipe = recipes.find((item) => item.id === recipeId);
      return total + Number(recipe?.cost || 0);
    }, 0);
    const manualCost = menuCostInput ? Number(menuCostInput.value) : 0;
    const cost = recipeCost > 0 ? recipeCost : manualCost;
    const price = menuPriceInput ? Number(menuPriceInput.value) : 0;

    if (!name || cost <= 0 || price <= 0) {
      alert("Please complete the menu information. Add a manual cost or select recipes.");
      return;
    }

    const menus = getMenus();
    menus.push({
      id: Date.now().toString(),
      name,
      type,
      cost,
      price,
      recipeIds: selectedRecipeIds
    });
    saveMenus(menus);
    renderMenus();
    populateEventMenuOptions();

    if (menuNameInput) menuNameInput.value = "";
    if (menuCostInput) menuCostInput.value = "";
    if (menuPriceInput) menuPriceInput.value = "";
    if (menuRecipesInput) {
      Array.from(menuRecipesInput.options).forEach((option) => {
        option.selected = false;
      });
    }
  };

  const renderRecipes = () => {
    const recipes = getRecipes();
    const inventory = getInventory();
    if (!recipesTableBody) return;

    recipesTableBody.innerHTML = "";

    if (recipes.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="8" style="color:#64748b; text-align:center; padding:20px;">
          No recipes yet. Create your first recipe.
        </td>
      `;
      recipesTableBody.appendChild(emptyRow);
      return;
    }

    recipes.forEach((recipe) => {
      const ingredientCost = calculateRecipeIngredientCost(recipe.ingredients || []);
      const cost = ingredientCost > 0 ? ingredientCost : Number(recipe.cost || 0);
      const portions = Number(recipe.portions || 0);
      const totalBatchCost = cost * portions;
      const ingredientNames = (recipe.ingredients || []).map((ingredient) => {
        const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
        return item ? `${item.name} (${Number(ingredient.qty || 0).toFixed(2)} ${item.unit})` : "Unknown item";
      });

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${recipe.name || "-"}</td>
        <td>${recipe.category || "-"}</td>
        <td>${ingredientNames.length ? ingredientNames.join(", ") : "No ingredients"}</td>
        <td>$${cost.toFixed(2)}</td>
        <td>${portions || "-"}</td>
        <td>$${totalBatchCost.toFixed(2)}</td>
        <td>${recipe.notes || "-"}</td>
        <td>
          <div class="action-menu">
            <button type="button" class="action-menu-btn" aria-label="Open recipe actions menu">☰</button>
            <div class="action-menu-dropdown">
              <button type="button" class="action-item recipe-edit-btn">Edit</button>
              <button type="button" class="action-item recipe-delete-btn danger">Delete</button>
            </div>
          </div>
        </td>
      `;

      const actionMenuBtn = newRow.querySelector(".action-menu-btn");
      const actionMenu = newRow.querySelector(".action-menu");
      const editBtn = newRow.querySelector(".recipe-edit-btn");
      const deleteBtn = newRow.querySelector(".recipe-delete-btn");

      if (actionMenuBtn && actionMenu) {
        actionMenuBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          document.querySelectorAll(".action-menu.open").forEach((menu) => {
            if (menu !== actionMenu) menu.classList.remove("open");
          });
          actionMenu.classList.toggle("open");
        });
      }

      if (editBtn) {
        editBtn.addEventListener("click", () => {
          if (recipeNameInput) recipeNameInput.value = recipe.name || "";
          if (recipeCategoryInput) recipeCategoryInput.value = recipe.category || "Entree";
          if (recipeCostInput) recipeCostInput.value = recipe.cost || "";
          if (recipePortionsInput) recipePortionsInput.value = recipe.portions || "";
          if (recipeNotesInput) recipeNotesInput.value = recipe.notes || "";
          currentRecipeIngredients = [...(recipe.ingredients || [])];
          editingRecipeId = recipe.id;
          renderSelectedIngredients();
          if (addRecipeBtn) addRecipeBtn.textContent = "Update Recipe";
          recipesSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          const confirmDelete = confirm(`Delete ${recipe.name || "this recipe"}?`);
          if (!confirmDelete) return;

          const updatedRecipes = getRecipes().filter((recipeItem) => recipeItem.id !== recipe.id);
          saveRecipes(updatedRecipes);

          if (editingRecipeId === recipe.id) {
            editingRecipeId = null;
            currentRecipeIngredients = [];
            renderSelectedIngredients();
            if (addRecipeBtn) addRecipeBtn.textContent = "Add Recipe";
            if (recipeNameInput) recipeNameInput.value = "";
            if (recipeCostInput) recipeCostInput.value = "";
            if (recipePortionsInput) recipePortionsInput.value = "";
            if (recipeNotesInput) recipeNotesInput.value = "";
          }

          renderRecipes();
          populateMenuRecipeOptions();
          renderMenus();
          renderEvents();
        });
      }

      recipesTableBody.appendChild(newRow);
    });
  };

  const addRecipe = () => {
    const name = recipeNameInput ? recipeNameInput.value.trim() : "";
    const category = recipeCategoryInput ? recipeCategoryInput.value : "Entree";
    const ingredientCost = calculateRecipeIngredientCost(currentRecipeIngredients);
    const manualCost = recipeCostInput ? Number(recipeCostInput.value) : 0;
    const cost = ingredientCost > 0 ? ingredientCost : manualCost;
    const portions = recipePortionsInput ? Number(recipePortionsInput.value) : 0;
    const notes = recipeNotesInput ? recipeNotesInput.value.trim() : "";

    if (!name || cost <= 0 || portions <= 0) {
      alert("Please complete the recipe information. Add a manual cost or add ingredients from inventory.");
      return;
    }

    const recipes = getRecipes();

    if (editingRecipeId) {
      const updatedRecipes = recipes.map((recipe) => {
        if (recipe.id !== editingRecipeId) return recipe;
        return {
          ...recipe,
          name,
          category,
          cost,
          portions,
          notes,
          ingredients: [...currentRecipeIngredients]
        };
      });
      saveRecipes(updatedRecipes);
      editingRecipeId = null;
      if (addRecipeBtn) addRecipeBtn.textContent = "Add Recipe";
    } else {
      recipes.push({
        id: Date.now().toString(),
        name,
        category,
        cost,
        portions,
        notes,
        ingredients: [...currentRecipeIngredients]
      });
      saveRecipes(recipes);
    }

    renderRecipes();
    populateMenuRecipeOptions();
    renderMenus();
    renderEvents();

    if (recipeNameInput) recipeNameInput.value = "";
    if (recipeCostInput) recipeCostInput.value = "";
    if (recipePortionsInput) recipePortionsInput.value = "";
    if (recipeNotesInput) recipeNotesInput.value = "";
    currentRecipeIngredients = [];
    renderSelectedIngredients();
  };

  const getInventoryStatus = (quantity) => {
    const qty = Number(quantity || 0);
    if (qty <= 0) {
      return { label: "Out of Stock", className: "issue" };
    }
    if (qty <= 10) {
      return { label: "Low Stock", className: "upcoming" };
    }
    return { label: "In Stock", className: "confirmed" };
  };

  const renderInventory = () => {
    const inventory = getInventory();
    if (!inventoryTableBody) return;

    inventoryTableBody.innerHTML = "";

    if (inventory.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="7" style="color:#64748b; text-align:center; padding:20px;">
          No inventory items yet. Add your first item.
        </td>
      `;
      inventoryTableBody.appendChild(emptyRow);
      return;
    }

    inventory.forEach((item) => {
      const quantity = Number(item.quantity || 0);
      const cost = Number(item.cost || 0);
      const stockValue = quantity * cost;
      const status = getInventoryStatus(quantity);

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${item.name || "-"}</td>
        <td>${quantity.toFixed(2)}</td>
        <td>${item.unit || "-"}</td>
        <td>$${cost.toFixed(2)}</td>
        <td>$${stockValue.toFixed(2)}</td>
        <td><span class="status ${status.className}">${status.label}</span></td>
        <td>
          <div class="action-menu">
            <button type="button" class="action-menu-btn" aria-label="Open inventory actions menu">☰</button>
            <div class="action-menu-dropdown">
              <button type="button" class="action-item inventory-edit-btn">Edit</button>
              <button type="button" class="action-item inventory-delete-btn danger">Delete</button>
            </div>
          </div>
        </td>
      `;

      const actionMenuBtn = newRow.querySelector(".action-menu-btn");
      const actionMenu = newRow.querySelector(".action-menu");
      const editBtn = newRow.querySelector(".inventory-edit-btn");
      const deleteBtn = newRow.querySelector(".inventory-delete-btn");

      if (actionMenuBtn && actionMenu) {
        actionMenuBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          document.querySelectorAll(".action-menu.open").forEach((menu) => {
            if (menu !== actionMenu) menu.classList.remove("open");
          });
          actionMenu.classList.toggle("open");
        });
      }

      if (editBtn) {
        editBtn.addEventListener("click", () => {
          if (inventoryItemNameInput) inventoryItemNameInput.value = item.name || "";
          if (inventoryQuantityInput) inventoryQuantityInput.value = item.quantity || "";
          if (inventoryUnitInput) inventoryUnitInput.value = item.unit || "lb";
          if (inventoryCostInput) inventoryCostInput.value = item.cost || "";
          editingInventoryItemId = item.id;
          if (addInventoryBtn) addInventoryBtn.textContent = "Update Inventory Item";
          inventorySection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          const confirmDelete = confirm(`Delete ${item.name || "this inventory item"}?`);
          if (!confirmDelete) return;

          const updatedInventory = getInventory().filter((inventoryItem) => inventoryItem.id !== item.id);
          saveInventory(updatedInventory);

          if (editingInventoryItemId === item.id) {
            editingInventoryItemId = null;
            if (addInventoryBtn) addInventoryBtn.textContent = "Add Inventory Item";
            if (inventoryItemNameInput) inventoryItemNameInput.value = "";
            if (inventoryQuantityInput) inventoryQuantityInput.value = "";
            if (inventoryCostInput) inventoryCostInput.value = "";
          }

          renderInventory();
          populateRecipeIngredientOptions();
          renderRecipes();
          renderMenus();
          renderEvents();
        });
      }

      inventoryTableBody.appendChild(newRow);
    });
  };

  const addInventoryItem = () => {
    const name = inventoryItemNameInput ? inventoryItemNameInput.value.trim() : "";
    const quantity = inventoryQuantityInput ? Number(inventoryQuantityInput.value) : 0;
    const unit = inventoryUnitInput ? inventoryUnitInput.value : "lb";
    const cost = inventoryCostInput ? Number(inventoryCostInput.value) : 0;

    if (!name || quantity < 0 || cost < 0) {
      alert("Please complete the inventory item information.");
      return;
    }

    const inventory = getInventory();

    if (editingInventoryItemId) {
      const updatedInventory = inventory.map((item) => {
        if (item.id !== editingInventoryItemId) return item;
        return {
          ...item,
          name,
          quantity,
          unit,
          cost
        };
      });
      saveInventory(updatedInventory);
      editingInventoryItemId = null;
      if (addInventoryBtn) addInventoryBtn.textContent = "Add Inventory Item";
    } else {
      inventory.push({
        id: Date.now().toString(),
        name,
        quantity,
        unit,
        cost
      });
      saveInventory(inventory);
    }

    renderInventory();
    populateRecipeIngredientOptions();
    renderRecipes();
    renderMenus();
    renderEvents();

    if (inventoryItemNameInput) inventoryItemNameInput.value = "";
    if (inventoryQuantityInput) inventoryQuantityInput.value = "";
    if (inventoryCostInput) inventoryCostInput.value = "";
  };
  if (navInventory && inventorySection) {
    navInventory.addEventListener("click", (e) => {
      e.preventDefault();
      hideAllMainSections();
      inventorySection.hidden = false;
      renderInventory();
      setActiveNav(navInventory);
      inventorySection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (navDashboard && dashboardSection) {
    navDashboard.addEventListener("click", (e) => {
      e.preventDefault();
      hideAllMainSections();
      dashboardSection.hidden = false;
      dashboardSection.style.display = "grid";
      setActiveNav(navDashboard);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (navEvents && eventsSection) {
    navEvents.addEventListener("click", (e) => {
      e.preventDefault();
      hideAllMainSections();
      eventsSection.hidden = false;
      setActiveNav(navEvents);
      eventsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (navMenus && menusSection) {
    navMenus.addEventListener("click", (e) => {
      e.preventDefault();
      hideAllMainSections();
      menusSection.hidden = false;
      populateMenuRecipeOptions();
      renderMenus();
      setActiveNav(navMenus);
      menusSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (navRecipes && recipesSection) {
    navRecipes.addEventListener("click", (e) => {
      e.preventDefault();
      hideAllMainSections();
      recipesSection.hidden = false;
      populateRecipeIngredientOptions();
      renderSelectedIngredients();
      renderRecipes();
      setActiveNav(navRecipes);
      recipesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (addMenuBtn) {
    addMenuBtn.addEventListener("click", addMenu);
  }

  if (addRecipeBtn) {
    addRecipeBtn.addEventListener("click", addRecipe);
  }

  if (addRecipeIngredientBtn) {
    addRecipeIngredientBtn.addEventListener("click", addRecipeIngredient);
  }

  if (addInventoryBtn) {
    addInventoryBtn.addEventListener("click", addInventoryItem);
  }

  if (createBtn) {
    createBtn.addEventListener("click", () => {
      resetFormState();
      populateEventMenuOptions();
      openForm();
    });
  }

  if (uploadBtn && eventImageInput) {
    uploadBtn.addEventListener("click", () => {
      resetFormState();
      populateEventMenuOptions();
      openForm();
      eventImageInput.click();
    });
  }

  if (eventImageInput) {
    eventImageInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      await extractEventFromImage(file);
    });
  }

  if (cancelEventBtn) {
    cancelEventBtn.addEventListener("click", () => {
      closeForm();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const eventData = {
        name: eventNameInput ? eventNameInput.value.trim() : "",
        client: clientNameInput ? clientNameInput.value.trim() : "",
        date: eventDateInput ? eventDateInput.value : "",
        startTime: startTimeInput ? startTimeInput.value : "",
        endTime: endTimeInput ? endTimeInput.value : "",
        guests: guestCountInput ? guestCountInput.value : "",
        menuId: eventMenuInput ? eventMenuInput.value : "",
        venue: venueInput ? venueInput.value.trim() : "",
        status: statusInput ? statusInput.value : "Draft"
      };

      const events = getEvents();
      const editingIndex = editingEventIndex && editingEventIndex.value !== ""
        ? Number(editingEventIndex.value)
        : -1;

      if (editingIndex >= 0) {
        events[editingIndex] = eventData;
      } else {
        events.push(eventData);
      }

      saveEvents(events);
      renderEvents();
      renderKpis();
      closeForm();
    });
  }

  populateRecipeIngredientOptions();
  renderSelectedIngredients();
  populateMenuRecipeOptions();
  populateEventMenuOptions();
  renderEvents();
  renderKpis();
  renderMenus();
  renderRecipes();
  renderInventory();
});