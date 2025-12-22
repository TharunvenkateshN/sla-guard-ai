import React from "react";
import { useEffect, useState } from "react";
import { predictSlaRisk } from "../api/slaApi";
import ServiceSelector from "../components/ServiceSelector";
import RiskCard from "../components/RiskCard";
import FactorsList from "../components/FactorsList";

export default function Dashboard() {
  const [service, setService] = useState("payment-service");
  const [data, setData] = useState(null);

  useEffect(() => {
    predictSlaRisk(service).then(setData);
  }, [service]);

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">SLA-Guard AI Dashboard</h1>

      <div className="mb-6">
        <ServiceSelector service={service} setService={setService} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskCard risk={data.sla_risk_probability} />
        <FactorsList factors={data.top_factors} />
      </div>

      <p className="mt-6 text-sm text-gray-600">
        Time horizon: {data.time_horizon}
      </p>
    </div>
  );
}
