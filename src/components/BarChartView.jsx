import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, TextField, MenuItem, Button, Alert, CircularProgress, } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { BarChart as BarChartIcon } from "@mui/icons-material";
import dayjs from "dayjs";

const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "ILS", label: "ILS (₪)" },
];

const BarChartView = ({ db }) => {
    const [year, setYear] = useState(dayjs().year());
    const [currency, setCurrency] = useState("USD");
    const [chartCurrency, setChartCurrency] = useState("USD");
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const generateChart = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await db.getYearlyData(year, currency);
            setChartData(data);
            setChartCurrency(currency);
        } catch (err) {
            setError("Failed to generate chart. Please try again.");
            console.error("Error generating chart:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (db) {
            generateChart();
        }
    }, [db]);

    const getCurrencySymbol = (curr) => {
        switch (curr) {
            case "USD": return "$";
            case "EUR": return "€";
            case "GBP": return "£";
            case "ILS": return "₪";
            default: return curr;
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BarChartIcon />
                Yearly Overview - Bar Chart
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center", }}>
                <TextField label="Year" type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} inputProps={{ min: 2020, max: 2030 }} sx={{ minWidth: 120 }} />

                <TextField select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} sx={{ minWidth: 120 }}>
                    {currencies.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <Button variant="contained" onClick={generateChart} disabled={loading} sx={{ minWidth: 120 }}>
                    {loading ? "Loading..." : "Generate"}
                </Button>
            </Box>

            {error && (<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>)}
            
            {loading && (<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}><CircularProgress /></Box>)}

            {!loading && (
                <Box sx={{ height: 450, width: "100%" }}>
                    {chartData.length === 0 || chartData.every((item) => item.value === 0) ? (
                        <Alert severity="info">No data found for {year}</Alert>
                    ) : (
                        <>
                            <Typography variant="subtitle1" sx={{ mb: 2, textAlign: "center" }}>
                                {year} - Monthly Costs ({chartCurrency})
                            </Typography>

                            <BarChart
                                xAxis={[{ scaleType: "band", dataKey: "month", }]}
                                series={[
                                    {
                                        dataKey: "value",
                                        label: `Costs (${chartCurrency})`,
                                        valueFormatter: (value) => {
                                            if (value) {
                                                return `${getCurrencySymbol(chartCurrency)}${value.toFixed(2)}`;
                                            } else {
                                                return `0`;
                                            }
                                        },
                                        color: "#1976d2",
                                    },
                                ]}
                                dataset={chartData}
                                height={350}
                                margin={{ top: 50, right: 30, bottom: 50, left: 80 }}
                            />
                        </>
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default BarChartView;
