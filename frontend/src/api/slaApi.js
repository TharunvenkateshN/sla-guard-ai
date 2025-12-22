import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const predictSlaRisk = async (serviceName, hours = 6) => {
  const response = await axios.post(`${API_BASE_URL}/predict-sla-risk`, {
    service_name: serviceName,
    time_horizon_hours: hours,
  });

  return response.data;
};
