import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { body, validationResult } from "express-validator";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const currentYear = new Date().getFullYear();

app.set("view engine", "ejs");
app.set("views", "./views");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
});

const formLimiter = rateLimit({
  windowMs: process.env.FORM_LIMIT_WINDOW || 60 * 60 * 1000,
  max: process.env.FORM_LIMIT_MAX || 5,
});

const validateForm = [
  body("name").trim().notEmpty().escape().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("phone").trim().notEmpty().escape().withMessage("Phone is required"),
  body("company").trim().escape(),
  body("message").trim().notEmpty().escape().withMessage("Message is required"),
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(limiter);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(
  express.static("public", {
    setHeaders: (res, path) => {
      res.set("X-Content-Type-Options", "nosniff");
    },
  })
);

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "cdn.jsdelivr.net",
        "unpkg.com",
        "'unsafe-inline'",
        "'unsafe-eval'",
      ],
      styleSrc: [
        "'self'",
        "cdn.jsdelivr.net",
        "'unsafe-inline'",
        "fonts.googleapis.com",
      ],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        "https://*.spline.design",
        "https://fonts.gstatic.com",
        "https://*.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https:",
        "cdn.jsdelivr.net",
        "fonts.gstatic.com",
        "fonts.googleapis.com",
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.google.com", "https://*.google.com"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
    },
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

const ERROR_COOLDOWN = 15 * 60 * 1000; //15 min cd
let lastErrorEmailTime = null;
let lastErrorType = null;

const sendErrorAlert = async (err, req) => {
  const currentTime = Date.now();
  const errorType = err.message + req.originalUrl;

  if (
    lastErrorEmailTime &&
    lastErrorType === errorType &&
    currentTime - lastErrorEmailTime < ERROR_COOLDOWN
  ) {
    console.log("Skipping error email - within cooldown period");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const errorAlertOptions = {
    from: process.env.EMAIL_USER,
    to: "office@elevatewebdynamics.com",
    subject: `⚠️ Website Error Alert - ${err.message}`,
    text: `
Error Details:
-------------
Time: ${new Date().toISOString()}
Error: ${err.message}
URL: ${req.originalUrl}
Method: ${req.method}
IP: ${req.ip}
User Agent: ${req.get("User-Agent")}

Stack Trace:
-----------
${err.stack}
    `,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">Website Error Alert</h2>
        
        <div style="margin: 20px 0; background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
          <h3 style="color: #333; margin-top: 0;">Error Details:</h3>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p style="margin: 5px 0;"><strong>Error:</strong> ${err.message}</p>
          <p style="margin: 5px 0;"><strong>URL:</strong> ${req.originalUrl}</p>
          <p style="margin: 5px 0;"><strong>Method:</strong> ${req.method}</p>
          <p style="margin: 5px 0;"><strong>IP:</strong> ${req.ip}</p>
          <p style="margin: 5px 0;"><strong>User Agent:</strong> ${req.get(
            "User-Agent"
          )}</p>
        </div>

        <div style="margin-top: 20px;">
          <h3 style="color: #333;">Stack Trace:</h3>
          <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap;">${
            err.stack
          }</pre>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(errorAlertOptions);
    console.log("Error notification email sent");

    lastErrorEmailTime = currentTime;
    lastErrorType = errorType;
  } catch (emailError) {
    console.error("Failed to send error notification email:", emailError);
  }
};

//Routes
app.get("/", async (req, res, next) => {
  try {
    res.render("index.ejs", {
      currentYear
    });
  } catch (err) {
    next(err);
  }
});

app.get("/services", async (req, res, next) => {
  try {
    res.render("services.ejs", {
      currentYear,
    });
  } catch (err) {
    next(err);
  }
});

app.get("/about_us", async (req, res, next) => {
  try {
    res.render("about_us.ejs", {
      currentYear,
    });
  } catch (err) {
    next(err);
  }
});

app.get("/portfolio", async (req, res, next) => {
  try {
    res.render("portfolio.ejs", {
      currentYear
    });
  } catch (err) {
    next(err);
  }
});

app.get("/contact", async (req, res, next) => {
  try {
    res.render("contact.ejs", {
      currentYear,
    });
  } catch (err) {
    next(err);
  }
});

// Form submission route
app.post(
  "/submit",
  formLimiter,
  validateForm,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("contact.ejs", {
        currentYear,
        showMessage: true,
        messageType: "error",
        messageText: "Invalid form data. Please check your inputs."
      });
    }

    const { name, email, phone, company, message } = req.body;

    const dbQuery = {
      text: "INSERT INTO form_clients (name, email, phone, company, message) VALUES ($1, $2, $3, $4, $5)",
      values: [name, email, phone, company || null, message],
    };

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: "office@elevatewebdynamics.com",
      subject: `New Form Submission From ${name} - ${company || "N/A"}`,
      text: `New message from ${name}:
    
    Name: ${name}
    Email: ${email}
    Phone: ${phone}
    Company: ${company || "N/A"}
    Message: ${message}`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">New Contact Form Submission</h2>
        
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong style="color: #0066cc;">Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong style="color: #0066cc;">Email:</strong> <a href="mailto:${email}" style="color: #666; text-decoration: none;">${email}</a></p>
          <p style="margin: 10px 0;"><strong style="color: #0066cc;">Phone:</strong> ${phone}</p>
          <p style="margin: 10px 0;"><strong style="color: #0066cc;">Company:</strong> ${
            company || "N/A"
          }</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <strong style="color: #0066cc;">Message:</strong>
          <p style="color: #333; margin: 10px 0; line-height: 1.5;">${message}</p>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>This message was sent from your website contact form.</p>
          <p>Date: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
    };

    try {
      await pool.query(dbQuery);
      await transporter.sendMail(mailOptions);

      res.render("contact.ejs", {
        currentYear,
        showMessage: true,
        messageType: "success",
        messageText: "Form submitted successfully!",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Error Handlers
app.use((req, res, next) => {
  const err = new Error("Page Not Found");
  err.status = 404;
  next(err);
});

app.use(async (err, req, res, next) => {
  await sendErrorAlert(err, req);
  
  res.status(err.status || 500).render("error.ejs", {
    currentYear,
    error: process.env.NODE_ENV === "production" ? "An error occurred" : err.message
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on LAN at http://192.168.0.73:${port}`);
  console.log(`Server running public at http://188.241.10.200:${port}`);
});

export default app;