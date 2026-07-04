const { Builder } = require("selenium-webdriver");

async function test() {
    const driver = await new Builder()
    .forBrowser("chrome")
    .build();
    try {
        await driver.get("http://localhost:3000");
        console.log(await driver.getTitle());
    } finally {
        await driver.quit();
    }
}
test();