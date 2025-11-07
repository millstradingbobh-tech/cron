export const customRates = (currency: string) => {
  const rates = [
    {
      service_name: "Delivered Today - Between 12pm–5pm",
      service_code: "On Demand - Afternoon", 
      total_price: "495",                // in cents ($5.00)
      currency: currency || "USD",
      min_delivery_date: new Date().toISOString(),
      max_delivery_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    },
    {
      service_name: "On Demand - Tonight",
      service_code: "Delivered Today - Between 6pm–9pm",    // 👈 another code
      total_price: "495",               // $15.00
      currency: currency || "USD",
      min_delivery_date: new Date().toISOString(),
      max_delivery_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    },
  ];

  return rates;
}