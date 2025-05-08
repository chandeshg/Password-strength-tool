const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config();

// Add the email breach check endpoint
router.get('/check-email-breach', async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    
    // Get the API key from environment variables
    const apiKey = process.env.HIBP_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ 
            message: 'API key not configured. Please contact the administrator.' 
        });
    }
    
    try {
        const response = await fetch(
            `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
                headers: {
                    'hibp-api-key': apiKey,
                    'User-Agent': 'PasswordStrengthTool'
                }
            }
        );
        
        if (response.status === 404) {
            // No breaches found
            return res.status(200).json({ breaches: [] });
        } else if (response.ok) {
            const breaches = await response.json();
            return res.status(200).json({ breaches });
        } else {
            // Handle other response codes
            return res.status(response.status).json({ 
                message: 'Error checking email. Please try again later.' 
            });
        }
    } catch (error) {
        console.error('HIBP API error:', error);
        return res.status(500).json({ 
            message: 'Service temporarily unavailable. Please try again later.' 
        });
    }
});

// Export the router
module.exports = router;
