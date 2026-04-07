import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Checkout } from "./components/Checkout";
import { Admin } from "./components/Admin";
import { Orders } from "./components/Orders";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "checkout", Component: Checkout },
      { path: "admin", Component: Admin },
      { path: "orders", Component: Orders },
    ],
  },
]);
