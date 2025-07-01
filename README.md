# 🚀 Xeyyzu APIs - Public Development

**XeyyzuV2 APIs** is a lightweight, modular, and highly customizable REST API foundation built with Express.js.  
Designed for rapid development, this project provides a clean and scalable starting point for building your own API services with minimal setup and maximum flexibility.

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/status-⁉️-blue)

---

## ✨ Features

- ⚡ **Simple & Lightweight** – Minimal dependencies and readable codebase  
- 🔍 **Auto-Discovery** – Automatic endpoint registration from `api` folder  
- 🔄 **Hot Reload** – Dynamic module loading for live development  
- 📁 **Structured Organization** – Category-based routing for better maintainability  
- 🕸️ **Scraper Integration** – Built-in scraping utilities, hot-reloadable  
- 🌐 **Network Ready** – Detects network interfaces for easier local/LAN testing  

---

## 📦 Requirements

- **Node.js** v18 or higher  
- **NPM** or **Yarn**

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Xeyyzuv2/api.git
cd api
```
# 2. Install dependencies
```
npm install
```
# 3. Modify settings.js:
```
module.exports = {
    name: {
        main: 'XeyyzuV2 APIs !!',
        copyright: 'XeyyzuV2'
    },
    description: 'Integrated API solution for your modern application development needs. Fast, secure, and reliable access.',
    icon: '/image/icon.png',
    author: 'Xeyyzu',
    info_url: 'https://whatsapp.com/channel/xxxxxxx',
    links: [
        {
            name: 'WhatsApp Information Ch.',
            url: 'https://whatsapp.com/channel/xxxxx'
        }
    ]
};
```
# 4. Start the server
```
npm start
```
🔗 Visit: http://localhost:4000
---


▲ Deploy to Vercel
You can easily deploy to Vercel in just a few clicks:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Xeyyzuv2%2api)




---

🛠 Creating Endpoints

To create a new endpoint, just add a JavaScript file into the api/ directory.

Example:
```
module.exports = {
    name: "Hello World",
    desc: "Returns a friendly greeting",
    category: "Greetings",
    params: ["name"],
    async run(req, res) {
        const name = req.query.name || "World";
        res.json({
            status: true,
            message: `Hello, ${name}!`
        });
    }
};
```
This creates a new route at:
```
GET /greetings/hello-world
```

---

# ⚙️ Key Features Explained
```
🔧 Automatic Endpoint Registration

Auto-discovers .js files in /api and subfolders

Registers routes based on module.exports metadata

Groups endpoints by category

Displays route and parameter info in the docs UI
```

```
🔍 Scraper Integration

Files inside /lib/scrape_file are loaded automatically

Supports hot-reload every 2 seconds

Provides a global scraper object accessible to endpoints
```

---

# 📄 License

Licensed under the MIT License.
Feel free to modify, share, and enhance this project as needed.


---
*👤 Author: Rynn*

*redeveloped by : Xeyyzu*

---

💡 Stay Connected

📢 Join WhatsApp Channel for updates, changelogs, and sneak peeks.
Have an idea? Feedback? Let’s build this together!ents!
