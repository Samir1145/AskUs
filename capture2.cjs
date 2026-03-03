const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 480, height: 850 }
    });
    const page = await browser.newPage();

    async function wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    try {
        console.log("Navigating to app...");
        await page.goto('http://localhost:3001/');

        // Wait for Splash
        await wait(2000);

        console.log("Capturing Login...");
        await page.screenshot({ path: 'screenshots/LoginView.png' });

        console.log("Capturing Register...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Sign Up'));
            if (btn) btn.click();
        });
        await wait(1000);
        await page.screenshot({ path: 'screenshots/RegisterView.png' });

        console.log("Capturing Forgot Password...");
        await page.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span'));
            const span = spans.find(b => b.innerText.includes('Sign In'));
            if (span) span.click();
        });
        await wait(1000);
        await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a, button, span'));
            const t = anchors.find(b => b.innerText.includes('Forgot Password'));
            if (t) t.click();
        });
        await wait(1000);
        await page.screenshot({ path: 'screenshots/ForgotPasswordView.png' });

        // Back to login
        await page.goto('http://localhost:3001/');
        await wait(1500);

        console.log("Executing login...");
        await page.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]');
            if (btn) btn.click();
        });

        await wait(2000);
        console.log("Capturing ChatsView...");
        await page.screenshot({ path: 'screenshots/ChatsView.png' });

        console.log("Opening FranchiseView...");
        await page.evaluate(() => window.dispatchEvent(new Event('navigate-franchise')));
        await wait(1000);
        await page.screenshot({ path: 'screenshots/FranchiseView.png' });

        console.log("Closing FranchiseView...");
        await page.evaluate(() => {
            const backBtn = document.querySelector('.lucide-arrow-left, svg');
            if (backBtn && backBtn.parentElement) {
                backBtn.parentElement.click();
            }
        });
        await wait(1000);

        console.log("Capturing MenusView...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('MENUS'));
            if (btn) btn.click();
        });
        await wait(1000);
        await page.screenshot({ path: 'screenshots/MenusView.png' });

        console.log("Capturing GroupsView...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('GROUPS'));
            if (btn) btn.click();
        });
        await wait(1000);
        await page.screenshot({ path: 'screenshots/GroupsView.png' });

        console.log("Capturing MapView...");
        await page.evaluate(() => {
            // Find map button in groups view (usually floating bottom right)
            const mapBtn = document.querySelector('.lucide-map, svg.lucide-map');
            if (mapBtn && mapBtn.closest('button')) {
                mapBtn.closest('button').click();
            }
        });
        await wait(1000);
        await page.screenshot({ path: 'screenshots/MapView.png' });

        console.log("Closing MapView...");
        await page.evaluate(() => {
            const backBtn = document.querySelector('.lucide-arrow-left, svg');
            if (backBtn && backBtn.parentElement) {
                backBtn.parentElement.click();
            }
        });
        await wait(1000);

        console.log("Capturing EventsView...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('EVENTS'));
            if (btn) btn.click();
        });
        await wait(1000);
        await page.screenshot({ path: 'screenshots/EventsView.png' });

        console.log("Opening Menu...");
        await page.evaluate(() => window.dispatchEvent(new Event('toggle-main-menu')));
        await wait(1000);

        console.log("Capturing WalletView...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Wallet'));
            if (btn) btn.click();
        });
        await wait(1000);
        await page.screenshot({ path: 'screenshots/WalletView.png' });

        console.log("Opening Menu again...");
        await page.evaluate(() => window.dispatchEvent(new Event('toggle-main-menu')));
        await wait(1000);

        console.log("Capturing SettingsView...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Settings'));
            if (btn) btn.click();
        });
        await wait(1000);
        await page.screenshot({ path: 'screenshots/SettingsView.png' });

        // Go back to chats
        await page.evaluate(() => {
            const backBtn = document.querySelector('.lucide-arrow-left, svg');
            if (backBtn && backBtn.parentElement) {
                backBtn.parentElement.click();
            }
        });
        await wait(1000);

        console.log("Capturing ChatDetailView...");
        await page.evaluate(() => {
            const titles = Array.from(document.querySelectorAll('h3, h4'));
            const title = titles.find(t => t.innerText && t.innerText.length > 3);
            if (title && title.closest('button')) {
                title.closest('button').click();
            } else if (title && title.closest('div')) {
                title.click();
            }
        });
        await wait(1500);
        await page.screenshot({ path: 'screenshots/ChatDetailView.png' });

        // Go back
        await page.evaluate(() => {
            const backBtn = document.querySelector('.lucide-arrow-left, svg');
            if (backBtn && backBtn.parentElement) {
                backBtn.parentElement.click();
            }
        });
        await wait(1000);

        console.log("Successfully captured screenshots to /screenshots");

    } catch (err) {
        console.error("Error capturing screenshots:", err);
    } finally {
        await browser.close();
    }
})();
