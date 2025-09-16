import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Tabs, Tab, Paper, Alert, CircularProgress, AppBar, Toolbar, } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AccountBalance as BalanceIcon, Add as AddIcon, Assessment as ReportIcon, PieChart as PieIcon, BarChart as BarIcon, Settings as SettingsIcon, } from "@mui/icons-material";
import { openCostsDB } from "./lib/idb.js";
import AddCostForm from "./components/AddCostForm.jsx";
import ReportView from "./components/ReportView.jsx";
import PieChartView from "./components/PieChartView.jsx";
import BarChartView from "./components/BarChartView.jsx";
import Settings from "./components/Settings.jsx";
// Create custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
            light: "#42a5f5",
            dark: "#1565c0",
        },
        secondary: {
            main: "#dc004e",
        },
        success: {
            main: "#2e7d32",
        },
        background: {
            default: "#f5f5f5",
            paper: "#ffffff",
        },
    },
    typography: {
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 500,
                },
            },
        },
    },
});
function TabPanel({ children, value, index }) {
    return (<div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>);
}
function App() {
    const [db, setDb] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    useEffect(() => {
        const initializeDB = async () => {
            try {
                const database = await openCostsDB("costsdb", 1);
                setDb(database);
            }
            catch (err) {
                setError("Failed to initialize database. Please refresh the page.");
                console.error("Database initialization error:", err);
            }
            finally {
                setLoading(false);
            }
        };
        initializeDB();
    }, []);
    const handleTabChange = (_event, newValue) => {
        setActiveTab(newValue);
    };
    const handleCostAdded = () => {
        // Trigger refresh of components that depend on cost data
        setRefreshKey((prev) => prev + 1);
    };
    if (loading) {
        return (<ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
            }}>
          <CircularProgress size={60}/>
        </Box>
      </ThemeProvider>);
    }
    if (error) {
        return (<ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Container>
      </ThemeProvider>);
    }
    return (<ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="static" elevation={1}>
        <Toolbar>
          <BalanceIcon sx={{ mr: 2 }}/>
          <Typography variant="h6" component="div">
            Cost Manager
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <Paper elevation={1} sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tab icon={<AddIcon />} label="Add Cost"/>
            <Tab icon={<ReportIcon />} label="Monthly Report"/>
            <Tab icon={<PieIcon />} label="Category Chart"/>
            <Tab icon={<BarIcon />} label="Yearly Chart"/>
            <Tab icon={<SettingsIcon />} label="Settings"/>
          </Tabs>
        </Paper>

        <TabPanel value={activeTab} index={0}>
          <AddCostForm db={db} onCostAdded={handleCostAdded}/>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ReportView key={`report-${refreshKey}`} db={db}/>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <PieChartView key={`pie-${refreshKey}`} db={db}/>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <BarChartView key={`bar-${refreshKey}`} db={db}/>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Settings db={db}/>
        </TabPanel>
      </Container>
    </ThemeProvider>);
}
export default App;
