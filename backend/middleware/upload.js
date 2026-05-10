import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve absolute paths (because we use ES modules, not CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder where uploaded plans will live: backend/uploads/plans/
const uploadFolder = path.join(__dirname, "..", "uploads", "plans");

// Make sure the folder exists at startup. Recursive: true creates parents too.
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Disk storage. Filename pattern: plan-<timestamp>-<random>.<ext>
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `plan-${unique}${ext}`);
  },
});

// Reject anything that isn't an image or PDF.
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and PDF files are allowed"), false);
  }
};

// Final Multer instance — 10 MB max file size.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
