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
  const DEFAULT_API_BASE_URL = "https://beoflow-api.onrender.com";
  const isGitHubPages = window.location.hostname.endsWith("github.io");
  const API_BASE_URL = window.BEOFLOW_API_BASE_URL ||
    (isGitHubPages || window.location.protocol === "file:"
      ? DEFAULT_API_BASE_URL
      : window.location.origin);
  const AUTH_TOKEN_KEY = "beoflow_auth_token";
  const AUTH_CLIENT_KEY = "beoflow_auth_client";
  const BASTIDA_LOGO_SRC = "./img/logo_bastida_sys.png";
  const BEOFLOW_LOGO_SRC = "./img/logobeoflow.png";
  const WESTGATE_MODE_KEY = "beoflow_westgate_mode";
  const BASTIDA_MODE_KEY = "beoflow_bastida_mode";
  const RESTAURANT_SELECTION_ID_KEY = "beoflow_selected_restaurant_id";
  const RESTAURANT_SELECTION_NAME_KEY = "beoflow_selected_restaurant_name";
  const BASTIDA_CEO_MODE = "ceo";
  const WESTGATE_MODE_MODULES = {
    banquets: new Set(["dashboard", "events", "menus", "recipes", "subRecipes", "inventory", "production", "staff", "reports", "eventForm"]),
    pizzaMkt: new Set(["restaurants", "orders", "kitchen"])
  };
  const CLIENT_WORKSPACE_MODULES = new Set(["dashboard", "events", "menus", "recipes", "subRecipes", "inventory", "production", "staff", "reports", "eventForm"]);
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
  const restaurantSelectScreen = document.getElementById("restaurant-select-screen");
  const appContainer = document.querySelector(".app-container");
  const appBrandLogo = document.getElementById("app-brand-logo");
  const appBrandTitle = document.getElementById("app-brand-title");
  const appBrandSubtitle = document.getElementById("app-brand-subtitle");
  const mobileMenuPanel = document.getElementById("mobile-menu-panel");
  const loginForm = document.getElementById("client-login-form");
  const signupForm = document.getElementById("client-signup-form");
  const authLoginModeBtn = document.getElementById("auth-login-mode");
  const authSignupModeBtn = document.getElementById("auth-signup-mode");
  const loginClientCodeInput = document.getElementById("loginClientCode");
  const loginPasswordInput = document.getElementById("loginPassword");
  const signupBusinessNameInput = document.getElementById("signupBusinessName");
  const signupFullNameInput = document.getElementById("signupFullName");
  const signupEmailInput = document.getElementById("signupEmail");
  const signupPasswordInput = document.getElementById("signupPassword");
  const signupPasswordConfirmInput = document.getElementById("signupPasswordConfirm");
  const toggleLoginPasswordBtn = document.getElementById("toggle-login-password");
  const loginStatus = document.getElementById("login-status");
  const logoutBtn = document.getElementById("logout-btn");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileLogoutBtn = document.getElementById("mobile-logout-btn");
  const westgateModeLogoutBtn = document.getElementById("westgate-mode-logout");
  const bastidaModeLogoutBtn = document.getElementById("bastida-mode-logout");
  const restaurantSelectLogoutBtn = document.getElementById("restaurant-select-logout");
  const restaurantSelectClientLabel = document.getElementById("restaurant-select-client-label");
  const restaurantSelectTitle = document.getElementById("restaurant-select-title");
  const restaurantSelectDescription = document.getElementById("restaurant-select-description");
  const restaurantSelectOptions = document.getElementById("restaurant-select-options");
  const restaurantSelectStatus = document.getElementById("restaurant-select-status");
  const restaurantSelectAddToggleBtn = document.getElementById("restaurant-select-add-toggle");
  const restaurantSelectAddForm = document.getElementById("restaurant-select-add-form");
  const restaurantSelectNameInput = document.getElementById("restaurant-select-name");
  const restaurantSelectTypeInput = document.getElementById("restaurant-select-type");
  const restaurantSelectLocationInput = document.getElementById("restaurant-select-location");
  const restaurantSelectSaveBtn = document.getElementById("restaurant-select-save");
  const restaurantSelectCancelBtn = document.getElementById("restaurant-select-cancel");
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
  const configuredClientModules = Array.isArray(currentClient.modules) && currentClient.modules.length
    ? new Set(currentClient.modules)
    : null;
  const clientDefaultModule = String(currentClient.defaultModule || "").trim();
  const hasConfiguredClientModules = Boolean(configuredClientModules);
  const shouldShowLockedModules = Boolean(currentClient.lockedModulesVisible);
  const currentClientCodeKey = String(currentClientCode).trim().toLowerCase();
  const westgateClientCodes = new Set(["westgate", "westgate@bastidasystems.io"]);
  const isWestgateClient = westgateClientCodes.has(currentClientCodeKey);
  const bastidaClientCodes = new Set(["bastida01", "bastidasystems@gmail.com"]);
  const isBastidaClient = bastidaClientCodes.has(currentClientCodeKey);
  const isSpecialConfiguredClient = hasConfiguredClientModules || Boolean(currentClient.accountType === "special");
  const isRestaurantSelectionClient = Boolean(currentClient.requiresRestaurantSelection) || (!isBastidaClient && !isWestgateClient && !isSpecialConfiguredClient);
  const getClientScopedStorageKey = (key) => currentClientCodeKey ? `${key}:${currentClientCodeKey}` : key;
  let westgateMode = isWestgateClient ? localStorage.getItem(WESTGATE_MODE_KEY) || "" : "";
  let bastidaMode = isBastidaClient ? localStorage.getItem(BASTIDA_MODE_KEY) || "" : "";
  let selectedRestaurantId = isRestaurantSelectionClient ? localStorage.getItem(getClientScopedStorageKey(RESTAURANT_SELECTION_ID_KEY)) || "" : "";
  let selectedRestaurantName = isRestaurantSelectionClient ? localStorage.getItem(getClientScopedStorageKey(RESTAURANT_SELECTION_NAME_KEY)) || "" : "";
  const isKnownWestgateMode = (mode) => Boolean(WESTGATE_MODE_MODULES[mode]);
  const needsWestgateModeSelection = () => isWestgateClient && !isKnownWestgateMode(westgateMode);
  const needsBastidaModeSelection = () => isBastidaClient && bastidaMode !== BASTIDA_CEO_MODE;
  const needsRestaurantSelection = () => isRestaurantSelectionClient && !selectedRestaurantId;
  const needsClientModeSelection = () => needsWestgateModeSelection() || needsBastidaModeSelection() || needsRestaurantSelection();
  const canUseSmartSetup = () => !hasConfiguredClientModules && !isBastidaClient && (!isWestgateClient || westgateMode === "banquets");
  const applyClientBranding = () => {
    appContainer?.classList.toggle("is-westgate", isWestgateClient);
    appContainer?.classList.toggle("is-bastida", isBastidaClient);
    appContainer?.classList.toggle("is-client-scoped", hasConfiguredClientModules);

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
      if (appBrandSubtitle) appBrandSubtitle.textContent = "CEO Command Center";
      return;
    }

    if (isRestaurantSelectionClient) {
      if (appBrandLogo) {
        appBrandLogo.src = BEOFLOW_LOGO_SRC;
        appBrandLogo.alt = "BEOFlow Logo";
      }
      if (appBrandTitle) appBrandTitle.textContent = currentClient.brandTitle || "Beoflow";
      if (appBrandSubtitle) {
        appBrandSubtitle.textContent = selectedRestaurantName || currentClient.displayName || "Restaurant workspace";
      }
      return;
    }

    if (hasConfiguredClientModules) {
      if (appBrandLogo) {
        appBrandLogo.src = BEOFLOW_LOGO_SRC;
        appBrandLogo.alt = "BEOFlow Logo";
      }
      if (appBrandTitle) appBrandTitle.textContent = currentClient.brandTitle || "Beoflow";
      if (appBrandSubtitle) {
        appBrandSubtitle.textContent = selectedRestaurantName || currentClient.brandSubtitle || currentClient.displayName || "Bastida Systems";
      }
      return;
    }

    if (appBrandLogo) {
      appBrandLogo.src = BEOFLOW_LOGO_SRC;
      appBrandLogo.alt = "BEOFlow Logo";
    }
    if (appBrandTitle) appBrandTitle.textContent = "Beoflow";
    if (appBrandSubtitle) appBrandSubtitle.textContent = "Bastida Systems";
  };

  const getClientDataContextId = () =>
    isRestaurantSelectionClient && selectedRestaurantId ? `restaurant:${selectedRestaurantId}` : "global";

  const getSelectedRestaurantHeaders = () =>
    isRestaurantSelectionClient && selectedRestaurantId
      ? {
          "X-BEOFlow-Restaurant-Id": selectedRestaurantId,
          "X-BEOFlow-Context-Id": getClientDataContextId()
        }
      : {};

  const getAuthHeaders = (headers = {}) => ({
    ...headers,
    ...getSelectedRestaurantHeaders(),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
  });

  const setAuthStatus = (message = "", type = "info") => {
    if (!loginStatus) return;
    loginStatus.textContent = message;
    loginStatus.dataset.type = type;
  };

  const setAuthMode = (mode = "login") => {
    const isSignup = mode === "signup";
    if (loginForm) loginForm.hidden = isSignup;
    if (signupForm) signupForm.hidden = !isSignup;
    authLoginModeBtn?.classList.toggle("active", !isSignup);
    authSignupModeBtn?.classList.toggle("active", isSignup);
    authLoginModeBtn?.setAttribute("aria-selected", String(!isSignup));
    authSignupModeBtn?.setAttribute("aria-selected", String(isSignup));
    setAuthStatus();
    (isSignup ? signupBusinessNameInput : loginClientCodeInput)?.focus();
  };

  const showLogin = (message = "") => {
    closeMobileMenu();
    if (appContainer) appContainer.hidden = true;
    if (westgateModeScreen) westgateModeScreen.hidden = true;
    if (bastidaModeScreen) bastidaModeScreen.hidden = true;
    if (restaurantSelectScreen) restaurantSelectScreen.hidden = true;
    if (loginScreen) loginScreen.hidden = false;
    setAuthStatus(message, message ? "error" : "info");
    (signupForm && !signupForm.hidden ? signupBusinessNameInput : loginClientCodeInput)?.focus();
  };

  const showApp = () => {
    applyClientBranding();
    closeMobileMenu();
    if (loginScreen) loginScreen.hidden = true;
    if (westgateModeScreen) westgateModeScreen.hidden = true;
    if (bastidaModeScreen) bastidaModeScreen.hidden = true;
    if (restaurantSelectScreen) restaurantSelectScreen.hidden = true;
    if (appContainer) appContainer.hidden = false;
  };

  const showWestgateModeScreen = () => {
    closeMobileMenu();
    if (loginScreen) loginScreen.hidden = true;
    if (appContainer) appContainer.hidden = true;
    if (bastidaModeScreen) bastidaModeScreen.hidden = true;
    if (restaurantSelectScreen) restaurantSelectScreen.hidden = true;
    if (westgateModeScreen) westgateModeScreen.hidden = false;
  };

  const showBastidaModeScreen = () => {
    closeMobileMenu();
    if (loginScreen) loginScreen.hidden = true;
    if (appContainer) appContainer.hidden = true;
    if (westgateModeScreen) westgateModeScreen.hidden = true;
    if (restaurantSelectScreen) restaurantSelectScreen.hidden = true;
    if (bastidaModeScreen) bastidaModeScreen.hidden = false;
  };

  const showRestaurantSelectScreen = () => {
    closeMobileMenu();
    if (loginScreen) loginScreen.hidden = true;
    if (appContainer) appContainer.hidden = true;
    if (westgateModeScreen) westgateModeScreen.hidden = true;
    if (bastidaModeScreen) bastidaModeScreen.hidden = true;
    if (restaurantSelectScreen) restaurantSelectScreen.hidden = false;
  };

  const setMobileMenuOpen = (isOpen) => {
    appContainer?.classList.toggle("mobile-menu-open", isOpen);
    mobileMenuToggle?.setAttribute("aria-expanded", String(isOpen));
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  mobileMenuToggle?.addEventListener("click", () => {
    setMobileMenuOpen(!appContainer?.classList.contains("mobile-menu-open"));
  });
  mobileMenuPanel?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMobileMenu();
  });

  const readClientDataSnapshot = () =>
    CLIENT_DATA_KEYS.reduce((snapshot, key) => {
      try {
        snapshot[key] = JSON.parse(localStorage.getItem(key) || "null");
      } catch {
        snapshot[key] = null;
      }
      return snapshot;
    }, {});

  const clearClientDataSnapshot = () => {
    CLIENT_DATA_KEYS.forEach((key) => localStorage.removeItem(key));
  };

  const refreshAuthenticatedClient = async () => {
    if (!authToken) return;

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_CLIENT_KEY);
      authToken = "";
      throw new Error("Session expired. Sign in again.");
    }

    if (!response.ok) {
      throw new Error("Client session could not be loaded.");
    }

    const result = await response.json();
    const refreshedClient = result.client && typeof result.client === "object" ? result.client : null;
    if (refreshedClient) {
      const currentClientSnapshot = localStorage.getItem(AUTH_CLIENT_KEY) || "";
      const nextClientSnapshot = JSON.stringify(refreshedClient);
      if (currentClientSnapshot !== nextClientSnapshot) {
        localStorage.setItem(AUTH_CLIENT_KEY, nextClientSnapshot);
        window.location.reload();
        return false;
      }
    }

    return true;
  };

  const validateSelectedRestaurantSession = async () => {
    if (!isRestaurantSelectionClient || !selectedRestaurantId) return true;
    if (!/^\d+$/.test(String(selectedRestaurantId))) {
      localStorage.removeItem(getClientScopedStorageKey(RESTAURANT_SELECTION_ID_KEY));
      localStorage.removeItem(getClientScopedStorageKey(RESTAURANT_SELECTION_NAME_KEY));
      selectedRestaurantId = "";
      selectedRestaurantName = "";
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/api/restaurants/${encodeURIComponent(selectedRestaurantId)}`, {
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_CLIENT_KEY);
      authToken = "";
      throw new Error("Session expired. Sign in again.");
    }

    if (response.ok) return true;
    localStorage.removeItem(getClientScopedStorageKey(RESTAURANT_SELECTION_ID_KEY));
    localStorage.removeItem(getClientScopedStorageKey(RESTAURANT_SELECTION_NAME_KEY));
    selectedRestaurantId = "";
    selectedRestaurantName = "";
    return false;
  };

  const saveClientDataNow = async (data) => {
    if (!authToken || (isRestaurantSelectionClient && !selectedRestaurantId)) return;

    await fetch(`${API_BASE_URL}/api/client-data`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ data, contextId: getClientDataContextId() })
    });
  };

  const hydrateClientData = async (options = {}) => {
    const { seedEmptyRemote = true } = options;
    const localSnapshot = readClientDataSnapshot();
    const contextId = getClientDataContextId();
    const response = await fetch(`${API_BASE_URL}/api/client-data?contextId=${encodeURIComponent(contextId)}`, {
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
    const refreshedClient = result.client && typeof result.client === "object" ? result.client : null;
    if (refreshedClient) {
      const currentClientSnapshot = localStorage.getItem(AUTH_CLIENT_KEY) || "";
      const nextClientSnapshot = JSON.stringify(refreshedClient);
      if (currentClientSnapshot !== nextClientSnapshot) {
        localStorage.setItem(AUTH_CLIENT_KEY, nextClientSnapshot);
        window.location.reload();
        return false;
      }
    }

    const remoteData = result.data || {};
    const hasRemoteData = Object.keys(remoteData).length > 0;

    if (!hasRemoteData) {
      if (seedEmptyRemote) {
        await saveClientDataNow(localSnapshot);
      } else {
        clearClientDataSnapshot();
      }
      return true;
    }

    if (!seedEmptyRemote) clearClientDataSnapshot();
    Object.entries(remoteData).forEach(([key, value]) => {
      if (!CLIENT_DATA_KEY_SET.has(key)) return;
      localStorage.setItem(key, JSON.stringify(value));
    });

    return true;
  };

  const syncClientDataKey = (key, value) => {
    if (!authToken || !CLIENT_DATA_KEY_SET.has(key) || (isRestaurantSelectionClient && !selectedRestaurantId)) return;

    if (syncTimers.has(key)) clearTimeout(syncTimers.get(key));
    syncTimers.set(
      key,
      setTimeout(async () => {
        try {
          await fetch(`${API_BASE_URL}/api/client-data/${encodeURIComponent(key)}`, {
            method: "PUT",
            headers: getAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ value, contextId: getClientDataContextId() })
          });
        } catch (error) {
          console.warn(`Could not sync ${key}:`, error);
        }
      }, 300)
    );
  };

  const applyAuthenticatedClient = (result = {}) => {
    authToken = result.token;
    localStorage.setItem(AUTH_TOKEN_KEY, result.token);
    localStorage.setItem(AUTH_CLIENT_KEY, JSON.stringify(result.client || {}));
    window.location.reload();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthStatus("Signing in...", "info");

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

      applyAuthenticatedClient(result);
    } catch (error) {
      setAuthStatus(error.message || "Sign in failed.", "error");
      if (loginPasswordInput) loginPasswordInput.value = "";
      loginPasswordInput?.focus();
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    const businessName = signupBusinessNameInput?.value.trim() || "";
    const fullName = signupFullNameInput?.value.trim() || "";
    const email = signupEmailInput?.value.trim() || "";
    const password = signupPasswordInput?.value || "";
    const passwordConfirm = signupPasswordConfirmInput?.value || "";

    if (!businessName || !fullName || !email || !password || !passwordConfirm) {
      setAuthStatus("Fill in all account fields.", "error");
      return;
    }

    if (password.length < 8) {
      setAuthStatus("Password must be at least 8 characters.", "error");
      signupPasswordInput?.focus();
      return;
    }

    if (password !== passwordConfirm) {
      setAuthStatus("Passwords do not match.", "error");
      if (signupPasswordConfirmInput) signupPasswordConfirmInput.value = "";
      signupPasswordConfirmInput?.focus();
      return;
    }

    const submitButton = signupForm?.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;
    setAuthStatus("Creating account...", "info");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, fullName, email, password })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Account could not be created.");
      }

      setAuthStatus("Account created. Opening BEOFlow...", "success");
      applyAuthenticatedClient(result);
    } catch (error) {
      setAuthStatus(error.message || "Account could not be created.", "error");
      if (signupPasswordInput) signupPasswordInput.value = "";
      if (signupPasswordConfirmInput) signupPasswordConfirmInput.value = "";
      signupPasswordInput?.focus();
      if (submitButton) submitButton.disabled = false;
    }
  };

  const setLoginPasswordVisible = (isVisible) => {
    if (!loginPasswordInput || !toggleLoginPasswordBtn) return;
    const eyeIcon = toggleLoginPasswordBtn.querySelector(".password-toggle-eye");
    const eyeOffIcon = toggleLoginPasswordBtn.querySelector(".password-toggle-eye-off");
    loginPasswordInput.type = isVisible ? "text" : "password";
    toggleLoginPasswordBtn.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
    toggleLoginPasswordBtn.setAttribute("aria-pressed", String(isVisible));
    if (eyeIcon) eyeIcon.hidden = isVisible;
    if (eyeOffIcon) eyeOffIcon.hidden = !isVisible;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CLIENT_KEY);
    localStorage.removeItem(WESTGATE_MODE_KEY);
    localStorage.removeItem(BASTIDA_MODE_KEY);
    localStorage.removeItem(RESTAURANT_SELECTION_ID_KEY);
    localStorage.removeItem(RESTAURANT_SELECTION_NAME_KEY);
    localStorage.removeItem(getClientScopedStorageKey(RESTAURANT_SELECTION_ID_KEY));
    localStorage.removeItem(getClientScopedStorageKey(RESTAURANT_SELECTION_NAME_KEY));
    window.location.reload();
  };

  loginForm?.addEventListener("submit", handleLogin);
  signupForm?.addEventListener("submit", handleSignup);
  authLoginModeBtn?.addEventListener("click", () => setAuthMode("login"));
  authSignupModeBtn?.addEventListener("click", () => setAuthMode("signup"));
  toggleLoginPasswordBtn?.addEventListener("click", () => {
    setLoginPasswordVisible(loginPasswordInput?.type === "password");
    loginPasswordInput?.focus();
  });
  logoutBtn?.addEventListener("click", logout);
  mobileLogoutBtn?.addEventListener("click", logout);

  if (!authToken) {
    showLogin();
    return;
  }

  try {
    const isSelectedRestaurantValid = await validateSelectedRestaurantSession();
    if (!isSelectedRestaurantValid) {
      const didRefresh = await refreshAuthenticatedClient();
      if (!didRefresh) return;
    } else if (isRestaurantSelectionClient && !selectedRestaurantId) {
      const didRefresh = await refreshAuthenticatedClient();
      if (!didRefresh) return;
    } else {
      const didHydrate = await hydrateClientData({
        seedEmptyRemote: !isRestaurantSelectionClient
      });
      if (!didHydrate) return;
    }
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
  const menuTypeOptions = document.getElementById("menu-type-options");
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
  const menuRecipesPicker = document.getElementById("menu-recipes-picker");
  const menuRecipesSummary = document.getElementById("menu-recipes-summary");
  const selectAllMenuRecipesBtn = document.getElementById("select-all-menu-recipes");
  const clearMenuRecipesBtn = document.getElementById("clear-menu-recipes");
  let editingMenuId = null;
  const addRecipeBtn = document.getElementById("add-recipe-btn");
  const recipesTableBody = document.getElementById("recipes-table-body");
  const recipeNameInput = document.getElementById("recipeName");
  const recipeCategoryInput = document.getElementById("recipeCategory");
  const recipeSheetNameInput = document.getElementById("recipeSheetName");
  const recipeCostInput = document.getElementById("recipeCost");
  const recipePortionsInput = document.getElementById("recipePortions");
  const recipeYieldInput = document.getElementById("recipeYield");
  const recipeYieldDisplay = document.getElementById("recipeYieldDisplay");
  const recipeNumberDisplay = document.getElementById("recipeNumberDisplay");
  const recipePreparationInput = document.getElementById("recipePreparation");
  const recipeNotesInput = document.getElementById("recipeNotes");
  const recipePhotoInput = document.getElementById("recipePhoto");
  const recipePhotoPreview = document.getElementById("recipePhotoPreview");
  const removeRecipePhotoBtn = document.getElementById("removeRecipePhoto");
  const recipeResetBtn = document.getElementById("recipe-reset-btn");
  const recipeCategoryOptions = document.getElementById("recipe-category-options");
  const recipeIngredientSearchInput = document.getElementById("recipeIngredientSearch");
  const recipeIngredientItemInput = document.getElementById("recipeIngredientItem");
  const recipeIngredientMatches = document.getElementById("recipeIngredientMatches");
  const recipeIngredientStatus = document.getElementById("recipeIngredientStatus");
  const recipeIngredientHelp = document.getElementById("recipe-ingredient-help");
  const recipeIngredientQtyInput = document.getElementById("recipeIngredientQty");
  const recipeIngredientUnitInput = document.getElementById("recipeIngredientUnit");
  const recipeQuickInventoryFields = document.getElementById("recipeQuickInventoryFields");
  const recipeIngredientCodeDisplay = document.getElementById("recipeIngredientCodeDisplay");
  const recipeCostSummaryGrid = document.getElementById("recipe-cost-summary-grid");
  const recipeNewInventoryQuantityInput = document.getElementById("recipeNewInventoryQuantity");
  const recipeNewInventoryUnitInput = document.getElementById("recipeNewInventoryUnit");
  const recipeNewInventoryTotalCostInput = document.getElementById("recipeNewInventoryTotalCost");
  const recipeNewInventoryStorageAreaInput = document.getElementById("recipeNewInventoryStorageArea");
  const addRecipeIngredientBtn = document.getElementById("add-recipe-ingredient-btn");
  const selectedIngredientsList = document.getElementById("selected-ingredients-list");
  const recipeCardGrid = document.getElementById("recipe-card-grid");
  const addSubRecipeBtn = document.getElementById("add-sub-recipe-btn");
  const subRecipesTableBody = document.getElementById("sub-recipes-table-body");
  const subRecipeNameInput = document.getElementById("subRecipeName");
  const subRecipeCategoryInput = document.getElementById("subRecipeCategory");
  const subRecipeYieldInput = document.getElementById("subRecipeYield");
  const subRecipeYieldUnitInput = document.getElementById("subRecipeYieldUnit");
  const subRecipeWasteInput = document.getElementById("subRecipeWaste");
  const subRecipePreparationInput = document.getElementById("subRecipePreparation");
  const subRecipeNotesInput = document.getElementById("subRecipeNotes");
  const subRecipePhotoInput = document.getElementById("subRecipePhoto");
  const subRecipePhotoPreview = document.getElementById("subRecipePhotoPreview");
  const removeSubRecipePhotoBtn = document.getElementById("removeSubRecipePhoto");
  const subRecipeCategoryOptions = document.getElementById("sub-recipe-category-options");
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
  const subRecipeCardGrid = document.getElementById("sub-recipe-card-grid");
  const ingredientsModal = document.getElementById("ingredients-modal");
  const ingredientsModalTitle = document.getElementById("ingredients-modal-title");
  const ingredientsModalBody = document.getElementById("ingredients-modal-body");
  const closeIngredientsModalBtn = document.getElementById("close-ingredients-modal");
  let currentRecipeIngredients = [];
  let editingRecipeIngredientIndex = null;
  let editingRecipeId = null;
  let currentRecipePhotoDataUrl = "";
  let currentSubRecipeIngredients = [];
  let editingSubRecipeId = null;
  let currentSubRecipePhotoDataUrl = "";
  let lineOpsUsersCache = [];
  let activeModuleKey = "dashboard";
  let moduleBeforeForm = "dashboard";
  let activeEventFilter = null;
  const navInventory = document.getElementById("nav-inventory");
  const navProduction = document.getElementById("nav-production");
  const navStaff = document.getElementById("nav-staff");
  const navLineOpsUsers = document.getElementById("nav-lineops-users");
  const navReports = document.getElementById("nav-reports");
  const westgateModeSwitchBtn = document.getElementById("westgate-mode-switch");
  const inventorySection = document.getElementById("inventory-section");
  const productionSection = document.getElementById("production-section");
  const productionTableBody = document.getElementById("production-table-body");
  const staffSection = document.getElementById("staff-section");
  const lineOpsUsersSection = document.getElementById("lineops-users-section");
  const lineOpsUsersTableBody = document.getElementById("lineops-users-table-body");
  const lineOpsUsersStatus = document.getElementById("lineops-users-status");
  const refreshLineOpsUsersBtn = document.getElementById("refresh-lineops-users-btn");
  const lineOpsUsersTotal = document.getElementById("lineops-users-total");
  const lineOpsUsersActive = document.getElementById("lineops-users-active");
  const lineOpsUsersOnboarded = document.getElementById("lineops-users-onboarded");
  const lineOpsUsersDeleted = document.getElementById("lineops-users-deleted");
  const lineOpsUserEditorModal = document.getElementById("lineops-user-editor-modal");
  const lineOpsUserEditorForm = document.getElementById("lineops-user-editor-form");
  const lineOpsEditUserIdInput = document.getElementById("lineops-edit-user-id");
  const lineOpsEditBusinessNameInput = document.getElementById("lineops-edit-business-name");
  const lineOpsEditFullNameInput = document.getElementById("lineops-edit-full-name");
  const lineOpsEditEmailInput = document.getElementById("lineops-edit-email");
  const lineOpsEditBusinessTypeInput = document.getElementById("lineops-edit-business-type");
  const lineOpsEditTeamSizeInput = document.getElementById("lineops-edit-team-size");
  const lineOpsEditDepartmentInput = document.getElementById("lineops-edit-department");
  const lineOpsEditOnboardedInput = document.getElementById("lineops-edit-onboarded");
  const lineOpsEditGoalInputs = Array.from(document.querySelectorAll("[name='lineops-edit-goal']"));
  const lineOpsUserEditorStatus = document.getElementById("lineops-user-editor-status");
  const closeLineOpsUserEditorBtn = document.getElementById("close-lineops-user-editor");
  const cancelLineOpsUserEditorBtn = document.getElementById("cancel-lineops-user-editor");
  const saveLineOpsUserEditorBtn = document.getElementById("save-lineops-user-editor");
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
  const addScheduleRowBtn = document.getElementById("add-schedule-row-btn");
  const loadReferenceScheduleBtn = document.getElementById("load-reference-schedule-btn");
  const openScheduleEditorBtn = document.getElementById("open-schedule-editor-btn");
  const closeScheduleEditorBtn = document.getElementById("close-schedule-editor-btn");
  const importScheduleBtn = document.getElementById("import-schedule-btn");
  const autoAssignStationsBtn = document.getElementById("auto-assign-stations-btn");
  const resetOriginalStationsBtn = document.getElementById("reset-original-stations-btn");
  const printAssignmentsBtn = document.getElementById("print-assignments-btn");
  const clearShiftReadinessBtn = document.getElementById("clear-shift-readiness-btn");
  const assignmentPresetNameInput = document.getElementById("assignmentPresetName");
  const assignmentPresetDateInput = document.getElementById("assignmentPresetDate");
  const saveAssignmentPresetBtn = document.getElementById("save-assignment-preset-btn");
  const assignmentPresetsList = document.getElementById("assignment-presets-list");
  const scheduleImageInput = document.getElementById("scheduleImage");
  const scheduleImportStatus = document.getElementById("schedule-import-status");
  const scheduleEditorModal = document.getElementById("schedule-editor-modal");
  const scheduleEditorSummary = document.getElementById("schedule-editor-summary");
  const scheduleEditorTable = document.getElementById("schedule-editor-table");
  const shiftDayTabs = Array.from(document.querySelectorAll("[data-shift-day]"));
  const openWeekViewBtn = document.getElementById("open-week-view-btn");
  const addWeekRowBtn = document.getElementById("add-week-row-btn");
  const autoAssignWeekBtn = document.getElementById("auto-assign-week-btn");
  const closeWeekViewBtn = document.getElementById("close-week-view-btn");
  const printWeekViewBtn = document.getElementById("print-week-view-btn");
  const shiftWeekModal = document.getElementById("shift-week-modal");
  const shiftWeekTitle = document.getElementById("shift-week-title");
  const shiftWeekSubtitle = document.getElementById("shift-week-subtitle");
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
  const syncSmartSetupSurface = (moduleKey = activeModuleKey) => {
    const shouldShow = canUseSmartSetup() && moduleKey === "dashboard";
    setClientOnlyElementVisibility(smartSetupLauncher, shouldShow);

    if (!smartSetupSection) return;
    if (!shouldShow) {
      smartSetupSection.hidden = true;
      smartSetupSection.style.display = "none";
      smartSetupLauncher?.setAttribute("aria-expanded", "false");
      return;
    }

    smartSetupSection.style.display = "";
  };
  const setModuleNavAccess = (moduleKey, navItem, available) => {
    if (!navItem) return;

    const shouldShow = available || shouldShowLockedModules;
    setClientOnlyElementVisibility(navItem, shouldShow);
    navItem.classList.toggle("is-locked", shouldShow && !available);
    navItem.setAttribute("aria-disabled", String(shouldShow && !available));
    navItem.tabIndex = shouldShow && !available ? -1 : 0;
    navItem.dataset.moduleKey = moduleKey;
  };
  const clientNavItems = [
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
  ];
  const getWestgateModeModules = () => WESTGATE_MODE_MODULES[westgateMode] || null;
  const getDefaultModuleForClient = () => {
    if (isBastidaClient) return bastidaMode === BASTIDA_CEO_MODE ? "dashboard" : null;
    if (isRestaurantSelectionClient) return selectedRestaurantId ? "dashboard" : null;
    if (hasConfiguredClientModules) {
      if (clientDefaultModule && configuredClientModules.has(clientDefaultModule)) return clientDefaultModule;
      return configuredClientModules.values().next().value || "dashboard";
    }
    if (!isWestgateClient) return "dashboard";
    return isKnownWestgateMode(westgateMode) ? WESTGATE_DEFAULT_MODULES[westgateMode] : null;
  };
  const isModuleAvailableForClient = (moduleKey) => {
    if (moduleKey === "lineOpsUsers") return isBastidaClient && bastidaMode === BASTIDA_CEO_MODE;
    if (isBastidaClient) return bastidaMode === BASTIDA_CEO_MODE;
    if (isRestaurantSelectionClient) return Boolean(selectedRestaurantId && CLIENT_WORKSPACE_MODULES.has(moduleKey));
    if (hasConfiguredClientModules) return configuredClientModules.has(moduleKey);
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
        navLineOpsUsers,
        navReports
      ].forEach((navItem) => setClientOnlyElementVisibility(navItem, bastidaMode === BASTIDA_CEO_MODE));
      setClientOnlyElementVisibility(westgateModeSwitchBtn, bastidaMode === BASTIDA_CEO_MODE);
      if (westgateModeSwitchBtn) westgateModeSwitchBtn.textContent = "Change view";
      hideClientOnlyElement(smartSetupSection);
      hideClientOnlyElement(smartSetupLauncher);
      return;
    }

    if (hasConfiguredClientModules) {
      clientNavItems.forEach(([moduleKey, navItem]) => {
        setModuleNavAccess(moduleKey, navItem, isModuleAvailableForClient(moduleKey));
      });
      hideClientOnlyElement(navLineOpsUsers);
      hideClientOnlyElement(westgateModeSwitchBtn);
      hideClientOnlyElement(smartSetupSection);
      hideClientOnlyElement(smartSetupLauncher);
      return;
    }

    if (isRestaurantSelectionClient) {
      clientNavItems.forEach(([moduleKey, navItem]) => {
        setModuleNavAccess(moduleKey, navItem, isModuleAvailableForClient(moduleKey));
      });
      hideClientOnlyElement(navLineOpsUsers);
      setClientOnlyElementVisibility(westgateModeSwitchBtn, Boolean(selectedRestaurantId));
      if (westgateModeSwitchBtn) westgateModeSwitchBtn.textContent = "Change area";
      syncSmartSetupSurface(activeModuleKey);
      return;
    }

    if (!isWestgateClient) {
      clientNavItems.forEach(([, navItem]) => setModuleNavAccess("", navItem, true));
      hideClientOnlyElement(navLineOpsUsers);
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
      setModuleNavAccess(moduleKey, navItem, Boolean(modules?.has(moduleKey)));
    });

    setClientOnlyElementVisibility(westgateModeSwitchBtn, Boolean(modules));
    if (westgateModeSwitchBtn) westgateModeSwitchBtn.textContent = "Change area";
    syncSmartSetupSurface(activeModuleKey);
  };
  const weekSizeIndicator = document.getElementById("week-size-indicator");
  const shiftReadinessBoard = document.getElementById("shift-readiness-board");
  const shiftOffBoard = document.getElementById("shift-off-board");
  const shiftKpiEmployees = document.getElementById("shift-kpi-employees");
  const shiftKpiReady = document.getElementById("shift-kpi-ready");
  const shiftKpiNotReady = document.getElementById("shift-kpi-not-ready");
  const shiftKpiHandoffs = document.getElementById("shift-kpi-handoffs");
  const openStationsKpi = document.getElementById("open-stations-kpi");
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
  const inventoryCategoryOptions = document.getElementById("inventory-category-options");
  const storageAreaOptions = document.getElementById("storage-area-options");
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
      id: "spice",
      label: "Spices & Seasoning",
      icon: "🧂",
      className: "spice",
      keywords: ["spice", "seasoning", "salt", "pepper", "paprika", "cumin", "oregano", "sazon", "sazón", "herb", "herbs"]
    },
    {
      id: "prep",
      label: "Prep Recipes",
      icon: "🍲",
      className: "prep",
      keywords: ["prep", "sauce", "salsa", "dressing", "base", "stock", "marinade", "guacamole", "pico"]
    },
    {
      id: "paper",
      label: "Paper & Disposables",
      icon: "▦",
      className: "paper",
      keywords: ["paper", "napkin", "plate", "cup", "straw", "to-go", "togo", "container", "lid", "disposable"]
    },
    {
      id: "cleaning",
      label: "Cleaning & Chemicals",
      icon: "◇",
      className: "cleaning",
      keywords: ["clean", "cleaning", "chemical", "soap", "sanitizer", "detergent", "bleach", "degreaser"]
    },
    {
      id: "other",
      label: "Other",
      icon: "📦",
      className: "other",
      keywords: []
    }
  ];

  const defaultRecipeCategories = ["Entree", "Side", "Salad", "Dessert", "Beverage", "Sauce", "Breakfast", "Brunch", "Buffet", "Action Station", "Passed Appetizer"];
  const defaultSubRecipeCategories = ["Sauce", "Dressing", "Salsa", "Garnish", "Prep Base", "Side Prep", "Marinade", "Stock", "Filling", "Batch Mix"];
  const defaultMenuTypes = [
    "Buffet",
    "Plated Dinner",
    "Cocktail Reception",
    "Breakfast",
    "Lunch",
    "Brunch",
    "Family Style",
    "Stationed Reception",
    "Action Stations",
    "Chef's Tasting",
    "Boxed Meals",
    "Coffee Break"
  ];
  const defaultStorageAreas = [
    "Refrigerated",
    "Frozen",
    "Dry Storage",
    "Walk-in Cooler",
    "Walk-in Freezer",
    "Prep Area",
    "Banquet Kitchen",
    "Hot Line",
    "Cold Line",
    "Pastry",
    "Bar Storage",
    "Receiving",
    "Expo Cooler"
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
    restaurantId: normalizeId(event.restaurant_id ?? event.restaurantId),
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
        restaurant_id: selectedRestaurantId || eventData.restaurantId || null,
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
        restaurant_id: selectedRestaurantId || eventData.restaurantId || null,
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
      restaurantId: normalizeId(item.restaurant_id ?? item.restaurantId),
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
    restaurant_id: selectedRestaurantId || item.restaurantId || null,
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

  const OPERATION_TYPE_LABELS = {
    restaurant: "Restaurant",
    cafe: "Cafe",
    bar: "Bar",
    food_court: "Food Court",
    room_service: "Room Service",
    banquet: "Banquet",
    pool_service: "Pool Service",
    buffet: "Buffet"
  };

  const formatOpsLabel = (value = "") => {
    const normalizedValue = String(value || "").trim();
    return OPERATION_TYPE_LABELS[normalizedValue] || normalizedValue
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

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
    const mergedRestaurants = isRestaurantSelectionClient
      ? restaurants
      : restaurants.length
        ? mergeById(getRestaurants(), restaurants, getRestaurantId)
        : getRestaurants();
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
      if (!isRestaurantSelectionClient) {
        await fetchKitchenStationsFromApi();
        await fetchOrdersFromApi();
      }
      if (!quiet) {
        setOpsStatus(restaurantsStatus, "Operations data refreshed.", "success");
        if (!isRestaurantSelectionClient) {
          setOpsStatus(ordersStatus, "Orders refreshed.", "success");
          setOpsStatus(kitchenStatus, "KDS refreshed.", "success");
        }
      }
    } catch (error) {
      if (!quiet) {
        setOpsStatus(restaurantsStatus, "Using local operation data until Render is updated.", "warning");
        if (!isRestaurantSelectionClient) {
          setOpsStatus(ordersStatus, "Using local order data until Render is updated.", "warning");
          setOpsStatus(kitchenStatus, "Using local KDS data until Render is updated.", "warning");
        }
      }
    }
  };

  const renderRestaurantSelectionOptions = (restaurants = []) => {
    if (!restaurantSelectOptions) return;

    const activeRestaurants = restaurants.filter((restaurant) => restaurant.active_status !== false);
    const visibleItems = activeRestaurants;

    if (!visibleItems.length) {
      restaurantSelectOptions.innerHTML = `
        <div class="restaurant-select-empty">
          <strong>No restaurant yet</strong>
          <span>Add your first restaurant or business location to open the client dashboard.</span>
        </div>
      `;
      return;
    }

    restaurantSelectOptions.innerHTML = visibleItems.map((restaurant, index) => {
      const restaurantId = getRestaurantId(restaurant) || `restaurant-${index + 1}`;
      const name = restaurant.restaurant_name || restaurant.restaurantName || "Operation";
      const category = formatOpsLabel(restaurant.category || "restaurant");
      const location = restaurant.location || "Operations workspace";

      return `
        <button type="button" class="restaurant-select-card" data-restaurant-id="${escapeHtml(restaurantId)}" data-restaurant-name="${escapeHtml(name)}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(name)}</strong>
          <small>${escapeHtml(category)} · ${escapeHtml(location)}</small>
        </button>
      `;
    }).join("");
  };

  const setRestaurantSelectStatus = (message = "", type = "") => {
    if (!restaurantSelectStatus) return;
    restaurantSelectStatus.textContent = message;
    if (type) {
      restaurantSelectStatus.dataset.type = type;
    } else {
      delete restaurantSelectStatus.dataset.type;
    }
  };

  const updateRestaurantSelectionCopy = (restaurantCount = 0) => {
    if (restaurantCount <= 0) {
      if (restaurantSelectTitle) restaurantSelectTitle.textContent = "Create Your First Restaurant";
      if (restaurantSelectDescription) {
        restaurantSelectDescription.textContent = "Add your first restaurant or business location to open the client dashboard.";
      }
      if (restaurantSelectAddToggleBtn) restaurantSelectAddToggleBtn.textContent = "Create restaurant";
      return;
    }

    if (restaurantSelectTitle) restaurantSelectTitle.textContent = "Choose a restaurant";
    if (restaurantSelectDescription) {
      restaurantSelectDescription.textContent = "Select the operation you want to run. BEOFlow will open the correct workspace after you choose one.";
    }
    if (restaurantSelectAddToggleBtn) restaurantSelectAddToggleBtn.textContent = "Add restaurant";
  };

  const setRestaurantSelectAddOpen = (isOpen, options = {}) => {
    if (!restaurantSelectAddForm) return;
    const { canCancel = true } = options;
    restaurantSelectAddForm.hidden = !isOpen;
    if (restaurantSelectAddToggleBtn) restaurantSelectAddToggleBtn.hidden = isOpen;
    if (restaurantSelectCancelBtn) restaurantSelectCancelBtn.hidden = isOpen && !canCancel;
    if (isOpen) restaurantSelectNameInput?.focus();
  };

  const loadRestaurantSelectionOptions = async (options = {}) => {
    const { autoSelectSingle = false } = options;
    if (restaurantSelectClientLabel) {
      restaurantSelectClientLabel.textContent = currentClient.displayName || "Restaurant workspace";
    }
    updateRestaurantSelectionCopy(0);
    if (restaurantSelectStatus) {
      restaurantSelectStatus.textContent = "Loading restaurants...";
      restaurantSelectStatus.dataset.type = "info";
    }

    try {
      const result = await requestJson("/api/restaurants?activeOnly=true");
      const restaurants = Array.isArray(result.restaurants) ? result.restaurants.map(mapRestaurantFromApi) : [];

      saveRestaurants(restaurants);
      if (restaurants.length === 1 && autoSelectSingle && !selectedRestaurantId) {
        const restaurant = restaurants[0];
        const restaurantName = restaurant.restaurant_name || restaurant.restaurantName || "Restaurant Workspace";
        setRestaurantSelectStatus(`Opening ${restaurantName}...`, "info");
        await selectRestaurantWorkspace(getRestaurantId(restaurant), restaurantName);
        return;
      }

      updateRestaurantSelectionCopy(restaurants.length);
      renderRestaurantSelectionOptions(restaurants);
      setRestaurantSelectAddOpen(restaurants.length === 0, { canCancel: restaurants.length > 0 });
      setRestaurantSelectStatus(
        restaurants.length ? "" : "Create your first restaurant to continue.",
        restaurants.length ? "" : "info"
      );
    } catch (error) {
      console.warn("Could not load restaurants for selection:", error);
      renderRestaurantSelectionOptions([]);
      setRestaurantSelectAddOpen(false);
      setRestaurantSelectStatus(error.message || "Restaurants could not be loaded. Try again.", "error");
    }
  };

  const addRestaurantFromSelection = async () => {
    const restaurantName = restaurantSelectNameInput?.value.trim() || "";
    if (!restaurantName) {
      setRestaurantSelectStatus("Restaurant name is required.", "warning");
      restaurantSelectNameInput?.focus();
      return;
    }

    const payload = {
      restaurant_name: restaurantName,
      category: restaurantSelectTypeInput?.value || "restaurant",
      location: restaurantSelectLocationInput?.value.trim() || "",
      active_status: true
    };

    if (restaurantSelectSaveBtn) restaurantSelectSaveBtn.disabled = true;
    setRestaurantSelectStatus("Saving restaurant...", "info");

    let savedRestaurant;
    try {
      savedRestaurant = await createRestaurantInApi(payload);
      setRestaurantSelectStatus(`${savedRestaurant.restaurant_name || restaurantName} saved. Opening dashboard...`, "success");
    } catch (error) {
      if (isRestaurantSelectionClient) {
        console.error("Restaurant could not be saved for client workspace:", error);
        setRestaurantSelectStatus(error.message || "Restaurant could not be saved. Try again.", "error");
        if (restaurantSelectSaveBtn) restaurantSelectSaveBtn.disabled = false;
        return;
      }
      savedRestaurant = mapRestaurantFromApi({
        ...payload,
        restaurant_id: makeLocalId("restaurant")
      });
      setRestaurantSelectStatus(`${restaurantName} saved locally. Opening dashboard...`, "warning");
    } finally {
      if (restaurantSelectSaveBtn) restaurantSelectSaveBtn.disabled = false;
    }

    saveRestaurants(mergeById(getRestaurants(), [savedRestaurant], getRestaurantId));
    renderRestaurantSelectionOptions(getRestaurants());
    populateRestaurantOptions();
    if (restaurantSelectNameInput) restaurantSelectNameInput.value = "";
    if (restaurantSelectTypeInput) restaurantSelectTypeInput.value = "restaurant";
    if (restaurantSelectLocationInput) restaurantSelectLocationInput.value = "";
    setRestaurantSelectAddOpen(false);
    await selectRestaurantWorkspace(getRestaurantId(savedRestaurant), savedRestaurant.restaurant_name || restaurantName);
  };

  const selectRestaurantWorkspace = async (restaurantId, restaurantName) => {
    if (!restaurantId) return;
    selectedRestaurantId = restaurantId;
    selectedRestaurantName = restaurantName || "Restaurant Workspace";
    localStorage.setItem(getClientScopedStorageKey(RESTAURANT_SELECTION_ID_KEY), selectedRestaurantId);
    localStorage.setItem(getClientScopedStorageKey(RESTAURANT_SELECTION_NAME_KEY), selectedRestaurantName);
    setRestaurantSelectStatus("Loading workspace...", "info");
    try {
      await hydrateClientData({ seedEmptyRemote: false });
      await Promise.allSettled([
        loadOperationsData({ quiet: true }),
        fetchEventsFromApi(),
        fetchInventoryFromApi()
      ]);
    } catch (error) {
      console.warn("Could not hydrate selected restaurant workspace:", error);
      clearClientDataSnapshot();
    }
    applyClientModuleVisibility();
    showApp();
    populateRecipeIngredientOptions();
    populateSubRecipeIngredientOptions();
    refreshRecipeOptionLists();
    refreshMenuTypeOptions();
    refreshInventoryOptionLists();
    renderSelectedIngredients();
    renderSelectedSubRecipeIngredients();
    populateMenuRecipeOptions();
    populateEventMenuOptions();
    renderMenus();
    renderRecipes();
    renderSubRecipes();
    renderInventory();
    setDefaultAssignmentPresetDate();
    renderStaff();
    renderAssignmentPresets();
    renderProduction();
    renderReports();
    renderSmartSetup();

    const defaultModule = getDefaultModuleForClient();
    if (defaultModule) showModuleByKey(defaultModule, { scroll: false });
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
    if (activeModuleKey !== "dashboard") return;
    if (!smartSetupSection) return;
    smartSetupSection.style.display = "";
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
    if (activeModuleKey !== "dashboard") {
      syncSmartSetupSurface(activeModuleKey);
      return;
    }

    syncSmartSetupSurface(activeModuleKey);

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

    if (!flow || !getSmartSetupProgress(flow.tasks, state).isComplete) {
      renderSmartSetup();
      closeSmartSetupPanel();
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
      subtitle: "Create recipes from inventory, calculate ingredient cost automatically, and save recipe cards."
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
      title: "LineOps",
      subtitle: "Download the mobile app for shift readiness, stations, and kitchen coordination"
    },
    lineOpsUsers: {
      title: "LineOps Users",
      subtitle: "Authorized users provisioned for BeoFlow operations"
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
        recommendation: "Consider adding one higher-margin side, dessert, or beverage station while keeping the strong margin."
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
      lineOpsUsersSection,
      reportsSection,
      createEventSection
    ].forEach(hideSection);
  };

  const setActiveNav = (activeNav) => {
    [navDashboard, navRestaurants, navOrders, navKitchen, navEvents, navMenus, navRecipes, navSubRecipes, navInventory, navProduction, navStaff, navLineOpsUsers, navReports].forEach((navItem) => {
      if (!navItem) return;
      navItem.classList.toggle("active", navItem === activeNav);
    });
  };

  const setLineOpsUsersStatus = (message = "", type = "") => {
    if (!lineOpsUsersStatus) return;
    lineOpsUsersStatus.hidden = !message;
    lineOpsUsersStatus.textContent = message;
    if (type) {
      lineOpsUsersStatus.dataset.type = type;
    } else {
      delete lineOpsUsersStatus.dataset.type;
    }
  };

  const formatLineOpsDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const setLineOpsUserEditorStatus = (message = "", type = "") => {
    if (!lineOpsUserEditorStatus) return;
    lineOpsUserEditorStatus.hidden = !message;
    lineOpsUserEditorStatus.textContent = message;
    if (type) {
      lineOpsUserEditorStatus.dataset.type = type;
    } else {
      delete lineOpsUserEditorStatus.dataset.type;
    }
  };

  const closeLineOpsUserEditor = () => {
    if (!lineOpsUserEditorModal) return;
    lineOpsUserEditorModal.hidden = true;
    document.body.classList.remove("modal-open");
    lineOpsUserEditorForm?.reset();
    setLineOpsUserEditorStatus("");
  };

  const openLineOpsUserEditor = (user) => {
    if (!lineOpsUserEditorModal || !user) return;

    if (lineOpsEditUserIdInput) lineOpsEditUserIdInput.value = user.id || "";
    if (lineOpsEditBusinessNameInput) lineOpsEditBusinessNameInput.value = user.businessName || "";
    if (lineOpsEditFullNameInput) lineOpsEditFullNameInput.value = user.fullName || "";
    if (lineOpsEditEmailInput) lineOpsEditEmailInput.value = user.email || "";
    if (lineOpsEditBusinessTypeInput) lineOpsEditBusinessTypeInput.value = user.businessType || "Other";
    if (lineOpsEditTeamSizeInput) lineOpsEditTeamSizeInput.value = user.teamSize || "";
    if (lineOpsEditDepartmentInput) lineOpsEditDepartmentInput.value = user.department || "";
    if (lineOpsEditOnboardedInput) lineOpsEditOnboardedInput.checked = Boolean(user.onboardingComplete);

    const selectedGoals = new Set(Array.isArray(user.goals) ? user.goals : []);
    lineOpsEditGoalInputs.forEach((input) => {
      input.checked = selectedGoals.has(input.value);
    });

    setLineOpsUserEditorStatus("");
    lineOpsUserEditorModal.hidden = false;
    document.body.classList.add("modal-open");
  };

  const getLineOpsEditorPayload = () => ({
    businessName: lineOpsEditBusinessNameInput?.value.trim() || "",
    fullName: lineOpsEditFullNameInput?.value.trim() || "",
    email: lineOpsEditEmailInput?.value.trim() || "",
    businessType: lineOpsEditBusinessTypeInput?.value || "Other",
    teamSize: lineOpsEditTeamSizeInput?.value || null,
    department: lineOpsEditDepartmentInput?.value || null,
    onboardingComplete: Boolean(lineOpsEditOnboardedInput?.checked),
    goals: lineOpsEditGoalInputs
      .filter((input) => input.checked)
      .map((input) => input.value)
  });

  async function saveLineOpsUserEdit(event) {
    event?.preventDefault();
    const userId = lineOpsEditUserIdInput?.value;
    if (!userId) return;

    setLineOpsUserEditorStatus("Saving LineOps user...");
    if (saveLineOpsUserEditorBtn) saveLineOpsUserEditorBtn.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/api/lineops/admin/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(getLineOpsEditorPayload())
      });

      if (response.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_CLIENT_KEY);
        authToken = "";
        showLogin("Session expired. Sign in again.");
        return;
      }

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update LineOps user.");
      }

      await loadLineOpsUsers();
      closeLineOpsUserEditor();
      setLineOpsUsersStatus(`${payload.user?.businessName || "LineOps user"} updated.`, "success");
    } catch (error) {
      console.error(error);
      setLineOpsUserEditorStatus(error.message || "Failed to update LineOps user.", "error");
    } finally {
      if (saveLineOpsUserEditorBtn) saveLineOpsUserEditorBtn.disabled = false;
    }
  }

  const renderLineOpsUsers = (users = []) => {
    if (!lineOpsUsersTableBody) return;
    lineOpsUsersTableBody.innerHTML = "";

    if (!users.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 9;
      cell.textContent = "No LineOps users yet.";
      row.appendChild(cell);
      lineOpsUsersTableBody.appendChild(row);
      return;
    }

    users.forEach((user) => {
      const row = document.createElement("tr");
      const values = [
        user.businessName || "Unknown business",
        user.fullName || "Workspace owner",
        user.email || "No email",
        user.businessType || "Other",
        user.teamSize || "Not set",
        user.department || "Not set"
      ];

      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      const statusCell = document.createElement("td");
      const statusBadge = document.createElement("span");
      statusBadge.className = user.deletedAt
        ? "status issue"
        : user.onboardingComplete
          ? "status ready"
          : "status upcoming";
      statusBadge.textContent = user.deletedAt
        ? "Deleted"
        : user.onboardingComplete
          ? "Onboarded"
          : "Signup";
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);

      const createdCell = document.createElement("td");
      createdCell.textContent = formatLineOpsDate(user.createdAt);
      row.appendChild(createdCell);

      const actionsCell = document.createElement("td");
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "secondary-btn lineops-user-edit-btn";
      editButton.dataset.lineopsUserId = user.id || "";
      editButton.textContent = "Edit";
      editButton.disabled = Boolean(user.deletedAt);
      actionsCell.appendChild(editButton);
      row.appendChild(actionsCell);

      lineOpsUsersTableBody.appendChild(row);
    });
  };

  async function loadLineOpsUsers() {
    if (!isBastidaClient) return;

    setLineOpsUsersStatus("Loading LineOps users...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/lineops/admin/users`, {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_CLIENT_KEY);
        authToken = "";
        showLogin("Session expired. Sign in again.");
        return;
      }

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to load LineOps users.");
      }

      const totals = payload.totals || {};
      if (lineOpsUsersTotal) lineOpsUsersTotal.textContent = totals.users ?? 0;
      if (lineOpsUsersActive) lineOpsUsersActive.textContent = totals.activeUsers ?? 0;
      if (lineOpsUsersOnboarded) lineOpsUsersOnboarded.textContent = totals.onboardedUsers ?? 0;
      if (lineOpsUsersDeleted) lineOpsUsersDeleted.textContent = totals.deletedUsers ?? 0;

      lineOpsUsersCache = payload.users || [];
      renderLineOpsUsers(lineOpsUsersCache);
      setLineOpsUsersStatus((payload.users || []).length ? "LineOps users synced from Render." : "No LineOps users yet.", "success");
    } catch (error) {
      console.error(error);
      setLineOpsUsersStatus(error.message || "Failed to load LineOps users.", "error");
    }
  }

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
    syncSmartSetupSurface(moduleKey);

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
      refreshRecipeOptionLists();
      populateRecipeIngredientOptions();
      renderSelectedIngredients();
      renderRecipes();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "subRecipes") {
      showSection(subRecipesSection);
      setActiveNav(navSubRecipes);
      refreshRecipeOptionLists();
      populateSubRecipeIngredientOptions();
      renderSelectedSubRecipeIngredients();
      renderSubRecipes();
      if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (moduleKey === "inventory") {
      showSection(inventorySection);
      setActiveNav(navInventory);
      refreshInventoryOptionLists();
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

    if (moduleKey === "lineOpsUsers") {
      showSection(lineOpsUsersSection);
      setActiveNav(navLineOpsUsers);
      loadLineOpsUsers();
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

  const normalizeOptionValue = (value = "") =>
    String(value || "").trim().replace(/\s+/g, " ");

  const slugifyOptionValue = (value = "") =>
    normalizeOptionValue(value)
      .toLowerCase()
      .replace(/^custom[-_\s]+/i, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const toTitleLabel = (value = "") =>
    normalizeOptionValue(value)
      .replace(/^custom[-_\s]+/i, "")
      .replace(/[-_]/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const createCustomInventoryCategoryMeta = (category = "") => {
    const label = toTitleLabel(category) || "Other";
    const slug = slugifyOptionValue(label);
    const fallbackCategory = inventoryCategories[inventoryCategories.length - 1];

    if (!slug || slug === "other") return fallbackCategory;

    return {
      id: `custom-${slug}`,
      label,
      icon: label.slice(0, 1).toUpperCase(),
      className: "custom",
      keywords: []
    };
  };

  const getInventoryCategoryMeta = (categoryId = "other") => {
    const normalizedCategoryId = normalizeOptionValue(categoryId).toLowerCase();
    if (!normalizedCategoryId) {
      return inventoryCategories[inventoryCategories.length - 1];
    }

    return inventoryCategories.find((category) => category.id === normalizedCategoryId)
      || inventoryCategories.find((category) => normalizeIngredientName(category.label) === normalizedCategoryId)
      || createCustomInventoryCategoryMeta(categoryId);
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

  const getInventoryCategoriesForItems = (items = []) => {
    const categories = new Map(inventoryCategories.map((category) => [category.id, category]));

    items.forEach((item) => {
      const category = getInventoryItemCategory(item);
      if (category?.id && !categories.has(category.id)) {
        categories.set(category.id, category);
      }
    });

    return Array.from(categories.values());
  };

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

  const mergeUniqueOptions = (...groups) => {
    const optionMap = new Map();

    groups.flat().forEach((value) => {
      const label = normalizeOptionValue(value);
      if (!label) return;
      const key = label.toLowerCase();
      if (!optionMap.has(key)) optionMap.set(key, label);
    });

    return Array.from(optionMap.values()).sort((a, b) => a.localeCompare(b));
  };

  const renderDatalistOptions = (datalist, values = []) => {
    if (!datalist) return;

    datalist.innerHTML = mergeUniqueOptions(values)
      .map((value) => `<option value="${escapeHtml(value)}"></option>`)
      .join("");
  };

  const refreshRecipeOptionLists = () => {
    renderDatalistOptions(recipeCategoryOptions, [
      ...defaultRecipeCategories,
      ...getRecipes().map((recipe) => recipe.category)
    ]);

    renderDatalistOptions(subRecipeCategoryOptions, [
      ...defaultSubRecipeCategories,
      ...getSubRecipes().map((recipe) => recipe.category)
    ]);
  };

  const refreshMenuTypeOptions = () => {
    renderDatalistOptions(menuTypeOptions, [
      ...defaultMenuTypes,
      ...getMenus().map((menu) => menu.type)
    ]);
  };

  const refreshInventoryOptionLists = (items = getInventory()) => {
    renderDatalistOptions(inventoryCategoryOptions, [
      ...inventoryCategories.map((category) => category.label),
      ...items.map((item) => getInventoryItemCategory(item).label)
    ]);

    renderDatalistOptions(storageAreaOptions, [
      ...defaultStorageAreas,
      ...items.map((item) => item.storageArea)
    ]);
  };

  const resizeImageFileToDataUrl = (file, maxSize = 1100, quality = 0.84) =>
    new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        reject(new Error("Please choose an image file."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Unable to process this image."));
            return;
          }

          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        image.onerror = () => reject(new Error("Unable to load this image."));
        image.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Unable to read this image."));
      reader.readAsDataURL(file);
    });

  const renderPhotoPreview = (previewEl, removeBtn, dataUrl = "") => {
    if (!previewEl) return;

    previewEl.classList.toggle("is-empty", !dataUrl);
    previewEl.style.backgroundImage = dataUrl ? `url("${dataUrl}")` : "";
    previewEl.innerHTML = dataUrl
      ? '<span>Photo ready</span>'
      : '<span>Photo preview</span><small>Add a service photo for this recipe card.</small>';

    if (removeBtn) removeBtn.hidden = !dataUrl;
  };

  const handleRecipePhotoFile = async (file, target = "recipe") => {
    if (!file) return;

    try {
      const dataUrl = await resizeImageFileToDataUrl(file);
      if (target === "subRecipe") {
        currentSubRecipePhotoDataUrl = dataUrl;
        renderPhotoPreview(subRecipePhotoPreview, removeSubRecipePhotoBtn, currentSubRecipePhotoDataUrl);
        return;
      }

      currentRecipePhotoDataUrl = dataUrl;
      renderPhotoPreview(recipePhotoPreview, removeRecipePhotoBtn, currentRecipePhotoDataUrl);
    } catch (error) {
      alert(error.message || "The image could not be loaded.");
    }
  };

  const resetRecipePhoto = () => {
    currentRecipePhotoDataUrl = "";
    if (recipePhotoInput) recipePhotoInput.value = "";
    renderPhotoPreview(recipePhotoPreview, removeRecipePhotoBtn, currentRecipePhotoDataUrl);
  };

  const resetSubRecipePhoto = () => {
    currentSubRecipePhotoDataUrl = "";
    if (subRecipePhotoInput) subRecipePhotoInput.value = "";
    renderPhotoPreview(subRecipePhotoPreview, removeSubRecipePhotoBtn, currentSubRecipePhotoDataUrl);
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

  const getIngredientLine = (ingredient) => {
    const item = getInventory().find((inventoryItem) => inventoryItem.id === ingredient.inventoryItemId);
    const itemName = item?.name || "Unknown item";
    const usedQty = Number(ingredient.originalQty ?? ingredient.qty ?? 0);
    const usedUnit = ingredient.originalUnit || item?.unit || "unit";
    const inventoryQty = Number(item?.quantity || 0);
    const inventoryUnit = item?.unit || usedUnit;
    const itemPrice = getInventoryUnitCost(item);
    const ingredientCost = Number(ingredient.qty || 0) * itemPrice;
    const presentation = item
      ? `${inventoryQty.toFixed(2)} ${inventoryUnit}`
      : "No presentation";

    return {
      itemName,
      usedQty,
      usedUnit,
      inventoryUnit,
      itemPrice,
      presentation,
      ingredientCost
    };
  };

  const formatMoney = (amount = 0) => `$${Number(amount || 0).toFixed(2)}`;

  const getRecipeInputs = () => ({
    name: recipeNameInput ? recipeNameInput.value.trim() : "",
    sheet: recipeSheetNameInput ? recipeSheetNameInput.value.trim() : "",
    category: recipeCategoryInput ? recipeCategoryInput.value.trim() : "Entree",
    portions: Number(recipePortionsInput ? recipePortionsInput.value || 0 : 0),
    wastePercent: Number(recipeYieldInput ? recipeYieldInput.value || 0 : 0)
  });

  const getRecipeCostSummaryMetrics = (recipe = null) => {
    const values = recipe
      ? {
          portions: Number(recipe.portions || 0),
          wastePercent: Number(recipe.wastePercent || 0)
        }
      : getRecipeInputs();
    const ingredients = recipe ? recipe.ingredients || [] : currentRecipeIngredients;
    const ingredientBaseCost = calculateRecipeIngredientCost(ingredients);
    const baseCost = ingredientBaseCost > 0 ? ingredientBaseCost : Number(recipe?.baseCost || recipe?.cost || 0);
    const totalCost = applyWasteToCost(baseCost, values.wastePercent);
    const wasteCost = totalCost - baseCost;
    const unitCost = values.portions > 0 ? totalCost / values.portions : totalCost;
    const foodFactor = values.wastePercent > 0 ? ((100 + values.wastePercent) / 100) : 1;
    const salePrice = unitCost;
    const costPercent = totalCost > 0 ? (baseCost / totalCost) * 100 : 0;

    return {
      rows: [
        { label: "Total", value: formatMoney(baseCost), tone: "neutral" },
        { label: `Merma ${values.wastePercent.toFixed(0)}%`, value: formatMoney(wasteCost), tone: "waste" },
        { label: "Total Unit Cost", value: formatMoney(unitCost), tone: "unitCost" },
        { label: "% Cost", value: `${costPercent.toFixed(0)}%`, tone: "costPercent" },
        { label: "Food Factor", value: foodFactor.toFixed(2), tone: "foodFactor" },
        { label: "Suggested Sale Price", value: formatMoney(salePrice), tone: "suggested" },
        { label: "Sale Price", value: formatMoney(salePrice), tone: "final" }
      ],
      baseCost,
      wasteCost,
      totalCost,
      unitCost,
      ingredientCount: ingredients.length
    };
  };

  const renderRecipeInfoDisplays = () => {
    const values = getRecipeInputs();
    if (recipeNumberDisplay) {
      recipeNumberDisplay.textContent = editingRecipeId ? `#${editingRecipeId.slice(0, 6).toUpperCase()}` : "AUTO";
    }
    if (recipeYieldDisplay) {
      recipeYieldDisplay.textContent = `${values.portions || 0} portions`;
    }
    if (recipeIngredientCodeDisplay) {
      recipeIngredientCodeDisplay.textContent = `#${String(currentRecipeIngredients.length + 1).padStart(2, "0")}`;
    }
  };

  const renderRecipeCostSummary = () => {
    if (!recipeCostSummaryGrid) return;
    const { rows } = getRecipeCostSummaryMetrics();
    recipeCostSummaryGrid.innerHTML = rows
      .map((row) => `
        <article class="recipe-cost-metric ${row.tone}">
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(row.value)}</strong>
        </article>
    `).join("");
  };

  const syncRecipeIngredientBuilderMode = () => {
    const isEditingIngredient = Number.isInteger(editingRecipeIngredientIndex);
    if (addRecipeIngredientBtn) {
      addRecipeIngredientBtn.textContent = isEditingIngredient ? "Update Ingredient" : "Add Ingredient";
    }
    if (recipeIngredientHelp) {
      recipeIngredientHelp.textContent = isEditingIngredient
        ? "Edit the ingredient row, then press Update Ingredient."
        : "Press Enter in Quantity to add the row.";
    }
  };

  const resetRecipeIngredientEditMode = () => {
    editingRecipeIngredientIndex = null;
    syncRecipeIngredientBuilderMode();
  };

  const clearRecipeForm = ({ focusAfterReset = false } = {}) => {
    if (recipeSheetNameInput) recipeSheetNameInput.value = "";
    if (recipeNameInput) recipeNameInput.value = "";
    if (recipeCategoryInput) recipeCategoryInput.value = "";
    if (recipePortionsInput) recipePortionsInput.value = "";
    if (recipeYieldInput) recipeYieldInput.value = "0";
    if (recipeCostInput) recipeCostInput.value = "";
    if (recipePreparationInput) recipePreparationInput.value = "";
    if (recipeNotesInput) recipeNotesInput.value = "";
    currentRecipeIngredients = [];
    resetRecipeIngredientEditMode();
    editingRecipeId = null;
    currentRecipePhotoDataUrl = "";
    resetRecipePhoto();
    clearIngredientPicker(recipeIngredientPicker);
    if (addRecipeBtn) addRecipeBtn.textContent = "Save Recipe";

    renderSelectedIngredients();
    if (focusAfterReset && recipeNameInput) {
      recipeNameInput.focus();
    }
  };

  const getRecipePrintPayload = (recipe = null) => {
    const values = recipe
      ? {
          name: recipe.name || "",
          sheet: recipe.sheet || "",
          category: recipe.category || "Entree",
          portions: Number(recipe.portions || 0),
          wastePercent: Number(recipe.wastePercent || 0)
        }
      : getRecipeInputs();
    const summary = getRecipeCostSummaryMetrics(recipe);
    const ingredients = recipe ? recipe.ingredients || [] : currentRecipeIngredients;
    const ingredientRows = ingredients.map((ingredient, index) => {
      const line = getIngredientLine(ingredient);
      return {
        code: `#${String(index + 1).padStart(2, "0")}`,
        qty: `${line.usedQty.toFixed(2)} ${line.usedUnit}`,
        ingredient: line.itemName,
        price: `${formatMoney(line.itemPrice)} / ${line.inventoryUnit}`,
        presentation: line.presentation,
        cost: formatMoney(line.ingredientCost)
      };
    });

    return {
      name: values.name || "Untitled Recipe",
      sheet: values.sheet || "—",
      category: values.category,
      portions: values.portions,
      wastePercent: values.wastePercent,
      notes: recipe ? recipe.notes || "" : recipeNotesInput ? recipeNotesInput.value.trim() : "",
      preparation: recipe ? recipe.preparation || "" : recipePreparationInput ? recipePreparationInput.value.trim() : "",
      summaryRows: summary.rows,
      ingredients: ingredientRows
    };
  };

  const printRecipeCard = (recipe = null) => {
    const payload = getRecipePrintPayload(recipe);
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      alert("Popup was blocked by the browser. Please allow pop-ups to print the recipe card.");
      return;
    }

    const summaryRowsHtml = payload.summaryRows
      .map((row) => `<tr><td>${escapeHtml(row.label)}</td><td class="summary-value">${escapeHtml(row.value)}</td></tr>`)
      .join("");

    const ingredientsHtml = payload.ingredients.length
      ? payload.ingredients.map((ingredient) => `
          <tr>
            <td>${escapeHtml(ingredient.code)}</td>
            <td>${escapeHtml(ingredient.qty)}</td>
            <td>${escapeHtml(ingredient.ingredient)}</td>
            <td>${escapeHtml(ingredient.price)}</td>
            <td>${escapeHtml(ingredient.presentation)}</td>
            <td>${escapeHtml(ingredient.cost)}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="6" class="empty">No ingredients added.</td></tr>`;

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Recipe Cost Card - ${escapeHtml(payload.name)}</title>
          <style>
            :root {
              font-family: ${window.getComputedStyle(document.documentElement).fontFamily};
              color: #0f172a;
            }

            * { box-sizing: border-box; }
            body {
              margin: 18px;
              color: #0f172a;
              background: #fff;
            }

            h1 {
              margin: 0;
              font-size: 20px;
            }

            h2 {
              margin: 16px 0 8px;
              font-size: 14px;
            }

            .sheet-head {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }

            .meta {
              margin: 10px 0 0;
              color: #475569;
              font-size: 12px;
            }

            .meta p {
              margin: 2px 0;
            }

            .split {
              display: grid;
              grid-template-columns: 1fr;
              gap: 12px;
              margin-top: 14px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #cbd5e1;
              font-size: 12px;
              page-break-inside: auto;
            }

            th, td {
              padding: 7px 8px;
              border: 1px solid #e2e8f0;
              text-align: left;
              vertical-align: top;
              color: #0f172a;
            }

            th {
              background: #f8fafc;
            }

            .summary-value {
              text-align: right;
              font-weight: 700;
              white-space: nowrap;
            }

            .notes {
              margin: 8px 0 0;
              padding: 10px;
              border: 1px solid #e2e8f0;
              background: #f8fafc;
              min-height: 70px;
              white-space: pre-wrap;
              line-height: 1.35;
            }

            .muted {
              color: #64748b;
            }

            .empty {
              text-align: center;
              color: #64748b;
            }

            @media print {
              @page {
                margin: 12mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="recipe-print">
            <h1>Recipe Cost Card</h1>
            <p class="muted">${escapeHtml(payload.name)} · ${escapeHtml(payload.category)} · ${escapeHtml(payload.sheet)}</p>
            <div class="sheet-head">
              <div>
                <h2>General Information</h2>
                <div class="meta">
                  <p><strong>Menu / Sheet:</strong> ${escapeHtml(payload.sheet)}</p>
                  <p><strong>Sub Recipe / Category:</strong> ${escapeHtml(payload.category || "Entree")}</p>
                  <p><strong>PAX / Portions:</strong> ${escapeHtml(payload.portions || 0)}</p>
                </div>
              </div>
              <div>
                <h2>Waste / Merma</h2>
                <div class="meta">
                  <p><strong>Waste %:</strong> ${Number(payload.wastePercent || 0).toFixed(0)}%</p>
                  <p><strong>Yield / Rendimiento:</strong> ${payload.portions || 0} portions</p>
                </div>
              </div>
            </div>

            <h2>Ingredients</h2>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Quantity</th>
                  <th>Ingredient</th>
                  <th>Price</th>
                  <th>Presentation</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                ${ingredientsHtml}
              </tbody>
            </table>

            <div class="split">
              <div>
                <h2>Cost Summary</h2>
                <table>
                  <tbody>${summaryRowsHtml}</tbody>
                </table>
              </div>

              <div>
                <h2>Preparation Steps</h2>
                <div class="notes">${escapeHtml(payload.preparation || "No preparation steps.")}</div>
                <h2 style="margin-top:10px;">Observations</h2>
                <div class="notes">${escapeHtml(payload.notes || "No additional notes.")}</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatMultilineText = (value = "", fallback = "-") =>
    escapeHtml(normalizeOptionValue(value) ? value : fallback).replace(/\n/g, "<br />");

  const renderRecipeDetailIntro = (recipe = {}, summary = {}) => {
    const hasPhoto = Boolean(recipe.photo);
    const category = recipe.category || summary.category || "Recipe";
    const yieldLabel = summary.yieldLabel || (recipe.portions ? `${recipe.portions} portions` : "Portions not set");
    const costLabel = summary.costLabel || (Number(recipe.cost || 0) > 0 ? `$${Number(recipe.cost || 0).toFixed(2)}` : "Cost pending");
    const prepText = formatMultilineText(recipe.preparation, "No preparation steps saved yet.");

    return `
      <div class="recipe-detail-intro">
        <div class="recipe-detail-photo ${hasPhoto ? "" : "is-empty"}">
          ${hasPhoto ? `<img src="${escapeHtml(recipe.photo)}" alt="${escapeHtml(recipe.name || "Recipe photo")}" />` : `<span>${escapeHtml((recipe.name || "R").slice(0, 1).toUpperCase())}</span>`}
        </div>
        <div class="recipe-detail-summary">
          <span>${escapeHtml(category)}</span>
          <h4>${escapeHtml(recipe.name || "Recipe")}</h4>
          <div class="recipe-detail-metrics">
            <strong>${escapeHtml(yieldLabel)}</strong>
            <strong>${escapeHtml(costLabel)}</strong>
            <strong>${Number(recipe.wastePercent || 0).toFixed(0)}% waste</strong>
          </div>
          <div class="recipe-preparation-copy">
            <h5>Preparation</h5>
            <p>${prepText}</p>
          </div>
        </div>
      </div>
    `;
  };

  const removeRecipeIngredientAt = (index) => {
    if (!Number.isInteger(index) || index < 0 || index >= currentRecipeIngredients.length) return;

    currentRecipeIngredients.splice(index, 1);
    if (editingRecipeIngredientIndex === index) {
      resetRecipeIngredientEditMode();
      clearIngredientPicker(recipeIngredientPicker);
      if (recipeIngredientQtyInput) recipeIngredientQtyInput.value = "";
    } else if (Number.isInteger(editingRecipeIngredientIndex) && editingRecipeIngredientIndex > index) {
      editingRecipeIngredientIndex -= 1;
      syncRecipeIngredientBuilderMode();
    }

    renderSelectedIngredients();
  };

  const editRecipeIngredientAt = (index) => {
    if (!Number.isInteger(index) || index < 0 || index >= currentRecipeIngredients.length) return;

    const ingredient = currentRecipeIngredients[index];
    const inventoryItem = getInventory().find((item) => item.id === ingredient.inventoryItemId);
    if (inventoryItem) selectIngredientPickerItem(recipeIngredientPicker, inventoryItem);
    if (recipeIngredientQtyInput) recipeIngredientQtyInput.value = ingredient.originalQty ?? ingredient.qty;
    if (recipeIngredientUnitInput) recipeIngredientUnitInput.value = ingredient.originalUnit || inventoryItem?.unit || "lb";
    editingRecipeIngredientIndex = index;
    syncRecipeIngredientBuilderMode();
    if (recipeIngredientStatus) {
      recipeIngredientStatus.textContent = `Editing ingredient row #${String(index + 1).padStart(2, "0")}.`;
      recipeIngredientStatus.style.color = "";
    }
    renderSelectedIngredients();
    recipeIngredientQtyInput?.focus();
  };

  const renderSelectedIngredients = () => {
    if (!selectedIngredientsList) return;

    const ingredientRows = currentRecipeIngredients.map((ingredient, index) => {
      const line = getIngredientLine(ingredient);
      const isIncomplete = !line.itemName || line.usedQty <= 0 || !line.inventoryUnit;
      const isEditingIngredient = editingRecipeIngredientIndex === index;
      return `
        <div class="recipe-sheet-line${isIncomplete ? " is-incomplete" : ""}${isEditingIngredient ? " is-editing" : ""}">
          <span class="recipe-line-code" data-label="Code">#${String(index + 1).padStart(2, "0")}</span>
          <span class="recipe-sheet-number" data-label="Quantity">${line.usedQty.toFixed(2)} ${escapeHtml(line.usedUnit)}</span>
          <strong data-label="Ingredient">${escapeHtml(line.itemName)}</strong>
          <span class="recipe-sheet-number" data-label="Price">${formatMoney(line.itemPrice)} / ${escapeHtml(line.inventoryUnit)}</span>
          <span class="recipe-sheet-number" data-label="Presentation">${escapeHtml(line.presentation)}</span>
          <span class="recipe-sheet-number recipe-line-cost" data-label="Cost">${formatMoney(line.ingredientCost)}</span>
          <span class="recipe-line-actions" data-label="Actions">
            <button type="button" class="recipe-line-action-btn edit recipe-line-edit-btn" data-index="${index}" title="Edit ingredient" aria-label="Edit ${escapeHtml(line.itemName)}">Edit</button>
            <button type="button" class="recipe-line-action-btn delete recipe-line-delete-btn" data-index="${index}" title="Remove ingredient" aria-label="Remove ${escapeHtml(line.itemName)}">Remove</button>
          </span>
        </div>
      `;
    }).join("");

    selectedIngredientsList.innerHTML = `
      <div class="recipe-sheet-table-card">
        <div class="recipe-sheet-table-head" aria-hidden="true">
          <span>Code</span>
          <span>Quantity</span>
          <span>Ingredient</span>
          <span>Price</span>
          <span>Presentation</span>
          <span>Cost</span>
          <span></span>
        </div>
        <div class="recipe-sheet-lines">
          ${ingredientRows || `
          <div class="recipe-sheet-empty-state">
            <strong>No ingredients added yet.</strong>
            <span>Search an inventory item above, enter quantity and unit, then add it to the recipe card.</span>
          </div>
        `}
        </div>
      </div>
    `;

    selectedIngredientsList.querySelectorAll(".recipe-line-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeRecipeIngredientAt(Number(btn.dataset.index));
      });
    });

    selectedIngredientsList.querySelectorAll(".recipe-line-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        editRecipeIngredientAt(Number(btn.dataset.index));
      });
    });

    renderRecipeCostSummary();
    renderRecipeInfoDisplays();
  };

  const openCurrentIngredientsModal = () => {
    if (!ingredientsModal || !ingredientsModalTitle || !ingredientsModalBody) return;

    const inventory = getInventory();
    ingredientsModalTitle.textContent = editingRecipeId
      ? "Edit Recipe Ingredients"
      : "New Recipe Ingredients";

    const draftRecipe = {
      name: recipeNameInput ? recipeNameInput.value.trim() : "New Recipe",
      category: recipeCategoryInput ? recipeCategoryInput.value.trim() : "Recipe",
      photo: currentRecipePhotoDataUrl,
      preparation: recipePreparationInput ? recipePreparationInput.value.trim() : "",
      wastePercent: recipeYieldInput ? Number(recipeYieldInput.value || 0) : 0
    };
    const draftPortions = recipePortionsInput ? Number(recipePortionsInput.value || 0) : 0;

    if (currentRecipeIngredients.length === 0) {
      ingredientsModalBody.innerHTML = `
        ${renderRecipeDetailIntro(draftRecipe, {
          yieldLabel: draftPortions ? `${draftPortions} portions` : "Portions not set",
          costLabel: "Cost pending"
        })}
        <div class="ingredient-row">No ingredients added yet.</div>
      `;
    } else {
      const draftBaseCost = calculateRecipeIngredientCost(currentRecipeIngredients);
      const draftFinalCost = applyWasteToCost(draftBaseCost, draftRecipe.wastePercent);
      ingredientsModalBody.innerHTML = `
        ${renderRecipeDetailIntro(draftRecipe, {
          yieldLabel: draftPortions ? `${draftPortions} portions` : "Portions not set",
          costLabel: `$${draftFinalCost.toFixed(2)} batch`
        })}
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
        removeRecipeIngredientAt(Number(btn.dataset.index));
        openCurrentIngredientsModal();
      });
    });

    ingredientsModalBody.querySelectorAll(".ingredient-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        editRecipeIngredientAt(Number(btn.dataset.index));
        closeIngredientsModal();
      });
    });

    ingredientsModal.hidden = false;
  };

  const openIngredientsModal = (recipe) => {
    if (!ingredientsModal || !ingredientsModalTitle || !ingredientsModalBody) return;

    const inventory = getInventory();
    const wastePercent = Number(recipe.wastePercent || 0);
    const baseCost = calculateRecipeIngredientCost(recipe.ingredients || []);
    const finalCost = applyWasteToCost(baseCost, wastePercent);
    const portions = Number(recipe.portions || 0);
    ingredientsModalTitle.textContent = `${recipe.name || "Recipe"} Recipe Card`;

    const detailIntro = renderRecipeDetailIntro(recipe, {
      yieldLabel: recipe.yieldLabel || (portions ? `${portions} portions` : "Portions not set"),
      costLabel: recipe.costLabel || `$${finalCost.toFixed(2)} batch`
    });

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      ingredientsModalBody.innerHTML = `
        ${detailIntro}
        <div class="ingredient-row">No ingredients added.</div>
      `;
    } else {
      ingredientsModalBody.innerHTML = `
        ${detailIntro}
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

  const hasPendingRecipeIngredientDraft = () => {
    const qty = recipeIngredientQtyInput ? Number(recipeIngredientQtyInput.value || 0) : 0;
    const searchText = recipeIngredientSearchInput ? recipeIngredientSearchInput.value.trim() : "";
    const selectedItemId = recipeIngredientItemInput ? recipeIngredientItemInput.value : "";

    return Number.isInteger(editingRecipeIngredientIndex) || qty > 0 || Boolean(searchText || selectedItemId);
  };

  const addRecipeIngredient = (options = {}) => {
    const { focusAfterAdd = true } = options;
    const qty = recipeIngredientQtyInput ? Number(recipeIngredientQtyInput.value) : 0;
    const recipeUnit = recipeIngredientUnitInput ? recipeIngredientUnitInput.value : "lb";
    const hasInventorySelection = Boolean(recipeIngredientItemInput && recipeIngredientItemInput.value);

    if (qty <= 0) {
      if (recipeIngredientStatus) {
        recipeIngredientStatus.textContent = "Please enter a quantity greater than 0.";
        recipeIngredientStatus.style.color = "#b91c1c";
      }
      return false;
    }

    const inventoryItemId = recipeIngredientItemInput && recipeIngredientItemInput.value
      ? recipeIngredientItemInput.value
      : createInventoryItemFromPicker(recipeIngredientPicker, recipeUnit);
    const inventoryItem = getInventory().find((item) => item.id === inventoryItemId);
    const inventoryUnit = inventoryItem?.unit || recipeUnit;
    const convertedQty = convertQuantity(qty, recipeUnit, inventoryUnit);

    if (!inventoryItemId) {
      if (recipeIngredientStatus) {
        recipeIngredientStatus.textContent = hasInventorySelection
          ? "Selected ingredient is not available. Finish inventory fields or choose an item."
          : "Choose an ingredient from inventory or fill quick-add fields.";
      }
      return false;
    }

    const nextIngredient = {
      inventoryItemId,
      qty: convertedQty,
      originalQty: qty,
      originalUnit: recipeUnit
    };
    const isEditingIngredient = Number.isInteger(editingRecipeIngredientIndex)
      && currentRecipeIngredients[editingRecipeIngredientIndex];

    if (isEditingIngredient) {
      currentRecipeIngredients[editingRecipeIngredientIndex] = nextIngredient;
    } else {
      currentRecipeIngredients.push(nextIngredient);
    }
    resetRecipeIngredientEditMode();
    renderSelectedIngredients();
    renderRecipeInfoDisplays();
    clearIngredientPicker(recipeIngredientPicker);

    if (recipeIngredientQtyInput) recipeIngredientQtyInput.value = "";
    if (recipeIngredientSearchInput) recipeIngredientSearchInput.value = "";
    if (recipeIngredientStatus) {
      recipeIngredientStatus.textContent = isEditingIngredient
        ? "Ingredient row updated."
        : "Type to search inventory or create a new ingredient.";
    }
    if (recipeIngredientStatus) recipeIngredientStatus.style.color = "";
    if (focusAfterAdd) recipeIngredientQtyInput?.focus();
    return true;
  };

  const handleRecipeIngredientEntryKeydown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addRecipeIngredient();
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

    const totalPrepCost = applyWasteToCost(
      calculateSubRecipeIngredientCost(currentSubRecipeIngredients),
      subRecipeWasteInput ? Number(subRecipeWasteInput.value || 0) : 0
    );

    selectedSubRecipeIngredientsList.innerHTML = `
      <div class="recipe-ingredients-cell">
        <strong>${currentSubRecipeIngredients.length} ingredients ready to save</strong>
        <span>$${totalPrepCost.toFixed(2)} total prep cost.</span>
      </div>
      <div class="selected-recipe-lines">
        ${currentSubRecipeIngredients.map((ingredient) => {
          const line = getIngredientLine(ingredient);
          return `
            <div class="selected-recipe-line">
              <strong>${escapeHtml(line.itemName)}</strong>
              <span>${line.usedQty.toFixed(2)} ${escapeHtml(line.usedUnit)} · $${line.ingredientCost.toFixed(2)}</span>
            </div>
          `;
        }).join("")}
      </div>
      <div class="selected-ingredients-actions">
        <button type="button" class="secondary-btn view-current-sub-recipe-ingredients-btn">
          Open Prep Sheet
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

    const draftSubRecipe = {
      name: subRecipeNameInput ? subRecipeNameInput.value.trim() : "New Prep Recipe",
      category: subRecipeCategoryInput ? subRecipeCategoryInput.value.trim() : "Prep Recipe",
      photo: currentSubRecipePhotoDataUrl,
      preparation: subRecipePreparationInput ? subRecipePreparationInput.value.trim() : "",
      wastePercent: subRecipeWasteInput ? Number(subRecipeWasteInput.value || 0) : 0
    };
    const draftYieldAmount = subRecipeYieldInput ? Number(subRecipeYieldInput.value || 0) : 0;
    const draftYieldUnit = subRecipeYieldUnitInput ? subRecipeYieldUnitInput.value : "units";

    if (currentSubRecipeIngredients.length === 0) {
      ingredientsModalBody.innerHTML = `
        ${renderRecipeDetailIntro(draftSubRecipe, {
          yieldLabel: draftYieldAmount ? `${draftYieldAmount.toFixed(2)} ${draftYieldUnit}` : "Yield not set",
          costLabel: "Cost pending"
        })}
        <div class="ingredient-row">No prep ingredients added yet.</div>
      `;
    } else {
      const draftTotalCost = applyWasteToCost(
        calculateSubRecipeIngredientCost(currentSubRecipeIngredients),
        draftSubRecipe.wastePercent
      );
      ingredientsModalBody.innerHTML = `
        ${renderRecipeDetailIntro(draftSubRecipe, {
          yieldLabel: draftYieldAmount ? `${draftYieldAmount.toFixed(2)} ${draftYieldUnit}` : "Yield not set",
          costLabel: `$${draftTotalCost.toFixed(2)} batch`
        })}
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
      category: subRecipe.category || "Prep Recipe",
      photo: subRecipe.photo || "",
      preparation: subRecipe.preparation || "",
      ingredients: subRecipe.ingredients || [],
      wastePercent: subRecipe.wastePercent || 0,
      yieldLabel: subRecipe.yieldAmount
        ? `${Number(subRecipe.yieldAmount).toFixed(2)} ${subRecipe.yieldUnit || "units"}`
        : "Yield not set",
      costLabel: `$${Number(subRecipe.totalPrepCost || 0).toFixed(2)} batch`
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

  const getSelectedMenuRecipeIds = () =>
    menuRecipesInput
      ? Array.from(menuRecipesInput.selectedOptions)
          .map((option) => option.value)
          .filter(Boolean)
      : [];

  const setSelectedMenuRecipeIds = (recipeIds = []) => {
    if (!menuRecipesInput) return;

    const selectedIds = new Set(recipeIds);
    Array.from(menuRecipesInput.options).forEach((option) => {
      option.selected = selectedIds.has(option.value);
    });
  };

  const renderMenuRecipePicker = () => {
    if (!menuRecipesPicker) return;

    const recipes = getRecipes();
    const selectedIds = new Set(getSelectedMenuRecipeIds());
    const selectedRecipes = recipes.filter((recipe) => selectedIds.has(recipe.id));
    const selectedCost = selectedRecipes.reduce((total, recipe) => total + Number(recipe.cost || 0), 0);

    if (menuRecipesSummary) {
      menuRecipesSummary.textContent = selectedRecipes.length
        ? `${selectedRecipes.length} recipe${selectedRecipes.length === 1 ? "" : "s"} selected · $${selectedCost.toFixed(2)} cost / person`
        : "No recipes selected";
    }

    if (selectAllMenuRecipesBtn) selectAllMenuRecipesBtn.disabled = recipes.length === 0;
    if (clearMenuRecipesBtn) clearMenuRecipesBtn.disabled = selectedRecipes.length === 0;

    if (recipes.length === 0) {
      menuRecipesPicker.innerHTML = `
        <div class="menu-recipes-empty">
          <strong>No recipes available.</strong>
          <span>Create recipes first, then come back to build a menu.</span>
        </div>
      `;
      return;
    }

    menuRecipesPicker.innerHTML = recipes.map((recipe) => {
      const isSelected = selectedIds.has(recipe.id);
      const recipePhoto = recipe.photo
        ? `<img src="${escapeHtml(recipe.photo)}" alt="${escapeHtml(recipe.name || "Recipe photo")}" />`
        : `<span>${escapeHtml((recipe.name || "R").slice(0, 1).toUpperCase())}</span>`;

      return `
        <button type="button" class="menu-recipe-choice ${isSelected ? "is-selected" : ""}" data-menu-recipe-id="${escapeHtml(recipe.id)}" aria-pressed="${isSelected}">
          <span class="menu-recipe-check" aria-hidden="true">${isSelected ? "✓" : ""}</span>
          <span class="menu-recipe-thumb ${recipe.photo ? "" : "is-empty"}">${recipePhoto}</span>
          <span class="menu-recipe-copy">
            <strong>${escapeHtml(recipe.name || "Untitled Recipe")}</strong>
            <small>${escapeHtml(recipe.category || "Recipe")} · ${Number(recipe.portions || 0) || "-"} portions</small>
          </span>
          <span class="menu-recipe-cost">$${Number(recipe.cost || 0).toFixed(2)}</span>
        </button>
      `;
    }).join("");
  };

  const toggleMenuRecipeSelection = (recipeId) => {
    if (!recipeId) return;

    const selectedIds = new Set(getSelectedMenuRecipeIds());
    if (selectedIds.has(recipeId)) {
      selectedIds.delete(recipeId);
    } else {
      selectedIds.add(recipeId);
    }

    setSelectedMenuRecipeIds(Array.from(selectedIds));
    renderMenuRecipePicker();
  };

  const populateMenuRecipeOptions = () => {
    if (!menuRecipesInput) return;

    const selectedValues = getSelectedMenuRecipeIds();
    const recipes = getRecipes();

    menuRecipesInput.innerHTML = "";

    if (recipes.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Create recipes first";
      menuRecipesInput.appendChild(option);
      renderMenuRecipePicker();
      return;
    }

    recipes.forEach((recipe) => {
      const option = document.createElement("option");
      option.value = recipe.id;
      option.textContent = `${recipe.name} - $${Number(recipe.cost || 0).toFixed(2)} / portion`;
      option.selected = selectedValues.includes(recipe.id);
      menuRecipesInput.appendChild(option);
    });

    renderMenuRecipePicker();
  };

  const renderMenus = () => {
    refreshMenuTypeOptions();

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
      const menuRecipes = (menu.recipeIds || [])
        .map((recipeId) => recipes.find((recipe) => recipe.id === recipeId))
        .filter(Boolean);
      const recipeNames = menuRecipes
        .map((recipe) => recipe.name)
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
        <td>
          <div class="menu-table-name">
            <strong>${escapeHtml(menu.name || "-")}</strong>
            <span>${recipeNames.length} recipe${recipeNames.length === 1 ? "" : "s"} included</span>
          </div>
        </td>
        <td><span class="menu-type-pill">${escapeHtml(menu.type || "-")}</span></td>
        <td>
          <div class="menu-recipe-chip-list">
            ${recipeNames.length
              ? recipeNames.map((name) => `<span>${escapeHtml(name)}</span>`).join("")
              : "<span>No recipes</span>"
            }
          </div>
        </td>
        <td><strong>$${displayCost.toFixed(2)}</strong></td>
        <td><strong>$${Number(menu.price || 0).toFixed(2)}</strong></td>
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
          renderMenuRecipePicker();

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
            renderMenuRecipePicker();
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
    const selectedRecipeIds = getSelectedMenuRecipeIds();
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
    renderMenuRecipePicker();
  };

  const renderRecipes = () => {
    const recipes = getRecipes();
    const inventory = getInventory();
    if (!recipesTableBody) return;

    recipesTableBody.innerHTML = "";
    if (recipeCardGrid) recipeCardGrid.innerHTML = "";

    if (recipes.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="8" style="color:#64748b; text-align:center; padding:20px;">
          No recipes yet. Create your first recipe.
        </td>
      `;
      recipesTableBody.appendChild(emptyRow);
      if (recipeCardGrid) {
        recipeCardGrid.innerHTML = `
          <div class="recipe-book-empty">
            <strong>No recipes yet.</strong>
            <span>Create the first recipe card with ingredients, photo, and preparation.</span>
          </div>
        `;
      }
      return;
    }

    recipes.forEach((recipe) => {
      const ingredientCost = calculateRecipeIngredientCost(recipe.ingredients || []);
      const baseCost = ingredientCost > 0 ? ingredientCost : Number(recipe.baseCost || recipe.cost || 0);
      const cost = applyWasteToCost(baseCost, recipe.wastePercent || 0);
      const portions = Number(recipe.portions || 0);
      const totalBatchCost = cost * portions;
      const ingredientCount = (recipe.ingredients || []).length;
      const recipePhotoMarkup = recipe.photo
        ? `<img src="${escapeHtml(recipe.photo)}" alt="${escapeHtml(recipe.name || "Recipe photo")}" />`
        : `<span>${escapeHtml((recipe.name || "R").slice(0, 1).toUpperCase())}</span>`;
      const openRecipeDetails = () => openIngredientsModal(recipe);
      const printSavedRecipe = () => printRecipeCard(recipe);
      const editRecipe = () => {
        if (recipeNameInput) recipeNameInput.value = recipe.name || "";
        if (recipeSheetNameInput) recipeSheetNameInput.value = recipe.sheet || "";
        if (recipeCategoryInput) recipeCategoryInput.value = recipe.category || "Entree";
        if (recipeCostInput) recipeCostInput.value = recipe.baseCost || recipe.cost || "";
        if (recipePortionsInput) recipePortionsInput.value = recipe.portions || "";
        if (recipeYieldInput) recipeYieldInput.value = recipe.wastePercent || 0;
        if (recipePreparationInput) recipePreparationInput.value = recipe.preparation || "";
        if (recipeNotesInput) recipeNotesInput.value = recipe.notes || "";
        renderRecipeInfoDisplays();
        currentRecipePhotoDataUrl = recipe.photo || "";
        renderPhotoPreview(recipePhotoPreview, removeRecipePhotoBtn, currentRecipePhotoDataUrl);
        currentRecipeIngredients = [...(recipe.ingredients || [])];
        resetRecipeIngredientEditMode();
        clearIngredientPicker(recipeIngredientPicker);
        if (recipeIngredientQtyInput) recipeIngredientQtyInput.value = "";
        editingRecipeId = recipe.id;
        renderSelectedIngredients();
        if (addRecipeBtn) addRecipeBtn.textContent = "Update Recipe";
        recipesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      const deleteRecipe = () => {
        const confirmDelete = confirm(`Delete ${recipe.name || "this recipe"}?`);
        if (!confirmDelete) return;

        const updatedRecipes = getRecipes().filter((recipeItem) => recipeItem.id !== recipe.id);
        saveRecipes(updatedRecipes);

        if (editingRecipeId === recipe.id) {
          editingRecipeId = null;
          currentRecipeIngredients = [];
          renderSelectedIngredients();
          resetRecipePhoto();
          if (addRecipeBtn) addRecipeBtn.textContent = "Save Recipe";
          if (recipeSheetNameInput) recipeSheetNameInput.value = "";
          if (recipeNameInput) recipeNameInput.value = "";
          if (recipeCategoryInput) recipeCategoryInput.value = "";
          if (recipeCostInput) recipeCostInput.value = "";
          if (recipePortionsInput) recipePortionsInput.value = "";
          if (recipeYieldInput) recipeYieldInput.value = "0";
          if (recipePreparationInput) recipePreparationInput.value = "";
          if (recipeNotesInput) recipeNotesInput.value = "";
        }

        renderRecipes();
        populateMenuRecipeOptions();
        renderMenus();
        renderEvents();
      };

      if (recipeCardGrid) {
        const card = document.createElement("article");
        card.className = "recipe-book-card";
        card.innerHTML = `
          <button type="button" class="recipe-book-media recipe-card-open-btn" aria-label="Open ${escapeHtml(recipe.name || "recipe")}">
            ${recipePhotoMarkup}
          </button>
          <div class="recipe-book-content">
            <div class="recipe-book-heading">
              <span>${escapeHtml(recipe.category || "Recipe")}</span>
              <h4>${escapeHtml(recipe.name || "Untitled Recipe")}</h4>
              <p>${escapeHtml(recipe.notes || recipe.preparation || "Open the recipe card to view preparation.")}</p>
            </div>
            <div class="recipe-book-stats">
              <span>${ingredientCount} ingredient${ingredientCount === 1 ? "" : "s"}</span>
              <span>${portions || "-"} portions</span>
              <span>$${cost.toFixed(2)} / portion</span>
            </div>
            <div class="recipe-book-actions">
              <button type="button" class="primary-btn recipe-card-open-btn">Open Recipe</button>
              <button type="button" class="secondary-btn recipe-card-print-btn">Print</button>
              <button type="button" class="secondary-btn recipe-card-edit-btn">Edit</button>
              <button type="button" class="icon-btn delete recipe-card-delete-btn" title="Delete">×</button>
            </div>
          </div>
        `;
        card.querySelectorAll(".recipe-card-open-btn").forEach((button) => button.addEventListener("click", openRecipeDetails));
        card.querySelector(".recipe-card-print-btn")?.addEventListener("click", printSavedRecipe);
        card.querySelector(".recipe-card-edit-btn")?.addEventListener("click", editRecipe);
        card.querySelector(".recipe-card-delete-btn")?.addEventListener("click", deleteRecipe);
        recipeCardGrid.appendChild(card);
      }

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>
          <div class="recipe-table-name">
            <span class="recipe-table-thumb ${recipe.photo ? "" : "is-empty"}">${recipePhotoMarkup}</span>
            <strong>${escapeHtml(recipe.name || "-")}</strong>
          </div>
        </td>
        <td>${escapeHtml(recipe.category || "-")}</td>
        <td>
          <div class="recipe-ingredients-cell">
            <button type="button" class="secondary-btn view-ingredients-btn">
              Open Recipe
            </button>
          </div>
        </td>
        <td>$${cost.toFixed(2)}</td>
        <td>${portions || "-"}</td>
        <td>$${totalBatchCost.toFixed(2)}</td>
        <td>${escapeHtml(recipe.notes || "-")}</td>
        <td>
          <div class="icon-actions">
            <button type="button" class="secondary-btn recipe-print-btn">Print</button>
            <button type="button" class="icon-btn edit recipe-edit-btn" title="Edit">✏️</button>
            <button type="button" class="icon-btn delete recipe-delete-btn" title="Delete">🗑️</button>
          </div>
        </td>
      `;

      const editBtn = newRow.querySelector(".recipe-edit-btn");
      const deleteBtn = newRow.querySelector(".recipe-delete-btn");
      const viewIngredientsBtn = newRow.querySelector(".view-ingredients-btn");
      const printBtn = newRow.querySelector(".recipe-print-btn");

      if (viewIngredientsBtn) {
        viewIngredientsBtn.addEventListener("click", openRecipeDetails);
      }

      if (editBtn) {
        editBtn.addEventListener("click", editRecipe);
      }

      if (printBtn) {
        printBtn.addEventListener("click", printSavedRecipe);
      }

      if (deleteBtn) {
        deleteBtn.addEventListener("click", deleteRecipe);
      }

      recipesTableBody.appendChild(newRow);
    });
  };

  const addRecipe = () => {
    if (hasPendingRecipeIngredientDraft()) {
      const addedPendingIngredient = addRecipeIngredient({ focusAfterAdd: false });
      if (!addedPendingIngredient) {
        alert("Finish adding the ingredient row before saving the recipe.");
        return;
      }
    }

    const name = recipeNameInput ? recipeNameInput.value.trim() : "";
    const sheet = recipeSheetNameInput ? recipeSheetNameInput.value.trim() : "";
    const category = recipeCategoryInput ? recipeCategoryInput.value.trim() || "Entree" : "Entree";
    const summary = getRecipeCostSummaryMetrics();
    const baseCost = summary.baseCost;
    const cost = summary.totalCost;
    const wastePercent = recipeYieldInput ? Number(recipeYieldInput.value || 0) : 0;
    const portions = recipePortionsInput ? Number(recipePortionsInput.value) : 0;
    const preparation = recipePreparationInput ? recipePreparationInput.value.trim() : "";
    const notes = recipeNotesInput ? recipeNotesInput.value.trim() : "";

    const missingRecipeFields = [];
    if (!name) missingRecipeFields.push("Recipe Name");
    if (portions <= 0) missingRecipeFields.push("PAX / Portions");
    if (summary.ingredientCount <= 0 || cost <= 0) missingRecipeFields.push("at least one priced ingredient");

    if (missingRecipeFields.length) {
      alert(`Please complete: ${missingRecipeFields.join(", ")}.`);
      return;
    }

    const recipes = getRecipes();

    if (editingRecipeId) {
      const updatedRecipes = recipes.map((recipe) => {
        if (recipe.id !== editingRecipeId) return recipe;
        return {
          ...recipe,
          name,
          sheet,
          category,
          baseCost,
          cost,
          wastePercent,
          portions,
          preparation,
          notes,
          photo: currentRecipePhotoDataUrl,
          ingredients: [...currentRecipeIngredients]
        };
      });
      saveRecipes(updatedRecipes);
      editingRecipeId = null;
      if (addRecipeBtn) addRecipeBtn.textContent = "Save Recipe";
    } else {
      recipes.push({
        id: Date.now().toString(),
        name,
        sheet,
        category,
        baseCost,
        cost,
        wastePercent,
        portions,
        preparation,
        notes,
        photo: currentRecipePhotoDataUrl,
        ingredients: [...currentRecipeIngredients]
      });
      saveRecipes(recipes);
    }

    refreshRecipeOptionLists();
    renderRecipes();
    populateMenuRecipeOptions();
    renderMenus();
    renderEvents();

    if (recipeNameInput) recipeNameInput.value = "";
    if (recipeSheetNameInput) recipeSheetNameInput.value = "";
    if (recipeCategoryInput) recipeCategoryInput.value = "";
    if (recipeCostInput) recipeCostInput.value = "";
    if (recipePortionsInput) recipePortionsInput.value = "";
    if (recipePreparationInput) recipePreparationInput.value = "";
    if (recipeNotesInput) recipeNotesInput.value = "";
    resetRecipePhoto();
    currentRecipeIngredients = [];
    resetRecipeIngredientEditMode();
    clearIngredientPicker(recipeIngredientPicker);
    if (recipeIngredientQtyInput) recipeIngredientQtyInput.value = "";
    renderSelectedIngredients();
    renderRecipeInfoDisplays();
    if (recipeYieldInput) recipeYieldInput.value = "0";
    if (addRecipeBtn) addRecipeBtn.textContent = "Save Recipe";
  };

  const renderSubRecipes = () => {
    const subRecipes = getSubRecipes();
    if (!subRecipesTableBody) return;

    subRecipesTableBody.innerHTML = "";
    if (subRecipeCardGrid) subRecipeCardGrid.innerHTML = "";

    if (subRecipes.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
        <td colspan="8" style="color:#64748b; text-align:center; padding:20px;">
          No prep recipes yet. Create your first prep recipe.
        </td>
      `;
      subRecipesTableBody.appendChild(emptyRow);
      if (subRecipeCardGrid) {
        subRecipeCardGrid.innerHTML = `
          <div class="recipe-book-empty">
            <strong>No prep recipes yet.</strong>
            <span>Create sauces, bases, dressings, or batch prep cards.</span>
          </div>
        `;
      }
      return;
    }

    subRecipes.forEach((subRecipe) => {
      const baseCost = calculateSubRecipeIngredientCost(subRecipe.ingredients || []);
      const totalPrepCost = applyWasteToCost(baseCost, subRecipe.wastePercent || 0);
      const yieldAmount = Number(subRecipe.yieldAmount || 0);
      const costPerYieldUnit = yieldAmount > 0 ? totalPrepCost / yieldAmount : 0;
      const yieldUnit = subRecipe.yieldUnit || "units";
      const ingredientCount = (subRecipe.ingredients || []).length;
      const prepPhotoMarkup = subRecipe.photo
        ? `<img src="${escapeHtml(subRecipe.photo)}" alt="${escapeHtml(subRecipe.name || "Prep recipe photo")}" />`
        : `<span>${escapeHtml((subRecipe.name || "P").slice(0, 1).toUpperCase())}</span>`;
      const openPrepDetails = () => openSubRecipeIngredientsModal(subRecipe);
      const editPrepRecipe = () => {
        if (subRecipeNameInput) subRecipeNameInput.value = subRecipe.name || "";
        if (subRecipeCategoryInput) subRecipeCategoryInput.value = subRecipe.category || "Sauce";
        if (subRecipeYieldInput) subRecipeYieldInput.value = subRecipe.yieldAmount || "";
        if (subRecipeYieldUnitInput) subRecipeYieldUnitInput.value = subRecipe.yieldUnit || "lb";
        if (subRecipeWasteInput) subRecipeWasteInput.value = subRecipe.wastePercent || 0;
        if (subRecipePreparationInput) subRecipePreparationInput.value = subRecipe.preparation || "";
        if (subRecipeNotesInput) subRecipeNotesInput.value = subRecipe.notes || "";

        currentSubRecipePhotoDataUrl = subRecipe.photo || "";
        renderPhotoPreview(subRecipePhotoPreview, removeSubRecipePhotoBtn, currentSubRecipePhotoDataUrl);
        currentSubRecipeIngredients = [...(subRecipe.ingredients || [])];
        editingSubRecipeId = subRecipe.id;
        renderSelectedSubRecipeIngredients();
        if (addSubRecipeBtn) addSubRecipeBtn.textContent = "Update Prep Recipe";
        subRecipesSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      const deletePrepRecipe = () => {
        const confirmDelete = confirm(`Delete ${subRecipe.name || "this prep recipe"}?`);
        if (!confirmDelete) return;

        const updatedSubRecipes = getSubRecipes().filter((item) => item.id !== subRecipe.id);
        saveSubRecipes(updatedSubRecipes);
        syncSubRecipesToInventory();

        if (editingSubRecipeId === subRecipe.id) {
          editingSubRecipeId = null;
          currentSubRecipeIngredients = [];
          renderSelectedSubRecipeIngredients();
          resetSubRecipePhoto();
          if (addSubRecipeBtn) addSubRecipeBtn.textContent = "Add Prep Recipe";
        }

        refreshRecipeOptionLists();
        renderSubRecipes();
        renderInventory();
      };

      if (subRecipeCardGrid) {
        const card = document.createElement("article");
        card.className = "recipe-book-card prep";
        card.innerHTML = `
          <button type="button" class="recipe-book-media sub-recipe-card-open-btn" aria-label="Open ${escapeHtml(subRecipe.name || "prep recipe")}">
            ${prepPhotoMarkup}
          </button>
          <div class="recipe-book-content">
            <div class="recipe-book-heading">
              <span>${escapeHtml(subRecipe.category || "Prep Recipe")}</span>
              <h4>${escapeHtml(subRecipe.name || "Untitled Prep Recipe")}</h4>
              <p>${escapeHtml(subRecipe.notes || subRecipe.preparation || "Open the prep card to view preparation.")}</p>
            </div>
            <div class="recipe-book-stats">
              <span>${ingredientCount} ingredient${ingredientCount === 1 ? "" : "s"}</span>
              <span>${yieldAmount ? `${yieldAmount.toFixed(2)} ${escapeHtml(yieldUnit)}` : "Yield pending"}</span>
              <span>$${costPerYieldUnit.toFixed(2)} / ${escapeHtml(yieldUnit)}</span>
            </div>
            <div class="recipe-book-actions">
              <button type="button" class="primary-btn sub-recipe-card-open-btn">Open Prep</button>
              <button type="button" class="secondary-btn sub-recipe-card-edit-btn">Edit</button>
              <button type="button" class="icon-btn delete sub-recipe-card-delete-btn" title="Delete">×</button>
            </div>
          </div>
        `;
        card.querySelectorAll(".sub-recipe-card-open-btn").forEach((button) => button.addEventListener("click", openPrepDetails));
        card.querySelector(".sub-recipe-card-edit-btn")?.addEventListener("click", editPrepRecipe);
        card.querySelector(".sub-recipe-card-delete-btn")?.addEventListener("click", deletePrepRecipe);
        subRecipeCardGrid.appendChild(card);
      }

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>
          <div class="recipe-table-name">
            <span class="recipe-table-thumb ${subRecipe.photo ? "" : "is-empty"}">${prepPhotoMarkup}</span>
            <strong>${escapeHtml(subRecipe.name || "-")}</strong>
          </div>
        </td>
        <td>${escapeHtml(subRecipe.category || "-")}</td>
        <td>
          <div class="recipe-ingredients-cell">
            <button type="button" class="secondary-btn view-sub-recipe-ingredients-btn">
              Open Prep
            </button>
          </div>
        </td>
        <td>${yieldAmount ? `${yieldAmount.toFixed(2)} ${escapeHtml(yieldUnit)}` : "-"}</td>
        <td>$${costPerYieldUnit.toFixed(2)} / ${escapeHtml(yieldUnit)}</td>
        <td>$${totalPrepCost.toFixed(2)}</td>
        <td>${escapeHtml(subRecipe.notes || "-")}</td>
        <td>
          <div class="icon-actions">
            <button type="button" class="icon-btn edit sub-recipe-edit-btn" title="Edit">✏️</button>
            <button type="button" class="icon-btn delete sub-recipe-delete-btn" title="Delete">🗑️</button>
          </div>
        </td>
      `;

      newRow.querySelector(".view-sub-recipe-ingredients-btn")?.addEventListener("click", () => {
        openPrepDetails();
      });

      newRow.querySelector(".sub-recipe-edit-btn")?.addEventListener("click", () => {
        editPrepRecipe();
      });

      newRow.querySelector(".sub-recipe-delete-btn")?.addEventListener("click", () => {
        deletePrepRecipe();
      });

      subRecipesTableBody.appendChild(newRow);
    });
  };

  const addSubRecipe = () => {
    const name = subRecipeNameInput ? subRecipeNameInput.value.trim() : "";
    const category = subRecipeCategoryInput ? subRecipeCategoryInput.value.trim() || "Sauce" : "Sauce";
    const yieldAmount = subRecipeYieldInput ? Number(subRecipeYieldInput.value) : 0;
    const yieldUnit = subRecipeYieldUnitInput ? subRecipeYieldUnitInput.value : "lb";
    const wastePercent = subRecipeWasteInput ? Number(subRecipeWasteInput.value || 0) : 0;
    const preparation = subRecipePreparationInput ? subRecipePreparationInput.value.trim() : "";
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
      preparation,
      notes,
      photo: currentSubRecipePhotoDataUrl,
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
    refreshRecipeOptionLists();

    if (subRecipeNameInput) subRecipeNameInput.value = "";
    if (subRecipeCategoryInput) subRecipeCategoryInput.value = "";
    if (subRecipeYieldInput) subRecipeYieldInput.value = "";
    if (subRecipeWasteInput) subRecipeWasteInput.value = "0";
    if (subRecipePreparationInput) subRecipePreparationInput.value = "";
    if (subRecipeNotesInput) subRecipeNotesInput.value = "";
    resetSubRecipePhoto();
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

  const renderInventoryCategoryFilterOptions = (items = []) => {
    if (!inventoryCategoryFilterInput) return;

    const currentValue = inventoryCategoryFilterInput.value;
    const categories = getInventoryCategoriesForItems(items);
    inventoryCategoryFilterInput.innerHTML = `
      <option value="">All Categories</option>
      ${categories.map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.label)}</option>`).join("")}
    `;

    inventoryCategoryFilterInput.value = categories.some((category) => category.id === currentValue)
      ? currentValue
      : "";
  };

  const renderInventorySummary = (items) => {
    if (!inventoryCategorySummary) return;

    inventoryCategorySummary.innerHTML = "";

    getInventoryCategoriesForItems(items).forEach((category) => {
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
    refreshInventoryOptionLists(inventory);
    renderInventoryCategoryFilterOptions(inventory);
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

    getInventoryCategoriesForItems(sortedInventory).forEach((category) => {
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
            if (inventoryCategoryInput) inventoryCategoryInput.value = getInventoryItemCategory(item).label;
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
              if (inventoryCategoryInput) inventoryCategoryInput.value = "";
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
      restaurantId: selectedRestaurantId || "",
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
    if (inventoryCategoryInput) inventoryCategoryInput.value = "";
    if (inventoryQuantityInput) inventoryQuantityInput.value = "";
    if (inventoryTotalCostInput) inventoryTotalCostInput.value = "";
    if (inventoryStorageAreaInput) inventoryStorageAreaInput.value = "Refrigerated";
  };
  const UNASSIGNED_STATION = "Unassigned";
  const DEFAULT_STATION = UNASSIGNED_STATION;
  const shiftStations = ["Flat Top", "Broiler/Grill", "Fry", "Pantry", "Prep", "Expo", "Line Support", "Extra Board"];
  const shiftStationOrder = [UNASSIGNED_STATION, "Prep", "Line Support", "Pantry", "Fry", "Flat Top", "Broiler/Grill", "Extra Board", "Expo"];
  const shiftAssignmentStations = [...shiftStationOrder];
  const morningStations = ["Prep", "Line Support"];
  const afternoonCoreStations = ["Pantry", "Fry", "Flat Top", "Broiler/Grill"];
  const flexibleSupportStation = "Extra Board";
  const variableAfternoonStations = [...afternoonCoreStations, flexibleSupportStation];
  const lateNightStations = ["Fry", "Flat Top", "Broiler/Grill"];
  const fixedMorningStaffNames = new Set(["eduardo", "lila"]);
  const fixedLateNightStaffNames = new Set(["manuel", "david"]);
  const shiftHandoffWindowMinutes = 60;
  const PTS_REFERENCE_SCHEDULE_SEED_KEY = "beoflow_pts_reference_schedule_seeded";
  const PTS_REFERENCE_SCHEDULE_VERSION = "2026-05-11-v1";
  const PTS_REFERENCE_SHEET_LABEL = "PTS reference sheet 5/11/2026";
  const shiftDays = [
    { key: "mon", label: "Mon" },
    { key: "tue", label: "Tue" },
    { key: "wed", label: "Wed" },
    { key: "thu", label: "Thu" },
    { key: "fri", label: "Fri" },
    { key: "sat", label: "Sat" },
    { key: "sun", label: "Sun" }
  ];
  const ptsReferenceScheduleRows = [
    { name: "EDUARDO", shifts: { tue: ["06:00", "14:00"], wed: ["06:00", "14:00"], thu: ["06:00", "14:00"], fri: ["06:00", "14:00"], sat: ["06:00", "14:00"] } },
    { name: "RUSTY", shifts: { wed: ["06:00", "14:00"], thu: ["06:00", "14:00"], fri: ["06:00", "14:00"], sat: ["06:00", "14:00"], sun: ["06:00", "14:00"] } },
    { name: "ROBERT", shifts: { mon: ["08:00", "16:00"], tue: ["08:00", "16:00"], fri: ["08:00", "16:00"], sat: ["08:00", "16:00"], sun: ["08:00", "16:00"] } },
    { name: "BRYAN", shifts: { mon: ["08:00", "16:00"], tue: ["08:00", "16:00"], fri: ["12:00", "20:00"], sat: ["11:00", "19:00"], sun: ["11:00", "19:00"] } },
    { name: "LILA", shifts: { mon: ["08:00", "16:00"], thu: ["08:00", "16:00"], fri: ["08:00", "16:00"], sat: ["08:00", "16:00"], sun: ["07:00", "15:00"] } },
    { name: "RANDY", shifts: { fri: ["14:00", "22:00"], sat: ["14:00", "22:00"], sun: ["14:00", "22:00"] } },
    { name: "JERONIMO", shifts: { wed: ["14:30", "22:30"], thu: ["14:30", "22:30"], fri: ["14:00", "22:00"], sat: ["11:00", "19:00"], sun: ["11:00", "19:00"] } },
    { name: "JUAN", shifts: { fri: ["16:30", "00:30"], sat: ["16:30", "00:30"], sun: ["14:00", "22:00"] } },
    { name: "JUAN H", shifts: { mon: ["14:30", "22:30"], tue: ["14:30", "22:30"], fri: ["16:30", "00:30"], sat: ["16:30", "00:30"], sun: ["14:30", "22:30"] } },
    { name: "CARLOS", shifts: { mon: ["14:30", "22:30"], tue: ["14:30", "22:30"], wed: ["14:30", "22:30"], sat: ["16:30", "00:30"], sun: ["14:00", "22:00"] } },
    { name: "AARON", shifts: { wed: ["14:30", "22:30"], thu: ["14:30", "22:30"], fri: ["16:30", "00:30"], sat: ["12:00", "20:00"], sun: ["12:00", "20:00"] } },
    { name: "DAVID", shifts: { wed: ["18:30", "02:30"], thu: ["18:30", "02:30"], fri: ["19:00", "03:00"], sat: ["19:00", "03:00"], sun: ["19:00", "03:00"] } },
    { name: "ADRIANA", shifts: { mon: ["14:30", "22:30"], thu: ["14:30", "22:30"], fri: ["16:30", "00:30"], sat: ["16:30", "00:30"] } },
    { name: "MANUEL", shifts: { mon: ["19:00", "03:00"], tue: ["19:00", "03:00"], fri: ["22:00", "06:00"], sat: ["22:00", "06:00"], sun: ["19:00", "03:00"] } },
    { name: "Ivan", shifts: { mon: ["14:30", "22:30"], tue: ["14:30", "22:30"], fri: ["16:30", "00:30"], sat: ["16:30", "00:30"], sun: ["14:30", "22:30"] } }
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

  const normalizeStaffName = (name = "") =>
    String(name)
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const parseShiftTimeToMinutes = (time = "") => {
    const [hours, minutes] = String(time || "").split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  };

  const getAssignmentShiftWindow = (assignment = {}, person = {}) => {
    const start = parseShiftTimeToMinutes(assignment.shiftStart || person.shiftStart || "");
    const rawEnd = parseShiftTimeToMinutes(assignment.shiftEnd || person.shiftEnd || "");
    if (start == null || rawEnd == null) return null;

    let end = rawEnd;
    if (end <= start) end += 24 * 60;

    return {
      start,
      end,
      isOvernight: rawEnd <= start
    };
  };

  const getRotationGroup = (person = {}, dayKey = activeShiftDay) => {
    const window = getAssignmentShiftWindow(getPersonDayAssignment(person, dayKey), person);
    if (window) {
      if (window.start < 10 * 60) return "fixedMorning";
      if (window.isOvernight && window.start >= 18 * 60) return "fixedLateNight";
      return "variableAfternoon";
    }

    const normalizedName = normalizeStaffName(person.name);
    if (fixedMorningStaffNames.has(normalizedName)) return "fixedMorning";
    if (fixedLateNightStaffNames.has(normalizedName)) return "fixedLateNight";
    return "variableAfternoon";
  };

  const stationCandidatesForGroup = (group = "variableAfternoon", workingCount = 0) => {
    if (group === "fixedMorning") return morningStations;
    if (group === "fixedLateNight") return lateNightStations;
    return workingCount > afternoonCoreStations.length ? variableAfternoonStations : afternoonCoreStations;
  };

  const orderedStations = (stations = []) => {
    const seen = new Set();
    return stations
      .filter((station) => {
        if (!shiftAssignmentStations.includes(station) || seen.has(station)) return false;
        seen.add(station);
        return true;
      })
      .sort((left, right) => {
        const leftIndex = shiftStationOrder.indexOf(left);
        const rightIndex = shiftStationOrder.indexOf(right);
        return (leftIndex === -1 ? shiftStationOrder.length : leftIndex)
          - (rightIndex === -1 ? shiftStationOrder.length : rightIndex);
      });
  };

  const getStationSortIndex = (station = "") => {
    const index = shiftStationOrder.indexOf(station);
    return index === -1 ? shiftStationOrder.length : index;
  };

  const normalizeImportedStation = (rawValue = "") => {
    const value = String(rawValue || "").trim().toLowerCase();
    if (!value) return "";

    if (value.includes("extra board") || value.includes("extraboard") || value.includes("extra")) return "Extra Board";
    if (value.includes("flat") || value.includes("plancha") || value.includes("grilled")) return "Flat Top";
    if (
      value.includes("broiler")
      || value.includes("grill")
      || value.includes("parrilla")
      || value.includes("carbon")
      || value.includes("char")
    ) {
      return "Broiler/Grill";
    }
    if (value.includes("fry") || value.includes("freidora") || value.includes("wings")) return "Fry";
    if (value.includes("pantry")) return "Pantry";
    if (value.includes("prep") || value.includes("pt")) return "Prep";
    if (value.includes("expo")) return "Expo";
    if (
      value.includes("line")
      || value.includes("linea")
      || value.includes("línea")
      || value.includes("support")
      || value.includes("apoyo")
    ) {
      return "Line Support";
    }

    return shiftStations.find((station) => station.toLowerCase() === value) || "";
  };

  const normalizeImportedRole = (rawValue = "") => {
    const value = String(rawValue || "").toLowerCase();
    if (value.includes("prep")) return "Prep Cook";
    if (value.includes("sous")) return "Sous Chef";
    if (value.includes("lead") || value.includes("lider") || value.includes("líder")) return "Lead Cook";
    if (value.includes("chef")) return "Chef";
    if (value.includes("line") || value.includes("linea") || value.includes("línea")) return "Line Cook";
    return "Line Cook";
  };

  const getPersonDayAssignment = (person = {}, dayKey = activeShiftDay) => {
    const dayAssignment = person.assignments?.[dayKey];
    if (dayAssignment) return dayAssignment;

    return {
      station: person.station || DEFAULT_STATION,
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
      station: dayAssignment.station || person.station || DEFAULT_STATION,
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

  const getAssignmentOptionsForPerson = (person = {}, dayKey = activeShiftDay, staff = getStaff()) => {
    const group = getRotationGroup(person, dayKey);
    const workingCount = getStaffForDay(staff, dayKey).filter((scheduled) => getRotationGroup(scheduled, dayKey) === group).length;
    return stationCandidatesForGroup(group, workingCount);
  };

  const getVisibleStationsForDay = (staff = getStaff(), dayKey = activeShiftDay) => {
    const staffedStations = getStaffForDay(staff, dayKey).map((person) => person.station);
    return orderedStations([...staffedStations, ...morningStations, ...variableAfternoonStations, ...lateNightStations]);
  };

  const getOpenStationsForDay = (staff = getStaff(), dayKey = activeShiftDay) => {
    const dayStaff = getStaffForDay(staff, dayKey);
    return getVisibleStationsForDay(staff, dayKey).filter((station) =>
      !dayStaff.some((person) => person.station === station)
    );
  };

  const showOpenStationsForActiveDay = () => {
    const openStations = getOpenStationsForDay(getStaff(), activeShiftDay);
    const dayLabel = getShiftDayLabel(activeShiftDay);

    if (!openStations.length) {
      setScheduleImportStatus(`No open stations on ${dayLabel}. Every station has someone assigned.`, "success");
      return;
    }

    setScheduleImportStatus(`Open stations on ${dayLabel}: ${openStations.join(", ")}.`, "info");
  };

  const normalizeImportedTime = (rawValue = "") => {
    const trimmed = String(rawValue || "").trim();
    if (!trimmed) return "";

    const directParts = trimmed.split(":").map(Number);
    if (directParts.length === 2 && directParts.every(Number.isFinite)) {
      const [hours, minutes] = directParts;
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      }
    }

    const match = trimmed.toUpperCase().replace(/\./g, "").match(/^\s*(\d{1,2})(?::?(\d{2}))?\s*([AP]M?)?\s*$/);
    if (!match) return "";

    let hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const marker = match[3] || "";
    if (marker.startsWith("P") && hours < 12) hours += 12;
    if (marker.startsWith("A") && hours === 12) hours = 0;

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

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
    const fallbackStation = station || UNASSIGNED_STATION;
    const fallbackStart = normalizeImportedTime(employee.shiftStart || "");
    const fallbackEnd = normalizeImportedTime(employee.shiftEnd || "");

    if (!importedAssignments) {
      if (!fallbackStart || !fallbackEnd) {
        return shiftDays.reduce((assignments, day) => {
          assignments[day.key] = { station: "", shiftStart: "", shiftEnd: "", off: true };
          return assignments;
        }, {});
      }

      return buildAssignmentsForActiveDay({ station: fallbackStation, shiftStart: fallbackStart, shiftEnd: fallbackEnd });
    }

    const assignments = shiftDays.reduce((items, day) => {
      const rawAssignment = Object.entries(importedAssignments).find(([key]) => normalizeShiftDayKey(key) === day.key)?.[1] || {};
      const assignmentStation = normalizeImportedStation(rawAssignment.station) || UNASSIGNED_STATION;
      const shiftStart = normalizeImportedTime(rawAssignment.shiftStart || rawAssignment.start || "");
      const shiftEnd = normalizeImportedTime(rawAssignment.shiftEnd || rawAssignment.end || "");
      const isOff = Boolean(rawAssignment.off) || !shiftStart || !shiftEnd;

      items[day.key] = {
        station: isOff ? "" : assignmentStation || UNASSIGNED_STATION,
        shiftStart,
        shiftEnd,
        off: isOff
      };
      return items;
    }, {});

    return assignments;
  };

  const cloneShiftAssignments = (assignments = {}) =>
    shiftDays.reduce((items, day) => {
      items[day.key] = { ...(assignments[day.key] || {}) };
      return items;
    }, {});

  const buildBlankWeekAssignments = () =>
    shiftDays.reduce((items, day) => {
      items[day.key] = { station: "", shiftStart: "", shiftEnd: "", off: true };
      return items;
    }, {});

  const getNormalizedWeekAssignments = (person = {}) =>
    shiftDays.reduce((items, day) => {
      const hasAssignments = person.assignments && typeof person.assignments === "object";
      const assignment = hasAssignments
        ? getPersonDayAssignment(person, day.key)
        : day.key === activeShiftDay
          ? {
              station: person.station || person.originalStation || UNASSIGNED_STATION,
              shiftStart: person.shiftStart || "",
              shiftEnd: person.shiftEnd || "",
              off: false
            }
          : { station: "", shiftStart: "", shiftEnd: "", off: true };
      const shiftStart = assignment.shiftStart || "";
      const shiftEnd = assignment.shiftEnd || "";
      const isOff = Boolean(assignment.off) || Boolean(assignment.absent) || !shiftStart || !shiftEnd;

      items[day.key] = {
        station: isOff ? assignment.station || "" : assignment.station || person.station || person.originalStation || UNASSIGNED_STATION,
        shiftStart,
        shiftEnd,
        off: isOff,
        absent: Boolean(assignment.absent),
        substituteFor: assignment.substituteFor || "",
        replacedBy: assignment.replacedBy || ""
      };
      return items;
    }, {});

  const getFirstWorkingAssignment = (assignments = {}) =>
    shiftDays.map((day) => assignments[day.key]).find(isAssignmentWorking) || null;

  const buildPtsReferenceAssignments = (shifts = {}) =>
    shiftDays.reduce((items, day) => {
      const range = shifts[day.key] || [];
      const shiftStart = range[0] || "";
      const shiftEnd = range[1] || "";
      const isWorking = Boolean(shiftStart && shiftEnd);

      items[day.key] = {
        station: isWorking ? UNASSIGNED_STATION : "",
        shiftStart,
        shiftEnd,
        off: !isWorking
      };
      return items;
    }, {});

  const buildPtsReferenceStaff = () =>
    ptsReferenceScheduleRows.map((row) => {
      const assignments = buildPtsReferenceAssignments(row.shifts);
      const firstWorkingAssignment = getFirstWorkingAssignment(assignments);
      const employeeKey = normalizeStaffName(row.name).replace(/[^a-z0-9]+/g, "-");

      return {
        id: `pts-reference-${employeeKey}`,
        name: row.name,
        role: "Line Cook",
        station: firstWorkingAssignment?.station || UNASSIGNED_STATION,
        originalStation: UNASSIGNED_STATION,
        shiftStart: firstWorkingAssignment?.shiftStart || "",
        shiftEnd: firstWorkingAssignment?.shiftEnd || "",
        assignments,
        originalAssignments: cloneShiftAssignments(assignments),
        sourceLabel: PTS_REFERENCE_SHEET_LABEL
      };
    });

  const shouldSeedPtsReferenceSchedule = () =>
    isRestaurantSelectionClient
    || currentClientCodeKey.includes("pts")
    || selectedRestaurantName.toLowerCase().includes("pts");

  const hasPtsReferenceSchedule = (staff = getStaff()) =>
    staff.some((person) => person.sourceLabel === PTS_REFERENCE_SHEET_LABEL);

  const loadPtsReferenceSchedule = (options = {}) => {
    const currentStaff = getStaff();
    if (currentStaff.length && options.confirm !== false) {
      const shouldReplace = window.confirm("Replace the current weekly table with the PTS reference sheet?");
      if (!shouldReplace) return false;
    }

    localStorage.setItem(PTS_REFERENCE_SCHEDULE_SEED_KEY, PTS_REFERENCE_SCHEDULE_VERSION);
    saveStaff(buildPtsReferenceStaff());
    renderStaff();
    setScheduleImportStatus("PTS reference sheet loaded with the saved names and week layout.", "success");
    return true;
  };

  const seedPtsReferenceScheduleIfNeeded = () => {
    if (!shouldSeedPtsReferenceSchedule()) return false;
    if (localStorage.getItem(PTS_REFERENCE_SCHEDULE_SEED_KEY) === PTS_REFERENCE_SCHEDULE_VERSION) return false;
    if (hasPtsReferenceSchedule()) {
      localStorage.setItem(PTS_REFERENCE_SCHEDULE_SEED_KEY, PTS_REFERENCE_SCHEDULE_VERSION);
      return false;
    }

    localStorage.setItem(PTS_REFERENCE_SCHEDULE_SEED_KEY, PTS_REFERENCE_SCHEDULE_VERSION);
    saveStaff(buildPtsReferenceStaff());
    return true;
  };

  const syncPersonFromAssignments = (person = {}, assignments = {}) => {
    const firstWorkingAssignment = getFirstWorkingAssignment(assignments);

    return {
      ...person,
      station: firstWorkingAssignment?.station || person.station || person.originalStation || UNASSIGNED_STATION,
      shiftStart: firstWorkingAssignment?.shiftStart || "",
      shiftEnd: firstWorkingAssignment?.shiftEnd || "",
      assignments
    };
  };

  const renderScheduleEditor = () => {
    const staff = getStaff();
    const weekShiftCount = shiftDays.reduce((total, day) => total + getStaffForDay(staff, day.key).length, 0);

    if (scheduleEditorSummary) {
      scheduleEditorSummary.innerHTML = staff.length
        ? `
          <div>
            <strong>PTS sheet</strong>
            <span>${staff.length} people / ${weekShiftCount} shifts</span>
          </div>
        `
        : `
          <div>
            <strong>No sheet</strong>
            <span>Open weekly table</span>
          </div>
        `;
    }

    if (!scheduleEditorTable) return;

    if (!staff.length) {
      scheduleEditorTable.innerHTML = `
        <div class="schedule-editor-empty">
          Add a row or upload a photo to build the saved weekly schedule.
        </div>
      `;
      return;
    }

    const dayHeaders = shiftDays
      .map((day) => `<th scope="col">${escapeHtml(day.label)}</th>`)
      .join("");

    const rows = staff
      .map((person) => {
        const personId = escapeHtml(person.id);
        const assignments = getNormalizedWeekAssignments(person);
        const dayCells = shiftDays
          .map((day) => {
            const assignment = assignments[day.key] || {};
            const isOff = Boolean(assignment.off) || !assignment.shiftStart || !assignment.shiftEnd;
            const dayLabel = escapeHtml(day.label);
            const personName = escapeHtml(person.name || "this employee");

            return `
              <td class="schedule-editor-day-cell ${isOff ? "is-off" : "is-working"}">
                <label class="schedule-off-toggle">
                  <input type="checkbox" data-schedule-off="${personId}" data-schedule-day="${escapeHtml(day.key)}" ${isOff ? "checked" : ""} />
                  <span>Off</span>
                </label>
                <div class="schedule-editor-times">
                  <label>
                    <span>In</span>
                    <input type="time" data-schedule-time="${personId}" data-schedule-day="${escapeHtml(day.key)}" data-schedule-field="shiftStart" value="${escapeHtml(assignment.shiftStart || "")}" aria-label="${dayLabel} in time for ${personName}" />
                  </label>
                  <label>
                    <span>Out</span>
                    <input type="time" data-schedule-time="${personId}" data-schedule-day="${escapeHtml(day.key)}" data-schedule-field="shiftEnd" value="${escapeHtml(assignment.shiftEnd || "")}" aria-label="${dayLabel} out time for ${personName}" />
                  </label>
                </div>
              </td>
            `;
          })
          .join("");

        return `
          <tr>
            <th scope="row" class="schedule-editor-person-cell">
              <input type="text" data-schedule-name="${personId}" value="${escapeHtml(person.name || "")}" placeholder="Employee name" aria-label="Employee name" />
              <button type="button" class="secondary-btn schedule-remove-row-btn" data-schedule-delete-row="${personId}">Remove</button>
            </th>
            ${dayCells}
          </tr>
        `;
      })
      .join("");

    scheduleEditorTable.innerHTML = `
      <div class="schedule-editor-scroll">
        <table class="schedule-editor-grid">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              ${dayHeaders}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  };

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
    const stationOptions = orderedStations([
      ...getAssignmentOptionsForPerson(person, activeShiftDay, getStaff()),
      person.station
    ]);
    const stationClass = getStationClass(person.station);
    const stationSymbol = getStationSymbol(person.station);

    return `
      <article class="shift-employee-card" data-staff-id="${escapeHtml(person.id)}">
        <div class="shift-card-header">
          <span class="shift-station-symbol station-${escapeHtml(stationClass)}">${escapeHtml(stationSymbol)}</span>
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
            ${stationOptions
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

  let activeWeekSize = "small";
  let weeklySchedulePreviewPreset = null;
  const weekSizeOrder = ["small", "normal", "large"];
  const weekSizeLabels = {
    small: "1x",
    normal: "2x",
    large: "3x"
  };

  const getStationClass = (station = "") =>
    String(station || "off").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "off";

  const stationSymbols = {
    "Unassigned": "UN",
    "Prep": "PR",
    "Line Support": "LS",
    "Pantry": "PA",
    "Fry": "FR",
    "Flat Top": "FT",
    "Broiler/Grill": "BG",
    "Extra Board": "EB",
    "Expo": "EX"
  };

  const getStationSymbol = (station = "") =>
    stationSymbols[station] || String(station || "--").slice(0, 2).toUpperCase();

  const renderShiftDayCounts = () => {
    const staff = getStaff();
    shiftDayTabs.forEach((tab) => {
      const dayKey = tab.dataset.shiftDay;
      const dayLabel = getShiftDayLabel(dayKey);
      const dayCount = getStaffForDay(staff, dayKey).length;
      tab.textContent = `${dayLabel} ${dayCount}`;
    });
  };

  const getWeeklyScheduleStaff = () =>
    Array.isArray(weeklySchedulePreviewPreset?.staff) ? weeklySchedulePreviewPreset.staff : getStaff();

  let activeWeekEditCell = null;
  let activeWeekEditEmployeeId = "";

  const updateWeeklyScheduleHeader = () => {
    const isPreview = Boolean(weeklySchedulePreviewPreset);
    if (shiftWeekTitle) {
      shiftWeekTitle.textContent = isPreview
        ? `Preview: ${weeklySchedulePreviewPreset.name || "Saved setup"}`
        : "Full Week Schedule";
    }
    if (shiftWeekSubtitle) {
      shiftWeekSubtitle.textContent = isPreview
        ? `${getPresetSetupLabel(weeklySchedulePreviewPreset) || "Saved setup"} · Preview only`
        : "Digital view of imported shifts, stations, substitutions, off days, and smart breaks.";
    }
    if (addWeekRowBtn) addWeekRowBtn.hidden = isPreview;
    if (autoAssignWeekBtn) autoAssignWeekBtn.hidden = isPreview;
  };

  const buildWeeklyScheduleMarkup = (sourceStaff = getWeeklyScheduleStaff(), options = {}) => {
    const staff = sourceStaff;
    const canEdit = Boolean(options.editable);

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
    const weeklyStations = orderedStations([
      ...staff.flatMap((person) =>
        shiftDays
          .map((day) => normalizePersonForDay(person, day.key))
          .filter(isAssignmentWorking)
          .map((assignment) => assignment.station)
      ),
      ...morningStations,
      ...variableAfternoonStations,
      ...lateNightStations
    ]);
    const stationLegend = [
      ...weeklyStations.map((station) => ({ label: station, className: getStationClass(station) })),
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
        const personId = escapeHtml(person.id);
        const personName = person.name || "Unnamed employee";
        const isEmployeeEditing = canEdit && String(activeWeekEditEmployeeId) === String(person.id);
        const employeeCell = isEmployeeEditing
          ? `
            <div class="shift-week-employee shift-week-employee-edit">
              <input type="text" class="shift-week-name-input" data-week-name="${personId}" value="${escapeHtml(person.name || "")}" placeholder="Employee name" aria-label="Employee name" />
              <span>${escapeHtml(person.role || "Role not set")}</span>
              <button type="button" class="secondary-btn shift-week-remove-row-btn" data-week-delete-row="${personId}" aria-label="Remove ${escapeHtml(personName)}">Remove</button>
            </div>
          `
          : `
            <div class="shift-week-employee ${canEdit ? "is-clickable" : ""}" ${canEdit ? `data-week-employee-id="${personId}" role="button" tabindex="0" aria-label="Edit ${escapeHtml(personName)}"` : ""}>
              <strong>${escapeHtml(personName)}</strong>
              <span>${escapeHtml(person.role || "Role not set")}</span>
            </div>
          `;
        const cells = shiftDays
          .map((day) => {
            const assignment = normalizePersonForDay(person, day.key);
            const isWorking = isAssignmentWorking(assignment);
            const statusLabel = assignment.absent ? "Absent" : assignment.off || !isWorking ? "Off" : assignment.station || DEFAULT_STATION;
            const stationClass = isWorking ? getStationClass(assignment.station) : "off";
            const dayKey = escapeHtml(day.key);
            const selectedStation = assignment.station || UNASSIGNED_STATION;
            const stationOptions = shiftAssignmentStations
              .map((station) => `<option value="${escapeHtml(station)}" ${selectedStation === station ? "selected" : ""}>${escapeHtml(station)}</option>`)
              .join("");
            const isCellEditing =
              canEdit
              && String(activeWeekEditCell?.staffId || "") === String(person.id)
              && activeWeekEditCell?.dayKey === day.key;

            if (isCellEditing) {
              return `
                <div class="shift-week-cell is-editable ${day.key === activeShiftDay ? "is-active" : ""} ${isWorking ? "is-working" : "is-off"} station-${stationClass}" data-week-cell-day="${dayKey}" data-week-staff-id="${personId}">
                  <div class="shift-week-cell-summary">
                    <strong>${escapeHtml(statusLabel)}</strong>
                    <span>${isWorking ? escapeHtml(formatShiftTimeRange(assignment)) : "No shift"}</span>
                    ${assignment.substituteFor ? `<em>Covers ${escapeHtml(assignment.substituteFor)}</em>` : ""}
                    ${assignment.replacedBy ? `<em>Covered by ${escapeHtml(assignment.replacedBy)}</em>` : ""}
                  </div>
                  <div class="shift-week-cell-controls">
                    <label class="shift-week-off-toggle">
                      <input type="checkbox" data-week-off="${personId}" data-week-day="${dayKey}" ${!isWorking ? "checked" : ""} />
                      <span>Off</span>
                    </label>
                    <div class="shift-week-time-row">
                      <label>
                        <span>In</span>
                        <input type="time" data-week-time="${personId}" data-week-day="${dayKey}" data-week-field="shiftStart" value="${escapeHtml(assignment.shiftStart || "")}" aria-label="${escapeHtml(day.label)} in time for ${escapeHtml(personName)}" />
                      </label>
                      <label>
                        <span>Out</span>
                        <input type="time" data-week-time="${personId}" data-week-day="${dayKey}" data-week-field="shiftEnd" value="${escapeHtml(assignment.shiftEnd || "")}" aria-label="${escapeHtml(day.label)} out time for ${escapeHtml(personName)}" />
                      </label>
                    </div>
                    <label class="shift-week-station-control">
                      <span>Station</span>
                      <select data-week-station="${personId}" data-week-day="${dayKey}" aria-label="${escapeHtml(day.label)} station for ${escapeHtml(personName)}">
                        ${stationOptions}
                      </select>
                    </label>
                  </div>
                </div>
              `;
            }

            return `
              <button type="button" class="shift-week-cell ${day.key === activeShiftDay ? "is-active" : ""} ${isWorking ? "is-working" : "is-off"} station-${stationClass}" data-week-cell-day="${dayKey}" ${canEdit ? `data-week-staff-id="${personId}" aria-label="Edit ${escapeHtml(day.label)} shift for ${escapeHtml(personName)}"` : ""}>
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
            ${employeeCell}
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

    const isEditable = !weeklySchedulePreviewPreset;
    updateWeeklyScheduleHeader();
    shiftWeekSchedule.dataset.weekSize = activeWeekSize;
    shiftWeekSchedule.dataset.editable = String(isEditable);
    shiftWeekSchedule.dataset.editing = isEditable
      ? activeWeekEditCell ? "cell" : activeWeekEditEmployeeId ? "employee" : "none"
      : "none";
    shiftWeekSchedule.innerHTML = buildWeeklyScheduleMarkup(getWeeklyScheduleStaff(), { editable: isEditable });
  };

  const hasWeeklyScheduleEditMode = () =>
    Boolean(activeWeekEditCell || activeWeekEditEmployeeId);

  const closeWeeklyScheduleEditMode = () => {
    if (!hasWeeklyScheduleEditMode()) return false;

    activeWeekEditCell = null;
    activeWeekEditEmployeeId = "";
    renderWeeklySchedule();
    return true;
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

    weeklySchedulePreviewPreset = null;
    activeWeekEditCell = null;
    activeWeekEditEmployeeId = "";
    setWeeklyScheduleSize(activeWeekSize);
    renderWeeklySchedule();
    shiftWeekModal.hidden = false;
    document.body.classList.add("modal-open");
  };

  const closeWeeklyScheduleView = () => {
    if (!shiftWeekModal) return;

    shiftWeekModal.hidden = true;
    weeklySchedulePreviewPreset = null;
    activeWeekEditCell = null;
    activeWeekEditEmployeeId = "";
    updateWeeklyScheduleHeader();
    document.body.classList.remove("modal-open");
  };

  const openAssignmentPresetPreview = (presetId) => {
    if (!shiftWeekModal) return;

    const preset = getAssignmentPresets().find((item) => item.id === presetId);
    if (!preset || !Array.isArray(preset.staff)) return;

    weeklySchedulePreviewPreset = {
      ...preset,
      staff: preset.staff.map((person) => ({ ...person }))
    };
    activeWeekEditCell = null;
    activeWeekEditEmployeeId = "";
    setWeeklyScheduleSize(activeWeekSize);
    renderWeeklySchedule();
    shiftWeekModal.hidden = false;
    document.body.classList.add("modal-open");
  };

  const openScheduleEditor = () => {
    if (!scheduleEditorModal) return;

    renderScheduleEditor();
    scheduleEditorModal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => {
      scheduleEditorModal.querySelector("[data-schedule-name], #load-reference-schedule-btn, #add-schedule-row-btn")?.focus();
    });
  };

  const closeScheduleEditor = () => {
    if (!scheduleEditorModal) return;

    scheduleEditorModal.hidden = true;
    if (!shiftWeekModal || shiftWeekModal.hidden) {
      document.body.classList.remove("modal-open");
    }
  };

  const printWeeklyScheduleView = () => {
    document.getElementById("assignment-print-root")?.remove();
    const printTitle = weeklySchedulePreviewPreset
      ? `Preview: ${weeklySchedulePreviewPreset.name || "Saved setup"}`
      : "Full Week Schedule";
    const printSubtitle = weeklySchedulePreviewPreset
      ? getPresetSetupLabel(weeklySchedulePreviewPreset) || "Saved setup"
      : "BEOFlow LineOps · Bastida Systems";

    const printRoot = document.createElement("div");
    printRoot.id = "assignment-print-root";
    printRoot.className = "week-print-root";
    printRoot.innerHTML = `
      <div class="shift-week-print-sheet">
        <header>
          <h1>${escapeHtml(printTitle)}</h1>
          <p>${escapeHtml(printSubtitle)}</p>
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
      shiftReportSummary.innerHTML = '<div class="report-empty-state">No LineOps data yet.</div>';
      return;
    }

    shiftReportSummary.innerHTML = shiftDays
      .map((day) => {
        const dayStaff = getStaffForDay(staff, day.key);
        const offStaff = getOffStaffForDay(staff, day.key);
        const openStations = getVisibleStationsForDay(staff, day.key).filter((station) => !dayStaff.some((person) => person.station === station)).length;
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
    seedPtsReferenceScheduleIfNeeded();

    const allStaff = getStaff();
    const staff = getStaffForDay(allStaff);
    const offStaff = getOffStaffForDay();
    const visibleStations = getVisibleStationsForDay(allStaff, activeShiftDay);
    const assignedCount = staff.filter((person) => shiftStations.includes(person.station)).length;
    const openStationsCount = getOpenStationsForDay(allStaff, activeShiftDay).length;
    const handoffs = getAllStationHandoffs(staff);
    const smartBreaks = getSmartBreaks(staff);

    renderShiftDayCounts();
    renderScheduleEditor();
    if (shiftWeekModal && !shiftWeekModal.hidden) renderWeeklySchedule();
    if (shiftKpiEmployees) shiftKpiEmployees.textContent = staff.length;
    if (shiftKpiReady) shiftKpiReady.textContent = assignedCount;
    if (shiftKpiNotReady) shiftKpiNotReady.textContent = openStationsCount;
    if (shiftKpiHandoffs) shiftKpiHandoffs.textContent = smartBreaks.length;
    if (!shiftReadinessBoard) return;

    shiftReadinessBoard.innerHTML = visibleStations
      .map((station) => {
        const stationStaff = staff.filter((person) => person.station === station);
        const stationHandoffs = getStationHandoffs(staff, station);
        const stationCloseouts = getStationCloseouts(staff, station);
        const stationCards = stationStaff.length
          ? stationStaff
              .map((person) => renderStaffCard(person, smartBreaks.filter((breakItem) => breakItem.person.id === person.id)))
              .join("")
          : '<div class="shift-empty-state">No employees assigned.</div>';

        const stationClass = getStationClass(station);

        return `
          <section class="shift-station-column station-${escapeHtml(stationClass)}">
            <div class="shift-station-header">
              <div class="shift-station-title">
                <span class="shift-station-symbol station-${escapeHtml(stationClass)}">${escapeHtml(getStationSymbol(station))}</span>
                <h3>${escapeHtml(station)}</h3>
              </div>
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
    if (!shiftAssignmentStations.includes(station)) return;

    const staff = getStaff();
    const selectedPerson = staff.find((person) => person.id === staffId);
    if (!selectedPerson) return;
    if (station !== UNASSIGNED_STATION && !getAssignmentOptionsForPerson(selectedPerson, activeShiftDay, staff).includes(station)) {
      setScheduleImportStatus("That station is outside this employee's LineOps block.", "warning");
      return;
    }

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
    const selectedPerson = staff.find((person) => person.id === staffId);
    if (!selectedPerson) return;

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
    const staff = getStaff();
    saveStaff(staff.filter((person) => person.id !== staffId));
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
    return true;
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
            station: currentAssignment.station || person.station || person.originalStation || DEFAULT_STATION,
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
      station: currentAssignment.station || original.station || DEFAULT_STATION,
      originalStation: currentAssignment.station || original.originalStation || original.station || DEFAULT_STATION,
      shiftStart: currentAssignment.shiftStart || original.shiftStart || "",
      shiftEnd: currentAssignment.shiftEnd || original.shiftEnd || "",
      substituteFor: original.name || "",
      assignments: buildAssignmentsForActiveDay({
        station: currentAssignment.station || original.station || DEFAULT_STATION,
        shiftStart: currentAssignment.shiftStart || original.shiftStart || "",
        shiftEnd: currentAssignment.shiftEnd || original.shiftEnd || ""
      })
    };

    replacement.assignments[activeShiftDay].substituteFor = original.name || "";

    if (!markStaffDayOff(staffId, { absent: true, replacedBy: name })) return;
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

  const updateScheduleName = (staffId, name, options = {}) => {
    const updatedStaff = getStaff().map((person) =>
      String(person.id) === String(staffId)
        ? { ...person, name: String(name || "").trim() }
        : person
    );

    saveStaff(updatedStaff);
    if (options.render !== false) renderStaff();
    setScheduleImportStatus("Weekly table saved.", "success");
  };

  const updateScheduleDayTime = (staffId, dayKey, field, value) => {
    const normalizedDay = normalizeShiftDayKey(dayKey);
    if (!normalizedDay || !["shiftStart", "shiftEnd"].includes(field)) return;

    const updatedStaff = getStaff().map((person) => {
      if (String(person.id) !== String(staffId)) return person;

      const assignments = getNormalizedWeekAssignments(person);
      const currentAssignment = assignments[normalizedDay] || { station: "", shiftStart: "", shiftEnd: "", off: true };
      const nextAssignment = {
        ...currentAssignment,
        [field]: value,
        absent: false,
        replacedBy: ""
      };
      const hasCompleteShift = Boolean(nextAssignment.shiftStart && nextAssignment.shiftEnd);

      nextAssignment.off = !hasCompleteShift;
      if (hasCompleteShift && !nextAssignment.station) {
        nextAssignment.station = person.station || person.originalStation || UNASSIGNED_STATION;
      }

      assignments[normalizedDay] = nextAssignment;
      return syncPersonFromAssignments(person, assignments);
    });

    saveStaff(updatedStaff);
    renderStaff();
    setScheduleImportStatus(`${getShiftDayLabel(normalizedDay)} time saved in the weekly table.`, "success");
  };

  const updateScheduleDayOff = (staffId, dayKey, isOff) => {
    const normalizedDay = normalizeShiftDayKey(dayKey);
    if (!normalizedDay) return;

    const updatedStaff = getStaff().map((person) => {
      if (String(person.id) !== String(staffId)) return person;

      const assignments = getNormalizedWeekAssignments(person);
      const currentAssignment = assignments[normalizedDay] || { station: "", shiftStart: "", shiftEnd: "", off: true };
      assignments[normalizedDay] = isOff
        ? {
            ...currentAssignment,
            shiftStart: "",
            shiftEnd: "",
            off: true,
            absent: false,
            replacedBy: ""
          }
        : {
            ...currentAssignment,
            station: currentAssignment.station || person.station || person.originalStation || UNASSIGNED_STATION,
            off: false,
            absent: false,
            replacedBy: ""
          };

      return syncPersonFromAssignments(person, assignments);
    });

    saveStaff(updatedStaff);
    renderStaff();
    setScheduleImportStatus(`${getShiftDayLabel(normalizedDay)} ${isOff ? "off day" : "row"} saved in the weekly table.`, "success");
  };

  const updateScheduleDayStation = (staffId, dayKey, station) => {
    const normalizedDay = normalizeShiftDayKey(dayKey);
    if (!normalizedDay || !shiftAssignmentStations.includes(station)) return;

    const updatedStaff = getStaff().map((person) => {
      if (String(person.id) !== String(staffId)) return person;

      const assignments = getNormalizedWeekAssignments(person);
      const currentAssignment = assignments[normalizedDay] || { station: "", shiftStart: "", shiftEnd: "", off: true };
      const nextAssignment = {
        ...currentAssignment,
        station,
        absent: false,
        replacedBy: ""
      };

      if (nextAssignment.shiftStart && nextAssignment.shiftEnd) {
        nextAssignment.off = false;
      }

      assignments[normalizedDay] = nextAssignment;
      return syncPersonFromAssignments(person, assignments);
    });

    saveStaff(updatedStaff);
    renderStaff();
    setScheduleImportStatus(`${getShiftDayLabel(normalizedDay)} station saved in the weekly table.`, "success");
  };

  const addScheduleRow = (options = {}) => {
    const assignments = buildBlankWeekAssignments();
    const row = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: "",
      role: "Line Cook",
      station: UNASSIGNED_STATION,
      originalStation: UNASSIGNED_STATION,
      shiftStart: "",
      shiftEnd: "",
      assignments,
      originalAssignments: cloneShiftAssignments(assignments),
      sourceLabel: "Manual schedule"
    };

    if (options?.focus === "week") {
      activeWeekEditCell = null;
      activeWeekEditEmployeeId = row.id;
    }

    saveStaff([...getStaff(), row]);
    renderStaff();
    setScheduleImportStatus("Blank row added. Add the name and times, then it will stay saved.", "success");
    requestAnimationFrame(() => {
      const focusTarget = options?.focus === "week"
        ? shiftWeekSchedule?.querySelector(`[data-week-name="${row.id}"]`)
        : scheduleEditorTable?.querySelector(`[data-schedule-name="${row.id}"]`);
      focusTarget?.focus();
    });
  };

  const normalizeImportedEmployee = (employee = {}) => {
    const name = String(employee.name || "").trim();
    if (!name) return null;
    const station = normalizeImportedStation(employee.station) || UNASSIGNED_STATION;
    const assignments = buildAssignmentsFromImport(employee, station);
    const firstWorkingAssignment = shiftDays.map((day) => assignments[day.key]).find(isAssignmentWorking) || {};

    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      role: normalizeImportedRole(employee.role),
      station: firstWorkingAssignment.station || station || UNASSIGNED_STATION,
      originalStation: station,
      shiftStart: firstWorkingAssignment.shiftStart || employee.shiftStart || "",
      shiftEnd: firstWorkingAssignment.shiftEnd || employee.shiftEnd || "",
      assignments,
      originalAssignments: cloneShiftAssignments(assignments),
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

  const formatDateInputValue = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseLocalDateInput = (value = "") => {
    const [year, month, day] = String(value || "").split("-").map(Number);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getWeekStartDate = (value = "") => {
    const date = parseLocalDateInput(value) || new Date();
    const weekStart = new Date(date);
    const daysSinceMonday = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - daysSinceMonday);
    return weekStart;
  };

  const formatSetupWeekLabel = (value = "") => {
    if (!value) return "";
    const weekStart = getWeekStartDate(value);
    return `Week of ${weekStart.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const getPresetSetupLabel = (preset = {}) =>
    formatSetupWeekLabel(preset.setupWeekStart || preset.setupDate || preset.weekStartDate || "");

  const setDefaultAssignmentPresetDate = () => {
    if (assignmentPresetDateInput && !assignmentPresetDateInput.value) {
      assignmentPresetDateInput.value = formatDateInputValue(new Date());
    }
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
        const normalizedEmployee = normalizeImportedEmployee(employee);
        if (normalizedEmployee) {
          items.push(normalizedEmployee);
        }
        return items;
      }, []);

      if (!importedStaff.length) {
        setScheduleImportStatus("No readable working shifts were found. Try a clearer photo or crop around the schedule grid.", "warning");
        return;
      }

      saveStaff(importedStaff);
      renderStaff();

      const notes = Array.isArray(result.notes) && result.notes.length ? ` ${result.notes.slice(0, 2).join(" ")}` : "";
      setScheduleImportStatus(`Photo loaded ${importedStaff.length} rows into the weekly table. Review and correct the saved table before assigning stations.${notes}`, "success");
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

  const shuffledItems = (items = []) =>
    [...items].sort(() => Math.random() - 0.5);

  const smartStation = ({ person = {}, candidates = [], previousStation = "", usage = {}, dayCounts = {} }) => {
    const availableCandidates = previousStation && candidates.length > 1
      ? candidates.filter((station) => station !== previousStation)
      : candidates;
    const scoredStations = availableCandidates.map((station) => {
      const dayBalancePenalty = (dayCounts[station] || 0) * 100;
      const employeeRepeatPenalty = (usage[station] || 0) * 35;
      const homeStationPenalty = station === person.originalStation ? 4 : 0;
      const flexibleSupportPenalty = station === flexibleSupportStation ? 22 : 0;
      const randomTieBreaker = Math.floor(Math.random() * 11);
      return {
        station,
        score: dayBalancePenalty + employeeRepeatPenalty + homeStationPenalty + flexibleSupportPenalty + randomTieBreaker
      };
    });

    scoredStations.sort((left, right) =>
      left.score - right.score || getStationSortIndex(left.station) - getStationSortIndex(right.station)
    );

    return scoredStations[0]?.station || candidates[0] || person.originalStation || person.station || DEFAULT_STATION;
  };

  const assignStationsForGroup = (staff = [], group = "variableAfternoon", dayKey = activeShiftDay, previousStationByEmployee = {}, stationUsageByEmployee = {}) => {
    const workingIds = shuffledItems(
      staff
        .filter((person) => getRotationGroup(person, dayKey) === group && isAssignmentWorking(getPersonDayAssignment(person, dayKey)))
        .map((person) => person.id)
    );
    if (!workingIds.length) return staff;

    const candidates = stationCandidatesForGroup(group, workingIds.length);
    const dayCounts = candidates.reduce((counts, station) => ({ ...counts, [station]: 0 }), {});
    const updatedStaff = [...staff];

    workingIds.forEach((employeeId) => {
      const index = updatedStaff.findIndex((person) => person.id === employeeId);
      if (index === -1) return;

      const person = updatedStaff[index];
      const station = smartStation({
        person,
        candidates,
        previousStation: previousStationByEmployee[employeeId],
        usage: stationUsageByEmployee[employeeId] || {},
        dayCounts
      });
      const currentAssignment = getPersonDayAssignment(person, dayKey);

      updatedStaff[index] = {
        ...person,
        station: dayKey === activeShiftDay ? station : person.station,
        assignments: {
          ...person.assignments,
          [dayKey]: {
            ...currentAssignment,
            station,
            off: false,
            absent: false
          }
        }
      };

      dayCounts[station] = (dayCounts[station] || 0) + 1;
      stationUsageByEmployee[employeeId] = {
        ...(stationUsageByEmployee[employeeId] || {}),
        [station]: ((stationUsageByEmployee[employeeId] || {})[station] || 0) + 1
      };
      previousStationByEmployee[employeeId] = station;
    });

    return updatedStaff;
  };

  const applySmartStationAssignments = (staff = getStaff()) => {
    let updatedStaff = staff.map((person) => ({ ...person, assignments: { ...(person.assignments || {}) } }));
    const previousStationByEmployee = {};
    const stationUsageByEmployee = {};

    shiftDays.forEach((day) => {
      updatedStaff = assignStationsForGroup(updatedStaff, "fixedMorning", day.key, previousStationByEmployee, stationUsageByEmployee);
      updatedStaff = assignStationsForGroup(updatedStaff, "variableAfternoon", day.key, previousStationByEmployee, stationUsageByEmployee);
      updatedStaff = assignStationsForGroup(updatedStaff, "fixedLateNight", day.key, previousStationByEmployee, stationUsageByEmployee);
    });

    return updatedStaff.map((person) => {
      const activeAssignment = getPersonDayAssignment(person, activeShiftDay);
      const firstWorkingAssignment = shiftDays.map((day) => getPersonDayAssignment(person, day.key)).find(isAssignmentWorking);
      return {
        ...person,
        station: activeAssignment.station || firstWorkingAssignment?.station || person.station || DEFAULT_STATION
      };
    });
  };

  const autoAssignStaffStations = () => {
    const staff = getStaff();
    const hasWorkingEmployees = shiftDays.some((day) => getStaffForDay(staff, day.key).length);
    if (!hasWorkingEmployees) {
      setScheduleImportStatus("There are no employees working this week.", "warning");
      return;
    }

    const assignedStaff = applySmartStationAssignments(staff);

    saveStaff(assignedStaff);
    renderStaff();
    setScheduleImportStatus(
      "Station mix created without changing imported times.",
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
      const originalAssignment = person.originalAssignments?.[activeShiftDay];
      const station = originalAssignment?.station || person.originalStation || currentAssignment.station || DEFAULT_STATION;

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
    localStorage.setItem(PTS_REFERENCE_SCHEDULE_SEED_KEY, PTS_REFERENCE_SCHEDULE_VERSION);
    saveStaff([]);
    renderStaff();
    setScheduleImportStatus("LineOps table cleared.", "success");
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
        const setupLabel = getPresetSetupLabel(preset);
        const details = [
          setupLabel || createdAt,
          `${Array.isArray(preset.staff) ? preset.staff.length : 0} employees`
        ].filter(Boolean);

        return `
          <article class="assignment-preset-card">
            <div>
              <h4>${escapeHtml(preset.name || "Saved assignment")}</h4>
              <p>${escapeHtml(details.join(" · "))}</p>
            </div>
            <div class="assignment-preset-actions">
              <button type="button" class="secondary-btn" data-preview-preset="${escapeHtml(preset.id)}">Preview</button>
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
    const setupDate = assignmentPresetDateInput?.value || formatDateInputValue(new Date());
    const setupWeekStart = formatDateInputValue(getWeekStartDate(setupDate));
    const preset = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      setupDate,
      setupWeekStart,
      createdAt: new Date().toISOString(),
      staff: staff.map((person) => ({ ...person }))
    };

    saveAssignmentPresets([preset, ...presets]);
    if (assignmentPresetNameInput) assignmentPresetNameInput.value = "";
    renderAssignmentPresets();
    const setupLabel = formatSetupWeekLabel(setupWeekStart);
    setScheduleImportStatus(`Saved assignment "${name}"${setupLabel ? ` for ${setupLabel}` : ""}.`, "success");
  };

  const loadAssignmentPreset = (presetId) => {
    const preset = getAssignmentPresets().find((item) => item.id === presetId);
    if (!preset || !Array.isArray(preset.staff)) return;

    saveStaff(preset.staff.map((person) => ({ ...person })));
    renderStaff();
    const setupLabel = getPresetSetupLabel(preset);
    setScheduleImportStatus(`Loaded assignment "${preset.name || "Saved assignment"}"${setupLabel ? ` for ${setupLabel}` : ""}.`, "success");
  };

  const printAssignmentPreset = (presetId) => {
    const preset = getAssignmentPresets().find((item) => item.id === presetId);
    if (!preset || !Array.isArray(preset.staff)) return;

    printAssignmentStaff(preset.staff, preset.name || "Saved assignment", getPresetSetupLabel(preset));
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
    const visibleStations = getVisibleStationsForDay(staff, activeShiftDay);

    const stationSections = visibleStations
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
              <p>BEOFlow LineOps · Bastida Systems · ${getShiftDayLabel(activeShiftDay)}${appliesTo ? ` · ${escapeHtml(appliesTo)}` : ""}</p>
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

  const printAssignmentStaff = (staff = [], title = "Kitchen Station Assignments", appliesTo = "") => {
    renderAssignmentPrintRoot(staff, title, appliesTo);
    setScheduleImportStatus("Opening print dialog. Choose Print or Save as PDF.", "success");
    requestAnimationFrame(() => {
      window.print();
    });
  };

  const printAssignmentSheet = () => {
    const staff = getStaff();
    if (!staff.length) {
      setScheduleImportStatus("Add or import employees before printing the assignment sheet.", "warning");
      return;
    }

    printAssignmentStaff(staff);
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
      if (isRestaurantSelectionClient) {
        selectedRestaurantId = "";
        selectedRestaurantName = "";
        localStorage.removeItem(getClientScopedStorageKey(RESTAURANT_SELECTION_ID_KEY));
        localStorage.removeItem(getClientScopedStorageKey(RESTAURANT_SELECTION_NAME_KEY));
        clearClientDataSnapshot();
      } else if (isBastidaClient) {
        bastidaMode = "";
        localStorage.removeItem(BASTIDA_MODE_KEY);
      } else {
        westgateMode = "";
        localStorage.removeItem(WESTGATE_MODE_KEY);
      }
      hideAllMainSections();
      applyClientModuleVisibility();
      if (isRestaurantSelectionClient) {
        showRestaurantSelectScreen();
        loadRestaurantSelectionOptions({ autoSelectSingle: false });
      } else if (isBastidaClient) {
        showBastidaModeScreen();
      } else {
        showWestgateModeScreen();
      }
    });
  }

  westgateModeLogoutBtn?.addEventListener("click", logout);
  bastidaModeLogoutBtn?.addEventListener("click", logout);
  restaurantSelectLogoutBtn?.addEventListener("click", logout);

  restaurantSelectOptions?.addEventListener("click", async (event) => {
    const card = event.target.closest("[data-restaurant-id]");
    if (!card) return;
    await selectRestaurantWorkspace(card.dataset.restaurantId, card.dataset.restaurantName);
  });

  restaurantSelectAddToggleBtn?.addEventListener("click", () => {
    setRestaurantSelectAddOpen(true);
    setRestaurantSelectStatus("");
  });

  restaurantSelectCancelBtn?.addEventListener("click", () => {
    if (restaurantSelectNameInput) restaurantSelectNameInput.value = "";
    if (restaurantSelectTypeInput) restaurantSelectTypeInput.value = "restaurant";
    if (restaurantSelectLocationInput) restaurantSelectLocationInput.value = "";
    setRestaurantSelectAddOpen(false);
    setRestaurantSelectStatus("");
  });

  restaurantSelectSaveBtn?.addEventListener("click", addRestaurantFromSelection);

  restaurantSelectNameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addRestaurantFromSelection();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (restaurantSelectNameInput) restaurantSelectNameInput.value = "";
      if (restaurantSelectTypeInput) restaurantSelectTypeInput.value = "restaurant";
      if (restaurantSelectLocationInput) restaurantSelectLocationInput.value = "";
      setRestaurantSelectAddOpen(false);
      setRestaurantSelectStatus("");
    }
  });

  restaurantSelectLocationInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addRestaurantFromSelection();
    }
  });

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

  if (navLineOpsUsers && lineOpsUsersSection) {
    navLineOpsUsers.addEventListener("click", (e) => {
      e.preventDefault();
      showModuleByKey("lineOpsUsers");
    });
  }

  if (refreshLineOpsUsersBtn) {
    refreshLineOpsUsersBtn.addEventListener("click", loadLineOpsUsers);
  }

  if (lineOpsUsersTableBody) {
    lineOpsUsersTableBody.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-lineops-user-id]");
      if (!editButton) return;

      const user = lineOpsUsersCache.find((item) => item.id === editButton.dataset.lineopsUserId);
      openLineOpsUserEditor(user);
    });
  }

  lineOpsUserEditorForm?.addEventListener("submit", saveLineOpsUserEdit);
  closeLineOpsUserEditorBtn?.addEventListener("click", closeLineOpsUserEditor);
  cancelLineOpsUserEditorBtn?.addEventListener("click", closeLineOpsUserEditor);
  lineOpsUserEditorModal?.addEventListener("click", (event) => {
    if (event.target === lineOpsUserEditorModal) closeLineOpsUserEditor();
  });

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

  menuRecipesPicker?.addEventListener("click", (event) => {
    const recipeButton = event.target.closest("[data-menu-recipe-id]");
    if (!recipeButton) return;
    toggleMenuRecipeSelection(recipeButton.dataset.menuRecipeId);
  });

  menuRecipesInput?.addEventListener("change", renderMenuRecipePicker);

  selectAllMenuRecipesBtn?.addEventListener("click", () => {
    setSelectedMenuRecipeIds(getRecipes().map((recipe) => recipe.id));
    renderMenuRecipePicker();
  });

  clearMenuRecipesBtn?.addEventListener("click", () => {
    setSelectedMenuRecipeIds([]);
    renderMenuRecipePicker();
  });

  if (addRecipeBtn) {
    addRecipeBtn.addEventListener("click", addRecipe);
  }

  if (recipeResetBtn) {
    recipeResetBtn.addEventListener("click", () => clearRecipeForm({ focusAfterReset: true }));
  }

  if (addRecipeIngredientBtn) {
    addRecipeIngredientBtn.addEventListener("click", addRecipeIngredient);
  }

  [recipeIngredientQtyInput].filter(Boolean).forEach((input) => {
    input.addEventListener("keydown", handleRecipeIngredientEntryKeydown);
  });

  [recipeYieldInput, recipePortionsInput].forEach((input) => {
    input?.addEventListener("input", renderSelectedIngredients);
    input?.addEventListener("change", renderSelectedIngredients);
  });

  recipePhotoInput?.addEventListener("change", () => {
    handleRecipePhotoFile(recipePhotoInput.files?.[0], "recipe");
  });

  removeRecipePhotoBtn?.addEventListener("click", resetRecipePhoto);

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

  subRecipePhotoInput?.addEventListener("change", () => {
    handleRecipePhotoFile(subRecipePhotoInput.files?.[0], "subRecipe");
  });

  removeSubRecipePhotoBtn?.addEventListener("click", resetSubRecipePhoto);

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

  if (addScheduleRowBtn) {
    addScheduleRowBtn.addEventListener("click", () => addScheduleRow());
  }

  if (loadReferenceScheduleBtn) {
    loadReferenceScheduleBtn.addEventListener("click", () => {
      loadPtsReferenceSchedule();
    });
  }

  if (openScheduleEditorBtn) {
    openScheduleEditorBtn.addEventListener("click", openScheduleEditor);
  }

  if (closeScheduleEditorBtn) {
    closeScheduleEditorBtn.addEventListener("click", closeScheduleEditor);
  }

  if (scheduleEditorModal) {
    scheduleEditorModal.addEventListener("click", (e) => {
      if (e.target === scheduleEditorModal) closeScheduleEditor();
    });
  }

  if (scheduleEditorTable) {
    scheduleEditorTable.addEventListener("input", (e) => {
      const nameInput = e.target.closest("[data-schedule-name]");
      if (!nameInput) return;

      updateScheduleName(nameInput.dataset.scheduleName, nameInput.value, { render: false });
    });

    scheduleEditorTable.addEventListener("change", (e) => {
      const nameInput = e.target.closest("[data-schedule-name]");
      if (nameInput) {
        updateScheduleName(nameInput.dataset.scheduleName, nameInput.value);
        return;
      }

      const timeInput = e.target.closest("[data-schedule-time]");
      if (timeInput) {
        updateScheduleDayTime(
          timeInput.dataset.scheduleTime,
          timeInput.dataset.scheduleDay,
          timeInput.dataset.scheduleField,
          timeInput.value
        );
        return;
      }

      const offInput = e.target.closest("[data-schedule-off]");
      if (!offInput) return;

      updateScheduleDayOff(offInput.dataset.scheduleOff, offInput.dataset.scheduleDay, offInput.checked);
    });

    scheduleEditorTable.addEventListener("keydown", (e) => {
      const nameInput = e.target.closest("[data-schedule-name]");
      if (!nameInput || e.key !== "Enter") return;

      e.preventDefault();
      nameInput.blur();
    });

    scheduleEditorTable.addEventListener("click", (e) => {
      const deleteButton = e.target.closest("[data-schedule-delete-row]");
      if (!deleteButton) return;

      deleteStaff(deleteButton.dataset.scheduleDeleteRow);
      setScheduleImportStatus("Schedule row removed.", "success");
    });
  }

  shiftDayTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveShiftDay(tab.dataset.shiftDay);
    });
  });

  if (openWeekViewBtn) {
    openWeekViewBtn.addEventListener("click", openWeeklyScheduleView);
  }

  if (addWeekRowBtn) {
    addWeekRowBtn.addEventListener("click", () => addScheduleRow({ focus: "week" }));
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
    if (e.key === "Escape" && scheduleEditorModal && !scheduleEditorModal.hidden) {
      closeScheduleEditor();
      return;
    }

    if (e.key === "Escape" && shiftWeekModal && !shiftWeekModal.hidden) {
      if (closeWeeklyScheduleEditMode()) return;
      closeWeeklyScheduleView();
    }
  });

  if (shiftWeekSchedule) {
    shiftWeekSchedule.addEventListener("input", (e) => {
      const nameInput = e.target.closest("[data-week-name]");
      if (!nameInput) return;

      updateScheduleName(nameInput.dataset.weekName, nameInput.value, { render: false });
    });

    shiftWeekSchedule.addEventListener("change", (e) => {
      const nameInput = e.target.closest("[data-week-name]");
      if (nameInput) {
        updateScheduleName(nameInput.dataset.weekName, nameInput.value);
        return;
      }

      const timeInput = e.target.closest("[data-week-time]");
      if (timeInput) {
        updateScheduleDayTime(
          timeInput.dataset.weekTime,
          timeInput.dataset.weekDay,
          timeInput.dataset.weekField,
          timeInput.value
        );
        return;
      }

      const stationSelect = e.target.closest("[data-week-station]");
      if (stationSelect) {
        updateScheduleDayStation(
          stationSelect.dataset.weekStation,
          stationSelect.dataset.weekDay,
          stationSelect.value
        );
        return;
      }

      const offInput = e.target.closest("[data-week-off]");
      if (!offInput) return;

      updateScheduleDayOff(offInput.dataset.weekOff, offInput.dataset.weekDay, offInput.checked);
    });

    shiftWeekSchedule.addEventListener("keydown", (e) => {
      const nameInput = e.target.closest("[data-week-name]");
      if (nameInput && e.key === "Enter") {
        e.preventDefault();
        nameInput.blur();
        return;
      }

      const employeeCell = e.target.closest("[data-week-employee-id]");
      if (!employeeCell || !["Enter", " "].includes(e.key) || weeklySchedulePreviewPreset) return;

      e.preventDefault();
      activeWeekEditCell = null;
      activeWeekEditEmployeeId = employeeCell.dataset.weekEmployeeId;
      renderWeeklySchedule();
      requestAnimationFrame(() => {
        shiftWeekSchedule.querySelector(`[data-week-name="${activeWeekEditEmployeeId}"]`)?.focus();
      });
    });

    shiftWeekSchedule.addEventListener("click", (e) => {
      const deleteButton = e.target.closest("[data-week-delete-row]");
      if (deleteButton) {
        activeWeekEditCell = null;
        activeWeekEditEmployeeId = "";
        deleteStaff(deleteButton.dataset.weekDeleteRow);
        setScheduleImportStatus("Schedule row removed.", "success");
        return;
      }

      const dayButton = e.target.closest(".shift-week-day[data-week-day]");
      if (dayButton) {
        closeWeeklyScheduleEditMode();
        setActiveShiftDay(dayButton.dataset.weekDay);
        return;
      }

      const formControl = e.target.closest("input, select, label, button");
      if (formControl && !formControl.classList.contains("shift-week-cell")) return;

      const employeeCell = e.target.closest("[data-week-employee-id]");
      if (employeeCell && !weeklySchedulePreviewPreset) {
        if (String(activeWeekEditEmployeeId) === String(employeeCell.dataset.weekEmployeeId)) {
          closeWeeklyScheduleEditMode();
          return;
        }

        activeWeekEditCell = null;
        activeWeekEditEmployeeId = employeeCell.dataset.weekEmployeeId;
        renderWeeklySchedule();
        requestAnimationFrame(() => {
          shiftWeekSchedule.querySelector(`[data-week-name="${activeWeekEditEmployeeId}"]`)?.focus();
        });
        return;
      }

      const weekCell = e.target.closest("[data-week-cell-day]");
      if (!weekCell) {
        closeWeeklyScheduleEditMode();
        return;
      }

      if (!weeklySchedulePreviewPreset && weekCell.dataset.weekStaffId) {
        const isSameEditCell =
          String(activeWeekEditCell?.staffId || "") === String(weekCell.dataset.weekStaffId)
          && activeWeekEditCell?.dayKey === weekCell.dataset.weekCellDay;

        if (isSameEditCell) {
          closeWeeklyScheduleEditMode();
          return;
        }

        activeWeekEditEmployeeId = "";
        activeWeekEditCell = {
          staffId: weekCell.dataset.weekStaffId,
          dayKey: weekCell.dataset.weekCellDay
        };
        setActiveShiftDay(weekCell.dataset.weekCellDay);
        requestAnimationFrame(() => {
          shiftWeekSchedule.querySelector(`[data-week-time="${activeWeekEditCell.staffId}"][data-week-day="${activeWeekEditCell.dayKey}"]`)?.focus();
        });
        return;
      }

      setActiveShiftDay(weekCell.dataset.weekCellDay);
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

  if (autoAssignWeekBtn) {
    autoAssignWeekBtn.addEventListener("click", autoAssignStaffStations);
  }

  if (openStationsKpi) {
    openStationsKpi.addEventListener("click", showOpenStationsForActiveDay);
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

  if (assignmentPresetDateInput) {
    assignmentPresetDateInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveCurrentAssignmentPreset();
      }
    });
  }

  if (assignmentPresetsList) {
    assignmentPresetsList.addEventListener("click", (e) => {
      const previewButton = e.target.closest("[data-preview-preset]");
      if (previewButton) {
        openAssignmentPresetPreview(previewButton.dataset.previewPreset);
        return;
      }

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
        restaurantId: selectedRestaurantId || "",
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
  } else if (needsRestaurantSelection()) {
    showRestaurantSelectScreen();
    loadRestaurantSelectionOptions({ autoSelectSingle: true });
  } else {
    showApp();
    const initialModule = getDefaultModuleForClient();
    if (initialModule) showModuleByKey(initialModule, { scroll: false });
  }

  const shouldRenderWorkspaceData = !isRestaurantSelectionClient || Boolean(selectedRestaurantId);

  if (shouldRenderWorkspaceData) {
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
    refreshRecipeOptionLists();
    refreshMenuTypeOptions();
    refreshInventoryOptionLists();
    renderPhotoPreview(recipePhotoPreview, removeRecipePhotoBtn, currentRecipePhotoDataUrl);
    renderPhotoPreview(subRecipePhotoPreview, removeSubRecipePhotoBtn, currentSubRecipePhotoDataUrl);
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
    setDefaultAssignmentPresetDate();
    renderStaff();
    renderAssignmentPresets();
    setInterval(renderStaff, 60000);
    renderProduction();
    renderSmartSetup();
    if (!needsClientModeSelection()) openSmartSetupIfIncomplete();
  }
});
