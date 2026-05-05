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
  const API_BASE_URL = ["localhost", "127.0.0.1", ""].includes(window.location.hostname)
    ? "http://localhost:3001"
    : "https://beoflow-api.onrender.com";

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
  const smartSetupSection = document.getElementById("smart-setup-section");
  const smartSetupChecklist = document.getElementById("smart-setup-checklist");
  const smartSetupProgressLabel = document.getElementById("smart-setup-progress-label");
  const smartSetupFlowTitle = document.getElementById("smart-setup-flow-title");
  const smartSetupFlowSubtitle = document.getElementById("smart-setup-flow-subtitle");
  const smartSetupProgressCount = document.getElementById("smart-setup-progress-count");
  const smartSetupProgressBar = document.getElementById("smart-setup-progress-bar");
  const smartSetupWarning = document.getElementById("smart-setup-warning");
  const smartSetupNotice = document.getElementById("smart-setup-notice");
  const smartSetupTaskList = document.getElementById("smart-setup-task-list");
  const smartSetupCloseBtn = document.getElementById("smart-setup-close");
  const smartSetupLauncher = document.getElementById("smart-setup-launcher");
  const smartSetupLauncherCount = document.getElementById("smart-setup-launcher-count");
  const smartSetupLauncherBar = document.getElementById("smart-setup-launcher-bar");
  const dashboardSection = document.getElementById("dashboard-section");
  const dashboardCalendarSection = document.getElementById("dashboard-calendar-section");
  const eventsSection = document.getElementById("events-section");
  const eventsActiveFilter = document.getElementById("events-active-filter");
  const menusSection = document.getElementById("menus-section");
  const recipesSection = document.getElementById("recipes-section");
  const subRecipesSection = document.getElementById("sub-recipes-section");
  const topbarTitle = document.querySelector(".topbar h1");
  const topbarSubtitle = document.querySelector(".topbar p");
  const topbarActions = document.querySelector(".topbar-actions");
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
  const importScheduleBtn = document.getElementById("import-schedule-btn");
  const autoAssignStationsBtn = document.getElementById("auto-assign-stations-btn");
  const resetOriginalStationsBtn = document.getElementById("reset-original-stations-btn");
  const printAssignmentsBtn = document.getElementById("print-assignments-btn");
  const clearShiftReadinessBtn = document.getElementById("clear-shift-readiness-btn");
  const assignmentPresetNameInput = document.getElementById("assignmentPresetName");
  const assignmentPresetAppliesToInput = document.getElementById("assignmentPresetAppliesTo");
  const saveAssignmentPresetBtn = document.getElementById("save-assignment-preset-btn");
  const assignmentPresetsList = document.getElementById("assignment-presets-list");
  const scheduleImageInput = document.getElementById("scheduleImage");
  const scheduleImportStatus = document.getElementById("schedule-import-status");
  const shiftDayTabs = Array.from(document.querySelectorAll("[data-shift-day]"));
  const shiftReadinessBoard = document.getElementById("shift-readiness-board");
  const shiftKpiEmployees = document.getElementById("shift-kpi-employees");
  const shiftKpiReady = document.getElementById("shift-kpi-ready");
  const shiftKpiNotReady = document.getElementById("shift-kpi-not-ready");
  const shiftKpiHandoffs = document.getElementById("shift-kpi-handoffs");
  const staffNameInput = document.getElementById("staffName");
  const staffRoleInput = document.getElementById("staffRole");
  const staffStationInput = document.getElementById("staffStation");
  const staffShiftStartInput = document.getElementById("staffShiftStart");
  const staffShiftEndInput = document.getElementById("staffShiftEnd");
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

  const mapApiInventoryItemToUiItem = (item = {}) => {
    const quantity = Number(item.quantity || 0);
    const totalCost = Number(item.total_cost || item.totalCost || 0);
    const costPerUnit = quantity > 0 ? totalCost / quantity : 0;

    return {
      id: item.id != null ? String(item.id) : Date.now().toString(),
      apiId: item.id,
      name: item.name || "",
      category: item.category || "other",
      quantity,
      unit: item.unit || "units",
      totalCost,
      storageArea: item.storage_area || item.storageArea || "Refrigerated",
      costPerUnit,
      cost: costPerUnit,
      stockValue: totalCost
    };
  };

  const mapUiInventoryItemToApiItem = (item = {}) => ({
    name: item.name || "",
    category: item.category || inferInventoryCategoryId(item),
    quantity: Number(item.quantity || 0),
    unit: item.unit || "units",
    total_cost: Number(item.totalCost || item.stockValue || 0),
    storage_area: item.storageArea || "Refrigerated"
  });

  const fetchInventoryFromApi = async () => {
    const response = await fetch(`${API_BASE_URL}/inventory`);

    if (!response.ok) {
      throw new Error("Failed to load inventory from API.");
    }

    const inventory = await response.json();
    const apiInventory = Array.isArray(inventory) ? inventory.map(mapApiInventoryItemToUiItem) : [];
    const localPrepInventory = getInventory().filter((item) => item.sourceType === "prepRecipe");
    saveInventory([...apiInventory, ...localPrepInventory]);
    return apiInventory;
  };

  const createInventoryItemInApi = async (item) => {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mapUiInventoryItemToApiItem(item))
    });

    if (!response.ok) {
      throw new Error("Failed to save inventory item to API.");
    }

    const result = await response.json();
    return mapApiInventoryItemToUiItem(result.item);
  };

  const updateInventoryItemInApi = async (itemId, item) => {
    if (!itemId) {
      throw new Error("Missing inventory item ID for update request.");
    }

    const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mapUiInventoryItemToApiItem(item))
    });

    if (!response.ok) {
      throw new Error("Failed to update inventory item in API.");
    }

    const result = await response.json();
    return mapApiInventoryItemToUiItem(result.item);
  };

  const deleteInventoryItemInApi = async (itemId) => {
    if (!itemId) {
      throw new Error("Missing inventory item ID for delete request.");
    }

    const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete inventory item from API.");
    }

    return response.json();
  };

  const notifySmartSetupDataChange = () => {
    window.dispatchEvent(new CustomEvent("beoflow:setup-updated"));
  };

  const saveEvents = (events) => {
    localStorage.setItem("beoflow_events", JSON.stringify(events));
    window.dispatchEvent(new CustomEvent("beoflow:events-updated"));
    notifySmartSetupDataChange();
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
    notifySmartSetupDataChange();
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
    notifySmartSetupDataChange();
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
    notifySmartSetupDataChange();
  };

  const SHIFT_READINESS_KEY = "beoflow_shift_readiness";
  const SHIFT_ASSIGNMENT_PRESETS_KEY = "beoflow_shift_assignment_presets";

  const getStaff = () => {
    try {
      return JSON.parse(localStorage.getItem(SHIFT_READINESS_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveStaff = (staff) => {
    localStorage.setItem(SHIFT_READINESS_KEY, JSON.stringify(staff));
  };

  const getAssignmentPresets = () => {
    try {
      return JSON.parse(localStorage.getItem(SHIFT_ASSIGNMENT_PRESETS_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveAssignmentPresets = (presets) => {
    localStorage.setItem(SHIFT_ASSIGNMENT_PRESETS_KEY, JSON.stringify(presets));
  };

  const SMART_SETUP_KEY = "beoflow_smart_setup";

  const smartSetupFlows = {
    inventory: {
      label: "Inventory First",
      subtitle: "Cost control and operations setup",
      tasks: [
        {
          key: "addInventory",
          label: "Add Inventory",
          description: "Create at least one inventory item with quantity and cost.",
          module: "inventory",
          isAutoComplete: () => getInventory().length > 0
        },
        {
          key: "createRecipe",
          label: "Create Recipe",
          description: "Build a production recipe from your item catalog.",
          module: "recipes",
          isAutoComplete: () => getRecipes().length > 0
        },
        {
          key: "buildMenu",
          label: "Build Menu",
          description: "Create a menu that includes one or more recipes.",
          module: "menus",
          isAutoComplete: () => getMenus().length > 0
        },
        {
          key: "createEvent",
          label: "Create Event",
          description: "Add an event and connect it to a menu.",
          module: "events",
          isAutoComplete: () => getEvents().length > 0
        },
        {
          key: "viewDashboard",
          label: "View Dashboard",
          description: "Review KPIs, events, calendar, and setup progress.",
          module: "dashboard",
          manualComplete: true,
          isAutoComplete: () => false
        }
      ]
    },
    recipe: {
      label: "Recipe First",
      subtitle: "Chef and menu creation setup",
      tasks: [
        {
          key: "createRecipe",
          label: "Create Recipe",
          description: "Start with a dish, prep item, or production recipe.",
          module: "recipes",
          isAutoComplete: () => getRecipes().length > 0
        },
        {
          key: "linkIngredients",
          label: "Link Ingredients to Inventory",
          description: "Attach inventory ingredients so recipe cost becomes real.",
          module: "recipes",
          isAutoComplete: () => getRecipes().some((recipe) => Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0)
        },
        {
          key: "buildMenu",
          label: "Build Menu",
          description: "Group recipes into a sellable menu.",
          module: "menus",
          isAutoComplete: () => getMenus().length > 0
        },
        {
          key: "createEvent",
          label: "Create Event",
          description: "Schedule an event and select its menu.",
          module: "events",
          isAutoComplete: () => getEvents().length > 0
        },
        {
          key: "viewDashboard",
          label: "View Dashboard",
          description: "Track setup progress and operational KPIs.",
          module: "dashboard",
          manualComplete: true,
          isAutoComplete: () => false
        }
      ]
    }
  };

  const getSmartSetupState = () => {
    try {
      const parsedState = JSON.parse(localStorage.getItem(SMART_SETUP_KEY)) || {};
      return {
        flow: parsedState.flow || "",
        completed: parsedState.completed || {}
      };
    } catch {
      return { flow: "", completed: {} };
    }
  };

  const saveSmartSetupState = (state) => {
    localStorage.setItem(SMART_SETUP_KEY, JSON.stringify(state));
  };

  const getSmartSetupTaskRawStatus = (task, state) =>
    Boolean((task.manualComplete && state.completed[task.key]) || task.isAutoComplete?.());

  const getSmartSetupProgress = (tasks, state) => {
    let completedCount = 0;

    for (const task of tasks) {
      if (!getSmartSetupTaskRawStatus(task, state)) break;
      completedCount += 1;
    }

    return {
      completedCount,
      currentIndex: completedCount < tasks.length ? completedCount : -1,
      currentTask: tasks[completedCount] || null,
      isComplete: completedCount === tasks.length
    };
  };

  const getSmartSetupTaskAccess = (tasks, state, taskKey) => {
    const taskIndex = tasks.findIndex((item) => item.key === taskKey);
    if (taskIndex === -1) return null;

    const progress = getSmartSetupProgress(tasks, state);

    return {
      task: tasks[taskIndex],
      taskIndex,
      progress,
      isComplete: taskIndex < progress.completedCount,
      isCurrent: taskIndex === progress.currentIndex,
      isLocked: progress.currentIndex !== -1 && taskIndex > progress.currentIndex
    };
  };

  const setSmartSetupNotice = (message = "") => {
    if (!smartSetupNotice) return;
    smartSetupNotice.textContent = message;
    smartSetupNotice.hidden = !message;
  };

  const showSmartSetupNotice = (message) => {
    setSmartSetupNotice(message);
  };

  const openSmartSetupPanel = () => {
    if (!smartSetupSection) return;
    smartSetupSection.hidden = false;
    smartSetupLauncher?.setAttribute("aria-expanded", "true");
    renderSmartSetup();
  };

  const closeSmartSetupPanel = () => {
    if (!smartSetupSection) return;
    smartSetupSection.hidden = true;
    smartSetupLauncher?.setAttribute("aria-expanded", "false");
  };

  const renderSmartSetup = () => {
    if (!smartSetupSection && !smartSetupLauncher) return;

    const state = getSmartSetupState();
    const flow = smartSetupFlows[state.flow];

    smartSetupSection?.querySelectorAll("[data-smart-flow]").forEach((button) => {
      const isSelected = button.dataset.smartFlow === state.flow;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    if (!flow) {
      if (smartSetupChecklist) smartSetupChecklist.hidden = true;
      if (smartSetupProgressLabel) smartSetupProgressLabel.textContent = "Select a path";
      if (smartSetupLauncherCount) smartSetupLauncherCount.textContent = "Select a path";
      if (smartSetupLauncherBar) smartSetupLauncherBar.style.width = "0%";
      return;
    }

    const tasks = flow.tasks;
    const progress = getSmartSetupProgress(tasks, state);
    const completedCount = progress.completedCount;
    const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    if (smartSetupChecklist) smartSetupChecklist.hidden = false;
    if (smartSetupFlowTitle) smartSetupFlowTitle.textContent = `${flow.label} checklist`;
    if (smartSetupFlowSubtitle) smartSetupFlowSubtitle.textContent = flow.subtitle;
    if (smartSetupProgressLabel) smartSetupProgressLabel.textContent = `${completedCount}/${tasks.length} completed`;
    if (smartSetupProgressCount) smartSetupProgressCount.textContent = `${completedCount}/${tasks.length} completed`;
    if (smartSetupProgressBar) smartSetupProgressBar.style.width = `${progressPercent}%`;
    if (smartSetupLauncherCount) {
      smartSetupLauncherCount.textContent = progress.currentTask
        ? `Next: ${progress.currentTask.label}`
        : "Setup complete";
    }
    if (smartSetupLauncherBar) smartSetupLauncherBar.style.width = `${progressPercent}%`;
    if (smartSetupWarning) smartSetupWarning.hidden = state.flow !== "recipe";
    setSmartSetupNotice(progress.currentTask
      ? `Next: ${progress.currentTask.label}. Complete this step before the next steps unlock.`
      : "Setup complete. Your core workflow is ready."
    );

    if (!smartSetupTaskList) return;

    smartSetupTaskList.innerHTML = tasks.map((task, index) => {
      const isComplete = index < completedCount;
      const isCurrent = index === progress.currentIndex;
      const isLocked = progress.currentIndex !== -1 && index > progress.currentIndex;
      const description = isLocked
        ? "Locked until the previous step is complete."
        : task.description;

      return `
        <div class="smart-setup-task ${isComplete ? "is-complete" : ""} ${isCurrent ? "is-current" : ""} ${isLocked ? "is-locked" : ""}">
          <button type="button" class="smart-setup-task-toggle" data-smart-task="${task.key}" aria-disabled="${isLocked}" ${isCurrent ? 'aria-current="step"' : ""}>
            <span class="smart-setup-task-check">${isComplete ? "✓" : ""}</span>
            <span>
              <span class="smart-setup-task-title">${task.label}</span>
              <span class="smart-setup-task-meta">${description}</span>
            </span>
          </button>
          <button type="button" class="smart-setup-task-action" data-smart-action="${task.key}" aria-disabled="${isLocked}">${isLocked ? "Locked" : "Open"}</button>
        </div>
      `;
    }).join("");
  };

  const selectSmartSetupFlow = (flowKey) => {
    const state = getSmartSetupState();
    saveSmartSetupState({
      ...state,
      flow: flowKey
    });
    renderSmartSetup();
  };

  const toggleSmartSetupTask = (taskKey) => {
    const state = getSmartSetupState();
    const flow = smartSetupFlows[state.flow];
    if (!flow) return;

    const access = getSmartSetupTaskAccess(flow.tasks, state, taskKey);
    if (!access) return;

    if (access.isLocked) {
      showSmartSetupNotice(`Complete ${access.progress.currentTask.label} first to unlock ${access.task.label}.`);
      return;
    }

    openSmartSetupTask(taskKey);
  };

  const openSmartSetupTask = (taskKey) => {
    const state = getSmartSetupState();
    const flow = smartSetupFlows[state.flow];
    const access = flow ? getSmartSetupTaskAccess(flow.tasks, state, taskKey) : null;
    const task = access?.task;
    if (!task?.module) return;

    if (access.isLocked) {
      openSmartSetupPanel();
      showSmartSetupNotice(`Complete ${access.progress.currentTask.label} first to unlock ${task.label}.`);
      return;
    }

    if (task.manualComplete && !access.isComplete) {
      saveSmartSetupState({
        ...state,
        completed: {
          ...state.completed,
          [task.key]: true
        }
      });
    }

    showModuleByKey(task.module);
    closeSmartSetupPanel();
    renderSmartSetup();
  };

  const openSmartSetupIfIncomplete = () => {
    const state = getSmartSetupState();
    const flow = smartSetupFlows[state.flow];

    if (!flow) {
      openSmartSetupPanel();
      return;
    }

    if (!getSmartSetupProgress(flow.tasks, state).isComplete) {
      openSmartSetupPanel();
    }
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
      title: "Shift Readiness",
      subtitle: "Assign kitchen stations and print the station sheet"
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
    if (topbarActions) topbarActions.hidden = !["dashboard", "events", "eventForm"].includes(moduleKey);
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
    const { scroll = false } = options;

    hideAllMainSections();
    activeModuleKey = moduleKey;
    updateTopbar(moduleKey);

    if (moduleKey === "dashboard") {
      showSection(dashboardSection, "grid");
      showSection(dashboardCalendarSection, "grid");
      setActiveNav(navDashboard);
      renderKpis();
      renderSmartSetup();
      window.renderDashboardCalendar?.();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "events") {
      activeEventFilter = options.eventFilter || null;
      showSection(eventsSection);
      setActiveNav(navEvents);
      renderEvents().then(renderKpis);
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "menus") {
      showSection(menusSection);
      setActiveNav(navMenus);
      populateMenuRecipeOptions();
      renderMenus();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "recipes") {
      showSection(recipesSection);
      setActiveNav(navRecipes);
      populateRecipeIngredientOptions();
      renderSelectedIngredients();
      renderRecipes();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "subRecipes") {
      showSection(subRecipesSection);
      setActiveNav(navSubRecipes);
      populateSubRecipeIngredientOptions();
      renderSelectedSubRecipeIngredients();
      renderSubRecipes();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "inventory") {
      showSection(inventorySection);
      setActiveNav(navInventory);
      renderInventory();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "production") {
      showSection(productionSection);
      setActiveNav(navProduction);
      renderProduction();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "staff") {
      showSection(staffSection);
      setActiveNav(navStaff);
      renderStaff();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
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
          deleteBtn.addEventListener("click", async () => {
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

            try {
              await deleteInventoryItemInApi(item.apiId || item.id);
            } catch (error) {
              console.warn("Inventory item deleted locally because API delete failed:", error);
            }

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

  const addInventoryItem = async () => {
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
    const inventoryItem = {
      id: editingInventoryItemId || Date.now().toString(),
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

    if (editingInventoryItemId) {
      const existingItem = inventory.find((item) => item.id === editingInventoryItemId) || {};
      let savedItem = {
        ...existingItem,
        ...inventoryItem,
        apiId: existingItem.apiId
      };

      try {
        savedItem = await updateInventoryItemInApi(existingItem.apiId || existingItem.id, savedItem);
      } catch (error) {
        console.warn("Inventory item updated locally because API update failed:", error);
      }

      const updatedInventory = inventory.map((item) => item.id === editingInventoryItemId ? savedItem : item);
      saveInventory(updatedInventory);
      editingInventoryItemId = null;
      if (addInventoryBtn) addInventoryBtn.textContent = "Add Inventory Item";
    } else {
      let savedItem = inventoryItem;

      try {
        savedItem = await createInventoryItemInApi(inventoryItem);
      } catch (error) {
        console.warn("Inventory item saved locally because API create failed:", error);
      }

      inventory.push(savedItem);
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
  const shiftStations = ["Flat Top", "Broiler/Grill", "Fry", "Pantry", "Prep", "Expo", "Line Support"];
  const shiftHandoffWindowMinutes = 60;
  const shiftDays = [
    { key: "mon", label: "Mon" },
    { key: "tue", label: "Tue" },
    { key: "wed", label: "Wed" },
    { key: "thu", label: "Thu" },
    { key: "fri", label: "Fri" },
    { key: "sat", label: "Sat" },
    { key: "sun", label: "Sun" }
  ];
  let activeShiftDay = "mon";

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const getShiftDayLabel = (dayKey = activeShiftDay) =>
    shiftDays.find((day) => day.key === dayKey)?.label || "Mon";

  const getPersonDayAssignment = (person = {}, dayKey = activeShiftDay) => {
    const dayAssignment = person.assignments?.[dayKey];
    if (dayAssignment) return dayAssignment;

    return {
      station: person.station || "Flat Top",
      shiftStart: person.shiftStart || "",
      shiftEnd: person.shiftEnd || ""
    };
  };

  const normalizePersonForDay = (person = {}, dayKey = activeShiftDay) => {
    const dayAssignment = getPersonDayAssignment(person, dayKey);

    return {
      ...person,
      station: dayAssignment.station || person.station || "Flat Top",
      shiftStart: dayAssignment.shiftStart || person.shiftStart || "",
      shiftEnd: dayAssignment.shiftEnd || person.shiftEnd || ""
    };
  };

  const getStaffForDay = (staff = getStaff(), dayKey = activeShiftDay) =>
    staff.map((person) => normalizePersonForDay(person, dayKey));

  const buildAssignmentsForAllDays = ({ station, shiftStart, shiftEnd }) =>
    shiftDays.reduce((assignments, day) => {
      assignments[day.key] = { station, shiftStart, shiftEnd };
      return assignments;
    }, {});

  const getHandoffKey = (station, outgoingId, incomingId, dayKey = activeShiftDay) =>
    `${dayKey}|${station}|${outgoingId}|${incomingId}`;

  const getHandoffAssignments = () => {
    try {
      return JSON.parse(localStorage.getItem("beoflow_shift_handoff_assignments")) || {};
    } catch {
      return {};
    }
  };

  const saveHandoffAssignments = (assignments) => {
    localStorage.setItem("beoflow_shift_handoff_assignments", JSON.stringify(assignments));
  };

  const timeToMinutes = (time = "") => {
    const [hours, minutes] = String(time).split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return hours * 60 + minutes;
  };

  const getShiftMinutes = (person = {}) => {
    const start = timeToMinutes(person.shiftStart);
    let end = timeToMinutes(person.shiftEnd);

    if (start == null || end == null) return null;
    if (end <= start) end += 24 * 60;

    return { start, end };
  };

  const isOvernightShift = (person = {}) => {
    const start = timeToMinutes(person.shiftStart);
    const end = timeToMinutes(person.shiftEnd);
    return start != null && end != null && end <= start;
  };

  const formatShiftTimeRange = (person = {}) => {
    const range = `${person.shiftStart || "--:--"} - ${person.shiftEnd || "--:--"}`;
    return isOvernightShift(person) ? `${range} (next day)` : range;
  };

  const renderStaffCard = (person) => {
    return `
      <article class="shift-employee-card" data-staff-id="${escapeHtml(person.id)}">
        <div class="shift-card-header">
          <div>
            <h4>${escapeHtml(person.name || "Unnamed employee")}</h4>
            <p>${escapeHtml(person.role || "Role not set")} · ${getShiftDayLabel(activeShiftDay)}</p>
          </div>
        </div>
        <div class="shift-time-row">
          <span>${escapeHtml(formatShiftTimeRange(person))}</span>
        </div>
        <div class="shift-card-times">
          <label>
            <span>Start</span>
            <input type="time" data-day-start value="${escapeHtml(person.shiftStart || "")}" />
          </label>
          <label>
            <span>End</span>
            <input type="time" data-day-end value="${escapeHtml(person.shiftEnd || "")}" />
          </label>
        </div>
        <label class="shift-card-station">
          <span>Station assignment</span>
          <select data-station-assignment>
            ${shiftStations
              .map((station) => `<option value="${escapeHtml(station)}" ${person.station === station ? "selected" : ""}>${escapeHtml(station)}</option>`)
              .join("")}
          </select>
        </label>
        <button type="button" class="secondary-btn shift-delete-btn" data-delete-staff="${escapeHtml(person.id)}">Delete employee</button>
      </article>
    `;
  };

  const formatDurationMinutes = (minutes) => {
    const absMinutes = Math.abs(minutes);
    if (absMinutes === 0) return "same time";
    if (absMinutes === 1) return "1 min";
    return `${absMinutes} min`;
  };

  const getStationHandoffs = (staff = [], station = "") => {
    const stationStaff = staff
      .filter((person) => person.station === station)
      .map((person) => ({
        person,
        shift: getShiftMinutes(person)
      }))
      .filter((item) => item.shift)
      .sort((a, b) => a.shift.start - b.shift.start);

    const handoffs = [];

    stationStaff.forEach((outgoing) => {
      stationStaff.forEach((incoming) => {
        if (outgoing.person.id === incoming.person.id) return;

        let startDelta = incoming.shift.start - outgoing.shift.end;
        if (startDelta < -12 * 60) startDelta += 24 * 60;
        if (startDelta > 12 * 60) startDelta -= 24 * 60;

        if (Math.abs(startDelta) <= shiftHandoffWindowMinutes) {
          handoffs.push({
            station,
            outgoing: outgoing.person,
            incoming: incoming.person,
            startDelta
          });
        }
      });
    });

    return handoffs;
  };

  const getAllStationHandoffs = (staff = []) =>
    shiftStations.flatMap((station) => getStationHandoffs(staff, station));

  const renderStationHandoffs = (handoffs = []) => {
    if (!handoffs.length) return "";

    return `
      <div class="shift-handoff-list">
        <h4>Shift change handoff</h4>
        ${handoffs
          .map((handoff) => {
            const timing = handoff.startDelta === 0
              ? "same time"
              : handoff.startDelta > 0
                ? `${formatDurationMinutes(handoff.startDelta)} after`
                : `${formatDurationMinutes(handoff.startDelta)} overlap`;

            return `
              <div class="shift-handoff-card">
                <strong>${escapeHtml(handoff.outgoing.name || "-")} fills station before leaving</strong>
                <span>${escapeHtml(handoff.incoming.name || "-")} verifies on arrival (${timing})</span>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  };

  const getStationCloseouts = (staff = [], station = "") => {
    const stationStaff = staff
      .filter((person) => person.station === station)
      .map((person) => ({
        person,
        shift: getShiftMinutes(person)
      }))
      .filter((item) => item.shift)
      .sort((a, b) => a.shift.end - b.shift.end);
    const stationHandoffs = getStationHandoffs(staff, station);

    return stationStaff.map(({ person }) => {
      const nextHandoff = stationHandoffs
        .filter((handoff) => handoff.outgoing.id === person.id)
        .sort((a, b) => Math.abs(a.startDelta) - Math.abs(b.startDelta))[0];

      return {
        station,
        person,
        verifyBy: nextHandoff?.incoming || null
      };
    });
  };

  const getAllStationCloseouts = (staff = []) =>
    shiftStations.flatMap((station) => getStationCloseouts(staff, station));

  const renderStationCloseouts = (closeouts = []) => {
    if (!closeouts.length) return "";

    return `
      <div class="shift-closeout-list">
        <h4>Clean + fill by schedule</h4>
        ${closeouts
          .map((closeout) => `
            <div class="shift-closeout-card">
              <strong>${escapeHtml(closeout.person.name || "-")} cleans and fills before ${escapeHtml(closeout.person.shiftEnd || "--:--")}</strong>
              <span>${closeout.verifyBy ? `${escapeHtml(closeout.verifyBy.name || "-")} verifies on arrival` : "No immediate next shift assigned"}</span>
            </div>
          `)
          .join("")}
      </div>
    `;
  };

  const renderStaff = () => {
    const staff = getStaffForDay();
    const assignedCount = staff.filter((person) => shiftStations.includes(person.station)).length;
    const openStationsCount = shiftStations.filter((station) => !staff.some((person) => person.station === station)).length;
    const handoffs = getAllStationHandoffs(staff);

    if (shiftKpiEmployees) shiftKpiEmployees.textContent = staff.length;
    if (shiftKpiReady) shiftKpiReady.textContent = assignedCount;
    if (shiftKpiNotReady) shiftKpiNotReady.textContent = openStationsCount;
    if (shiftKpiHandoffs) shiftKpiHandoffs.textContent = handoffs.length;
    if (!shiftReadinessBoard) return;

    shiftReadinessBoard.innerHTML = shiftStations
      .map((station) => {
        const stationStaff = staff.filter((person) => person.station === station);
        const stationHandoffs = getStationHandoffs(staff, station);
        const stationCloseouts = getStationCloseouts(staff, station);
        const stationCards = stationStaff.length
          ? stationStaff.map(renderStaffCard).join("")
          : '<div class="shift-empty-state">No employees assigned.</div>';

        return `
          <section class="shift-station-column">
            <div class="shift-station-header">
              <h3>${station}</h3>
              <span>${stationStaff.length}</span>
            </div>
            <div class="shift-station-cards">
              ${stationCards}
            </div>
            ${renderStationCloseouts(stationCloseouts)}
            ${renderStationHandoffs(stationHandoffs)}
          </section>
        `;
      })
      .join("");
  };

  const addStaff = () => {
    const name = staffNameInput ? staffNameInput.value.trim() : "";
    const role = staffRoleInput ? staffRoleInput.value : "Chef";
    const station = staffStationInput ? staffStationInput.value : "Flat Top";
    const shiftStart = staffShiftStartInput ? staffShiftStartInput.value : "";
    const shiftEnd = staffShiftEndInput ? staffShiftEndInput.value : "";

    if (!name) {
      alert("Enter employee name.");
      return;
    }

    if (!shiftStart || !shiftEnd) {
      alert("Enter shift start and shift end.");
      return;
    }

    const staff = getStaff();

    staff.push({
      id: Date.now().toString(),
      name,
      role,
      station,
      originalStation: station,
      shiftStart,
      shiftEnd,
      assignments: buildAssignmentsForAllDays({ station, shiftStart, shiftEnd })
    });

    saveStaff(staff);
    renderStaff();

    if (staffNameInput) staffNameInput.value = "";
    if (staffRoleInput) staffRoleInput.value = "Chef";
    if (staffStationInput) staffStationInput.value = "Flat Top";
    if (staffShiftStartInput) staffShiftStartInput.value = "";
    if (staffShiftEndInput) staffShiftEndInput.value = "";
  };

  const updateStaffStation = (staffId, station) => {
    if (!shiftStations.includes(station)) return;

    const staff = getStaff();
    const updatedStaff = staff.map((person) => {
      if (person.id !== staffId) return person;
      const currentAssignment = getPersonDayAssignment(person, activeShiftDay);
      return {
        ...person,
        station,
        originalStation: person.originalStation || station,
        assignments: {
          ...person.assignments,
          [activeShiftDay]: {
            ...currentAssignment,
            station
          }
        }
      };
    });

    saveStaff(updatedStaff);
    renderStaff();
    setScheduleImportStatus("Station assignment updated.", "success");
  };

  const updateStaffDayTime = (staffId, field, value) => {
    if (!["shiftStart", "shiftEnd"].includes(field)) return;

    const staff = getStaff();
    const updatedStaff = staff.map((person) => {
      if (person.id !== staffId) return person;
      const currentAssignment = getPersonDayAssignment(person, activeShiftDay);
      return {
        ...person,
        [field]: value,
        assignments: {
          ...person.assignments,
          [activeShiftDay]: {
            ...currentAssignment,
            [field]: value
          }
        }
      };
    });

    saveStaff(updatedStaff);
    renderStaff();
    setScheduleImportStatus(`${getShiftDayLabel(activeShiftDay)} shift time updated.`, "success");
  };

  const deleteStaff = (staffId) => {
    saveStaff(getStaff().filter((person) => person.id !== staffId));
    renderStaff();
  };

  const getStationCombinationCount = (employeeCount) => {
    if (!employeeCount) return "0";

    const combinations = BigInt(shiftStations.length) ** BigInt(employeeCount);
    return combinations.toLocaleString("en-US");
  };

  const setScheduleImportStatus = (message, type = "info") => {
    if (!scheduleImportStatus) return;
    scheduleImportStatus.textContent = message;
    scheduleImportStatus.dataset.type = type;
    scheduleImportStatus.hidden = !message;
  };

  const getBalancedRandomStation = (staff = []) => {
    const stationCounts = shiftStations.reduce((counts, station) => {
      counts[station] = staff.filter((person) => person.station === station).length;
      return counts;
    }, {});
    const lowestCount = Math.min(...Object.values(stationCounts));
    const availableStations = shiftStations.filter((station) => stationCounts[station] === lowestCount);
    return availableStations[Math.floor(Math.random() * availableStations.length)] || "Line Support";
  };

  const normalizeImportedEmployee = (employee = {}, existingStaff = []) => {
    const name = String(employee.name || "").trim();
    if (!name) return null;
    const station = shiftStations.includes(employee.station) ? employee.station : getBalancedRandomStation(existingStaff);

    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      role: employee.role || "Line Cook",
      station,
      originalStation: station,
      shiftStart: employee.shiftStart || "",
      shiftEnd: employee.shiftEnd || "",
      assignments: buildAssignmentsForAllDays({
        station,
        shiftStart: employee.shiftStart || "",
        shiftEnd: employee.shiftEnd || ""
      }),
      sourceLabel: employee.sourceLabel || "Imported schedule"
    };
  };

  const getImageMimeType = (file) => {
    if (file?.type) return file.type;

    const filename = String(file?.name || "").toLowerCase();
    if (filename.endsWith(".heic")) return "image/heic";
    if (filename.endsWith(".heif")) return "image/heif";
    if (filename.endsWith(".png")) return "image/png";
    if (filename.endsWith(".webp")) return "image/webp";
    if (filename.endsWith(".gif")) return "image/gif";
    return "image/jpeg";
  };

  const importScheduleImage = async (file) => {
    if (!file) return;

    setScheduleImportStatus(`Reading ${file.name}...`, "info");
    if (importScheduleBtn) importScheduleBtn.disabled = true;

    try {
      const imageBase64 = await fileToBase64(file);
      const response = await fetch(`${API_BASE_URL}/api/extract-shift-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: getImageMimeType(file)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Schedule image could not be read.");
      }

      const staff = getStaff();
      const importedStaff = (result.employees || []).reduce((items, employee) => {
        const normalizedEmployee = normalizeImportedEmployee(employee, [...staff, ...items]);
        if (normalizedEmployee && normalizedEmployee.shiftStart && normalizedEmployee.shiftEnd) {
          items.push(normalizedEmployee);
        }
        return items;
      }, []);

      if (!importedStaff.length) {
        setScheduleImportStatus("No readable working shifts were found. Try a clearer photo or crop around the schedule grid.", "warning");
        return;
      }

      saveStaff([...staff, ...importedStaff]);
      renderStaff();

      const notes = Array.isArray(result.notes) && result.notes.length ? ` ${result.notes.slice(0, 2).join(" ")}` : "";
      setScheduleImportStatus(`Imported ${importedStaff.length} employees from the schedule.${notes}`, "success");
    } catch (error) {
      console.error(error);
      const message = error instanceof TypeError && error.message === "Failed to fetch"
        ? "Backend is not running. Start it with `node server.js`, then try importing the schedule again."
        : error.message || "Schedule image could not be read.";
      setScheduleImportStatus(message, "error");
    } finally {
      if (importScheduleBtn) importScheduleBtn.disabled = false;
      if (scheduleImageInput) scheduleImageInput.value = "";
    }
  };

  const autoAssignStaffStations = () => {
    const staff = getStaff();
    if (!staff.length) {
      setScheduleImportStatus("There are no employees to assign yet.", "warning");
      return;
    }

    const assignedStaff = staff.map((person) => {
      const currentAssignment = getPersonDayAssignment(person, activeShiftDay);
      const station = shiftStations[Math.floor(Math.random() * shiftStations.length)];

      return {
        ...person,
        originalStation: person.originalStation || currentAssignment.station || "Line Support",
        station,
        assignments: {
          ...person.assignments,
          [activeShiftDay]: {
            ...currentAssignment,
            station
          }
        }
      };
    });

    saveStaff(assignedStaff);
    renderStaff();
    setScheduleImportStatus(
      `New ${getShiftDayLabel(activeShiftDay)} random station assignment created. Repeats are allowed. Possible combinations: ${getStationCombinationCount(staff.length)}.`,
      "success"
    );
  };

  const resetOriginalStaffStations = () => {
    const staff = getStaff();
    if (!staff.length) {
      setScheduleImportStatus("There are no employees to reset.", "warning");
      return;
    }

    const resetStaff = staff.map((person) => {
      const currentAssignment = getPersonDayAssignment(person, activeShiftDay);
      const station = person.originalStation || currentAssignment.station || "Line Support";

      return {
        ...person,
        station,
        assignments: {
          ...person.assignments,
          [activeShiftDay]: {
            ...currentAssignment,
            station
          }
        }
      };
    });

    saveStaff(resetStaff);
    renderStaff();
    setScheduleImportStatus("Stations restored to the original imported/manual assignment.", "success");
  };

  const clearShiftReadiness = () => {
    saveStaff([]);
    renderStaff();
    setScheduleImportStatus("Shift Readiness table cleared.", "success");
  };

  const renderAssignmentPresets = () => {
    if (!assignmentPresetsList) return;

    const presets = getAssignmentPresets();

    if (!presets.length) {
      assignmentPresetsList.innerHTML = '<div class="assignment-preset-empty">No saved assignments yet.</div>';
      return;
    }

    assignmentPresetsList.innerHTML = presets
      .map((preset) => {
        const createdAt = preset.createdAt
          ? new Date(preset.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
          : "Saved";

        return `
          <article class="assignment-preset-card">
            <div>
              <h4>${escapeHtml(preset.name || "Saved assignment")}</h4>
              <p>${escapeHtml(createdAt)} · ${Array.isArray(preset.staff) ? preset.staff.length : 0} employees${preset.appliesTo ? ` · ${escapeHtml(preset.appliesTo)}` : ""}</p>
            </div>
            <div class="assignment-preset-actions">
              <button type="button" class="secondary-btn" data-load-preset="${escapeHtml(preset.id)}">Load</button>
              <button type="button" class="secondary-btn" data-print-preset="${escapeHtml(preset.id)}">Print</button>
              <button type="button" class="secondary-btn preset-delete-btn" data-delete-preset="${escapeHtml(preset.id)}">Delete</button>
            </div>
          </article>
        `;
      })
      .join("");
  };

  const saveCurrentAssignmentPreset = () => {
    const staff = getStaff();
    if (!staff.length) {
      setScheduleImportStatus("Add or import employees before saving an assignment.", "warning");
      return;
    }

    const presets = getAssignmentPresets();
    const name = assignmentPresetNameInput?.value.trim() || `Assignment ${presets.length + 1}`;
    const appliesTo = assignmentPresetAppliesToInput?.value.trim() || "";
    const preset = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      appliesTo,
      createdAt: new Date().toISOString(),
      staff: staff.map((person) => ({ ...person }))
    };

    saveAssignmentPresets([preset, ...presets]);
    if (assignmentPresetNameInput) assignmentPresetNameInput.value = "";
    if (assignmentPresetAppliesToInput) assignmentPresetAppliesToInput.value = "";
    renderAssignmentPresets();
    setScheduleImportStatus(`Saved assignment "${name}".`, "success");
  };

  const loadAssignmentPreset = (presetId) => {
    const preset = getAssignmentPresets().find((item) => item.id === presetId);
    if (!preset || !Array.isArray(preset.staff)) return;

    saveStaff(preset.staff.map((person) => ({ ...person })));
    renderStaff();
    setScheduleImportStatus(`Loaded assignment "${preset.name || "Saved assignment"}"${preset.appliesTo ? ` for ${preset.appliesTo}` : ""}.`, "success");
  };

  const printAssignmentPreset = (presetId) => {
    const preset = getAssignmentPresets().find((item) => item.id === presetId);
    if (!preset || !Array.isArray(preset.staff)) return;

    openAssignmentPrintWindow(preset.staff, preset.name || "Saved assignment", preset.appliesTo || "");
  };

  const deleteAssignmentPreset = (presetId) => {
    const presets = getAssignmentPresets();
    const preset = presets.find((item) => item.id === presetId);
    saveAssignmentPresets(presets.filter((item) => item.id !== presetId));
    renderAssignmentPresets();
    setScheduleImportStatus(`Deleted assignment "${preset?.name || "Saved assignment"}".`, "success");
  };

  const setActiveShiftDay = (dayKey) => {
    if (!shiftDays.some((day) => day.key === dayKey)) return;

    activeShiftDay = dayKey;
    shiftDayTabs.forEach((tab) => {
      const isActive = tab.dataset.shiftDay === activeShiftDay;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    renderStaff();
    setScheduleImportStatus(`Showing ${getShiftDayLabel(activeShiftDay)} assignments.`, "info");
  };

  const buildAssignmentPrintMarkup = (staff = [], title = "Kitchen Station Assignments", appliesTo = "") => {
    const generatedAt = new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
    const printStaff = getStaffForDay(staff, activeShiftDay);
    const handoffs = getAllStationHandoffs(printStaff);
    const closeouts = getAllStationCloseouts(printStaff);

    const stationSections = shiftStations
      .map((station) => {
        const stationStaff = printStaff.filter((person) => person.station === station);
        const rows = stationStaff.length
          ? stationStaff
              .map(
                (person) => `
                  <tr>
                    <td>${escapeHtml(person.name || "-")}</td>
                    <td>${escapeHtml(person.role || "-")}</td>
                    <td>${escapeHtml(formatShiftTimeRange(person))}</td>
                  </tr>
                `
              )
              .join("")
          : '<tr><td colspan="3" class="empty">No one assigned</td></tr>';

        return `
          <section>
            <h2>${escapeHtml(station)}</h2>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Shift</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </section>
        `;
      })
      .join("");

    const handoffRows = handoffs.length
      ? handoffs
          .map((handoff) => {
            const timing = handoff.startDelta === 0
              ? "Same time"
              : handoff.startDelta > 0
                ? `${formatDurationMinutes(handoff.startDelta)} after`
                : `${formatDurationMinutes(handoff.startDelta)} overlap`;

            return `
              <tr>
                <td>${escapeHtml(handoff.station)}</td>
                <td>${escapeHtml(handoff.outgoing.name || "-")}</td>
                <td>${escapeHtml(handoff.incoming.name || "-")}</td>
                <td>${timing}</td>
              </tr>
            `;
          })
          .join("")
      : '<tr><td colspan="4" class="empty">No shift handoffs within 60 minutes.</td></tr>';

    const closeoutRows = closeouts.length
      ? closeouts
          .map((closeout) => `
            <tr>
              <td>${escapeHtml(closeout.station)}</td>
              <td>${escapeHtml(closeout.person.name || "-")}</td>
              <td>${escapeHtml(closeout.person.shiftEnd || "--:--")}</td>
              <td>${closeout.verifyBy ? `${escapeHtml(closeout.verifyBy.name || "-")} verifies on arrival` : "No immediate next shift assigned"}</td>
            </tr>
          `)
          .join("")
      : '<tr><td colspan="4" class="empty">No clean/fill responsibilities for this day.</td></tr>';

    return `
      <div id="assignment-print-sheet" class="assignment-print-sheet">
        <header>
          <div class="brand">
            <img src="img/logobeoflow.png" alt="Bastida Systems logo" />
            <div>
            <h1>${escapeHtml(title)}</h1>
              <p>BEOFlow Shift Readiness · Bastida Systems · ${getShiftDayLabel(activeShiftDay)}${appliesTo ? ` · ${escapeHtml(appliesTo)}` : ""}</p>
            </div>
          </div>
          <div class="meta">
            <strong>${staff.length}</strong> employees<br />
            Generated ${escapeHtml(generatedAt)}
          </div>
        </header>
        <section class="handoff-summary">
          <h2>Clean + Fill By Schedule</h2>
          <table>
            <thead>
              <tr>
                <th>Station</th>
                <th>Employee cleans + fills</th>
                <th>Before</th>
                <th>Next check</th>
              </tr>
            </thead>
            <tbody>${closeoutRows}</tbody>
          </table>
        </section>
        <section class="handoff-summary">
          <h2>Shift Change Handoffs</h2>
          <table>
            <thead>
              <tr>
                <th>Station</th>
                <th>Leaving fills station</th>
                <th>Arriving verifies station</th>
                <th>Timing</th>
              </tr>
            </thead>
            <tbody>${handoffRows}</tbody>
          </table>
        </section>
        <main class="grid">${stationSections}</main>
      </div>
    `;
  };

  const openAssignmentPrintWindow = (staff = [], title = "Kitchen Station Assignments", appliesTo = "") => {
    document.getElementById("assignment-print-root")?.remove();

    const printRoot = document.createElement("div");
    printRoot.id = "assignment-print-root";
    printRoot.innerHTML = buildAssignmentPrintMarkup(staff, title, appliesTo);
    document.body.appendChild(printRoot);

    setScheduleImportStatus("Opening print dialog. Choose Print or Save as PDF.", "success");
    requestAnimationFrame(() => {
      window.print();
    });
    return true;
  };

  const printAssignmentSheet = () => {
    const staff = getStaff();
    if (!staff.length) {
      setScheduleImportStatus("Add or import employees before printing the assignment sheet.", "warning");
      return;
    }

    openAssignmentPrintWindow(staff);
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

  if (smartSetupSection) {
    smartSetupSection.addEventListener("click", (e) => {
      const flowButton = e.target.closest("[data-smart-flow]");
      if (flowButton) {
        selectSmartSetupFlow(flowButton.dataset.smartFlow);
        return;
      }

      const actionButton = e.target.closest("[data-smart-action]");
      if (actionButton) {
        openSmartSetupTask(actionButton.dataset.smartAction);
        return;
      }

      const taskButton = e.target.closest("[data-smart-task]");
      if (taskButton) {
        toggleSmartSetupTask(taskButton.dataset.smartTask);
      }
    });
  }

  if (smartSetupLauncher) {
    smartSetupLauncher.addEventListener("click", () => {
      if (smartSetupSection?.hidden) {
        openSmartSetupPanel();
      } else {
        closeSmartSetupPanel();
      }
    });
  }

  if (smartSetupCloseBtn) {
    smartSetupCloseBtn.addEventListener("click", closeSmartSetupPanel);
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

  shiftDayTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveShiftDay(tab.dataset.shiftDay);
    });
  });

  if (importScheduleBtn && scheduleImageInput) {
    importScheduleBtn.addEventListener("click", () => {
      scheduleImageInput.click();
    });

    scheduleImageInput.addEventListener("change", () => {
      importScheduleImage(scheduleImageInput.files?.[0]);
    });
  }

  if (autoAssignStationsBtn) {
    autoAssignStationsBtn.addEventListener("click", autoAssignStaffStations);
  }

  if (resetOriginalStationsBtn) {
    resetOriginalStationsBtn.addEventListener("click", resetOriginalStaffStations);
  }

  if (printAssignmentsBtn) {
    printAssignmentsBtn.addEventListener("click", printAssignmentSheet);
  }

  if (saveAssignmentPresetBtn) {
    saveAssignmentPresetBtn.addEventListener("click", saveCurrentAssignmentPreset);
  }

  if (assignmentPresetNameInput) {
    assignmentPresetNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveCurrentAssignmentPreset();
      }
    });
  }

  if (assignmentPresetAppliesToInput) {
    assignmentPresetAppliesToInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveCurrentAssignmentPreset();
      }
    });
  }

  if (assignmentPresetsList) {
    assignmentPresetsList.addEventListener("click", (e) => {
      const loadButton = e.target.closest("[data-load-preset]");
      if (loadButton) {
        loadAssignmentPreset(loadButton.dataset.loadPreset);
        return;
      }

      const printButton = e.target.closest("[data-print-preset]");
      if (printButton) {
        printAssignmentPreset(printButton.dataset.printPreset);
        return;
      }

      const deleteButton = e.target.closest("[data-delete-preset]");
      if (deleteButton) {
        deleteAssignmentPreset(deleteButton.dataset.deletePreset);
      }
    });
  }

  if (clearShiftReadinessBtn) {
    clearShiftReadinessBtn.addEventListener("click", clearShiftReadiness);
  }

  if (shiftReadinessBoard) {
    shiftReadinessBoard.addEventListener("change", (e) => {
      const startInput = e.target.closest("[data-day-start]");
      if (startInput) {
        const card = startInput.closest("[data-staff-id]");
        if (!card) return;

        updateStaffDayTime(card.dataset.staffId, "shiftStart", startInput.value);
        return;
      }

      const endInput = e.target.closest("[data-day-end]");
      if (endInput) {
        const card = endInput.closest("[data-staff-id]");
        if (!card) return;

        updateStaffDayTime(card.dataset.staffId, "shiftEnd", endInput.value);
        return;
      }

      const stationSelect = e.target.closest("[data-station-assignment]");
      if (stationSelect) {
        const card = stationSelect.closest("[data-staff-id]");
        if (!card) return;

        updateStaffStation(card.dataset.staffId, stationSelect.value);
      }
    });

    shiftReadinessBoard.addEventListener("click", (e) => {
      const deleteButton = e.target.closest("[data-delete-staff]");
      if (!deleteButton) return;

      deleteStaff(deleteButton.dataset.deleteStaff);
    });
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

  window.addEventListener("beoflow:setup-updated", renderSmartSetup);

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
  fetchInventoryFromApi()
    .catch((error) => {
      console.warn("Using local inventory because API is unavailable:", error);
    })
    .finally(renderInventory);
  renderStaff();
  renderAssignmentPresets();
  setInterval(renderStaff, 60000);
  renderProduction();
  renderSmartSetup();
  openSmartSetupIfIncomplete();
});
