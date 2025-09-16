import React, { useState } from 'react';
import { Paper, TextField, Button, MenuItem, Typography, Box, Alert, Snackbar } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'ILS', label: 'ILS (₪)' }
];
const categories = [
    'Food',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
];
const AddCostForm = ({ onCostAdded, db }) => {
    const [formData, setFormData] = useState({
        sum: '',
        currency: 'USD',
        category: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.sum || !formData.category || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }
        const sum = parseFloat(formData.sum);
        if (isNaN(sum) || sum <= 0) {
            setError('Please enter a valid positive amount');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await db.addCost({
                sum,
                currency: formData.currency,
                category: formData.category,
                description: formData.description
            });
            setFormData({
                sum: '',
                currency: 'USD',
                category: '',
                description: ''
            });
            setShowSuccess(true);
            onCostAdded();
        }
        catch (err) {
            setError('Failed to add cost item. Please try again.');
            console.error('Error adding cost:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };
    return (<Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AddIcon />
        Add New Cost
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <TextField label="Amount" type="number" value={formData.sum} onChange={handleChange('sum')} required inputProps={{ min: 0, step: 0.01 }} fullWidth/>
          
          <TextField select label="Currency" value={formData.currency} onChange={handleChange('currency')} required fullWidth>
            {currencies.map((option) => (<MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>))}
          </TextField>
          
          <TextField select label="Category" value={formData.category} onChange={handleChange('category')} required fullWidth>
            {categories.map((category) => (<MenuItem key={category} value={category}>
                {category}
              </MenuItem>))}
          </TextField>
          
          <TextField label="Description" value={formData.description} onChange={handleChange('description')} required fullWidth multiline rows={2} sx={{ gridColumn: { md: 'span 2' } }}/>
        </Box>
        
        {error && (<Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>)}
        
        <Button type="submit" variant="contained" disabled={loading} fullWidth sx={{ mt: 3 }}>
          {loading ? 'Adding...' : 'Add Cost'}
        </Button>
      </Box>
      
      <Snackbar open={showSuccess} autoHideDuration={3000} onClose={() => setShowSuccess(false)}>
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Cost added successfully!
        </Alert>
      </Snackbar>
    </Paper>);
};
export default AddCostForm;
