import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, } from "@mui/material";
import { Assessment as ReportIcon } from "@mui/icons-material";
import dayjs from "dayjs";
const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "ILS", label: "ILS (₪)" },
];
const ReportView = ({ db }) => {
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [currency, setCurrency] = useState("USD");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const generateReport = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await db.getReport(year, month, currency);
            console.log("🥳🥳🥳🥳", data);
            setReportData(data);
        }
        catch (err) {
            setError("Failed to generate report. Please try again.");
            console.error("Error generating report:", err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (db) {
            generateReport();
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
        <ReportIcon />
        Monthly Report
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

        <Button variant="contained" onClick={generateReport} disabled={loading} sx={{ minWidth: 120 }}>
          {loading ? "Loading..." : "Generate"}
        </Button>
      </Box>

      {error && (<Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>)}

      {loading && (<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>)}

      {reportData && !loading && (<Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {monthNames[reportData.month - 1]} {reportData.year} Report
          </Typography>

          {reportData.costs.length === 0 ? (<Alert severity="info">
              No costs found for {monthNames[month - 1]} {year}
            </Alert>) : (<>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Date</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Description</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Category</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Amount</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.costs.map((cost, index) => (<TableRow key={index} hover>
                        <TableCell>{cost.date.day}</TableCell>
                        <TableCell>{cost.description}</TableCell>
                        <TableCell>{cost.category}</TableCell>
                        <TableCell>
                          {getCurrencySymbol(cost.currency)}
                          {cost.sum.toFixed(2)} {cost.currency}
                        </TableCell>
                      </TableRow>))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    p: 2,
                    borderRadius: 1,
                }}>
                <Typography variant="h6">
                  Total: {getCurrencySymbol(reportData.total.currency)}
                  {reportData.total.total.toFixed(2)}{" "}
                  {reportData.total.currency}
                </Typography>
              </Box>
            </>)}
        </Box>)}
    </Paper>);
};
export default ReportView;
