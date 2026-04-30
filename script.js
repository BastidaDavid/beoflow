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
  const navSubRecipes = document.getElementById("nav-sub-recipes");
  const dashboardSection = document.getElementById("dashboard-section");
  const dashboardCalendarSection = document.getElementById("dashboard-calendar-section");
  const eventsSection = document.getElementById("events-section");
  const eventsActiveFilter = document.getElementById("events-active-filter");
  const menusSection = document.getElementById("menus-section");
  const recipesSection = document.getElementById("recipes-section");
  const subRecipesSection = document.getElementById("sub-recipes-section");
  const topbarTitle = document.querySelector(".topbar h1");
  const topbarSubtitle = document.querySelector(".topbar p");
  const addMenuBtn = document.getElementById("add-menu-btn");
  const menusTableBody = document.getElementById("menus-table-body");
  const menuNameInput = document.getElementById("menuName");
  const menuTypeInput = document.getElementById("menuType");
  const menuCostInput = document.getElementById("menuCost");
  if (menuCostInput) {
    const menuCostField = menuCostInput.closest(".form-group") || menuCostInput.parentElement;
    if (menuCostField) {
      menuCostField.hidden = true;
      menuCostField.style.display = "none";
    }
  }
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
  const recipeIngredientSearchInput = document.getElementById("recipeIngredientSearch");
  const recipeIngredientItemInput = document.getElementById("recipeIngredientItem");
  const recipeIngredientMatches = document.getElementById("recipeIngredientMatches");
  const recipeIngredientStatus = document.getElementById("recipeIngredientStatus");
  const recipeIngredientQtyInput = document.getElementById("recipeIngredientQty");
  const recipeIngredientUnitInput = document.getElementById("recipeIngredientUnit");
  const recipeQuickInventoryFields = document.getElementById("recipeQuickInventoryFields");
  const recipeNewInventoryQuantityInput = document.getElementById("recipeNewInventoryQuantity");
  const recipeNewInventoryUnitInput = document.getElementById("recipeNewInventoryUnit");
  const recipeNewInventoryTotalCostInput = document.getElementById("recipeNewInventoryTotalCost");
  const recipeNewInventoryStorageAreaInput = document.getElementById("recipeNewInventoryStorageArea");
  const addRecipeIngredientBtn = document.getElementById("add-recipe-ingredient-btn");
  const selectedIngredientsList = document.getElementById("selected-ingredients-list");
  const addSubRecipeBtn = document.getElementById("add-sub-recipe-btn");
  const subRecipesTableBody = document.getElementById("sub-recipes-table-body");
  const subRecipeNameInput = document.getElementById("subRecipeName");
  const subRecipeCategoryInput = document.getElementById("subRecipeCategory");
  const subRecipeYieldInput = document.getElementById("subRecipeYield");
  const subRecipeYieldUnitInput = document.getElementById("subRecipeYieldUnit");
  const subRecipeWasteInput = document.getElementById("subRecipeWaste");
  const subRecipeNotesInput = document.getElementById("subRecipeNotes");
  const subRecipeIngredientSearchInput = document.getElementById("subRecipeIngredientSearch");
  const subRecipeIngredientItemInput = document.getElementById("subRecipeIngredientItem");
  const subRecipeIngredientMatches = document.getElementById("subRecipeIngredientMatches");
  const subRecipeIngredientStatus = document.getElementById("subRecipeIngredientStatus");
  const subRecipeIngredientQtyInput = document.getElementById("subRecipeIngredientQty");
  const subRecipeIngredientUnitInput = document.getElementById("subRecipeIngredientUnit");
  const subRecipeQuickInventoryFields = document.getElementById("subRecipeQuickInventoryFields");
  const subRecipeNewInventoryQuantityInput = document.getElementById("subRecipeNewInventoryQuantity");
  const subRecipeNewInventoryUnitInput = document.getElementById("subRecipeNewInventoryUnit");
  const subRecipeNewInventoryTotalCostInput = document.getElementById("subRecipeNewInventoryTotalCost");
  const subRecipeNewInventoryStorageAreaInput = document.getElementById("subRecipeNewInventoryStorageArea");
  const addSubRecipeIngredientBtn = document.getElementById("add-sub-recipe-ingredient-btn");
  const selectedSubRecipeIngredientsList = document.getElementById("selected-sub-recipe-ingredients-list");
  const ingredientsModal = document.getElementById("ingredients-modal");
  const ingredientsModalTitle = document.getElementById("ingredients-modal-title");
  const ingredientsModalBody = document.getElementById("ingredients-modal-body");
  const closeIngredientsModalBtn = document.getElementById("close-ingredients-modal");
  let currentRecipeIngredients = [];
  let editingRecipeId = null;
  let currentSubRecipeIngredients = [];
  let editingSubRecipeId = null;
  let activeModuleKey = "dashboard";
  let moduleBeforeForm = "dashboard";
  let activeEventFilter = null;
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
  const inventoryCategoryInput = document.getElementById("inventoryCategory");
  const inventoryQuantityInput = document.getElementById("inventoryQuantity");
  const inventoryUnitInput = document.getElementById("inventoryUnit");
  const inventoryTotalCostInput = document.getElementById("inventoryTotalCost");
  const inventoryStorageAreaInput = document.getElementById("inventoryStorageArea");
  const inventorySearchInput = document.getElementById("inventorySearch");
  const inventoryCategoryFilterInput = document.getElementById("inventoryCategoryFilter");
  const inventoryCategorySummary = document.getElementById("inventory-category-summary");
  const inventorySections = document.getElementById("inventory-sections");
  const inventoryPrepRecipesList = document.getElementById("inventory-prep-recipes-list");
  const inventoryGoPrepRecipesBtn = document.getElementById("inventory-go-prep-recipes");
  let editingInventoryItemId = null;

  const kpiEventsToday = document.getElementById("kpi-events-today");
  const kpiUpcomingEvents = document.getElementById("kpi-upcoming-events");
  const kpiDraftEvents = document.getElementById("kpi-draft-events");
  const kpiConfirmedEvents = document.getElementById("kpi-confirmed-events");

  const recipeIngredientPicker = {
    searchInput: recipeIngredientSearchInput,
    hiddenInput: recipeIngredientItemInput,
    matchesList: recipeIngredientMatches,
    statusEl: recipeIngredientStatus,
    quickFields: recipeQuickInventoryFields,
    quickQuantityInput: recipeNewInventoryQuantityInput,
    quickUnitInput: recipeNewInventoryUnitInput,
    quickTotalCostInput: recipeNewInventoryTotalCostInput,
    quickStorageAreaInput: recipeNewInventoryStorageAreaInput
  };

  const subRecipeIngredientPicker = {
    searchInput: subRecipeIngredientSearchInput,
    hiddenInput: subRecipeIngredientItemInput,
    matchesList: subRecipeIngredientMatches,
    statusEl: subRecipeIngredientStatus,
    quickFields: subRecipeQuickInventoryFields,
    quickQuantityInput: subRecipeNewInventoryQuantityInput,
    quickUnitInput: subRecipeNewInventoryUnitInput,
    quickTotalCostInput: subRecipeNewInventoryTotalCostInput,
    quickStorageAreaInput: subRecipeNewInventoryStorageAreaInput
  };

  const inventoryCategories = [
    {
      id: "produce",
      label: "Vegetables & Fruit",
      icon: "🥬",
      className: "produce",
      keywords: ["vegetable", "veggie", "lettuce", "tomato", "onion", "cilantro", "pepper", "carrot", "potato", "avocado", "lime", "lemon", "fruit", "apple", "orange", "banana", "berries", "spinach", "mushroom", "zucchini", "cucumber"]
    },
    {
      id: "meat",
      label: "Meat & Poultry",
      icon: "🥩",
      className: "meat",
      keywords: ["beef", "steak", "chicken", "pork", "turkey", "bacon", "sausage", "ham", "lamb", "carne", "pollo"]
    },
    {
      id: "fish",
      label: "Fish & Seafood",
      icon: "🐟",
      className: "fish",
      keywords: ["fish", "salmon", "tuna", "shrimp", "seafood", "cod", "tilapia", "mahi", "crab", "lobster", "scallop"]
    },
    {
      id: "dairy",
      label: "Dairy",
      icon: "🥛",
      className: "dairy",
      keywords: ["milk", "cheese", "cream", "butter", "yogurt", "parmesan", "mozzarella", "queso", "lacteo", "dairy"]
    },
    {
      id: "dry",
      label: "Dry Goods",
      icon: "🌾",
      className: "dry",
      keywords: ["rice", "flour", "sugar", "salt", "spice", "pasta", "beans", "lentil", "cereal", "oil", "vinegar", "dry"]
    },
    {
      id: "bakery",
      label: "Bakery",
      icon: "🥖",
      className: "bakery",
      keywords: ["bread", "bun", "roll", "tortilla", "croissant", "bagel", "bakery"]
    },
    {
      id: "beverage",
      label: "Beverages",
      icon: "🧃",
      className: "beverage",
      keywords: ["juice", "soda", "water", "coffee", "tea", "wine", "beer", "beverage", "drink"]
    },
    {
      id: "pickled",
      label: "Pickles & Ferments",
      icon: "🥒",
      className: "pickled",
      keywords: ["pickle", "pickled", "pickles", "encurtido", "encurtidos", "curtido", "curtidos", "escabeche", "escabechado", "ferment", "fermented", "fermentado", "fermentados", "kimchi", "sauerkraut", "jalapeno", "jalapeño", "pepperoncini", "cornichon", "relish"]
    },
    {
      id: "prep",
      label: "Prep Recipes",
      icon: "🍲",
      className: "prep",
      keywords: ["prep", "sauce", "salsa", "dressing", "base", "stock", "marinade", "guacamole", "pico"]
    },
    {
      id: "other",
      label: "Other",
      icon: "📦",
      className: "other",
      keywords: []
    }
  ];

  const getEvents = () => {
    try {
      return JSON.parse(localStorage.getItem("beoflow_events")) || [];
    } catch {
      return [];
    }
  };

  const EVENT_MENU_LINKS_KEY = "beoflow_event_menu_links";

  const getEventSignature = (eventData = {}) =>
    [
      eventData.name,
      eventData.client,
      eventData.date,
      eventData.startTime,
      eventData.endTime,
      eventData.venue
    ]
      .map((value) => String(value || "").trim().toLowerCase())
      .join("|");

  const getEventMenuLinks = () => {
    try {
      return JSON.parse(localStorage.getItem(EVENT_MENU_LINKS_KEY)) || {};
    } catch {
      return {};
    }
  };

  const saveEventMenuLinks = (links) => {
    localStorage.setItem(EVENT_MENU_LINKS_KEY, JSON.stringify(links));
  };

  const getLinkedEventMenuId = (eventData = {}) => {
    const links = getEventMenuLinks();
    const idKey = eventData.id != null && eventData.id !== "" ? `id:${eventData.id}` : "";
    const signature = getEventSignature(eventData);

    return (idKey && links[idKey]) || links[`signature:${signature}`] || "";
  };

  const getEventMenuId = (eventData = {}) =>
    eventData.menuId || eventData.menu_id || getLinkedEventMenuId(eventData) || "";

  const rememberEventMenuLink = (eventData = {}, menuId = "") => {
    const links = getEventMenuLinks();
    const idKey = eventData.id != null && eventData.id !== "" ? `id:${eventData.id}` : "";
    const signatureKey = `signature:${getEventSignature(eventData)}`;

    if (menuId) {
      if (idKey) links[idKey] = menuId;
      links[signatureKey] = menuId;
    } else {
      if (idKey) delete links[idKey];
      delete links[signatureKey];
    }

    saveEventMenuLinks(links);
  };

  const removeEventMenuLink = (eventData = {}) => {
    rememberEventMenuLink(eventData, "");
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

  const findMatchingLocalEvent = (apiEvent, localEvents) => {
    const apiId = apiEvent.id != null ? String(apiEvent.id) : "";

    if (apiId) {
      const idMatch = localEvents.find((eventData) => eventData.id != null && String(eventData.id) === apiId);
      if (idMatch) return idMatch;
    }

    return localEvents.find((eventData) =>
      (eventData.name || "") === (apiEvent.name || "") &&
      (eventData.client || "") === (apiEvent.client || "") &&
      (eventData.date || "") === (apiEvent.date || "") &&
      (eventData.startTime || "") === (apiEvent.startTime || "") &&
      (eventData.endTime || "") === (apiEvent.endTime || "") &&
      (eventData.venue || "") === (apiEvent.venue || "")
    );
  };

  const mergeApiEventsWithLocalEvents = (apiEvents, localEvents) =>
    apiEvents.map((apiEvent) => {
      const localEvent = findMatchingLocalEvent(apiEvent, localEvents);

      return {
        ...apiEvent,
        menuId: getEventMenuId(apiEvent) || getEventMenuId(localEvent) || ""
      };
    });

  const fetchEventsFromApi = async () => {
    const localEvents = getEvents();
    const response = await fetch(`${API_BASE_URL}/events`);

    if (!response.ok) {
      throw new Error("Failed to load events from API.");
    }

    const events = await response.json();
    const mappedEvents = Array.isArray(events) ? events.map(mapApiEventToUiEvent) : [];
    const mergedEvents = mergeApiEventsWithLocalEvents(mappedEvents, localEvents);
    saveEvents(mergedEvents);
    return mergedEvents;
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
        menu_id: eventData.menuId || null,
        venue: eventData.venue,
        status: eventData.status || "Draft"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to save event to API.");
    }

    const result = await response.json();
    const savedEvent = mapApiEventToUiEvent(result.event);
    return {
      ...savedEvent,
      menuId: savedEvent.menuId || eventData.menuId || ""
    };
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
        menu_id: eventData.menuId || null,
        venue: eventData.venue,
        status: eventData.status || "Draft"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to update event in API.");
    }

    const result = await response.json();
    const updatedEvent = mapApiEventToUiEvent(result.event);
    return {
      ...updatedEvent,
      menuId: updatedEvent.menuId || eventData.menuId || ""
    };
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

  const getSubRecipes = () => {
    try {
      return JSON.parse(localStorage.getItem("beoflow_sub_recipes")) || [];
    } catch {
      return [];
    }
  };

  const saveSubRecipes = (subRecipes) => {
    localStorage.setItem("beoflow_sub_recipes", JSON.stringify(subRecipes));
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

  const moduleHeaders = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Event & Banquet Operations Control"
    },
    events: {
      title: "Events",
      subtitle: "Review scheduled events, margins, inventory checks, and execution status"
    },
    menus: {
      title: "Menu",
      subtitle: "Build banquet menus connected to saved recipes"
    },
    recipes: {
      title: "Recipes",
      subtitle: "Create production-ready recipes from inventory"
    },
    subRecipes: {
      title: "Prep Recipes",
      subtitle: "Manage base preparations used inside recipes and production"
    },
    inventory: {
      title: "Inventory",
      subtitle: "Track item quantity, cost, storage area, and stock status"
    },
    production: {
      title: "Production",
      subtitle: "Track what needs to be prepared and assigned"
    },
    staff: {
      title: "Staff",
      subtitle: "Manage team assignments and roles"
    },
    eventForm: {
      title: "Event Form",
      subtitle: "Create or update a banquet event order"
    }
  };

  const updateTopbar = (moduleKey) => {
    const header = moduleHeaders[moduleKey] || moduleHeaders.dashboard;
    if (topbarTitle) topbarTitle.textContent = header.title;
    if (topbarSubtitle) topbarSubtitle.textContent = header.subtitle;
  };

  const eventFilterLabels = {
    today: "Events Today",
    upcoming: "Upcoming Events",
    draft: "Draft BEOs",
    confirmed: "Confirmed Events"
  };

  const filterEventsByActiveFilter = (events) => {
    if (!activeEventFilter) return events;

    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekString = nextWeek.toISOString().split("T")[0];

    return events.filter((eventData) => {
      const eventDate = eventData.date || "";

      if (activeEventFilter === "today") {
        return eventDate === todayString;
      }

      if (activeEventFilter === "upcoming") {
        return eventDate > todayString && eventDate <= nextWeekString;
      }

      if (activeEventFilter === "draft") {
        return eventData.status === "Draft";
      }

      if (activeEventFilter === "confirmed") {
        return eventData.status === "Confirmed";
      }

      return true;
    });
  };

  const renderEventsFilterBar = () => {
    if (!eventsActiveFilter) return;

    if (!activeEventFilter) {
      eventsActiveFilter.hidden = true;
      eventsActiveFilter.innerHTML = "";
      return;
    }

    eventsActiveFilter.hidden = false;
    eventsActiveFilter.innerHTML = `
      <span>Showing: <strong>${eventFilterLabels[activeEventFilter] || "Filtered Events"}</strong></span>
      <button type="button" class="secondary-btn clear-event-filter-btn">Show All Events</button>
    `;

    eventsActiveFilter.querySelector(".clear-event-filter-btn")?.addEventListener("click", () => {
      activeEventFilter = null;
      renderEvents();
    });
  };

  const resetFormState = () => {
    if (form) form.reset();
    if (editingEventIndex) editingEventIndex.value = "";
    if (eventImageInput) eventImageInput.value = "";
    if (uploadStatus) uploadStatus.textContent = "No image uploaded yet.";
  };

  const openForm = () => {
    if (!createEventSection) return;
    moduleBeforeForm = activeModuleKey || "dashboard";
    hideAllMainSections();
    showSection(createEventSection);
    setActiveNav(null);
    updateTopbar("eventForm");
    createEventSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const closeForm = () => {
    if (!createEventSection) return;
    resetFormState();
    showModuleByKey(moduleBeforeForm || "dashboard");
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

    populateEventMenuOptions();

    if (eventNameInput) eventNameInput.value = eventData.name || "";
    if (clientNameInput) clientNameInput.value = eventData.client || "";
    if (eventDateInput) eventDateInput.value = eventData.date || "";
    if (startTimeInput) startTimeInput.value = eventData.startTime || "";
    if (endTimeInput) endTimeInput.value = eventData.endTime || "";
    if (guestCountInput) guestCountInput.value = eventData.guests || "";
    if (eventMenuInput) eventMenuInput.value = getEventMenuId(eventData);
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

    renderEventsFilterBar();
    tableBody.innerHTML = "";
    const menus = getMenus();
    const displayedEvents = filterEventsByActiveFilter(freshEvents);

    if (displayedEvents.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="13" style="color:#64748b; text-align:center; padding:20px;">
          ${freshEvents.length === 0 ? "No events yet. Create your first event." : "No events match this filter."}
        </td>
      `;
      tableBody.appendChild(emptyRow);
      return;
    }

    [...displayedEvents].reverse().forEach((eventData) => {
      const realIndex = freshEvents.indexOf(eventData);
      const newRow = document.createElement("tr");
      const menuId = getEventMenuId(eventData);
      const selectedMenu = menus.find((menu) => menu.id === menuId);
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
            removeEventMenuLink(eventData);
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

  const hideSection = (section) => {
    if (!section) return;
    section.hidden = true;
    section.style.display = "none";
  };

  const showSection = (section, displayType = "block") => {
    if (!section) return;
    section.hidden = false;
    section.style.display = displayType;
  };

  const hideAllMainSections = () => {
    [
      dashboardSection,
      dashboardCalendarSection,
      eventsSection,
      menusSection,
      recipesSection,
      subRecipesSection,
      inventorySection,
      productionSection,
      staffSection,
      createEventSection
    ].forEach(hideSection);
  };

  const setActiveNav = (activeNav) => {
    [navDashboard, navEvents, navMenus, navRecipes, navSubRecipes, navInventory, navProduction, navStaff].forEach((navItem) => {
      if (!navItem) return;
      navItem.classList.toggle("active", navItem === activeNav);
    });
  };

  const showModuleByKey = (moduleKey, options = {}) => {
    const { scroll = true } = options;

    hideAllMainSections();
    activeModuleKey = moduleKey;
    updateTopbar(moduleKey);

    if (moduleKey === "dashboard") {
      showSection(dashboardSection, "grid");
      showSection(dashboardCalendarSection, "grid");
      setActiveNav(navDashboard);
      renderKpis();
      if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (moduleKey === "events") {
      activeEventFilter = options.eventFilter || null;
      showSection(eventsSection);
      setActiveNav(navEvents);
      renderEvents().then(renderKpis);
      if (scroll) eventsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (moduleKey === "menus") {
      showSection(menusSection);
      setActiveNav(navMenus);
      populateMenuRecipeOptions();
      renderMenus();
      if (scroll) menusSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (moduleKey === "recipes") {
      showSection(recipesSection);
      setActiveNav(navRecipes);
      populateRecipeIngredientOptions();
      renderSelectedIngredients();
      renderRecipes();
      if (scroll) recipesSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (moduleKey === "subRecipes") {
      showSection(subRecipesSection);
      setActiveNav(navSubRecipes);
      populateSubRecipeIngredientOptions();
      renderSelectedSubRecipeIngredients();
      renderSubRecipes();
      if (scroll) subRecipesSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (moduleKey === "inventory") {
      showSection(inventorySection);
      setActiveNav(navInventory);
      renderInventory();
      if (scroll) inventorySection?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (moduleKey === "production") {
      showSection(productionSection);
      setActiveNav(navProduction);
      renderProduction();
      if (scroll) productionSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (moduleKey === "staff") {
      showSection(staffSection);
      setActiveNav(navStaff);
      renderStaff();
      if (scroll) staffSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    showModuleByKey("dashboard", options);
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

  const getInventoryUnitCost = (item) => {
    if (!item) return 0;

    const quantity = Number(item.quantity || 0);
    const totalCost = Number(item.totalCost ?? item.stockValue ?? 0);

    if (quantity > 0 && totalCost > 0) {
      return totalCost / quantity;
    }

    return Number(item.costPerUnit ?? item.cost ?? 0);
  };

  const getInventoryCategoryMeta = (categoryId = "other") => {
    const normalizedCategoryId = String(categoryId || "").trim().toLowerCase();
    return inventoryCategories.find((category) => category.id === normalizedCategoryId)
      || inventoryCategories.find((category) => normalizeIngredientName(category.label) === normalizedCategoryId)
      || inventoryCategories[inventoryCategories.length - 1];
  };

  const inferInventoryCategoryId = (item = {}) => {
    if (item.category) {
      return getInventoryCategoryMeta(item.category).id;
    }

    if (item.sourceType === "prepRecipe" || item.subRecipeId) {
      return "prep";
    }

    const searchableText = [
      item.name,
      item.storageArea,
      item.unit
    ].join(" ").toLowerCase();

    const matchedCategory = inventoryCategories.find((category) => {
      if (category.id === "other") return false;
      return category.keywords.some((keyword) => searchableText.includes(keyword));
    });

    return matchedCategory ? matchedCategory.id : "other";
  };

  const getInventoryItemCategory = (item = {}) => getInventoryCategoryMeta(inferInventoryCategoryId(item));

  const getInventoryStockValue = (item = {}) => {
    const explicitValue = Number(item.totalCost ?? item.stockValue ?? 0);
    if (explicitValue > 0) return explicitValue;

    return Number(item.quantity || 0) * getInventoryUnitCost(item);
  };

  const normalizeIngredientName = (name) => String(name || "").trim().toLowerCase();

  const getInventoryItemLabel = (item) => {
    const itemUnit = item?.unit || "units";
    const itemCost = getInventoryUnitCost(item);
    return `${item?.name || "Untitled Item"} (${itemUnit}) - $${itemCost.toFixed(2)} / ${itemUnit}`;
  };

  const findInventoryItemByName = (name) => {
    const normalizedName = normalizeIngredientName(name);
    if (!normalizedName) return null;
    return getInventory().find((item) => normalizeIngredientName(item.name) === normalizedName) || null;
  };

  const selectIngredientPickerItem = (picker, item) => {
    if (!picker?.searchInput || !picker.hiddenInput || !item) return;

    picker.searchInput.value = item.name || "";
    picker.hiddenInput.value = item.id || "";
    if (picker.quickFields) picker.quickFields.hidden = true;
    if (picker.statusEl) picker.statusEl.textContent = `Selected from inventory: ${getInventoryItemLabel(item)}`;
    if (picker.matchesList) picker.matchesList.hidden = true;
  };

  const clearIngredientPicker = (picker) => {
    if (!picker) return;

    if (picker.searchInput) picker.searchInput.value = "";
    if (picker.hiddenInput) picker.hiddenInput.value = "";
    if (picker.matchesList) {
      picker.matchesList.innerHTML = "";
      picker.matchesList.hidden = true;
    }
    if (picker.statusEl) picker.statusEl.textContent = "Type to search inventory or create a new ingredient.";
    if (picker.quickFields) picker.quickFields.hidden = true;
    if (picker.quickQuantityInput) picker.quickQuantityInput.value = "";
    if (picker.quickTotalCostInput) picker.quickTotalCostInput.value = "";
  };

  const renderIngredientPickerMatches = (picker, showList = false) => {
    if (!picker?.searchInput || !picker.hiddenInput || !picker.matchesList) return;

    const query = picker.searchInput.value.trim();
    const normalizedQuery = normalizeIngredientName(query);
    const inventory = getInventory();
    const exactMatch = findInventoryItemByName(query);
    const selectedItem = inventory.find((item) => item.id === picker.hiddenInput.value);
    const hasSelectedCurrentItem = selectedItem && normalizeIngredientName(selectedItem.name) === normalizedQuery;

    if (!hasSelectedCurrentItem) {
      picker.hiddenInput.value = "";
    }

    const matches = normalizedQuery
      ? inventory
          .filter((item) => normalizeIngredientName(item.name).includes(normalizedQuery))
          .slice(0, 6)
      : inventory.slice(0, 6);

    const canCreate = Boolean(normalizedQuery && !exactMatch);
    if (picker.quickFields) picker.quickFields.hidden = !canCreate;

    if (picker.statusEl) {
      if (!normalizedQuery) {
        picker.statusEl.textContent = inventory.length
          ? "Start typing to search inventory."
          : "No inventory yet. Type a name and fill the add-to-inventory fields.";
      } else if (hasSelectedCurrentItem || exactMatch) {
        picker.statusEl.textContent = `Found in inventory: ${getInventoryItemLabel(exactMatch || selectedItem)}`;
      } else {
        picker.statusEl.textContent = `"${query}" is not in inventory. Complete the add-to-inventory fields below.`;
      }
    }

    picker.matchesList.innerHTML = "";

    matches.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ingredient-match-btn";
      button.textContent = getInventoryItemLabel(item);
      button.addEventListener("click", () => {
        selectIngredientPickerItem(picker, item);
      });
      picker.matchesList.appendChild(button);
    });

    if (canCreate) {
      const createHint = document.createElement("div");
      createHint.className = "ingredient-match-empty";
      createHint.textContent = `Create "${query}" in inventory using the fields below.`;
      picker.matchesList.appendChild(createHint);
    }

    picker.matchesList.hidden = !showList || (!matches.length && !canCreate);
  };

  const populateIngredientPicker = (picker) => {
    if (!picker?.searchInput || !picker.hiddenInput) return;

    const selectedItem = getInventory().find((item) => item.id === picker.hiddenInput.value);
    if (selectedItem) {
      selectIngredientPickerItem(picker, selectedItem);
      return;
    }

    renderIngredientPickerMatches(picker, false);
  };

  const setupIngredientPicker = (picker) => {
    if (!picker?.searchInput || !picker.hiddenInput || !picker.matchesList) return;

    picker.searchInput.addEventListener("input", () => {
      picker.hiddenInput.value = "";
      renderIngredientPickerMatches(picker, true);
    });

    picker.searchInput.addEventListener("focus", () => {
      renderIngredientPickerMatches(picker, true);
    });

    picker.quickUnitInput?.addEventListener("change", () => {
      renderIngredientPickerMatches(picker, false);
    });
  };

  const createInventoryItemFromPicker = (picker, fallbackUnit) => {
    const name = picker?.searchInput ? picker.searchInput.value.trim() : "";
    if (!name) {
      alert("Please type an ingredient name.");
      return "";
    }

    const exactMatch = findInventoryItemByName(name);
    if (exactMatch) {
      selectIngredientPickerItem(picker, exactMatch);
      return exactMatch.id;
    }

    const quantity = picker.quickQuantityInput ? Number(picker.quickQuantityInput.value) : 0;
    const totalCost = picker.quickTotalCostInput ? Number(picker.quickTotalCostInput.value) : 0;
    const unit = picker.quickUnitInput ? picker.quickUnitInput.value : fallbackUnit;
    const storageArea = picker.quickStorageAreaInput ? picker.quickStorageAreaInput.value : "Prep Area";

    if (quantity <= 0 || totalCost <= 0) {
      alert("This ingredient is not in inventory yet. Enter inventory quantity and total cost to add it.");
      return "";
    }

    const costPerUnit = totalCost / quantity;
    const inventoryItem = {
      id: Date.now().toString(),
      name,
      category: inferInventoryCategoryId({ name, storageArea, unit }),
      quantity,
      unit,
      totalCost,
      storageArea,
      costPerUnit,
      cost: costPerUnit,
      stockValue: totalCost
    };

    const inventory = getInventory();
    inventory.push(inventoryItem);
    saveInventory(inventory);

    populateRecipeIngredientOptions();
    populateSubRecipeIngredientOptions();
    renderInventory();
    selectIngredientPickerItem(picker, inventoryItem);

    return inventoryItem.id;
  };

  const calculateRecipeIngredientCost = (ingredients = []) => {
    const inventory = getInventory();

    return ingredients.reduce((total, ingredient) => {
      const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
      const unitCost = getInventoryUnitCost(item);
      const quantityUsed = Number(ingredient.qty || 0);

      return total + (quantityUsed * unitCost);
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
      selectedIngredientsList.innerHTML = `
        <div class="recipe-ingredients-cell">
          <strong>0 ingredients</strong>
          <span>No ingredients added yet.</span>
        </div>
      `;
      return;
    }

    selectedIngredientsList.innerHTML = `
      <div class="recipe-ingredients-cell">
        <strong>${currentRecipeIngredients.length} ingredients ready to save</strong>
        <span>Open the table to review ingredients before saving.</span>
        <button type="button" class="secondary-btn view-current-ingredients-btn">
          Open Ingredients Table
        </button>
      </div>
    `;

    const viewCurrentIngredientsBtn = selectedIngredientsList.querySelector(".view-current-ingredients-btn");

    if (viewCurrentIngredientsBtn) {
      viewCurrentIngredientsBtn.addEventListener("click", () => {
        openCurrentIngredientsModal();
      });
    }
  };

  const openCurrentIngredientsModal = () => {
    if (!ingredientsModal || !ingredientsModalTitle || !ingredientsModalBody) return;

    const inventory = getInventory();
    ingredientsModalTitle.textContent = editingRecipeId
      ? "Edit Recipe Ingredients"
      : "New Recipe Ingredients";

    if (currentRecipeIngredients.length === 0) {
      ingredientsModalBody.innerHTML = `<div class="ingredient-row">No ingredients added yet.</div>`;
    } else {
      ingredientsModalBody.innerHTML = `
        <div class="ingredients-table-wrap">
          <table class="ingredients-detail-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Quantity Used</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Presentation</th>
                <th>Base Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${currentRecipeIngredients.map((ingredient, index) => {
                const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
                const itemName = item ? item.name : "Unknown item";
                const usedQty = Number(ingredient.originalQty ?? ingredient.qty ?? 0);
                const usedUnit = ingredient.originalUnit || item?.unit || "unit";
                const inventoryQty = Number(item?.quantity || 0);
                const inventoryUnit = item?.unit || usedUnit;
                const itemPrice = getInventoryUnitCost(item);
                const convertedQty = Number(ingredient.qty || 0);
                const ingredientCost = convertedQty * itemPrice;
                const presentation = item
                  ? `${inventoryQty.toFixed(2)} ${inventoryUnit}`
                  : "No presentation";

                return `
                  <tr>
                    <td>${itemName}</td>
                    <td>${usedQty.toFixed(2)}</td>
                    <td>${usedUnit}</td>
                    <td>$${itemPrice.toFixed(2)} / ${inventoryUnit}</td>
                    <td>${presentation}</td>
                    <td>$${ingredientCost.toFixed(2)}</td>
                    <td>
                      <div class="icon-actions">
                        <button type="button" class="icon-btn edit ingredient-edit-btn" data-index="${index}" title="Edit">✏️</button>
                        <button type="button" class="icon-btn delete ingredient-delete-btn" data-index="${index}" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
        ${(() => {
          const baseCost = calculateRecipeIngredientCost(currentRecipeIngredients);
          const wastePercent = recipeYieldInput ? Number(recipeYieldInput.value || 0) : 0;
          const finalCost = applyWasteToCost(baseCost, wastePercent);
          const wasteCost = finalCost - baseCost;

          return `
            <div class="recipe-waste-summary">
              <h4>Recipe Waste Summary</h4>
              <div class="recipe-waste-summary-grid">
                <div>
                  <span>Base Recipe Cost</span>
                  <strong>$${baseCost.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Waste Applied</span>
                  <strong>${wastePercent.toFixed(0)}%</strong>
                </div>
                <div>
                  <span>Waste Cost</span>
                  <strong>$${wasteCost.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Final Recipe Cost</span>
                  <strong>$${finalCost.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          `;
        })()}
      `;
    }

    ingredientsModalBody.querySelectorAll(".ingredient-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        currentRecipeIngredients.splice(index, 1);
        renderSelectedIngredients();
        openCurrentIngredientsModal();
      });
    });

    ingredientsModalBody.querySelectorAll(".ingredient-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        const ingredient = currentRecipeIngredients[index];

        const inventoryItem = getInventory().find((item) => item.id === ingredient.inventoryItemId);
        if (inventoryItem) selectIngredientPickerItem(recipeIngredientPicker, inventoryItem);
        if (recipeIngredientQtyInput) recipeIngredientQtyInput.value = ingredient.originalQty ?? ingredient.qty;
        if (recipeIngredientUnitInput) recipeIngredientUnitInput.value = ingredient.originalUnit || "lb";

        currentRecipeIngredients.splice(index, 1);
        closeIngredientsModal();
        renderSelectedIngredients();
      });
    });

    ingredientsModal.hidden = false;
  };

  const openIngredientsModal = (recipe) => {
    if (!ingredientsModal || !ingredientsModalTitle || !ingredientsModalBody) return;

    const inventory = getInventory();
    const wastePercent = Number(recipe.wastePercent || 0);
    ingredientsModalTitle.textContent = `${recipe.name || "Recipe"} Ingredients`;

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      ingredientsModalBody.innerHTML = `<div class="ingredient-row">No ingredients added.</div>`;
    } else {
      ingredientsModalBody.innerHTML = `
        <div class="ingredients-table-wrap">
          <table class="ingredients-detail-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Quantity Used</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Presentation</th>
                <th>Base Cost</th>
              </tr>
            </thead>
            <tbody>
              ${recipe.ingredients.map((ingredient) => {
                const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
                const itemName = item ? item.name : "Unknown item";
                const usedQty = Number(ingredient.originalQty ?? ingredient.qty ?? 0);
                const usedUnit = ingredient.originalUnit || item?.unit || "unit";
                const inventoryQty = Number(item?.quantity || 0);
                const inventoryUnit = item?.unit || usedUnit;
                const itemPrice = getInventoryUnitCost(item);
                const convertedQty = Number(ingredient.qty || 0);
                const ingredientCost = convertedQty * itemPrice;
                const presentation = item
                  ? `${inventoryQty.toFixed(2)} ${inventoryUnit}`
                  : "No presentation";

                return `
                  <tr>
                    <td>${itemName}</td>
                    <td>${usedQty.toFixed(2)}</td>
                    <td>${usedUnit}</td>
                    <td>$${itemPrice.toFixed(2)} / ${inventoryUnit}</td>
                    <td>${presentation}</td>
                    <td>$${ingredientCost.toFixed(2)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
        ${(() => {
          const baseCost = calculateRecipeIngredientCost(recipe.ingredients || []);
          const finalCost = applyWasteToCost(baseCost, wastePercent);
          const wasteCost = finalCost - baseCost;

          return `
            <div class="recipe-waste-summary">
              <h4>Recipe Waste Summary</h4>
              <div class="recipe-waste-summary-grid">
                <div>
                  <span>Base Recipe Cost</span>
                  <strong>$${baseCost.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Waste Applied</span>
                  <strong>${wastePercent.toFixed(0)}%</strong>
                </div>
                <div>
                  <span>Waste Cost</span>
                  <strong>$${wasteCost.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Final Recipe Cost</span>
                  <strong>$${finalCost.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          `;
        })()}
      `;
    }

    ingredientsModal.hidden = false;
  };

  const closeIngredientsModal = () => {
    if (!ingredientsModal) return;
    ingredientsModal.hidden = true;
  };

  const populateRecipeIngredientOptions = () => {
    populateIngredientPicker(recipeIngredientPicker);
  };

  const addRecipeIngredient = () => {
    const qty = recipeIngredientQtyInput ? Number(recipeIngredientQtyInput.value) : 0;
    const recipeUnit = recipeIngredientUnitInput ? recipeIngredientUnitInput.value : "lb";

    if (qty <= 0) {
      alert("Please enter the quantity used for this recipe.");
      return;
    }

    const inventoryItemId = recipeIngredientItemInput && recipeIngredientItemInput.value
      ? recipeIngredientItemInput.value
      : createInventoryItemFromPicker(recipeIngredientPicker, recipeUnit);
    const inventoryItem = getInventory().find((item) => item.id === inventoryItemId);
    const inventoryUnit = inventoryItem?.unit || recipeUnit;
    const convertedQty = convertQuantity(qty, recipeUnit, inventoryUnit);

    if (!inventoryItemId) {
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
    clearIngredientPicker(recipeIngredientPicker);
  };

  const calculateSubRecipeIngredientCost = (ingredients = []) => calculateRecipeIngredientCost(ingredients);

  const populateSubRecipeIngredientOptions = () => {
    populateIngredientPicker(subRecipeIngredientPicker);
  };

  const renderSelectedSubRecipeIngredients = () => {
    if (!selectedSubRecipeIngredientsList) return;

    if (currentSubRecipeIngredients.length === 0) {
      selectedSubRecipeIngredientsList.innerHTML = `
        <div class="recipe-ingredients-cell">
          <strong>0 ingredients</strong>
          <span>No prep ingredients added yet.</span>
        </div>
      `;
      return;
    }

    selectedSubRecipeIngredientsList.innerHTML = `
      <div class="recipe-ingredients-cell">
        <strong>${currentSubRecipeIngredients.length} ingredients ready to save</strong>
        <span>Open the table to review ingredients before saving.</span>
        <button type="button" class="secondary-btn view-current-sub-recipe-ingredients-btn">
          Open Ingredients Table
        </button>
      </div>
    `;

    selectedSubRecipeIngredientsList
      .querySelector(".view-current-sub-recipe-ingredients-btn")
      ?.addEventListener("click", () => openCurrentSubRecipeIngredientsModal());
  };

  const openCurrentSubRecipeIngredientsModal = () => {
    if (!ingredientsModal || !ingredientsModalTitle || !ingredientsModalBody) return;

    const inventory = getInventory();
    ingredientsModalTitle.textContent = editingSubRecipeId
      ? "Edit Prep Recipe Ingredients"
      : "New Prep Recipe Ingredients";

    if (currentSubRecipeIngredients.length === 0) {
      ingredientsModalBody.innerHTML = `<div class="ingredient-row">No prep ingredients added yet.</div>`;
    } else {
      ingredientsModalBody.innerHTML = `
        <div class="ingredients-table-wrap">
          <table class="ingredients-detail-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Quantity Used</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Presentation</th>
                <th>Base Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${currentSubRecipeIngredients.map((ingredient, index) => {
                const item = inventory.find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
                const itemName = item ? item.name : "Unknown item";
                const usedQty = Number(ingredient.originalQty ?? ingredient.qty ?? 0);
                const usedUnit = ingredient.originalUnit || item?.unit || "unit";
                const inventoryQty = Number(item?.quantity || 0);
                const inventoryUnit = item?.unit || usedUnit;
                const itemPrice = getInventoryUnitCost(item);
                const convertedQty = Number(ingredient.qty || 0);
                const ingredientCost = convertedQty * itemPrice;
                const presentation = item
                  ? `${inventoryQty.toFixed(2)} ${inventoryUnit}`
                  : "No presentation";

                return `
                  <tr>
                    <td>${itemName}</td>
                    <td>${usedQty.toFixed(2)}</td>
                    <td>${usedUnit}</td>
                    <td>$${itemPrice.toFixed(2)} / ${inventoryUnit}</td>
                    <td>${presentation}</td>
                    <td>$${ingredientCost.toFixed(2)}</td>
                    <td>
                      <div class="icon-actions">
                        <button type="button" class="icon-btn edit sub-recipe-ingredient-edit-btn" data-index="${index}" title="Edit">✏️</button>
                        <button type="button" class="icon-btn delete sub-recipe-ingredient-delete-btn" data-index="${index}" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    ingredientsModalBody.querySelectorAll(".sub-recipe-ingredient-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentSubRecipeIngredients.splice(Number(btn.dataset.index), 1);
        renderSelectedSubRecipeIngredients();
        openCurrentSubRecipeIngredientsModal();
      });
    });

    ingredientsModalBody.querySelectorAll(".sub-recipe-ingredient-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const ingredient = currentSubRecipeIngredients[Number(btn.dataset.index)];

        const inventoryItem = getInventory().find((item) => item.id === ingredient.inventoryItemId);
        if (inventoryItem) selectIngredientPickerItem(subRecipeIngredientPicker, inventoryItem);
        if (subRecipeIngredientQtyInput) subRecipeIngredientQtyInput.value = ingredient.originalQty ?? ingredient.qty;
        if (subRecipeIngredientUnitInput) subRecipeIngredientUnitInput.value = ingredient.originalUnit || "lb";

        currentSubRecipeIngredients.splice(Number(btn.dataset.index), 1);
        closeIngredientsModal();
        renderSelectedSubRecipeIngredients();
      });
    });

    ingredientsModal.hidden = false;
  };

  const openSubRecipeIngredientsModal = (subRecipe) => {
    openIngredientsModal({
      name: subRecipe.name || "Prep Recipe",
      ingredients: subRecipe.ingredients || [],
      wastePercent: subRecipe.wastePercent || 0
    });
  };

  const addSubRecipeIngredient = () => {
    const qty = subRecipeIngredientQtyInput ? Number(subRecipeIngredientQtyInput.value) : 0;
    const recipeUnit = subRecipeIngredientUnitInput ? subRecipeIngredientUnitInput.value : "lb";

    if (qty <= 0) {
      alert("Please enter the quantity used for this prep recipe.");
      return;
    }

    const inventoryItemId = subRecipeIngredientItemInput && subRecipeIngredientItemInput.value
      ? subRecipeIngredientItemInput.value
      : createInventoryItemFromPicker(subRecipeIngredientPicker, recipeUnit);
    const inventoryItem = getInventory().find((item) => item.id === inventoryItemId);
    const inventoryUnit = inventoryItem?.unit || recipeUnit;
    const convertedQty = convertQuantity(qty, recipeUnit, inventoryUnit);

    if (!inventoryItemId) {
      return;
    }

    currentSubRecipeIngredients.push({
      inventoryItemId,
      qty: convertedQty,
      originalQty: qty,
      originalUnit: recipeUnit
    });
    renderSelectedSubRecipeIngredients();

    if (subRecipeIngredientQtyInput) subRecipeIngredientQtyInput.value = "";
    clearIngredientPicker(subRecipeIngredientPicker);
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
    const cost = recipeCost;
    const price = menuPriceInput ? Number(menuPriceInput.value) : 0;

    if (!name || selectedRecipeIds.length === 0 || cost <= 0 || price <= 0) {
      alert("Please complete the menu information. Select at least one recipe and enter the selling price per person.");
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

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${recipe.name || "-"}</td>
        <td>${recipe.category || "-"}</td>
        <td>
          <div class="recipe-ingredients-cell">
            <button type="button" class="secondary-btn view-ingredients-btn">
              View Details
            </button>
          </div>
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

  const renderSubRecipes = () => {
    const subRecipes = getSubRecipes();
    if (!subRecipesTableBody) return;

    subRecipesTableBody.innerHTML = "";

    if (subRecipes.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="8" style="color:#64748b; text-align:center; padding:20px;">
          No prep recipes yet. Create your first prep recipe.
        </td>
      `;
      subRecipesTableBody.appendChild(emptyRow);
      return;
    }

    subRecipes.forEach((subRecipe) => {
      const baseCost = calculateSubRecipeIngredientCost(subRecipe.ingredients || []);
      const totalPrepCost = applyWasteToCost(baseCost, subRecipe.wastePercent || 0);
      const yieldAmount = Number(subRecipe.yieldAmount || 0);
      const costPerYieldUnit = yieldAmount > 0 ? totalPrepCost / yieldAmount : 0;
      const yieldUnit = subRecipe.yieldUnit || "units";

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${subRecipe.name || "-"}</td>
        <td>${subRecipe.category || "-"}</td>
        <td>
          <div class="recipe-ingredients-cell">
            <button type="button" class="secondary-btn view-sub-recipe-ingredients-btn">
              View Details
            </button>
          </div>
        </td>
        <td>${yieldAmount ? `${yieldAmount.toFixed(2)} ${yieldUnit}` : "-"}</td>
        <td>$${costPerYieldUnit.toFixed(2)} / ${yieldUnit}</td>
        <td>$${totalPrepCost.toFixed(2)}</td>
        <td>${subRecipe.notes || "-"}</td>
        <td>
          <div class="icon-actions">
            <button type="button" class="icon-btn edit sub-recipe-edit-btn" title="Edit">✏️</button>
            <button type="button" class="icon-btn delete sub-recipe-delete-btn" title="Delete">🗑️</button>
          </div>
        </td>
      `;

      newRow.querySelector(".view-sub-recipe-ingredients-btn")?.addEventListener("click", () => {
        openSubRecipeIngredientsModal(subRecipe);
      });

      newRow.querySelector(".sub-recipe-edit-btn")?.addEventListener("click", () => {
        if (subRecipeNameInput) subRecipeNameInput.value = subRecipe.name || "";
        if (subRecipeCategoryInput) subRecipeCategoryInput.value = subRecipe.category || "Sauce";
        if (subRecipeYieldInput) subRecipeYieldInput.value = subRecipe.yieldAmount || "";
        if (subRecipeYieldUnitInput) subRecipeYieldUnitInput.value = subRecipe.yieldUnit || "lb";
        if (subRecipeWasteInput) subRecipeWasteInput.value = subRecipe.wastePercent || 0;
        if (subRecipeNotesInput) subRecipeNotesInput.value = subRecipe.notes || "";

        currentSubRecipeIngredients = [...(subRecipe.ingredients || [])];
        editingSubRecipeId = subRecipe.id;
        renderSelectedSubRecipeIngredients();
        if (addSubRecipeBtn) addSubRecipeBtn.textContent = "Update Prep Recipe";
        subRecipesSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      newRow.querySelector(".sub-recipe-delete-btn")?.addEventListener("click", () => {
        const confirmDelete = confirm(`Delete ${subRecipe.name || "this prep recipe"}?`);
        if (!confirmDelete) return;

        const updatedSubRecipes = getSubRecipes().filter((item) => item.id !== subRecipe.id);
        saveSubRecipes(updatedSubRecipes);
        syncSubRecipesToInventory();

        if (editingSubRecipeId === subRecipe.id) {
          editingSubRecipeId = null;
          currentSubRecipeIngredients = [];
          renderSelectedSubRecipeIngredients();
          if (addSubRecipeBtn) addSubRecipeBtn.textContent = "Add Prep Recipe";
        }

        renderSubRecipes();
        renderInventory();
      });

      subRecipesTableBody.appendChild(newRow);
    });
  };

  const addSubRecipe = () => {
    const name = subRecipeNameInput ? subRecipeNameInput.value.trim() : "";
    const category = subRecipeCategoryInput ? subRecipeCategoryInput.value : "Sauce";
    const yieldAmount = subRecipeYieldInput ? Number(subRecipeYieldInput.value) : 0;
    const yieldUnit = subRecipeYieldUnitInput ? subRecipeYieldUnitInput.value : "lb";
    const wastePercent = subRecipeWasteInput ? Number(subRecipeWasteInput.value || 0) : 0;
    const notes = subRecipeNotesInput ? subRecipeNotesInput.value.trim() : "";
    const baseCost = calculateSubRecipeIngredientCost(currentSubRecipeIngredients);
    const totalPrepCost = applyWasteToCost(baseCost, wastePercent);
    const costPerYieldUnit = yieldAmount > 0 ? totalPrepCost / yieldAmount : 0;

    if (!name || yieldAmount <= 0 || currentSubRecipeIngredients.length === 0 || totalPrepCost <= 0) {
      alert("Please complete the prep recipe information and add at least one inventory ingredient.");
      return;
    }

    const subRecipes = getSubRecipes();
    const subRecipeData = {
      name,
      category,
      yieldAmount,
      yieldUnit,
      wastePercent,
      notes,
      baseCost,
      totalPrepCost,
      costPerYieldUnit,
      ingredients: [...currentSubRecipeIngredients]
    };

    if (editingSubRecipeId) {
      const updatedSubRecipes = subRecipes.map((subRecipe) => {
        if (subRecipe.id !== editingSubRecipeId) return subRecipe;
        return {
          ...subRecipe,
          ...subRecipeData
        };
      });
      saveSubRecipes(updatedSubRecipes);
      syncSubRecipesToInventory();
      editingSubRecipeId = null;
      if (addSubRecipeBtn) addSubRecipeBtn.textContent = "Add Prep Recipe";
    } else {
      subRecipes.push({
        id: Date.now().toString(),
        ...subRecipeData
      });
      saveSubRecipes(subRecipes);
      syncSubRecipesToInventory();
    }

    renderSubRecipes();
    renderInventory();

    if (subRecipeNameInput) subRecipeNameInput.value = "";
    if (subRecipeYieldInput) subRecipeYieldInput.value = "";
    if (subRecipeWasteInput) subRecipeWasteInput.value = "0";
    if (subRecipeNotesInput) subRecipeNotesInput.value = "";
    currentSubRecipeIngredients = [];
    renderSelectedSubRecipeIngredients();
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

  const buildPrepRecipeInventoryItem = (subRecipe, existingItem = {}) => {
    const baseCost = calculateSubRecipeIngredientCost(subRecipe.ingredients || []);
    const totalPrepCost = Number(subRecipe.totalPrepCost || 0) || applyWasteToCost(baseCost, subRecipe.wastePercent || 0);
    const quantity = Number(subRecipe.yieldAmount || 0);
    const unit = subRecipe.yieldUnit || "units";
    const costPerUnit = quantity > 0 ? totalPrepCost / quantity : 0;

    return {
      ...existingItem,
      id: existingItem.id || `prep-${subRecipe.id}`,
      name: subRecipe.name || "Prep Recipe",
      category: "prep",
      quantity,
      unit,
      totalCost: totalPrepCost,
      storageArea: existingItem.storageArea || "Prep Area",
      costPerUnit,
      cost: costPerUnit,
      stockValue: totalPrepCost,
      sourceType: "prepRecipe",
      subRecipeId: subRecipe.id
    };
  };

  const syncSubRecipesToInventory = () => {
    const subRecipes = getSubRecipes();
    const inventory = getInventory();
    const linkedInventory = new Map(
      inventory
        .filter((item) => item.sourceType === "prepRecipe" && item.subRecipeId)
        .map((item) => [item.subRecipeId, item])
    );
    const manualInventory = inventory.filter((item) => item.sourceType !== "prepRecipe");
    const prepInventory = subRecipes.map((subRecipe) => buildPrepRecipeInventoryItem(
      subRecipe,
      linkedInventory.get(subRecipe.id) || {}
    ));

    saveInventory([...manualInventory, ...prepInventory]);
  };

  const renderInventorySummary = (items) => {
    if (!inventoryCategorySummary) return;

    inventoryCategorySummary.innerHTML = "";

    inventoryCategories.forEach((category) => {
      const categoryItems = items.filter((item) => getInventoryItemCategory(item).id === category.id);
      const categoryValue = categoryItems.reduce((total, item) => total + getInventoryStockValue(item), 0);

      const card = document.createElement("button");
      card.type = "button";
      const isActiveCategory = inventoryCategoryFilterInput && inventoryCategoryFilterInput.value === category.id;
      card.className = `inventory-summary-card ${category.className}${isActiveCategory ? " active" : ""}`;
      card.innerHTML = `
        <span class="inventory-summary-icon">${category.icon}</span>
        <div>
          <strong>${category.label}</strong>
          <span>${categoryItems.length} item${categoryItems.length === 1 ? "" : "s"} · $${categoryValue.toFixed(2)}</span>
        </div>
      `;
      card.addEventListener("click", () => {
        if (!inventoryCategoryFilterInput) return;
        inventoryCategoryFilterInput.value = isActiveCategory ? "" : category.id;
        renderInventory();
      });
      inventoryCategorySummary.appendChild(card);
    });
  };

  const renderInventoryPrepRecipes = () => {
    if (!inventoryPrepRecipesList) return;

    const subRecipes = getSubRecipes();
    inventoryPrepRecipesList.innerHTML = "";

    if (subRecipes.length === 0) {
      inventoryPrepRecipesList.innerHTML = `
        <div class="inventory-empty-card">
          No prep recipes saved yet. Create sauces, salsas, dressings, or prep bases to make them part of inventory.
        </div>
      `;
      return;
    }

    subRecipes.forEach((subRecipe) => {
      const prepItem = buildPrepRecipeInventoryItem(subRecipe);
      const card = document.createElement("div");
      card.className = "inventory-prep-card";
      card.innerHTML = `
        <div>
          <strong>${prepItem.name}</strong>
          <span>${subRecipe.category || "Prep Recipe"} · ${prepItem.quantity.toFixed(2)} ${prepItem.unit}</span>
        </div>
        <div>
          <strong>$${prepItem.costPerUnit.toFixed(2)} / ${prepItem.unit}</strong>
          <span>Total batch $${prepItem.totalCost.toFixed(2)}</span>
        </div>
      `;
      inventoryPrepRecipesList.appendChild(card);
    });
  };

  const renderInventory = () => {
    syncSubRecipesToInventory();

    const inventory = getInventory().map((item) => ({
      ...item,
      category: inferInventoryCategoryId(item)
    }));
    const searchTerm = inventorySearchInput ? inventorySearchInput.value.trim().toLowerCase() : "";
    const categoryFilter = inventoryCategoryFilterInput ? inventoryCategoryFilterInput.value : "";
    const filteredInventory = inventory.filter((item) => {
      const category = getInventoryItemCategory(item);
      const searchableText = [
        item.name,
        category.label,
        item.unit,
        item.storageArea
      ].join(" ").toLowerCase();

      const matchesSearch = searchableText.includes(searchTerm);
      const matchesCategory = !categoryFilter || category.id === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    renderInventorySummary(inventory);
    renderInventoryPrepRecipes();

    if (!inventorySections) return;

    inventorySections.innerHTML = "";

    if (filteredInventory.length === 0) {
      inventorySections.innerHTML = `
        <div class="inventory-empty-card">
          ${inventory.length === 0 ? "No inventory items yet. Add your first item." : "No inventory items match your search or category filter."}
        </div>
      `;
      return;
    }

    const sortedInventory = [...filteredInventory].sort((a, b) => {
      const categoryA = getInventoryItemCategory(a).label.toLowerCase();
      const categoryB = getInventoryItemCategory(b).label.toLowerCase();
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();

      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }

      return nameA.localeCompare(nameB);
    });

    inventoryCategories.forEach((category) => {
      const categoryItems = sortedInventory.filter((item) => getInventoryItemCategory(item).id === category.id);
      if (categoryItems.length === 0) return;

      const categoryValue = categoryItems.reduce((total, item) => total + getInventoryStockValue(item), 0);
      const section = document.createElement("section");
      section.className = `inventory-category-section ${category.className}`;
      section.innerHTML = `
        <div class="inventory-category-header">
          <div>
            <span>${category.icon}</span>
            <div>
              <h3>${category.label}</h3>
              <p>${categoryItems.length} item${categoryItems.length === 1 ? "" : "s"} · $${categoryValue.toFixed(2)} stock value</p>
            </div>
          </div>
        </div>
        <div class="inventory-category-table-wrap">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Cost / Unit</th>
                <th>Storage Area</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      `;

      const sectionBody = section.querySelector("tbody");

      categoryItems.forEach((item) => {
        const quantity = Number(item.quantity || 0);
        const unit = item.unit || "units";
        const totalCost = getInventoryStockValue(item);
        const costPerUnit = getInventoryUnitCost(item);
        const storageArea = item.storageArea || "-";
        const status = getInventoryStatus(quantity);
        const isPrepRecipeItem = item.sourceType === "prepRecipe";

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>
            <div class="inventory-item-name">
              <strong>${item.name || "-"}</strong>
              ${isPrepRecipeItem ? "<span>Prep Recipe</span>" : ""}
            </div>
          </td>
          <td>${quantity.toFixed(2)} ${unit}</td>
          <td>$${totalCost.toFixed(2)}</td>
          <td>$${costPerUnit.toFixed(2)} / ${unit}</td>
          <td>${storageArea}</td>
          <td><span class="status ${status.className}">${status.label}</span></td>
          <td>
            <div class="icon-actions">
              <button type="button" class="icon-btn edit inventory-edit-btn" title="${isPrepRecipeItem ? "Open Prep Recipe" : "Edit"}">${isPrepRecipeItem ? "↗" : "✏️"}</button>
              <button type="button" class="icon-btn delete inventory-delete-btn" title="Delete">🗑️</button>
            </div>
          </td>
        `;

        const editBtn = newRow.querySelector(".inventory-edit-btn");
        const deleteBtn = newRow.querySelector(".inventory-delete-btn");

        if (editBtn) {
          editBtn.addEventListener("click", () => {
            if (isPrepRecipeItem) {
              showModuleByKey("subRecipes");
              return;
            }

            if (inventoryItemNameInput) inventoryItemNameInput.value = item.name || "";
            if (inventoryCategoryInput) inventoryCategoryInput.value = getInventoryItemCategory(item).id;
            if (inventoryQuantityInput) inventoryQuantityInput.value = quantity || "";
            if (inventoryUnitInput) inventoryUnitInput.value = unit;
            if (inventoryTotalCostInput) inventoryTotalCostInput.value = totalCost || "";
            if (inventoryStorageAreaInput) inventoryStorageAreaInput.value = storageArea === "-" ? "Refrigerated" : storageArea;
            editingInventoryItemId = item.id;
            if (addInventoryBtn) addInventoryBtn.textContent = "Update Inventory Item";
            inventorySection.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }

        if (deleteBtn) {
          deleteBtn.addEventListener("click", () => {
            if (isPrepRecipeItem) {
              const confirmDeletePrep = confirm(`Delete prep recipe ${item.name || "this prep recipe"}? This removes it from Prep Recipes and Inventory.`);
              if (!confirmDeletePrep) return;

              const updatedSubRecipes = getSubRecipes().filter((subRecipe) => subRecipe.id !== item.subRecipeId);
              saveSubRecipes(updatedSubRecipes);
              syncSubRecipesToInventory();
              renderInventory();
              renderSubRecipes();
              return;
            }

            const confirmDelete = confirm(`Delete ${item.name || "this inventory item"}?`);
            if (!confirmDelete) return;

            const updatedInventory = getInventory().filter((inventoryItem) => inventoryItem.id !== item.id);
            saveInventory(updatedInventory);

            if (editingInventoryItemId === item.id) {
              editingInventoryItemId = null;
              if (addInventoryBtn) addInventoryBtn.textContent = "Add Inventory Item";
              if (inventoryItemNameInput) inventoryItemNameInput.value = "";
              if (inventoryCategoryInput) inventoryCategoryInput.value = "produce";
              if (inventoryQuantityInput) inventoryQuantityInput.value = "";
              if (inventoryTotalCostInput) inventoryTotalCostInput.value = "";
              if (inventoryStorageAreaInput) inventoryStorageAreaInput.value = "Refrigerated";
            }

            renderInventory();
            populateRecipeIngredientOptions();
            populateSubRecipeIngredientOptions();
            renderRecipes();
            renderSubRecipes();
            renderMenus();
            renderEvents();
          });
        }

        sectionBody.appendChild(newRow);
      });

      inventorySections.appendChild(section);
    });
  };

  const addInventoryItem = () => {
    const name = inventoryItemNameInput ? inventoryItemNameInput.value.trim() : "";
    const category = inventoryCategoryInput ? inventoryCategoryInput.value : "";
    const quantity = inventoryQuantityInput ? Number(inventoryQuantityInput.value) : 0;
    const unit = inventoryUnitInput ? inventoryUnitInput.value : "units";
    const totalCost = inventoryTotalCostInput ? Number(inventoryTotalCostInput.value) : 0;
    const storageArea = inventoryStorageAreaInput ? inventoryStorageAreaInput.value : "Refrigerated";
    const costPerUnit = quantity > 0 ? totalCost / quantity : 0;

    if (!name || quantity <= 0 || totalCost <= 0) {
      alert("Please complete the inventory item information. Quantity and total cost must be greater than 0.");
      return;
    }

    const inventory = getInventory();

    if (editingInventoryItemId) {
      const updatedInventory = inventory.map((item) => {
        if (item.id !== editingInventoryItemId) return item;
        return {
          ...item,
          name,
          category: category || inferInventoryCategoryId({ name, storageArea, unit }),
          quantity,
          unit,
          totalCost,
          storageArea,
          costPerUnit,
          cost: costPerUnit,
          stockValue: totalCost
        };
      });
      saveInventory(updatedInventory);
      editingInventoryItemId = null;
      if (addInventoryBtn) addInventoryBtn.textContent = "Add Inventory Item";
    } else {
      inventory.push({
        id: Date.now().toString(),
        name,
        category: category || inferInventoryCategoryId({ name, storageArea, unit }),
        quantity,
        unit,
        totalCost,
        storageArea,
        costPerUnit,
        cost: costPerUnit,
        stockValue: totalCost
      });
      saveInventory(inventory);
    }

    renderInventory();
    populateRecipeIngredientOptions();
    populateSubRecipeIngredientOptions();
    renderRecipes();
    renderSubRecipes();
    renderMenus();
    renderEvents();

    if (inventoryItemNameInput) inventoryItemNameInput.value = "";
    if (inventoryCategoryInput) inventoryCategoryInput.value = "produce";
    if (inventoryQuantityInput) inventoryQuantityInput.value = "";
    if (inventoryTotalCostInput) inventoryTotalCostInput.value = "";
    if (inventoryStorageAreaInput) inventoryStorageAreaInput.value = "Refrigerated";
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
      const menuId = getEventMenuId(eventData);
      const selectedMenu = menus.find((menu) => menu.id === menuId);
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
      showModuleByKey("inventory");
    });
  }

  if (navProduction && productionSection) {
    navProduction.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("production");
    });
  }

  if (navStaff && staffSection) {
    navStaff.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("staff");
    });
  }

  if (navDashboard && dashboardSection) {
    navDashboard.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("dashboard");
    });
  }

  if (navEvents && eventsSection) {
    navEvents.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("events");
    });
  }

  if (navMenus && menusSection) {
    navMenus.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("menus");
    });
  }

  if (navRecipes && recipesSection) {
    navRecipes.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("recipes");
    });
  }

  if (navSubRecipes && subRecipesSection) {
    navSubRecipes.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("subRecipes");
    });
  }

  document.querySelectorAll("[data-event-filter]").forEach((card) => {
    const openFilteredEvents = () => {
      showModuleByKey("events", {
        eventFilter: card.dataset.eventFilter
      });
    };

    card.addEventListener("click", openFilteredEvents);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFilteredEvents();
      }
    });
  });

  if (addMenuBtn) {
    addMenuBtn.addEventListener("click", addMenu);
  }

  if (addRecipeBtn) {
    addRecipeBtn.addEventListener("click", addRecipe);
  }

  if (addRecipeIngredientBtn) {
    addRecipeIngredientBtn.addEventListener("click", addRecipeIngredient);
  }

  setupIngredientPicker(recipeIngredientPicker);
  setupIngredientPicker(subRecipeIngredientPicker);

  document.addEventListener("click", (event) => {
    [recipeIngredientPicker, subRecipeIngredientPicker].forEach((picker) => {
      if (!picker.matchesList || picker.matchesList.hidden) return;
      const clickedInsideSearch = picker.searchInput?.contains(event.target);
      const clickedInsideMatches = picker.matchesList.contains(event.target);
      if (!clickedInsideSearch && !clickedInsideMatches) {
        picker.matchesList.hidden = true;
      }
    });
  });

  if (addSubRecipeBtn) {
    addSubRecipeBtn.addEventListener("click", addSubRecipe);
  }

  if (addSubRecipeIngredientBtn) {
    addSubRecipeIngredientBtn.addEventListener("click", addSubRecipeIngredient);
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

  if (inventorySearchInput) {
    inventorySearchInput.addEventListener("input", renderInventory);
  }

  if (inventoryCategoryFilterInput) {
    inventoryCategoryFilterInput.addEventListener("change", renderInventory);
  }

  if (inventoryGoPrepRecipesBtn) {
    inventoryGoPrepRecipesBtn.addEventListener("click", () => {
      showModuleByKey("subRecipes");
    });
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
          rememberEventMenuLink(updatedEvent, eventData.menuId);
          events[editingIndex] = updatedEvent;
          saveEvents(events);
        } else {
          const savedEvent = await createEventInApi(eventData);
          rememberEventMenuLink(savedEvent, eventData.menuId);
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

  showModuleByKey("dashboard", { scroll: false });

  populateRecipeIngredientOptions();
  populateSubRecipeIngredientOptions();
  renderSelectedIngredients();
  renderSelectedSubRecipeIngredients();
  populateMenuRecipeOptions();
  populateEventMenuOptions();
  renderEvents().then(renderKpis);
  renderMenus();
  renderRecipes();
  renderSubRecipes();
  renderInventory();
  renderStaff();
  renderProduction();
});
