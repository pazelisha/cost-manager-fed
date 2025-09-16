/**
 * IndexedDB wrapper library for cost management
 * Provides Promise-based API for cost data operations
 */
class CostsDB {
    constructor(db) {
        this.db = db;
    }
    /**
     * Add a new cost item to the database
     * @param {Object} cost - Cost object with sum, currency, category, description
     * @returns {Promise<Object>} Added cost item with date
     */
    async addCost(cost) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["costs"], "readwrite");
            const store = transaction.objectStore("costs");
            const costItem = {
                ...cost,
                date: new Date(),
                id: Date.now() + Math.random(), // Simple ID generation
            };
            const request = store.add(costItem);
            request.onsuccess = () => {
                resolve(costItem);
            };
            request.onerror = () => {
                reject(new Error("Failed to add cost item"));
            };
        });
    }
    /**
     * Get detailed report for specific month and year
     * @param {number} year - Year for the report
     * @param {number} month - Month for the report (1-12)
     * @param {string} currency - Target currency for conversion
     * @returns {Promise<Object>} Report with costs and total
     */
    async getReport(year, month, currency) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["costs"], "readonly");
            const store = transaction.objectStore("costs");
            const request = store.getAll();
            request.onsuccess = async () => {
                const allCosts = request.result;
                // Filter costs for the specific month and year
                const monthCosts = allCosts.filter((cost) => {
                    const costDate = new Date(cost.date);
                    return (costDate.getFullYear() === year && costDate.getMonth() + 1 === month);
                });
                // Convert costs to target currency
                let convertedCosts = [];
                let total = 0;
                try {
                    const exchangeRates = await this.getExchangeRates();
                    for (const cost of monthCosts) {
                        const convertedSum = this.convertCurrency(cost.sum, cost.currency, currency, exchangeRates);
                        convertedCosts.push({
                            sum: cost.sum,
                            currency: cost.currency,
                            category: cost.category,
                            description: cost.description,
                            date: { day: new Date(cost.date).getDate() },
                        });
                        total += convertedSum;
                    }
                    resolve({
                        year,
                        month,
                        costs: convertedCosts,
                        total: { currency, total: Math.round(total * 100) / 100 },
                    });
                }
                catch (error) {
                    reject(error);
                }
            };
            request.onerror = () => {
                reject(new Error("Failed to get report"));
            };
        });
    }
    /**
     * Get costs for pie chart (by category for specific month/year)
     * @param {number} year - Year for the chart
     * @param {number} month - Month for the chart
     * @param {string} currency - Target currency
     * @returns {Promise<Array>} Array of category totals
     */
    async getCategoryData(year, month, currency) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["costs"], "readonly");
            const store = transaction.objectStore("costs");
            const request = store.getAll();
            request.onsuccess = async () => {
                const allCosts = request.result;
                // Filter costs for the specific month and year
                const monthCosts = allCosts.filter((cost) => {
                    const costDate = new Date(cost.date);
                    return (costDate.getFullYear() === year && costDate.getMonth() + 1 === month);
                });
                try {
                    const exchangeRates = await this.getExchangeRates();
                    const categoryTotals = {};
                    for (const cost of monthCosts) {
                        const convertedSum = this.convertCurrency(cost.sum, cost.currency, currency, exchangeRates);
                        if (!categoryTotals[cost.category]) {
                            categoryTotals[cost.category] = 0;
                        }
                        categoryTotals[cost.category] += convertedSum;
                    }
                    const chartData = Object.entries(categoryTotals).map(([category, total]) => ({
                        id: category,
                        value: Math.round(total * 100) / 100,
                        label: category,
                    }));
                    resolve(chartData);
                }
                catch (error) {
                    reject(error);
                }
            };
            request.onerror = () => {
                reject(new Error("Failed to get category data"));
            };
        });
    }
    /**
     * Get costs for bar chart (by month for specific year)
     * @param {number} year - Year for the chart
     * @param {string} currency - Target currency
     * @returns {Promise<Array>} Array of monthly totals
     */
    async getYearlyData(year, currency) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(["costs"], "readonly");
            const store = transaction.objectStore("costs");
            const request = store.getAll();
            request.onsuccess = async () => {
                const allCosts = request.result;
                // Filter costs for the specific year
                const yearCosts = allCosts.filter((cost) => {
                    const costDate = new Date(cost.date);
                    return costDate.getFullYear() === year;
                });
                try {
                    const exchangeRates = await this.getExchangeRates();
                    const monthlyTotals = Array(12).fill(0);
                    const monthNames = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    for (const cost of yearCosts) {
                        const costDate = new Date(cost.date);
                        const monthIndex = costDate.getMonth();
                        const convertedSum = this.convertCurrency(cost.sum, cost.currency, currency, exchangeRates);
                        monthlyTotals[monthIndex] += convertedSum;
                    }
                    const chartData = monthlyTotals.map((total, index) => ({
                        month: monthNames[index],
                        value: Math.round(total * 100) / 100,
                    }));
                    resolve(chartData);
                }
                catch (error) {
                    reject(error);
                }
            };
            request.onerror = () => {
                reject(new Error("Failed to get yearly data"));
            };
        });
    }
    /**
     * Get exchange rates from configured URL
     * @returns {Promise<Object>} Exchange rates object
     */
    async getExchangeRates() {
        const exchangeUrl = this.getExchangeUrl();
        try {
            const response = await fetch(exchangeUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch exchange rates");
            }
            const data = await response.json();
            return data.rates;
        }
        catch (error) {
            // Fallback to default rates if fetch fails
            console.warn("Using fallback exchange rates");
            return { USD: 1, GBP: 1.27, EURO: 0.85, ILS: 3.65 };
        }
    }
    /**
     * Convert currency using exchange rates
     * @param {number} amount - Amount to convert
     * @param {string} fromCurrency - Source currency
     * @param {string} toCurrency - Target currency
     * @param {Object} rates - Exchange rates object
     * @returns {number} Converted amount
     */
    convertCurrency(amount, fromCurrency, toCurrency, rates) {
        if (fromCurrency === toCurrency) {
            return amount;
        }
        // Convert to USD first, then to target currency
        const amountInUSD = amount / (rates[fromCurrency] || 1);
        const convertedAmount = amountInUSD * (rates[toCurrency] || 1);
        return convertedAmount;
    }
    /**
     * Get exchange URL from localStorage or use default
     * @returns {string} Exchange URL
     */
    getExchangeUrl() {
        return (localStorage.getItem("exchangeUrl") ||
            "https://api.exchangerate-api.com/v4/latest/USD");
    }
    /**
     * Set exchange URL in localStorage
     * @param {string} url - Exchange URL
     */
    setExchangeUrl(url) {
        localStorage.setItem("exchangeUrl", url);
    }
}
/**
 * Open costs database
 * @param {string} databaseName - Name of the database
 * @param {number} databaseVersion - Version of the database
 * @returns {Promise<CostsDB>} Database instance
 */
function openCostsDB(databaseName, databaseVersion) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("costs")) {
                const store = db.createObjectStore("costs", { keyPath: "id" });
                store.createIndex("date", "date");
                store.createIndex("category", "category");
                store.createIndex("currency", "currency");
            }
        };
        request.onsuccess = () => {
            const db = request.result;
            resolve(new CostsDB(db));
        };
        request.onerror = () => {
            reject(new Error("Failed to open database"));
        };
    });
}
// Export for React module use
export { openCostsDB };
// Also assign to global object for vanilla JS compatibility
if (typeof window !== "undefined") {
    window.idb = {
        openCostsDB,
    };
}
