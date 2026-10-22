import api from "../api/api.js";

export async function login({ email, password }) {
  const response = await api.post("/auth/login", { email, password });
  const accessToken = response.data?.accessToken;

  if (!accessToken) {
    throw new Error("The server did not return an access token.");
  }

  return accessToken;
}

export async function register({ username, email, password, avatar }) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("avatar", avatar);

  const response = await api.post("/auth/register", formData);
  return response.data;
}
