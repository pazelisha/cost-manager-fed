import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, TextField, Button, Alert, Snackbar } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
const Settings = ({ db }) => {
    const [exchangeUrl, setExchangeUrl] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        if (db) {
            setExchangeUrl(db.getExchangeUrl());
        }
    }, [db]);
    const handleSave = () => {
        if (!exchangeUrl.trim()) {
            setError('Please enter a valid URL');
            return;
        }
        try {
            new URL(exchangeUrl); // Validate URL format
            db.setExchangeUrl(exchangeUrl);
            setShowSuccess(true);
            setError('');
        }
        catch {
            setError('Please enter a valid URL');
        }
    };
    const handleReset = () => {
        const defaultUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
        setExchangeUrl(defaultUrl);
        db.setExchangeUrl(defaultUrl);
        setShowSuccess(true);
        setError('');
    };
    return (<Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        Settings
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Exchange Rate API Configuration
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure the URL for fetching currency exchange rates. The API should return a JSON response 
          with the format: {`{"USD":1, "GBP":1.27, "EUR":0.85, "ILS":3.65}`}
        </Typography>

        <TextField label="Exchange Rate API URL" value={exchangeUrl} onChange={(e) => setExchangeUrl(e.target.value)} fullWidth sx={{ mb: 2 }} placeholder="https://api.example.com/exchange-rates" helperText="Must include Access-Control-Allow-Origin: * header"/>

        {error && (<Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>)}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleSave}>
            Save Settings
          </Button>
          
          <Button variant="outlined" onClick={handleReset}>
            Reset to Default
          </Button>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Default API Endpoint
          </Typography>
          <Typography variant="body2" color="text.secondary">
            https://api.exchangerate-api.com/v4/latest/USD
          </Typography>
        </Box>
      </Box>

      <Snackbar open={showSuccess} autoHideDuration={3000} onClose={() => setShowSuccess(false)}>
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Paper>);
};
export default Settings;
