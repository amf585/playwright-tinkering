# playwright-experiments
A couple experiments from when I was first learning Playwright

* `tests/ebay-scrape-mysql.spec.ts` - Scrapes ebay search results for provided queries and stores top 3 results in a MySQL Db
    - NOTE Requires MySQL Db table "pokemon_cards" with field "html" running, and .env file with Db credentials

* `tests/test-page-links.spec.ts` - Tests all links (absolute, relative, anchor) on a set of pages to ensure functionality
