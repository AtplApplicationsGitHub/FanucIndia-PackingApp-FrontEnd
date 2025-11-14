import React from "react";
import StatusCards from "../admindashborad/Statuscards";
import OrderImportsCard from "../admindashborad/OrderImports";
import DispatchSummary from "../admindashborad/DispatchSummary";

export default function AdminDashboard() {
  return (
    <>
      <StatusCards />
      <OrderImportsCard />
      {/* <DispatchSummary /> */}
    </>
  );
}
