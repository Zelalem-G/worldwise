import {
  useEffect,
  useContext,
  useReducer,
  useCallback,
  createContext,
} from "react";

const BASE_URL = "http://localhost:9000";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  cityMap: new Map(),
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true, error: "" };

    case "cities/loaded": {
      const cityMap = new Map();
      action.payload.forEach((city) => cityMap.set(city.id, city));
      return { ...state, isLoading: false, cities: action.payload, cityMap };
    }

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "city/created": {
      const newMap = new Map(state.cityMap);
      newMap.set(action.payload.id, action.payload);
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        cityMap: newMap,
        currentCity: action.payload,
      };
    }

    case "city/deleted": {
      const newMap = new Map(state.cityMap);
      newMap.delete(action.payload);
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        cityMap: newMap,
        currentCity: {},
      };
    }

    case "rejected":
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function CitiesProvider({ children }) {
  const [{ cities, cityMap, isLoading, currentCity, error }, dispatch] =
    useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities`);
        if (!res.ok) throw new Error("Failed to fetch cities");

        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch (err) {
        dispatch({
          type: "rejected",
          payload: err.message || "Error loading cities",
        });
      }
    }

    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (!id) return;
      if (cityMap.has(Number(id))) {
        dispatch({ type: "city/loaded", payload: cityMap.get(Number(id)) });
        return;
      }

      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        if (!res.ok) throw new Error("Failed to fetch city");

        const data = await res.json();
        dispatch({ type: "city/loaded", payload: data });
      } catch (err) {
        dispatch({
          type: "rejected",
          payload: err.message || "Error loading city",
        });
      }
    },
    [cityMap]
  );

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to create city");

      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: err.message || "Error creating city",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete city");

      dispatch({ type: "city/deleted", payload: id });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: err.message || "Error deleting city",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        cityMap,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("useCities must be used within a CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
