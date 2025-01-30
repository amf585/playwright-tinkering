import { test, expect } from '@playwright/test';
import { BASE_URL, URLS_TO_CHECK } from '../utils/constants';

test.describe('check all links on a page', () => {

	for (const url of URLS_TO_CHECK) {

		const brokenLinks: string[] = [];

		test(`Test all links on page for ${url}`, async ({context, page}) => {
			await page.goto(url, { waitUntil: 'domcontentloaded' });

			// Grab all links on the page
			const links = await page.$$eval('a[href]', (elements) =>
				elements.map((el) => el.getAttribute('href'))
			);

			// Filter out any invalid links (only accept absolute, relative, anchor)
			const filteredLinks = links.filter((link) => { 
				return link?.startsWith('http') || link?.startsWith('#') || link?.startsWith('/')
			});

			for (const href of filteredLinks) {
				// Handle absolute vs. relative links
				const linkUrl = href?.startsWith('http') ? href : `${BASE_URL}${href}`;

				try {
					if (linkUrl) {
						const response = await context.request.get(linkUrl);
						const status = response?.status();
		
						// Status 200 OK & 301/302 redirects are acceptable
						if (!status || status >= 400) {
								brokenLinks.push(linkUrl);
						}
					}
				} catch (error) {
					console.error(`Error checking link: ${linkUrl}`, error);
				}
			};
		
			if (brokenLinks.length > 0) {
				console.log('Broken Links: ', brokenLinks);
			}

			expect(brokenLinks).toHaveLength(0);

			await page.close();
		});
	};
});