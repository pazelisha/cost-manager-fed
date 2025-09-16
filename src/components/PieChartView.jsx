import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, TextField, MenuItem, Button, Alert, CircularProgress, } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { PieChart as PieChartIcon } from "@mui/icons-material";
import dayjs from "dayjs";
const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "ILS", label: "ILS (₪)" },
];
const PieChartView = ({ db }) => {
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [currency, setCurrency] = useState("USD");
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const generateChart = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await db.getCategoryData(year, month, currency);
            setChartData(data);
        }
        catch (err) {
            setError("Failed to generate chart. Please try again.");
            console.error("Error generating chart:", err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (db) {
            generateChart();
        }
    }, [db]);
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const getCurrencySymbol = (curr) => {
        switch (curr) {
            case "USD":
                return "$";
            case "EUR":
                return "€";
            case "GBP":
                return "£";
            case "ILS":
                return "₪";
            default:
                return curr;
        }
    };
    return (<Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PieChartIcon />
        Category Breakdown - Pie Chart
      </Typography>

      <Box sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
            alignItems: "center",
        }}>
        <TextField label="Year" type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} inputProps={{ min: 2020, max: 2030 }} sx={{ minWidth: 120 }}/>

        <TextField select label="Month" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} sx={{ minWidth: 120 }}>
          {monthNames.map((name, index) => (<MenuItem key={name} value={index + 1}>
              {name}
            </MenuItem>))}
        </TextField>

        <TextField select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} sx={{ minWidth: 120 }}>
          {currencies.map((option) => (<MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>))}
        </TextField>

        <Button variant="contained" onClick={generateChart} disabled={loading} sx={{ minWidth: 120 }}>
          {loading ? "Loading..." : "Generate"}
        </Button>
      </Box>

      {error && (<Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>)}

      {loading && (<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>)}

      {!loading && (<Box sx={{ height: 400, width: "100%" }}>
          {chartData.length === 0 ? (<Alert severity="info">
              No data found for {monthNames[month - 1]} {year}
            </Alert>) : (<>
              <Typography variant="subtitle1" sx={{ mb: 2, textAlign: "center" }}>
                {monthNames[month - 1]} {year} - Costs by Category ({currency})
              </Typography>

              <PieChart series={[
                    {
                        data: chartData,
                        highlightScope: { fade: "global", highlight: "item" },
                        faded: {
                            innerRadius: 30,
                            additionalRadius: -30,
                            color: "gray",
                        },
                        valueFormatter: (item) => `${getCurrencySymbol(currency)}${item.value.toFixed(2)}`,
                    },
                ]} height={320} slotProps={{
                    legend: {
                        direction: "horizontal",
                        position: { vertical: "middle", horizontal: "center" },
                    },
                }}/>
            </>)}
        </Box>)}
    </Paper>);
};
export default PieChartView;
