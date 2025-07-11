// frontend/src/data/mockCustomerData.js
// Dates are in YYYY-MM-DD HH:MM:SS format for easy parsing
const mockCustomerData = [
    // User 1 (frequent buyer of P1000 Milk, P1001 Bread, P1002 Eggs)
    // Adjusted dates to be relative to today (July 11, 2025) for 'due today' logic to work
    // Assuming today is July 11, 2025
    // P1000 Milk: bought ~every 2-3 days
    { user_id: "U001", event_time: "2025-07-02 10:00:00", event_type: "purchase", product_id: "P1000" },
    { user_id: "U001", event_time: "2025-07-04 11:30:00", event_type: "purchase", product_id: "P1000" },
    { user_id: "U001", event_time: "2025-07-06 10:30:00", event_type: "purchase", product_id: "P1000" },
    { user_id: "U001", event_time: "2025-07-09 09:30:00", event_type: "purchase", product_id: "P1000" }, // Last bought 2 days ago

    // P1001 Bread: bought ~every 3-4 days
    { user_id: "U001", event_time: "2025-07-01 10:00:00", event_type: "purchase", product_id: "P1001" },
    { user_id: "U001", event_time: "2025-07-04 09:00:00", event_type: "purchase", product_id: "P1001" },
    { user_id: "U001", event_time: "2025-07-08 10:00:00", event_type: "purchase", product_id: "P1001" }, // Last bought 3 days ago

    // P1002 Eggs: bought ~every 4-5 days
    { user_id: "U001", event_time: "2025-07-01 10:00:00", event_type: "purchase", product_id: "P1002" },
    { user_id: "U001", event_time: "2025-07-05 10:15:00", event_type: "purchase", product_id: "P1002" },
    { user_id: "U001", event_time: "2025-07-10 10:45:00", event_type: "purchase", product_id: "P1002" }, // Last bought 1 day ago

    // P1003 Coffee: less frequent (e.g., every 7-10 days)
    { user_id: "U001", event_time: "2025-07-01 12:00:00", event_type: "purchase", product_id: "P1003" },
    { user_id: "U001", event_time: "2025-07-09 12:00:00", event_type: "purchase", product_id: "P1003" }, // Last bought 2 days ago


    // User 2 (frequent buyer of P1006 Yogurt, P1007 Apple Juice)
    { user_id: "U002", event_time: "2025-07-03 15:00:00", event_type: "purchase", product_id: "P1006" }, // Yogurt ~every 2-3 days
    { user_id: "U002", event_time: "2025-07-05 16:00:00", event_type: "purchase", product_id: "P1006" },
    { user_id: "U002", event_time: "2025-07-08 15:00:00", event_type: "purchase", product_id: "P1006" }, // Last bought 3 days ago

    { user_id: "U002", event_time: "2025-07-04 15:00:00", event_type: "purchase", product_id: "P1007" }, // Apple Juice ~every 3-4 days
    { user_id: "U002", event_time: "2025-07-07 16:30:00", event_type: "purchase", product_id: "P1007" },
    { user_id: "U002", event_time: "2025-07-10 15:30:00", event_type: "purchase", product_id: "P1007" }, // Last bought 1 day ago

    { user_id: "U002", event_time: "2025-07-02 15:00:00", event_type: "purchase", product_id: "P1010" }, // Chips (less frequent)
    { user_id: "U002", event_time: "2025-07-09 15:00:00", event_type: "purchase", product_id: "P1010" }, // Last bought 2 days ago


    // User 3 (frequent buyer of P1010 Chips, P1011 Granola Bars)
    { user_id: "U003", event_time: "2025-07-02 14:00:00", event_type: "purchase", product_id: "P1010" }, // Chips ~every 3-4 days
    { user_id: "U003", event_time: "2025-07-05 14:30:00", event_type: "purchase", product_id: "P1010" },
    { user_id: "U003", event_time: "2025-07-09 14:30:00", event_type: "purchase", product_id: "P1010" }, // Last bought 2 days ago

    { user_id: "U003", event_time: "2025-07-03 14:00:00", event_type: "purchase", product_id: "P1011" }, // Granola ~every 2-3 days
    { user_id: "U003", event_time: "2025-07-05 14:00:00", event_type: "purchase", product_id: "P1011" },
    { user_id: "U003", event_time: "2025-07-08 14:00:00", event_type: "purchase", product_id: "P1011" }, // Last bought 3 days ago

    { user_id: "U003", event_time: "2025-07-10 14:00:00", event_type: "purchase", product_id: "P1012" }, // Dish Soap (less frequent)
];

export default mockCustomerData;