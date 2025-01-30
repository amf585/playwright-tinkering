import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import test from "playwright/test";
import { BASE_URL, SEARCH_TERMS } from '../utils/constants';

// Global variables
let connection;
let searchInput;

test.beforeAll(async () => {
    // Initialize DB connection
    dotenv.config(); 

    const user = process.env.DB_USER;
    const pw = process.env.DB_PW;
    const db = process.env.DB;
    const host = process.env.HOST;

    connection = await mysql.createConnection({
        host: host,
        user: user,   
        password: pw,
        database: db 
    });
});

// Scrape setup
test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    searchInput = page.getByPlaceholder('Search for anything');
});

// Scrape and store top 3 results for each search term
test.describe('Scrape top 3 listing data from each ebay search term', () => {
    SEARCH_TERMS.forEach ((term) => {
        test(`Store top 3 items from search query: ${term}`, async ({ page }) => {
            
            // Step 1: execute search query
            const searchInput = page.getByPlaceholder('Search for anything');
            await searchInput.fill(term);
            await searchInput.press('Enter');
            await page.waitForSelector('ul[class*="results"]', { state: 'visible' });
    
            // Step 2: locate html content for top 3 results
            const htmlContent = await page.$$eval('ul[class*="results"] li[id^="item"]', elements => {      
                return elements.slice(0,3).map(el => el.outerHTML);
            });

            // Step 3: Insert the scraped data via prepared statement
            const query = 'INSERT INTO pokemon_cards (html) VALUES (?)';
            try {
                const [results] = await connection.execute(query, [htmlContent.toString().substring(0, 100)]);
                console.log('Data saved successfully:', results);
            } catch (err) {
                console.error('Error saving data:', err);
            }
        });
    })
});

test.afterAll(async () => {
    await connection.end(); // Close Db connection
});
