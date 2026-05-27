// src/utils/api.js

const BASE_URL = "https://ai-notes-app-5bb7.onrender.com";

export const apiFetch = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(BASE_URL + endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    return res;
  } catch (err) {
    console.error("API Fetch Error:", err);
    throw err;
  }
};