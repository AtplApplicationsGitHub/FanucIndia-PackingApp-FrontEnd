import Cookies from "js-cookie";

export function logoutUser() {
  Cookies.remove("token", { path: "/" });
  Cookies.remove("role", { path: "/" });

  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
