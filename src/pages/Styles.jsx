import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";

export default function Styles() {
  return (
    <>
      <PageHeader title="Estilos" />
      <EmptyState icon={PaletteOutlinedIcon} title="Próximamente" description="La biblioteca de estilos y plantillas va a estar disponible pronto." />
    </>
  );
}
