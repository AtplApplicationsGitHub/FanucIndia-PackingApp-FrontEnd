import Cookies from "js-cookie";

export function logoutUser() {
  Cookies.remove("token");
  localStorage.removeItem("token");
}