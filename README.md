# HouseRentApp — Setup Guide

Follow these steps to set up and run the project on your local machine.

---

## Backend Setup

### Step 1 — Clone the Repository

```bash
git clone <your-github-repo-link-here>
cd <your-project-folder>
```

### Step 2 — Install Server Dependencies

```bash
cd server
npm install
```

### Step 3 — Create the `.env` File

Copy the example environment file and rename it:

```bash
cp .env.example .env
```

Then open `.env` and fill in each value. Follow the sections below for guidance on each one.

---

### Step 4 — Set Your MongoDB URI

In your `.env`, set `MONGO_URI` to your MongoDB Atlas connection string. Either the `mongodb+srv://` (SRV) format or the standard connection string works:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

> **Important:** Before running the server, go to your MongoDB Atlas dashboard → **Network Access** and update the IP allowlist. During development you can set it to `0.0.0.0/0` to allow all IPs, but restrict this before going to production.

---

### Step 5 — Set the Port (Optional)

You can set a custom port, or leave it out to use the default (`8001`):

```env
PORT=8001
```

---

### Step 6 — Set Your JWT Secret Key

Add a unique secret string for signing JWT tokens:

```env
JWT_KEY=your_super_secret_key_here
```

This can be any long random string. Keep it private and never commit it.

---

### Step 7 — Set Admin Credentials

These are the credentials for the built-in Admin account. The admin is not registered through the app — it is loaded directly from your `.env`:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=yourAdminPassword
```

---

### Step 8 — Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account.
2. From your Cloudinary dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Add them to your `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### Step 9 — Start the Server

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:8001`.

---

## Frontend Setup

### Step 10 — Install Client Dependencies

In a new terminal, from the project root:

```bash
cd client
npm install
```

### Step 11 — Set Up EmailJS

EmailJS is used by renters to contact property owners directly from the app. Follow these steps:

1. Go to [emailjs.com](https://www.emailjs.com) and create a free account.
2. Add an **Email Service** (e.g. Gmail) and note your **Service ID**.
3. Create an **Email Template** and note your **Template ID**.
4. From the EmailJS dashboard, copy your **Public Key**.
5. Open `client/.env` (or `client/.env.local`) and fill in:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

### Step 12 — Configure the EmailJS Email Template

In your EmailJS dashboard, open the template you created and configure it as follows:

**Subject:**
```
Inquiry about {{property_title}}
```

**To Email:**
```
{{to_email}}
```

**Content** — click **Edit Content**, switch to **Code Editor**, and paste in the following HTML:

```html
<div style="font-family: system-ui, sans-serif, Arial; font-size: 12px">
  <div>A message regarding <strong>{{property_title}}</strong> has been received from {{from_name}}. Kindly respond at your earliest convenience.</div>
  <div
    style="
      margin-top: 20px;
      padding: 15px 0;
      border-width: 1px 0;
      border-style: dashed;
      border-color: lightgrey;
    "
  >
    <table role="presentation">
      <tr>
        <td style="vertical-align: top">
          <div
            style="
              padding: 6px 10px;
              margin: 0 10px;
              background-color: aliceblue;
              border-radius: 5px;
              font-size: 26px;
            "
            role="img"
          >
            👤
          </div>
        </td>
        <td style="vertical-align: top">
          <div style="color: #2c3e50; font-size: 16px">
            <strong>{{from_name}}</strong>
          </div>
          <div style="color: #cccccc; font-size: 13px">{{from_email}}</div>
          <p style="font-size: 16px">{{message}}</p>
        </td>
      </tr>
    </table>
  </div>
</div>
```

Click **Save** when done.

---

### Step 13 — Start the Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---
