import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import ImagePage from "@/pages/image";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<ImagePage />} path="/image" />
    </Routes>
  );
}

export default App;
