import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class ScreenshotService {
  constructor() {
    this.browserCache = new Map();
    this.supportedFormats = ['png', 'jpeg', 'webp'];
    this.supportedBrowsers = ['chromium', 'firefox', 'webkit'];
  }

  async getBrowser(browserName = 'chromium') {
    if (!this.browserCache.has(browserName)) {
      let browser;
      switch (browserName) {
        case 'firefox':
          browser = await firefox.launch({ headless: true });
          break;
        case 'webkit':
          browser = await webkit.launch({ headless: true });
          break;
        default:
          browser = await chromium.launch({ headless: true });
      }
      this.browserCache.set(browserName, browser);
    }
    return this.browserCache.get(browserName);
  }

  async takeScreenshot(options) {
    const {
      url,
      format = 'png',
      quality = 80,
      width = 1920,
      height = 1080,
      fullPage = false,
      waitFor = 0,
      selector = null,
      device = null,
      browser: browserType = 'chromium',
      scrollToBottom = false,
      hideElements = [],
      timeout = 30000
    } = options;

    const browser = await this.getBrowser(browserType);
    const context = await browser.newContext({
      viewport: device ? undefined : { width: parseInt(width), height: parseInt(height) },
      ...(device && this.getDeviceConfig(device))
    });

    const page = await context.newPage();
    
    try {
      // Set timeout
      page.setDefaultTimeout(timeout);

      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait if specified
      if (waitFor > 0) {
        await page.waitForTimeout(waitFor);
      }

      // Hide elements if specified
      if (hideElements.length > 0) {
        for (const selector of hideElements) {
          await page.addStyleTag({
            content: `${selector} { visibility: hidden !important; }`
          });
        }
      }

      // Scroll to bottom if requested
      if (scrollToBottom) {
        await this.autoScroll(page);
      }

      // Generate filename
      const filename = `screenshot_${uuidv4()}.${format}`;
      const filePath = path.join(process.cwd(), 'uploads', filename);

      // Take screenshot
      const screenshotOptions = {
        path: filePath,
        type: format,
        fullPage,
        ...(format === 'jpeg' && { quality: parseInt(quality) })
      };

      let screenshot;
      if (selector) {
        const element = await page.locator(selector);
        screenshot = await element.screenshot(screenshotOptions);
      } else {
        screenshot = await page.screenshot(screenshotOptions);
      }

      // Get file size
      const stats = await fs.stat(filePath);

      return {
        filename,
        filePath: `/uploads/${filename}`,
        size: stats.size,
        format,
        dimensions: { width, height },
        fullPage,
        selector: selector || null
      };

    } finally {
      await context.close();
    }
  }

  async generatePDF(options) {
    const {
      url,
      format = 'A4',
      landscape = false,
      printBackground = true,
      margin = { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
      waitFor = 0,
      timeout = 30000,
      scale = 1
    } = options;

    const browser = await this.getBrowser('chromium'); // PDFs only work with Chromium
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      page.setDefaultTimeout(timeout);
      
      await page.goto(url, { waitUntil: 'networkidle' });

      if (waitFor > 0) {
        await page.waitForTimeout(waitFor);
      }

      const filename = `pdf_${uuidv4()}.pdf`;
      const filePath = path.join(process.cwd(), 'uploads', filename);

      await page.pdf({
        path: filePath,
        format,
        landscape,
        printBackground,
        margin,
        scale: parseFloat(scale)
      });

      const stats = await fs.stat(filePath);

      return {
        filename,
        filePath: `/uploads/${filename}`,
        size: stats.size,
        format: 'pdf',
        options: { format, landscape, printBackground, margin }
      };

    } finally {
      await context.close();
    }
  }

  async autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  getDeviceConfig(deviceName) {
    const devices = {
      'iPhone 12': { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 },
      'iPad Pro': { viewport: { width: 1024, height: 1366 }, deviceScaleFactor: 2 },
      'Pixel 5': { viewport: { width: 393, height: 851 }, deviceScaleFactor: 2.75 },
      'Desktop HD': { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 },
      'Desktop 4K': { viewport: { width: 3840, height: 2160 }, deviceScaleFactor: 2 }
    };
    return devices[deviceName] || devices['Desktop HD'];
  }

  async cleanup() {
    for (const [browserName, browser] of this.browserCache) {
      await browser.close();
    }
    this.browserCache.clear();
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (global.screenshotService) {
    await global.screenshotService.cleanup();
  }
});

export default ScreenshotService;