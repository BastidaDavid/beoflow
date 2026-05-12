document.addEventListener("DOMContentLoaded", async () => {
  const createBtn = document.getElementById("create-event-btn");
  const cancelEventBtn = document.getElementById("cancel-event-btn");
  const createEventSection = document.getElementById("create-event-section");
  const form = document.querySelector(".event-form");
  const tableBody = document.getElementById("events-table-body");
  const editingEventIndex = document.getElementById("editing-event-index");
  const uploadBtn = document.getElementById("upload-event-btn");
  const eventImageInput = document.getElementById("eventImage");
  const uploadStatus = document.getElementById("upload-status");
  const API_BASE_URL = window.BEOFLOW_API_BASE_URL ||
    (window.location.protocol === "http:" || window.location.protocol === "https:"
      ? window.location.origin
      : "https://beoflow-api.onrender.com");
  const AUTH_TOKEN_KEY = "beoflow_auth_token";
  const AUTH_CLIENT_KEY = "beoflow_auth_client";
  const BASTIDA_LOGO_SRC = "/img/logo_bastida_sys.png";
  const BEOFLOW_LOGO_SRC = "/img/logobeoflow.png";
  const WESTGATE_MODE_KEY = "beoflow_westgate_mode";
  const BASTIDA_MODE_KEY = "beoflow_bastida_mode";
  const BASTIDA_CEO_MODE = "ceo";
  const WESTGATE_MODE_MODULES = {
    banquets: new Set(["dashboard", "events", "menus", "recipes", "subRecipes", "inventory", "production", "staff", "reports", "eventForm"]),
    pizzaMkt: new Set(["restaurants", "orders", "kitchen"])
  };
  const WESTGATE_DEFAULT_MODULES = {
    banquets: "dashboard",
    pizzaMkt: "restaurants"
  };
  const CLIENT_DATA_KEYS = [
    "beoflow_events",
    "beoflow_event_menu_links",
    "beoflow_menus",
    "beoflow_recipes",
    "beoflow_sub_recipes",
    "beoflow_inventory",
    "beoflow_shift_readiness",
    "beoflow_shift_assignment_presets",
    "beoflow_reports_feedback",
    "beoflow_smart_setup",
    "beoflow_shift_handoff_assignments",
    "beoflow_restaurants",
    "beoflow_orders",
    "beoflow_kitchen_stations"
  ];
  const CLIENT_DATA_KEY_SET = new Set(CLIENT_DATA_KEYS);
  const loginScreen = document.getElementById("login-screen");
  const westgateModeScreen = document.getElementById("westgate-mode-screen");
  const bastidaModeScreen = document.getElementById("bastida-mode-screen");
  const appContainer = document.querySelector(".app-container");
  const appBrandLogo = document.getElementById("app-brand-logo");
  const appBrandTitle = document.getElementById("app-brand-title");
  const appBrandSubtitle = document.getElementById("app-brand-subtitle");
  const loginForm = document.getElementById("client-login-form");
  const loginClientCodeInput = document.getElementById("loginClientCode");
  const loginPasswordInput = document.getElementById("loginPassword");
  const loginStatus = document.getElementById("login-status");
  const logoutBtn = document.getElementById("logout-btn");
  const westgateModeLogoutBtn = document.getElementById("westgate-mode-logout");
  const bastidaModeLogoutBtn = document.getElementById("bastida-mode-logout");
  const syncTimers = new Map();
  let authToken = localStorage.getItem(AUTH_TOKEN_KEY) || "";
  const readStoredClient = () => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_CLIENT_KEY) || "null") || {};
    } catch {
      return {};
    }
  };
  const readTokenClient = () => {
    try {
      const payload = String(authToken).split(".")[1];
      if (!payload) return {};
      const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
      const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");
      return JSON.parse(atob(paddedPayload)) || {};
    } catch {
      return {};
    }
  };
  const currentClient = readStoredClient();
  const currentClientCode = currentClient.clientCode || readTokenClient().clientCode || "";
  const isWestgateClient = String(currentClientCode).trim().toLowerCase() === "westgate";
  const isBastidaClient = String(currentClientCode).trim().toLowerCase() === "bastida01";
  let westgateMode = isWestgateClient ? localStorage.getItem(WESTGATE_MODE_KEY) || "" : "";
  let bastidaMode = isBastidaClient ? localStorage.getItem(BASTIDA_MODE_KEY) || "" : "";
  const isKnownWestgateMode = (mode) => Boolean(WESTGATE_MODE_MODULES[mode]);
  const needsWestgateModeSelection = () => isWestgateClient && !isKnownWestgateMode(westgateMode);
  const needsBastidaModeSelection = () => isBastidaClient && bastidaMode !== BASTIDA_CEO_MODE;
  const needsClientModeSelection = () => needsWestgateModeSelection() || needsBastidaModeSelection();
  const canUseSmartSetup = () => !isBastidaClient && (!isWestgateClient || westgateMode === "banquets");
  const applyClientBranding = () => {
    appContainer?.classList.toggle("is-westgate", isWestgateClient);
    appContainer?.classList.toggle("is-bastida", isBastidaClient);

    if (isWestgateClient) {
      if (appBrandLogo) {
        appBrandLogo.src = BEOFLOW_LOGO_SRC;
        appBrandLogo.alt = "BEOFlow Logo";
      }
      if (appBrandTitle) appBrandTitle.textContent = "Beoflow";
      if (appBrandSubtitle) appBrandSubtitle.textContent = "Westgate";
      return;
    }

    if (isBastidaClient) {
      if (appBrandLogo) {
        appBrandLogo.src = BASTIDA_LOGO_SRC;
        appBrandLogo.alt = "Bastida Systems Logo";
      }
      if (appBrandTitle) appBrandTitle.textContent = "Bastida Systems";
      if (appBrandSubtitle) appBrandSubtitle.textContent = "Cerebro CEO";
      return;
    }

    if (appBrandLogo) {
      appBrandLogo.src = BEOFLOW_LOGO_SRC;
      appBrandLogo.alt = "BEOFlow Logo";
    }
    if (appBrandTitle) appBrandTitle.textContent = "Beoflow";
    if (appBrandSubtitle) appBrandSubtitle.textContent = "Bastida Systems";
  };

  const getAuthHeaders = (headers = {}) => ({
    ...headers,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
  });

  const showLogin = (message = "") => {
    if (appContainer) appContainer.hidden = true;
    if (westgateModeScreen) westgateModeScreen.hidden = true;
    if (bastidaModeScreen) bastidaModeScreen.hidden = true;
    if (loginScreen) loginScreen.hidden = false;
    if (loginStatus) loginStatus.textContent = message;
    loginClientCodeInput?.focus();
  };

  const showApp = () => {
    applyClientBranding();
    if (loginScreen) loginScreen.hidden = true;
    if (westgateModeScreen) westgateModeScreen.hidden = true;
    if (bastidaModeScreen) bastidaModeScreen.hidden = true;
    if (appContainer) appContainer.hidden = false;
  };

  const showWestgateModeScreen = () => {
    if (loginScreen) loginScreen.hidden = true;
    if (appContainer) appContainer.hidden = true;
    if (bastidaModeScreen) bastidaModeScreen.hidden = true;
    if (westgateModeScreen) westgateModeScreen.hidden = false;
  };

  const showBastidaModeScreen = () => {
    if (loginScreen) loginScreen.hidden = true;
    if (appContainer) appContainer.hidden = true;
    if (westgateModeScreen) westgateModeScreen.hidden = true;
    if (bastidaModeScreen) bastidaModeScreen.hidden = false;
  };

  const readClientDataSnapshot = () =>
    CLIENT_DATA_KEYS.reduce((snapshot, key) => {
      try {
        snapshot[key] = JSON.parse(localStorage.getItem(key) || "null");
      } catch {
        snapshot[key] = null;
      }
      return snapshot;
    }, {});

  const saveClientDataNow = async (data) => {
    if (!authToken) return;

    await fetch(`${API_BASE_URL}/api/client-data`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ data })
    });
  };

  const hydrateClientData = async () => {
    const localSnapshot = readClientDataSnapshot();
    const response = await fetch(`${API_BASE_URL}/api/client-data`, {
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_CLIENT_KEY);
      authToken = "";
      throw new Error("Session expired. Sign in again.");
    }

    if (!response.ok) {
      throw new Error("Client data could not be loaded.");
    }

    const result = await response.json();
    const remoteData = result.data || {};
    const hasRemoteData = Object.keys(remoteData).length > 0;

    if (!hasRemoteData) {
      await saveClientDataNow(localSnapshot);
      return;
    }

    Object.entries(remoteData).forEach(([key, value]) => {
      if (!CLIENT_DATA_KEY_SET.has(key)) return;
      localStorage.setItem(key, JSON.stringify(value));
    });
  };

  const syncClientDataKey = (key, value) => {
    if (!authToken || !CLIENT_DATA_KEY_SET.has(key)) return;

    if (syncTimers.has(key)) clearTimeout(syncTimers.get(key));
    syncTimers.set(
      key,
      setTimeout(async () => {
        try {
          await fetch(`${API_BASE_URL}/api/client-data/${encodeURIComponent(key)}`, {
            method: "PUT",
            headers: getAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ value })
          });
        } catch (error) {
          console.warn(`Could not sync ${key}:`, error);
        }
      }, 300)
    );
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loginStatus) loginStatus.textContent = "Signing in...";

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientCode: loginClientCodeInput?.value.trim(),
          password: loginPasswordInput?.value || ""
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Client or password is incorrect.");
      }

      authToken = result.token;
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
      localStorage.setItem(AUTH_CLIENT_KEY, JSON.stringify(result.client || {}));
      window.location.reload();
    } catch (error) {
      if (loginStatus) loginStatus.textContent = error.message || "Sign in failed.";
      if (loginPasswordInput) loginPasswordInput.value = "";
      loginPasswordInput?.focus();
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CLIENT_KEY);
    localStorage.removeItem(WESTGATE_MODE_KEY);
    localStorage.removeItem(BASTIDA_MODE_KEY);
    window.location.reload();
  };

  loginForm?.addEventListener("submit", handleLogin);
  logoutBtn?.addEventListener("click", logout);

  if (!authToken) {
    showLogin();
    return;
  }

  try {
    await hydrateClientData();
  } catch (error) {
    console.warn(error);
    showLogin(error.message || "Sign in again.");
    return;
  }

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
  const navRestaurants = document.getElementById("nav-restaurants");
  const navOrders = document.getElementById("nav-orders");
  const navKitchen = document.getElementById("nav-kitchen");
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
  const restaurantsSection = document.getElementById("restaurants-section");
  const ordersSection = document.getElementById("orders-section");
  const kitchenSection = document.getElementById("kitchen-section");
  const restaurantsStatus = document.getElementById("restaurants-status");
  const ordersStatus = document.getElementById("orders-status");
  const kitchenStatus = document.getElementById("kitchen-status");
  const restaurantsTableBody = document.getElementById("restaurants-table-body");
  const restaurantNameInput = document.getElementById("restaurantName");
  const restaurantCategoryInput = document.getElementById("restaurantCategory");
  const restaurantLocationInput = document.getElementById("restaurantLocation");
  const restaurantActiveStatusInput = document.getElementById("restaurantActiveStatus");
  const addRestaurantBtn = document.getElementById("add-restaurant-btn");
  const refreshRestaurantsBtn = document.getElementById("refresh-restaurants-btn");
  const ordersRestaurantFilter = document.getElementById("ordersRestaurantFilter");
  const ordersStatusFilter = document.getElementById("ordersStatusFilter");
  const refreshOrdersBtn = document.getElementById("refresh-orders-btn");
  const orderRestaurantInput = document.getElementById("orderRestaurant");
  const orderTypeInput = document.getElementById("orderType");
  const orderTableInput = document.getElementById("orderTable");
  const orderCustomerInput = document.getElementById("orderCustomer");
  const orderItemNameInput = document.getElementById("orderItemName");
  const orderQuantityInput = document.getElementById("orderQuantity");
  const orderUnitPriceInput = document.getElementById("orderUnitPrice");
  const orderStationInput = document.getElementById("orderStation");
  const orderModifiersInput = document.getElementById("orderModifiers");
  const orderNotesInput = document.getElementById("orderNotes");
  const submitOrderBtn = document.getElementById("submit-order-btn");
  const ordersTableBody = document.getElementById("orders-table-body");
  const stationRestaurantInput = document.getElementById("stationRestaurant");
  const stationNameInput = document.getElementById("stationName");
  const stationTypeInput = document.getElementById("stationType");
  const stationDisplayOrderInput = document.getElementById("stationDisplayOrder");
  const addStationBtn = document.getElementById("add-station-btn");
  const kdsRestaurantFilter = document.getElementById("kdsRestaurantFilter");
  const kdsStationFilter = document.getElementById("kdsStationFilter");
  const refreshKdsBtn = document.getElementById("refresh-kds-btn");
  const kdsBoard = document.getElementById("kds-board");
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
  const navReports = document.getElementById("nav-reports");
  const westgateModeSwitchBtn = document.getElementById("westgate-mode-switch");
  const inventorySection = document.getElementById("inventory-section");
  const productionSection = document.getElementById("production-section");
  const productionTableBody = document.getElementById("production-table-body");
  const staffSection = document.getElementById("staff-section");
  const reportsSection = document.getElementById("reports-section");
  const reportTotalEvents = document.getElementById("report-total-events");
  const reportUpcomingEvents = document.getElementById("report-upcoming-events");
  const reportInventoryValue = document.getElementById("report-inventory-value");
  const reportOpenFeedback = document.getElementById("report-open-feedback");
  const reportsSummaryGrid = document.getElementById("reports-summary-grid");
  const shiftReportSummary = document.getElementById("shift-report-summary");
  const reportsFeedbackList = document.getElementById("reports-feedback-list");
  const reportFeedbackTitleInput = document.getElementById("reportFeedbackTitle");
  const reportFeedbackModuleInput = document.getElementById("reportFeedbackModule");
  const reportFeedbackPriorityInput = document.getElementById("reportFeedbackPriority");
  const reportFeedbackStatusInput = document.getElementById("reportFeedbackStatus");
  const reportFeedbackNotesInput = document.getElementById("reportFeedbackNotes");
  const reportEmailStatus = document.getElementById("report-email-status");
  const addReportFeedbackBtn = document.getElementById("add-report-feedback-btn");
  const clearResolvedFeedbackBtn = document.getElementById("clear-resolved-feedback-btn");
  const printReportBtn = document.getElementById("print-report-btn");
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
  const assignmentPreviewPanel = document.getElementById("assignment-preview-panel");
  const assignmentPreviewBody = document.getElementById("assignment-preview-body");
  const confirmPrintAssignmentsBtn = document.getElementById("confirm-print-assignments-btn");
  const closeAssignmentPreviewBtn = document.getElementById("close-assignment-preview-btn");
  const scheduleImageInput = document.getElementById("scheduleImage");
  const scheduleImportStatus = document.getElementById("schedule-import-status");
  const shiftDayTabs = Array.from(document.querySelectorAll("[data-shift-day]"));
  const openWeekViewBtn = document.getElementById("open-week-view-btn");
  const closeWeekViewBtn = document.getElementById("close-week-view-btn");
  const printWeekViewBtn = document.getElementById("print-week-view-btn");
  const shiftWeekModal = document.getElementById("shift-week-modal");
  const shiftWeekSchedule = document.getElementById("shift-week-schedule");
  const weekSizeActionButtons = Array.from(document.querySelectorAll("[data-week-size-action]"));
  const westgateModeButtons = Array.from(document.querySelectorAll("[data-westgate-mode]"));
  const bastidaModeButtons = Array.from(document.querySelectorAll("[data-bastida-mode]"));
  const hideClientOnlyElement = (element) => {
    if (!element) return;
    element.hidden = true;
    element.style.display = "none";
  };
  const setClientOnlyElementVisibility = (element, visible) => {
    if (!element) return;
    element.hidden = !visible;
    element.style.display = visible ? "" : "none";
  };
  const getWestgateModeModules = () => WESTGATE_MODE_MODULES[westgateMode] || null;
  const getDefaultModuleForClient = () => {
    if (isBastidaClient) return bastidaMode === BASTIDA_CEO_MODE ? "dashboard" : null;
    if (!isWestgateClient) return "dashboard";
    return isKnownWestgateMode(westgateMode) ? WESTGATE_DEFAULT_MODULES[westgateMode] : null;
  };
  const isModuleAvailableForClient = (moduleKey) => {
    if (isBastidaClient) return bastidaMode === BASTIDA_CEO_MODE;
    if (!isWestgateClient) return true;
    return Boolean(getWestgateModeModules()?.has(moduleKey));
  };
  const applyClientModuleVisibility = () => {
    if (isBastidaClient) {
      [
        navDashboard,
        navRestaurants,
        navOrders,
        navKitchen,
        navEvents,
        navMenus,
        navRecipes,
        navSubRecipes,
        navInventory,
        navProduction,
        navStaff,
        navReports
      ].forEach((navItem) => setClientOnlyElementVisibility(navItem, bastidaMode === BASTIDA_CEO_MODE));
      setClientOnlyElementVisibility(westgateModeSwitchBtn, bastidaMode === BASTIDA_CEO_MODE);
      if (westgateModeSwitchBtn) westgateModeSwitchBtn.textContent = "Cambiar vista";
      hideClientOnlyElement(smartSetupSection);
      hideClientOnlyElement(smartSetupLauncher);
      return;
    }

    if (!isWestgateClient) {
      hideClientOnlyElement(westgateModeSwitchBtn);
      return;
    }

    const modules = getWestgateModeModules();
    [
      ["dashboard", navDashboard],
      ["restaurants", navRestaurants],
      ["orders", navOrders],
      ["kitchen", navKitchen],
      ["events", navEvents],
      ["menus", navMenus],
      ["recipes", navRecipes],
      ["subRecipes", navSubRecipes],
      ["inventory", navInventory],
      ["production", navProduction],
      ["staff", navStaff],
      ["reports", navReports]
    ].forEach(([moduleKey, navItem]) => {
      setClientOnlyElementVisibility(navItem, Boolean(modules?.has(moduleKey)));
    });

    setClientOnlyElementVisibility(westgateModeSwitchBtn, Boolean(modules));
    if (westgateModeSwitchBtn) westgateModeSwitchBtn.textContent = "Cambiar area";
    setClientOnlyElementVisibility(smartSetupLauncher, canUseSmartSetup() && Boolean(modules));
    if (!canUseSmartSetup()) hideClientOnlyElement(smartSetupSection);
  };
  const weekSizeIndicator = document.getElementById("week-size-indicator");
  const shiftReadinessBoard = document.getElementById("shift-readiness-board");
  const shiftOffBoard = document.getElementById("shift-off-board");
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
    syncClientDataKey(EVENT_MENU_LINKS_KEY, links);
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
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error("Failed to load events from API.");
    }

    const events = await response.json();
    const mappedEvents = Array.isArray(events) ? events.map(mapApiEventToUiEvent) : [];
    if (!mappedEvents.length && localEvents.length) return localEvents;

    const mergedEvents = mergeApiEventsWithLocalEvents(mappedEvents, localEvents);
    saveEvents(mergedEvents);
    return mergedEvents;
  };

  const createEventInApi = async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json"
      }),
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
      headers: getAuthHeaders({
        "Content-Type": "application/json"
      }),
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
      method: "DELETE",
      headers: getAuthHeaders()
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
    const localInventory = getInventory();
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error("Failed to load inventory from API.");
    }

    const inventory = await response.json();
    const apiInventory = Array.isArray(inventory) ? inventory.map(mapApiInventoryItemToUiItem) : [];
    if (!apiInventory.length && localInventory.length) return localInventory;

    const localPrepInventory = getInventory().filter((item) => item.sourceType === "prepRecipe");
    saveInventory([...apiInventory, ...localPrepInventory]);
    return apiInventory;
  };

  const createInventoryItemInApi = async (item) => {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json"
      }),
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
      headers: getAuthHeaders({
        "Content-Type": "application/json"
      }),
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
      method: "DELETE",
      headers: getAuthHeaders()
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
    syncClientDataKey("beoflow_events", events);
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
    syncClientDataKey("beoflow_menus", menus);
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
    syncClientDataKey("beoflow_recipes", recipes);
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
    syncClientDataKey("beoflow_sub_recipes", subRecipes);
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
    syncClientDataKey("beoflow_inventory", inventory);
    notifySmartSetupDataChange();
  };

  const SHIFT_READINESS_KEY = "beoflow_shift_readiness";
  const SHIFT_ASSIGNMENT_PRESETS_KEY = "beoflow_shift_assignment_presets";
  const REPORT_FEEDBACK_KEY = "beoflow_reports_feedback";

  const getStaff = () => {
    try {
      return JSON.parse(localStorage.getItem(SHIFT_READINESS_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveStaff = (staff) => {
    localStorage.setItem(SHIFT_READINESS_KEY, JSON.stringify(staff));
    syncClientDataKey(SHIFT_READINESS_KEY, staff);
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
    syncClientDataKey(SHIFT_ASSIGNMENT_PRESETS_KEY, presets);
  };

  const getReportFeedback = () => {
    try {
      return JSON.parse(localStorage.getItem(REPORT_FEEDBACK_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveReportFeedback = (items) => {
    localStorage.setItem(REPORT_FEEDBACK_KEY, JSON.stringify(items));
    syncClientDataKey(REPORT_FEEDBACK_KEY, items);
  };

  const RESTAURANTS_KEY = "beoflow_restaurants";
  const ORDERS_KEY = "beoflow_orders";
  const KITCHEN_STATIONS_KEY = "beoflow_kitchen_stations";
  const ORDER_STATUS_FLOW = ["NEW", "ACCEPTED", "PREPARING", "READY", "DELIVERED", "CLOSED"];

  const readStoredList = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  const writeStoredList = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    syncClientDataKey(key, value);
  };

  const getRestaurants = () => readStoredList(RESTAURANTS_KEY);
  const saveRestaurants = (restaurants) => writeStoredList(RESTAURANTS_KEY, restaurants);
  const getOrders = () => readStoredList(ORDERS_KEY);
  const saveOrders = (orders) => writeStoredList(ORDERS_KEY, orders);
  const getKitchenStations = () => readStoredList(KITCHEN_STATIONS_KEY);
  const saveKitchenStations = (stations) => writeStoredList(KITCHEN_STATIONS_KEY, stations);

  const setOpsStatus = (statusEl, message = "", type = "info") => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.type = type;
    statusEl.hidden = !message;
  };

  const requestJson = async (pathName, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${pathName}`, {
      ...options,
      headers: getAuthHeaders({
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "Request failed.");
    }

    return result;
  };

  const makeLocalId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const normalizeId = (value) => String(value ?? "");
  const getRestaurantId = (restaurant = {}) => normalizeId(restaurant.restaurant_id ?? restaurant.id);
  const getStationId = (station = {}) => normalizeId(station.station_id ?? station.id);
  const getOrderId = (order = {}) => normalizeId(order.order_id ?? order.id);
  const getOrderRestaurantId = (order = {}) => normalizeId(order.restaurant_id ?? order.restaurantId);

  const formatOpsCurrency = (amount = 0) =>
    `$${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatOpsLabel = (value = "") =>
    String(value || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const getOpsStatusClass = (status = "") => {
    const normalized = String(status || "").toLowerCase();
    if (["ready", "delivered", "closed", "paid", "active"].includes(normalized)) return "ready";
    if (["accepted", "preparing"].includes(normalized)) return "prep";
    if (["new", "unpaid", "authorized"].includes(normalized)) return "draft";
    return "upcoming";
  };

  const mapRestaurantFromApi = (restaurant = {}) => ({
    id: getRestaurantId(restaurant),
    restaurant_id: getRestaurantId(restaurant),
    restaurant_name: restaurant.restaurant_name || restaurant.restaurantName || "",
    category: restaurant.category || "restaurant",
    location: restaurant.location || "",
    active_status: restaurant.active_status ?? restaurant.activeStatus ?? true
  });

  const mapStationFromApi = (station = {}) => ({
    id: getStationId(station),
    station_id: getStationId(station),
    restaurant_id: normalizeId(station.restaurant_id ?? station.restaurantId),
    station_name: station.station_name || station.stationName || "",
    station_type: station.station_type || station.stationType || "general",
    active_status: station.active_status ?? station.activeStatus ?? true,
    display_order: Number(station.display_order ?? station.displayOrder ?? 0)
  });

  const mapOrderFromApi = (order = {}) => ({
    id: getOrderId(order),
    order_id: getOrderId(order),
    restaurant_id: getOrderRestaurantId(order),
    table_id: order.table_id || order.tableId || "",
    customer_name: order.customer_name || order.customerName || "",
    order_type: order.order_type || order.orderType || "DINE_IN",
    order_status: order.order_status || order.orderStatus || "NEW",
    payment_status: order.payment_status || order.paymentStatus || "UNPAID",
    subtotal: Number(order.subtotal || 0),
    taxes: Number(order.taxes || 0),
    total: Number(order.total || 0),
    created_at: order.created_at || order.createdAt || new Date().toISOString(),
    items: Array.isArray(order.items) ? order.items : []
  });

  const mergeById = (currentItems, incomingItems, idGetter) => {
    const itemsById = new Map(currentItems.map((item) => [idGetter(item), item]));
    incomingItems.forEach((item) => {
      const id = idGetter(item);
      if (id) itemsById.set(id, item);
    });
    return [...itemsById.values()];
  };

  const getRestaurantName = (restaurantId) => {
    const id = normalizeId(restaurantId);
    const restaurant = getRestaurants().find((item) => getRestaurantId(item) === id);
    return restaurant?.restaurant_name || "Unassigned";
  };

  const getStationName = (stationId) => {
    const id = normalizeId(stationId);
    const station = getKitchenStations().find((item) => getStationId(item) === id);
    return station?.station_name || "";
  };

  const getOrderItems = (order = {}) => Array.isArray(order.items) ? order.items : [];

  const getOrderItemSummary = (order = {}) => {
    const items = getOrderItems(order);
    if (!items.length) return "-";
    return items.map((item) => {
      const quantity = Number(item.quantity || 1);
      const name = item.menu_item_id || item.menuItemId || "Item";
      return `${quantity}x ${name}`;
    }).join(", ");
  };

  const fetchRestaurantsFromApi = async () => {
    const result = await requestJson("/api/restaurants");
    const restaurants = Array.isArray(result.restaurants) ? result.restaurants.map(mapRestaurantFromApi) : [];
    const mergedRestaurants = restaurants.length ? mergeById(getRestaurants(), restaurants, getRestaurantId) : getRestaurants();
    saveRestaurants(mergedRestaurants);
    return mergedRestaurants;
  };

  const fetchKitchenStationsFromApi = async () => {
    const result = await requestJson("/api/kitchen/stations");
    const stations = Array.isArray(result.stations) ? result.stations.map(mapStationFromApi) : [];
    const mergedStations = stations.length ? mergeById(getKitchenStations(), stations, getStationId) : getKitchenStations();
    saveKitchenStations(mergedStations);
    return mergedStations;
  };

  const fetchOrdersFromApi = async () => {
    const result = await requestJson("/api/orders");
    const orders = Array.isArray(result.orders) ? result.orders.map(mapOrderFromApi) : [];
    const mergedOrders = orders.length ? mergeById(getOrders(), orders, getOrderId) : getOrders();
    saveOrders(mergedOrders);
    return mergedOrders;
  };

  const createRestaurantInApi = async (restaurant) => {
    const result = await requestJson("/api/restaurants", {
      method: "POST",
      body: JSON.stringify(restaurant)
    });
    return mapRestaurantFromApi(result.restaurant);
  };

  const createKitchenStationInApi = async (station) => {
    const result = await requestJson("/api/kitchen/stations", {
      method: "POST",
      body: JSON.stringify(station)
    });
    return mapStationFromApi(result.station);
  };

  const createOrderInApi = async (order) => {
    const result = await requestJson("/api/orders", {
      method: "POST",
      body: JSON.stringify(order)
    });
    return mapOrderFromApi(result.order);
  };

  const updateOrderStatusInApi = async (orderId, status) => {
    const result = await requestJson(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    return mapOrderFromApi(result.order);
  };

  const loadOperationsData = async (options = {}) => {
    const { quiet = false } = options;
    try {
      await fetchRestaurantsFromApi();
      await fetchKitchenStationsFromApi();
      await fetchOrdersFromApi();
      if (!quiet) {
        setOpsStatus(restaurantsStatus, "Operations data refreshed.", "success");
        setOpsStatus(ordersStatus, "Orders refreshed.", "success");
        setOpsStatus(kitchenStatus, "KDS refreshed.", "success");
      }
    } catch (error) {
      if (!quiet) {
        setOpsStatus(restaurantsStatus, "Using local restaurant data until Render is updated.", "warning");
        setOpsStatus(ordersStatus, "Using local order data until Render is updated.", "warning");
        setOpsStatus(kitchenStatus, "Using local KDS data until Render is updated.", "warning");
      }
    }
  };

  const populateRestaurantOptions = () => {
    const restaurants = getRestaurants();
    const restaurantOptions = restaurants
      .map((restaurant) => `<option value="${escapeHtml(getRestaurantId(restaurant))}">${escapeHtml(restaurant.restaurant_name)}</option>`)
      .join("");
    const filterOptions = `<option value="">All Restaurants</option>${restaurantOptions}`;
    const createFirstOption = '<option value="">Create a restaurant first</option>';

    [orderRestaurantInput, stationRestaurantInput].forEach((select) => {
      if (!select) return;
      const currentValue = select.value;
      select.innerHTML = restaurantOptions || createFirstOption;
      if (currentValue) select.value = currentValue;
    });

    [ordersRestaurantFilter, kdsRestaurantFilter].forEach((select) => {
      if (!select) return;
      const currentValue = select.value;
      select.innerHTML = filterOptions;
      select.value = currentValue;
    });
  };

  const populateStationOptions = () => {
    const stations = getKitchenStations();
    const orderRestaurantId = orderRestaurantInput?.value || "";
    const kdsRestaurantId = kdsRestaurantFilter?.value || "";

    if (orderStationInput) {
      const filteredStations = stations.filter((station) => !orderRestaurantId || normalizeId(station.restaurant_id) === orderRestaurantId);
      orderStationInput.innerHTML = [
        '<option value="">No station</option>',
        ...filteredStations.map((station) => `<option value="${escapeHtml(getStationId(station))}">${escapeHtml(station.station_name)}</option>`)
      ].join("");
    }

    if (kdsStationFilter) {
      const filteredStations = stations.filter((station) => !kdsRestaurantId || normalizeId(station.restaurant_id) === kdsRestaurantId);
      const currentValue = kdsStationFilter.value;
      kdsStationFilter.innerHTML = [
        '<option value="">All Stations</option>',
        ...filteredStations.map((station) => `<option value="${escapeHtml(getStationId(station))}">${escapeHtml(station.station_name)}</option>`)
      ].join("");
      kdsStationFilter.value = currentValue;
    }
  };

  const renderRestaurants = async (options = {}) => {
    if (options.refresh) await loadOperationsData({ quiet: true });
    populateRestaurantOptions();
    populateStationOptions();

    if (!restaurantsTableBody) return;
    const restaurants = getRestaurants();

    if (!restaurants.length) {
      restaurantsTableBody.innerHTML = '<tr><td colspan="4" class="ops-empty-cell">No restaurants yet.</td></tr>';
      return;
    }

    restaurantsTableBody.innerHTML = restaurants.map((restaurant) => `
      <tr>
        <td><strong>${escapeHtml(restaurant.restaurant_name)}</strong></td>
        <td>${escapeHtml(formatOpsLabel(restaurant.category))}</td>
        <td>${escapeHtml(restaurant.location || "-")}</td>
        <td><span class="status ${restaurant.active_status ? "ready" : "draft"}">${restaurant.active_status ? "Active" : "Inactive"}</span></td>
      </tr>
    `).join("");
  };

  const addRestaurant = async () => {
    const restaurantName = restaurantNameInput?.value.trim();
    if (!restaurantName) {
      setOpsStatus(restaurantsStatus, "Restaurant name is required.", "error");
      return;
    }

    const payload = {
      restaurant_name: restaurantName,
      category: restaurantCategoryInput?.value || "restaurant",
      location: restaurantLocationInput?.value.trim() || "",
      active_status: restaurantActiveStatusInput?.value !== "false"
    };

    let savedRestaurant;
    try {
      savedRestaurant = await createRestaurantInApi(payload);
      setOpsStatus(restaurantsStatus, "Restaurant saved.", "success");
    } catch (error) {
      savedRestaurant = mapRestaurantFromApi({
        ...payload,
        restaurant_id: makeLocalId("restaurant")
      });
      setOpsStatus(restaurantsStatus, "Restaurant saved locally until Render is updated.", "warning");
    }

    saveRestaurants(mergeById(getRestaurants(), [savedRestaurant], getRestaurantId));
    if (restaurantNameInput) restaurantNameInput.value = "";
    if (restaurantLocationInput) restaurantLocationInput.value = "";
    renderRestaurants();
    renderOrders();
    renderKds();
  };

  const addKitchenStation = async () => {
    const restaurantId = stationRestaurantInput?.value || "";
    const stationName = stationNameInput?.value.trim();
    if (!restaurantId || !stationName) {
      setOpsStatus(kitchenStatus, "Restaurant and station name are required.", "error");
      return;
    }

    const payload = {
      restaurant_id: restaurantId,
      station_name: stationName,
      station_type: stationTypeInput?.value || "general",
      display_order: Number(stationDisplayOrderInput?.value || 0),
      active_status: true
    };

    let savedStation;
    try {
      savedStation = await createKitchenStationInApi(payload);
      setOpsStatus(kitchenStatus, "Station saved.", "success");
    } catch (error) {
      savedStation = mapStationFromApi({
        ...payload,
        station_id: makeLocalId("station")
      });
      setOpsStatus(kitchenStatus, "Station saved locally until Render is updated.", "warning");
    }

    saveKitchenStations(mergeById(getKitchenStations(), [savedStation], getStationId));
    if (stationNameInput) stationNameInput.value = "";
    renderKds();
    renderOrders();
  };

  const parseOrderModifiers = (value = "") =>
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((option) => ({ group: "custom", option }));

  const addOrder = async () => {
    const restaurantId = orderRestaurantInput?.value || "";
    const itemName = orderItemNameInput?.value.trim();
    if (!restaurantId || !itemName) {
      setOpsStatus(ordersStatus, "Restaurant and item are required.", "error");
      return;
    }

    const quantity = Math.max(1, Number.parseInt(orderQuantityInput?.value || "1", 10));
    const unitPrice = Number(orderUnitPriceInput?.value || 0);
    const totalPrice = quantity * unitPrice;
    const stationId = orderStationInput?.value || null;
    const payload = {
      restaurant_id: restaurantId,
      table_id: orderTableInput?.value.trim() || "",
      customer_name: orderCustomerInput?.value.trim() || "",
      order_type: orderTypeInput?.value || "DINE_IN",
      payment_status: "UNPAID",
      subtotal: totalPrice,
      taxes: 0,
      total: totalPrice,
      source_channel: "POS",
      items: [
        {
          menu_item_id: itemName,
          quantity,
          modifiers: parseOrderModifiers(orderModifiersInput?.value || ""),
          notes: orderNotesInput?.value.trim() || "",
          assigned_station_id: stationId,
          unit_price: unitPrice,
          total_price: totalPrice
        }
      ]
    };

    let savedOrder;
    try {
      savedOrder = await createOrderInApi(payload);
      setOpsStatus(ordersStatus, "Order submitted.", "success");
    } catch (error) {
      savedOrder = mapOrderFromApi({
        ...payload,
        order_id: makeLocalId("order"),
        order_status: "NEW",
        created_at: new Date().toISOString(),
        items: payload.items.map((item) => ({
          ...item,
          order_item_id: makeLocalId("item"),
          item_status: "NEW"
        }))
      });
      setOpsStatus(ordersStatus, "Order saved locally until Render is updated.", "warning");
    }

    saveOrders(mergeById(getOrders(), [savedOrder], getOrderId));
    [orderTableInput, orderCustomerInput, orderItemNameInput, orderUnitPriceInput, orderModifiersInput, orderNotesInput].forEach((input) => {
      if (input) input.value = "";
    });
    if (orderQuantityInput) orderQuantityInput.value = "1";
    renderOrders();
    renderKds();
  };

  const getNextOrderStatus = (status = "NEW") => {
    const index = ORDER_STATUS_FLOW.indexOf(status);
    if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return "";
    return ORDER_STATUS_FLOW[index + 1];
  };

  const updateOrderStatus = async (orderId, nextStatus) => {
    if (!orderId || !nextStatus) return;

    let updatedOrder;
    try {
      updatedOrder = await updateOrderStatusInApi(orderId, nextStatus);
      setOpsStatus(ordersStatus, `Order moved to ${formatOpsLabel(nextStatus)}.`, "success");
      setOpsStatus(kitchenStatus, `Order moved to ${formatOpsLabel(nextStatus)}.`, "success");
    } catch (error) {
      const orders = getOrders();
      updatedOrder = orders.find((order) => getOrderId(order) === orderId);
      if (!updatedOrder) return;
      updatedOrder = {
        ...updatedOrder,
        order_status: nextStatus,
        items: getOrderItems(updatedOrder).map((item) => ({ ...item, item_status: nextStatus }))
      };
      setOpsStatus(ordersStatus, `Order moved locally to ${formatOpsLabel(nextStatus)}.`, "warning");
      setOpsStatus(kitchenStatus, `Order moved locally to ${formatOpsLabel(nextStatus)}.`, "warning");
    }

    saveOrders(mergeById(getOrders(), [updatedOrder], getOrderId));
    renderOrders();
    renderKds();
  };

  const getFilteredOrders = () => {
    const restaurantFilter = ordersRestaurantFilter?.value || "";
    const statusFilter = ordersStatusFilter?.value || "";

    return getOrders().filter((order) => {
      const matchesRestaurant = !restaurantFilter || getOrderRestaurantId(order) === restaurantFilter;
      const matchesStatus = statusFilter
        ? order.order_status === statusFilter
        : order.order_status !== "CLOSED";
      return matchesRestaurant && matchesStatus;
    });
  };

  const renderOrders = async (options = {}) => {
    if (options.refresh) await loadOperationsData({ quiet: true });
    populateRestaurantOptions();
    populateStationOptions();

    if (!ordersTableBody) return;
    const orders = getFilteredOrders();

    if (!orders.length) {
      ordersTableBody.innerHTML = '<tr><td colspan="8" class="ops-empty-cell">No orders in this view.</td></tr>';
      return;
    }

    ordersTableBody.innerHTML = orders.map((order) => {
      const orderId = getOrderId(order);
      const nextStatus = getNextOrderStatus(order.order_status);
      return `
        <tr>
          <td>
            <strong>#${escapeHtml(orderId.slice(-6) || orderId)}</strong>
            <small>${escapeHtml(order.table_id || order.customer_name || "")}</small>
          </td>
          <td>${escapeHtml(getRestaurantName(order.restaurant_id))}</td>
          <td>${escapeHtml(formatOpsLabel(order.order_type))}</td>
          <td>${escapeHtml(getOrderItemSummary(order))}</td>
          <td>${formatOpsCurrency(order.total)}</td>
          <td><span class="status ${getOpsStatusClass(order.order_status)}">${escapeHtml(formatOpsLabel(order.order_status))}</span></td>
          <td><span class="status ${getOpsStatusClass(order.payment_status)}">${escapeHtml(formatOpsLabel(order.payment_status))}</span></td>
          <td>
            ${nextStatus ? `<button type="button" class="secondary-btn ops-small-btn" data-advance-order="${escapeHtml(orderId)}" data-next-status="${escapeHtml(nextStatus)}">${escapeHtml(formatOpsLabel(nextStatus))}</button>` : ""}
          </td>
        </tr>
      `;
    }).join("");
  };

  const renderKds = async (options = {}) => {
    if (options.refresh) await loadOperationsData({ quiet: true });
    populateRestaurantOptions();
    populateStationOptions();

    if (!kdsBoard) return;
    const restaurantFilter = kdsRestaurantFilter?.value || "";
    const stationFilter = kdsStationFilter?.value || "";
    const activeStatuses = ["NEW", "ACCEPTED", "PREPARING", "READY"];
    const orders = getOrders().filter((order) => {
      const matchesRestaurant = !restaurantFilter || getOrderRestaurantId(order) === restaurantFilter;
      const matchesStatus = activeStatuses.includes(order.order_status);
      const items = getOrderItems(order);
      const matchesStation = !stationFilter || items.some((item) => normalizeId(item.assigned_station_id ?? item.assignedStationId) === stationFilter);
      return matchesRestaurant && matchesStatus && matchesStation;
    });

    kdsBoard.innerHTML = activeStatuses.map((status) => {
      const statusOrders = orders.filter((order) => order.order_status === status);
      const cards = statusOrders.length
        ? statusOrders.map((order) => {
            const orderId = getOrderId(order);
            const nextStatus = getNextOrderStatus(order.order_status);
            const items = getOrderItems(order);
            const stationNames = [...new Set(items.map((item) => getStationName(item.assigned_station_id ?? item.assignedStationId)).filter(Boolean))];
            return `
              <article class="kds-ticket">
                <div class="kds-ticket-head">
                  <strong>#${escapeHtml(orderId.slice(-6) || orderId)}</strong>
                  <span>${escapeHtml(order.table_id || order.customer_name || "Open")}</span>
                </div>
                <p>${escapeHtml(getRestaurantName(order.restaurant_id))}</p>
                <ul>
                  ${items.map((item) => `<li>${escapeHtml(`${item.quantity || 1}x ${item.menu_item_id || "Item"}`)}${item.notes ? `<span>${escapeHtml(item.notes)}</span>` : ""}</li>`).join("")}
                </ul>
                ${stationNames.length ? `<small>${escapeHtml(stationNames.join(", "))}</small>` : ""}
                ${nextStatus ? `<button type="button" class="primary-btn kds-action-btn" data-advance-order="${escapeHtml(orderId)}" data-next-status="${escapeHtml(nextStatus)}">${escapeHtml(formatOpsLabel(nextStatus))}</button>` : ""}
              </article>
            `;
          }).join("")
        : '<div class="kds-empty">No tickets</div>';

      return `
        <section class="kds-column">
          <div class="kds-column-header">
            <h3>${escapeHtml(formatOpsLabel(status))}</h3>
            <span>${statusOrders.length}</span>
          </div>
          <div class="kds-ticket-list">${cards}</div>
        </section>
      `;
    }).join("");
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
    syncClientDataKey(SMART_SETUP_KEY, state);
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
    if (!canUseSmartSetup()) return;
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
    if (!canUseSmartSetup()) {
      hideClientOnlyElement(smartSetupSection);
      hideClientOnlyElement(smartSetupLauncher);
      return;
    }

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
    if (!canUseSmartSetup()) return;

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
    restaurants: {
      title: "Restaurants",
      subtitle: "Multi-venue hospitality operations"
    },
    orders: {
      title: "Orders",
      subtitle: "Live order management across restaurants"
    },
    kitchen: {
      title: "Kitchen Display",
      subtitle: "Active preparation queue and station flow"
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
    reports: {
      title: "Reports",
      subtitle: "Review operations, feedback, and action items"
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
        headers: getAuthHeaders({
          "Content-Type": "application/json"
        }),
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
      restaurantsSection,
      ordersSection,
      kitchenSection,
      eventsSection,
      menusSection,
      recipesSection,
      subRecipesSection,
      inventorySection,
      productionSection,
      staffSection,
      reportsSection,
      createEventSection
    ].forEach(hideSection);
  };

  const setActiveNav = (activeNav) => {
    [navDashboard, navRestaurants, navOrders, navKitchen, navEvents, navMenus, navRecipes, navSubRecipes, navInventory, navProduction, navStaff, navReports].forEach((navItem) => {
      if (!navItem) return;
      navItem.classList.toggle("active", navItem === activeNav);
    });
  };

  const showModuleByKey = (moduleKey, options = {}) => {
    const { scroll = false } = options;

    if (!isModuleAvailableForClient(moduleKey)) {
      const fallbackModule = getDefaultModuleForClient();
      if (fallbackModule && fallbackModule !== moduleKey) showModuleByKey(fallbackModule, options);
      return;
    }

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

    if (moduleKey === "restaurants") {
      showSection(restaurantsSection);
      setActiveNav(navRestaurants);
      renderRestaurants();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "orders") {
      showSection(ordersSection);
      setActiveNav(navOrders);
      renderOrders();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "kitchen") {
      showSection(kitchenSection);
      setActiveNav(navKitchen);
      renderKds();
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

    if (moduleKey === "reports") {
      showSection(reportsSection);
      setActiveNav(navReports);
      renderReports();
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

  const normalizeShiftDayKey = (dayKey = "") => {
    const normalized = String(dayKey).trim().toLowerCase().slice(0, 3);
    const aliases = {
      monday: "mon",
      tuesday: "tue",
      wednesday: "wed",
      thursday: "thu",
      friday: "fri",
      saturday: "sat",
      sunday: "sun",
      lun: "mon",
      mar: "tue",
      mie: "wed",
      jue: "thu",
      vie: "fri",
      sab: "sat",
      dom: "sun"
    };
    return shiftDays.some((day) => day.key === normalized) ? normalized : aliases[normalized] || aliases[String(dayKey).trim().toLowerCase()] || "";
  };

  const getPersonDayAssignment = (person = {}, dayKey = activeShiftDay) => {
    const dayAssignment = person.assignments?.[dayKey];
    if (dayAssignment) return dayAssignment;

    return {
      station: person.station || "Flat Top",
      shiftStart: person.shiftStart || "",
      shiftEnd: person.shiftEnd || "",
      off: false
    };
  };

  const isAssignmentWorking = (assignment = {}) =>
    Boolean(assignment && !assignment.off && !assignment.absent && assignment.shiftStart && assignment.shiftEnd);

  const normalizePersonForDay = (person = {}, dayKey = activeShiftDay) => {
    const dayAssignment = getPersonDayAssignment(person, dayKey);

    return {
      ...person,
      station: dayAssignment.station || person.station || "Flat Top",
      shiftStart: dayAssignment.shiftStart || person.shiftStart || "",
      shiftEnd: dayAssignment.shiftEnd || person.shiftEnd || "",
      off: Boolean(dayAssignment.off),
      absent: Boolean(dayAssignment.absent),
      substituteFor: dayAssignment.substituteFor || person.substituteFor || "",
      replacedBy: dayAssignment.replacedBy || ""
    };
  };

  const getStaffForDay = (staff = getStaff(), dayKey = activeShiftDay) =>
    staff
      .map((person) => normalizePersonForDay(person, dayKey))
      .filter((person) => isAssignmentWorking(person));

  const getOffStaffForDay = (staff = getStaff(), dayKey = activeShiftDay) =>
    staff
      .map((person) => normalizePersonForDay(person, dayKey))
      .filter((person) => person.off || person.absent || !person.shiftStart || !person.shiftEnd);

  const buildAssignmentsForActiveDay = ({ station, shiftStart, shiftEnd }) =>
    shiftDays.reduce((assignments, day) => {
      assignments[day.key] = day.key === activeShiftDay
        ? { station, shiftStart, shiftEnd, off: false }
        : { station: "", shiftStart: "", shiftEnd: "", off: true };
      return assignments;
    }, {});

  const buildAssignmentsFromImport = (employee = {}, station = "") => {
    const importedAssignments = employee.assignments && typeof employee.assignments === "object"
      ? employee.assignments
      : null;

    if (!importedAssignments) {
      return buildAssignmentsForAllDays({
        station,
        shiftStart: employee.shiftStart || "",
        shiftEnd: employee.shiftEnd || ""
      });
    }

    return shiftDays.reduce((assignments, day) => {
      const rawAssignment = Object.entries(importedAssignments).find(([key]) => normalizeShiftDayKey(key) === day.key)?.[1] || {};
      const assignmentStation = shiftStations.includes(rawAssignment.station) ? rawAssignment.station : station;
      const shiftStart = rawAssignment.shiftStart || rawAssignment.start || "";
      const shiftEnd = rawAssignment.shiftEnd || rawAssignment.end || "";
      const isOff = Boolean(rawAssignment.off) || !shiftStart || !shiftEnd;

      assignments[day.key] = {
        station: isOff ? "" : assignmentStation,
        shiftStart,
        shiftEnd,
        off: isOff
      };
      return assignments;
    }, {});
  };

  const buildAssignmentsForAllDays = ({ station, shiftStart, shiftEnd }) =>
    shiftDays.reduce((assignments, day) => {
      assignments[day.key] = { station, shiftStart, shiftEnd, off: false };
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
    syncClientDataKey("beoflow_shift_handoff_assignments", assignments);
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

  const minutesToTime = (totalMinutes) => {
    const normalizedMinutes = ((Math.round(totalMinutes) % (24 * 60)) + (24 * 60)) % (24 * 60);
    const hours = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const getSmartBreaks = (staff = []) => {
    const sortedStaff = staff
      .map((person) => ({ person, shift: getShiftMinutes(person) }))
      .filter((item) => item.shift)
      .sort((a, b) => a.shift.start - b.shift.start || a.person.station.localeCompare(b.person.station));
    const usedBreakStarts = {};

    return sortedStaff.flatMap(({ person, shift }) => {
      const duration = shift.end - shift.start;
      const templates = [];

      if (duration >= 10 * 60) {
        templates.push({ type: "Meal", length: 30, target: shift.start + Math.floor(duration * 0.45) });
        templates.push({ type: "Rest", length: 15, target: shift.start + Math.floor(duration * 0.72) });
      } else if (duration >= 6 * 60) {
        templates.push({ type: "Meal", length: 30, target: shift.start + Math.floor(duration * 0.5) });
      } else if (duration >= 4 * 60) {
        templates.push({ type: "Rest", length: 15, target: shift.start + Math.floor(duration * 0.5) });
      }

      return templates.map((template) => {
        const earliest = shift.start + 90;
        const latest = shift.end - template.length - 45;
        let breakStart = Math.min(Math.max(template.target, earliest), Math.max(earliest, latest));
        const stationKey = person.station || "station";

        while ((usedBreakStarts[stationKey] || []).some((start) => Math.abs(start - breakStart) < 30)) {
          breakStart += 30;
          if (breakStart > latest) breakStart = earliest;
        }

        usedBreakStarts[stationKey] = [...(usedBreakStarts[stationKey] || []), breakStart];

        return {
          id: `${person.id}-${template.type}-${breakStart}`,
          person,
          type: template.type,
          start: breakStart,
          end: breakStart + template.length,
          length: template.length
        };
      });
    });
  };

  const formatBreakRange = (breakItem = {}) =>
    `${minutesToTime(breakItem.start)} - ${minutesToTime(breakItem.end)}`;

  const renderStaffCard = (person, breaks = []) => {
    return `
      <article class="shift-employee-card" data-staff-id="${escapeHtml(person.id)}">
        <div class="shift-card-header">
          <div>
            <h4>${escapeHtml(person.name || "Unnamed employee")}</h4>
            <p>${escapeHtml(person.role || "Role not set")} · ${getShiftDayLabel(activeShiftDay)}${person.substituteFor ? ` · Covers ${escapeHtml(person.substituteFor)}` : ""}</p>
          </div>
        </div>
        <div class="shift-time-row">
          <span>${escapeHtml(formatShiftTimeRange(person))}</span>
        </div>
        ${breaks.length ? `
          <div class="shift-break-list">
            ${breaks.map((breakItem) => `
              <span>${escapeHtml(breakItem.type)} break · ${escapeHtml(formatBreakRange(breakItem))}</span>
            `).join("")}
          </div>
        ` : ""}
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
        <div class="shift-card-actions">
          <button type="button" class="secondary-btn" data-substitute-staff="${escapeHtml(person.id)}">Substitute</button>
          <button type="button" class="secondary-btn" data-day-off-staff="${escapeHtml(person.id)}">Day off</button>
          <button type="button" class="secondary-btn shift-delete-btn" data-delete-staff="${escapeHtml(person.id)}">Delete</button>
        </div>
      </article>
    `;
  };

  const formatDurationMinutes = (minutes) => {
    const absMinutes = Math.abs(minutes);
    if (absMinutes === 0) return "same time";
    if (absMinutes === 1) return "1 min";
    return `${absMinutes} min`;
  };

  const formatGapMinutes = (minutes) => {
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const remainingMinutes = absMinutes % 60;

    if (!hours) return formatDurationMinutes(absMinutes);
    if (!remainingMinutes) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} min`;
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

    return stationStaff.map((outgoing) => {
      const nextShift = stationStaff
        .filter((incoming) => incoming.person.id !== outgoing.person.id)
        .map((incoming) => {
          let startDelta = incoming.shift.start - outgoing.shift.end;
          if (startDelta < 0) startDelta += 24 * 60;
          return {
            ...incoming,
            startDelta
          };
        })
        .filter((incoming) => incoming.startDelta >= 0)
        .sort((a, b) => a.startDelta - b.startDelta)[0];

      return {
        station,
        person: outgoing.person,
        verifyBy: nextShift?.person || null,
        nextCheckDelta: nextShift?.startDelta ?? null
      };
    });
  };

  const getAllStationCloseouts = (staff = []) =>
    shiftStations.flatMap((station) => getStationCloseouts(staff, station));

  let currentPrintPreview = null;
  let activeWeekSize = "small";
  const weekSizeOrder = ["small", "normal", "large"];
  const weekSizeLabels = {
    small: "1x",
    normal: "2x",
    large: "3x"
  };

  const getStationClass = (station = "") =>
    String(station || "off").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "off";

  const renderShiftDayCounts = () => {
    const staff = getStaff();
    shiftDayTabs.forEach((tab) => {
      const dayKey = tab.dataset.shiftDay;
      const dayLabel = getShiftDayLabel(dayKey);
      const dayCount = getStaffForDay(staff, dayKey).length;
      tab.textContent = `${dayLabel} ${dayCount}`;
    });
  };

  const buildWeeklyScheduleMarkup = () => {
    const staff = getStaff();

    if (!staff.length) {
      return '<div class="shift-week-empty">Import or add employees to see the weekly schedule.</div>';
    }

    const dayHeaders = shiftDays
      .map((day) => {
        const dayCount = getStaffForDay(staff, day.key).length;
        return `
          <button type="button" class="shift-week-day ${day.key === activeShiftDay ? "is-active" : ""}" data-week-day="${day.key}">
            <strong>${escapeHtml(day.label)}</strong>
            <span>${dayCount} on shift</span>
          </button>
        `;
      })
      .join("");
    const stationLegend = [
      ...shiftStations.map((station) => ({ label: station, className: getStationClass(station) })),
      { label: "Off / Absent", className: "off" }
    ]
      .map((item) => `
        <span class="shift-week-legend-item station-${escapeHtml(item.className)}">
          <i></i>${escapeHtml(item.label)}
        </span>
      `)
      .join("");

    const rows = staff
      .map((person) => {
        const cells = shiftDays
          .map((day) => {
            const assignment = normalizePersonForDay(person, day.key);
            const isWorking = isAssignmentWorking(assignment);
            const statusLabel = assignment.absent ? "Absent" : assignment.off || !isWorking ? "Off" : assignment.station || "Unassigned";
            const stationClass = isWorking ? getStationClass(assignment.station) : "off";

            return `
              <button type="button" class="shift-week-cell ${day.key === activeShiftDay ? "is-active" : ""} ${isWorking ? "is-working" : "is-off"} station-${stationClass}" data-week-day="${day.key}">
                <strong>${escapeHtml(statusLabel)}</strong>
                <span>${isWorking ? escapeHtml(formatShiftTimeRange(assignment)) : "No shift"}</span>
                ${assignment.substituteFor ? `<em>Covers ${escapeHtml(assignment.substituteFor)}</em>` : ""}
                ${assignment.replacedBy ? `<em>Covered by ${escapeHtml(assignment.replacedBy)}</em>` : ""}
              </button>
            `;
          })
          .join("");

        return `
          <div class="shift-week-row">
            <div class="shift-week-employee">
              <strong>${escapeHtml(person.name || "Unnamed employee")}</strong>
              <span>${escapeHtml(person.role || "Role not set")}</span>
            </div>
            ${cells}
          </div>
        `;
      })
      .join("");

    return `
      <div class="shift-week-legend">${stationLegend}</div>
      <div class="shift-week-grid">
        <div class="shift-week-header-row">
          <div class="shift-week-corner">Employee</div>
          ${dayHeaders}
        </div>
        ${rows}
      </div>
    `;
  };

  const renderWeeklySchedule = () => {
    if (!shiftWeekSchedule) return;

    shiftWeekSchedule.dataset.weekSize = activeWeekSize;
    shiftWeekSchedule.innerHTML = buildWeeklyScheduleMarkup();
  };

  const setWeeklyScheduleSize = (size = "small") => {
    if (!["small", "normal", "large"].includes(size)) return;

    activeWeekSize = size;
    const activeIndex = weekSizeOrder.indexOf(activeWeekSize);
    weekSizeActionButtons.forEach((button) => {
      button.disabled =
        (button.dataset.weekSizeAction === "decrease" && activeIndex === 0)
        || (button.dataset.weekSizeAction === "increase" && activeIndex === weekSizeOrder.length - 1);
    });
    if (weekSizeIndicator) weekSizeIndicator.textContent = weekSizeLabels[activeWeekSize] || "1x";
    if (shiftWeekSchedule) shiftWeekSchedule.dataset.weekSize = activeWeekSize;
  };

  const adjustWeeklyScheduleSize = (direction = "increase") => {
    const currentIndex = weekSizeOrder.indexOf(activeWeekSize);
    const nextIndex = direction === "decrease" ? currentIndex - 1 : currentIndex + 1;
    setWeeklyScheduleSize(weekSizeOrder[Math.min(Math.max(nextIndex, 0), weekSizeOrder.length - 1)]);
  };

  const openWeeklyScheduleView = () => {
    if (!shiftWeekModal) return;

    setWeeklyScheduleSize(activeWeekSize);
    renderWeeklySchedule();
    shiftWeekModal.hidden = false;
    document.body.classList.add("modal-open");
  };

  const closeWeeklyScheduleView = () => {
    if (!shiftWeekModal) return;

    shiftWeekModal.hidden = true;
    document.body.classList.remove("modal-open");
  };

  const printWeeklyScheduleView = () => {
    document.getElementById("assignment-print-root")?.remove();

    const printRoot = document.createElement("div");
    printRoot.id = "assignment-print-root";
    printRoot.className = "week-print-root";
    printRoot.innerHTML = `
      <div class="shift-week-print-sheet">
        <header>
          <h1>Full Week Schedule</h1>
          <p>BEOFlow Shift Readiness · Bastida Systems</p>
        </header>
        <div class="shift-week-schedule" data-week-size="small">
          ${buildWeeklyScheduleMarkup()}
        </div>
      </div>
    `;
    document.body.appendChild(printRoot);
    requestAnimationFrame(() => window.print());
  };

  const formatReportCurrency = (amount = 0) =>
    `$${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const getUpcomingEvents = (events = getEvents()) => {
    const todayString = new Date().toISOString().split("T")[0];
    const today = new Date(`${todayString}T00:00:00`);
    return events.filter((eventData) => {
      if (!eventData.date) return false;
      return new Date(`${eventData.date}T00:00:00`) >= today;
    });
  };

  const getProductionTaskCount = () => {
    const events = getEvents();
    const menus = getMenus();
    let taskCount = 0;

    events.forEach((eventData) => {
      const selectedMenu = menus.find((menu) => menu.id === getEventMenuId(eventData));
      if (!selectedMenu || Number(eventData.guests || 0) <= 0) return;
      taskCount += (selectedMenu.recipeIds || []).length;
    });

    return taskCount;
  };

  const getReportSnapshot = () => {
    const events = getEvents();
    const inventory = getInventory();
    const staff = getStaff();
    const feedback = getReportFeedback();
    const upcomingEvents = getUpcomingEvents(events);
    const inventoryValue = inventory.reduce((sum, item) => sum + getInventoryStockValue(item), 0);
    const lowStockItems = inventory.filter((item) => ["Low Stock", "Out of Stock"].includes(getInventoryStatus(item.quantity).label));
    const openFeedback = feedback.filter((item) => item.status !== "Resolved");
    const allDayStaff = shiftDays.reduce((total, day) => total + getStaffForDay(staff, day.key).length, 0);

    return {
      events,
      inventory,
      staff,
      feedback,
      upcomingEvents,
      inventoryValue,
      lowStockItems,
      openFeedback,
      productionTasks: getProductionTaskCount(),
      allDayStaff
    };
  };

  const renderReportsSummary = (snapshot = getReportSnapshot()) => {
    if (!reportsSummaryGrid) return;

    const confirmedEvents = snapshot.events.filter((eventData) => eventData.status === "Confirmed").length;
    const draftEvents = snapshot.events.filter((eventData) => eventData.status === "Draft").length;
    const highPriorityFeedback = snapshot.feedback.filter((item) => item.priority === "High" && item.status !== "Resolved").length;

    const summaryItems = [
      { label: "Confirmed events", value: confirmedEvents, tone: "green" },
      { label: "Draft events", value: draftEvents, tone: "yellow" },
      { label: "Low stock items", value: snapshot.lowStockItems.length, tone: snapshot.lowStockItems.length ? "red" : "green" },
      { label: "Production tasks", value: snapshot.productionTasks, tone: "blue" },
      { label: "Shift assignments", value: snapshot.allDayStaff, tone: "green" },
      { label: "High priority feedback", value: highPriorityFeedback, tone: highPriorityFeedback ? "red" : "blue" }
    ];

    reportsSummaryGrid.innerHTML = summaryItems
      .map((item) => `
        <article class="report-summary-card ${item.tone}">
          <strong>${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
        </article>
      `)
      .join("");
  };

  const renderShiftReportSummary = () => {
    if (!shiftReportSummary) return;

    const staff = getStaff();
    if (!staff.length) {
      shiftReportSummary.innerHTML = '<div class="report-empty-state">No Shift Readiness data yet.</div>';
      return;
    }

    shiftReportSummary.innerHTML = shiftDays
      .map((day) => {
        const dayStaff = getStaffForDay(staff, day.key);
        const offStaff = getOffStaffForDay(staff, day.key);
        const openStations = shiftStations.filter((station) => !dayStaff.some((person) => person.station === station)).length;
        const substitutions = dayStaff.filter((person) => person.substituteFor).length;
        const absences = offStaff.filter((person) => person.absent).length;

        return `
          <article class="shift-report-day ${day.key === activeShiftDay ? "is-active" : ""}">
            <strong>${escapeHtml(day.label)}</strong>
            <span>${dayStaff.length} employees</span>
            <span>${openStations} open stations</span>
            <span>${substitutions} subs · ${absences} absent</span>
          </article>
        `;
      })
      .join("");
  };

  const renderReportFeedback = () => {
    if (!reportsFeedbackList) return;

    const feedback = getReportFeedback();
    if (!feedback.length) {
      reportsFeedbackList.innerHTML = '<div class="report-empty-state">No feedback yet. Add the first action item above.</div>';
      return;
    }

    reportsFeedbackList.innerHTML = feedback
      .map((item) => `
        <article class="report-feedback-card priority-${escapeHtml(String(item.priority || "Medium").toLowerCase())}">
          <div>
            <div class="report-feedback-meta">
              <span>${escapeHtml(item.module || "Other")}</span>
              <span>${escapeHtml(item.priority || "Medium")}</span>
              <span>${escapeHtml(item.status || "Open")}</span>
            </div>
            <h4>${escapeHtml(item.title || "Untitled feedback")}</h4>
            ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}
            <small>${escapeHtml(item.createdAt ? new Date(item.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Saved")}</small>
          </div>
          <div class="report-feedback-actions">
            <select data-feedback-status="${escapeHtml(item.id)}">
              ${["Open", "In Review", "Resolved"].map((status) => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
            <button type="button" class="secondary-btn" data-delete-feedback="${escapeHtml(item.id)}">Delete</button>
          </div>
        </article>
      `)
      .join("");
  };

  const renderReports = () => {
    const snapshot = getReportSnapshot();

    if (reportTotalEvents) reportTotalEvents.textContent = snapshot.events.length;
    if (reportUpcomingEvents) reportUpcomingEvents.textContent = snapshot.upcomingEvents.length;
    if (reportInventoryValue) reportInventoryValue.textContent = formatReportCurrency(snapshot.inventoryValue);
    if (reportOpenFeedback) reportOpenFeedback.textContent = snapshot.openFeedback.length;

    renderReportsSummary(snapshot);
    renderShiftReportSummary();
    renderReportFeedback();
  };

  const setReportEmailStatus = (message = "", type = "info") => {
    if (!reportEmailStatus) return;
    reportEmailStatus.textContent = message;
    reportEmailStatus.dataset.type = type;
    reportEmailStatus.hidden = !message;
  };

  const emailReportFeedback = async (item = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report-feedback`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(item)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Feedback email could not be sent.");
      }

      setReportEmailStatus("Feedback sent to Bastida Systems.", "success");
    } catch (error) {
      console.error(error);
      const message = error instanceof TypeError && error.message === "Failed to fetch"
        ? "Feedback saved locally. Email API is not running."
        : error.message || "Feedback saved locally, but email could not be sent.";
      setReportEmailStatus(message, "warning");
    }
  };

  const addReportFeedback = () => {
    const title = reportFeedbackTitleInput?.value.trim() || "";
    if (!title) {
      alert("Add feedback before saving.");
      return;
    }

    const feedback = getReportFeedback();
    const feedbackItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      module: reportFeedbackModuleInput?.value || "Other",
      priority: reportFeedbackPriorityInput?.value || "Medium",
      status: reportFeedbackStatusInput?.value || "Open",
      notes: reportFeedbackNotesInput?.value.trim() || "",
      createdAt: new Date().toISOString()
    };
    feedback.unshift(feedbackItem);

    saveReportFeedback(feedback);
    if (reportFeedbackTitleInput) reportFeedbackTitleInput.value = "";
    if (reportFeedbackNotesInput) reportFeedbackNotesInput.value = "";
    if (reportFeedbackPriorityInput) reportFeedbackPriorityInput.value = "Medium";
    if (reportFeedbackStatusInput) reportFeedbackStatusInput.value = "Open";
    renderReports();
    emailReportFeedback(feedbackItem);
  };

  const updateReportFeedbackStatus = (feedbackId, status) => {
    const feedback = getReportFeedback().map((item) =>
      item.id === feedbackId ? { ...item, status } : item
    );
    saveReportFeedback(feedback);
    renderReports();
  };

  const deleteReportFeedback = (feedbackId) => {
    saveReportFeedback(getReportFeedback().filter((item) => item.id !== feedbackId));
    renderReports();
  };

  const clearResolvedFeedback = () => {
    saveReportFeedback(getReportFeedback().filter((item) => item.status !== "Resolved"));
    renderReports();
  };

  const printReports = () => {
    document.getElementById("assignment-print-root")?.remove();
    const snapshot = getReportSnapshot();
    const printRoot = document.createElement("div");
    printRoot.id = "assignment-print-root";
    printRoot.innerHTML = `
      <div class="reports-print-sheet">
        <header>
          <h1>BEOFlow Operations Report</h1>
          <p>Bastida Systems · ${escapeHtml(new Date().toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }))}</p>
        </header>
        <div class="reports-print-grid">
          <div><strong>${snapshot.events.length}</strong><span>Total events</span></div>
          <div><strong>${snapshot.upcomingEvents.length}</strong><span>Upcoming events</span></div>
          <div><strong>${formatReportCurrency(snapshot.inventoryValue)}</strong><span>Inventory value</span></div>
          <div><strong>${snapshot.openFeedback.length}</strong><span>Open feedback</span></div>
        </div>
        <h2>Open Feedback</h2>
        <table>
          <thead><tr><th>Area</th><th>Priority</th><th>Status</th><th>Feedback</th></tr></thead>
          <tbody>
            ${snapshot.feedback.length ? snapshot.feedback.map((item) => `
              <tr>
                <td>${escapeHtml(item.module || "Other")}</td>
                <td>${escapeHtml(item.priority || "Medium")}</td>
                <td>${escapeHtml(item.status || "Open")}</td>
                <td>${escapeHtml(item.title || "")}${item.notes ? `<br><small>${escapeHtml(item.notes)}</small>` : ""}</td>
              </tr>
            `).join("") : '<tr><td colspan="4">No feedback saved.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
    document.body.appendChild(printRoot);
    requestAnimationFrame(() => window.print());
  };

  const renderStationCloseouts = (closeouts = []) => {
    if (!closeouts.length) return "";

    return `
      <div class="shift-closeout-list">
        <h4>Clean + fill by schedule</h4>
        ${closeouts
          .map((closeout) => `
            <div class="shift-closeout-card">
              <strong>${escapeHtml(closeout.person.name || "-")} cleans and fills before ${escapeHtml(closeout.person.shiftEnd || "--:--")}</strong>
              <span>${closeout.verifyBy ? `${escapeHtml(closeout.verifyBy.name || "-")} verifies on arrival${closeout.nextCheckDelta ? ` (${formatGapMinutes(closeout.nextCheckDelta)} later)` : ""}` : "Last shift for this station"}</span>
            </div>
          `)
          .join("")}
      </div>
    `;
  };

  const renderStaff = () => {
    const staff = getStaffForDay();
    const offStaff = getOffStaffForDay();
    const assignedCount = staff.filter((person) => shiftStations.includes(person.station)).length;
    const openStationsCount = shiftStations.filter((station) => !staff.some((person) => person.station === station)).length;
    const handoffs = getAllStationHandoffs(staff);
    const smartBreaks = getSmartBreaks(staff);

    renderShiftDayCounts();
    if (shiftWeekModal && !shiftWeekModal.hidden) renderWeeklySchedule();
    if (shiftKpiEmployees) shiftKpiEmployees.textContent = staff.length;
    if (shiftKpiReady) shiftKpiReady.textContent = assignedCount;
    if (shiftKpiNotReady) shiftKpiNotReady.textContent = openStationsCount;
    if (shiftKpiHandoffs) shiftKpiHandoffs.textContent = smartBreaks.length;
    if (!shiftReadinessBoard) return;

    shiftReadinessBoard.innerHTML = shiftStations
      .map((station) => {
        const stationStaff = staff.filter((person) => person.station === station);
        const stationHandoffs = getStationHandoffs(staff, station);
        const stationCloseouts = getStationCloseouts(staff, station);
        const stationCards = stationStaff.length
          ? stationStaff
              .map((person) => renderStaffCard(person, smartBreaks.filter((breakItem) => breakItem.person.id === person.id)))
              .join("")
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

    if (shiftOffBoard) {
      shiftOffBoard.innerHTML = offStaff.length
        ? `
          <section class="shift-off-panel">
            <div>
              <h3>Off / absent on ${getShiftDayLabel(activeShiftDay)}</h3>
              <p>These employees are not counted in the KPIs for this day.</p>
            </div>
            <div class="shift-off-list">
              ${offStaff.map((person) => `
                <article class="shift-off-card">
                  <div>
                    <strong>${escapeHtml(person.name || "Unnamed employee")}</strong>
                    <span>${person.absent ? "Absent" : "Day off"}${person.replacedBy ? ` · Covered by ${escapeHtml(person.replacedBy)}` : ""}</span>
                  </div>
                  <button type="button" class="secondary-btn" data-restore-staff="${escapeHtml(person.id)}">Restore</button>
                </article>
              `).join("")}
            </div>
          </section>
        `
        : "";
    }
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
      assignments: buildAssignmentsForActiveDay({ station, shiftStart, shiftEnd })
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

  const markStaffDayOff = (staffId, options = {}) => {
    const staff = getStaff();
    const updatedStaff = staff.map((person) => {
      if (person.id !== staffId) return person;
      const currentAssignment = getPersonDayAssignment(person, activeShiftDay);
      return {
        ...person,
        assignments: {
          ...person.assignments,
          [activeShiftDay]: {
            ...currentAssignment,
            off: true,
            absent: Boolean(options.absent),
            replacedBy: options.replacedBy || currentAssignment.replacedBy || ""
          }
        }
      };
    });

    saveStaff(updatedStaff);
    renderStaff();
  };

  const restoreStaffDay = (staffId) => {
    const staff = getStaff();
    const updatedStaff = staff.map((person) => {
      if (person.id !== staffId) return person;
      const currentAssignment = getPersonDayAssignment(person, activeShiftDay);
      return {
        ...person,
        assignments: {
          ...person.assignments,
          [activeShiftDay]: {
            ...currentAssignment,
            station: currentAssignment.station || person.station || person.originalStation || "Line Support",
            shiftStart: currentAssignment.shiftStart || person.shiftStart || "",
            shiftEnd: currentAssignment.shiftEnd || person.shiftEnd || "",
            off: false,
            absent: false,
            replacedBy: ""
          }
        }
      };
    });

    saveStaff(updatedStaff);
    renderStaff();
    setScheduleImportStatus(`${getShiftDayLabel(activeShiftDay)} employee restored to the schedule.`, "success");
  };

  const substituteStaffForDay = (staffId) => {
    const staff = getStaff();
    const original = staff.find((person) => person.id === staffId);
    if (!original) return;

    const currentAssignment = getPersonDayAssignment(original, activeShiftDay);
    const replacementName = prompt(`Who is covering ${original.name || "this employee"} on ${getShiftDayLabel(activeShiftDay)}?`);
    const name = replacementName ? replacementName.trim() : "";
    if (!name) return;

    const replacement = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      role: original.role || "Line Cook",
      station: currentAssignment.station || original.station || "Line Support",
      originalStation: currentAssignment.station || original.originalStation || original.station || "Line Support",
      shiftStart: currentAssignment.shiftStart || original.shiftStart || "",
      shiftEnd: currentAssignment.shiftEnd || original.shiftEnd || "",
      substituteFor: original.name || "",
      assignments: buildAssignmentsForActiveDay({
        station: currentAssignment.station || original.station || "Line Support",
        shiftStart: currentAssignment.shiftStart || original.shiftStart || "",
        shiftEnd: currentAssignment.shiftEnd || original.shiftEnd || ""
      })
    };

    replacement.assignments[activeShiftDay].substituteFor = original.name || "";

    markStaffDayOff(staffId, { absent: true, replacedBy: name });
    saveStaff([...getStaff(), replacement]);
    renderStaff();
    setScheduleImportStatus(`${name} now covers ${original.name || "the shift"} on ${getShiftDayLabel(activeShiftDay)}.`, "success");
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
    const assignments = buildAssignmentsFromImport(employee, station);
    const firstWorkingAssignment = shiftDays.map((day) => assignments[day.key]).find(isAssignmentWorking) || {};

    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      role: employee.role || "Line Cook",
      station: firstWorkingAssignment.station || station,
      originalStation: station,
      shiftStart: firstWorkingAssignment.shiftStart || employee.shiftStart || "",
      shiftEnd: firstWorkingAssignment.shiftEnd || employee.shiftEnd || "",
      assignments,
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
        headers: getAuthHeaders({
          "Content-Type": "application/json"
        }),
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
    const dayStaff = getStaffForDay(staff, activeShiftDay);
    if (!dayStaff.length) {
      setScheduleImportStatus(`There are no employees working on ${getShiftDayLabel(activeShiftDay)}.`, "warning");
      return;
    }
    const workingIds = new Set(dayStaff.map((person) => person.id));

    const assignedStaff = staff.map((person) => {
      if (!workingIds.has(person.id)) return person;
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
      `New ${getShiftDayLabel(activeShiftDay)} random station assignment created. Repeats are allowed. Possible combinations: ${getStationCombinationCount(dayStaff.length)}.`,
      "success"
    );
  };

  const resetOriginalStaffStations = () => {
    const staff = getStaff();
    const dayStaff = getStaffForDay(staff, activeShiftDay);
    if (!dayStaff.length) {
      setScheduleImportStatus(`There are no employees working on ${getShiftDayLabel(activeShiftDay)}.`, "warning");
      return;
    }
    const workingIds = new Set(dayStaff.map((person) => person.id));

    const resetStaff = staff.map((person) => {
      if (!workingIds.has(person.id)) return person;
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
              <button type="button" class="secondary-btn" data-print-preset="${escapeHtml(preset.id)}">Preview</button>
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

    showAssignmentPrintPreview(preset.staff, preset.name || "Saved assignment", preset.appliesTo || "");
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
    const smartBreaks = getSmartBreaks(printStaff);

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
              <td>${closeout.verifyBy ? `${escapeHtml(closeout.verifyBy.name || "-")} verifies on arrival${closeout.nextCheckDelta ? ` (${formatGapMinutes(closeout.nextCheckDelta)} later)` : ""}` : "Last shift for this station"}</td>
            </tr>
          `)
          .join("")
      : '<tr><td colspan="4" class="empty">No clean/fill responsibilities for this day.</td></tr>';

    const breakRows = smartBreaks.length
      ? smartBreaks
          .map((breakItem) => `
            <tr>
              <td>${escapeHtml(breakItem.person.name || "-")}</td>
              <td>${escapeHtml(breakItem.person.station || "-")}</td>
              <td>${escapeHtml(breakItem.type)}</td>
              <td>${escapeHtml(formatBreakRange(breakItem))}</td>
            </tr>
          `)
          .join("")
      : '<tr><td colspan="4" class="empty">No smart breaks needed for this day.</td></tr>';

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
            <strong>${printStaff.length}</strong> employees<br />
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
          <h2>Smart Break Plan</h2>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Station</th>
                <th>Break</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>${breakRows}</tbody>
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

  const renderAssignmentPrintRoot = (staff = [], title = "Kitchen Station Assignments", appliesTo = "") => {
    document.getElementById("assignment-print-root")?.remove();

    const printRoot = document.createElement("div");
    printRoot.id = "assignment-print-root";
    printRoot.innerHTML = buildAssignmentPrintMarkup(staff, title, appliesTo);
    document.body.appendChild(printRoot);
  };

  const printAssignmentPreview = () => {
    if (!currentPrintPreview) return;
    renderAssignmentPrintRoot(currentPrintPreview.staff, currentPrintPreview.title, currentPrintPreview.appliesTo);
    setScheduleImportStatus("Opening print dialog. Choose Print or Save as PDF.", "success");
    requestAnimationFrame(() => {
      window.print();
    });
    return true;
  };

  const showAssignmentPrintPreview = (staff = [], title = "Kitchen Station Assignments", appliesTo = "") => {
    if (!assignmentPreviewPanel || !assignmentPreviewBody) {
      setScheduleImportStatus("Print preview is unavailable. Refresh the page and try again.", "error");
      return;
    }

    currentPrintPreview = { staff, title, appliesTo };
    assignmentPreviewBody.innerHTML = buildAssignmentPrintMarkup(staff, title, appliesTo);
    assignmentPreviewPanel.hidden = false;
    assignmentPreviewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    setScheduleImportStatus("Preview ready. Review it, then press Print Now.", "success");
  };

  const closeAssignmentPrintPreview = () => {
    if (assignmentPreviewPanel) assignmentPreviewPanel.hidden = true;
    if (assignmentPreviewBody) assignmentPreviewBody.innerHTML = "";
    currentPrintPreview = null;
  };

  const printAssignmentSheet = () => {
    const staff = getStaff();
    if (!staff.length) {
      setScheduleImportStatus("Add or import employees before printing the assignment sheet.", "warning");
      return;
    }

    showAssignmentPrintPreview(staff);
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

  const selectWestgateMode = (mode) => {
    if (!isKnownWestgateMode(mode)) return;

    westgateMode = mode;
    localStorage.setItem(WESTGATE_MODE_KEY, mode);
    applyClientModuleVisibility();
    showApp();

    const defaultModule = getDefaultModuleForClient();
    if (defaultModule) showModuleByKey(defaultModule, { scroll: false });
    if (mode === "banquets") openSmartSetupIfIncomplete();
  };

  const selectBastidaMode = (mode) => {
    if (mode !== BASTIDA_CEO_MODE) return;

    bastidaMode = mode;
    localStorage.setItem(BASTIDA_MODE_KEY, mode);
    applyClientModuleVisibility();
    showApp();
    showModuleByKey("dashboard", { scroll: false });
  };

  westgateModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectWestgateMode(button.dataset.westgateMode);
    });
  });

  bastidaModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectBastidaMode(button.dataset.bastidaMode);
    });
  });

  if (westgateModeSwitchBtn) {
    westgateModeSwitchBtn.addEventListener("click", () => {
      if (isBastidaClient) {
        bastidaMode = "";
        localStorage.removeItem(BASTIDA_MODE_KEY);
      } else {
        westgateMode = "";
        localStorage.removeItem(WESTGATE_MODE_KEY);
      }
      hideAllMainSections();
      applyClientModuleVisibility();
      if (isBastidaClient) {
        showBastidaModeScreen();
      } else {
        showWestgateModeScreen();
      }
    });
  }

  westgateModeLogoutBtn?.addEventListener("click", logout);
  bastidaModeLogoutBtn?.addEventListener("click", logout);

  if (navRestaurants && restaurantsSection) {
    navRestaurants.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("restaurants");
    });
  }

  if (navOrders && ordersSection) {
    navOrders.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("orders");
    });
  }

  if (navKitchen && kitchenSection) {
    navKitchen.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("kitchen");
    });
  }

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

  if (navReports && reportsSection) {
    navReports.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("reports");
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

  if (addRestaurantBtn) {
    addRestaurantBtn.addEventListener("click", addRestaurant);
  }

  if (refreshRestaurantsBtn) {
    refreshRestaurantsBtn.addEventListener("click", () => {
      renderRestaurants({ refresh: true });
    });
  }

  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", addOrder);
  }

  if (refreshOrdersBtn) {
    refreshOrdersBtn.addEventListener("click", () => {
      renderOrders({ refresh: true });
    });
  }

  if (addStationBtn) {
    addStationBtn.addEventListener("click", addKitchenStation);
  }

  if (refreshKdsBtn) {
    refreshKdsBtn.addEventListener("click", () => {
      renderKds({ refresh: true });
    });
  }

  [ordersRestaurantFilter, ordersStatusFilter].forEach((filter) => {
    filter?.addEventListener("change", renderOrders);
  });

  [orderRestaurantInput, kdsRestaurantFilter].forEach((select) => {
    select?.addEventListener("change", () => {
      populateStationOptions();
      renderKds();
    });
  });

  if (kdsStationFilter) {
    kdsStationFilter.addEventListener("change", renderKds);
  }

  [ordersTableBody, kdsBoard].forEach((container) => {
    container?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-advance-order]");
      if (!button) return;
      updateOrderStatus(button.dataset.advanceOrder, button.dataset.nextStatus);
    });
  });

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

  if (openWeekViewBtn) {
    openWeekViewBtn.addEventListener("click", openWeeklyScheduleView);
  }

  if (closeWeekViewBtn) {
    closeWeekViewBtn.addEventListener("click", closeWeeklyScheduleView);
  }

  if (printWeekViewBtn) {
    printWeekViewBtn.addEventListener("click", printWeeklyScheduleView);
  }

  weekSizeActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      adjustWeeklyScheduleSize(button.dataset.weekSizeAction);
    });
  });

  if (shiftWeekModal) {
    shiftWeekModal.addEventListener("click", (e) => {
      if (e.target === shiftWeekModal) closeWeeklyScheduleView();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && shiftWeekModal && !shiftWeekModal.hidden) {
      closeWeeklyScheduleView();
    }
  });

  if (shiftWeekSchedule) {
    shiftWeekSchedule.addEventListener("click", (e) => {
      const dayButton = e.target.closest("[data-week-day]");
      if (!dayButton) return;

      setActiveShiftDay(dayButton.dataset.weekDay);
    });
  }

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

  if (confirmPrintAssignmentsBtn) {
    confirmPrintAssignmentsBtn.addEventListener("click", printAssignmentPreview);
  }

  if (closeAssignmentPreviewBtn) {
    closeAssignmentPreviewBtn.addEventListener("click", closeAssignmentPrintPreview);
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

  if (addReportFeedbackBtn) {
    addReportFeedbackBtn.addEventListener("click", addReportFeedback);
  }

  if (clearResolvedFeedbackBtn) {
    clearResolvedFeedbackBtn.addEventListener("click", clearResolvedFeedback);
  }

  if (printReportBtn) {
    printReportBtn.addEventListener("click", printReports);
  }

  if (reportsFeedbackList) {
    reportsFeedbackList.addEventListener("change", (e) => {
      const statusSelect = e.target.closest("[data-feedback-status]");
      if (!statusSelect) return;

      updateReportFeedbackStatus(statusSelect.dataset.feedbackStatus, statusSelect.value);
    });

    reportsFeedbackList.addEventListener("click", (e) => {
      const deleteButton = e.target.closest("[data-delete-feedback]");
      if (!deleteButton) return;

      deleteReportFeedback(deleteButton.dataset.deleteFeedback);
    });
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
      const substituteButton = e.target.closest("[data-substitute-staff]");
      if (substituteButton) {
        substituteStaffForDay(substituteButton.dataset.substituteStaff);
        return;
      }

      const dayOffButton = e.target.closest("[data-day-off-staff]");
      if (dayOffButton) {
        markStaffDayOff(dayOffButton.dataset.dayOffStaff);
        setScheduleImportStatus(`${getShiftDayLabel(activeShiftDay)} day off saved.`, "success");
        return;
      }

      const deleteButton = e.target.closest("[data-delete-staff]");
      if (!deleteButton) return;

      deleteStaff(deleteButton.dataset.deleteStaff);
    });
  }

  if (shiftOffBoard) {
    shiftOffBoard.addEventListener("click", (e) => {
      const restoreButton = e.target.closest("[data-restore-staff]");
      if (!restoreButton) return;

      restoreStaffDay(restoreButton.dataset.restoreStaff);
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

  applyClientModuleVisibility();
  if (needsWestgateModeSelection()) {
    showWestgateModeScreen();
  } else if (needsBastidaModeSelection()) {
    showBastidaModeScreen();
  } else {
    showApp();
    const initialModule = getDefaultModuleForClient();
    if (initialModule) showModuleByKey(initialModule, { scroll: false });
  }

  loadOperationsData({ quiet: true })
    .catch((error) => {
      console.warn("Using local operations data because API is unavailable:", error);
    })
    .finally(() => {
      populateRestaurantOptions();
      populateStationOptions();
      renderRestaurants();
      renderOrders();
      renderKds();
    });

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
  if (!needsClientModeSelection()) openSmartSetupIfIncomplete();
});
