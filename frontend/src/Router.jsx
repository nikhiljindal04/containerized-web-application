import React from "react";
import { Route, Routes } from "react-router-dom";
import Createproject from "./pages/Createproject";
import ProjectPlayground from "./pages/ProjectPlayground";
import PingComponent from "./components/atoms/PingComponent";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<PingComponent />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/login" element={<Signin />} />
      <Route path="/project" element={<Createproject />} />
      <Route path="/project/:projectId" element={<ProjectPlayground />} />
    </Routes>
  );
}
