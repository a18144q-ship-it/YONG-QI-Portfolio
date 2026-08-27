import { createRoot } from "react-dom/client";
import Portfolio from "../app/page";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) throw new Error("Static portfolio root element is missing.");

createRoot(root).render(<Portfolio />);
