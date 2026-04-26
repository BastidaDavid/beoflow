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
  const API_BASE_URL = "https://beoflow-api.onrender.com";

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
  let editingMenuId = null;
  const addRecipeBtn = document.getElementById("add-recipe-btn");
  const recipesTableBody = document.getElementById("recipes-table-body");
  const recipeNameInput = document.getElementById("recipeName");
  const recipeCategoryInput = document.getElementById("recipeCategory");
  const recipeCostInput = document.getElementById("recipeCost");
  const recipePortionsInput = document.getElementById("recipePortions");
  const recipeYieldInput = document.getElementById("recipeYield");
  const recipeNotesInput = document.getElementById("recipeNotes");
  const recipeIngredientItemInput = document.getElementById("recipeIngredientItem");
  const recipeIngredientQtyInput = document.getElementById("recipeIngredientQty");
  const recipeIngredientUnitInput = document.getElementById("recipeIngredientUnit");
  const addRecipeIngredientBtn = document.getElementById("add-recipe-ingredient-btn");
  const selectedIngredientsList = document.getElementById("selected-ingredients-list");
  const ingredientsModal = document.getElementById("ingredients-modal");
  const ingredientsModalTitle = document.getElementById("ingredients-modal-title");
  const ingredientsModalBody = document.getElementById("ingredients-modal-body");
  const closeIngredientsModalBtn = document.getElementById("close-ingredients-modal");
  let currentRecipeIngredients = [];
  let editingRecipeId = null;
  const navInventory = document.getElementById("nav-inventory");
  const navProduction = document.getElementById("nav-production");
  const navStaff = document.getElementById("nav-staff");
  const inventorySection = document.getElementById("inventory-section");
  const productionSection = document.getElementById("production-section");
  const productionTableBody = document.getElementById("production-table-body");
  const staffSection = document.getElementById("staff-section");
  const addStaffBtn = document.getElementById("add-staff-btn");
  const staffTableBody = document.getElementById("staff-table-body");
  const staffNameInput = document.getElementById("staffName");
  const staffRoleInput = document.getElementById("staffRole");
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
      return JSON.parse(localStorage.getItem("beoflow_events")) || [];
    } catch {
      return [];
    }
  };

  const mapApiEventToUiEvent = (event) => ({
    id: event.id,
    name: event.event_name || "",
    client: event.client_name || "",
    date: event.event_date ? String(event.event_date).split("T")[0] : "",
    startTime: event.start_time || "",
    endTime: event.end_time || "",
    guests: event.guests || "",
    menuId: event.menu_id || event.menuId || "",
    venue: event.venue || "",
    status: event.status || "Draft"
  });

  const fetchEventsFromApi = async () => {
    const response = await fetch(`${API_BASE_URL}/events`);

    if (!response.ok) {
      throw new Error("Failed to load events from API.");
    }

    const events = await response.json();
    const mappedEvents = Array.isArray(events) ? events.map(mapApiEventToUiEvent) : [];
    saveEvents(mappedEvents);
    return mappedEvents;
  };

  const createEventInApi = async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event_name: eventData.name,
        client_name: eventData.client,
        event_date: eventData.date || null,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        guests: eventData.guests ? Number(eventData.guests) : null,
        venue: eventData.venue,
        status: eventData.status || "Draft"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to save event to API.");
    }

    const result = await response.json();
    return mapApiEventToUiEvent(result.event);
  };

  const updateEventInApi = async (eventId, eventData) => {
    if (!eventId) {
      throw new Error("Missing event ID for update request.");
    }

    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event_name: eventData.name,
        client_name: eventData.client,
        event_date: eventData.date || null,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        guests: eventData.guests ? Number(eventData.guests) : null,
        venue: eventData.venue,
        status: eventData.status || "Draft"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to update event in API.");
    }

    const result = await response.json();
    return mapApiEventToUiEvent(result.event);
  };

  const deleteEventInApi = async (eventId) => {
    if (!eventId) {
      throw new Error("Missing event ID for delete request.");
    }

    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete event from API.");
    }

    return response.json();
  };

  const saveEvents = (events) => {
    localStorage.setItem("beoflow_events", JSON.stringify(events));
  };

  const getMenus = () => {
    try {
      return JSON.parse(localStorage.getItem("beoflow_menus")) || [];
    } catch {
      return [];
    }
  };

  const saveMenus = (menus) => {
    localStorage.setItem("beoflow_menus", JSON.stringify(menus));
  };

  const getRecipes = () => {
    try {
      return JSON.parse(localStorage.getItem("beoflow_recipes")) || [];
    } catch {
      return [];
    }
  };

  const saveRecipes = (recipes) => {
    localStorage.setItem("beoflow_recipes", JSON.stringify(recipes));
  };

  const getInventory = () => {
    try {
      return JSON.parse(localStorage.getItem("beoflow_inventory")) || [];
    } catch {
      return [];
    }
  };

  const saveInventory = (inventory) => {
    localStorage.setItem("beoflow_inventory", JSON.stringify(inventory));
  };

  const getStaff = () => {
    try {
      return JSON.parse(localStorage.getItem("beoflow_staff")) || [];
    } catch {
      return [];
    }
  };

  const saveStaff = (staff) => {
    localStorage.setItem("beoflow_staff", JSON.stringify(staff));
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
        label: "Add Value",
        className: "confirmed",
        insight: "Very high margin. This event is highly profitable, but the food value may look too low if the menu is too simple.",
        recommendation: "Consider adding one premium side, dessert, or beverage station while keeping the strong margin."
      };
    }

    if (marginNumber >= 55) {
      return {
        label: "High Profit",
        className: "confirmed",
        insight: "Strong profit event. This menu has a healthy margin.",
        recommendation: guestNumber >= 300
          ? "Maintain price and review production staffing because this is a large event."
          : "Maintain price and keep this menu as a strong profitable option."
      };
    }

    if (marginNumber >= 35) {
      return {
        label: "Review Cost",
        className: "upcoming",
        insight: "Medium profit event. The margin is acceptable but should be reviewed before confirmation.",
        recommendation: "Check food cost, labor needs, and consider increasing price slightly if service complexity is high."
      };
    }

    return {
      label: "Adjust Price",
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
        label: "Not Enough",
        className: "issue",
        details: issues.join("\n"),
        purchaseRecommendations: purchaseRecommendations.join("\n")
      };
    }

    if (warnings.length > 0) {
      return {
        label: "Low Stock",
        className: "upcoming",
        details: warnings.join("\n"),
        purchaseRecommendations: "Inventory is technically enough, but stock will be low after this event. Consider ordering backup stock."
      };
    }

    return {
      label: "Ready",
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

      const response = await fetch(`${API_BASE_URL}/api/extract-event`, {
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

  const renderEvents = async () => {
    const events = getEvents();
    try {
      const apiEvents = await fetchEventsFromApi();
      saveEvents(apiEvents);
    } catch (error) {
      console.warn("Using local events because API is unavailable:", error);
    }
    const freshEvents = getEvents();
    if (!tableBody) return;

    tableBody.innerHTML = "";
    const menus = getMenus();

    if (freshEvents.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="13" style="color:#64748b; text-align:center; padding:20px;">
          No events yet. Create your first event.
        </td>
      `;
      tableBody.appendChild(emptyRow);
      return;
    }

    [...freshEvents].reverse().forEach((eventData, index) => {
      const realIndex = freshEvents.length - 1 - index;
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
          <div class="icon-actions">
            <button type="button" class="icon-btn analyze analyze-btn" title="Analyze">🧠</button>
            <button type="button" class="icon-btn edit edit-btn" title="Edit">✏️</button>
            <button type="button" class="icon-btn delete delete-btn" title="Delete">🗑️</button>
          </div>
        </td>
      `;

      const analyzeBtn = newRow.querySelector(".analyze-btn");
      const editBtn = newRow.querySelector(".edit-btn");
      const deleteBtn = newRow.querySelector(".delete-btn");

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
        deleteBtn.addEventListener("click", async () => {
          const confirmDelete = confirm("Delete this event?");
          if (!confirmDelete) return;

          try {
            await deleteEventInApi(eventData.id);
            const updatedEvents = getEvents().filter((eventItem) => eventItem.id !== eventData.id);
            saveEvents(updatedEvents);
            await renderEvents();
            renderKpis();
          } catch (error) {
            console.error(error);
            alert("Event could not be deleted from the database. Make sure the Render API is running correctly.");
          }
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
    if (productionSection) productionSection.hidden = true;
    if (staffSection) staffSection.hidden = true;
    if (createEventSection) createEventSection.hidden = true;
  };

  const setActiveNav = (activeNav) => {
    [navDashboard, navEvents, navMenus, navRecipes, navInventory, navProduction, navStaff].forEach((navItem) => {
      if (!navItem) return;
      navItem.classList.toggle("active", navItem === activeNav);
    });
  };

  const convertQuantity = (qty, fromUnit, toUnit) => {
    const amount = Number(qty || 0);
    if (!fromUnit || !toUnit || fromUnit === toUnit) return amount;

    const normalizedFromUnit = fromUnit === "gal" ? "gallons" : fromUnit;
    const normalizedToUnit = toUnit === "gal" ? "gallons" : toUnit;

    // Weight conversions
    if (normalizedFromUnit === "oz" && normalizedToUnit === "lb") return amount / 16;
    if (normalizedFromUnit === "lb" && normalizedToUnit === "oz") return amount * 16;

    // US liquid volume conversions
    if (normalizedFromUnit === "oz" && normalizedToUnit === "gallons") return amount / 128;
    if (normalizedFromUnit === "gallons" && normalizedToUnit === "oz") return amount * 128;

    if (normalizedFromUnit === "oz" && normalizedToUnit === "quarts") return amount / 32;
    if (normalizedFromUnit === "quarts" && normalizedToUnit === "oz") return amount * 32;

    if (normalizedFromUnit === "quarts" && normalizedToUnit === "gallons") return amount / 4;
    if (normalizedFromUnit === "gallons" && normalizedToUnit === "quarts") return amount * 4;

    return amount;
  };

  const getIngredientDisplayQty = (ingredient, item) => {
    const displayQty = ingredient.originalQty ?? ingredient.qty;
    const displayUnit = ingredient.originalUnit || item?.unit || "unit";
    return `${Number(displayQty || 0).toFixed(2)} ${displayUnit}`;
  };

  const calculateRecipeIngredientCost = (ingredients = []) => {
    const inventory = getInventory();

    return ingredients.reduce((total, ingredient) => {
      const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
      return total + (Number(ingredient.qty || 0) * Number(item?.cost || 0));
    }, 0);
  };

  const applyWasteToCost = (cost, wastePercent) => {
    const waste = Number(wastePercent || 0);
    const usablePercent = 100 - waste;

    if (waste <= 0) return Number(cost || 0);
    if (usablePercent <= 0) return Number(cost || 0);

    return Number(cost || 0) / (usablePercent / 100);
  };

  const renderSelectedIngredients = () => {
    if (!selectedIngredientsList) return;

    if (currentRecipeIngredients.length === 0) {
      selectedIngredientsList.textContent = "No ingredients added yet.";
      return;
    }

    const inventory = getInventory();

    selectedIngredientsList.innerHTML = currentRecipeIngredients.map((ingredient, index) => {
      const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
      const itemName = item ? item.name : "Unknown item";
      const ingredientCost = Number(ingredient.qty || 0) * Number(item?.cost || 0);
      const displayQty = getIngredientDisplayQty(ingredient, item);

      return `
        <div class="selected-ingredient-pill">
          <span>
            ${itemName}: ${displayQty} / portion · $${ingredientCost.toFixed(2)}
          </span>

          <div class="icon-actions">
            <button type="button" class="icon-btn edit ingredient-edit-btn" data-index="${index}" title="Edit">✏️</button>
            <button type="button" class="icon-btn delete ingredient-delete-btn" data-index="${index}" title="Delete">🗑️</button>
          </div>
        </div>
      `;
    }).join("");

    selectedIngredientsList.querySelectorAll(".ingredient-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        currentRecipeIngredients.splice(index, 1);
        renderSelectedIngredients();
      });
    });

    selectedIngredientsList.querySelectorAll(".ingredient-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        const ingredient = currentRecipeIngredients[index];

        if (recipeIngredientItemInput) recipeIngredientItemInput.value = ingredient.inventoryItemId;
        if (recipeIngredientQtyInput) recipeIngredientQtyInput.value = ingredient.originalQty ?? ingredient.qty;
        if (recipeIngredientUnitInput) recipeIngredientUnitInput.value = ingredient.originalUnit || "lb";

        currentRecipeIngredients.splice(index, 1);
        renderSelectedIngredients();
      });
    });
  };

  const openIngredientsModal = (recipe) => {
    if (!ingredientsModal || !ingredientsModalTitle || !ingredientsModalBody) return;

    const inventory = getInventory();
    ingredientsModalTitle.textContent = `${recipe.name || "Recipe"} Ingredients`;

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      ingredientsModalBody.innerHTML = `<div class="ingredient-row">No ingredients added.</div>`;
    } else {
      ingredientsModalBody.innerHTML = recipe.ingredients.map((ingredient) => {
        const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
        const itemName = item ? item.name : "Unknown item";
        const ingredientCost = Number(ingredient.qty || 0) * Number(item?.cost || 0);
        const displayQty = getIngredientDisplayQty(ingredient, item);

        return `
          <div class="ingredient-row">
            <span>${itemName}</span>
            <strong>${displayQty} / portion · $${ingredientCost.toFixed(2)}</strong>
          </div>
        `;
      }).join("");
    }

    ingredientsModal.hidden = false;
  };

  const closeIngredientsModal = () => {
    if (!ingredientsModal) return;
    ingredientsModal.hidden = true;
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
    const recipeUnit = recipeIngredientUnitInput ? recipeIngredientUnitInput.value : "lb";
    const inventoryItem = getInventory().find((item) => item.id === inventoryItemId);
    const inventoryUnit = inventoryItem?.unit || recipeUnit;
    const convertedQty = convertQuantity(qty, recipeUnit, inventoryUnit);

    if (!inventoryItemId || qty <= 0) {
      alert("Please select an inventory item and enter quantity per portion.");
      return;
    }

    currentRecipeIngredients.push({
      inventoryItemId,
      qty: convertedQty,
      originalQty: qty,
      originalUnit: recipeUnit
    });
    renderSelectedIngredients();

    if (recipeIngredientQtyInput) recipeIngredientQtyInput.value = "";
  };

  const populateEventMenuOptions = () => {
    if (!eventMenuInput) return;

    const selectedValue = eventMenuInput.value;
    const menus = getMenus();
    const recipes = getRecipes();

    eventMenuInput.innerHTML = `<option value="">Select a menu</option>`;

    const sortedMenus = [...menus].sort((a, b) => {
      const getMenuMargin = (menu) => {
        const recipeCost = (menu.recipeIds || []).reduce((total, recipeId) => {
          const recipe = recipes.find((item) => item.id === recipeId);
          return total + Number(recipe?.cost || 0);
        }, 0);

        const cost = recipeCost > 0 ? recipeCost : Number(menu.cost || 0);
        const price = Number(menu.price || 0);

        return price > 0 ? ((price - cost) / price) * 100 : 0;
      };

      return getMenuMargin(b) - getMenuMargin(a);
    });

    sortedMenus.forEach((menu) => {
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
        <td colspan="7" style="color:#64748b; text-align:center; padding:20px;">
          No menus yet. Create your first menu.
        </td>
      `;
      menusTableBody.appendChild(emptyRow);
      return;
    }

    const sortedMenus = [...menus].sort((a, b) => {
      const getMenuMargin = (menu) => {
        const recipeCost = (menu.recipeIds || []).reduce((total, recipeId) => {
          const recipe = recipes.find((item) => item.id === recipeId);
          return total + Number(recipe?.cost || 0);
        }, 0);

        const cost = recipeCost > 0 ? recipeCost : Number(menu.cost || 0);
        const price = Number(menu.price || 0);

        return price > 0 ? ((price - cost) / price) * 100 : 0;
      };

      return getMenuMargin(b) - getMenuMargin(a);
    });

    sortedMenus.forEach((menu) => {
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
        <td>
          <span class="status ${
            Number(margin) >= 23
              ? "confirmed"
              : Number(margin) >= 15
              ? "upcoming"
              : "issue"
          }">
            ${margin}%
          </span>
        </td>
        <td>
          <div class="icon-actions">
            <button type="button" class="icon-btn edit menu-edit-btn" title="Edit">✏️</button>
            <button type="button" class="icon-btn delete menu-delete-btn" title="Delete">🗑️</button>
          </div>
        </td>
      `;

      const editBtn = newRow.querySelector(".menu-edit-btn");
      const deleteBtn = newRow.querySelector(".menu-delete-btn");

      if (editBtn) {
        editBtn.addEventListener("click", () => {
          if (menuNameInput) menuNameInput.value = menu.name || "";
          if (menuTypeInput) menuTypeInput.value = menu.type || "Buffet";
          if (menuCostInput) menuCostInput.value = menu.cost || "";
          if (menuPriceInput) menuPriceInput.value = menu.price || "";

          populateMenuRecipeOptions();

          if (menuRecipesInput) {
            Array.from(menuRecipesInput.options).forEach((option) => {
              option.selected = (menu.recipeIds || []).includes(option.value);
            });
          }

          editingMenuId = menu.id;
          if (addMenuBtn) addMenuBtn.textContent = "Update Menu";
          menusSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          const confirmDelete = confirm(`Delete ${menu.name || "this menu"}?`);
          if (!confirmDelete) return;

          const updatedMenus = getMenus().filter((menuItem) => menuItem.id !== menu.id);
          saveMenus(updatedMenus);

          if (editingMenuId === menu.id) {
            editingMenuId = null;
            if (addMenuBtn) addMenuBtn.textContent = "Add Menu";
            if (menuNameInput) menuNameInput.value = "";
            if (menuCostInput) menuCostInput.value = "";
            if (menuPriceInput) menuPriceInput.value = "";
            if (menuRecipesInput) {
              Array.from(menuRecipesInput.options).forEach((option) => {
                option.selected = false;
              });
            }
          }

          renderMenus();
          populateEventMenuOptions();
          renderEvents();
        });
      }

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

    if (editingMenuId) {
      const updatedMenus = menus.map((menu) => {
        if (menu.id !== editingMenuId) return menu;
        return {
          ...menu,
          name,
          type,
          cost,
          price,
          recipeIds: selectedRecipeIds
        };
      });
      saveMenus(updatedMenus);
      editingMenuId = null;
      if (addMenuBtn) addMenuBtn.textContent = "Add Menu";
    } else {
      menus.push({
        id: Date.now().toString(),
        name,
        type,
        cost,
        price,
        recipeIds: selectedRecipeIds
      });
      saveMenus(menus);
    }

    renderMenus();
    populateEventMenuOptions();
    renderEvents();

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
      const baseCost = ingredientCost > 0 ? ingredientCost : Number(recipe.baseCost || recipe.cost || 0);
      const cost = applyWasteToCost(baseCost, recipe.wastePercent || 0);
      const portions = Number(recipe.portions || 0);
      const totalBatchCost = cost * portions;
      const ingredientCount = (recipe.ingredients || []).length;

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${recipe.name || "-"}</td>
        <td>${recipe.category || "-"}</td>
        <td>
          <button type="button" class="secondary-btn view-ingredients-btn">
            View Ingredients (${ingredientCount})
          </button>
        </td>
        <td>$${cost.toFixed(2)}</td>
        <td>${portions || "-"}</td>
        <td>$${totalBatchCost.toFixed(2)}</td>
        <td>${recipe.notes || "-"}</td>
        <td>
          <div class="icon-actions">
            <button type="button" class="icon-btn edit recipe-edit-btn" title="Edit">✏️</button>
            <button type="button" class="icon-btn delete recipe-delete-btn" title="Delete">🗑️</button>
          </div>
        </td>
      `;

      const editBtn = newRow.querySelector(".recipe-edit-btn");
      const deleteBtn = newRow.querySelector(".recipe-delete-btn");
      const viewIngredientsBtn = newRow.querySelector(".view-ingredients-btn");

      if (viewIngredientsBtn) {
        viewIngredientsBtn.addEventListener("click", () => {
          openIngredientsModal(recipe);
        });
      }

      if (editBtn) {
        editBtn.addEventListener("click", () => {
          if (recipeNameInput) recipeNameInput.value = recipe.name || "";
          if (recipeCategoryInput) recipeCategoryInput.value = recipe.category || "Entree";
          if (recipeCostInput) recipeCostInput.value = recipe.baseCost || recipe.cost || "";
          if (recipePortionsInput) recipePortionsInput.value = recipe.portions || "";
          if (recipeYieldInput) recipeYieldInput.value = recipe.wastePercent || 0;
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
            if (recipeYieldInput) recipeYieldInput.value = "0";
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
    const baseCost = ingredientCost > 0 ? ingredientCost : manualCost;
    const wastePercent = recipeYieldInput ? Number(recipeYieldInput.value || 0) : 0;
    const cost = applyWasteToCost(baseCost, wastePercent);
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
          baseCost,
          cost,
          wastePercent,
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
        baseCost,
        cost,
        wastePercent,
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
    if (recipeYieldInput) recipeYieldInput.value = "0";
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
          <div class="icon-actions">
            <button type="button" class="icon-btn edit inventory-edit-btn" title="Edit">✏️</button>
            <button type="button" class="icon-btn delete inventory-delete-btn" title="Delete">🗑️</button>
          </div>
        </td>
      `;

      const editBtn = newRow.querySelector(".inventory-edit-btn");
      const deleteBtn = newRow.querySelector(".inventory-delete-btn");

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
  const renderStaff = () => {
    const staff = getStaff();

    if (!staffTableBody) return;

    staffTableBody.innerHTML = "";

    if (staff.length === 0) {
      staffTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="color:#64748b; text-align:center; padding:20px;">
            No staff added yet.
          </td>
        </tr>
      `;
      return;
    }

    staff.forEach((person) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${person.name || "-"}</td>
        <td>${person.role || "-"}</td>
        <td>${person.tasks || "No tasks yet"}</td>
      `;

      staffTableBody.appendChild(row);
    });
  };

  const addStaff = () => {
    const name = staffNameInput ? staffNameInput.value.trim() : "";
    const role = staffRoleInput ? staffRoleInput.value : "Chef";

    if (!name) {
      alert("Enter staff name.");
      return;
    }

    const staff = getStaff();

    staff.push({
      id: Date.now().toString(),
      name,
      role,
      tasks: ""
    });

    saveStaff(staff);
    renderStaff();

    if (staffNameInput) staffNameInput.value = "";
    if (staffRoleInput) staffRoleInput.value = "Chef";
  };

  const renderProduction = () => {
    const events = getEvents();
    const menus = getMenus();
    const recipes = getRecipes();

    if (!productionTableBody) return;

    productionTableBody.innerHTML = "";

    let taskCount = 0;

    events.forEach((eventData) => {
      const selectedMenu = menus.find((menu) => menu.id === eventData.menuId);
      const guests = Number(eventData.guests || 0);

      if (!selectedMenu || guests <= 0) return;

      (selectedMenu.recipeIds || []).forEach((recipeId) => {
        const recipe = recipes.find((item) => item.id === recipeId);
        if (!recipe) return;

        taskCount++;
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${eventData.name || "Untitled Event"}</td>
          <td>${recipe.name || "Unnamed Recipe"}</td>
          <td>${guests} portions</td>
          <td><span class="status upcoming">Pending</span></td>
          <td>-</td>
        `;

        productionTableBody.appendChild(row);
      });
    });

    if (taskCount === 0) {
      productionTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="color:#64748b; text-align:center; padding:20px;">
            No production tasks yet. Create an event with a menu connected to recipes.
          </td>
        </tr>
      `;
    }
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

  if (navProduction && productionSection) {
    navProduction.addEventListener("click", (e) => {
      e.preventDefault();
      hideAllMainSections();
      productionSection.hidden = false;
      renderProduction();
      setActiveNav(navProduction);
      productionSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (navStaff && staffSection) {
    navStaff.addEventListener("click", (e) => {
      e.preventDefault();
      hideAllMainSections();
      staffSection.hidden = false;
      renderStaff();
      setActiveNav(navStaff);
      staffSection.scrollIntoView({ behavior: "smooth", block: "start" });
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

  if (closeIngredientsModalBtn) {
    closeIngredientsModalBtn.addEventListener("click", closeIngredientsModal);
  }

  if (ingredientsModal) {
    ingredientsModal.addEventListener("click", (e) => {
      if (e.target === ingredientsModal) {
        closeIngredientsModal();
      }
    });
  }

  if (addInventoryBtn) {
    addInventoryBtn.addEventListener("click", addInventoryItem);
  }

  if (addStaffBtn) {
    addStaffBtn.addEventListener("click", addStaff);
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
    form.addEventListener("submit", async (e) => {
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

      try {
        if (editingIndex >= 0) {
          const existingEvent = events[editingIndex];
          const updatedEvent = await updateEventInApi(existingEvent.id, eventData);
          events[editingIndex] = updatedEvent;
          saveEvents(events);
        } else {
          const savedEvent = await createEventInApi(eventData);
          events.push(savedEvent);
          saveEvents(events);
        }

        await renderEvents();
        renderKpis();
        closeForm();
      } catch (error) {
        console.error(error);
        alert("Event could not be saved to the database. Make sure the Render API is running correctly.");
      }
    });
  }

  populateRecipeIngredientOptions();
  renderSelectedIngredients();
  populateMenuRecipeOptions();
  populateEventMenuOptions();
  renderEvents().then(renderKpis);
  renderMenus();
  renderRecipes();
  renderInventory();
  renderStaff();
  renderProduction();
});