import React from "react";
import StatusCards from "../admindashborad/Statuscards";
import OrderImportsCard from "../admindashborad/OrderImports";

export default function AdminDashboard() {
  return (
    <div>
      <StatusCards />
      <OrderImportsCard />
    </div>
  );
}
