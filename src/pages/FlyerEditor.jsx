import { Box } from "@mui/material";
import ProductsSidebar from "../components/editor/ProductsSidebar";
import CanvasPreview from "../components/editor/CanvasPreview";
import PropertiesPanel from "../components/editor/PropertiesPanel";

export default function EditarFolletos() {
  return (
    <Box display="flex" height="100vh">
      <ProductsSidebar />
      <CanvasPreview />
      <PropertiesPanel />
    </Box>
  );
}
