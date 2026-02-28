const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set a mobile viewport
    await page.setViewport({ width: 480, height: 850 });

    try {
        console.log("Navigating to app...");
        await page.goto('http://localhost:3000/');

        // Wait for Splash to clear
        await new Promise(r => setTimeout(r, 2000));

        console.log("Capturing Login...");
        await page.screenshot({ path: 'login.png' });

        console.log("Navigating to Register...");
        // Use evaluate to click element containing Sign Up
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Sign Up'));
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'register.png' });

        console.log("Going back to Login...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Sign In'));
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 1000));

        console.log("Executing login...");
        await page.type('input[type="email"]', 'test@example.com');
        await page.type('input[type="password"]', 'password');
        await page.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]');
            if (btn) btn.click();
        });

        await new Promise(r => setTimeout(r, 2000));
        console.log("Capturing Chats...");
        await page.screenshot({ path: 'chats.png' });

        console.log("Navigating to Lounge Events...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Lounge Events'));
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'events.png' });

        console.log("Navigating to Cafe Menu...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Cafe Menu'));
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'eats.png' });

        console.log("Navigating to Marketplace...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Marketplace'));
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'merchandise.png' });

        console.log("Navigating to Tribal Beats...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Tribal Beats'));
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'music.png' });

        console.log("Opening App Menu...");
        await page.evaluate(() => window.dispatchEvent(new Event('toggle-main-menu')));
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'menu.png' });

        console.log("Opening Settings...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const btn = btns.find(b => b.innerText.includes('Settings'));
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'settings.png' });

        console.log("Closing settings...");
        await page.evaluate(() => {
            // there is an X icon maybe or a close button or 'back'
            const btns = Array.from(document.querySelectorAll('button'));
            // clicking first button might be back. Let's look for arrow-left
            const backBtn = document.querySelector('.lucide-arrow-left, svg');
            if (backBtn && backBtn.parentElement) {
                backBtn.parentElement.click();
            }
        });
        await new Promise(r => setTimeout(r, 1000));

        console.log("Opening a Chat...");
        await page.evaluate(() => {
            // Find a chat title
            const chats = document.querySelectorAll('h3');
            const chat = Array.from(chats).find(h => h.innerText.includes('Urgent'));
            if (chat && chat.closest('button')) {
                chat.closest('button').click();
            } else if (chat && chat.closest('div')) {
                chat.click();
            }
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'chat_detail.png' });

        console.log("Successfully captured all screenshots.");
    } catch (err) {
        console.error("Error capturing screenshots:", err);
    } finally {
        await browser.close();
    }
})();
